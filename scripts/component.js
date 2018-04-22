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

Game.Component.FastMove = function () {
  this._name = 'FastMove'

  this._isFastMove = false
  this._maxStep = 9
  this._currentStep = 0
  this._direction = null

  this.getFastMove = function () { return this._isFastMove }
  this.getMaxStep = function () { return this._maxStep }
  this.getCurrentStep = function () { return this._currentStep }
  this.getDirection = function () { return this._direction }

  this.setFastMove = function (status) { this._isFastMove = status }
  this.setCurrentStep = function (step) { this._currentStep = step }
  this.setDirection = function (direction) { this._direction = direction }
}

Game.Component.LastAction = function () {
  this._name = 'LastAction'

  this._lastAction = 0    // how many turns dose the last action take

  this.getLastAction = function () { return this._lastAction }
  this.setLastAction = function (turn) { this._lastAction = turn }
}

Game.Component.ItemTemplate = function (mainType, subType, prefix, level) {
  this._name = prefix + (subType || mainType) + level

  this._mainType = mainType
  this._subType = subType || mainType
  this._prefix = prefix
  this._level = level
  this._stageName =
    Game.text.itemLevel(this._level) + ' ' + this._prefix + ' ' + this._subType

  // recharge & counter
  // potion: recharge 1 every _maxCounter turns
  // weapon: recharge 1 every _maxCounter kills
  // ring: cannot recharge, destroy when _currentCharge === 0
  switch (this._mainType) {
    case 'Potion':
      this._maxCharge = this._level * 2 + 1     // 1, 3, 5
      this._maxCounter = 6
      break
    case 'Weapon':
      this._maxCharge = 1
      this._maxCounter = 8
      break
    case 'Ring':
      switch (this._level) {
        case 0:
          this._maxCharge = 3
          this._maxCounter = null
          break
        case 1:
          this._maxCharge = 7
          this._maxCounter = null
          break
        case 2:   // master ring provides constant buffs
          this._maxCharge = null
          this._maxCounter = null
          break
      }
      break
  }

  this._currentCharge = this._maxCharge
  this._currentCounter = this._maxCounter > 0 ? 0 : null
  this._startTurn = null

  this.getStageName = function () { return this._stageName }
  this.getMaxCharge = function () { return this._maxCharge }
  this.getCurrentCharge = function () { return this._currentCharge }
  this.getMaxCounter = function () { return this._maxCounter }
  this.getCurrentCounter = function () { return this._currentCounter }
  this.getPrefix = function () { return this._prefix }
  this.getStartTurn = function () { return this._startTurn }

  this.setMaxCharge = function (number) { this._maxCharge = number }
  this.setCurrentCharge = function (number) { this._currentCharge = number }
  this.setMaxCounter = function (number) { this._maxCounter = number }
  this.setCurrentCounter = function (number) { this._currentCounter = number }
  this.setStartTurn = function (number) { this._startTurn = number }

  this.hasMaxCharge = function () {
    return this._currentCharge === this._maxCharge
  }
  this.isUsable = function () {
    return this._currentCharge > 0
  }
  this.isPotion = function () {
    return this._mainType === 'Potion'
  }
  this.isRing = function () {
    return this._mainType === 'Ring'
  }
  this.isWeapon = function () {
    return this._mainType === 'Weapon'
  }
}

Game.Component.HitPoint = function (hp) {
  this._name = 'HitPoint'

  this._maxHP = hp
  this._currentHP = this._maxHP
  this._heal = Math.floor(this._maxHP * 0.4)
  this._regen = Math.floor(this._maxHP * 0.2)

  this.getMaxHP = function () { return this._maxHP }
  this.getCurrentHP = function () { return this._currentHP }

  this.heal = function () {
    this._currentHP = Math.min(this._currentHP + this._heal, this._maxHP)
  }
  this.regen = function () {
    this._currentHP = Math.min(this._currentHP + this._regen, this._maxHP)
  }
  this.damage = function (dmg) {
    this._currentHP = Math.max(this._currentHP - dmg, 0)
  }
}
