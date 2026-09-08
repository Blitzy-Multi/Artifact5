# 1. Executive Summary

## 1.1 Project Overview

`Artifact5` is a Node.js teaching repository serving exactly one HTTP endpoint: `GET /hello` returns the eleven-byte body `Hello world`, and nothing else answers. It targets a learner working from a clean clone: eleven files, an Express 5 service split so configuration, composition and bootstrap each have one reason to change, six tests pinning the response contract, and a tutorial from prerequisites to a verified response. No database, no authentication, no user interface. The value is pedagogical — a minimal, fully verified reference for defining an endpoint on current Node LTS.

## 1.2 Completion Status

```mermaid
pie showData title Project Completion — 87.0%
    "Completed (#5B39F3)" : 50.0
    "Remaining (#FFFFFF)" : 7.5
```

| Metric | Value |
|---|---|
| Total Hours | 57.5 |
| Completed Hours (AI + Manual) | 50.0 |
| Remaining Hours | 7.5 |
| Percent Complete | **87.0%** |

50.0 ÷ 57.5 × 100 = **87.0%**. Scope is 45 items — 41 plan requirement rows plus 4 path-to-production activities — of which 40 are complete, 3 partial and 2 not started.

## 1.3 Key Accomplishments

- ✅ `GET /hello` returns 200, `text/plain; charset=utf-8`, `Content-Length: 11`, `Hello world`.
- ✅ Only the literal lowercase path matches; six near-miss spellings return 404.
- ✅ `GET` is the sole registered verb; the four write verbs return 404, not 405.
- ✅ `X-Powered-By` is removed, so no response advertises the framework.
- ✅ `PORT` is accepted as a whole decimal 1–65535, and otherwise falls back to 3000.
- ✅ A failed bind exits 1 naming the port, the error code and the remedy.
- ✅ Six tests pass, at 100% line, branch and function coverage of every module loaded.
- ✅ `npm ci` installs 88 lockfile-pinned packages; `npm audit` reports zero vulnerabilities.

## 1.4 Critical Unresolved Issues

**5 of the 45 scoped items are not fully closed — 3 partially complete and 2 not started — and one delivered capability is exercised by no test.** The first three rows carry all five; the fourth is the coverage gap.

| Issue | Impact | Owner | ETA |
|---|---|---|---|
| Operating-system delivery of `SIGINT`/`SIGTERM` is unverified, so the documented Ctrl-C stop rests on the handler body rather than an end-to-end run (**3 items**) | The last link is Windows' console-event-to-signal translation, which holds no project code. The handlers themselves close the listener and exit 0 | Maintainer | 1.5h on a Linux or macOS host |
| The npm client bundled with the pinned runtime carries its own internal dependency tree, which `npm audit` does not cover (**1 item**) | Dev-time only. None of those packages is in this project's 88-package tree and the running service loads none of them; `npm audit` reports 0 vulnerabilities across the tree the project declares | Maintainer | 2.0h once a position is chosen; timing depends on an upstream release |
| Release sign-off is outstanding — the tutorial has not been read end to end by a first-time learner on a clean clone, and nothing is tagged or published (**1 item**) | No functional impact; the gate between a verified codebase and a released one | Maintainer | 1.0h |
| The process bootstrap (`src/server.js`) is exercised by no test, so the `listen` call, the startup log, the signal handlers and the sanitized failure message have no automated guard | A change to any of them ships with a green suite. This is a coverage gap rather than one of the 45 scoped items — the plan fixes the suite at six tests and forbids either test file importing the bootstrap | Maintainer | 2.0h, after a decision to relax the six-test suite |

Against your own refinement request — five directives, 20 sub-items — nothing is open: 19 delivered, 1 declined with a reasoned account.

## 1.5 Access Issues

No access issues identified.

| System/Resource | Type of Access | Issue Description | Resolution Status | Owner |
|---|---|---|---|---|
| Repository checkout | Read/write | None — the tree is writable and the working copy is clean | ✅ Verified | — |
| npm registry (`registry.npmjs.org`) | Package download | None — public registry, no authentication, no `.npmrc` required; `npm ci` succeeds unauthenticated | ✅ Verified | — |
| Third-party services and credentials | — | None used. No database, broker, cache, webhook, outbound service or secrets store exists in this project | ✅ Not applicable | — |
| Environment variables | Runtime | `PORT` is the only variable read, and it is optional | ✅ Verified | — |

## 1.6 Recommended Next Steps

1. **[High]** Run both shutdown scenarios on Linux or macOS; confirm exit status 0.
2. **[High]** Settle the npm toolchain position, then re-run install, tests and audit.
3. **[Medium]** Decide whether to relax the six-test suite so the failure path gains a guard.
4. **[Medium]** Read the tutorial as a learner on a clean clone, re-run `npm audit`, then publish.
5. **[Low]** Verify the version-manager prerequisite branch on a host carrying `nvm` and `fnm`.

# 2. Project Hours Breakdown

## 2.1 Completed Work Detail

