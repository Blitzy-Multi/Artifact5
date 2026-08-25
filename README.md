# Artifact5 — a Node.js tutorial service

A small Node.js tutorial project that serves exactly one HTTP endpoint, `GET /hello`, which
returns the plain-text body `Hello world` to the calling HTTP client. Every other file in the
repository exists only to make that one endpoint installable, runnable, verifiable, testable and
readable.

Work through the sections below in order. Starting from a fresh clone you will install the
dependencies, start the service, call the endpoint, see `Hello world` come back, and run the test
suite that keeps it honest.

## Prerequisites

**Node.js 24** is the project runtime prerequisite. The verification steps in section 2 also use the
`curl` command-line HTTP client, so make sure a curl executable is available — in Windows PowerShell
5.1, invoke it as `curl.exe` rather than `curl`. The project otherwise runs as plain ES modules with
no build step, transpiler or bundler. Check what you have with:

```bash
node -v
```

It should print a `v24.` version. `npm` ships with Node, so it needs no separate installation.

**Why this section matters.** `package.json` declares the supported Node line in its `engines`
field. npm normally warns rather than enforcing that range, so verify that `node -v` starts with
`v24.` before installing.

**Using a version manager?** [`.nvmrc`](.nvmrc) owns the exact Node version this project pins. POSIX
`nvm` and `fnm` read that file directly, so from the project root run `nvm install` (nvm) or
`fnm use --install-if-missing` (fnm) to install and activate it; if it is already installed,
`nvm use` or `fnm use` is sufficient. On Windows, nvm for Windows does not read `.nvmrc`, so pass the
version it contains as an argument instead — `nvm install <version>` then `nvm use <version>`; `fnm`
reads the file on every platform.

**A note on npm itself.** The npm bundled with Node carries published advisories of its own, none of
which the running service ever loads; the appendix at the end of this document records them and what
they mean for you.

## 1. Install

```bash
npm ci
```

Use `npm ci`, not `npm install`. The two are not interchangeable:

- **`npm ci`** is the clean-clone command. It installs exactly the dependency tree recorded in the
  committed `package-lock.json`, so you get the same packages that the project was tested with, and
  it fails loudly if the lockfile and `package.json` disagree rather than quietly changing either
  one.
- **`npm install`** is the maintainer command, for when you deliberately add or change a dependency
  in `package.json`. It compares the two files rather than always re-resolving: when the lockfile's
  versions satisfy the ranges in `package.json` it installs exactly those, and only when the two
  disagree does it resolve new versions and update the lockfile. Commit the regenerated
  `package-lock.json` alongside your `package.json` change.

## 2. Run the service and call the endpoint

`npm start` runs the server in the **foreground** and keeps it there until you stop it, so this
step needs **two terminals**, both opened in the project root.

**Terminal 1 — start the service:**

```bash
npm start
```

The service then logs this line and waits for requests:

```text
Hello service listening on http://localhost:3000/hello
```

That line is the service telling you which URL to call. Leave this terminal running.

**Terminal 2 — call the endpoint:**

```bash
curl http://localhost:3000/hello
```

These request examples use the curl executable. In Windows PowerShell 5.1, run
`curl.exe http://localhost:3000/hello` (and `curl.exe -i ...`) because `curl` there is an alias for
`Invoke-WebRequest`, which prints a formatted object instead of the raw body and headers.

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
next run. Node closes idle keep-alive connections as part of that, so a browser tab that already has
its response does not hold the shutdown open; the process waits only on a connection whose request is
still unfinished.

## 3. Run the tests

```bash
npm test
```

The suite is **6 tests** and all of them should pass:

- **3 tests** in `test/hello.route.test.js` — the successful response, the exactness of the path,
  and the write verbs.
- **3 tests** in `test/config.test.js` — the default port, an accepted override, and the fallback
  for a malformed value.

To rerun affected tests automatically when a test file or one of its imported dependencies changes:

```bash
npm run test:watch
```

That one also holds the foreground; press **Ctrl-C** to leave it.

