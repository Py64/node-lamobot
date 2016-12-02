const assert = require('assert')
const server = require('../Hitbox/Server.js')
const auth = require('../Hitbox/Auth.js')

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
if (process.env.USER_NAME_AUTHTEST != null && process.env.USER_PASS_AUTHTEST != null) {
  describe('Auth', () => {
    describe('GetToken()', () => {
      it('should return user token, not null. uses GetUser()', () => {
        auth.GetToken(process.env.USER_NAME_AUTHTEST, process.env.USER_PASS_AUTHTEST, (token) => {
          assert.equal('string', typeof token)
        })
      })
    })
  })
}