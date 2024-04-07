#!/bin/bash

## To automate the backup process, you can use the crontab
## 1. Open the crontab editor
## crontab -e
## 2. Add the following line to the crontab file
## 0 2 * * * cd /path/to/nothing_better_than_al_api && ./db_backup.sh

DATE=$(date +%Y-%m-%d_%H-%M-%S)

source .env
mkdir -p ./backup

docker exec -t postgres-db bash -c "pg_dump --dbname=$DATABASE_URL > /tmp/dump_$DATE.sql"
docker cp postgres-db:/tmp/dump_$DATE.sql ./backup/
ret=$?

if [ $ret -ne 0 ]; then
  echo "Backup failed"
  exit 1
fi

echo "Backup created successfully"
