package config

import (
	"log"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	HTTPAddr string

	NATSURL string

	EdgeNodeID int64

	AuthMode      string
	AuthVerifyURL string
	AuthTimeout   time.Duration

	AllowedOrigins []string
}

func MustLoad() Config {
	cfg := Config{
		HTTPAddr: ":8080",
		NATSURL:  "nats://localhost:4222",

		EdgeNodeID: 1,

		AuthMode:      "stub",
		AuthVerifyURL: "",
		AuthTimeout:   2 * time.Second,

		AllowedOrigins: []string{
			"http://localhost:5173",
			"http://127.0.0.1:5173",
		},
	}

	if v := os.Getenv("HTTP_ADDR"); v != "" {
		cfg.HTTPAddr = v
	}
	if v := os.Getenv("NATS_URL"); v != "" {
		cfg.NATSURL = v
	}
	if v := os.Getenv("EDGE_NODE_ID"); v != "" {
		id, err := strconv.ParseInt(v, 10, 64)
		if err != nil {
			log.Fatalf("EDGE_NODE_ID invalid: %v", err)
		}
		cfg.EdgeNodeID = id
	}
	if v := os.Getenv("AUTH_MODE"); v != "" {
		cfg.AuthMode = v
	}
	if v := os.Getenv("AUTH_VERIFY_URL"); v != "" {
		cfg.AuthVerifyURL = v
	}
	if v := os.Getenv("AUTH_TIMEOUT_MS"); v != "" {
		ms, err := strconv.Atoi(v)
		if err != nil {
			log.Fatalf("AUTH_TIMEOUT_MS invalid: %v", err)
		}
		cfg.AuthTimeout = time.Duration(ms) * time.Millisecond
	}
	if v := os.Getenv("EDGE_ALLOWED_ORIGINS"); v != "" {
		cfg.AllowedOrigins = nil
		for _, part := range strings.Split(v, ",") {
			origin := strings.TrimSpace(part)
			if origin != "" {
				cfg.AllowedOrigins = append(cfg.AllowedOrigins, origin)
			}
		}
	}

	return cfg
}
