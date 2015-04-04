class GameController < ApplicationController
  skip_before_filter  :verify_authenticity_token

  def index

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

  def save_and_render(game)
    if game.save
      render json: game;
    else
      render json: {error: game.errors };
    end
  end
end
