const express = require('express')
const router = express.Router()
const mongoose = require('mongoose'); // Import ObjectId from mongodb package

const User = require("../models/User")
const Post = require("../models/Post")
const verifyToken = require('../verifyToken')

router.get("/", verifyToken, async (req, res) => {
    const topic = req.query.topic ?? ""
    let posts = []
    try {
        if (!!topic) {
            posts = await Post.find({ "topic": topic })
        } else {
            posts = await Post.find()
        }
        res.send(posts)
    } catch (err) {
        res.status(400).send({ messenger: err })
    }
})

// router.get("/active", verifyToken, async (req, res) => {
//     const topic = req.query.topic ?? ""
//     let posts = []
//     try {
//         if (!!topic) {
//             posts = await Post.find({ "topic": topic }).sort({})
//         } else {
//             posts = await Post.find()
//         }
//         res.send(posts)
//     } catch (err) {
//         res.status(400).send({ messenger: err })
//     }
// })

// router.get("/", verifyToken, async (req, res) => {
//     const topic = req.query.topic ?? ""
//     let posts = []
//     try {
//         if (!!topic) {
//             posts = await Post.find({ "topic": topic })
//         } else {
//             posts = await Post.find()
//         }
//         res.send(posts)
//     } catch (err) {
//         res.status(400).send({ messenger: err })
//     }
// })

router.post("/", verifyToken, async (req, res) => {

    try {
        const post = new Post(
            {
                "body": req.body.body,
                "topic": req.body.topic,
                "created": req.body.created,
            })
        const postToSave = await post.save()
        res.send(postToSave)
    } catch (err) {
        res.status(400).send({ messenger: err })
    }
})

router.patch("/:postId", verifyToken, async (req, res) => {

    const interationType = req.body.interactionType
    const postId = req.params.postId
    console.log(req.body, " interactionType ", interationType, "postId ", postId)

    const post = await Post.findById(postId)
    // const userId = await req.user

    const user = await User.findById(req.user) ///  it should fail if the user does not exist 

    let set = {}
    if (interationType == "LIKE") {
        let updatedLikes = post.likes ?? []

        var isInArray = updatedLikes.some(function (postlike) {
            return postlike.equals(user._id);
        });

        if(isInArray){
            set = {$inc: { likesCount: -1 },
            $pull: { likes: user._id}}
        } else {
            set = {$inc: { likesCount: -1 },
            $push: {  likes: user._id}}
        }
        
    } else if (interationType == "DISLIKE") {
        let updatedDislikes = post.likes ?? []

        var isInArray = updatedDislikes.some(function (postlike) {
            return postlike.equals(user._id);
        });

        if(isInArray){
            set = {$inc: { dislikesCount: -1 },
            $pull: { dislikes: user._id}}
        } else {
            set = {$inc: { dislikesCount: -1 },
            $push: {  dislikes: user._id}}
        }

    } else if (interationType == "COMMENT") {
        let updatedComments = post.comments ?? []
        const comment = req.body.comment
        updatedComments.push({ comment: comment, user: user })
        set.comments= updatedComments

    }
    else {
        res.status(400).send("Invalid interaction type.")
        return
    }

    const updatePostById = await Post.updateOne(
        { _id: postId },
        set
    )
    res.send(updatePostById)
    console.log("post id updated ", updatePostById)

})

module.exports = router