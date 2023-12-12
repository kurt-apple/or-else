FROM golang:1.21.5-alpine
RUN apk add build-base
RUN mkdir /app
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
RUN go env -w CGO_ENABLED=1
RUN go env -w CGO_CFLAGS="-D_LARGEFILE64_SOURCE"
COPY server-init/init.go ./
RUN touch habits.db
COPY models ./models
RUN go run init.go
COPY main.go ./
COPY seeds ./seeds
EXPOSE 8080
ENTRYPOINT ["go", "run", "main.go"]