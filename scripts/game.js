'use strict'

// ----- Version number, development switch, seed & color +++++
var Game = {}
Game._version = '0.0.1-dev'
Game._develop = true
Game.getVersion = function () { return this._version }
Game.getDevelop = function () { return this._develop }
Game.setDevelop = function () {
  this._develop = !this._develop
  return true
}

// set seed manually for testing, '#' can be omitted
// there are no hyphens ('-') inside numbered seed
// example:
// Game._devSeed = '#12345'
Game.getDevSeed = function () { return this._devSeed }

Game._color = new Map()
Game._color.set(null, '')
Game._color.set('white', '#ABB2BF')
Game._color.set('black', '#262626')
Game._color.set('grey', '#666666')
Game._color.set('orange', '#FF9900')
Game._color.set('green', '#A0D86C')
Game._color.set('yellow', '#FFE272')
Game._color.set('red', '#FF4C4C')

Game.getColor = function (color) { return Game._color.get(color) }

// ----- Key-bindings +++++
Game.input = {}
Game.input.keybind = new Map()
// [mode1: [keybind1], mode2: [keybind2], ...]
// keybind1 -> [action1: [key1_1, key1_2, ...],
//              action2: [key2_1, key2_2, ...], ...]

// keys that cannot be remapped by player
Game.input.keybind.set('fixed', new Map())
Game.input.keybind.get('fixed').set('space', [' '])
Game.input.keybind.get('fixed').set('enter', ['Enter'])
Game.input.keybind.get('fixed').set('esc', ['Escape'])

// movement
Game.input.keybind.set('move', new Map())
Game.input.keybind.get('move').set('left', ['h', 'ArrowLeft'])
Game.input.keybind.get('move').set('down', ['j', 'ArrowDown'])
Game.input.keybind.get('move').set('up', ['k', 'ArrowUp'])
Game.input.keybind.get('move').set('right', ['l', 'ArrowRight'])
Game.input.keybind.get('move').set('wait', ['.'])

Game.input.keybind.set('fastMove', new Map())
Game.input.keybind.get('fastMove').set('left', ['H', 'ArrowLeft'])
Game.input.keybind.get('fastMove').set('down', ['J', 'ArrowDown'])
Game.input.keybind.get('fastMove').set('up', ['K', 'ArrowUp'])
Game.input.keybind.get('fastMove').set('right', ['L', 'ArrowRight'])

// attack actions
Game.input.keybind.set('attack', new Map())
Game.input.keybind.get('attack').set('quick', ['f'])
Game.input.keybind.get('attack').set('power', ['d'])
Game.input.keybind.get('attack').set('special', ['s'])
Game.input.keybind.get('attack').set('switch', ['a'])

// gifted actions
Game.input.keybind.set('gift', new Map())
Game.input.keybind.get('gift').set('prefix', ['g'])
Game.input.keybind.get('gift').set('potion', ['f'])
Game.input.keybind.get('gift').set('weapon', ['d'])
Game.input.keybind.get('gift').set('ring', ['s'])

// maneuver actions
Game.input.keybind.set('maneuver', new Map())
Game.input.keybind.get('maneuver').set('drink', ['q'])
Game.input.keybind.get('maneuver').set('fire', ['w'])
Game.input.keybind.get('maneuver').set('ice', ['e'])
Game.input.keybind.get('maneuver').set('heal', ['r'])

// actions that do not take in-game time
Game.input.keybind.set('pause', new Map())
Game.input.keybind.get('pause').set('explore', ['x'])
Game.input.keybind.get('pause').set('nextTarget', ['PageDown', 'o'])
Game.input.keybind.get('pause').set('previousTarget', ['PageUp', 'i'])
Game.input.keybind.get('pause').set('develop', ['~'])
Game.input.keybind.get('pause').set('printSeed', ['`'])

Game.input.getAction = function (keyInput, mode) {
  if (!mode) {
    Game.getDevelop() && console.log('Undefined mode.')
    return null
  }

  for (const [key, value] of Game.input.keybind.get(mode)) {
    if (value.indexOf(keyInput.key) > -1) {
      return key
    }
  }
  return null
}

Game.input.listenEvent = function (event, handler) {
  handler = Game.screens[String(handler)]
    ? Game.screens[handler].keyInput
    : handler

  switch (event) {
    case 'add':
      window.addEventListener('keydown', handler)
      break
    case 'remove':
      window.removeEventListener('keydown', handler)
      break
  }
}

