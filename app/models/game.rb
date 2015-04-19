class Game
  include Mongoid::Document
  include Mongoid::Token
  include Mongoid::Timestamps

  store_in collection: 'games'

  token :field_name => :game_id, :retry_count => 8, :pattern => "G%d9"
  field :player1, type: String
  field :player2, type: String
  field :score, type: Integer, default: 0
  field :state, type: String
  field :current_round, type: String
  field :awaiting, type: String
  field :turns, type: Array

  index({ player1: 1 }, { unique: false })
  index({ player2: 1 }, { unique: false })
  index({ state: 1}, { unique: false })

  validate :valid_state
  validate :valid_player1
  validate :valid_player2

  def valid_state
    errors.add(:state, 'invalid state') unless ['unmatched','pending','inprogress', 'complete'].include? self.state
  end

  def valid_player1
    errors.add(:player1, 'unknown user') unless User.where(user_id: self.player1).exists?
  end

  def valid_player2
    if self.player2 != nil
      errors.add(:player2, 'unknown user') unless User.where(user_id: self.player2).exists?
    end

    errors.add(:player2, 'cannot be the same as player1') if self.player1 == self.player2
  end

  def start
    self.current_round = 1;
  end

  def join(player)
    self.player2 = player;
    self.start();
  end

  def init_cards
    randoms = []
    card_count = Card.count;
  end


  def turn_previous
    return {
      result: turns.last.result,
      responses: turns.last.responses
    }

  end

  def self.initiate_automatch(player)
    game = Game.new({
      player1: player,
      state: 'init',
      awaiting: player
    });
    game.init_cards();

    return game;
  end

  def self.initiate_challenge(player, opponent)
    game = Game.new({
      player1: player,
      player2: opponent,
      state: 'init',
      awaiting: opponent
      });
    game.init_cards();

    return game;
  end

end