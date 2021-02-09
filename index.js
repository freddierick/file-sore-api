require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

mongoose.connect(process.env.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

const app = express()
const port = process.env.port || 8080;
app.use(bodyParser.json())

// include endpoints
const endpoints = {};
endpoints.auth = require("./endpoints/auth").app;

//\\ include endpoints

app.use("/auth",endpoints.auth);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`${process.env.base_url || 'http://localhost'}:${port}`)
})