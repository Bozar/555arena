'use strict'

// ----- Store entities +++++
Game.entities = new Map()
Game.entities.set('dungeon', null)
Game.entities.set('message', null)
Game.entities.set('seed', null)
Game.entities.set('timer', null)
Game.entities.set('marker', null)
Game.entities.set('pc', null)
Game.entities.set('npc', new Map())

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

  e.addComponent(new Game.Component.Position(6))
  e.addComponent(new Game.Component.Move())
  e.addComponent(new Game.Component.FastMove())
  e.addComponent(new Game.Component.Display('@'))
  e.addComponent(new Game.Component.HitPoint(20))
  // e.addComponent(new Game.Component.Combat(25, 70, 12))
  e.addComponent(new Game.Component.LastAction())
  // e.addComponent(new Game.Component.Status())

  e.addComponent(new Game.Component.ItemTemplate('Potion', null, 'Heal', 1),
    'HealPotion')
  e.addComponent(new Game.Component.ItemTemplate('Potion', null, 'Fire', 0),
    'FirePotion')
  e.addComponent(new Game.Component.ItemTemplate('Potion', null, 'Ice', 0),
    'IcePotion')

  e.act = Game.system.pcAct

  Game.entities.set('pc', e)
}

Game.entity.npc = function (trueName) {
  let e = new Game.Factory(trueName)

  e.addComponent(new Game.Component.Position(6))
  e.addComponent(new Game.Component.Display('D'))

  Game.entities.get('npc').set(e.getID(), e)
  return e.getID()
}

Game.entity.seed = function () {
  let e = new Game.Factory('seed')
  e.addComponent(new Game.Component.Seed())

  Game.entities.set('seed', e)
}

Game.entity.timer = function () {
  let e = new Game.Factory('timer')

  e.scheduler = new ROT.Scheduler.Action()
  e.engine = new ROT.Engine(e.scheduler)

  Game.entities.set('timer', e)
}

Game.entity.marker = function () {
  let e = new Game.Factory('marker')

  e.addComponent(new Game.Component.Display('X', 'orange'))
  e.addComponent(new Game.Component.Position())
  e.addComponent(new Game.Component.Move())
  e.addComponent(new Game.Component.FastMove())

  Game.entities.set('marker', e)
}
