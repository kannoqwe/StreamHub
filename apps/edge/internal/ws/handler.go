package ws

import (
	"context"
	"errors"
	"log"
	"math"
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
	origins   []string
}

func NewHandler(logger *log.Logger, verifier auth.Verifier, h *hub.Hub, pub *bus.Publisher, sf *snowflake.Node, origins []string) *Handler {
	return &Handler{
		log:       logger,
		verifier:  verifier,
		hub:       h,
		publisher: pub,
		sf:        sf,
		origins:   origins,
	}
}

func (h *Handler) ServeWS(w http.ResponseWriter, r *http.Request) {
	h.log.Printf("ws incoming from=%s", ClientIP(r))
	token := BearerToken(r.Header.Get("Authorization"))
	if token == "" {
		token = r.URL.Query().Get("token")
	}
	if token == "" {
		h.log.Printf("ws auth missing token from=%s", ClientIP(r))
		http.Error(w, "missing bearer token", http.StatusUnauthorized)
		return
	}

	authCtx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	ar, err := h.verifier.Verify(authCtx, token)
	if err != nil {
		h.log.Printf("ws auth failed from=%s err=%v", ClientIP(r), err)
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	wsConn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		OriginPatterns: h.origins,
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
		SendCh:   make(chan any, 64),
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
	h.log.Printf("ws join streamer_id=%d user_id=%d", join.StreamerID, ar.UserID)

	c.StreamerID = join.StreamerID
	h.hub.Add(c)
	defer func() {
		c.CloseSend()
		h.hub.Remove(c)
	}()

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
		if !h.allowMessage(c) {
			_ = h.safeSend(r.Context(), c, model.ServerPacket{
				"type":  "error",
				"error": "rate_limited",
			})
			continue
		}
		h.log.Printf("ws chat user_id=%d streamer_id=%d content_len=%d", c.UserID, c.StreamerID, len(content))

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
	if err := c.SendJSON(v); err != nil {
		if errors.Is(err, context.Canceled) {
			return err
		}
		return err
	}
	return nil
}

func (h *Handler) allowMessage(c *hub.Conn) bool {
	const ratePerSec = 5.0
	const burst = 10.0

	now := time.Now()
	if c.RateLast.IsZero() {
		c.RateLast = now
		c.RateTokens = burst
	}

	elapsed := now.Sub(c.RateLast).Seconds()
	if elapsed > 0 {
		c.RateTokens = math.Min(burst, c.RateTokens+elapsed*ratePerSec)
		c.RateLast = now
	}

	if c.RateTokens < 1 {
		return false
	}
	c.RateTokens -= 1
	return true
}
