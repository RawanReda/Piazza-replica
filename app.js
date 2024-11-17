const express = require('express')
const app = express()
require('dotenv').config(); 

const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const authRoute = require('./routes/auth')

app.use(bodyParser.json())
app.use('/api/user', authRoute)


mongoose.connect(process.env.DB_CONNECTOR).then(() => {
    console.log("connected to mongoose")
})
app.listen(3000)