// ----- The position & size of screen elements +++++
Game.UI = function (width, height) {
  this._width = width || null
  this._height = height || null

  this._x = null
  this._y = null
}

Game.UI.prototype.getWidth = function () { return this._width }
Game.UI.prototype.getHeight = function () { return this._height }
Game.UI.prototype.getX = function () { return this._x }
Game.UI.prototype.getY = function () { return this._y }

Game.UI.canvas = new Game.UI(70, 26)

Game.display = new ROT.Display({
  width: Game.UI.canvas.getWidth(),
  height: Game.UI.canvas.getHeight(),
  fg: Game.getColor('white'),
  bg: Game.getColor('black'),
  fontSize: 20,
  fontFamily: (function () {
    let family = 'dejavu sans mono'
    family += ', consolas'
    family += ', monospace'

    return family
  }())
})

// ``` The main screen +++
Game.UI.padTopBottom = 0.5
Game.UI.padLeftRight = 1
Game.UI.padModeStatus = 1
Game.UI.padModeMessage = 0
Game.UI.padMessageDungeon = 1

Game.UI.status = new Game.UI(15, null)
Game.UI.status._height = Game.UI.canvas.getHeight() - Game.UI.padTopBottom * 2
Game.UI.status._x = Game.UI.canvas.getWidth() -
  Game.UI.padLeftRight - Game.UI.status.getWidth()
Game.UI.status._y = Game.UI.padTopBottom

Game.UI.modeline = new Game.UI(null, 1)
Game.UI.modeline._width = Game.UI.canvas.getWidth() - Game.UI.padLeftRight * 2 -
  Game.UI.padModeStatus - Game.UI.status.getWidth()
Game.UI.modeline._x = Game.UI.padLeftRight
Game.UI.modeline._y = Game.UI.canvas.getHeight() - Game.UI.padTopBottom -
  Game.UI.modeline.getHeight()

Game.UI.message = new Game.UI(Game.UI.modeline.getWidth(), 8)
Game.UI.message._x = Game.UI.modeline.getX()
Game.UI.message._y = Game.UI.modeline.getY() - Game.UI.padModeMessage -
  Game.UI.message.getHeight()

Game.UI.dungeon = new Game.UI(Game.UI.modeline.getWidth(), null)
Game.UI.dungeon._height = Game.UI.canvas.getHeight() - Game.UI.padTopBottom -
  Game.UI.modeline.getHeight() - Game.UI.padModeMessage -
  Game.UI.message.getHeight() - Game.UI.padMessageDungeon
// the dungeon size should be an integer
Game.UI.dungeon._height = Math.floor(Game.UI.dungeon._height)
Game.UI.dungeon._x = Game.UI.padLeftRight
Game.UI.dungeon._y = Game.UI.padTopBottom

// ``` UI blocks +++
Game.UI.hpEnergy = new Game.UI(Game.UI.status.getWidth(), 2)
Game.UI.hpEnergy._x = Game.UI.status.getX()
Game.UI.hpEnergy._y = Game.UI.status.getY() + 2

Game.UI.potion = new Game.UI(Game.UI.status.getWidth(), 3)
Game.UI.potion._x = Game.UI.status.getX()
Game.UI.potion._y = Game.UI.hpEnergy.getY() + Game.UI.hpEnergy.getHeight() + 1

Game.UI.gift = new Game.UI(Game.UI.status.getWidth(), 1)
Game.UI.gift._x = Game.UI.status.getX()
Game.UI.gift._y = Game.UI.potion.getY() + Game.UI.potion.getHeight() + 1

Game.UI.turn = new Game.UI(Game.UI.status.getWidth(), 1)
Game.UI.turn._x = Game.UI.status.getX()
Game.UI.turn._y = Game.UI.gift.getY() + Game.UI.gift.getHeight() + 1

Game.UI.buff = new Game.UI(Game.UI.status.getWidth(), 5)
Game.UI.buff._x = Game.UI.status.getX()
Game.UI.buff._y = Game.UI.turn.getY() + Game.UI.turn.getHeight() + 1

Game.UI.debuff = new Game.UI(Game.UI.status.getWidth(), 5)
Game.UI.debuff._x = Game.UI.status.getX()
Game.UI.debuff._y = Game.UI.buff.getY() + Game.UI.buff.getHeight()

