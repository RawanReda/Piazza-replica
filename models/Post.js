const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    body: {
        type: String,
        require: true,
        min: 6,
        max: 1024
    },
    title :{
        type: String
    },
    topic: {
        type: String,
        require: true,
        enum: ['Politics', 'Health', 'Tech', 'Sport']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    likesCount: {
        type: Number,
        default: 0
    },
    dislikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    dislikesCount: {
        type: Number,
        default: 0
    },
    comments: [
        {
            comment: String,
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ]
},
    {
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
)

postSchema.virtual('status')
    .get(function () { return (this.expired > new Date()) ? "Live" : "Expired"; });

module.exports = mongoose.model('posts', postSchema)
