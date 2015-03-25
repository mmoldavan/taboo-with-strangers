class Game
  include Mongoid::Document
  include Mongoid::Token
  store_in collection: 'games'

  embeds_many :active_cards

  token :field_name => :game_id, :retry_count => 8, :pattern => "G%d9"
  field :player1, type: String
  field :player2, type: String
  field :score, type: Integer, default: 0
  field :state, type: String

  index({ player1: 1 }, { unique: false })
  index({ player2: 1 }, { unique: false })
  index({ state: 1}, { unique: false })

  validate :valid_state

  def valid_state
    return ['new','pending','inprogress', 'complete'].include? self.state
  end

  def start
    self.state = 'inprogress';
  end

  def join(player)
    self.player2 = player;
    self.start();
  end

  def self.initiate_automatch(player)
    return Game.new({
      player1: player,
      state: 'new'
      });
  end

  def self.initiate_challenge(player, opponent)
    return Game.new({
      player1: player,
      player2: opponent,
      state: 'pending'
      });
  end

end