// ----- Screen factory: display content, listen keyboard events +++++
Game.Screen = function (name, mode) {
  this._name = name || 'Unnamed Screen'
  this._mode = mode || 'main'
  this._modeLineText = ''
}

Game.Screen.prototype.getName = function () { return this._name }
Game.Screen.prototype.getMode = function () { return this._mode }
Game.Screen.prototype.getText = function () { return this._modeLineText }

Game.Screen.prototype.setMode = function (mode, text) {
  this._mode = mode || 'main'
  this._modeLineText = Game.text.modeLine(this._mode) + ' ' + (text || '')

  return true
}

Game.Screen.prototype.enter = function () {
  Game.screens._currentName = this.getName()
  Game.screens._currentMode = this.getMode()

  this.initialize(this.getName())
  this.display()
}

Game.Screen.prototype.exit = function () {
  Game.screens._currentName = null
  Game.screens._currentMode = null

  Game.display.clear()
}

Game.Screen.prototype.initialize = function (name) {
  Game.getDevelop() && console.log('Enter screen: ' + name + '.')
}

Game.Screen.prototype.display = function () {
  Game.display.drawText(1, 1, 'Testing screen')
  Game.display.drawText(1, 2, 'Name: ' + Game.screens._currentName)
  Game.display.drawText(1, 3, 'Mode: ' + Game.screens._currentMode)
}

Game.Screen.prototype.keyInput = function (e) {
  Game.getDevelop() && console.log('Key pressed: ' + e.key)
}

// ----- In-game screens & helper functions +++++
Game.screens = {}
Game.screens._currentName = null
Game.screens._currentMode = null

// ``` Helper functions +++
Game.screens.colorfulText = function (text, fgColor, bgColor) {
  return bgColor
    ? '%c{' + Game.getColor(fgColor) + '}%b{' +
    Game.getColor(bgColor) + '}' + text + '%b{}%c{}'
    : '%c{' + Game.getColor(fgColor) + '}' + text + '%c{}'
}

Game.screens.capitalizeFirst = function (text) {
  text = text.toString()
  return text[0].toUpperCase() + text.slice(1)
}

Game.screens.drawAlignRight = function (x, y, width, text, color) {
  Game.display.drawText(x + width - text.length, y,
    color ? Game.screens.colorfulText(text, color) : text)
}

Game.screens.drawBorder = function () {
  let status = Game.UI.status
  let dungeon = Game.UI.dungeon

  for (let i = status.getY(); i < status.getHeight(); i++) {
    Game.display.draw(status.getX() - 1, i, '|')
  }
  for (let i = dungeon.getX(); i < dungeon.getWidth() + 1; i++) {
    Game.display.draw(i, dungeon.getY() + dungeon.getHeight(), '-')
  }
}

Game.screens.drawVersion = function () {
  let version = Game.getVersion()

  Game.getDevelop() && (version = 'Wiz|' + version)
  Game.screens.drawAlignRight(Game.UI.status.getX(), Game.UI.status.getY(),
    Game.UI.status.getWidth(), version, 'grey')
}

Game.screens.drawHPenergy = function () {
  let hp = 14
  let maxHP = 20
  let energy = 1
  let maxEnergy = 5
  let color = hp / maxHP > 0.7
    ? 'white'
    : hp / maxHP > 0.3
      ? 'orange'
      : 'red'
  let x = Game.UI.hpEnergy.getX()
  let y = Game.UI.hpEnergy.getY()

  Game.display.drawText(x, y,
    Game.text.ui('hp') + Game.screens.colorfulText(hp + '/' + maxHP, color))
  Game.display.drawText(x, y + 1,
    Game.text.ui('energy') + energy + '/' + maxEnergy)
}

Game.screens.drawPotion = function () {
  let healCD = 0
  let fireCD = 3
  let iceCD = 0

  let healColor = potionColor(healCD)
  let fireColor = potionColor(fireCD)
  let iceColor = potionColor(iceCD)

  let x = Game.UI.potion.getX()
  let y = Game.UI.potion.getY()
  let width = Game.UI.potion.getWidth()

  Game.display.drawText(x, y,
    Game.screens.colorfulText(Game.text.ui('heal'), healColor))
  Game.display.drawText(x, y + 1,
    Game.screens.colorfulText(Game.text.ui('fire'), fireColor))
  Game.display.drawText(x, y + 2,
    Game.screens.colorfulText(Game.text.ui('ice'), iceColor))

  healCD > 0 &&
    Game.screens.drawAlignRight(x, y, width, healCD.toString(10))
  fireCD > 0 &&
    Game.screens.drawAlignRight(x, y + 1, width, fireCD.toString(10))
  iceCD > 0 &&
    Game.screens.drawAlignRight(x, y + 2, width, iceCD.toString(10))

  function potionColor (cd) {
    return cd > 0 ? 'grey' : 'white'
  }
}