| Component | Hours | Description |
|---|---:|---|
| Node 24 toolchain and packaging | 3.0 | `package.json` identity, `type: module`, `main`, the three exact scripts, `engines.node ^24.0.0`, two exactly pinned dependencies and no `packageManager` key; `package-lock.json` at lockfileVersion 3 with 88 entries; `.nvmrc` pinning `24.19.0`; `.gitignore` covering `node_modules/`, `.env`, `npm-debug.log*` and `coverage/`, each pattern proven to fire on a real path |
| `/hello` route module and exact-match routing | 2.5 | `src/routes/hello.route.js` — `HELLO_PATH` declared once at `:4`, `Router({ caseSensitive: true, strict: true })` at `:16`, one GET handler at `:18` returning `Hello world` as `text/plain` |
| Express application factory | 1.0 | `src/app.js` — `createApp()` composes the app, disables `x-powered-by` at `:16`, mounts the router prefix-free at `:26` and never listens, so tests can build their own app |
| `PORT` configuration loader | 3.0 | `src/config.js` — `loadConfig(env = process.env)` at `:29` returning `{ port }` under an anchored whole-decimal grammar with an inclusive 1–65535 range and a 3000 fallback, pure with respect to its input, reduced to a single non-string guard at `:35` |
| Process bootstrap, startup log and shutdown | 3.5 | `src/server.js` — the sole module that reads the environment, binds a port at `:49`, logs the callable URL composed from `HELLO_PATH` at `:55`, and registers `SIGINT`/`SIGTERM` handlers at `:58-67` that close the listener then exit 0 |
| Sanitized startup-failure reporting | 1.5 | `src/server.js:22-38` — a failed bind prints only the configured port, the stable error code and a `PORT` remedy for `EADDRINUSE`, then exits 1; no absolute path, stack frame, dependency internal or runtime-version banner |
| Route contract test suite | 2.5 | `test/hello.route.test.js` — three tests pinning the successful response, six near-miss paths and four unregistered write verbs, driven through Supertest against a factory-built app |
| Configuration test suite | 3.5 | `test/config.test.js` — three tests over 22 input cases behind one purity helper, asserting the exact result shape and non-mutation of the injected environment on every branch |
| Learner tutorial | 6.5 | `README.md`, 234 lines across nine sections — prerequisites, install, the two-terminal run-and-verify workflow, tests, the `PORT` semantics table, an eleven-row per-file walkthrough, the one-endpoint boundary table with the framework-derived responses explained, and an undated appendix on what `npm audit` covers |
| Runtime HTTP contract verification | 5.0 | Live sweeps across several ports: byte-level body reads, header assertions, path and method matrices, repetition and concurrency batches, and the conditional-request path |
| Configuration and observability verification | 3.0 | The full grammar matrix exercised against the real loader, ambient-environment isolation proven with a recording proxy, startup-line exactness, and the default / override / malformed-fallback port scenarios |
| Dependency and supply-chain verification | 4.0 | 88/88 lockfile closure with registry, integrity and provenance checks; manifest and ignore-rule audits proven by execution rather than inspection; information-exposure probes across responses and process output |
| Documentation verification | 3.0 | Every command in the tutorial executed in the order the file presents it, links resolved, the `PORT` table checked row by row against the implementation, and each remaining claim re-established against the code |
| Test-suite quality assurance | 3.5 | Per-file isolation, repeatability across fresh processes, watch-mode behaviour for both documented triggers, ambient-environment isolation, and fault-injection proofs that each assertion fails exactly the test that pins it |
| Source legibility and comment accuracy | 3.0 | The six modules brought to sparse, accurate why-notes bounded by what the code establishes, so a learner reads explanation rather than restatement or overclaim |
| Completeness and rule-compliance accounting | 1.5 | Independent recount of the eleven-file tree, six tests, single route, three Express registrations, one log call, one listen call and eleven walkthrough rows against the agreed plan and the product rule |
| **Total** | **50.0** | |

## 2.2 Remaining Work Detail

| Category | Hours | Priority |
|---|---:|---|
| Confirm the shutdown path on a POSIX host — Ctrl-C and `SIGTERM`, both expected to exit 0 | 1.5 | High |
| Settle the npm toolchain position: choose whether to adopt a fixed bundle or accept the current one, re-scan the bundled tree, and re-run install, tests and audit | 2.0 | High |
| Automated regression guard for the sanitized startup-failure path (needs a prior decision to relax the fixed six-test suite) | 2.0 | Medium |
| Release sign-off: read the tutorial as a first-time learner on a clean clone, re-run `npm audit` for decay, then tag or publish | 1.0 | Medium |
| Verify the version-manager prerequisite branch on a host carrying POSIX `nvm`, `fnm` and `nvm` for Windows | 1.0 | Low |
| **Total** | **7.5** | |

## 2.3 Hours Reconciliation

| Check | Value |
|---|---|
| Section 2.1 completed total | 50.0 |
| Section 2.2 remaining total | 7.5 |
| Sum (must equal Total Hours in Section 1.2) | 57.5 ✅ |
| Completion (50.0 ÷ 57.5 × 100) | 87.0% ✅ |
| Section 7 pie chart values | Completed 50.0 / Remaining 7.5 ✅ |

Confidence is high on every completed row — each maps to an artefact in the tree and to a result observed at runtime — and high on three of the five remaining rows, each a bounded single-session task. It is medium on the toolchain row, whose timing depends on an upstream release nobody here controls (the 2.0 hours is the decision and re-scan, not the wait), and medium on the regression-guard row, which cannot start until the six-test constraint is deliberately relaxed.

# 3. Test Results

Every figure below comes from a run of this project's own suite on Node v24.19.0 with npm 11.17.0. `npm test` invokes the bare `node --test` form the manifest declares, which discovers `test/**/*.test.js` on its own. Coverage is from the runner's own instrumentation (`node --test --experimental-test-coverage`).

| Area / Category | Framework | Tests | Passed | Failed | Coverage | What This Proves |
|---|---|---:|---:|---:|---|---|
| `GET /hello` response contract | `node:test` + Supertest | 1 | 1 | 0 | 100% of `src/routes/hello.route.js` | The endpoint answers 200 with `text/plain; charset=utf-8`, `Content-Length: 11`, the exact bytes `Hello world`, and no `X-Powered-By` |
| Path exactness | `node:test` + Supertest | 1 | 1 | 0 | included above | Six near-miss spellings — `/Hello`, `/HELLO`, `/hEllO`, `/hello/`, `/hello2`, `/` — reach nothing, so the endpoint cannot be hit by accident |
| Method surface | `node:test` + Supertest | 1 | 1 | 0 | included above | `POST`, `PUT`, `DELETE` and `PATCH` on `/hello` are unregistered and answer 404, so no write verb is silently accepted |
| `PORT` default | `node:test` + `node:assert/strict` | 1 | 1 | 0 | 100% of `src/config.js` | An empty environment yields exactly `{ port: 3000 }` as a number, so the tutorial starts with no configuration |
| `PORT` accepted values | `node:test` + `node:assert/strict` | 1 | 1 | 0 | included above | Whole decimals inside 1–65535 are honoured, including both boundaries and whitespace-padded input, and the injected environment is not mutated |
| `PORT` malformed and non-string fallback | `node:test` + `node:assert/strict` | 1 | 1 | 0 | included above | Trailing garbage, fractions, exponents, signs, zero, out-of-range values and eight non-string types all select 3000 instead of binding something unintended |
| Application factory (exercised by the route tests) | `node:test` + Supertest | — | — | — | 100% of `src/app.js` | `createApp()` yields a listener-free app, so the suite never binds the configured port |
| **Suite total** | `node:test` | **6** | **6** | **0** | **100% line / 100% branch / 100% function across every module loaded** | The whole agreed HTTP and configuration contract is pinned and green |

