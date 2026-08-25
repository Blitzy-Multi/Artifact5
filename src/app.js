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
 * endpoint is a cost. The paths this project never registers, and the write
 * verbs POST, PUT, DELETE and PATCH, reach Express's own final handler, which
 * answers them with 404. HEAD and OPTIONS are the exception, and the comment
 * on createApp() below says why.
 */
import express from 'express';

import { helloRouter } from './routes/hello.route.js';

/**
 * Build a fully configured Express application for the hello service.
 *
 * Each call returns a brand-new Express application with its own settings and
 * its own top-level stack, so nothing one caller does to an app it built is
 * visible to another. What the apps do share is the router: helloRouter is
 * created once at module scope in src/routes/hello.route.js and exported, so
 * every app mounts that same object and the same single route inside it. That
 * is safe here because the route stack is fixed at import time - nothing in
 * this project adds, removes or reconfigures a route while the process runs -
 * so a shared router has no state for one caller to disturb on behalf of
 * another, which is what lets every test build its own app and assert on it.
 *
 * The returned app serves a fresh, unconditional GET /hello with the 11-byte
 * plain-text body "Hello world". "Fresh" is part of the claim: res.send()
 * attaches a weak ETag, so a request that carries If-None-Match correctly gets
 * 304 with no body instead, which is proper HTTP rather than a defect.
 *
 * Six paths do not match and answer 404 - /Hello, /HELLO, /hEllO, /hello/,
 * /hello2 and / - and so do the four write verbs POST, PUT, DELETE and PATCH on
 * /hello: none of them is registered, so each reaches Express's default final
 * handler. HEAD and OPTIONS are deliberately absent from that list, because
 * Express answers both from the sole GET registration - HEAD with 200 and an
 * empty body, OPTIONS with 200 advertising the methods it derives - and nothing
 * in this file registers, alters or suppresses that.
 *
 * The first four of those non-matching paths are excluded by the router's own
 * caseSensitive and strict options. Those options belong on the Router
 * constructor in src/routes/hello.route.js and are intentionally not repeated
 * here: the app-level "case sensitive routing" and "strict routing" settings do
 * not reach a Router mounted with use(), so setting them here would be
 * configuration that reads as protection while doing nothing.
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
