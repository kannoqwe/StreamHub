package ws

import (
	"net"
	"net/http"
	"strings"
)

func BearerToken(authHeader string) string {
	const p = "Bearer "
	if !strings.HasPrefix(authHeader, p) {
		return ""
	}
	return strings.TrimSpace(authHeader[len(p):])
}

func ClientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func NormalizeContent(s string) string {
	s = strings.TrimSpace(s)
	if s == "" {
		return ""
	}
	if len(s) > 500 {
		return s[:500]
	}
	return s
}
