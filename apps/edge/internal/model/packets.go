package model

type ClientPacket struct {
	Type       string `json:"type"` // "join" | "chat"
	StreamerID int64  `json:"streamer_id,omitempty"`
	Content    string `json:"content,omitempty"`
}

type ServerPacket map[string]any
