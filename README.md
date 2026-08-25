# Artifact5 — a Node.js tutorial service

A small Node.js tutorial project that serves exactly one HTTP endpoint, `GET /hello`, which
returns the plain-text body `Hello world` to the calling HTTP client. Every other file in the
repository exists only to make that one endpoint installable, runnable, verifiable, testable and
readable.

Work through the sections below in order. Starting from a fresh clone you will install the
dependencies, start the service, call the endpoint, see `Hello world` come back, and run the test
suite that keeps it honest.

## Prerequisites

**Node.js 24** is the only thing you need to install. The project is written as plain ES modules and
runs directly on the Node 24 release line with no build step, no transpiler and no bundler. Check
what you have with:

```bash
node -v
```

It should print a `v24.` version. `npm` ships with Node, so once Node is installed there is nothing
else to set up by hand.

**Why this section matters.** `package.json` declares the supported Node line in its `engines`
field, but npm only *warns* on a mismatch — it does not stop you. An older Node will therefore let
`npm ci` run and then fail later, in ways that look unrelated to the version. Satisfy the
prerequisite first.

**Using a version manager?** [`.nvmrc`](.nvmrc) records the exact version this project was built and
tested against, `24.19.0`. `nvm` and `fnm` read that file directly, so from the project root you can
simply run `nvm use` (or `fnm use`) to switch to it.

## 1. Install

```bash
npm ci
```

Use `npm ci`, not `npm install`. The two are not interchangeable:

- **`npm ci`** is the clean-clone command. It installs exactly the dependency tree recorded in the
  committed `package-lock.json`, so you get the same packages that the project was tested with, and
  it fails loudly if the lockfile and `package.json` disagree rather than quietly changing either
  one.
- **`npm install`** is the maintainer command. It *re-resolves* dependencies and *rewrites* the
  lockfile. You only need it if you deliberately change the dependencies in `package.json` — in
  which case commit the regenerated `package-lock.json` alongside your change.

## 2. Run the service and call the endpoint

`npm start` runs the server in the **foreground** and keeps it there until you stop it, so this
step needs **two terminals**, both opened in the project root.

**Terminal 1 — start the service:**

```bash
npm start
```

It prints exactly one line and then waits for requests:

```text
Hello service listening on http://localhost:3000/hello
```

That line is the service telling you which URL to call. Leave this terminal running.

**Terminal 2 — call the endpoint:**

```bash
curl http://localhost:3000/hello
```

The response body is exactly:

```text
Hello world
```

Those are 11 bytes with **no trailing newline**, so your shell prompt will appear on the same line,
immediately after the `d`. That is expected. If you would like to see the status line and headers
too, ask `curl` for them with `curl -i http://localhost:3000/hello`: the response is `200 OK` with
`Content-Type: text/plain; charset=utf-8` and `Content-Length: 11`.

**Terminal 1 — stop the service:**

Press **Ctrl-C**. The service closes its listener and exits cleanly, which frees the port for the
next run.

## 3. Run the tests

```bash
npm test
```

The suite is **6 tests** and all of them should pass:

- **3 tests** in `test/hello.route.test.js` — the successful response, the exactness of the path,
  and the write verbs.
- **3 tests** in `test/config.test.js` — the default port, an accepted override, and the fallback
  for a malformed value.

To re-run the suite automatically whenever you edit a file:

```bash
npm run test:watch
```

That one also holds the foreground; press **Ctrl-C** to leave it.

There is no test framework to learn here. The runner is Node's own `node:test`, and the assertions
come from Node's own `node:assert/strict`, so both are already on your machine as part of the
runtime. The only extra package the tests use is Supertest, which drives the app over HTTP inside
the test process — it is installed for you by `npm ci` as a development dependency.

## 4. Configuration: the `PORT` override

The service reads a single environment variable, `PORT`, and **defaults to 3000** when it is not
set.

```bash
PORT=5555 npm start
```

The startup line then names the port you chose, and the endpoint answers at
`http://localhost:5555/hello`.

**A note on shells.** `PORT=5555 npm start` is POSIX-shell (bash/zsh) syntax and does not work
verbatim on Windows, where the variable is set as its own step. The equivalents are:

