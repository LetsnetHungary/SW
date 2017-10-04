var express = require('express'),
  app = express(),
  config = require('./App/config/config'),
  fs = require('fs'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  cookieParser = require('cookie-parser')

app.use(express.static('./assets'))

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())
app.use(cookieParser())

app.use(session({
  secret: "secret",
  resave: true,
  saveUninitialized: true,
  rolling: true
}))


fs.readdirSync('./App/Controllers').forEach(function(file) {
  app.use('/' + file.slice(0, -3), require('./App/Controllers/' + file))
})

app.use('/', require('./App/Controllers/Index'))

app.use(function(req, res) {
    res.send("404 error", 404)
})

app.set('view engine', 'ejs')
app.set('views', './Views')

var server = app.listen(config.port, config.server, function() {
  console.log('The server started on port : ' + config.port)
})