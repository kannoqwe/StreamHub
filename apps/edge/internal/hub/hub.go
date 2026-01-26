package hub

import "sync"

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
