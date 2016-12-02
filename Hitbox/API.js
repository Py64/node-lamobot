const request = require('request')

module.exports = {
  Call (Path, Data, Callback) {
    request.post({url: 'https://api.hitbox.tv' + Path, headers: {'content-type': 'application/json'}, body: JSON.stringify(Data)}, (err, resp, body) => {
      if (err || resp.statusCode !== 200) {
        return Callback(body, true, resp)
      }
      return Callback(body, false, resp)
    })
  }
}
