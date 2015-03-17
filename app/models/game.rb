class Game
  include Mongoid::Document
  store_in collection: 'games'

  field :player1, type: String
  field :player2, type: String

  field :cardsInPlay: type: Array

  index({ word: 1 }, { unique: true })

  validates_presence_of :player1
  validates_presence_of :player2

end