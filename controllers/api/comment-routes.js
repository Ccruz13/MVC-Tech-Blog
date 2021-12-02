// const router = require('express').Router();
const { Comment } = require('../../models');
const withAuth = require('../../utils/auth');

module.exports = (app) => {

    app.get('/api/comments', (req, res) => {
        Comment.findAll()
            .then(dbCommentData => res.json(dbCommentData))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    });

    app.post('/api/comments', withAuth, (req, res) => {
        Comment.create({
            comment_text: req.body.comment_text,
            user_id: req.session.user_id,
            post_id: req.body.post_id
        })
            .then(dbCommentData => res.json(dbCommentData))
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    })

    app.delete('/api/comments/:id', withAuth, (req, res) => {
        Comment.destroy({
            where: {
                id: req.params.id
            }
        })
            .then(dbCommentData => {
                if (!dbCommentData) {
                    res.status(404).json({ message: 'No comment found with this id' });
                    return;
                }
                res.json(dbCommentData)
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    });
};