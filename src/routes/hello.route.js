// The single endpoint of this tutorial project: GET /hello responds with the plain-text body
// "Hello world". HELLO_PATH is exported so src/server.js can compose the startup URL from it.
import { Router } from 'express';

export const HELLO_PATH = '/hello';

// Both options belong on the Router: the app-level case-sensitive/strict routing settings do not
// reach a Router mounted with use(), so without them /Hello and /hello/ would answer here too.
export const helloRouter = Router({ caseSensitive: true, strict: true });

helloRouter.get(HELLO_PATH, (req, res) => res.type('text/plain').send('Hello world'));
