#!/bin/bash
docker run --rm -it --add-host host.docker.internal.local=$(hostname -I | awk '{print $1}') -p 1880:1880 -v $(pwd)/packages/node-red-data:/data --name mynodered nodered/node-red:3.1.3-18
read -n 1 -s -r -p "Press any key to continue"
