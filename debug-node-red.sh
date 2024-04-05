#!/bin/bash
docker run -e NODE_OPTIONS="--inspect=0.0.0.0:9229" --rm -it -p 1880:1880 -p 9229:9229 -v $(pwd)/packages/node-red-data:/data --name mynodered nodered/node-red 
read -n 1 -s -r -p "Press any key to continue"
