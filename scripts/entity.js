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

Game.entity.dungeon = function () {
  let e = new Game.Factory('dungeon')
  e.addComponent(new Game.Component.Dungeon())

  cellular()

  e.light = function (x, y) {
    return e.Dungeon.getTerrain().get(x + ',' + y) === 0
  }
  e.fov = new ROT.FOV.PreciseShadowcasting(e.light)

  Game.entities.set('dungeon', e)

  // helper functions
  function cellular () {
    let cell = new ROT.Map.Cellular(e.Dungeon.getWidth(), e.Dungeon.getHeight())

    cell.randomize(0.5)
    for (let i = 0; i < 5; i++) { cell.create() }
    cell.connect(function (x, y, wall) {
      e.Dungeon.getTerrain().set(x + ',' + y, wall)
    })
  }
}

Game.entity.pc = function () {
  let e = new Game.Factory('pc')

  // e.addComponent(new Game.Component.ActorName('Nameless One', null))
  e.addComponent(new Game.Component.Position(6))
  // e.addComponent(new Game.Component.FastMove())
  e.addComponent(new Game.Component.Display('@'))
  // e.addComponent(new Game.Component.HitPoint(64))
  // e.addComponent(new Game.Component.Combat(25, 70, 12))
  // e.addComponent(new Game.Component.ActorClock())
  // e.addComponent(new Game.Component.Status())

  // e.act = Game.system.pcAct

  Game.entities.set('pc', e)
}
