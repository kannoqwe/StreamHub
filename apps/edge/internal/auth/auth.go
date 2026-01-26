package auth

import "context"

type Result struct {
	UserID   int64
	Username string
}

type Verifier interface {
	Verify(ctx context.Context, bearerToken string) (Result, error)
}
