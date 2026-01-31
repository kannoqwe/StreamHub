FROM golang:1.25-alpine AS build
WORKDIR /src

COPY apps/edge/go.mod apps/edge/go.sum ./apps/edge/
WORKDIR /src/apps/edge
RUN go mod download

WORKDIR /src
COPY . .
WORKDIR /src/apps/edge
RUN CGO_ENABLED=0 go build -o /out/edge ./cmd/edge

FROM alpine:3.20
WORKDIR /app
COPY --from=build /out/edge /app/edge
EXPOSE 8080
ENTRYPOINT ["/app/edge"]
