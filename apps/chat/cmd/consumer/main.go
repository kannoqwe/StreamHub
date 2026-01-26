package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/nats-io/nats.go"
)

const (
	natsURL = "nats://localhost:4222"

	streamName    = "CHAT_INGEST"
	subjectIngest = "chat.ingest"

	consumerName = "CHAT_PROCESSOR_V1"
)

func main() {
	logger := log.New(os.Stdout, "[consumer] ", log.LstdFlags|log.Lmicroseconds)

	nc, err := nats.Connect(natsURL,
		nats.Name("chat-consumer"),
		nats.Timeout(5*time.Second),
		nats.ReconnectWait(500*time.Millisecond),
		nats.MaxReconnects(-1),
	)
	if err != nil {
		logger.Fatalf("connect: %v", err)
	}
	defer nc.Close()

	js, err := nc.JetStream()
	if err != nil {
		logger.Fatalf("jetstream: %v", err)
	}

	if err := ensureStream(js); err != nil {
		logger.Fatalf("ensure stream: %v", err)
	}

	if err := ensureConsumer(js); err != nil {
		logger.Fatalf("ensure consumer: %v", err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	sub, err := js.PullSubscribe(subjectIngest, consumerName, nats.Bind(streamName, consumerName))
	if err != nil {
		logger.Fatalf("pull subscribe: %v", err)
	}

	logger.Printf("listening: stream=%s subject=%s durable=%s", streamName, subjectIngest, consumerName)

	for {
		select {
		case <-ctx.Done():
			logger.Println("shutdown requested")
			return
		default:
		}

		msgs, err := sub.Fetch(10, nats.MaxWait(1*time.Second))
		if err != nil {
			if errors.Is(err, nats.ErrTimeout) {
				continue
			}
			logger.Printf("fetch error: %v", err)
			time.Sleep(300 * time.Millisecond)
			continue
		}

		for _, msg := range msgs {
			logger.Printf("got msg: subject=%s len=%d data=%s", msg.Subject, len(msg.Data), string(msg.Data))

			if err := msg.Ack(); err != nil {
				logger.Printf("ack error: %v", err)
			}
		}
	}
}

func ensureStream(js nats.JetStreamContext) error {
	_, err := js.StreamInfo(streamName)
	if err == nil {
		return nil
	}
	if !errors.Is(err, nats.ErrStreamNotFound) {
		return fmt.Errorf("stream info: %w", err)
	}

	_, err = js.AddStream(&nats.StreamConfig{
		Name:      streamName,
		Subjects:  []string{subjectIngest},
		Storage:   nats.FileStorage,
		Retention: nats.LimitsPolicy,
		MaxAge:    7 * 24 * time.Hour,
		Replicas:  1,
	})
	if err != nil {
		return fmt.Errorf("add stream: %w", err)
	}
	return nil
}

func ensureConsumer(js nats.JetStreamContext) error {
	_, err := js.ConsumerInfo(streamName, consumerName)
	if err == nil {
		return nil
	}
	if !errors.Is(err, nats.ErrConsumerNotFound) {
		return fmt.Errorf("consumer info: %w", err)
	}

	// AckExplicitPolicy
	_, err = js.AddConsumer(streamName, &nats.ConsumerConfig{
		Durable:       consumerName,
		AckPolicy:     nats.AckExplicitPolicy,
		AckWait:       10 * time.Second,
		MaxAckPending: 10_000,

		DeliverPolicy: nats.DeliverAllPolicy,
	})
	if err != nil {
		return fmt.Errorf("add consumer: %w", err)
	}
	return nil
}
