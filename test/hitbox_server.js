const server = require('../Hitbox/Server.js')
const logger = require('node-logger')

server.Find((server) => {
  if (server == null) return
  logger.info('Found server:', server.Address)
  server.GetWebsocketID((result) => {
    if (result == null) return
    logger.info('Received websocket ID:', result)
  })
})
