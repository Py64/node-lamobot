'use strict'
const request = require('request')
const logger = require('node-logger')
const Chat = require('./Chat.js')

class ChatServer {
  constructor (Callback, Auto = false) {
    this.Address = null
    this.WebsocketID = null
    this.Chat = null

    // Autoquery
    if (Auto) {
      this.Find((err) => {
        if (err === false) {
          return Callback(false)
        } else {
          this.GetWebsocketID((err) => {
            if (err === false) return Callback(false)
            Callback(this)
          })
        }
      })
    }
  }

  // Queries Hitbox API to get a list of servers
  // and uses one of them.
  Find (Callback) {
    request('https://api.hitbox.tv/chat/servers?redis=true', (err, resp, body) => {
      if (err || resp.statusCode !== 200) {
        return Callback(logger.error('Could not find websocket server address.'))
      }
      this.PlainAddress = JSON.parse(body)[0]['server_ip']
      this.Address = 'https://' + this.PlainAddress
      return Callback(this)
    })
  }

  // Sends HTTP request to the server
  Call (Path, Callback) {
    request(this.Address + Path, (err, resp, body) => {
      if (err || resp.statusCode !== 200) {
        return Callback(null, true, resp)
      }
      return Callback(body, false, resp)
    })
  }

  // Queries Hitbox API to get a websocket ID.
  GetWebsocketID (Callback) {
    this.Call('/socket.io/1/', (body, err, resp) => {
      if (err) {
        return Callback(logger.error('Failed to get websocket ID from server', this.Address))
      }
      logger.info(body)
      this.WebsocketID = body.substring(0, body.indexOf(':'))
      logger.info(this.WebsocketID)
      return Callback(this)
    })
  }

  // Constructs and returns Chat object.
  GetChat (Handler) {
    return new Chat(this, Handler)
  }
}

module.exports = ChatServer
