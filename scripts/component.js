'use strict'

Game.Component = {}

Game.Component.Message = function () {
  this._name = 'Message'

  this._message = []

  this.getMessage = function () { return this._message }
}

Game.Component.Dungeon = function () {
  this._name = 'Dungeon'

  this._width = 55
  this._height = 20
  this._deltaX = 0
  this._deltaY = 0
  this._boundary = 5          // move screen when pc is close to the border

  this._terrain = new Map()   // z,x,y: 0(floor) or 1(wall)
  this._memory = []           // explored dungeon

  this.getWidth = function () { return this._width }
  this.getHeight = function () { return this._height }
  this.getDeltaX = function () { return this._deltaX }
  this.getDeltaY = function () { return this._deltaY }
  this.getBoundary = function () { return this._boundary }

  this.getTerrain = function () { return this._terrain }
  this.getMemory = function () { return this._memory }

  this.setDeltaX = function (delta) { this._deltaX = delta }
  this.setDeltaY = function (delta) { this._deltaY = delta }
}

Game.Component.Position = function (range) {
  this._name = 'Position'

  this._x = null
  this._y = null
  this._sight = range || 0   // how far one can see

  this.getX = function () { return this._x }
  this.getY = function () { return this._y }
  this.getSight = function () { return this._sight }

  this.setX = function (pos) { this._x = pos }
  this.setY = function (pos) { this._y = pos }
  this.setSight = function (range) { this._sight = range }
}

Game.Component.Display = function (char, color) {
  this._name = 'Display'

  this._character = char
  this._color = Game.getColor(color) || ''  // Game._color, '#abb2bf'

  this.getCharacter = function () { return this._character }
  this.getColor = function () { return this._color }

  this.setCharacter = function (char) { this._character = char }
  this.setColor = function (color) { this._color = color }
}
