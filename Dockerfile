FROM node:latest

WORKDIR /app
COPY . .

RUN npm install && npx tsc

CMD node dist/index.js
