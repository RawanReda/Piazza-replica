const joi = require('joi')

const registerValidation = (data) => {
    const schemaValidation = joi.object({
        username: joi.string().required().min(3).max(256),
        email: joi.string().required().min(3).max(256).email(),
        password:  joi.string().required().min(3).max(1024)
    })
    return schemaValidation.validate(data)
}

const loginValidation = (data) => {
    const schemaValidation = joi.object({
        email: joi.string().required().min(3).max(256).email(),
        password:  joi.string().required().min(3).max(1024)
    })
    return schemaValidation.validate(data)
}

// TODO: add schema validation for post
const postValidation = (data) => {
    const schemaValidation = joi.object({
        body: joi.string().required(),
        topic:  joi.string().required()
    })
    return schemaValidation.validate(data)
}



module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation
module.exports.postValidation = postValidation
