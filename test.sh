#!/usr/bin/env bash

set -e

for c in stats dump help ; do
  deno run -A --unstable nowify.ts $c
done
