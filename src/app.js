/**
 * Application composition for the hello service.
 *
 * This module answers exactly one question: what does the Express application
 * consist of? It builds the instance, mounts the project's single router and
 * hands the result back. It deliberately does not start it.
 *
 * Why the factory never opens a socket is the one structural decision worth
 * understanding here: binding a port is a side effect of *running* the process,
 * not of *describing* the application, so it belongs to src/server.js instead.
 * Because importing this file starts nothing, the test suite can call
 * createApp() as often as it likes - Supertest wraps each returned app in its
 * own throwaway http.Server on an ephemeral loopback port and closes it again,
 * so no test ever competes for the configured port or leaves a socket open.
 *
 * Per Rule 1 - the project's sole user-specified rule, which asks for a Node.js
 * tutorial project featuring one endpoint - this factory registers exactly one
 * router and nothing else. There is no health check, no root route and no
 * middleware stack, because every line a learner reads before reaching the
 * endpoint is a cost, and Express's own final handler already answers
 * everything else with 404.
 */
import express from 'express';

import { helloRouter } from './routes/hello.route.js';

/**
 * Build a fully configured Express application for the hello service.
 *
 * Each call returns a brand-new, independent instance: nothing is cached at
 * module scope, so two calls share no routing table, no settings and no state.
 * That independence is what lets every test build its own app and assert on it
 * without being disturbed by any other test.
 *
 * The returned app serves GET /hello with the 11-byte plain-text body
 * "Hello world" and answers every other path and method with 404 - including
 * the near misses /Hello, /HELLO, /hEllO, /hello/ and /hello2, which the
 * router's own caseSensitive and strict options exclude. Those options belong
 * on the Router constructor in src/routes/hello.route.js and are intentionally
 * not repeated here: the app-level "case sensitive routing" and "strict
 * routing" settings do not reach a Router mounted with use(), so setting them
 * here would be configuration that reads as protection while doing nothing.
 *
 * @returns {import('express').Express} A configured Express application, ready
 *   to serve requests but not yet bound to any port. The caller decides what to
 *   do with it: src/server.js starts it on the configured port, while the test
 *   suite drives it with an in-process HTTP client.
 */
export function createApp() {
  const app = express();

  // Express advertises itself with an X-Powered-By response header by default.
  // Removing it is the only app-level setting this project makes, and the test
  // suite asserts the header's absence, so it is part of the contract rather
  // than a preference.
  app.disable('x-powered-by');

  // Mounted without a path prefix on purpose: helloRouter registers its handler
  // at the full public path '/hello', so any prefix here would move the
  // endpoint - mounting at '/hello' would serve '/hello/hello'.
  app.use(helloRouter);

  return app;
}