The three configuration tests span 22 asserted input cases behind a single purity helper, so every case also proves the loader leaves the environment object it was handed untouched. Per-file runs confirm the split: `test/config.test.js` 3 of 3, `test/hello.route.test.js` 3 of 3. Each assertion was shown to bite — substituting a plain `Router()`, changing the response string, or relaxing the port grammar to a bare integer parse each fails exactly the one test that pins it. `node --check` exits 0 on all six JavaScript files, `npm ci` installs 88 packages and `npm audit` reports zero vulnerabilities.

### Not Covered

These are delivered capabilities that no test exercises. Each needs a human check before release.

- **The process bootstrap (`src/server.js`) is loaded by no test.** It is absent from the coverage output entirely, because neither test file may import it — that separation is what keeps the suite from binding the configured port. Everything in it is therefore unguarded by `npm test`: the `listen` call, the startup log, the signal handlers and the failure path. Verify it by starting and stopping the service, and by starting it twice on one port.
- **The sanitized startup-failure message has no automated guard.** A change to a raw rethrow — which would leak the checkout path, a stack and the runtime version — would pass the suite. Check the two-line stderr and exit status 1 by hand after any edit to the bootstrap.
- **`SIGINT` and `SIGTERM` handling is not asserted by any test.** The handlers close the listener and exit 0, but no test drives them; a manual Ctrl-C and a manual `kill` are the only checks.
- **`loadConfig(null)` and `loadConfig(undefined)` are not among the suite's cases.** Both correctly return `{ port: 3000 }` without throwing, which was confirmed against the real loader, but nothing in `npm test` would notice if that changed.
- **Framework-derived responses are deliberately unasserted.** `HEAD /hello` and `OPTIONS /hello` return 200 from the single GET registration, and a conditional request returns 304 from the weak ETag `res.send()` attaches. All three are correct and intentionally left unpinned so a framework upgrade cannot fail the suite over behaviour the project never specified.
- **The `UNKNOWN_ERROR_CODE` fallback in the failure reporter is unreachable in practice.** Every listen error the runtime produces carries a code, so no real failure selects that branch; it is a defensive default rather than dead code.
- **Documentation has no test.** The tutorial's claims were checked by executing its commands, but nothing in the suite compares the document to the code, so an implementation change can leave the prose stale.

# 4. Runtime Validation & UI Verification

The service was started and driven for real. Every line below reports what was observed against a running process, not what the code appears to do.

- ✅ **Start-up** — `npm start` binds the configured port and writes exactly one line, `Hello service listening on http://localhost:<port>/hello`, with zero bytes on stderr. Confirmed on the default port and on explicit overrides.
- ✅ **`GET /hello`** — 200, `Content-Type: text/plain; charset=utf-8`, `Content-Length: 11`, body read from file as 11 bytes, hex `48656c6c6f20776f726c64`, no trailing newline. The full header set is `Content-Type`, `Content-Length`, `ETag`, `Date`, `Connection`, `Keep-Alive` — no `X-Powered-By` and no `Server`.
- ✅ **Path exactness** — `/Hello`, `/HELLO`, `/hEllO`, `/hello/`, `/hello2` and `/` each returned 404 with zero redirects; `/health` and `/api/hello` also 404, confirming no second route slipped in, with `GET /hello` returning 200 as the positive control in the same sweep.
- ✅ **Method surface** — `POST`, `PUT`, `DELETE` and `PATCH` on `/hello` each returned 404, never 405. `HEAD` returned 200 with a zero-length body and `OPTIONS` returned 200 with `Allow: GET, HEAD`, both from the framework's own handling of the single GET registration.
- ✅ **`PORT` override** — an explicit port was logged in the startup line and served the correct body there.
- ✅ **Malformed `PORT` fallback** — `8080abc` produced a start on 3000, served the correct body there, and left port 8080 unbound (connection refused).
- ✅ **Occupied-port failure** — a second start on a held port exited 1, wrote zero bytes to stdout so no listening URL appeared, and wrote exactly `Failed to start the hello service on port <port>: EADDRINUSE` followed by the `PORT` remedy. No absolute path, stack frame, dependency internal or runtime-version banner.
- ✅ **Conditional request** — a replay carrying the saved ETag returned 304 with zero body bytes, which is correct HTTP for the weak ETag `res.send()` attaches.
- ✅ **Hostile input** — query strings, request bodies and headers carrying script, null-byte, traversal and CRLF payloads were answered with the same constant and reflected nothing into the body, the headers or the process output; percent-encoded, traversal-shaped and over-long paths returned 4xx with no stack trace and no filesystem path. Process output after the whole sweep was still the single startup line, so the service logs no requests.
- ⚠ **Shutdown** — the handlers close the listener and exit 0, and the port is released and immediately rebindable. Operating-system delivery of `SIGINT` and `SIGTERM` was **not exercised**: Windows maps process termination for both to a forced kill, so no handler is entered, and no interactive console was attached for a real Ctrl-C. One run on Linux or macOS closes this.

**External integrations: none exist.** No database, broker, cache, queue, webhook, outbound service or secrets store appears anywhere in this project, so there is no untested integration surface and no credential to provision.

**UI verification: not applicable.** This project renders nothing — no HTML, templates, stylesheets or client-side JavaScript. Its human-facing surfaces are the response body, the startup log line and the tutorial text, all covered above. No screenshots exist or are needed.

# 5. Compliance & Quality Review

## 5.1 Compliance Matrix

Each row is a deliverable from the agreed plan and the state it stands in now.

