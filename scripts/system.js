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

Game.system.isPC = function (actor) {
  return actor.getID() === Game.entities.get('pc').getID()
}

Game.system.placeActor = function (actor) {
  let x = 0
  let y = 0
  let dungeon = Game.entities.get('dungeon').Dungeon
  let boundary = dungeon.getBoundary()
  let mapWidth = dungeon.getWidth()
  let mapHeight = dungeon.getHeight()
  let uiWidth = Game.UI.dungeon.getWidth()
  let uiHeight = Game.UI.dungeon.getHeight()

  if (Game.system.isPC(actor)) {
    placePC()
  }

  actor.Position.setX(x)
  actor.Position.setY(y)

  function placePC () {
    do {
      x = Math.floor(ROT.RNG.getUniform() * mapWidth)
      y = Math.floor(ROT.RNG.getUniform() * mapHeight)
    } while ((dungeon.getTerrain().get(x + ',' + y) !== 0) ||
    x < boundary || (x > mapWidth - boundary) ||
    y < boundary || (y > mapHeight - boundary))

    dungeon.setDeltaX(x - Math.ceil(uiWidth / 2) > 0
      ? Math.min(x - Math.ceil(uiWidth / 2), mapWidth - uiWidth)
      : 0)
    dungeon.setDeltaY(y - Math.ceil(uiHeight / 2) > 0
      ? Math.min(y - Math.ceil(uiHeight / 2), mapHeight - uiHeight)
      : 0)
  }
}
