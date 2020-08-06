#!/usr/bin/env bash
set -euox pipefail

rm -r ./docs || true
parcel build --public-url 'https://www.ajaska.com/experiments/'  --dist-dir docs --no-scope-hoist src/index.html # src/**/index.html
cp -r ./static/* ./docs

git add ./docs
git commit -m "Re-build"
