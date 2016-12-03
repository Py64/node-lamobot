'use strict'
const request = require('request')
const querystring = require("querystring");
const logger = require('node-logger')

class API {
  constructor (Endpoint, Token) {
    this.Endpoint = Endpoint
    this.Token = Token
    
    // todo: implement token verification
  }

  // Sends POST request to the API server.
  // Returns false if API unaccessible.
  Call (Method, Data, Callback, ReturnJSON = true) {
    Data.rak = this.Token
    request.post({url: this.Endpoint + Method, headers: {'content-type': 'application/x-www-form-urlencoded'}, body: querystring.stringify(Data)}, (err, resp, body) => {
      if (err || resp.statusCode !== 200) {
        return Callback(false)
      }
      if (body == '3 wrong api key') return Callback(false)
      if (ReturnJSON) body = JSON.parse(body)
      return Callback(body)
    })
  }
  
  // Returns amount of user's points.
  GetPoints (User, Callback) {
    this.Call("/points", {user: User}, Callback, false)
  }
  
  // Feeds llamas. User pays.
  // Uses Call function to communicate with API.
  // If bot has no SUPER flag or user has not authorized the application, server will force bot's name.
  // Returns JSON object containing result and count (current fed llamas amount).
  // Result can have three values:
  //   1: success,
  //   2: not enough points
  //   3: time between last fed llama and now has not passed yet
  FeedLlamas (User, Ingredient, Callback) {
    this.Call("/llama", {user: User, ingredient: Ingredient}, Callback)
  }
  
  // Feeds pandas. User pays.
  // Uses Call function to communicate with API.
  // If bot has no SUPER flag or user has not authorized the application, server will force bot's name.
  // Returns JSON object containing result (same as in FeedLlamas case) and count (current fed llamas amount).
  FeedPandas (User, Ingredient, Callback) {
    this.Call("/panda", {user: User, ingredient: Ingredient}, Callback)
  }
  
  // Gives points.
  // Uses Call function to communicate with API.
  // If bot has no SUPER flag, server will reject this request for insufficient permissions (3 wrong api key).
  // Returns '0 success' or '1 err'.
  GivePoints (User, Amount, Callback) {
    this.Call("/addpoints", {user: User, points: Amount}, Callback, false)
  }
}

module.exports = API
