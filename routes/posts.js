const express = require('express')
const router = express.Router()

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

router.patch("/:postId", async (req, res) => {

    const interationType = req.body.interactionType
    const postId = req.params.postId
    const posto = Post.findById(postId)
    console.log(req.body, " interactionType ", interationType, "postId ", postId)

    const post = await Post.findById(postId)
    // const userId = await req.user

    const userId = "6742ff873a0a753a09867b5b"
    const uo = await User.findById(userId) ///  it should fail if the user does not exist 


    console.log("uo ",uo, req.user)
    let set = {
    }
    if (interationType == "LIKE") {
        let updatedLikes = post.likes ?? []
        updatedLikes.push(uo)
        set.likes = updatedLikes
        
    } else if (interationType == "DISLIKE") {
        let updatedDislikes = post.dislikes ?? []
        updatedDislikes.push(uo)
        set = {
            dislikes: updatedDislikes
        }
    } else if (interationType == "COMMENT") {
        let updatedComments = post.comments ?? []
        const comment = req.body.comment
        updatedComments.push({ comment: comment, user: uo })
        set.comments= updatedComments

    }
    else {
        res.status(400).send("Invalid interaction type.")
        return
    }

    const updatePostById = await Post.updateOne(
        { _id: postId },
        { $set: set }
    )
    res.send(updatePostById)
    console.log("post id updated ", updatePostById)

})

module.exports = router