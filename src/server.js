/**
 * Process bootstrap for the hello service.
 *
 * This is the entry point: `package.json` names it as both `main` and the
 * target of the `start` script, so `npm start` runs exactly this file. Its
 * whole job is to turn the *description* of an application into a *running*
 * process — read the configuration, open the socket, tell the learner which
 * URL to call, and shut the listener down cleanly when asked.
 *
 * Everything it does not do is as deliberate as everything it does. It defines
 * no route, mounts no middleware and touches the Express instance only to call
 * `listen`, because composing the application belongs to src/app.js. It reads
 * no environment variable of its own, because interpreting the environment
 * belongs to src/config.js. It writes the path of the endpoint nowhere, because
 * that literal is declared once, in src/routes/hello.route.js, and imported
 * here as {@link HELLO_PATH}.
 *
 * That leaves this module as the single place in the project where importing a
 * file *does* something: binding a port and registering signal handlers are
 * side effects, and confining them to one file is what keeps every other module
 * safe to import. It is why neither test file imports this one — the suite
 * builds its own app through `createApp()` and lets its HTTP client bind a
 * throwaway ephemeral port, so running the tests never competes for the
 * configured port and never inherits a listener it did not create. The
 * asymmetry is the lesson, not an oversight to be smoothed over with a
 * `start()` wrapper or an entry-point guard.
 *
 * Per Rule 1 — the project's sole user-specified rule, which asks for a Node.js
 * tutorial project featuring one endpoint — the bootstrap is built from Node's
 * own primitives and nothing else: the `http.Server` that Express's `listen`
 * returns, `console.log` for the one line of output, and `process.on` for the
 * two signals. No process manager, no logging library, no clustering, no
 * graceful-shutdown package.
 */
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { HELLO_PATH } from './routes/hello.route.js';

/**
 * The port to bind, resolved once at startup.
 *
 * `loadConfig()` is called with no argument on purpose: it already defaults its
 * parameter to the live process environment, so passing nothing is both correct
 * and the reason this file never inspects the environment itself. A `PORT` that
 * is missing or malformed resolves to 3000 inside that function rather than
 * failing here — the fallback is configuration's concern, not the bootstrap's.
 */
const { port } = loadConfig();

/**
 * The running HTTP server, and this module's only export.
 *
 * `listen` is given no host argument, so it binds the default address. A
 * configurable bind host is out of scope: accepting an arbitrary one would
 * force the startup URL below to be formatted differently for IPv4 literals,
 * hostnames, wildcard addresses and bracketed IPv6, all for a tutorial whose
 * only caller is on the same machine. Binding the default and printing
 * `localhost` is correct for every case this project supports.
 *
 * No `error` listener is attached and no `try`/`catch` wraps the call. If the
 * port is already taken, the unhandled `EADDRINUSE` failure — a loud, accurate
 * stack trace naming the port — is the intended behaviour, and the documented
 * remedy is the `PORT` override described in README.md.
 *
 * @type {import('node:http').Server}
 */
export const server = createApp().listen(port, () => {
  // Logged from inside the callback, so the line appears only once the port is
  // actually bound and the URL it advertises is genuinely reachable. The path
  // comes from the imported constant rather than a second copy of the literal,
  // which is what keeps a rename of the endpoint to a single edit. This one
  // line is the entire logging requirement of the project.
  console.log(`Hello service listening on http://localhost:${port}${HELLO_PATH}`);
});

/**
 * Signals that mean "stop": Ctrl-C in the learner's terminal sends `SIGINT`,
 * and orchestrators and `kill` send `SIGTERM`. Both deserve the same response,
 * so they are registered together rather than twice over.
 */
const SHUTDOWN_SIGNALS = ['SIGINT', 'SIGTERM'];

for (const signal of SHUTDOWN_SIGNALS) {
  process.on(signal, () => {
    // Closing the listener first stops new connections and lets in-flight
    // requests finish; the explicit exit is what puts the status code under
    // this project's control — with no handler at all, Ctrl-C would terminate
    // the process with 130 (128 + SIGINT) instead of a clean 0.
    server.close(() => process.exit(0));
  });
}
