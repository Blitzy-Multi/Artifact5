import { Router } from 'express';

export const HELLO_PATH = '/hello';

// Both options belong on the Router: the app-level case-sensitive/strict routing settings do not
// reach a Router mounted with use(), so without them /Hello and /hello/ would answer here too.
export const helloRouter = Router({ caseSensitive: true, strict: true });

helloRouter.get(HELLO_PATH, (req, res) => res.type('text/plain').send('Hello world'));
