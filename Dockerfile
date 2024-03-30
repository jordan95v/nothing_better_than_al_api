FROM node:latest

WORKDIR /app
COPY . .
RUN chmod +x ./docker-entrypoint.sh

RUN npm install && npx tsc

CMD tail -f