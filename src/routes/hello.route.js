import { Router } from 'express';

/** The one public path this service answers on. */
export const HELLO_PATH = '/hello';

/**
 * Router holding the single GET handler.
 *
 * Both matching options belong on the Router rather than on the app: the
 * app-level `case sensitive routing` and `strict routing` settings do not reach
 * a Router mounted with `use()`, so without them `/Hello` and `/hello/` would
 * answer here too.
 *
 * @type {import('express').Router}
 */
export const helloRouter = Router({ caseSensitive: true, strict: true });

helloRouter.get(HELLO_PATH, (req, res) => res.type('text/plain').send('Hello world'));
