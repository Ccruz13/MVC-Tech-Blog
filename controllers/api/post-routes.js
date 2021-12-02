// const router = require('express').Router();
const sequelize = require('../../config/connection');
const { Post, User, Comment, Vote } = require('../../models');
const withAuth = require('../../utils/auth');

module.exports = (app) => {

    app.get('/api/posts', (req, res) => {
        Post.findAll({
            attributes: [
                'id',
                'post_content',
                'title',
                'created_at',
                [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
            ],
            include: [
                {
                    model: Comment,
                    attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                    include: {
                        model: User,
                        attributes: ['username']
                    }
                },
                {
                    model: User,
                    attributes: ['username']
                }
            ]
        })
            .then(dbPostData => res.json(dbPostData))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    });

    app.get('/api/posts/:id', (req, res) => {
        Post.findOne({
            where: {
                id: req.params.id
            },
            attributes: [
                'id',
                'post_content',
                'title',
                'created_at',
                [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
            ],
            include: [
                {
                    model: Comment,
                    attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                    include: {
                        model: User,
                        attributes: ['username']
                    }
                },
                {
                    model: User,
                    attributes: ['username']
                }
            ]
        })
            .then(dbPostData => {
                if (!dbPostData) {
                    res.status(404).json({ message: 'No post found with this id' });
                    return;
                }
                res.json(dbPostData);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    });

    app.post('/api/posts', withAuth, (req, res) => {
        Post.create({
            title: req.body.title,
            post_content: req.body.post_content,
            user_id: req.session.user_id
        })
            .then(dbPostData => res.json(dbPostData))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    });

    app.put('/api/posts/upvote', withAuth, (req, res) => {
        Post.upvote({ ...req.body, user_id: req.session.user_id }, { Vote, Comment, User })
            .then(updatedVotedata => res.json(updatedVotedata))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    });

    app.put('/api/posts/:id', withAuth, (req, res) => {
        Post.update(
            {
                title: req.body.title
            },
            {
                where: {
                    id: req.params.id
                }
            }
        )
            .then(dbPostData => {
                if (!dbPostData) {
                    res.status(404).json({ message: 'No post found with this id' });
                    return;
                }
                res.json(dbPostData);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    });

    app.delete('/api/posts/:id', withAuth, (req, res) => {
        console.log('id', req.params.id);
        Post.destroy({
            where: {
                id: req.params.id
            }
        })
            .then(dbPostData => {
                if (!dbPostData) {
                    res.status(404).json({ message: 'No post found with this id' });
                    return;
                }
                res.json(dbPostData);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    });
};