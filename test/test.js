'use strict'
const assert = require('assert')
const ChatServer = require('../Hitbox/ChatServer.js')
const auth = require('../Hitbox/Auth.js')

describe('Server', () => {
  describe('Construct(auto)', () => {
    it('resolves automatically server address and websocket id. returns false if failed.', () => {
      new ChatServer((server) => {
        assert.notEqual('boolean', typeof server)
      }, true)
    })
  })
})