| Deliverable | Benchmark | Status | Evidence |
|---|---|---|---|
| Exactly one endpoint at the literal `/hello` | Functional correctness | ✅ PASS | `src/routes/hello.route.js:4,18`; eight negative path probes all 404 |
| Byte-exact `Hello world` response, correct media type, no framework banner | Contract exactness | ✅ PASS | 11 bytes, hex `48656c6c6f20776f726c64`, no trailing newline, `Content-Length: 11`, `text/plain; charset=utf-8`; `app.disable('x-powered-by')` at `src/app.js:16` |
| Case-sensitive, strict path matching | Contract exactness | ✅ PASS | `Router({ caseSensitive: true, strict: true })` at `src/routes/hello.route.js:16`; six spellings 404 |
| `PORT` configuration grammar and fallback | Input validation | ✅ PASS | `src/config.js:14,29-50`; 100% branch coverage; 22 input cases asserted |
| Factory / bootstrap separation | Testability | ✅ PASS | No `listen` in `src/app.js`; no test imports `src/server.js`; zero server handles after two `createApp()` calls |
| Startup observability | Operability | ✅ PASS | One log line composed from the imported path constant, `src/server.js:55`; stderr empty on every success path |
| Startup-failure handling | Information exposure | ✅ PASS | `src/server.js:22-38` prints port and error code only; exit status 1; stdout empty |
| Graceful shutdown handlers | Lifecycle | ⚠ PARTIAL | `src/server.js:58-67` registers exactly `SIGINT` and `SIGTERM` and closes before exit; operating-system delivery unverified — see Section 1.4 |
| Six-test contract suite | Test adequacy | ✅ PASS | 6 of 6 pass; 100% line, branch and function coverage of every module loaded; each assertion shown to fail under a targeted mutation |
| Reproducible clean-clone install | Supply chain | ✅ PASS | `npm ci` adds 88 lockfile-pinned packages, every entry carrying an integrity hash and a public-registry resolution; `npm audit` reports 0 vulnerabilities |
| Learner tutorial completeness | Documentation | ✅ PASS | `README.md`, 234 lines, 9 sections, 11-row walkthrough; every command executed in document order; no version literal and no dated claim anywhere in the file |
| Scope discipline (no extra route, build step, lint tooling, middleware or deployment machinery) | Plan adherence | ✅ PASS | 11 tracked deliverable files; no TODO, stub or placeholder anywhere in the tree |

## 5.2 AAP & Rule Divergences and Gaps

| What the AAP/Rule Required | What Was Delivered Instead | Why It Diverged | Impact | Remediation |
|---|---|---|---|---|
| "All eleven files are created or updated together; the work is not split" | Seven of the eleven files were updated and four — `package.json`, `package-lock.json`, `.gitignore` and `.nvmrc` — were left byte-identical | **Sanctioned** — you instructed that only modified files be regenerated | None; the eleven-file deliverable and every contract value are intact | None needed |
| The README's content is enumerated, and it must not restate package versions | The document adds a 13-line appendix on what `npm audit` covers, a curl prerequisite with the PowerShell `curl.exe` form, and Windows `PORT` equivalents beside the POSIX form | A learner running the documented verification commands on Windows needs the shell form, and needs the audit boundary explained | ~13 extra lines a learner reads past; no version literal and no dated claim remains | None needed |
| `src/config.js` should coerce the raw `PORT` value to a string, then trim it | It rejects any non-string value outright and trims only a genuine string (`src/config.js:35`) | Coercion both widened the agreed grammar and could itself throw, breaking the promise that a malformed value never refuses startup | None negative — behaviour is identical for every string input | None needed |
| Do not add error handling around the `listen` call | The `listen` callback inspects its error argument and prints a sanitized failure (`src/server.js:49-56`) | The framework registers that callback as the server's one-shot error listener, so the failure was never unhandled as assumed | None negative — the loud, non-zero `EADDRINUSE` failure the plan describes is what a reader sees | None needed |
| The suite is fixed at six tests and neither test file may import the bootstrap | No automated test pins the sanitized failure message | Such a test must spawn a child process and bind a port, which breaks both constraints | A change to a raw rethrow would pass `npm test` | Add a child-process guard (2.2, row 3) |
| The prerequisites paragraph should name the exact Node patch version | It delegates to `.nvmrc` by link, and the literal appears nowhere in the tutorial | Removing a hand-maintained copy of a value `.nvmrc` already owns | None — a version-manager user reads the single source of truth | None needed |
| Scenario A ends by stopping the service with Ctrl-C, and Scenario D sends `SIGTERM`; both must exit 0 | Handler behaviour proven in-process; operating-system signal delivery not exercised | Windows maps termination for both signals to a forced kill, and no interactive console was attached | The final link — Windows' console-event-to-signal translation, which holds no project code — is unverified | One run on Linux or macOS (2.2, row 1) |
| The plan records that no user-specified rules were provided | The rules document holds one rule, with a garbled title echoing the product requirement and an empty body | A pre-existing discrepancy between the plan's assertion and the rules document | None — the rule asks for nothing beyond the one-endpoint contract the plan already encodes | None needed |

**A subset of the eleven files was regenerated — sanctioned.** The plan is explicit that all eleven files are written together and that the work is not split. Your refinement instruction said the opposite: only modified files are regenerated. That instruction governs, so `README.md` and the six JavaScript files carry changes while the four root configuration files were deliberately left untouched — each proven byte-identical to its previous blob rather than assumed so, and each independently re-audited (22 manifest field checks, lockfile structure and integrity, every `.gitignore` pattern proven to fire on a real path, `.nvmrc` read at the byte level). Nothing in the deliverable moved: `git ls-files` still returns the same eleven paths. There is nothing to close.

**README content beyond the prescribed set.** The plan enumerates the tutorial's sections and forbids restating package versions, because a hand-maintained copy of `express@5.2.1` or `supertest@7.2.2` would drift from the manifest. The delivered document adds an appendix explaining that `npm audit` covers the tree this project declares rather than the separate tree npm carries inside itself, plus a curl prerequisite and Windows shell equivalents. The drift the rule guards against cannot occur: the file contains zero occurrences of `5.2.1`, `7.2.2`, `^24.0.0`, `24.19.0`, `11.17.0`, `express@` or `supertest@`, and no date literal, so nothing in it goes stale. It costs a learner three lines before the install command.

