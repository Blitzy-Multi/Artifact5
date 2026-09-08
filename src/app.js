import express from 'express';

import { helloRouter } from './routes/hello.route.js';

/**
 * Creates a new, configured Express application without binding a port.
 * @returns {import('express').Express}
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
  //
  // helloRouter is module-scoped, so every createApp() call mounts that same
  // Router. That is safe because mounting records the router on this app's own
  // stack instead of changing the router, which is what lets each test build
  // its own app.
  app.use(helloRouter);

  return app;
}
