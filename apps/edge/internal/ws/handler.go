package ws

import (
	"context"
	"errors"
	"log"
	"net/http"
	"time"

	"edge/internal/auth"
	"edge/internal/bus"
	"edge/internal/hub"
	"edge/internal/model"

	"github.com/bwmarrin/snowflake"
	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
)

type Handler struct {
	log       *log.Logger
	verifier  auth.Verifier
	hub       *hub.Hub
	publisher *bus.Publisher
	sf        *snowflake.Node
}

func NewHandler(logger *log.Logger, verifier auth.Verifier, h *hub.Hub, pub *bus.Publisher, sf *snowflake.Node) *Handler {
	return &Handler{
		log:       logger,
		verifier:  verifier,
		hub:       h,
		publisher: pub,
		sf:        sf,
	}
}

func (h *Handler) ServeWS(w http.ResponseWriter, r *http.Request) {
	token := BearerToken(r.Header.Get("Authorization"))
	if token == "" {
		http.Error(w, "missing bearer token", http.StatusUnauthorized)
		return
	}

	authCtx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	ar, err := h.verifier.Verify(authCtx, token)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	wsConn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: true,
	})
	if err != nil {
		h.log.Printf("ws accept: %v", err)
		return
	}
	defer wsConn.Close(websocket.StatusInternalError, "server error")
	wsConn.SetReadLimit(8 * 1024)

	c := &hub.Conn{
		ID:       h.sf.Generate().Int64(),
		WS:       wsConn,
		UserID:   ar.UserID,
		Username: ar.Username,
	}

	h.log.Printf("connected user_id=%d username=%s conn_id=%d from=%s",
		c.UserID, c.Username, c.ID, ClientIP(r))

	var join model.ClientPacket
	if err := wsjson.Read(r.Context(), wsConn, &join); err != nil {
		_ = wsConn.Close(websocket.StatusPolicyViolation, "expected join")
		return
	}
	if join.Type != "join" || join.StreamerID <= 0 {
		_ = wsConn.Close(websocket.StatusPolicyViolation, "invalid join")
		return
	}

	c.StreamerID = join.StreamerID
	h.hub.Add(c)
	defer h.hub.Remove(c)

	_ = h.safeSend(r.Context(), c, model.ServerPacket{
		"type":        "joined",
		"streamer_id": c.StreamerID,
		"user_id":     c.UserID,
		"username":    c.Username,
	})

	for {
		var pkt model.ClientPacket
		if err := wsjson.Read(r.Context(), wsConn, &pkt); err != nil {
			return
		}

		if pkt.Type != "chat" {
			_ = h.safeSend(r.Context(), c, model.ServerPacket{
				"type":  "error",
				"error": "unknown packet type",
			})
			continue
		}

		content := NormalizeContent(pkt.Content)
		if content == "" {
			continue
		}

		msgID := h.sf.Generate()
		ev := model.IngestEvent{
			MessageID:  msgID.String(),
			StreamerID: c.StreamerID,
			UserID:     c.UserID,
			Username:   c.Username,
			Content:    content,
			Timestamp:  time.Now().UTC().Format(time.RFC3339Nano),
		}

		pubCtx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		err := h.publisher.PublishIngest(pubCtx, ev)
		cancel()

		if err != nil {
			h.log.Printf("publish ingest: %v", err)
			_ = h.safeSend(r.Context(), c, model.ServerPacket{"type": "error", "error": "publish failed"})
			continue
		}

		_ = h.safeSend(r.Context(), c, model.ServerPacket{"type": "ack", "message_id": ev.MessageID})
	}
}

func (h *Handler) safeSend(ctx context.Context, c *hub.Conn, v any) error {
	c.SendMu.Lock()
	defer c.SendMu.Unlock()

	writeCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	if err := wsjson.Write(writeCtx, c.WS, v); err != nil {
		if errors.Is(err, context.Canceled) {
			return err
		}
	}
	return nil
}