Game.screens.drawGift = function () {
  let hasGift = false
  let color = hasGift ? 'white' : 'grey'

  Game.display.drawText(Game.UI.gift.getX(), Game.UI.gift.getY(),
    Game.screens.colorfulText(Game.text.ui('gift'), color))
}

Game.screens.drawTurn = function () {
  let left = Game.entities.get('pc').LastAction.getLastAction()
  let total = Game.entities.get('timer').scheduler.getTime()

  let intPart = Math.floor(total)
  let floatPart = Number.parseFloat(total - intPart > 0
    ? (total - intPart).toFixed(1)
    : 0.0)

  let right = intPart >= 9999
    ? (intPart - 9999 + floatPart)
    : (intPart + floatPart)

  Game.display.drawText(Game.UI.turn.getX(), Game.UI.turn.getY(),
    'TN: ' + int2floatStr(left) + '/' + int2floatStr(right))

  function int2floatStr (number) {
    return Number.isInteger(number)
      ? number.toString(10) + '.0'
      : number.toString(10)
  }
}

Game.screens.drawEffect = function () {
  let buff = new Map([['fire', 3], ['ice', 2]])
  let debuff = new Map([['burn', 3]])

  let buffKey = Array.from(buff.keys())
  let debuffKey = Array.from(debuff.keys())

  let x = Game.UI.buff.getX()
  let buffY = Game.UI.buff.getY()
  let debuffY = Game.UI.debuff.getY()
  let width = Game.UI.status.getWidth()

  for (let i = 0; i < buffKey.length; i++) {
    Game.display.drawText(x, buffY + i,
      Game.screens.colorfulText(buffKey[i], 'green'))
    Game.screens.drawAlignRight(x, buffY + i, width,
      buff.get(buffKey[i]).toString(10))
  }

  for (let i = 0; i < debuffKey.length; i++) {
    Game.display.drawText(x, debuffY + i,
      Game.screens.colorfulText(debuffKey[i], 'red'))
    Game.screens.drawAlignRight(x, debuffY + i, width,
      debuff.get(debuffKey[i]).toString(10))
  }
}

