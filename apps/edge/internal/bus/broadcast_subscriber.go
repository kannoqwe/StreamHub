package bus

import (
	"encoding/json"
	"fmt"
	"log"

	"edge/internal/hub"
	"edge/internal/model"

	"github.com/coder/websocket"
	"github.com/nats-io/nats.go"
)

type BroadcastSubscriber struct {
	log    *log.Logger
	nc     *nats.Conn
	hub    *hub.Hub
	prefix string // "chat.broadcast"
}

func NewBroadcastSubscriber(logger *log.Logger, nc *nats.Conn, h *hub.Hub, prefix string) *BroadcastSubscriber {
	return &BroadcastSubscriber{log: logger, nc: nc, hub: h, prefix: prefix}
}

func (s *BroadcastSubscriber) Start() (*nats.Subscription, error) {
	subject := fmt.Sprintf("%s.*", s.prefix)

	sub, err := s.nc.Subscribe(subject, func(msg *nats.Msg) {
		var ev model.IngestEvent
		if err := json.Unmarshal(msg.Data, &ev); err != nil {
			s.log.Printf("broadcast: invalid json: %v", err)
			return
		}
		if ev.StreamerID <= 0 {
			return
		}

		conns := s.hub.List(ev.StreamerID)

		for _, c := range conns {
			if err := c.SendJSON(ev); err != nil {
				s.hub.Drop(c, websocket.StatusGoingAway, "write failed")
				s.log.Printf(
					"broadcast: drop conn_id=%d streamer_id=%d err=%v",
					c.ID, ev.StreamerID, err,
				)
			}
		}

	})
	if err != nil {
		return nil, err
	}

	s.log.Printf("subscribed to %s", subject)
	return sub, nil
}
