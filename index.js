const ChatServer = require('./Hitbox/ChatServer.js')
const Chat = require('./Hitbox/Chat.js')
const Auth = require('./Hitbox/Auth.js')
const log = require('node-logger')
const config = require('./.lamobot.json')

const chatarr = []

function Handle(Event, Data, Chat) {
  if (Event === '!_READY') {
    log.info("Opening a websocket connection for", Chat.Data.Channel)
    Chat.Connect()
  } else if (Event === 'Connected') {
    log.info("Joining", Chat.Data.Channel)
    Chat.JoinChannel(Chat.Data.Channel, Chat.Data.User, Chat.Data.Token)
  } else if (Event === 'WrongWebsocketID') {
    log.error('Websocket for', Chat.Data.Channel, 'has wrong websocket id. Connection will be closed.')
  } else {
    console.dir(Event)
    console.dir(Data)
  }
}

for (let key in config.Channels) {
  let creds = config.Channels[key]
  Auth.GetToken(creds['User'], creds['Pass'], (token) => {
    if (token == null) {
      return log.error('Could not log in onto account', creds['User'], 'on channel', key)
    }
    log.success('Received token to account', creds['User'], 'which will run on channel', key)
    let server = new ChatServer()
    log.info('Finding server for', creds['User'], 'which will run on', key)
    server.Find((server) => {
      if (server === false) {
        log.warning('Failed to find a server for', creds['User'], 'so bot will not run on channel', key)
        return
      }
      log.info('Getting websocket id for', creds['User'], 'which will run on', key)
      server.GetWebsocketID((server) => {
        if (server === false) {
          log.warning('Failed to get websocket id for', creds['User'], 'so bot will not run on channel', key)
          return
        }
        let Data = {
          Channel: key,
          User: creds['User'],
          Token: token
        }
        let chat = server.GetChat(Handle, Data)
        chatarr.push(chat)
      })
    })
  })
}