**Non-string `PORT` values are rejected rather than coerced.** The plan's per-file specification for the configuration loader asked for the raw value to be coerced to a string and trimmed. The plan proper defines the accept grammar over a *trimmed decimal string* in 1–65535 and guarantees that a malformed value never throws, exits or refuses startup. `String()` breaks both: it admits numbers, BigInts, arrays and boxed values as ports, and throws outright on a Symbol. The single guard at `src/config.js:35` returns the default for anything that is not a string, so the accept set narrows to exactly what the plan documents and the no-throw promise becomes unconditional. Every string input behaves identically, across 22 asserted cases and a wider runtime matrix.

**The bind failure is handled inside the framework's own callback.** The plan's specification for the bootstrap forbade adding a `server.on('error')` listener or wrapping `listen` in `try`/`catch`, on the premise that an unhandled `EADDRINUSE` was already the documented behaviour. That premise does not hold on this framework version, which wraps the trailing `listen` callback in `once()` and registers it as the server's one-shot error listener — so the failure arrives at the project's own callback. The delivered code inspects it and reports it (`src/server.js:49-56`), honouring both literal prohibitions: the tree contains no `server.on('error')` and no `try`/`catch`. The message names only the port, the stable error code and the `PORT` remedy.

**No automated guard on the failure path.** The plan fixes the suite at exactly six tests in two files and requires that neither imports the bootstrap, which is what stops the suite binding the configured port. A test for the sanitized failure message must spawn a child process and occupy a port, so it cannot exist under those constraints. The consequence is concrete: `npm test` would stay green if someone replaced the reporter with a raw rethrow, opening an information exposure. Until the six-test ceiling is relaxed, treat any edit to `src/server.js` as needing a manual check — start the service twice on one port and confirm exit status 1 with the two-line message.

**The exact Node version is named once, in the file that owns it.** The plan's specification for the tutorial asked the prerequisites paragraph to note that `.nvmrc` records the exact version, with the literal in parentheses. The paragraph instead states that `.nvmrc` owns the exact version and links to it, and the literal `24.19.0` appears nowhere in the document at all. The prerequisite itself is still stated — the tutorial names Node.js 24 as the requirement and tells a reader to confirm `node -v` starts with `v24.` — and the file that owns the patch version is one click away. This removes a hand-maintained duplicate rather than a fact, and there is nothing for a human to do.

**Shutdown was not driven by a real signal.** Scenario A closes with a Ctrl-C and Scenario D sends `SIGTERM`, each expected to close the listener and exit 0. On Windows, termination for either signal maps to a forced kill that never enters a JavaScript handler — shown with a child process whose handler never ran — and no interactive console was attached for a genuine Ctrl-C. The handlers were driven directly instead: each closes the listener and exits 0 within a millisecond or two, stays correct when signalled twice, and is unaffected by an idle keep-alive connection. Unverified is Windows' translation of a console event into a signal, which holds no project code.

**The rules document and the plan disagree about whether rules exist.** The plan states that no user-specified rules were provided and that enterprise best practice therefore applies. The rules document returns exactly one rule, whose title is a truncated, duplicated echo of the product requirement and whose body is empty. Reading the document as authoritative on rule existence, the rule's only enforceable content is what the plan already encodes: a Node.js tutorial project with one endpoint returning `Hello world`. The delivered tree satisfies it — the literal path appears throughout, the body is exactly `Hello world` and never `Hello World!`, and one endpoint is registered. Recorded so the plan's statement is not read as authoritative alone.

# 6. Risk Assessment

Forward-looking only: what could still go wrong with this codebase in the hands of the next person to change or run it.

| Risk | Category | Severity | Probability | Mitigation | Status |
|---|---|---|---|---|---|
| The process bootstrap is loaded by no test, so a change to the `listen` call, the startup log, the failure path or the signal handlers ships green | Technical | Medium | Medium | Treat every `src/server.js` edit as needing a manual start, stop and occupied-port check; add a child-process guard once the six-test ceiling is relaxed | 🔶 Open |
| Path exactness depends on two options on the `Router` constructor; the equivalent app-level settings do not reach a router mounted with `app.use()`, so moving the route or dropping an option would silently widen the endpoint | Technical | Medium | Low | The exactness test pins all six near-miss spellings and was shown to fail under exactly that substitution | ✅ Mitigated |
| A plausible "improvement" — answering write verbs with 405, or relaxing the port grammar to a bare integer parse — would break the agreed contract | Technical | Low | Low | Both test files pin the current behaviour, and each mutation was shown to fail exactly the one test that covers it | ✅ Mitigated |
| The npm client bundled with the pinned runtime carries its own internal dependency tree, which `npm audit` does not inspect | Security | Medium | Low | None of those packages is in this project's tree and the running service loads none of them; installs are held to the committed lockfile with per-entry integrity hashes; the tutorial explains the boundary | 🔶 Open (upstream) |
| The endpoint is intentionally public and unauthenticated, with no transport security, rate limiting or security headers beyond the removed framework banner | Security | Medium | Low | Correct for a localhost tutorial and in scope as such; the bind host is deliberately not configurable, so exposing it beyond localhost requires a code change | ✅ Accepted by design |
| `npm audit` state decays: a fresh advisory against the pinned 88-package tree would appear with no change made here | Operational | Low | Medium | Re-run `npm audit` before release and close any finding with `npm audit fix` — never `--force`, which can move the two pinned direct dependencies | 🔶 Open |
| After the listener closes, a connection whose request never finished is waited on with no deadline, so a stop can appear to hang | Operational | Low | Low | Measured: an idle keep-alive connection completes shutdown in about a millisecond; only an unfinished request holds it, and the tutorial states that no shutdown deadline is configured. Compensating shutdown machinery is outside the agreed scope | ✅ Accepted |
| The shutdown path's final link — the operating system's translation of a console event into a signal — is unverified, so the documented Ctrl-C behaviour rests on the handler body rather than an end-to-end run | Integration | Low | Low | One run of the two shutdown scenarios on Linux or macOS; no code change expected | 🔶 Open |

