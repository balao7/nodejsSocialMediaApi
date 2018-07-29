const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Post model
const Post = require('../../models/Post');

// Profile Model
const Profile = require('../../models/Profile');


// Validation Part for input

const validatePostInput = require('../../validation/post');


// @route GET api/posts/test
// @desc Tests post route
// @access Public route
router.get('/test', (req, res) => res.json({
    msg: "Posts Works"
}));
// @route GET api/posts
// @desc Get all the post
// @access Public
router.get('/', (req, res) => {
    Post.find()
        .sort({
            date: -1
        })
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({
            nopostsfound: "No posts found!!"
        }));
});

// @route GET api/posts/:id
// @desc Get all the post
// @access Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({
            nopostfound: "No post found with that id"
        }));
});


// @route POST api/posts
// @desc Create post
// @access Private route

router.post('/', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    const {
        errors,
        isValid
    } = validatePostInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }
    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
});

// @route DELETE api/post/:id
// @desc DELETE a post by its id
// @access Private route

router.delete('/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    //current user
    Profile.findOne({
            user: req.user.id
        })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    //Check the post owner
                    if (post.user.toString() !== req.user.id) {
                        return res.status(401).json({
                            notauthorized: "User not authorized"
                        })
                    }
                    // Delete
                    post.remove().then(() => res.json({
                        success: true
                    }))
                })
                .catch(err => res.status(404).json({
                    postnotfound: "Post not found"
                }));
        });

});

// @route POST api/post/like/:id
// @desc like post
// @access Private route

router.post('/like/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Profile.findOne({
        user: req.user.id
    }).then(profile => {
        Post.findById(req.params.id)
            .then(post => {
                if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                    return res.status(400).json({
                        alreadyliked: "User already liked this post"
                    })
                }
                // Add the user id to the likes array
                post.likes.unshift({
                    user: req.user.id
                });
                post.save().then(post => res.json(post));
            }).catch(err => res.status(404).json({
                postnotfound: "No posts found"
            }));
    });
});

// @route POST api/unlike/:id
// @desc Unlike a post
// @access Private Access
router.post('/unlike/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Profile.findOne({
            user: req.user.id
        })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        return res.status(400).json({
                            nolikedpost: "You havent't even liked the post"
                        });
                    }
                    // Get the remove index
                    const removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id);

                    post.likes.splice(removeIndex, 1);

                    // Save
                    post.save().then(post => res.json(post));


                });
        });
});

// @route POST api/posts/comment/:id
// @desc Add comment to post
// @access Privte Route

router.post('/comment/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    const {
        errors,
        isValid
    } = validatePostInput(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            };

            // Add comment to the array
            post.comments.unshift(newComment);

            //save
            post.save().then(post => res.json(post))
        }).catch(err => res.status(404).json({
            postnotfound: "no post found"
        }));
});

// @route DELETE api/posts/comment/:id/:comment_id
// @desc DELETE a comment
// @access Private route

router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            // Check if the comment exists
            if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                return res.status(404).json({
                    commentnotfound: "Your comment doesn't exist"
                })
            }
            // Get remove index

            const removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id);

            // Splice comment out of the array
            post.comments.splice(removeIndex, 1);

            post.save().then(res.json(post));
        }).catch(err => res.status(404).json({
            postnotfound: "Post not found!!"
        }));
});



module.exports = router;