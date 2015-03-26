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

  def save_and_render(game)
    if game.save
      render json: game;
    else
      render json: {error: game.errors };
    end
  end
end
