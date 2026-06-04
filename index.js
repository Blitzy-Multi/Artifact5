/**
 * index.js — Artifact5 server entry point.
 *
 * A minimal, single-file Express.js (CommonJS) application that exposes two
 * plaintext HTTP GET endpoints:
 *
 *   GET /              -> 200 OK, body: "Hello world"
 *   GET /good-evening  -> 200 OK, body: "Good evening"
 *
 * Any other path falls through to Express's built-in 404 handler.
 *
 * Runtime:   Node.js >= 18 (Express 5 requirement).
 * Framework: express ^5.2.1 (sole direct dependency; resolved from node_modules/).
 * Module:    CommonJS (require/module). package.json does NOT set "type":"module".
 *
 * Run:
 *   npm install   # materializes node_modules/ from package.json + package-lock.json
 *   npm start     # === node index.js
 *
 * The server is stateless: it performs simple request/response handling with no
 * persistence, sessions, cookies, authentication, or additional middleware.
 */

'use strict';

// Express web framework — provides the application factory, route registration
// (app.get) and the HTTP listener (app.listen). This is the only direct runtime
// dependency and is resolved from node_modules/.
const express = require('express');

// Instantiate the Express application.
const app = express();

// Port the HTTP server binds to. Hardcoded to 3000 by convention to keep the
// configuration minimal; both endpoints are reachable at http://localhost:3000.
const port = 3000;

/**
 * Original endpoint.
 *
 * GET / -> responds with the exact plaintext body "Hello world".
 * res.send(String) returns the payload with an HTTP 200 status code.
 */
app.get('/', (req, res) => res.send('Hello world'));

/**
 * New endpoint.
 *
 * GET /good-evening -> responds with the exact plaintext body "Good evening".
 * res.send(String) returns the payload with an HTTP 200 status code.
 */
app.get('/good-evening', (req, res) => res.send('Good evening'));

// Start the HTTP server and begin listening for incoming connections. The
// startup callback logs a confirmation message once the listener is bound.
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
