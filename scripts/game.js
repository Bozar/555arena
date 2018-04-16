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
Game.input.keybind.get('attack').set('gifted', ['g'])
Game.input.keybind.get('attack').set('switch', ['a'])

// maneuver actions
Game.input.keybind.set('maneuver', new Map())
Game.input.keybind.get('maneuver').set('drink', ['q'])
Game.input.keybind.get('maneuver').set('fire', ['w'])
Game.input.keybind.get('maneuver').set('ice', ['e'])
Game.input.keybind.get('maneuver').set('heal', ['r'])

// actions that do not take in-game time
Game.input.keybind.set('pause', new Map())
Game.input.keybind.get('pause').set('explore', ['x'])
Game.input.keybind.get('pause').set('develop', ['~'])
Game.input.keybind.get('pause').set('nextTarget', ['PageDown', 'o'])
Game.input.keybind.get('pause').set('previousTarget', ['PageUp', 'i'])

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
Game.UI.dungeon._x = Game.UI.padLeftRight
Game.UI.dungeon._y = Game.UI.padTopBottom

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
    Game.display.draw(i, dungeon.getY() + dungeon.getHeight() - 0.3, '-')
  }
}

// ``` In-game screens +++
Game.screens.main = new Game.Screen('main')

Game.screens.main.initialize = function () {
  Game.input.listenEvent('add', 'main')
}

Game.screens.main.keyInput = function (e) {
  if (Game.input.getAction(e, 'move')) {
    console.log(Game.input.getAction(e, 'move'))
  } else {
    console.log(e.key)
  }
}

Game.screens.main.display = function () {
  Game.screens.drawBorder()

  Game.display.draw(Game.UI.status.getX(), Game.UI.status.getY(), '#')
  Game.display.draw(Game.UI.status.getX() + Game.UI.status.getWidth() - 1,
    Game.UI.status.getY(), '#')
  Game.display.draw(Game.UI.status.getX(),
    Game.UI.status.getY() + Game.UI.status.getHeight() - 1, '#')
  Game.display.draw(Game.UI.status.getX() + Game.UI.status.getWidth() - 1,
    Game.UI.status.getY() + Game.UI.status.getHeight() - 1, '#')
  Game.display.drawText(Game.UI.modeline.getX(), Game.UI.modeline.getY(),
    '1111111111111111111111111111111111111111111111111112')
  Game.display.draw(Game.UI.modeline.getX() + Game.UI.modeline.getWidth(),
    Game.UI.modeline.getY(), '|')

  Game.display.draw(Game.UI.message.getX(), Game.UI.message.getY(), 'M')
  Game.display.draw(Game.UI.message.getX() + Game.UI.message.getWidth() - 1,
    Game.UI.message.getY(), 'M')

  Game.display.draw(Game.UI.message.getX(),
    Game.UI.message.getY() + Game.UI.message.getHeight() - 1, 'M')
  Game.display.draw(Game.UI.message.getX() + Game.UI.message.getWidth() - 1,
    Game.UI.message.getY() + Game.UI.message.getHeight() - 1, 'M')

  Game.display.draw(Game.UI.dungeon.getX(), Game.UI.dungeon.getY(), 'D')
  Game.display.draw(Game.UI.dungeon.getX() + Game.UI.dungeon.getWidth() - 1,
    Game.UI.dungeon.getY(), 'D')
  Game.display.draw(Game.UI.dungeon.getX(),
    Game.UI.dungeon.getY() + Game.UI.dungeon.getHeight() - 1, 'D')
}

// ----- Initialization +++++
window.onload = function () {
  if (!ROT.isSupported()) {
    window.alert(Game.text.error('browser'))
    return
  }
  document.getElementById('game').appendChild(Game.display.getContainer())

  // Game.input.listenEvent('add', 'classSeed')

  Game.display.clear()
  Game.screens.main.enter()
}
