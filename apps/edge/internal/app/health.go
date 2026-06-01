package app

import (
	"encoding/json"
	"net/http"
	"time"
)

type healthResponse struct {
	Status    string `json:"status"`
	Service   string `json:"service"`
	Timestamp string `json:"timestamp"`
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeHealth(w, r)
}

func handleReady(w http.ResponseWriter, r *http.Request) {
	writeHealth(w, r)
}

func writeHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(healthResponse{
		Status:    "ok",
		Service:   "edge",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	})
}
