const mongoose = require('mongoose')
//TODO: add title
const postSchema = mongoose.Schema({
    body: { // what is the largest possible?
        type: String,
        require: true,
        min: 6,
        max: 1024
    },
    topic: {
        type: String,
        require: true,
        enum: ['Politics', 'Health', 'Tech', 'Sport']
    },
    created: {
        type: Date,
        default: Date.now
    },
    expired: {
        type: Date,
        default: function () {
            const date = new Date()
            return date.setUTCFullYear(date.getFullYear() + 1)
        }
    },
    status: { // only expired or live ( categorised based on condition?)
        type: String,
        enum: ['Live', 'Expired'],
        default: function () {
            if (this.expired <= this.created) {
                return 'Expired'
            } else {
                return 'Live'
            }
        }

    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    dislikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    comments: [
        {
            comment: String,
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ],
})

module.exports = mongoose.model('posts', postSchema)