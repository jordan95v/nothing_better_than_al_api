<h1>Nothing better than AL API</h1>

- [Installation](#installation)
  - [Manual installation](#manual-installation)
  - [Docker container](#docker-container)

# Installation

This project is a REST API that provides information about a cinema. It was developed using TypeScript and `Express.js`. The database used is PostgreSQL.

## Manual installation

To have the project up and running, you need to install the dependencies. To do so, run the following command:

```bash
you@your_machine:~/path/to/project$ npm install
```

This will install all the dependencies needed to run the project.<br>
Be sure to have a PostgreSQL database running on your machine and to setup the `DATABASE_URL` environment variable. in the `.env` file.
Then you can run the project using the following command:

```bash
you@your_machine:~/path/to/project$ npm start:prod
```

## Docker container

You can also run the project using Docker. To do so, run the following command:

```bash
you@your_machine:~/path/to/project$ docker-compose up
```

<h1>Thanks for reading!</h1>

<img src="https://media1.tenor.com/m/zFkXN9fQ_9oAAAAC/anya-sleep.gif" width="100%">
