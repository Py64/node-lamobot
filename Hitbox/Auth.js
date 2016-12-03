'use strict'
const api = require('./API.js')
const logger = require('node-logger')

module.exports = {
  GetUser (Username, Password, Callback) {
    api.Call('/auth/login', {'login': Username, 'pass': Password, 'app': 'desktop'}, (body, err, resp) => {
      if (err) {
        return logger.error('Failed to get user', Username)
      }
      return Callback(JSON.parse(body))
    })
  },
  GetToken (Username, Password, Callback) {
    this.GetUser(Username, Password, (object) => {
      Callback(object['authToken'])
    })
  }
}
