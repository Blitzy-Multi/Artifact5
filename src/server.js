import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { HELLO_PATH } from './routes/hello.route.js';

const { port } = loadConfig();

/**
 * Express registers the callback given to `listen` as a one-shot `error`
 * listener as well as the `listening` callback, so a failed bind such as
 * `EADDRINUSE` arrives there and must be rethrown before the success log: a
 * callback that ignored its argument would print a URL nothing is listening
 * on and exit 0.
 * @type {import('node:http').Server}
 */
export const server = createApp().listen(port, (error) => {
  if (error) {
    throw error;
  }

  // Log only after the listening callback confirms the bind.
  console.log(`Hello service listening on http://localhost:${port}${HELLO_PATH}`);
});

const SHUTDOWN_SIGNALS = ['SIGINT', 'SIGTERM'];

for (const signal of SHUTDOWN_SIGNALS) {
  process.on(signal, () => {
    // Exit only after server.close finishes so new connections stop and active requests can drain.
    server.close(() => process.exit(0));
  });
}
