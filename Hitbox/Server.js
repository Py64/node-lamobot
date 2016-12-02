const request = require("request"),
      logger = require("node-logger")

module.exports = {
  Address: null,
  Find(Callback) {
    request('https://api.hitbox.tv/chat/servers', (err, resp, body) => {
      if (err || resp.statusCode !== 200) {
        return logger.error('Could not find websocket server address.')
      }
      this.Address = JSON.parse(body)[0]['server_ip']
      return Callback(this)
    })
  },
  Call(Path, Callback) {
    request(this.Address + Path, (err, resp, body) => {
      if (err || resp.statusCode !== 200) {
        return Callback(null, true, resp)
      }
      return Callback(body, false, resp)
    })
  },
  GetWebsocketID(Callback) {
    this.Call('/socket.io/1/', (body, err, resp) => {
      if (err) {
        return Callback(null)
      }
      return Callback(body.split(':')[0])
    })
  }
}