Game.screens.drawSeed = function () {
  let seed = Game.entities.get('seed').Seed.getRawSeed()
  seed = seed.replace(/^(#{0,1}\d{5})(\d{5})$/, '$1-$2')

  Game.screens.drawAlignRight(
    Game.UI.status.getX(),
    Game.UI.status.getY() + Game.UI.status.getHeight() - 1,
    Game.UI.status.getWidth(),
    seed, 'grey')
}

Game.screens.drawMessage = function (newMsg) {
  let width = Game.UI.message.getWidth()
  let height = Game.UI.message.getHeight()
  let x = Game.UI.message.getX()
  let y = Game.UI.message.getY()

  let pattern = '(.{' + (width - 10) + ',' + width + '}\\s)'
  let onScreen = []

  Game.system.addMessage(newMsg)
  let msgList = Game.entities.get('message').Message.getMessage()

  for (let i = 0; i < msgList.length; i++) {
    onScreen.push(...msgList[i].split(new RegExp(pattern)))
  }
  // https://stackoverflow.com/questions/22044461/
  onScreen = onScreen.filter((i) => { return i.length > 0 })

  for (let i = Math.max(0, onScreen.length - height), j = 0;
    i < onScreen.length; (i++), (j++)) {
    Game.display.drawText(x,
      // if there are less lines than the height,
      // let the last line sit on the bottom
      y + Math.max(0, height - onScreen.length) + j,
      onScreen[i]
    )
  }
}

Game.screens.drawDungeon = function () {
  let ePC = Game.entities.get('pc')
  let ePCpos = ePC.Position
  let eNPC = Game.entities.get('npc')
  let eDungeon = Game.entities.get('dungeon')
  let uiDungeon = Game.UI.dungeon

  let left = uiDungeon.getX()
  let right = uiDungeon.getX() + uiDungeon.getWidth() - 1
  let deltaX = eDungeon.Dungeon.getDeltaX()

  let top = uiDungeon.getY()
  let bottom = uiDungeon.getY() + uiDungeon.getHeight() - 1
  let deltaY = eDungeon.Dungeon.getDeltaY()

  let memory = eDungeon.Dungeon.getMemory()

  memory.length > 0 && drawMemory()

  eDungeon.fov.compute(ePCpos.getX(), ePCpos.getY(), ePCpos.getSight(),
    function (x, y) {
      memory.indexOf(x + ',' + y) < 0 && memory.push(x + ',' + y)

      drawTerrain(x, y)
    })

  drawActor(ePC)
  drawNPC()
  // drawActor(Game.entities.get('marker'))

  function drawMemory () {
    for (let i = 0; i < memory.length; i++) {
      let x = memory[i].split(',')[0]
      let y = memory[i].split(',')[1]

      drawTerrain(x, y, 'grey')
    }
  }

  function drawTerrain (x, y, color) {
    insideScreen(x, y) &&
      Game.display.draw(screenX(x), screenY(y),
        eDungeon.Dungeon.getTerrain().get(x + ',' + y) === 0 ? '.' : '#',
        Game.getColor(color || null))
  }

  function drawActor (actor) {
    let x = actor.Position.getX()
    let y = actor.Position.getY()

    x !== null && y !== null && insideScreen(x, y) &&
      Game.display.draw(screenX(x), screenY(y),
        actor.Display.getCharacter(), actor.Display.getColor())
  }

  function drawNPC () {
    for (const keyValue of eNPC) {
      if (Game.system.targetInSight(ePC, ePCpos.getSight(), keyValue[1])) {
        drawActor(keyValue[1])
      }
    }
  }

  function insideScreen (x, y) {
    return x - deltaX + left === screenX(x) &&
      y - deltaY + top === screenY(y)
  }

  function screenX (x) {
    return Math.min(Math.max(left, x - deltaX + left), right)
  }
  function screenY (y) {
    return Math.min(Math.max(top, y - deltaY + top), bottom)
  }
}

// ``` In-game screens +++
Game.screens.main = new Game.Screen('main')

Game.screens.main.initialize = function () {
  Game.entity.seed()
  Game.entities.get('seed').Seed.setSeed(Game.getDevSeed())
  ROT.RNG.setSeed(Game.entities.get('seed').Seed.getSeed())

  Game.entity.message()
  Game.entity.pc()
  Game.entity.dungeon()
  Game.system.placeActor(Game.entities.get('pc'))

  Game.entity.timer()
  Game.entities.get('timer').scheduler.add(Game.entities.get('pc'), true)
  Game.entities.get('timer').engine.start()
}

Game.screens.main.keyInput = function (e) {
  let keyAction = Game.input.getAction

  if (e.shiftKey) {
    if (keyAction(e, 'pause') === 'develop') {
      Game.setDevelop()
    } else if (keyAction(e, 'fastMove')) {
      Game.system.fastMove(keyAction(e, 'fastMove'))
    }
  } else if (keyAction(e, 'pause') === 'printSeed') {
    console.log(Game.entities.get('seed').Seed.getSeed())
  } else if (keyAction(e, 'move')) {
    Game.system.move(keyAction(e, 'move'), Game.entities.get('pc'))
  } else if (e.key === '0') {   // temp command, create a dummy
    let npc = Game.entity.npc('dmy')
    Game.entities.get('npc').get(npc).Position.setX(
      Game.entities.get('pc').Position.getX() + 1)
    Game.entities.get('npc').get(npc).Position.setY(
      Game.entities.get('pc').Position.getY())
    Game.display.clear()
    Game.screens.main.display()
  }
}

Game.screens.main.display = function () {
  // status panel
  Game.screens.drawBorder()
  Game.screens.drawVersion()
  Game.screens.drawHPenergy()
  Game.screens.drawPotion()
  Game.screens.drawGift()
  Game.screens.drawTurn()
  Game.screens.drawEffect()
  Game.screens.drawSeed()

  // dungeon, message & modeline
  Game.screens.drawMessage()
  Game.screens.drawDungeon()
}

// ----- Initialization +++++
window.onload = function () {
  if (!ROT.isSupported()) {
    window.alert(Game.text.error('browser'))
    return
  }
  document.getElementById('game').appendChild(Game.display.getContainer())

  Game.display.clear()
  Game.screens.main.enter()
}
