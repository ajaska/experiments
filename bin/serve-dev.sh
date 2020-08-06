#!/usr/bin/env bash
set -euox pipefail

cp -r ./static/* ./dist
parcel serve src/index.html # src/**/index.html