Two absences are worth stating so they are not mistaken for gaps. There is no database, broker, cache, queue, webhook, outbound service or secrets store anywhere in this project, so there is no untested integration surface and no credential to provision. And the project reads exactly one environment variable, `PORT`, which is optional — no other variable present on a host has any effect on it, confirmed by scanning the tree for every name it could read.

# 7. Visual Project Status

Completed work is shown in Blitzy Dark Blue (`#5B39F3`); remaining work in White (`#FFFFFF`).

```mermaid
pie showData title Project Hours Breakdown — 87.0% Complete
    "Completed Work" : 50.0
    "Remaining Work" : 7.5
```

Remaining hours by priority band, summing to the 7.5 hours in Sections 1.2 and 2.2:

```mermaid
pie showData title Remaining 7.5 Hours by Priority
    "High" : 3.5
    "Medium" : 3.0
    "Low" : 1.0
```

Requirement status across the 45 scoped items — 41 plan requirement rows plus 4 path-to-production activities:

```mermaid
pie showData title Scoped Item Status (45 items)
    "Completed" : 40
    "Partially Completed" : 3
    "Not Started" : 2
```

# 8. Summary & Recommendations

The project asked for one thing and got it. `GET /hello` returns the eleven bytes `Hello world` as `text/plain; charset=utf-8`, and only that path, spelled exactly that way, with exactly that verb, reaches anything at all. Around that endpoint sits the structure a learner needs to understand it: a configuration loader that is a pure function of its input, an application factory that never binds a port, a bootstrap that is the only module doing so, six tests that pin the contract, and a 234-line tutorial that takes a reader from prerequisites to a verified response. Eleven files, 1,819 lines added across seventeen commits, no build step, no placeholder and no stub anywhere in the tree.

Measured against the agreed plan, the project is **87.0% complete** — 50.0 of 57.5 hours. Forty of the forty-five scoped items are finished, three are partial and two have not started. Everything the plan asked to be *built* exists and works; what remains is validation closure and release preparation. The suite passes 6 of 6 with 100% line, branch and function coverage of every module it loads, a clean clone installs 88 lockfile-pinned packages with zero advisories in the project's own tree, and the whole response contract was driven against a live process: byte-level body checks, eight negative paths, four unregistered verbs, the override and fallback port scenarios, the conditional-request path, and the occupied-port failure exiting 1 with a message that names the port and the remedy and nothing about the machine.

What a reader is told is as accurate as what the service does, which matters more here than in most codebases because the explanation *is* the product. The tutorial's shutdown paragraph states the condition the exit actually waits on and says plainly that no shutdown deadline is configured. Its appendix explains the boundary of `npm audit` in terms that hold indefinitely, carrying no date and no version literal, so the manifest and `.nvmrc` remain the only places a version is written anywhere in the repository. Every explanatory comment across the six modules is bounded by what the code establishes rather than what it appears to imply — the configuration loader carries one non-string guard and one reason for it, and the configuration tests express their purity invariant once, in a helper every case runs through, rather than four times over.

Two things stand between this and a signed-off release. The first is a single validation step: the shutdown handlers close the listener and exit 0 when driven directly, but no real `SIGINT` or `SIGTERM` has ever reached them, because Windows maps both to a forced kill and attaches no console. One run on Linux or macOS closes it, and no code change is expected. The second is the npm client itself, whose own bundled dependency tree sits outside what `npm audit` inspects and outside this project's lockfile. None of it is in the project's dependency tree, the running service never loads it, and nothing a project declares can replace a copy npm carries internally — so the decision, to adopt a fixed bundle when one appears or to accept the current position, belongs to a human. The gap worth naming beyond those two is narrower and more likely to bite: the bootstrap module is loaded by no test at all, by design, since importing it would bind the configured port, with the effect that `npm test` guards nothing about the startup log, the signal handlers or the sanitized failure message. Until the fixed six-test suite is deliberately relaxed so a child-process guard can be added, any edit to `src/server.js` needs a manual start, stop and occupied-port check.

**Production readiness for the intended scope: ready, pending the four open items in Section 1.4.** The success metrics are already met — one endpoint, byte-exact response, exact path and method matching, a reproducible install, zero advisories in the project's own dependency closure, and a tutorial whose every command was executed in the order it presents them. The critical path to release is short: run the two shutdown scenarios on a POSIX host, take the toolchain decision, read the tutorial once as a learner, and publish. That is 7.5 hours of human work, of which 3.5 is the high-priority pair. No part of it requires rewriting anything that was delivered.

# 9. Development Guide

Every command below was executed against this repository. Windows PowerShell 5.1 forms are given where they differ from POSIX, because the two are not interchangeable.

### System prerequisites

- **Node.js 24** — the repository pins `24.19.0` in `.nvmrc`, and `package.json` declares `"engines": { "node": "^24.0.0" }`. npm warns rather than blocking on an engine mismatch, so check the version yourself.
- **npm 11** — arrives with Node; no separate install. The committed lockfile was generated by npm 11, so do not upgrade to a different major just to install this project.
- **A curl executable** — needed only for the verification steps. On Windows PowerShell, `curl` is an alias for `Invoke-WebRequest`, which prints a formatted object instead of raw bytes; use `curl.exe`.
- **Nothing else.** No database, broker, cache server, container runtime, reverse proxy or TLS termination is required or used. There is no build step and no `build` script — the project is plain ESM and runs directly.

```bash
node -v      # expect v24.19.0
npm -v       # expect 11.17.0
```

### Environment setup

No virtual environment applies. Isolation is the per-checkout `node_modules/`, which is git-ignored and is not shared between clones — every clone runs its own install.

`PORT` is the only variable this project reads, and it is optional.

| Variable | Required | Default | Accepted values | Behaviour otherwise |
|---|---|---|---|---|
| `PORT` | No | `3000` | A whole decimal integer, 1–65535, optionally surrounded by whitespace | Anything else — trailing garbage, a fraction, exponent notation, a sign, `0`, `65536`, an empty string, or any non-string value — falls back to `3000` |

