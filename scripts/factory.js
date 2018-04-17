'use strict'

// Entity factory
// http://vasir.net/blog/game-development/how-to-build-entity-component-system-in-javascript
Game.Factory = function (name) {
  this.id = (function () {
    // 12345678-{repeat}-{repeat}-{repeat}
    let randomNumber = ''

    while (randomNumber.length < 32) {
      randomNumber += (Math.random() * Math.pow(10, 8) | 0).toString(16)
    }
    return randomNumber.replace(/.{8}/g, '$&' + '-').slice(0, 35)
  }())

  this.entityName = name
}

Game.Factory.prototype.getID = function () { return this.id }

Game.Factory.prototype.addComponent = function (component) {
  this[component._name] = component
}

Game.Factory.prototype.removeComponent = function (name) {
  delete this[name]
}

Game.Factory.prototype.print = function () {
  console.log(JSON.stringify(this, null, 2))
}
