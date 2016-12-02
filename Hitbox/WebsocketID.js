/* TODO: Merge with Hitbox/Server.js */

const request = require("request"),
      logger = require("node-logger")

module.exports = {
  Fetch(ServerAddress, Callback) {
    request('https://' + ServerAddress + "/socket.io/1/", (err, resp, body) => {
      if (err || resp.statusCode !== 200) {
        return logger.error("Could not fetch websocket id (server", ServerAddress, ").")
      }
      return Callback(body.split(':')[0])
    })
  }
}