FROM golang:1.23-alpine AS build
WORKDIR /src
COPY . .
WORKDIR /src/apps/edge
RUN go mod download
RUN CGO_ENABLED=0 go build -o /out/edge ./cmd/edge

FROM alpine:3.20
WORKDIR /app
COPY --from=build /out/edge /app/edge
EXPOSE 8080
ENTRYPOINT ["/app/edge"]
