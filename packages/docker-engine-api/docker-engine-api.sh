#!/bin/bash

docker network disconnect docker-engine-api node-red-server || true
docker network rm docker-engine-api || true

docker network create docker-engine-api
docker network connect docker-engine-api node-red-server

docker run --rm \
--name docker-engine-api \
--network docker-engine-api \
-v /var/run/docker.sock:/var/run/docker.sock \
 $1
