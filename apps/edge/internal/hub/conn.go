package hub

import (
	"sync"

	"github.com/coder/websocket"
)

type Conn struct {
	ID         int64
	WS         *websocket.Conn
	UserID     int64
	Username   string
	StreamerID int64

	SendMu sync.Mutex
}
