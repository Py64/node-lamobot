'use strict'
const request = require('request')
const querystring = require('querystring')

class API {
  constructor (Endpoint, Token) {
    this.Endpoint = Endpoint
    this.Token = Token

    // todo: implement token verification
  }

  // Sends POST request to the API server.
  // Returns false if API unaccessible.
  Call (Method, Data, Callback, ReturnJSON = true) {
    request.post({url: this.Endpoint + Method, headers: {'Authorization': this.Token, 'content-type': 'application/x-www-form-urlencoded'}, body: querystring.stringify(Data)}, (err, resp, body) => {
      if (err || resp.statusCode !== 200) {
        return Callback(false)
      }
      if (body === '{"error":4}' || body === '{"error":5}') return Callback(false)
      if (ReturnJSON) body = JSON.parse(body)
      return Callback(body)
    })
  }
  
  // Sends GET request to the API server.
  // Returns false if API unaccessible.
  CallGET (Method, Callback, ReturnJSON = true) {
    request.get({url: this.Endpoint + Method}, (err, resp, body) => {
      if (err || resp.statusCode !== 200) {
        return Callback(false)
      }
      if (body === '{"error":4}') return Callback(false)
      if (ReturnJSON) body = JSON.parse(body)
      return Callback(body)
    })
  }

  // Returns JSON object of user.
  // Contains multiplier and points.
  GetUser (User, Callback) {
    this.CallGET('/user/get/' + User, (user) => {
      if (!(user === null || typeof user === 'undefined') || user === false) {
        Callback(user)
      }
    }, true)
  }

  // Feeds llamas. User pays.
  // Uses Call function to communicate with API.
  // Your bot must have be trusted by the user (only if you don't have MASTER permission).
  // Returns JSON object containing error code and count as result (current hay amounts).
  // Result can have three values:
  //   0: success,
  //   1: not enough points
  //   2: time between last fed llama and now has not passed yet
  //   3: invalid request
  FeedLlamas (User, Ingredient, Callback) {
    this.Call('/feed/llama/as/' + User, {comment: Ingredient}, Callback)
  }

  // Feeds pandas. User pays.
  // Uses Call function to communicate with API.
  // Your bot must have be trusted by the user (only if you don't have MASTER permission).
  FeedPandas (User, Ingredient, Callback) {
    this.Call('/feed/panda/as/' + User, {comment: Ingredient}, Callback)
  }

  // Gives points.
  // Uses Call function to communicate with API.
  // If bot has no SUPER flag, server will reject this request for insufficient permissions (3 wrong api key).
  // Returns '0 success' or '1 err'.
  GivePoints (User, Amount, Callback) {
    this.Call('/addpoints', {user: User, points: Amount}, Callback, false)
  }
}

module.exports = API
