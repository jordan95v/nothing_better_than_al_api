FROM node:21.7.2-slim

WORKDIR /app
COPY . .
RUN chmod +x ./docker-entrypoint.sh

RUN npm install && npx tsc
