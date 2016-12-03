'use strict'
const logger = require('node-logger')
const WebSocketClient = require('websocket').client
const ChatServerClass = require('./ChatServer.js')

/* TODO */
class Chat {
  constructor (ChatServer, Handler) {
    this.WebsocketClient = null
    this.Connection = null
    this.ChatServer = ChatServer
    this.Handler = Handler

    if (this.ChatServer.Address == null) {
      /*
        Recreate ChatServer object.
        However, you should create ChatServer object before you construct Chat.
        This may cause delay.
      */
      logger.warn('The server address not found. Recreating ChatServer object.')
      this.ChatServer = new ChatServerClass(() => {
        this.Handler('!_READY', this)
      }, true)
    } else if (this.ChatServer.WebsocketID == null) {
      // Get websocket ID if it's null. However, this may delay READY event.
      logger.warn('Websocket ID should be found before you initialize Chat object.')
      this.ChatServer.GetWebsocketID(() => {
        this.Handler('!_READY', this)
      })
    } else {
      this.Handler('!_READY', this)
    }
  }

  /*
    Creates a websocket connection to the chat server.
  */
  Connect () {
    this.WebsocketClient = new WebSocketClient()
    this.Websocket.on('connectFailed', (error) => {
      return this.Handler('!_FAILED', error)
    })
    this.Websocket.on('connect', (connection) => {
      this.Connection = connection
      this.Handler('!_CONNECTED')
      this.Connection.on('error', (error) => {
        return this.Handler('!_INTERRUPT', error)
      })
      this.Connection.on('close', () => {
        this.Handler('!_CLOSED')
      })
      this.Connection.on('message', (message) => {
        if (message.type === 'utf8') {
          if (message.utf8Data === '2::') {
            /*
              Handle ping. Extra event is sent to the Handler but the ping is sent automatically
              so it does not need to be handled.
            */
            this.Connection.sendUTF('2::')
            this.Handler('Ping')
          } else if (message.utf8Data === '1::') {
            /*
              Forward event sent when logged in successfuly.
            */
            this.Handler('LoggedIn')
          } else if (message.utf8Data.startsWith('5::::')) {
            /*
              Forward chat event sent when for example someone sent a message,
              subscribed, has been banned, left or sent a whisper.
            */
            this.Handler('Message', JSON.parse(message.utf8Data), this)
          } else {
            /*
              Forward unknown message.
            */
            this.Handler('Unknown', message.utf8Data, this)
          }
        }
      })
    })
  }

  /* TODO */
  Send (Path, Callback) {}
  SendMessage (Path, Callback) {}
  SendMeMessage (Path, Callback) {}
  SendWhisper (Path, Callback) {}
  IfWhisper (Message, MessageCallback, WhisperCallback) {}
}

module.exports = Chat
