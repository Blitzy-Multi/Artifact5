/**
 * Contract tests for the configuration layer, `src/config.js`.
 *
 * Three tests, one per behaviour a reader needs to know about the `PORT`
 * setting: what happens when it is absent, what happens when it is valid, and
 * what happens when it is not.
 *
 * Two details in the imports below are load-bearing rather than stylistic, and
 * they are the two things worth copying into your own projects:
 *
 *   1. The runner and the assertions come from Node itself. `node:test` has
 *      been stable since Node 20, so this project installs no third-party test
 *      framework and no third-party assertion library — `npm test` is the bare
 *      `node --test`, which finds this file on its own.
 *   2. The assertion module is `node:assert/strict`, not `node:assert`. The
 *      plain module compares loosely, which would let a string `'3000'` pass
 *      an assertion that asks for the number `3000` — and the port being a
 *      real Number is precisely part of the contract under test here.
 *
 * Every test passes its own environment object to `loadConfig`. None of them
 * reads, writes or restores `process.env`, so the suite behaves identically on
 * a laptop that happens to export `PORT` and on one that does not.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { loadConfig } from '../src/config.js';

test('defaults to port 3000 when PORT is not set', () => {
  // `loadConfig` defaults its parameter to `process.env`, so calling it with
  // no argument at all would read whatever the surrounding shell exports and
  // make this test pass or fail depending on the machine. Handing it an empty
  // object is what makes "PORT is not set" mean exactly that, everywhere.
  assert.deepEqual(loadConfig({}), { port: 3000 });

  // Asserting the whole object above — rather than just its `port` property —
  // also pins the documented shape: one property and no others. A stray extra
  // field would fail here.

  // The default has to be a Number, not the string `'3000'`. An implementation
  // that simply handed back `env.PORT ?? 3000` would return a string for any
  // override, and the HTTP layer would accept that string without complaint —
  // so this is the cheap assertion that catches an expensive surprise.
  assert.equal(typeof loadConfig({}).port, 'number');
});

test('honours a whole-integer PORT within 1-65535', () => {
  // Environment values are always strings, so converting to a Number is part
  // of the contract, not an implementation detail. `1` and `65535` are the
  // inclusive edges of the range — the two values an off-by-one range check
  // would get wrong — and the padded entry proves the value is trimmed before
  // it is inspected.
  const acceptedValues = [
    ['5555', 5555],
    ['1', 1],
    ['65535', 65535],
    [' 8080 ', 8080],
  ];

  for (const [input, expected] of acceptedValues) {
    const { port } = loadConfig({ PORT: input });

    assert.equal(
      port,
      expected,
      `PORT=${JSON.stringify(input)} should yield ${expected}`,
    );
    assert.equal(
      typeof port,
      'number',
      `PORT=${JSON.stringify(input)} should yield a Number, not a string`,
    );
  }
});

test('falls back to port 3000 for a malformed PORT value', () => {
  // This is the test that stops a plausible-looking simplification from
  // shipping. Swapping the grammar for a bare `Number.parseInt` reads like a
  // tidy-up, but `parseInt` stops at the first character it cannot use: it
  // reads '8080abc' as 8080, '3.5' as 3 and '1e3' as 1. The service would
  // start on a port nobody asked for, and nothing would say so.
  //
  // A malformed value selects the default; it never throws and never refuses
  // to start. Whether the chosen port is actually free is a separate question,
  // answered later and elsewhere: an occupied one fails at bind time with
  // EADDRINUSE, which is not configuration's problem to solve.
  const malformedValues = [
    '8080abc', // trailing garbage — the parseInt trap
    '3.5', // a decimal fraction, not a whole number
    '1e3', // exponent notation
    '+8080', // signed, though otherwise in range
    '-1', // signed and below the range
    '0', // below the range: port 0 asks the OS to choose
    '65536', // above the range: ports are 16-bit
    '', // present but empty
    '   ', // whitespace only, which trims to empty
  ];

  for (const value of malformedValues) {
    const { port } = loadConfig({ PORT: value });

    assert.equal(
      port,
      3000,
      `PORT=${JSON.stringify(value)} should fall back to 3000, not ${port}`,
    );
  }
});
