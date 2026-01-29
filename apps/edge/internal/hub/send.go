package hub

import (
	"context"
	"time"

	"github.com/coder/websocket/wsjson"
)

func (c *Conn) SendJSON(v any) error {
	c.SendMu.Lock()
	defer c.SendMu.Unlock()

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	return wsjson.Write(ctx, c.WS, v)
}
