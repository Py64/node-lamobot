const server = require('../Hitbox/Server.js')
const logger = require('node-logger')

server.Find((server) => {
  logger.info('Found server:', server.Address)
})
