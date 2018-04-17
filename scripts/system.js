'use strict'

Game.system = {}

Game.system.addMessage = function (newMsg) {
  let eMessage = Game.entities.get('message').Message.getMessage()

  if (!newMsg) { return false }

  eMessage.push(String(newMsg))
  while (eMessage.length > Game.UI.message.getHeight()) {
    eMessage.shift()
  }

  return true
}
