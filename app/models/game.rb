class Game
  include Mongoid::Document
  store_in collection: 'games'

  embeds_many :active_cards

  token :field_name => :game_id, :retry_count => 8, :pattern => "G%d9"
  field :player1, type: String
  field :player2, type: String
  field :score, type: Integer

  index({ player1: 1 }, { unique: false })
  index({ player2: 1 }, { unique: false })

  validates_presence_of :player1
  validates_presence_of :player2

end