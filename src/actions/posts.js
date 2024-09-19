import { db } from "../database.js";
import { RecordNotFoundError } from '../errors/RecordNotFoundError.js'
import { verifyUser } from "../functions/auth.js";

export const listPosts = (req, res) => {
    const posts = db.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
    res.view('./templates/index.ejs', {
        posts,
        user: req.session.get('user')
    })
};

export const showPost = (req, res) => {
    const id = req.params.id
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);

    if (post === undefined) {
        throw new RecordNotFoundError(`Cet article n'existe pas`);
    }

    return res.view('./templates/single.ejs', {
        post
    })
}

export const createPost = (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    const slug = title.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
    verifyUser(req);

    const newPost = db.prepare('INSERT INTO posts (title, content, created_at, slug) VALUES (?, ?, ?, ?)')
                      .run(title, content, Math.round(Date.now() / 1000), slug);
    
    res.redirect(`/article/${newPost.lastInsertRowid}`);
}