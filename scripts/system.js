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

Game.system.move = function (direction, actor, lockEngine) {
  let position = actor.Position
  let uiDungeon = Game.UI.dungeon
  let eDungeon = Game.entities.get('dungeon').Dungeon
  let dx = eDungeon.getDeltaX()
  let dy = eDungeon.getDeltaY()

  // let duration = Game.system.updateAttribute('moveSpeed', e, null)
  let duration = actor.Move.getMoveDuration()
  let hasMoved = false

  let where = new Map()
  where.set('left', moveLeft)
  where.set('right', moveRight)
  where.set('up', moveUp)
  where.set('down', moveDown)
  where.set('wait', wait1Turn)

  if (actor && actor.Position && where.get(direction)) {
    where.get(direction)()

    if (hasMoved && !lockEngine) {
      Game.input.listenEvent('remove', 'main')
      Game.system.unlockEngine(duration, actor)
    }
  }
  return hasMoved

  // helper functions
  function wait1Turn () {
    duration = actor.Move.getWaitDuration()
    hasMoved = true
  }

  function moveLeft () {
    if (Game.system.isWalkable(position.getX() - 1, position.getY(), actor)) {
      position.setX(position.getX() - 1)

      if (Game.system.isPC(actor) &&
        position.getX() - dx <= eDungeon.getBoundary() &&
        // dx === -1, draw map border on the screen
        dx >= 0) {
        eDungeon.setDeltaX(dx - 1)
      }

      hasMoved = true
    }
  }

  function moveRight () {
    if (Game.system.isWalkable(position.getX() + 1, position.getY(), actor)) {
      position.setX(position.getX() + 1)

      if (Game.system.isPC(actor) &&
        position.getX() - dx >=
        uiDungeon.getWidth() - 1 - eDungeon.getBoundary() &&
        dx <= eDungeon.getWidth() - uiDungeon.getWidth()) {
        eDungeon.setDeltaX(dx + 1)
      }

      hasMoved = true
    }
  }

  function moveUp () {
    if (Game.system.isWalkable(position.getX(), position.getY() - 1, actor)) {
      position.setY(position.getY() - 1)

      if (Game.system.isPC(actor) &&
        position.getY() - dy <= eDungeon.getBoundary() &&
        dy >= 0) {
        eDungeon.setDeltaY(dy - 1)
      }

      hasMoved = true
    }
  }

  function moveDown () {
    if (Game.system.isWalkable(position.getX(), position.getY() + 1, actor)) {
      position.setY(position.getY() + 1)

      if (Game.system.isPC(actor) &&
        position.getY() - dy >=
        uiDungeon.getHeight() - 1 - eDungeon.getBoundary() &&
        dy <= eDungeon.getHeight() - uiDungeon.getHeight()) {
        eDungeon.setDeltaY(dy + 1)
      }

      hasMoved = true
    }
  }
}

// refer: Game.system.pcAct
Game.system.fastMove = function (direction, e) {
  let who = e || Game.entities.get('pc')
  let fastMove = who.FastMove
  let npc = Game.entities.get('npc')
  let reset = false

  fastMove.setFastMove(true)
  direction && fastMove.setDirection(direction)

  if (Game.system.isPC(who) &&
    Game.system.targetInSight(who, who.Position.getSight(), npc)) {
    reset = true
  } else if (fastMove.getCurrentStep() <= fastMove.getMaxStep()) {
    fastMove.setCurrentStep(fastMove.getCurrentStep() + 1)
    reset = !Game.system.move(fastMove.getDirection(), who)
  } else {
    reset = true
  }

  if (reset) {
    fastMove.setFastMove(false)
    fastMove.setCurrentStep(0)
    fastMove.setDirection(null)
  }
}

Game.system.isWalkable = function (x, y, e) {
  // let pc = Game.entities.get('pc').Position
  let dungeon = Game.entities.get('dungeon')
  let walkable = false

  // if (e && e.getID() === Game.entities.get('marker').getID()) {
  //   let inSight = []

  //   dungeon.fov.compute(pc.getX(), pc.getY(), pc.getSight(),
  //     function (x, y) { inSight.push(x + ',' + y) })

  //   walkable = inSight.indexOf(x + ',' + y) > -1
  // } else {
  walkable = dungeon.Dungeon.getTerrain().get(x + ',' + y) === 0 &&
    !Game.system.npcHere(x, y) &&
    !Game.system.pcHere(x, y)
  // }

  return walkable
}

Game.system.pcAct = function () {
  Game.entities.get('timer').engine.lock()

  // Game.system.updateStatus(pc)
  Game.entities.get('pc').FastMove.getFastMove() && Game.system.fastMove()

  Game.input.listenEvent('add', 'main')
}

Game.system.unlockEngine = function (duration, actor) {
  Game.system.isPC(actor) && actor.LastAction.setLastAction(duration)

  Game.entities.get('timer').scheduler.setDuration(duration)
  Game.entities.get('timer').engine.unlock()
  // console.log(Game.entities.get('timer').scheduler.getTime())

  Game.display.clear()
  Game.screens.main.display()
}

Game.system.targetInSight = function (observer, sight, target) {
  let fov = Game.entities.get('dungeon').fov
  let observerX = observer.Position.getX()
  let observerY = observer.Position.getY()
  let targetX = null
  let targetY = null
  let targetFound = null

  let targetList = []

  if (Object.getPrototypeOf(target) === Map.prototype) {
    // target === Game.entities.get('npc')
    fov.compute(observerX, observerY, sight, function (x, y) {
      targetFound = Game.system.npcHere(x, y)
      targetFound && targetList.push(targetFound)
    })
  } else {
    targetX = target.Position.getX()
    targetY = target.Position.getY()

    fov.compute(observerX, observerY, sight, function (x, y) {
      if (x === targetX && y === targetY) {
        targetList.push(target)
      }
    })
  }

  return targetList.length > 0 ? targetList : null
}

Game.system.npcHere = function (x, y) {
  let npcFound = null
  let npcX = null
  let npcY = null

  for (const keyValue of Game.entities.get('npc')) {
    npcX = keyValue[1].Position.getX()
    npcY = keyValue[1].Position.getY()

    if (x === npcX && y === npcY) {
      npcFound = keyValue[1]
      break
    }
  }
  return npcFound
}

Game.system.pcHere = function (x, y) {
  let pc = Game.entities.get('pc')
  let pcX = pc.Position.getX()
  let pcY = pc.Position.getY()

  return x === pcX && y === pcY
    ? pc
    : null
}
