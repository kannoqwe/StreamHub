package model

type IngestEvent struct {
	MessageID  string `json:"message_id"`
	StreamerID int64  `json:"streamer_id"`
	UserID     int64  `json:"user_id"`
	Username   string `json:"username"`
	Content    string `json:"content"`
	Timestamp  string `json:"timestamp"` // RFC3339Nano
}
