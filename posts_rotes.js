const express = require('express');
const indicative = require('indicative');
const router = express.Router();
const error = require('./helpers').errorResonse;

router.get('/', (req, res) => {
    const db = req.app.locals.db;
    const selectQuery = 'SELECT * FROM posts';

    db.all(selectQuery, [], (err, result) => {
        if (err) throw err;

        res.json(result);
    });
});

router.get('/:postId', (req, res) => {
    const db = req.app.locals.db;
    const params = indicative.sanitize(req.params, { postId: 'to_int' });

    indicative.validate(params, { postId: 'required|integer|above:0' })
        .then(() => {
            const selectQuery = 'SELECT * FROM posts WHERE id = ?';

            db.get(selectQuery, [params.postId], (err, result) => {
                if (err) throw err;
                if (typeof result !== 'undefined') {
                    res.json(result);
                }
                else {
                    error(req, res, 404, `Post with Id=${params.postId} not found.`);
                }
            });
        }).catch(errors => {
            error(req, res, 400, `Invalid post id: ${postId}`);
        });
});

router.post('/', (req, res) => {
    const db = req.app.locals.db;
    let post = req.body;

    const createQuery = 'INSERT INTO posts (Title, Autor, Text, Tags, URL, Status) VALUES(?, ?, ?, ?, ?, ?)';

    indicative.validate(post, {
        Title: 'required|string',
        Autor: 'required|string',
        Text: 'required|string',
        Status: 'required|string'
    }).then(() => {
        db.run(createQuery, [post.Title, post.Autor, post.Text, post.Tags, post.URL, post.Status], function (err, result) {
            if (err) throw err;

            post.Id = this.lastID;
            const uri = req.baseUrl + '/' + post.Id;

            res.location(uri)
                .status(201)
                .json(post);
        });
    }).catch(errors => {
        error(req, res, 400, `Invalid post data: ${errors}`);
    });
});

router.put('/:postId', (req, res) => {
    const db = req.app.locals.db;
    const params = indicative.sanitize(req.params, { postId: 'to_int' });
    let post = req.body;

    indicative.validate(post, {
        Title: 'required|string',
        Autor: 'required|string',
        Text: 'required|string',
        Status: 'required|string'
    }).then(() => {
        const updateQuery = 'UPDATE posts SET Title = ?, Autor = ?, Text = ?, Tags = ?, URL = ?, Status = ? WHERE id = ?';

        db.run(updateQuery, [post.Title, post.Autor, post.Text, post.Tags, post.URL, post.Status, params.postId], function (err) {
            if (err) throw err;
            if (this.changes > 0) {
                res.json({ message: 'Post updated successfully' });
            }
            else {
                error(req, res, 404, `Post with Id=${params.postId} not found.`);
            }
        }).catch(errors => {
            error(req, res, 400, `Invalid post data: ${errors}`);
        });
    });
});

router.delete('/:postId', (req, res) => {
    const db = req.app.locals.db;
    const params = indicative.sanitize(req.params, { postId: 'to_int' });

    indicative.validate(params, { postId: 'required|integer|above:0' })
        .then(() => {
            db.run('DELETE FROM posts WHERE id = ?', [params.postId], function (err) {
                if (err) throw err;
                if (this.changes > 0) {
                    res.json({ message: 'Post deleted successfully' });
                }
                else {
                    error(req, res, 404, `Post with Id=${params.postId} not found.`);
                }
            });
        }).catch(errors => {
            error(req, res, 400, `Invalid post id: ${postId}`);
        });
});

module.exports = router;