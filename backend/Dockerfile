
FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o main cmd/api/main.go

RUN go build -o seed cmd/seed/main.go

FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

COPY --from=builder /app/main .

COPY --from=builder /app/seed .

EXPOSE 8080

CMD ["./main"]