package auth

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"
)

type HTTPVerifier struct {
	verifyURL string
	client    *http.Client
}

func NewHTTPVerifier(verifyURL string, timeout time.Duration) *HTTPVerifier {
	return &HTTPVerifier{
		verifyURL: verifyURL,
		client: &http.Client{
			Timeout: timeout,
		},
	}
}

type meResponse struct {
	UserID   int64  `json:"user_id"`
	ID       int64  `json:"id"`
	Username string `json:"username"`
}

func (v *HTTPVerifier) Verify(ctx context.Context, token string) (Result, error) {
	if token == "" {
		return Result{}, errors.New("empty token")
	}
	if v.verifyURL == "" {
		return Result{}, errors.New("AUTH_VERIFY_URL is empty")
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, v.verifyURL, nil)
	if err != nil {
		return Result{}, fmt.Errorf("new request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := v.client.Do(req)
	if err != nil {
		return Result{}, fmt.Errorf("do request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return Result{}, fmt.Errorf("auth failed: status=%d", resp.StatusCode)
	}

	var out meResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return Result{}, fmt.Errorf("decode: %w", err)
	}

	userID := out.UserID
	if userID <= 0 {
		userID = out.ID
	}

	if userID <= 0 || out.Username == "" {
		return Result{}, errors.New("invalid auth payload")
	}

	return Result{UserID: userID, Username: out.Username}, nil
}

type StubVerifier struct{}

func (StubVerifier) Verify(ctx context.Context, token string) (Result, error) {
	if token == "" {
		return Result{}, errors.New("empty token")
	}
	return Result{UserID: 777, Username: "kanno"}, nil
}
