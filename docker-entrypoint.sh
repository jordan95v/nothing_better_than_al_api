#!/bin/bash

cd /app
npx prisma migrate deploy
node dist/index.js
