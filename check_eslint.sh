#!/usr/bin/env bash
PATHS=(
    "server.js"
    "worker.js"
    "utils/*"
    "routes/*"
    "controllers/*"
    # "tests/*"
)

npx eslint --fix "${PATHS[@]}"
