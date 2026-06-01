package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestHTTPVerifierVerify(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := r.Header.Get("Authorization"); got != "Bearer token-123" {
			t.Fatalf("unexpected auth header: %s", got)
		}
		_ = json.NewEncoder(w).Encode(meResponse{
			ID:       42,
			Username: "alice",
		})
	}))
	defer server.Close()

	verifier := NewHTTPVerifier(server.URL, time.Second)
	result, err := verifier.Verify(context.Background(), "token-123")
	if err != nil {
		t.Fatalf("verify failed: %v", err)
	}

	if result.UserID != 42 || result.Username != "alice" {
		t.Fatalf("unexpected auth result: %+v", result)
	}
}

func TestHTTPVerifierRejectsInvalidPayload(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(meResponse{})
	}))
	defer server.Close()

	verifier := NewHTTPVerifier(server.URL, time.Second)
	if _, err := verifier.Verify(context.Background(), "token-123"); err == nil {
		t.Fatal("expected invalid payload error")
	}
}
