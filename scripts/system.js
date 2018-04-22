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

Game.system.isMarker = function (actor) {
  return actor.getID() === Game.entities.get('marker').getID()
}

Game.system.isItem = function (item) {
  if (!item.getMaxCharge) {
    if (Game.getDevelop()) {
      console.log(item + 'is not an item.')
    }
    return false
  }
  return true
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
  let energyCost = actor.Move.getMoveEnergy()
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
    Game.system.loseEnergy(actor, actor.Move.getWaitEnergy())
    hasMoved = true
  }

  function moveLeft () {
    if (Game.system.isWalkable(position.getX() - 1, position.getY(), actor) &&
      Game.system.loseEnergy(actor, energyCost)) {
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
    if (Game.system.isWalkable(position.getX() + 1, position.getY(), actor) &&
      Game.system.loseEnergy(actor, energyCost)) {
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
    if (Game.system.isWalkable(position.getX(), position.getY() - 1, actor) &&
      Game.system.loseEnergy(actor, energyCost)) {
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
    if (Game.system.isWalkable(position.getX(), position.getY() + 1, actor) &&
      Game.system.loseEnergy(actor, energyCost)) {
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
  let position = Game.entities.get('pc').Position
  let dungeon = Game.entities.get('dungeon')
  let walkable = false

  if (e && Game.system.isMarker(e)) {
    let inSight = []

    dungeon.fov.compute(position.getX(), position.getY(), position.getSight(),
      function (x, y) { inSight.push(x + ',' + y) })

    walkable = inSight.indexOf(x + ',' + y) > -1
  } else {
    walkable = dungeon.Dungeon.getTerrain().get(x + ',' + y) === 0 &&
      !Game.system.npcHere(x, y) &&
      !Game.system.pcHere(x, y)
  }

  return walkable
}

Game.system.pcAct = function () {
  Game.entities.get('timer').engine.lock()

  Game.system.restoreByTurn(Game.entities.get('pc'))
  // Game.system.updateStatus(pc)
  Game.entities.get('pc').FastMove.getFastMove() && Game.system.fastMove()

  Game.input.listenEvent('add', 'main')
}

Game.system.unlockEngine = function (duration, actor) {
  Game.system.isPC(actor) && actor.LastAction.setLastAction(duration)

  Game.entities.get('timer').scheduler.setDuration(duration)
  Game.entities.get('timer').engine.unlock()

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

Game.system.exploreMode = function (interact, range) {
  let marker = Game.entities.get('marker')
  let markerPos = marker.Position
  let pc = Game.entities.get('pc')
  let npc = Game.entities.get('npc')
  let pcPos = pc.Position
  let action = Game.input.getAction
  let pcHere = Game.system.pcHere
  let npcHere = Game.system.npcHere
  let mainScreen = Game.screens.main

  let saveSight = pcPos.getSight()
  let spacePressed = false
  let escPressed = false
  let targetFound = null

  markerPos.setX(pcPos.getX())
  markerPos.setY(pcPos.getY())
  Number.isInteger(range) && range >= 0 && pcPos.setSight(range)

  let targetList = Game.system.targetInSight(pc, pcPos.getSight(), npc) || []
  sortTarget()

  // draw the marker on PC's position
  // draw mode and range in the modeline
  if (mainScreen.getMode() === 'main') {
    mainScreen.setMode('explore',
      Game.text.modeLine('range') + Game.system.getRange(markerPos, pcPos))
  }
  Game.display.clear()
  Game.screens.main.display()

  Game.input.listenEvent('remove', 'main')
  Game.input.listenEvent('add', moveMarker)

  // helper functions
  function moveMarker (e) {
    if (e.shiftKey) {
      if (action(e, 'fastMove')) {
        for (let i = 0; i < pcPos.getSight(); i++) {
          if (!Game.system.move(action(e, 'fastMove'), marker, true)) { break }
        }
      }
    } else if (action(e, 'move')) {
      Game.system.move(action(e, 'move'), marker, true)
    } else if (action(e, 'pause') === 'nextTarget') {
      lockTarget(action(e, 'pause'))
    } else if (action(e, 'pause') === 'previousTarget') {
      lockTarget(action(e, 'pause'))
    } else if (action(e, 'fixed') === 'space') {
      switch (mainScreen.getMode()) {
        case 'explore':
          if (Game.getDevelop()) {
            targetFound = pcHere(markerPos.getX(), markerPos.getY()) ||
              npcHere(markerPos.getX(), markerPos.getY())
            targetFound && targetFound.print()
          }
          break
        case 'aim':
          targetFound = npcHere(markerPos.getX(), markerPos.getY())
          spacePressed = targetFound !== null
          break
      }
    } else if (action(e, 'fixed') === 'esc') {
      escPressed = true
      // testing
    } else if (Game.getDevelop()) {
      if (e.key === '0') {
        Game.system.createDummy()
      }
    }

    if (spacePressed || escPressed) {
      markerPos.setX(null)
      markerPos.setY(null)
      pcPos.setSight(saveSight)
      mainScreen.setMode('main')
    }

    // update range
    if (mainScreen.getMode() === 'explore') {
      mainScreen.setMode('explore',
        Game.text.modeLine('range') + Game.system.getRange(markerPos, pcPos))
    }
    Game.screens.drawDescription(markerPos.getX(), markerPos.getY())
    Game.display.clear()
    mainScreen.display()

    if (spacePressed) {
      Game.keyboard.listenEvent('remove', moveMarker)
      // interact with the target under marker
      interact.call(interact, targetFound)
    } else if (escPressed) {
      Game.input.listenEvent('remove', moveMarker)
      Game.input.listenEvent('add', 'main')
    }
  }

  function sortTarget () {
    if (!targetList.length) {
      return false
    }

    targetList.sort((left, right) => {
      let pcX = pcPos.getX()
      let leftX = left.Position.getX()
      let leftY = left.Position.getY()
      let rightX = right.Position.getX()
      let rightY = right.Position.getY()

      if (leftX > pcX && rightX > pcX) {
        if (leftX > rightX) {
          return true
        } else if (leftX === rightX) {
          return leftY > rightY
        } else {
          return false
        }
      } else if (leftX <= pcX && rightX <= pcX) {
        if (leftX > rightX) {
          return false
        } else if (leftX === rightX) {
          return leftY < rightY
        } else {
          return true
        }
      } else {
        return leftX < rightX
      }
    })

    return true
  }

  function lockTarget (order) {
    let nextIndex = 0
    let previousIndex = targetList.length - 1

    if (previousIndex < 0) {
      return false
    }

    for (let i = 0; i < targetList.length; i++) {
      if (targetList[i].Position.getX() === markerPos.getX() &&
        targetList[i].Position.getY() === markerPos.getY()) {
        nextIndex = i + 1 < targetList.length
          ? i + 1
          : 0
        previousIndex = i - 1 > -1
          ? i - 1
          : targetList.length - 1
      }
    }

    switch (order) {
      case 'nextTarget':
        markerPos.setX(targetList[nextIndex].Position.getX())
        markerPos.setY(targetList[nextIndex].Position.getY())
        return true
      case 'previousTarget':
        markerPos.setX(targetList[previousIndex].Position.getX())
        markerPos.setY(targetList[previousIndex].Position.getY())
        return true
    }
  }
}

Game.system.createDummy = function () {
  let x = Game.entities.get('marker').Position.getX()
  let y = Game.entities.get('marker').Position.getY()

  let id = Game.entity.npc('dmy')
  let actor = Game.entities.get('npc').get(id)

  actor.Position.setX(x)
  actor.Position.setY(y)
}

Game.system.getRange = function (source, target) {
  let x = Math.abs(source.getX() - target.getX())
  let y = Math.abs(source.getY() - target.getY())

  return Math.max(x, y)
}

Game.system.getCurrentTurn = function () {
  return Number.parseFloat(
    Game.entities.get('timer').scheduler.getTime().toFixed(1))
}

Game.system.counter2Charge = function (item) {
  if (Game.system.isItem(item) && (item.getCurrentCounter() <= 0)) {
    item.setCurrentCharge(
      Math.min(item.getCurrentCharge() + item.getRestore(),
        item.getMaxCharge()))
    if (item.hasMaxCharge()) {
      item.setCurrentCounter(0)
      if (item.isPotion() || item.isEnergy()) {
        item.setStartTurn(null)
      }
    } else {
      item.setCurrentCounter(item.getMaxCounter())
      if (item.isPotion() || item.isEnergy()) {
        item.setStartTurn(Game.system.getCurrentTurn())
      }
    }
    return true
  }
  return false
}

Game.system.restoreByTurn = function (actor) {
  if (!(actor.HealPotion && actor.FirePotion && actor.IcePotion &&
    actor.Energy)) {
    if (Game.getDevelop()) {
      console.log(actor + ' does not have potion or energy component.')
    }
    return false
  }

  let restoreList =
    [actor.HealPotion, actor.FirePotion, actor.IcePotion, actor.Energy]
  let turnPast = 0

  for (let i = 0; i < restoreList.length; i++) {
    turnPast = Math.floor(
      Game.system.getCurrentTurn() - restoreList[i].getStartTurn())

    if (!restoreList[i].hasMaxCharge() && (turnPast > 0)) {
      restoreList[i].setCurrentCounter(
        restoreList[i].getMaxCounter() - turnPast)
      Game.system.counter2Charge(restoreList[i])
    }
  }
  return true
}

Game.system.loseEnergy = function (actor, energyCost) {
  if (actor.Energy.getCurrentCharge() >= energyCost) {
    actor.Energy.setCurrentCharge(actor.Energy.getCurrentCharge() - energyCost)
    return true
  }
  return false
}
