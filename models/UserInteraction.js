const mongoose = require('mongoose')

const userInteractionSchema = mongoose.Schema({
    postId:{ 
        type: String,
        require: true,
        min:6,
        max:1024
    },
    userId :{
        type: String,
        require: true,
        min:6,
        max:1024
    },
    type :{ // like, dislike, comment
        type: String,
        require: true,
        enum: ['Like','Dislike','Comment']
    },
    value:{ // only if it is a comma
        type: String,
        require: true,
        min:6,
        max:1024
    }
})

module.exports = mongoose.model('userInteraction', userInteractionSchema)