There is no third-party test framework to install: the runner is Node's built-in `node:test`, and
assertions come from `node:assert/strict`, so both are already on your machine as part of the
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
| `.gitignore`                | Keeps `node_modules/`, `.env`, npm debug logs, and `coverage/` out of commits                                   |
| `README.md`                 | This document                                                                                                  |
| `src/server.js`             | The bootstrap: loads the configuration, starts listening, logs the URL, and shuts down cleanly on a signal. **The only production file that calls `listen` or binds the configured service port** |
| `src/app.js`                | `createApp()`: builds the Express application and mounts the router. **It never listens** — which is exactly what lets the tests use it |
| `src/config.js`             | `loadConfig()`: reads `PORT` from the environment and validates it against the rules in section 4               |
| `src/routes/hello.route.js` | The endpoint itself: the `/hello` path and the handler that returns `Hello world`                               |
| `test/hello.route.test.js`  | Proves the exact response, exact path matching, and 404 responses for `POST`, `PUT`, `DELETE` and `PATCH` on `/hello` |
| `test/config.test.js`       | Proves the port default, the override, and the fallback                                                         |

**Why `app.js` and `server.js` are two files.** This is the single structural decision that makes
the project testable. `src/app.js` only *describes* the application and hands it back, while
`src/server.js` is the only module that binds the configured service port; Supertest temporarily
uses an ephemeral port for each in-process test request. If the tests had to import a module that
calls `listen`, every test run would leave a real server open on the configured port — so the
factory is kept separate from the bootstrap, and the test suite builds its own app instead.

## 6. One endpoint, and one endpoint only

`/hello` is the only explicitly registered route and is matched exactly. Only `GET /hello` answers
with `Hello world`; none of the near misses below is registered, and neither is any of the four
write verbs, so each of them gets a `404`:

| Request                                        | Response |
| ---------------------------------------------- | -------- |
| `GET /hello`                                   | `200` with `Hello world` |
| `GET /Hello`, `GET /HELLO`, `GET /hEllO`       | `404` — the path is case-sensitive |
| `GET /hello/`                                  | `404` — the trailing slash is not ignored |
| `GET /hello2`, `GET /`                         | `404` — no other path is registered |
| `POST`, `PUT`, `DELETE`, `PATCH` on `/hello`   | `404` — `GET` is the only verb registered |

`test/hello.route.test.js` asserts all of these, so a change that quietly widens the endpoint fails
the suite instead of shipping.

Two requests are answered without being registered, and they are why the table lists paths and write
verbs rather than "everything else". Express derives `HEAD /hello` (a `200` with no body) and
`OPTIONS /hello` (a `200` advertising the methods it works out) from the single `GET` registration —
that is the framework doing its job, not a second endpoint, and neither response is something this
project wrote or asserts. A conditional `GET` is the third request the table does not cover: the
response carries a weak `ETag`, so a client that sends it back as `If-None-Match` — a browser reload,
typically — gets a `304` with no body, which is correct HTTP rather than a failure.

## Appendix: npm's own bundled dependencies

The npm that arrives with Node `24.19.0` is npm `11.17.0`, and npm carries bundled copies of several
packages that currently have published denial-of-service advisories. Everything below is a snapshot
verified on 2026-08-25; advisories against a frozen version only accumulate, so re-check it before
relying on it. `brace-expansion` 5.0.6 has three HIGH ones, reached through the
`glob` → `minimatch` → `brace-expansion` chain npm uses for pattern matching
([GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp),
[GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg),
[GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895)). `tar` 7.5.16 has five of
its own, in the archive parser that `npm ci` and `npm install` use to unpack the package tarballs
they download; one of those five is CRITICAL
([GHSA-23hp-3jrh-7fpw](https://github.com/advisories/GHSA-23hp-3jrh-7fpw)). `ip-address` 10.2.0 and
`undici` 6.26.0 are affected too; npm reaches those through its SOCKS proxy support and its
native-addon build tool.

All of them belong to the npm command-line tool rather than to this service: the running server
never loads that code, and none of those packages appears in this project's own dependency tree.
`npm audit` comes back with `found 0 vulnerabilities` here because it audits this project's
dependencies, not npm's own bundled copies. Nothing declared in a project can replace a copy that
npm bundles inside itself, and no released npm — the newest included — yet bundles fixed versions of
all four; a newer npm does replace some of those bundled copies with fixed ones, so moving to one
reduces the exposure without eliminating it, and the pin in [`.nvmrc`](.nvmrc) stays as it is.
Reaching any of them takes hostile input handed to npm, so install only from package sources you
trust, let `npm ci` hold you to the committed lockfile, and run `npm` commands only against projects
you trust.
