FROM golang:1.21
WORKDIR /usr/src/app
COPY go.mod go.sum ./
RUN go mod download && go mod verify
RUN go env -w CGO_ENABLED=1
RUN go env -w CGO_CFLAGS="-D_LARGEFILE64_SOURCE"
COPY . .
RUN go build -v -o /usr/local/bin/app ./
RUN mkdir -p /usr/local/bin/data
EXPOSE 8080
CMD ["/usr/local/bin/app"]