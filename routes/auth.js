const express = require('express')
const router = express.Router()

const User = require('../models/User')
const { registerValidation, loginValidation } = require('../validations/validation')

const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')

router.post('/register', async (req, res) => {

    console.log(req.body)
    // Validation1: check validation for fields
    const { value, error } = registerValidation(req.body) //isolate the error
    if (error) {
        return res.status(400).send({ message: error['details'][0]['message'] }) // in the form of json
    }

    // Validation 2: check if user exists
    const userExists = await User.findOne({ email: req.body.email })
    if (userExists) {
        return res.status(400).send({ message: 'ERROR: email already exists' }) // in the form of json

    }

    const salt = await bcryptjs.genSalt(5)
    const hashedPassword = await bcryptjs.hash(req.body.password, salt)


    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
    })

    // code to insert data
    try {
        const savedUser = await user.save()
        res.send(savedUser)
    } catch (err) {
        res.status(400).send({ message: err })
    }

})

router.post('/login', async (req, res) => {

    // Validation 1
    const { value, error } = loginValidation(req.body) //isolate the error
    if (error) {
        return res.status(400).send({ message: error['details'][0]['message'] }) // in the form of json
    }

    // Validation 2: check if user exists
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(400).send({ message: 'ERROR: user does not exist' }) // in the form of json
    }

    // Validation 3: check user password
    const passowrdValidation = await bcryptjs.compare(req.body.password, user.password)
    if (!passowrdValidation) {
        return res.status(400).send({ message: 'ERROR: Password is wrong' }) // in the form of json
    }
    const token = jsonwebtoken.sign({ _id: user._id }, process.env.TOKEN_SECRET)
    res.header('auth-token', token).send({ 'auth-token': token })
})

module.exports = router
