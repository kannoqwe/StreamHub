package hub

import (
	"sync"
	"time"

	"github.com/coder/websocket"
)

type Conn struct {
	ID         int64
	WS         *websocket.Conn
	UserID     int64
	Username   string
	StreamerID int64

	SendMu sync.Mutex

	RateTokens float64
	RateLast   time.Time
}
