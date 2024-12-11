const express = require('express')
const router = express.Router()

const User = require("../models/User")
const Post = require("../models/Post")

const { postValidation } = require('../validations/validation')

const verifyToken = require('../verifyToken')

// Get all either by topic or not
router.get("/", verifyToken, async (req, res) => {
    const topic = req.query.topic ?? ""
    let posts = []
    try {
        if (!!topic) {
            posts = await Post.find({ $and: [{ expired: { $gt: Date.now() } }, { topic: topic }] })
        } else {
            posts = await Post.find({ expired: { $gt: Date.now() } })
        }
        return res.send(posts)
    } catch (err) {
        return res.status(400).send({ messenger: err })
    }
})

// sort posts per topic by likes/dislikes
router.get("/sort", verifyToken, async (req, res) => {
    const topic = req.body.topic

    let posts = []
    try {
        if (!!topic) {
            posts = await Post.aggregate([
                { $match: { $and: [{ expired: { $gt: new Date() } }, { topic: topic }] } }, // what happens i topic is null
                { $addFields: { "likesDislikesCount": { $sum: ["$likesCount", "$dislikesCount"] } } },
                { $sort: { "likesDislikesCount": -1 } }
            ])
        } else {
            posts = await Post.aggregate([
                { $match: { $and: [{ expired: { $gt: new Date() } }] } },
                { $addFields: { "likesDislikesCount": { $sum: ["$likesCount", "$dislikesCount"] } } },
                { $sort: { "likesDislikesCount": -1 } }
            ])        }
        return res.send(posts)
    } catch (err) {
        return res.status(400).send({ messenger: err })
    }
})

// get expired posts per topic
router.get("/expired", verifyToken, async (req, res) => {
    const topic = req.query.topic ?? ""
    let posts = []
    try {
        if (!!topic) {
            posts = await Post.find({ $and: [{ expired: { $lt: Date.now() } }, { topic: topic }] })
        } else {
            posts = await Post.find({ expired: { $lt: Date.now() } })
        }
        return res.send(posts)
    } catch (err) {
        return res.status(400).send({ messenger: err })
    }
})

// Create a post
router.post("/", verifyToken, async (req, res) => {

    const { value, error } = postValidation(req.body)
    if (error) {
        return res.status(400).send({ message: error['details'][0]['message'] })
    }

    try {
        const post = new Post(
            {
                "body": req.body.body,
                "topic": req.body.topic,
                "created": req.body.created,
                "expired": req.body.expired,
                "createdBy": req.user
            })
        const postToSave = await post.save()
        return res.send(postToSave)
    } catch (err) {
        return res.status(400).send({ messenger: err })
    }
})

// Update a post likes/dislikes/comments
router.patch("/:postId", verifyToken, async (req, res) => {

    const interationType = req.body.interactionType
    const postId = req.params.postId

    const post = await Post.findById(postId)

    const user = await User.findById(req.user)

    if (post.expired < new Date()) {
        return res.status(400).send("User can not interact with an expired post.")
    }

    if (user._id.equals(post.createdBy) && (interationType == "LIKE" || interationType == "DISLIKE")) {
        return res.status(400).send("User who created the post can not like/dislike the post.")
    }

    let set = {}
    if (interationType == "LIKE") {
        let updatedLikes = post.likes ?? []

        var isInArray = updatedLikes.some(function (postlike) {
            return postlike.equals(user._id);
        });

        if (isInArray) {
            set = {
                $inc: { likesCount: -1 },
                $pull: { likes: user._id }
            }
        } else {
            set = {
                $inc: { likesCount: 1 },
                $push: { likes: user._id }
            }
        }

    } else if (interationType == "DISLIKE") {
        let updatedDislikes = post.likes ?? []

        var isInArray = updatedDislikes.some(function (postlike) {
            return postlike.equals(user._id);
        });

        if (isInArray) {
            set = {
                $inc: { dislikesCount: -1 },
                $pull: { dislikes: user._id }
            }
        } else {
            set = {
                $inc: { dislikesCount: 1 },
                $push: { dislikes: user._id }
            }
        }

    } else if (interationType == "COMMENT") {
        let updatedComments = post.comments ?? []
        const comment = req.body.comment
        updatedComments.push({ comment: comment, user: user })
        set.comments = updatedComments
    }
    else {
        return res.status(400).send("Invalid interaction type.")
    }

    const updatePostById = await Post.updateOne(
        { _id: postId },
        set
    )

    const daysDiff = Math.round(
        (post.expired.getTime() - (new Date()).getTime()) / (1000 * 3600 * 24)
    )

    return res.send({ "userName": user.username, "interactionValue": interationType, DaysLeftToExpire: daysDiff, "comment": req.body.comment })
})

module.exports = router
