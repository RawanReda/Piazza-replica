const express = require('express')
const app = express()
require('dotenv').config(); 

const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const authRoute = require('./routes/auth')
const postRoute = require('./routes/posts')

app.use(bodyParser.json())
app.use('/api/user', authRoute)
app.use('/api/posts', postRoute)

app.get("/", async(req,res) => {
    res.send('test')
})

mongoose.connect(process.env.DB_CONNECTOR).then(() => {
    console.log("connected to mongoose")
})
app.listen(3000)