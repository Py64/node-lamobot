const request = require('request')
const logger = require('node-logger')
const WebSocketClient = require('websocket').client

module.exports = {
  Address: null,
  WebsocketID: null,
  Websocket: null,
  SetAddress (Address) {
    this.Address = Address
  },
  Find (Callback) {
    request('https://api.hitbox.tv/chat/servers?redis=true', (err, resp, body) => {
      if (err || resp.statusCode !== 200) {
        return logger.error('Could not find websocket server address.')
      }
      this.Address = 'https://' + JSON.parse(body)[0]['server_ip']
      return Callback(this)
    })
  },
  Call (Path, Callback) {
    request(this.Address + Path, (err, resp, body) => {
      if (err || resp.statusCode !== 200) {
        return Callback(null, true, resp)
      }
      return Callback(body, false, resp)
    })
  },
  GetWebsocketID (Callback) {
    this.Call('/socket.io/1/', (body, err, resp) => {
      if (err) {
        return logger.error('Failed to get websocket ID from server', this.Address)
      }
      this.WebsocketID = body.substring(0, body.indexOf(':'))
      return Callback(this.WebsocketID)
    })
  },
  ConnectWebsocket (Callback) {
    this.Websocket = new WebSocketClient()
    this.Websocket.on('connectFailed', (error) => {
      return Callback('WSFailed', error)
    })
    this.Websocket.on('connect', (connection) => {
      Callback('WSConnected', connection)
      connection.on('error', (error) => {
        Callback('WSError', error)
      })
      connection.on('close', () => {
        Callback('WSClosed')
      })
      connection.on('message', (message) => {
        if (message.type === 'utf8') {
          if (message.utf8Data == '2::') {
            connection.sendUTF('2::')
          } else if (message.utf8Data == '1::') {
            Callback('LoggedIn', connection)
          } else if (message.utf8Data.startsWith('5::::')) {
            let JsonObject = JSON.parse(message.utf8Data)
            Callback('Message', JsonObject, connection)
          } else {
            Callback('Unknown', message.utf8Data, connection)
          }
        }
      })
    })
  }
}
