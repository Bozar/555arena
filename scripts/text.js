'use strict'

Game.text = {}

Game.text.modeLine = function (id) {
  let text = new Map()

  text.set('explore', '[Exp]')
  text.set('aim', '[Aim]')

  text.set('space', 'Press Space to continue')
  text.set('enter', 'Press Enter to confirm')
  text.set('yesNoLower', 'Press y or n')
  text.set('range', 'Range: ')

  return text.get(id)
}

Game.text.ui = function (id) {
  let text = new Map()

  text.set('hp', 'HP: ')
  text.set('energy', 'EN: ')
  text.set('turn', 'TN: ')
  text.set('heal', 'Heal')
  text.set('fire', 'Fire')
  text.set('ice', 'Ice')
  text.set('gift', 'Gift')

  return text.get(id)
}

Game.text.error = function (id) {
  let text = new Map()

  text.set('browser', 'Rot.js is not supported by your browser.')

  return text.get(id)
}
