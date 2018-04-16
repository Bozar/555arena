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

// ----- Initialization +++++
window.onload = function () {
  if (!ROT.isSupported()) {
    window.alert(Game.text.devError('browser'))
    return
  }
  document.getElementById('game').appendChild(Game.display.getContainer())
  // Game.screens.classSeed.enter()

  // Game.keyboard.listenEvent('add', 'classSeed')

  Game.display.draw(Game.UI.status.getX(), Game.UI.status.getY(), '#')
  Game.display.draw(Game.UI.status.getX() + Game.UI.status.getWidth() - 1,
    Game.UI.status.getY(), '#')
  Game.display.draw(Game.UI.status.getX(),
    Game.UI.status.getY() + Game.UI.status.getHeight() - 1, '#')
  Game.display.draw(Game.UI.status.getX() + Game.UI.status.getWidth() - 1,
    Game.UI.status.getY() + Game.UI.status.getHeight() - 1, '#')
  // Game.display.draw(Game.UI.modeline.getX(), Game.UI.modeline.getY(), 'm')
  Game.display.drawText(Game.UI.modeline.getX(), Game.UI.modeline.getY(),
    '1111111111111111111111111111111111111111111111111112')
  // Game.display.draw(Game.UI.modeline.getX() + Game.UI.modeline.getWidth() - 1,
  // Game.UI.modeline.getY(), 'm')
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
  Game.display.drawText(Game.UI.dungeon.getX(),
    Game.UI.dungeon.getY() + Game.UI.dungeon.getHeight() - 0.3,
    '----------------------------------------------------')
}
