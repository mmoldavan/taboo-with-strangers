class GameController < ApplicationController
  skip_before_filter  :verify_authenticity_token

  def index
    game = Game.where({game_id: params["gameid"]}).first;

    render json: game;
  end

  def automatch
    game = Game.where({state: 'init', player2: nil}).ne({player1: params["userid"]}).first;

    #Is there a game waiting for a player?
    if game
      game.join(params["userid"]);
    #Create a game
    else
      game = Game.initiate_automatch(params["userid"]);

    end

    game.save!

    render json: game_json_full(game)

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

      render json: game_json_full(game);
    else
      render json: {error: 'game not pending'}, status: 400;
    end
  end

  def list_by_user
    games = [];

    Game.any_of({player1: params["userid"]}, {player2: params["userid"]}).desc(:updated_at).each do |game|
      games << game_json_short(game)
    end

    render json: games

  end

  def retrieve
    game = Game.where({game_id: params["gameid"]}).first;

    render json: game_json_full(game);
  end

  def update_game
    game = Game.where({game_id: params["gameid"]}).first;

    if game.awaiting == params["user_id"]
      game.score = params["score"];
      game.turns << {};
      game.turns.last[:timer] = params["timer"];
      game.turns.last[:result] = params["user_input"]["result"];
      game.turns.last[:responses] = params["user_input"]["responses"];
      game.turns.last[:card_id] = params["card"];
      game.turns.last[:type] = game.current_turn_type;

      game.played_cards << params["card"] if !game.played_cards.include? (params["card"]);

      if game.turns.last[:result] == 'endRound'
        game.current_round += 1;
        game.current_turn_type = "clue";

        temp = game.current_guesser;
        game.current_guesser = game.current_clue_giver;
        game.current_clue_giver = temp;
        game.awaiting = game.current_clue_giver;

      elsif game.turns.last[:result] != 'taboo' && game.turns.last[:result] != 'skipped'
        game.current_turn_type = game.current_turn_type == "clue" ? "guess" : "clue";
        game.awaiting = game.awaiting == game.player1 ? game.player2 : game.player1;
      end

      game.save
      render json: game_json_full(game)
    else
      render json: {error: "it ain't your turn!"}
    end
  end

  def status_check
    game = Game.where({game_id: params["gameid"]}).first;
    awaiting = game.awaiting == params["userid"] ? "you" : "player2";
  
    render json: {
      state: game.state,
      awaiting: awaiting
    };
      
  end

  def save_and_render(game)
    if game.save
      render json: game;
    else
      render json: {error: game.errors }, status: 400;
    end
  end

  def game_json_full(game)
    player2 = game.player1 == params["userid"] ? game.player2 : game.player1;
    if player2
      player2_name = User.where({user_id: player2}).first.username;
    else
      player2_name = nil
    end
    awaiting = game.awaiting == params["userid"] ? "you" : "player2";

    previous_turn = game.previous_turn();

    turn_history = []

    game.turns.each do |turn|
      turn_history << turn[:result];
    end

    return {
      game_id: game.game_id,
      player2: {
        id: player2,
        username: player2_name
        },
      score: game.score,
      state: game.state,
      awaiting: awaiting,
      current_round: game.current_round,
      turn_history: turn_history,
      turn_previous: {
        result: previous_turn[:result],
        responses: previous_turn[:responses]
      },
      turn_type: game.current_turn_type,
      card: previous_turn[:card_id],
      timer: previous_turn[:timer],
      updated_at: game.updated_at

    }
  end

  def game_json_short(game)
    player2 = game.player1 == params["userid"] ? game.player2 : game.player1;
        if player2
      player2_name = User.where({user_id: player2}).first.username;
    else
      player2_name = nil
    end
    awaiting = game.awaiting == params["userid"] ? "you" : "player2";

    return {
        game_id: game.game_id,
        player2: {
          id: player2,
          username: player2_name
          },
        score: game.score,
        state: game.state,
        awaiting: awaiting,
        game_multipler: game.multiplier

      }
  end
end
