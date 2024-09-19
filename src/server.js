import fastify from "fastify";
import fastifyView from "@fastify/view";
import fastifyStatic from "@fastify/static";
import fastifyFormbody from "@fastify/formbody";
import fastifySecureSession from "@fastify/secure-session";
import ejs from "ejs";
import { fileURLToPath } from "node:url";
import { dirname, join } from 'node:path';
import { createPost, listPosts, showPost } from "./actions/posts.js";
import { RecordNotFoundError } from "./errors/RecordNotFoundError.js";
import { loginAction, logoutAction } from "./actions/auth.js";
import { readFileSync } from "node:fs";
import { NotAuthenticatedError } from "./errors/NotAuthenticatedError.js";

const app = fastify();
const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

app.register(fastifyView, {
    engine: {
        ejs
    }
})

app.register(fastifyStatic, {
    root: join(rootDir, 'public'),
})

app.register(fastifyFormbody);

app.register(fastifySecureSession, {
    cookieName: 'session',
    key: readFileSync(join(rootDir, 'secret-key')),
    cookie: {
        path: '/',
        maxAge: 24 * 60 * 60, // 1 day
    }
})

app.get('/', listPosts);
app.get('/article/:id', showPost);
app.get('/login', loginAction);
app.post('/', createPost);
app.post('/login', loginAction);
app.post('/logout', logoutAction);

app.setErrorHandler((error, req, res) => {
    if (error instanceof RecordNotFoundError) {
        res.statusCode = 404;
        return res.view('./templates/404.ejs', {
            error: error.message
        });
    }
    else if (error instanceof NotAuthenticatedError) {
        return res.redirect('/login');
    }
    console.error(error)
    res.statusCode = 500;
    return {
        error: error.message
    }
})


const start = async () => {
    try {
        await app.listen({ port: 3000 });
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
start();