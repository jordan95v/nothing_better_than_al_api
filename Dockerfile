FROM node:latest

WORKDIR /app
COPY . .
RUN chmod +x /app/entrypoint.sh

RUN npm install && npx tsc
