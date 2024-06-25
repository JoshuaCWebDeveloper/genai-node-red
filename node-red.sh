#!/bin/bash

docker run --rm -it \
--name node-red-server \
-p 1880:1880 \
--add-host host.docker.internal.local=$(hostname -I | awk '{print $1}') \
-v $(pwd)/packages/node-red-data:/data \
 nodered/node-red:3.1.3-18

read -n 1 -s -r -p "Press any key to continue"
