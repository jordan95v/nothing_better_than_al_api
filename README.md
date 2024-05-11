<h1>Nothing better than AL API</h1>

This project is a REST API that provides information about a cinema. It was developed using `TypeScript` and `Express.js`.

<h1>Table of contents</h1>

- [Installation](#installation)
  - [Environment variables](#environment-variables)
  - [Manual installation](#manual-installation)
    - [Development launch](#development-launch)
    - [Production launch](#production-launch)
  - [Docker container](#docker-container)
    - [Export database schema](#export-database-schema)
    - [Caddy](#caddy)
    - [Caddyfile](#caddyfile)
    - [Docker compose](#docker-compose)

# Installation

To install the project, you can either use the Docker container or install it manually.

## Environment variables

The project uses environment variables to configure the API. The following variables are used:

| Variable             | Description                                | Default value    |
| -------------------- | ------------------------------------------ | ---------------- |
| `API_HOST`           | The host where the API will run            | `localhost`      |
| `API_PORT`           | The port where the API will run            | `3000`           |
| `API_ADMIN_EMAIL`    | The email of the admin user                | `admin@admin.fr` |
| `API_ADMIN_PASSWORD` | The password of the admin user             | `admin`          |
| `JWT_SECRET`         | The secret used to generate the JWT tokens | `secret`         |
| `DATABASE_URL`       | The URL to connect to the database         |                  |

You need to add the following variables to the `.env` file to configure the database if you use the Dockerfiles provided:

| Variable            | Description                             |
| ------------------- | --------------------------------------- |
| `POSTGRES_USER`     | The username to connect to the database |
| `POSTGRES_PASSWORD` | The password to connect to the database |
| `POSTGRES_DB`       | The name of the database                |
| `POSTGRES_HOST`     | The host where the database is running  |
| `POSTGRES_PORT`     | The port where the database is running  |

## Manual installation

To have the project up and running, you need to install the dependencies. To do so, run the following command:

```bash
you@your_machine:~/path/to$ git clone https://github.com/jordan95v/nothing_better_than_al_api.git
you@your_machine:~/path/to/nothing_better_than_al_api$ npm install
```

This will install all the dependencies needed to run the project.<br>

### Development launch

```bash
you@your_machine:~/path/to/nothing_better_than_al_api$ docker compose -f docker-compose.dev.yml up -d --build # To start postgres and adminer
you@your_machine:~/path/to/nothing_better_than_al_api$ npx prisma migrate dev # To create the database schema
you@your_machine:~/path/to/nothing_better_than_al_api$ npm run start:dev
```

### Production launch

```bash
you@your_machine:~/path/to/nothing_better_than_al_api$ npx prisma migrate deploy # To create the database schema
you@your_machine:~/path/to/nothing_better_than_al_api$ npx tsc && node dist/index.js
```

## Docker container

The projet also comes with a `Dockerfile` and a `docker-compose.yml` file.<br>

If you want to use the `docker-compose.yml` file, you will need to have a reverse proxy to redirect the requests to the API. We do use `caddy` here.
It is able to redirect the requests thanks to the external `caddy` network.

### Export database schema

To export the database schema, you can use the following command:

```bash
you@your_machine:~/path/to/nothing_better_than_al_api$ ./db_backup.sh
```

### Caddy

To create the network, you can use the following command:

```bash
you@your_machine:~/path/to/nothing_better_than_al_api$ docker network create caddy
```

After creating the network, you will need to have the `caddy` running. To do so, you can use the following command:

```bash
you@your_machine:~/path/to/nothing_better_than_al_api$ docker run -d --name caddy --network caddy -p 80:80 -p 443:443 -v -v /path/to/Caddyfile:/etc/caddy/Caddyfile -v /path/to/caddy_data:/data caddy
```

### Caddyfile

The `Caddyfile` should look like this:

```Caddyfile
<hostname> {
    encode gzip zstd
    reverse_proxy <api_container_name>:<port>
}
```

Be sure to replace `<hostname>` with the hostname you want to use, `<api_container_name>` with the name of the API container, and `<port>` with the port where the API is running.

### Docker compose

To use the `docker-compose.yml` file, you need a proper `.env` file and need to run the following command:

```bash
you@your_machine:~/path/to/nothing_better_than_al_api$ docker-compose up -d --build
```

<h1>Thanks for reading!</h1>

<img src="https://media1.tenor.com/m/zFkXN9fQ_9oAAAAC/anya-sleep.gif" width="100%">
