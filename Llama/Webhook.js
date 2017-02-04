'use strict'
const logger = require('node-logger')
const express = require('express')
const bodyParser = require('body-parser')

logger.warning("DEPRECATED MODULE (Webhook.js). PLEASE STOP USING IT ASAP")

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
      if (req.body.Token === this.VerificationToken) {
        res.writeHead(200)
        res.end()
        res.body.Token = true
        this.Callback(res.body)
      } else {
        res.writeHead(500)
        res.end('Internal server error')
      }
    })
    if (ExpressServer === null) {
      this.Http = this.Server.listen(Port)
    }
  }
}

module.exports = Webhook
