/**
 * The app under test comes from `createApp()`, never from the process
 * bootstrap: the bootstrap binds the configured port and leaves a listener
 * open, while Supertest wraps each app in a throwaway server on an ephemeral
 * loopback port.
 *
 * Every path below is written as a literal rather than taken from the route
 * module's exported constant, so renaming the endpoint fails these tests
 * instead of silently passing.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

import { createApp } from '../src/app.js';

test('GET /hello returns 200 with the plain-text body "Hello world"', async () => {
  const app = createApp();

  // The request must be fresh and unconditional: `res.send()` attaches a weak
  // ETag, so an `If-None-Match` request correctly returns 304 without the
  // entity data asserted below.
  const response = await request(app).get('/hello');

  assert.equal(response.status, 200, 'GET /hello should return 200');

  assert.equal(
    response.headers['content-type'],
    'text/plain; charset=utf-8',
    'the response should be plain text in UTF-8',
  );

  assert.equal(response.text, 'Hello world', 'the body should be "Hello world"');

  // Check both declared and actual byte length; header values arrive as strings.
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

  // Pin the project decision to disable Express's default X-Powered-By header.
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

  // These literals cover the case variants and the trailing slash
  // independently of the route module. Both exactness options live on the
  // `Router` constructor, because the app-level `case sensitive routing` and
  // `strict routing` settings do not reach a Router mounted with `use()`.
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

  // No handler is registered for these verbs, so Express's default final
  // handler answers 404 rather than 405. Supertest names its request methods
  // in lowercase, which is why the agent is indexed.
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
