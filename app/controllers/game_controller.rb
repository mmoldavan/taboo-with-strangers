class GameController < ApplicationController
  skip_before_filter  :verify_authenticity_token

  def index
    game = Game.where({game_id: params["gameid"]}).first;

    render json: game;
  end

  def automatch
    game = Game.where({state: 'unmatched'}).first;

    #Is there a game waiting for a player?
    if game
      game.join(params["userid"]);

      save_and_render(game);

    #Create a game
    else
      game = Game.initiate_automatch(params["userid"]);

      save_and_render(game);
    end

  end

  def challenge
    game = Game.initiate_challenge(params["userid"],params["opponent"]);

    save_and_render(game);
  end

  def accept
    game = Game.where({game_id: params["gameid"]}).first;

    if game.state == 'pending'
      game.state = 'inprogress'
      game.save!

      render json: game;
    else
      render json: {error: 'game not pending'}, status: 400;
    end
  end

  def list_by_user
    games = [];

    Game.any_of({player1: params["userid"]}, {player2: params["userid"]}).each do |game|
      games << {
        game_id: game.game_id,
        player1: game.player1,
        player2: game.player2,
        score: game.score,
        state: game.state
      }
    end

    render json: games

  end

  def mark_clue_read
    game = Game.where({game_id: params["gameid"]}).first;

    card = game.active_cards.where({card_id: params["cardid"]}).first;

    clue = card.where({clue_id: params["clueid"]}).first;

    clue.read = true;

    save_and_render(game);
  end

  def add_clue
    game = Game.where({game_id: params["gameid"]}).first;

    card = game.active_cards.where({card_id: params["cardid"]}).first;

    card.clues << Clue.new({
      clue_id: card.clues.length + 1,
      clue_text: params["clue_text"],
      read: false
    });

    save_and_render(game);
  end

  def retrieve
    game = Game.where({game_id: params["gameid"]}).first;

    render json: game;
  end

  def save_and_render(game)
    if game.save
      render json: game;
    else
      render json: {error: game.errors }, status: 400;
    end
  end
end
