class Game
  include Mongoid::Document
  store_in collection: 'games'

  field :player1, type: String
  field :player2, type: String

  field :cardsInPlay: type: 

  index({ player1: 1 }, { unique: false })
  index({ player2: 1 }, { unique: false })

  validates_presence_of :player1
  validates_presence_of :player2

end