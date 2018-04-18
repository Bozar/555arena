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

Game.Component.Seed = function () {
  this._name = 'Seed'

  this._seed = null       // to start the RNG engine
  this._rawSeed = null    // player's input

  this.getSeed = function () { return this._seed }
  this.getRawSeed = function () { return this._rawSeed }
  this.setSeed = function (seed) {
    if (!seed) {
      this._seed =
        Math.floor((Math.random() * 9 + 1) * Math.pow(10, 9)).toString()
      this._rawSeed = this._seed
    } else {
      this._seed = seed.toString().replace(/^#{0,1}(.+)$/, '$1')
      this._rawSeed = seed
    }
  }
}

Game.Component.Move = function () {
  this._name = 'Move'

  this._moveDuration = 1
  this._waitDuration = 1

  this.getMoveDuration = function () { return this._moveDuration }
  this.getWaitDuration = function () { return this._waitDuration }
}

Game.Component.LastAction = function () {
  this._name = 'LastAction'

  this._lastAction = 0    // how many turns dose the last action take

  this.getLastAction = function () { return this._lastAction }

  this.setLastAction = function (turn) { this._lastAction = turn }
}
