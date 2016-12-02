const assert = require('assert')
const server = require('../Hitbox/Server.js')

describe('Server', () => {
  describe('Find()', () => {
    it('should return server address, not null', () => {
      server.Find((server) => {
        assert.equal('string', typeof server.Address)
      })
    })
  })
  describe('GetWebsocketID()', () => {
    it('should return websocket id, not null', () => {
      server.Find((server) => {
        server.GetWebsocketID((id) => {
          assert.equal('string', typeof id)
        })
      })
    })
  })
})