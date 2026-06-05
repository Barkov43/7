#!/bin/sh
set -e

mkdir -p /app/data /app/storage
cd /app/server
node src/db/init-db.js
node src/index.js

