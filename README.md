# Artifact5

A minimal Node.js HTTP server built with the Express.js web framework. It exposes two plaintext HTTP endpoints.

## Prerequisites

- Node.js version 18 or higher (required by Express 5).
- npm (bundled with Node.js) for dependency management.

## Install

Install the project dependencies:

```bash
npm install
```

## Run

Start the server:

```bash
npm start
```

This runs `node index.js`. The server listens on port 3000 (http://localhost:3000).

## Endpoints

| Method | Path            | Response body  |
| ------ | --------------- | -------------- |
| GET    | `/`             | `Hello world`  |
| GET    | `/good-evening` | `Good evening` |

Any other path returns Express's default 404 Not Found response.
