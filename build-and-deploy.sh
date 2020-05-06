#!/usr/bin/env bash
set -euox pipefail

rm ./docs/*
parcel build --public-url 'https://www.ajaska.com/experiments/'  --dist-dir docs --no-scope-hoist src/index.html 
