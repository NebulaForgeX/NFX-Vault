FROM golang:1.26-alpine AS base-builder
WORKDIR /src
RUN apk add --no-cache git ca-certificates tzdata
COPY go.mod go.sum ./
RUN go mod download

FROM base-builder AS prod-build
COPY . ./
ARG APP_VERSION=dev
ENV CGO_ENABLED=0 GOOS=linux
RUN --mount=type=cache,target=/go/pkg/mod \
  --mount=type=cache,target=/root/.cache/go-build \
  go build -trimpath -ldflags="-s -w -X main.version=${APP_VERSION}" \
  -o /out/tls-api-service ./inputs/tls/api

FROM alpine:latest AS prod
WORKDIR /app
RUN apk update && apk upgrade && apk add --no-cache ca-certificates tzdata certbot
COPY inputs /app/inputs
COPY errors /app/errors
COPY --from=prod-build /out/tls-api-service /app/tls-api-service
COPY inputs/tls/configuration/prod.toml /app/config.toml
COPY .env /app/.env
ENV APP_ENV=prod
ENV CONFIG_FILE=/app/config.toml
EXPOSE 8080

ENTRYPOINT ["/app/tls-api-service"]

FROM base-builder AS dev
WORKDIR /app
ENV PATH="/go/bin:$PATH"
RUN go install github.com/air-verse/air@v1.61.7
COPY . ./
CMD ["air", "-c", "inputs/tls/api/.air.toml"]
