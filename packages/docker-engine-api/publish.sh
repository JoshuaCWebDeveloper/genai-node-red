#!/bin/bash

PREFIX="$(dirname "$0")"
SEMVER=$1

if [[ "$SEMVER" != "major" && "$SEMVER" != "minor" && "$SEMVER" != "patch" ]]; then
  echo "Error: SEMVER must be 'major', 'minor', or 'patch'."
  exit 1
fi

docker login

npm --prefix $PREFIX version $SEMVER

VERSION=$(node -p "require('./$PREFIX/package.json').version")
echo "Publishing docker-engine-api:$VERSION"

docker tag docker-engine-api:local joshuacarter603/docker-engine-api:latest
docker tag docker-engine-api:local joshuacarter603/docker-engine-api:$VERSION

docker push joshuacarter603/docker-engine-api:latest
docker push joshuacarter603/docker-engine-api:$VERSION
