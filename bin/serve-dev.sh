#!/usr/bin/env bash
set -euox pipefail

parcel serve src/index.html src/**/index.html