### Dependency installation

```bash
cd <repository root>
npm ci
```

Expect `added 88 packages, and audited 89 packages` and `found 0 vulnerabilities`. Use `npm ci` from a clean clone: it installs exactly what the lockfile records and fails rather than quietly changing it. Use `npm install` only when you are deliberately changing `package.json` dependencies, and commit the regenerated lockfile alongside it.

### Application startup

`npm start` holds the foreground, so run it in one terminal and verify from another.

```bash
# POSIX shells
npm start                 # default port 3000
PORT=5555 npm start       # explicit port
```

```powershell
# Windows PowerShell 5.1 — the POSIX inline-variable form is invalid here
npm start
$env:PORT='5555'; npm start
```

Expect exactly one line on stdout and nothing on stderr:

```text
Hello service listening on http://localhost:3000/hello
```

Stop it with Ctrl-C. The listener closes before the process exits; an idle keep-alive connection does not hold shutdown open.

### Verification

```bash
# Status, media type, length, and the absence of a framework banner
curl.exe -sS -i http://localhost:3000/hello

# Body bytes — write to a file first; a shell pipeline can corrupt the count
curl.exe -sS -o body.bin http://localhost:3000/hello
od -c body.bin            # expect 11 bytes ending at octal 0000013, no trailing newline

# Path exactness — every one of these must be 404
curl.exe -sS -o /dev/null -w '%{http_code}\n' http://localhost:3000/Hello
curl.exe -sS -o /dev/null -w '%{http_code}\n' http://localhost:3000/hello/
curl.exe -sS -o /dev/null -w '%{http_code}\n' http://localhost:3000/

# Unregistered verbs — every one of these must be 404
curl.exe -sS -o /dev/null -w '%{http_code}\n' -X POST http://localhost:3000/hello

# Conditional request — expect 304 with a zero-length body
curl.exe -sS -o /dev/null --etag-save etag.txt http://localhost:3000/hello
curl.exe -sS -o /dev/null -w '%{http_code}\n' --etag-compare etag.txt http://localhost:3000/hello
```

Observed on a running service: `HTTP/1.1 200 OK`, `Content-Type: text/plain; charset=utf-8`, `Content-Length: 11`, no `X-Powered-By`, body `Hello world`. `/Hello`, `/HELLO`, `/hEllO`, `/hello/`, `/hello2`, `/`, `/health` and `/api/hello` all return 404; `POST`, `PUT`, `DELETE` and `PATCH` on `/hello` all return 404; `HEAD` returns 200 with an empty body and `OPTIONS` returns 200 with `Allow: GET, HEAD`.

Use the `--etag-save` / `--etag-compare` pair rather than passing `If-None-Match` inline: the quoted ETag value does not survive Windows shell quoting, and the request then arrives unconditional and returns 200. On Windows also use `-o NUL` in place of `-o /dev/null`, and `od.exe` from the Git distribution.

### Running the tests

```bash
npm test                  # bare `node --test`; expect tests 6 / pass 6 / fail 0
node --test test/config.test.js        # 3 of 3
node --test test/hello.route.test.js   # 3 of 3
node --test --experimental-test-coverage   # 100% line / branch / function on every module loaded
node --check src/server.js # exit 0, no output; repeat for each JavaScript file
npm audit                 # expect: found 0 vulnerabilities
```

Two cautions. Do not change the test script to `node --test test/` — the trailing-directory form fails module resolution on this runtime; the bare form discovers `test/**/*.test.js` correctly. And never run `npm run test:watch` in a foreground automation step: it holds the terminal and never returns.

### Example usage

```bash
$ npm start &
Hello service listening on http://localhost:3000/hello

$ curl.exe -sS http://localhost:3000/hello
Hello world

$ curl.exe -sS -o /dev/null -w '%{http_code}\n' http://localhost:3000/Hello
404
```

### Troubleshooting

| Symptom | Cause | Resolution |
|---|---|---|
| `Failed to start the hello service on port 3000: EADDRINUSE` and exit status 1 | Something already holds the port | Start on a free port: `PORT=5555 npm start`, or `$env:PORT='5555'; npm start` in PowerShell. The message names the remedy itself |
| The service starts on 3000 despite an explicit `PORT` | The value did not match the accepted grammar, so it fell back to the default | Pass a whole decimal integer in 1–65535. `8080abc`, `3.5`, `1e3`, `+8080`, `-1`, `0` and `65536` all fall back |
| `Failed to start … : EACCES` | The port is in a range the operating system reserves or excludes | Choose a different port above 1024 that is not OS-excluded |
| `curl` prints a formatted object instead of `Hello world` | On Windows PowerShell, `curl` is an alias for `Invoke-WebRequest` | Use `curl.exe` |
| A byte count reads as more than 11 | The shell pipeline injected a byte-order mark and a line ending | Write the response to a file with `-o`, then inspect the file |
| A conditional request returns 200 instead of 304 | The inline `If-None-Match` value lost its quotes to the shell | Use `--etag-save` then `--etag-compare` |
| A browser reload shows `304 Not Modified` | The response carries a weak ETag, so a conditional request is answered correctly with 304 and no body | Nothing to fix. A fresh unconditional request still returns 200 and the full body |
| `Cannot find module …\src\server.js` | `npm start` was run somewhere other than the repository root | `cd` to the root — the script path is relative to it |
| `ERR_MODULE_NOT_FOUND` after adding a file | A relative import was written without its `.js` extension | This project is ESM: every relative specifier needs the explicit extension |
| `ERR_MODULE_NOT_FOUND: Cannot find package 'supertest'` when running the tests | `node_modules/` is git-ignored and does not arrive with a clone | Run `npm ci` first |
| `git lfs pre-push --dry-run` appears to hang | The hook reads refs from standard input | Run it with stdin closed |

# 10. Appendices

## A. Command Reference

