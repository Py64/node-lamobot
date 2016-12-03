'use strict'
const ChatServer = require('./Hitbox/ChatServer.js')
const Auth = require('./Hitbox/Auth.js')
const LlamaAPI = require('./Llama/API.js')
const log = require('node-logger')
const config = require('./.lamobot.json')
const util = require('util')
const chatarr = []
const API = new LlamaAPI(config.API.Endpoint, config.API.Token)
let IgnoreUsers = []

function Handle (Event, Data, Chat) {
  if (Event === '!_READY') {
    log.info('Opening a websocket connection for', Chat.Data.Channel)
    Chat.Connect()
  } else if (Event === 'Connected') {
    log.info('Joining', Chat.Data.Channel)
    Chat.JoinChannel(Chat.Data.Channel, Chat.Data.User, Chat.Data.Token, Chat.Data.NameColor)
  } else if (Event === 'WrongWebsocketID') {
    log.error('Websocket for', Chat.Data.Channel, 'has wrong websocket id. Connection will be closed.')
  } else if (Event === 'Message') {
    if (Data['method'] === 'loginMsg') {
      log.success('Channel', Chat.Channel, 'joined successfuly.')
    } else if (Data['method'] === 'userList') {
      if (Chat.Data.GiveawayPoints) {
        log.success('Received', Chat.Channel, '\'s user list.')
        for (let key in Data['params']['data']['isFollower']) {
          let username = Data['params']['data']['isFollower'][key]
          if (IgnoreUsers.indexOf(username) > -1) continue
          let points = 2
          if (Data['params']['data']['user'].indexOf(key) > -1 || Data['params']['data']['isSubscriber'].indexOf(key) > -1 || Data['params']['data']['admin'].indexOf(key) > -1) {
            points++
          }
          if (Math.floor(Math.random() * 100) == 99) {
            points++
            log.info("Wow!", username, "will earn extra point today!")
          }
          log.info('Giving', points, 'to', username, 'for being on', Chat.Channel, 'and locking his/her wallet to the end of this giveaway')
          IgnoreUsers.push(username)
          API.GivePoints(username, points, (err) => {
            if (err === '1 err' || err === false) log.warning("Failed to give", username, "his/her points.")
            else log.success(username, "received his points.")
          })
        }
      }
    } else if (Data['method'] === 'chatMsg' || (Data['method'] === 'directMsg' && Chat.Data.Whispers)) {
      let sender = Data['method'] === 'directMsg' ? Data['params']['from'] : Data['params']['name']
      if (sender.toLowerCase() !== Chat.Data.User.toLowerCase() || Data['params']['text'][0] === Chat.Data.Prefix) {
        Data['params']['text'] = Data['params']['text'].substr(1)
        let CmdData = Data['params']['text'].split(' ')
        let Command = CmdData[0].toLowerCase()
        let Alias = Chat.Data.Aliases[Command]
        if (Alias != null) Command = Alias
        if (Chat.Data.EnabledCmds.indexOf(Command) > -1) {
          CmdData.shift()
          let CommandData = CmdData.join(' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          log.info('Command "' + Data['params']['text'] + '" executed on', Chat.Data.Channel, 'by', sender)
          if (Command === 'lamy') {
            Chat.Reply(true, Data['method'] === 'directMsg', sender, Chat.Data.Messages[Command])
          } else if (Command === 'sianko') {
            API.FeedLlamas(sender, CommandData, (response) => {
              if (response === false) {
                Chat.Reply(true, Data['method'] === 'directMsg', sender, Chat.Data.Messages['502API'])
                return
              }
              if (response['result'] == 1) {
                for (let id in chatarr) {
                  chatarr[id].Reply(true, false, sender, util.format(chatarr[id].Data.Messages['PANDAS_FED'], response['count'], CommandData))
                }
              } else if (response['result'] == 2) {
                Chat.Reply(true, Data['method'] === 'directMsg', sender, Chat.Data.Messages['LLAMAS_NOT_ENOUGH_POINTS'])
              } else if (response['result'] == 3) {
                Chat.Reply(true, Data['method'] === 'directMsg', sender, Chat.Data.Messages['LLAMAS_NOT_HUNGRY'])
              }
            })
          } else if (Command === 'bambus') {
            API.FeedPandas(sender, CommandData, (response) => {
              if (response === false) {
                Chat.Reply(true, Data['method'] === 'directMsg', sender, Chat.Data.Messages['502API'])
                return
              }
              if (response['result'] == 1) {
                for (let id in chatarr) {
                  chatarr[id].Reply(true, false, sender, util.format(chatarr[id].Data.Messages['PANDAS_FED'], response['count'], CommandData))
                }
              } else if (response['result'] == 2) {
                Chat.Reply(true, Data['method'] === 'directMsg', sender, Chat.Data.Messages['PANDAS_NOT_ENOUGH_POINTS'])
              } else if (response['result'] == 3) {
                Chat.Reply(true, Data['method'] === 'directMsg', sender, Chat.Data.Messages['PANDAS_NOT_HUNGRY'])
              }
            })
          } else if (Command === 'lamogrosze') {
            let user = CommandData.length == 0 ? sender : CommandData
            API.GetPoints(user, (state) => {
              if (state === false) {
                Chat.Reply(true, Data['method'] === 'directMsg', sender, Chat.Data.Messages['502API'])
                return
              }
              if (user == sender) Chat.Reply(true, Data['method'] === 'directMsg', sender, util.format(Chat.Data.Messages['POINTS_RESPONSE'], state))
              else Chat.Reply(true, Data['method'] === 'directMsg', sender, util.format(Chat.Data.Messages['SOMEONE_POINTS_RESPONSE'], user, state))
            })
          }
        }
      }
    } else if (Data['method'] === 'loginMsg') {
      log.success('Channel', Chat.Data.Channel, 'joined successfuly.')
    } else {
      log.warning('Caught unimplemented message:', Data)
    }
  } else if (Event === '!_CLOSED') {
    log.info('Connection closed for channel', Chat.Data.Channel)
  } else if (Event === 'Ping' || Event === '!_CONNECTED' || Data === '0::') {
    // drop event because it's not neccesary to handle it
  } else {
    log.warning('Caught unimplemented event:', Event)
    log.warning('Dump:', Data)
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
          Token: token,
          Prefix: creds['Prefix'],
          NameColor: creds['NameColor'],
          EnabledCmds: creds['EnabledCommands'],
          Aliases: creds['Aliases'],
          Messages: creds['Messages'],
          Whispers: creds['Whispers'],
          GiveawayPoints: false
        }
        let chat = server.GetChat(Handle, Data)
        chatarr.push(chat)
      })
    })
  })
}

const interval1 = setInterval(() => {
  // Announcement & point giving
  IgnoreUsers = []
  ForEachChat((Chat, id) => {
    IgnoreUsers.push(Chat.Username)
  })
  ForEachChat((Chat, id) => {
    
    try {
      log.info("Sending announcement to", Chat.Channel)
      Chat.SendMessage(true, Chat.Data.Messages['ANNOUNCEMENT'])
      log.info("Switching points lock on", Chat.Channel)
      chatarr[id].Data.GiveawayPoints = true
      log.info("Fetching user list from", Chat.Channel)
      Chat.GetUserList()
    } catch(e) {}
  })
}, 10000)

function ForEachChat (Callback) {
  for (let id in chatarr) {
    Callback(chatarr[id], id)
  }
}

function DisconnectAll () {
  ForEachChat((chat, id) => {
    try {
      chat.Leave()
    } catch (e) {}
  })
  clearInterval(interval1)
}

process.on('exit', DisconnectAll)
process.on('SIGINT', DisconnectAll)
