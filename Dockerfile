FROM node:20.12.1-alpine3.19

WORKDIR /app
COPY . .
RUN chmod +x ./docker-entrypoint.sh

RUN npm install && npx tsc
