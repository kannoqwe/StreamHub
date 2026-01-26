package bus

import (
	"context"
	"encoding/json"
	"fmt"

	"edge/internal/model"

	"github.com/nats-io/nats.go"
)

type Publisher struct {
	js      nats.JetStreamContext
	subject string
}

func NewPublisher(js nats.JetStreamContext, subject string) *Publisher {
	return &Publisher{js: js, subject: subject}
}

func (p *Publisher) PublishIngest(ctx context.Context, ev model.IngestEvent) error {
	data, err := json.Marshal(ev)
	if err != nil {
		return fmt.Errorf("marshal ingest: %w", err)
	}

	_, err = p.js.PublishMsg(&nats.Msg{
		Subject: p.subject,
		Data:    data,
	}, nats.Context(ctx))
	if err != nil {
		return fmt.Errorf("publish: %w", err)
	}

	return nil
}
