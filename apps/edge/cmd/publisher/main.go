package main

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"time"

	"github.com/nats-io/nats.go"
)

const (
	natsURL = "nats://localhost:4222"

	streamName    = "CHAT_INGEST"
	subjectIngest = "chat.ingest"
)

type IngestEvent struct {
	MessageID  int64  `json:"message_id"`
	StreamerID int64  `json:"streamer_id"`
	UserID     int64  `json:"user_id"`
	Username   string `json:"username"`
	Content    string `json:"content"`
	Timestamp  string `json:"timestamp"`
}

func main() {
	logger := log.New(os.Stdout, "[publisher] ", log.LstdFlags|log.Lmicroseconds)

	nc, err := nats.Connect(natsURL,
		nats.Name("chat-publisher"),
		nats.Timeout(5*time.Second),
	)
	if err != nil {
		logger.Fatalf("connect: %v", err)
	}
	defer nc.Close()

	js, err := nc.JetStream()
	if err != nil {
		logger.Fatalf("jetstream: %v", err)
	}

	for i := 1; i <= 5; i++ {
		ev := IngestEvent{
			MessageID:  int64(i),
			StreamerID: 42,
			UserID:     777,
			Username:   "kanno",
			Content:    "qwe " + time.Now().Format("15:04:05"),
			Timestamp:  time.Now().UTC().Format(time.RFC3339Nano),
		}

		data, err := json.Marshal(ev)
		if err != nil {
			logger.Fatalf("marshal: %v", err)
		}

		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		_, err = js.PublishMsg(&nats.Msg{
			Subject: subjectIngest,
			Data:    data,
		}, nats.Context(ctx))
		cancel()

		if err != nil {
			logger.Fatalf("publish: %v", err)
		}

		logger.Printf("published: %s", string(data))
		time.Sleep(300 * time.Millisecond)
	}

	logger.Println("done")
}
