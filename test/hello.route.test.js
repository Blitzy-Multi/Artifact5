/**
 * Contract tests for the project's single endpoint, `GET /hello`.
 *
 * Three tests, and each one is a plain statement about the service:
 *
 *   1. the endpoint returns exactly this response,
 *   2. only this exact path matches,
 *   3. these verbs are not registered.
 *
 * Tests 2 and 3 are the reason this file is worth reading. A happy-path test on
 * its own proves the endpoint answers, but it says nothing about what else
 * answers — and "one endpoint" is the whole requirement here. Express matches
 * paths case-insensitively and non-strictly by default, so on a default
 * configuration `/Hello`, `/HELLO`, `/hEllO` and `/hello/` all return 200 with
 * the same body. Those four extra spellings would be a defect nobody noticed.
 *
 * Two details in the imports below are load-bearing rather than stylistic:
 *
 *   1. The runner and the assertions come from Node itself. `node:test` has
 *      been stable since Node 20, so this project installs no third-party test
 *      framework and no assertion library — `npm test` is the bare
 *      `node --test`, which finds this file on its own. Supertest is the only
 *      development dependency, and it is here for one job: driving HTTP
 *      requests at an Express app inside this process.
 *   2. The assertion module is `node:assert/strict`, not `node:assert`. The
 *      plain module compares loosely, so `assert.equal(response.status, '200')`
 *      would pass — and a status code silently changing from a Number to a
 *      string is exactly the kind of drift a contract test should catch.
 *
 * Two things this file deliberately does *not* do, both for the same reason —
 * a test that reaches for convenience stops testing what it claims to:
 *
 *   • It never imports the process bootstrap module under `src/`. That module
 *     exists to run the service: importing it would bind the configured port,
 *     print to the console and register signal handlers, leaving a real server
 *     open for the rest of the run. Instead every test hands Supertest the app
 *     returned by `createApp()`, and Supertest wraps it in a throwaway
 *     `http.Server` on an ephemeral loopback port that it closes again after
 *     the request. The suite therefore never touches port 3000, and it passes
 *     even when something else is already listening there.
 *
 *   • It never imports the path constant the route module exports. Every path
 *     below is a literal string, on purpose: a test that asked the route
 *     module where the route lives would keep passing after somebody renamed
 *     the endpoint to `/greeting`, which is precisely the regression these
 *     tests exist to catch. Documentation and tests state the public path the
 *     way a caller types it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { createApp } from '../src/app.js';

test('GET /hello returns 200 with the plain-text body "Hello world"', async () => {
  // Each test builds its own app: a fresh Express application with its own
  // settings and its own top-level stack. The router inside it is shared —
  // `helloRouter` is created once at module scope and every app mounts that
  // same object — but its single route is fixed at import time and nothing
  // reconfigures it while the suite runs, so there is no state for one test to
  // leave behind for another.
  const app = createApp();

  // A fresh, unconditional request: no `If-None-Match` and no other
  // conditional header. That matters. `res.send()` attaches a weak ETag, so a
  // client that does send `If-None-Match` — a browser reload, for instance —
  // correctly receives 304 with no body and none of the entity headers
  // asserted below. That is proper HTTP, not a defect, which is why the
  // contract is scoped to fresh requests and why no ETag assertion appears
  // anywhere in this file.
  const response = await request(app).get('/hello');

  assert.equal(response.status, 200, 'GET /hello should return 200');

  // The full media type, charset parameter included. A bare string is not
  // JSON, so swapping the handler's `res.type('text/plain').send(...)` for
  // `res.json(...)` would misrepresent the requirement — and this is the
  // assertion that catches it, because `res.json` would report
  // `application/json; charset=utf-8` here.
  assert.equal(
    response.headers['content-type'],
    'text/plain; charset=utf-8',
    'the response should be plain text in UTF-8',
  );

  // The body is the user's exact string: capital H, lowercase w, one space, no
  // exclamation mark and no trailing newline. It is *not* the "Hello World!"
  // from Express's own hello-world example, and the difference is deliberate.
  assert.equal(response.text, 'Hello world', 'the body should be "Hello world"');

  // Byte-exactness, pinned twice over. Header values arrive as strings, hence
  // '11' rather than 11 under strict assert. The second assertion measures the
  // body itself, so an accidental trailing newline fails here even if some
  // future layer recomputed the header to match its own mistake.
  assert.equal(
    response.headers['content-length'],
    '11',
    'the response should declare 11 bytes',
  );
  assert.equal(
    Buffer.byteLength(response.text, 'utf8'),
    11,
    'the body should be 11 bytes with no trailing newline',
  );

  // Express advertises itself with `X-Powered-By` unless told not to.
  // `src/app.js` calls `app.disable('x-powered-by')`, and because that is a
  // decision this project made rather than a framework default, the header's
  // absence is asserted rather than assumed. Both forms are checked: the
  // property is missing, and reading it yields `undefined`.
  assert.equal(
    response.headers['x-powered-by'],
    undefined,
    'X-Powered-By should not be sent',
  );
  assert.equal(
    Object.hasOwn(response.headers, 'x-powered-by'),
    false,
    'X-Powered-By should be absent from the header set entirely',
  );

  // Nothing else about the response is asserted. The total header set varies
  // with the transport and with anything sitting in front of the service, so
  // this test pins the headers it names and stays silent about the rest.
});

test('only the exact path /hello matches', async () => {
  const app = createApp();

  // Each entry guards a specific way the route could quietly widen:
  //
  //   /Hello, /HELLO, /hEllO  the router's `caseSensitive: true` option
  //   /hello/                 its `strict: true` option
  //   /hello2                 a prefix-style match swallowing a longer path
  //   /                       "one endpoint" — no root route, no landing page
  //
  // Both router options live on the `Router` constructor in
  // src/routes/hello.route.js, and they have to: the app-level
  // `case sensitive routing` and `strict routing` settings do not reach a
  // Router mounted with `use()`, so with a plain `Router()` the first four
  // paths below would all answer 200. Dropping either option fails this test
  // instead of silently adding four undocumented aliases for the endpoint.
  const nonMatchingPaths = ['/Hello', '/HELLO', '/hEllO', '/hello/', '/hello2', '/'];

  for (const path of nonMatchingPaths) {
    const response = await request(app).get(path);

    // Status only. The 404 body comes from Express's default final handler and
    // its exact HTML is not part of this project's contract, so asserting it
    // would tie the suite to a framework detail the user never asked about.
    assert.equal(
      response.status,
      404,
      `${path} must not match the /hello route`,
    );
  }
});

test('the write verbs are not registered on /hello', async () => {
  const app = createApp();

  // GET is the only verb this project registers, so each of the four write
  // verbs below falls through to Express's default final handler, which
  // answers 404.
  //
  // 404, not 405. Answering "method not allowed" instead looks like an
  // improvement and is the regression this test exists to prevent: it would
  // mean somebody registered these verbs — or added an error handler — to say
  // so, which is a second and a third endpoint's worth of behaviour on a
  // project that was asked for one. No `Allow` header is asserted either, for
  // the same reason.
  //
  // Supertest names its request methods in lowercase. `delete` is a reserved
  // word, but it is a perfectly good property name, so indexing the Supertest
  // agent keeps all four verbs in one loop and this file at three tests.
  const unregisteredVerbs = ['post', 'put', 'delete', 'patch'];

  for (const verb of unregisteredVerbs) {
    const response = await request(app)[verb]('/hello');

    assert.equal(
      response.status,
      404,
      `${verb.toUpperCase()} /hello should return 404, not ${response.status}`,
    );
  }

  // HEAD and OPTIONS are absent from that list on purpose. Express answers
  // both from the same GET registration — HEAD returns 200 with no body, and
  // OPTIONS returns 200 advertising the methods Express derives — so neither
  // is a verb this project registered, and neither is asserted here.
});
