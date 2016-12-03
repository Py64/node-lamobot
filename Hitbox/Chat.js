'use strict'
const logger = require('node-logger')
const WebSocket = require('ws')
const ChatServerClass = require('./ChatServer.js')

class Chat {
  constructor (ChatServer, Handler, Data = null) {
    this.Connection = null
    this.ChatServer = ChatServer
    this.Handler = Handler
    this.MsgId = 0 // workaround: duplicate message
    this.Data = Data // store here everything else that may be required by handler

    if (this.ChatServer.PlainAddress == null) {
      /*
        Recreate ChatServer object.
        However, you should create ChatServer object before you construct Chat.
        This may cause delay.
      */
      logger.warn('The server address not found. Recreating ChatServer object.')
      this.ChatServer = new ChatServerClass(() => {
        this.Handler('!_READY', null, this)
      }, true)
    } else if (this.ChatServer.WebsocketID == null) {
      // Get websocket ID if it's null. However, this may delay READY event.
      logger.warn('Websocket ID should be found before you initialize Chat object.')
      this.ChatServer.GetWebsocketID(() => {
        this.Handler('!_READY', null, this)
      })
    } else {
      this.Handler('!_READY', null, this)
    }
  }

  /*
    Creates a websocket connection to the chat server.
  */
  Connect () {
    this.Connection = new WebSocket('ws://' + this.ChatServer.PlainAddress + '/socket.io/1/websocket/' + this.ChatServer.WebsocketID)
    this.Connection.on('error', (error) => {
      return this.Handler('!_INTERRUPT', error, this)
    })
    this.Connection.on('open', () => {
      this.Handler('!_CONNECTED', null, this)
    })
    this.Connection.on('close', () => {
      this.Handler('!_CLOSED', null, this)
    })
    this.Connection.on('message', (message, flags) => {
      if (message === '2::') {
        /*
          Handle ping. Extra event is sent to the Handler but the ping is sent automatically
          so it does not need to be handled.
        */
        this.Connection.send('2::')
        this.Handler('Ping', null, this)
      } else if (message === '1::') {
        /*
          Forward event sent when connected successfuly.
        */
        this.Handler('Connected', null, this)
      } else if (message === '7:::1+0') {
        /*
          Websocket ID is wrong.
       */
        this.Handler('WrongWebsocketID', null, this)
      } else if (message.startsWith('5:::')) {
        /*
          Forward chat event sent when for example someone sent a message,
          subscribed, has been banned, left or sent a whisper.

          Handler receives only args of message.
        */
        this.Handler('Message', JSON.parse(JSON.parse(message.substr(4))['args'][0]), this)
      } else {
        /*
          Forward unknown message.
        */
        this.Handler('Unknown', message, this)
      }
    })
  }

  /*
    Sends a JSON to the server.
  */
  Send (Json) {
    this.Connection.send('5:::' + JSON.stringify({name: 'message', args: [Json]}))
  }

  /*
    Join channel
  */
  JoinChannel (Channel, Username, Token, NameColor, NoBacklog = true) {
    this.Token = Token
    this.Username = Username
    this.Channel = Channel
    this.NameColor = NameColor
    this.NoBacklog = NoBacklog
    this.Send({
      method: 'joinChannel',
      params: {
        channel: this.Channel,
        name: this.Username,
        token: this.Token,
        hideBuffered: this.NoBacklog
      }
    })
  }

  /*
    Leave channel (logout)
  */
  Leave () {
    this.Send({
      method: 'partChannel',
      params: {
        name: this.Username
      }
    })
    this.Connection.close()
    logger.success('Left', this.Channel)
  }

  SendMessage (me, ...msg) {
    this.MsgId++ // workaround: duplicate message
    let Data = {
      method: 'chatMsg',
      params: {
        channel: this.Channel,
        name: this.Username,
        nameColor: this.NameColor
      }
    }
    Data.params.text = msg.join(' ') + " #" + this.MsgId
    if (me) Data.params.type = 'me'
    this.Send(Data)
  }
  
  Reply (me, isWhisper, User, ...msg) {
    if (isWhisper) this.SendWhisper(User, '@' + User + ', ', ...msg)
    else this.SendMessage(me, '@' + User + ', ', ...msg)
  }
  
  SendWhisper (Receiver, ...msg) {
    this.MsgId++ // workaround: duplicate message
    let Data = {
      method: 'directMsg',
      params: {
        channel: this.Channel,
        from: this.Username,
        nameColor: this.NameColor
      }
    }
    Data.params.text = msg.join(' ') + " #" + this.MsgId
    Data.params.to = Receiver
    console.dir(Data)
    this.Send(Data)
  }
}

module.exports = Chat
