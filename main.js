var express = require('express')
var app = express()
var api = require('./api.js')()
var path = require('path')
var db = require('./db/mysql.js')
var config = require("./config.js")
var scan = require('./scan.js')


//--------------------server web
app.use('/api',api)
app.use('/www',express.static('www'))
app.use('/data',express.static(config.data))
app.use('/NeedToFindAName',function (req,res)
{
   res.sendFile(path.resolve("www/index.html"))
})
app.get('/',function (req,res)
{
res.redirect(301,'./NeedToFindAName')
})

app.listen (config.port)


setInterval(scan.scan,3600000)