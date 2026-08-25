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
 * a laptop that happens to export `PORT` and on one that does not. Each test
 * also keeps a copy of that object and compares it afterwards, because reading
 * configuration is meant to be a pure function of its input: the value goes in
 * and a fresh `{ port }` comes out, with nothing written back.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { loadConfig } from '../src/config.js';

test('defaults to port 3000 when PORT is not set', () => {
  // `loadConfig` defaults its parameter to `process.env`, so calling it with
  // no argument at all would read whatever the surrounding shell exports and
  // make this test pass or fail depending on the machine. Handing it an empty
  // object is what makes "PORT is not set" mean exactly that, everywhere.
  //
  // The environment object is kept in a variable and copied *before* the call,
  // and the whole result is kept rather than destructured, because there are
  // two contracts to check here and neither is visible from a lone `port`
  // value: the result is exactly `{ port }`, and the call leaves the object it
  // was handed alone.
  const env = {};
  const before = { ...env };
  const result = loadConfig(env);

  // Asserting the whole result — rather than just its `port` property — pins
  // the documented shape: one property and no others, so a stray extra field
  // fails here. Under `node:assert/strict` the comparison is type-exact as
  // well, which is why the string `'3000'` could never pass for the number.
  assert.deepEqual(
    result,
    { port: 3000 },
    'an unset PORT should yield exactly { port: 3000 }',
  );

  // Configuration is a pure function of its input, so the object handed in has
  // to come back with nothing added, changed or removed. An implementation
  // that wrote the resolved port back into the caller's environment bag would
  // satisfy every assertion about the return value and still be wrong.
  assert.deepEqual(
    env,
    before,
    'an unset PORT should leave the environment object untouched',
  );

  // The default has to be a Number, not the string `'3000'`. An implementation
  // that simply handed back `env.PORT ?? 3000` would return a string for any
  // override, and the HTTP layer would accept that string without complaint —
  // so the numeric type is also stated outright, in the one assertion whose
  // failure message says "number" in as many words.
  assert.equal(typeof result.port, 'number');
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
    const env = { PORT: input };
    const before = { ...env };
    const result = loadConfig(env);

    // Comparing the whole result covers three things in one assertion: the
    // value, the Number type — `node:assert/strict` compares types, so the
    // string `'5555'` cannot pass for `5555` and no separate `typeof` check is
    // needed here — and the shape, so an extra property added on the accepted
    // branch alone fails instead of slipping past a check that only read
    // `port`.
    assert.deepEqual(
      result,
      { port: expected },
      `PORT=${JSON.stringify(input)} should yield exactly { port: ${expected} }`,
    );
    // And the value is read out of the environment, never written back into
    // it: the accepted branch must leave the caller's object exactly as it was.
    assert.deepEqual(
      env,
      before,
      `PORT=${JSON.stringify(input)} should leave the environment object untouched`,
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
    const env = { PORT: value };
    const before = { ...env };
    const result = loadConfig(env);

    // The fallback branch owes the caller the same result shape as the happy
    // path: exactly `{ port: 3000 }` as a Number, which strict deep equality
    // checks in one go — value, type and the absence of any extra property
    // such as a "this value was rejected" flag.
    assert.deepEqual(
      result,
      { port: 3000 },
      `PORT=${JSON.stringify(value)} should fall back to exactly { port: 3000 }, not ${JSON.stringify(result)}`,
    );
    // Rejecting a value is not a licence to correct it in place: the malformed
    // entry stays in the caller's object, unchanged and undeleted.
    assert.deepEqual(
      env,
      before,
      `PORT=${JSON.stringify(value)} should leave the environment object untouched`,
    );
  }

  // The cases above are the ones an operator can actually type, because a real
  // `process.env` value is always a string. These next ones can only arrive
  // through the parameter: `loadConfig` takes its environment as an argument,
  // so the exported contract has to hold for whatever a caller injects — and
  // the grammar is a *string* grammar. Coercing instead of rejecting would let
  // numeric `8080`, `8080n`, `[8080]` and any digit-stringifying object count
  // as valid, and it would make `Object.create(null)` raise
  // `TypeError: Cannot convert object to primitive value` instead of falling
  // back — throwing is the one thing this module promises never to do.
  //
  // Each case is a [label, value] pair, and the message is built from the label
  // alone, because the values themselves resist printing: `JSON.stringify` on a
  // BigInt throws, and interpolating a symbol into a template literal throws
  // too — so the loop above cannot simply be extended with these.
  const nonStringValues = [
    ['the number 8080', 8080],
    ['the BigInt 8080n', 8080n],
    ['the array [8080]', [8080]],
    ['a boxed new Number(8080)', new Number(8080)],
    ['an object whose toString returns "8080"', { toString: () => '8080' }],
    ['the boolean true', true],
    ['a null-prototype object', Object.create(null)],
    ['a symbol', Symbol('8080')],
  ];

  for (const [label, value] of nonStringValues) {
    const env = { PORT: value };
    const before = { ...env };
    const result = loadConfig(env);

    // The same two contracts the string cases above check, for the same
    // reasons: the result is exactly `{ port: 3000 }` with no rejection flag
    // bolted on, and the injected object comes back untouched. Both messages
    // name the case by its label, because these values cannot be interpolated.
    assert.deepEqual(
      result,
      { port: 3000 },
      `PORT set to ${label} should fall back to exactly { port: 3000 }`,
    );
    assert.deepEqual(
      env,
      before,
      `PORT set to ${label} should leave the environment object untouched`,
    );
  }
});
