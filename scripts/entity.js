'use strict'

// ----- Store entities +++++
Game.entities = new Map()
Game.entities.set('message', null)

// ----- Create a single entity +++++
Game.entity = {}

Game.entity.message = function () {
  let e = new Game.Factory('message')

  e.addComponent(new Game.Component.Message())

  Game.entities.set('message', e)
}
