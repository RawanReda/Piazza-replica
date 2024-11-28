const jsonwebtoken = require('jsonwebtoken')

function auth(req, res, next) {
    console.log("auth?")
    const token = req.header('Authorization')?.split(' ')[1];
    console.log("token", token)
    if (!token) {
        return res.status(401).send({ message: 'Access denied' })
    }

    try {
        const verified = jsonwebtoken.verify(token, process.env.TOKEN_SECRET)
        req.user = verified._id
        console.log(verified._id)
        next()
    } catch (err) {
        return res.status(401).send({ 'message': 'Invalid Token' })
    }
}

module.exports = auth