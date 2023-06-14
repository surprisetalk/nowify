#!/usr/bin/env bash

set -e

for c in dump stats help ; do
  deno run -A --unstable nowify.ts $c
done
