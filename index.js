const server = require('./Hitbox/Server.js')
const auth = require('./Hitbox/Auth.js')
const log = require('node-logger')
const config = require('./.lamobot.json')

console.dir(config.Channels)
for(let key in config.Channels) {
  let creds = config.Channels[key]
  auth.GetToken(creds['User'], creds['Pass'], (token) => {
    if (token == null) {
      return log.error("Could not log in onto account", creds['User'], "on channel", key)
    }
    log.success("Received token to account", creds['User'], "which will run on channel", key)
  })
}