| Purpose | Command | Expected result |
|---|---|---|
| Check the runtime | `node -v` | `v24.19.0` |
| Check the package client | `npm -v` | `11.17.0` |
| Install from a clean clone | `npm ci` | `added 88 packages`, `found 0 vulnerabilities` |
| Re-resolve after editing dependencies | `npm install` | Lockfile updated only if the manifest and lockfile disagree |
| Run the service | `npm start` | One startup line; foreground held until Ctrl-C |
| Run the service on a chosen port | `PORT=5555 npm start` / `$env:PORT='5555'; npm start` | Startup line naming 5555 |
| Run the tests | `npm test` | `tests 6 / pass 6 / fail 0` |
| Run one test file | `node --test test/config.test.js` | `tests 3 / pass 3 / fail 0` |
| Measure coverage | `node --test --experimental-test-coverage` | 100% line, branch and function on every module loaded |
| Watch the tests | `npm run test:watch` | Reruns affected tests; never returns — do not use in automation |
| Audit dependencies | `npm audit` | `found 0 vulnerabilities` |
| Parse-check a module | `node --check src/server.js` | Exit 0, no output |
| Check the manifest against the lockfile | `npm ci --dry-run` | Exit 0, `up to date` |
| Call the endpoint | `curl.exe -sS http://localhost:3000/hello` | `Hello world` |
| Inspect the response headers | `curl.exe -sS -i http://localhost:3000/hello` | 200, `text/plain; charset=utf-8`, `Content-Length: 11`, no `X-Powered-By` |
| Exercise the conditional-request path | `curl.exe -sS -o /dev/null --etag-save etag.txt <url>` then `--etag-compare etag.txt` | `304` with a zero-length body |

## B. Port Reference

| Port | Role | Notes |
|---|---|---|
| 3000 | Default service port | Used when `PORT` is unset, or when it holds a value outside the accepted grammar |
| Any 1–65535 | Service port via `PORT` | Whole decimal integers only; surrounding whitespace is trimmed |
| Ephemeral | Test transport | Supertest binds a throwaway loopback port per in-process request, so the suite never needs the configured port reserved |

## C. Key File Locations

| Path | Role |
|---|---|
| `src/server.js` | Process bootstrap — the only module that reads the environment, binds a port, logs the callable URL or registers a signal handler |
| `src/app.js` | `createApp()` factory — composes the Express instance, removes the framework banner, mounts the router, never listens |
| `src/config.js` | `loadConfig(env = process.env)` returning `{ port }` under the whole-decimal 1–65535 grammar with a 3000 fallback |
| `src/routes/hello.route.js` | `HELLO_PATH` and the router carrying the single GET handler, with case-sensitive and strict matching |
| `test/hello.route.test.js` | Three tests: the successful response, six near-miss paths, four unregistered write verbs |
| `test/config.test.js` | Three tests over 22 cases: the default port, accepted overrides with boundaries and trimming, and the fallback for every malformed and non-string form |
| `package.json` | Manifest — ESM declaration, three scripts, engine range, two exactly pinned dependencies |
| `package-lock.json` | Committed lockfile, version 3, 88 entries each with a resolution URL and integrity hash |
| `.nvmrc` | The exact runtime patch version |
| `.gitignore` | `node_modules/`, `.env`, `npm-debug.log*`, `coverage/` |
| `README.md` | The learner tutorial: prerequisites, install, run and verify, tests, `PORT` semantics, per-file walkthrough, endpoint boundaries, and an appendix on what `npm audit` covers |

## D. Technology Versions

| Component | Version | Role |
|---|---|---|
| Node.js | 24.19.0 | Runtime; also supplies the test runner (`node:test`) and assertions (`node:assert/strict`), so no test framework is installed |
| npm | 11.17.0 | Bundled with the runtime; generates and verifies the lockfile and runs every script |
| Express | 5.2.1 | HTTP routing and the response API — the only production dependency |
| Supertest | 7.2.2 | In-process HTTP assertions — the only development dependency |
| Transitive packages | 88 total | All resolved from the public registry, each with an integrity hash; none carries an install script |

## E. Environment Variable Reference

| Variable | Required | Default | Accepted | Read by |
|---|---|---|---|---|
| `PORT` | No | `3000` | A whole decimal integer 1–65535, whitespace-trimmed; anything else selects the default | `src/config.js` only, via the injected environment object |

No other variable affects this project. It reads no `.env` file — `.env` appears in `.gitignore` purely as a guard so that a learner who creates one cannot commit it.

## F. Developer Tools Guide

- **Test runner** — Node's built-in `node:test`, invoked as the bare `node --test`. It discovers `test/**/*.test.js` itself; passing a trailing-slash directory argument fails module resolution on this runtime.
- **Assertions** — `node:assert/strict`. Strict deep equality compares types, which is why the configuration tests assert whole result objects rather than scalars.
- **Coverage** — `node --test --experimental-test-coverage`, from the runner. No coverage package is installed and no threshold gate is configured.
- **Linting and formatting** — none configured, and none wanted: no ESLint, Prettier or editor configuration exists, and no `lint` script is defined. `node --check` is the available static gate.
- **Build** — none. Plain ESM runs directly on the pinned runtime; there is no transpile or bundle step and no `build` script.
- **Git hooks** — only the standard Git LFS shims are active, and there is no `.gitattributes`, so nothing is converted to a pointer.

## G. Glossary

| Term | Meaning in this project |
|---|---|
| Application factory | `createApp()` — returns a configured Express application without binding a port, so each test can build its own |
| Bootstrap | `src/server.js` — the single module that turns the application into a running process |
| Strict routing | A router option that stops `/hello/` matching the route registered at `/hello` |
| Case-sensitive routing | A router option that stops `/Hello` matching `/hello`. Both options must sit on the router's own constructor; the equivalent application-level settings do not reach a router mounted with `app.use()` |
| Weak ETag | The validator the framework attaches to a sent response, which makes a conditional request correctly answer 304 with no body |
| Near-miss path | One of the six spellings the contract requires to return 404: `/Hello`, `/HELLO`, `/hEllO`, `/hello/`, `/hello2`, `/` |
| Write verb | `POST`, `PUT`, `DELETE` or `PATCH` — none is registered, so each returns 404 rather than 405 |
| Clean clone | A fresh checkout with no `node_modules/`, from which `npm ci` reproduces the tested dependency tree exactly |
