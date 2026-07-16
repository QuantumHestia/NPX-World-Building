#!/bin/bash
CONTENT_DIR="/Cloud/Nextcloud/Data/quan.au1998@gmail.com/files/World Building/Eldoria"
QUARTZ_DIR="/home/nas/quartz"

# Initial build on startup
cd "$QUARTZ_DIR"
npx quartz build -d "$CONTENT_DIR"

# Watch for changes and rebuild
while inotifywait -r -e modify,create,delete,move "$CONTENT_DIR"; do
  echo "[$(date)] Change detected, rebuilding..."
  cd "$QUARTZ_DIR" && npx quartz build -d "$CONTENT_DIR"
done