```text
Windows PowerShell:   $env:PORT='5555'; npm start

Windows cmd.exe:      set PORT=5555
                      npm start
```

**What counts as a valid port.** `PORT` is accepted only as a whole decimal integer in the
inclusive range **1–65535** (surrounding whitespace is trimmed for you). Anything else **falls back
to the default of 3000** — the service does not refuse to start, it just uses 3000:

| `PORT` value            | Port used | Why                                        |
| ----------------------- | --------- | ------------------------------------------ |
| unset, or blank         | 3000      | Nothing configured, so the default applies |
| `5555`, `8080`, `65535` | as given  | A whole decimal integer within range       |
| `8080abc`               | 3000      | Trailing characters are not digits         |
| `3.5`                   | 3000      | Not a whole number                         |
| `1e3`                   | 3000      | Exponent notation is not a decimal integer |
| `+8080`, `-1`           | 3000      | A sign is not a digit                      |
| `0`, `65536`            | 3000      | Outside the range 1–65535                  |

**Why you are likely to need this.** Port 3000 is a popular default, so something else on your
machine may already be using it. If `npm start` fails with `EADDRINUSE`, that is what happened, and
the `PORT` override is the fix: pick a free port and start again.

## 5. How the project fits together

Eleven files, each with one job:

| File                        | Role                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `package.json`              | The manifest: project identity, the ES-modules declaration, the `start` / `test` / `test:watch` scripts, the supported Node line, and the two dependencies |
| `package-lock.json`         | The exact resolved dependency tree, committed so that `npm ci` is reproducible for everyone                    |
| `.nvmrc`                    | The exact Node version to install, for `nvm` and `fnm` users                                                   |
| `.gitignore`                | Keeps `node_modules/` and friends out of your commits                                                           |
| `README.md`                 | This document                                                                                                  |
| `src/server.js`             | The bootstrap: loads the configuration, starts listening, logs the URL, and shuts down cleanly on a signal. **The only file that opens a port** |
| `src/app.js`                | `createApp()`: builds the Express application and mounts the router. **It never listens** — which is exactly what lets the tests use it |
| `src/config.js`             | `loadConfig()`: reads `PORT` from the environment and validates it against the rules in section 4               |
| `src/routes/hello.route.js` | The endpoint itself: the `/hello` path and the handler that returns `Hello world`                               |
| `test/hello.route.test.js`  | Proves the endpoint's response, and that no other spelling of the path answers                                  |
| `test/config.test.js`       | Proves the port default, the override, and the fallback                                                         |

**Why `app.js` and `server.js` are two files.** This is the single structural decision that makes
the project testable. `src/app.js` only *describes* the application and hands it back, while
`src/server.js` is the only module that *runs* it by binding a port. If the tests had to import a
module that calls `listen`, every test run would leave a real server open on the configured port —
so the factory is kept separate from the bootstrap, and the test suite builds its own app instead.

## 6. One endpoint, and one endpoint only

`/hello` is the whole public surface, and it is matched exactly. Every other request gets a `404`,
including the near misses:

| Request                                        | Response |
| ---------------------------------------------- | -------- |
| `GET /hello`                                   | `200` with `Hello world` |
| `GET /Hello`, `GET /HELLO`, `GET /hEllO`       | `404` — the path is case-sensitive |
| `GET /hello/`                                  | `404` — the trailing slash is not ignored |
| `GET /hello2`, `GET /`                         | `404` — no other path is registered |
| `POST`, `PUT`, `DELETE`, `PATCH` on `/hello`   | `404` — `GET` is the only verb registered |

`test/hello.route.test.js` asserts all of these, so a change that quietly widens the endpoint fails
the suite instead of shipping.

## 7. If your browser shows `304 Not Modified`

Opening `http://localhost:3000/hello` in a browser and reloading it can show `304 Not Modified`
with an empty body instead of `200` and `Hello world`. That is correct HTTP: the response carries a
weak `ETag`, the browser sends it back as `If-None-Match`, and the service replies "nothing has
changed". It is not a failure. The `curl` commands above send fresh, unconditional requests, so
they always show you the full `200` response.
