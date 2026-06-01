package app

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os/signal"
	"syscall"
	"time"

	"edge/internal/auth"
	"edge/internal/bus"
	"edge/internal/config"
	"edge/internal/hub"
	"edge/internal/ws"

	"github.com/bwmarrin/snowflake"
)

type Server struct {
	log     *log.Logger
	cfg     config.Config
	http    *http.Server
	ncClose func()
	unsub   func()
}

func NewServer(cfg config.Config, logger *log.Logger) (*Server, error) {
	sf, err := snowflake.NewNode(cfg.EdgeNodeID)
	if err != nil {
		return nil, err
	}

	nc, js, err := bus.Connect(cfg.NATSURL)
	if err != nil {
		return nil, err
	}

	var verifier auth.Verifier
	switch cfg.AuthMode {
	case "http":
		verifier = auth.NewHTTPVerifier(cfg.AuthVerifyURL, cfg.AuthTimeout)
	default:
		verifier = auth.StubVerifier{}
	}

	h := hub.New()

	bsub := bus.NewBroadcastSubscriber(logger, nc, h, "chat.broadcast")
	sub, err := bsub.Start()
	if err != nil {
		nc.Close()
		return nil, err
	}

	pub := bus.NewPublisher(js, "chat.ingest")
	handler := ws.NewHandler(logger, verifier, h, pub, sf, cfg.AllowedOrigins)

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", handler.ServeWS)
	mux.HandleFunc("/health", handleHealth)
	mux.HandleFunc("/ready", handleReady)

	httpServer := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	return &Server{
		log:     logger,
		cfg:     cfg,
		http:    httpServer,
		ncClose: nc.Close,
		unsub: func() {
			if sub != nil {
				_ = sub.Unsubscribe()
			}
		},
	}, nil
}

func (s *Server) Run() error {
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	cleanup := func() {
		if s.unsub != nil {
			s.unsub()
		}
		if s.ncClose != nil {
			s.ncClose()
		}
	}

	errCh := make(chan error, 1)

	go func() {
		s.log.Printf("http listening on %s (node_id=%d auth_mode=%s)", s.cfg.HTTPAddr, s.cfg.EdgeNodeID, s.cfg.AuthMode)
		if err := s.http.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
	}()

	select {
	case <-ctx.Done():
		s.log.Println("shutdown requested")
	case err := <-errCh:
		cleanup()
		return err
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_ = s.http.Shutdown(shutdownCtx)
	cleanup()
	s.log.Println("bye")
	return nil
}
