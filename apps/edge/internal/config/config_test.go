package config

import "testing"

func TestMustLoadParsesAllowedOrigins(t *testing.T) {
	t.Setenv("EDGE_ALLOWED_ORIGINS", "http://localhost:5173, http://127.0.0.1:5173,,")

	cfg := MustLoad()

	if len(cfg.AllowedOrigins) != 2 {
		t.Fatalf("expected 2 origins, got %d", len(cfg.AllowedOrigins))
	}
	if cfg.AllowedOrigins[0] != "http://localhost:5173" {
		t.Fatalf("unexpected first origin: %s", cfg.AllowedOrigins[0])
	}
	if cfg.AllowedOrigins[1] != "http://127.0.0.1:5173" {
		t.Fatalf("unexpected second origin: %s", cfg.AllowedOrigins[1])
	}
}
