package hub

import (
	"sync"

	"github.com/coder/websocket"
)

type Hub struct {
	mu    sync.RWMutex
	conns map[int64]map[int64]*Conn // streamer_id -> conn_id -> conn
}

func New() *Hub {
	return &Hub{conns: make(map[int64]map[int64]*Conn)}
}

func (h *Hub) Add(c *Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	m, ok := h.conns[c.StreamerID]
	if !ok {
		m = make(map[int64]*Conn)
		h.conns[c.StreamerID] = m
	}
	m[c.ID] = c
}

func (h *Hub) Remove(c *Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	m, ok := h.conns[c.StreamerID]
	if !ok {
		return
	}
	delete(m, c.ID)
	if len(m) == 0 {
		delete(h.conns, c.StreamerID)
	}
}

func (h *Hub) List(streamerID int64) []*Conn {
	h.mu.RLock()
	defer h.mu.RUnlock()

	m, ok := h.conns[streamerID]
	if !ok || len(m) == 0 {
		return nil
	}

	out := make([]*Conn, 0, len(m))
	for _, c := range m {
		out = append(out, c)
	}
	return out
}

func (h *Hub) Drop(c *Conn, status websocket.StatusCode, reason string) {
	_ = c.WS.Close(status, reason)
	h.Remove(c)
}
