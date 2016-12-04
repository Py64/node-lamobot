'use strict'
const logger = require('node-logger')
const express = require('express')
const bodyParser = require('body-parser')

class Webhook {
  // Webhooks are always sent if someone feeds llama/panda.
  constructor (VerificationToken, Callback, ExpressServer = null, Port = 80) {
    this.VerificationToken = VerificationToken
    this.Callback = Callback
    this.Server = ExpressServer
    
    if (this.Server === null) {
      this.Server = express()
      this.Server.use(bodyParser.json())
    }
    this.Server.post('/webhook/', (req, res) => {
      console.dir(req.body)
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end('thanks');
    })
    if (ExpressServer === null) {
      this.Http = this.Server.listen(Port)
    }
  }
}

module.exports = Webhook
