package hub

import (
	"context"
	"errors"
	"time"

	"github.com/coder/websocket/wsjson"
)

func (c *Conn) SendJSON(v any) error {
	if ok := c.Enqueue(v); !ok {
		return errors.New("send queue full")
	}
	return nil
}

func (c *Conn) Enqueue(v any) bool {
	defer func() {
		if recover() != nil {
			// send on closed channel
		}
	}()
	select {
	case c.SendCh <- v:
		return true
	default:
		return false
	}
}

func (c *Conn) CloseSend() {
	c.closeOnce.Do(func() {
		if c.SendCh != nil {
			close(c.SendCh)
		}
	})
}

func (c *Conn) StartWriter(onError func(error)) {
	go func() {
		if c.SendCh == nil {
			return
		}
		for v := range c.SendCh {
			ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
			err := wsjson.Write(ctx, c.WS, v)
			cancel()
			if err != nil {
				onError(err)
				return
			}
		}
	}()
}
