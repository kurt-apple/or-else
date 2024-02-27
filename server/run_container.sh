#! /bin/bash
docker build -t or-else-go .
docker run --detach --publish 8080:8080 or-else-go
