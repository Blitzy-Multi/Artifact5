import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { HELLO_PATH } from './routes/hello.route.js';

const { port } = loadConfig();

/** Stand-in for `error.code` when a failure carries no usable code string. */
const UNKNOWN_ERROR_CODE = 'UNKNOWN';

/**
 * Report a failed bind on stderr and mark the process as failed.
 *
 * Only the configured port and the error's stable `code` are printed. The Error
 * is neither rethrown nor logged, because its message and stack name this file's
 * absolute path, `node_modules` internals, `node:internal` frames and the exact
 * Node version - detail that describes the machine rather than helping whoever
 * ran the command.
 *
 * @param {NodeJS.ErrnoException} error Failure handed to the `listen` callback.
 * @returns {void}
 */
function reportStartupFailure(error) {
  const code =
    typeof error?.code === 'string' && error.code !== '' ? error.code : UNKNOWN_ERROR_CODE;

  console.error(`Failed to start the hello service on port ${port}: ${code}`);

  if (code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Set PORT to a free port and start again.`);
  }

  // A failed bind leaves no listening handle, and Node unrefs signal handles, so
  // nothing holds the event loop open: the process ends with this status once
  // stderr has flushed. process.exit() is avoided deliberately - it can truncate
  // a pending pipe write and lose the message above.
  process.exitCode = 1;
}

/**
 * Express registers the callback given to `listen` as a one-shot `error`
 * listener as well as the `listening` callback, so a failed bind such as
 * `EADDRINUSE` arrives there and must be handled before the success log: a
 * callback that ignored its argument would print a URL nothing is listening
 * on and exit 0.
 * @type {import('node:http').Server}
 */
export const server = createApp().listen(port, (error) => {
  if (error) {
    reportStartupFailure(error);
    return;
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
