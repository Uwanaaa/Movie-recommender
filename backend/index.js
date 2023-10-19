const express = require('express')
const bourne = require('bourne') //download
const async = require('async') //
const jade = require('jade') //
const underscore = require('underscore') //
const coffee = require('coffee-script') //
const {POOL} = require('pg')//

const app = express()
const PORT = 2005
const pool = new POOL({
    user:,
    host:'localhost',
    database:,
    password:,
    port:5432,
})


app.listen(PORT, (req, res) => {
    res.status(200).send(`Listening at PORT ${PORT}`)
})