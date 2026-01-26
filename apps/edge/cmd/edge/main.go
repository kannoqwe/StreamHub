package main

import (
	"log"
	"os"

	"edge/internal/app"
	"edge/internal/config"
)

func main() {
	cfg := config.MustLoad()

	logger := log.New(os.Stdout, "[edge] ", log.LstdFlags|log.Lmicroseconds)

	srv, err := app.NewServer(cfg, logger)
	if err != nil {
		logger.Fatalf("init server: %v", err)
	}

	if err := srv.Run(); err != nil {
		logger.Fatalf("run: %v", err)
	}
}
