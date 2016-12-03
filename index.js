const ChatServer = require('./Hitbox/ChatServer.js')
const Chat = require('./Hitbox/Chat.js')
const Auth = require('./Hitbox/Auth.js')
const log = require('node-logger')
const config = require('./.lamobot.json')

const chatarr = []

for (let key in config.Channels) {
  let creds = config.Channels[key]
  Auth.GetToken(creds['User'], creds['Pass'], (token) => {
    if (token == null) {
      return log.error('Could not log in onto account', creds['User'], 'on channel', key)
    }
    log.success('Received token to account', creds['User'], 'which will run on channel', key)
    let server = new ChatServer()
    
  })
}
