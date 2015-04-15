class UserController < ApplicationController
  skip_before_filter  :verify_authenticity_token

  def index
    users = [];

    User.each do |user|
      users << {
        user_id: user.user_id,
        username: user.username
      }
    end

    render json: users;
  end

  def index_with_playing
    users = [];
    playing = [];

    Game.any_of({player1: params["userid"]}, {player2: params["userid"]}).each do |game|
      playing << game.player1 == params["userid"] ? game.player2 : game.player1;
    end

    User.each do |user|
      users << {
        user_id: user.user_id,
        username: user.username,
        game_multiplier: 1.5,
        currently_playing: playing.include?(user.user_id),
        online: false
      }
    end

    render json: users;
  end

  def new

  end

  def create
    user = User.new({
      username: params["username"],
      password: params["password"],
      email: params["email"],
      country: params["country"],
      city: params["city"]
      });

    if user.save
      render json: user;
    else
      render json: {error: user.errors }, status: 400;
    end
  end

  def update
    user = User.where({userid: params["userid"]}).first;
    if user
      user.username = params["username"];
      user.password = params["password"];
      user.email = params["email"];
      user.country = params["country"];
      user.city = params["city"];

      user.save!;
    end

    render json: user;
  end

  def show
    user = User.where({username: params["username"]}).first;

    if user
      render json: user;
    else
      render json: {error: "User doesn't exist"}, status: 400;
    end
  end

  def login
    user = User.where({username: params["username"]}).first;

    if user && user.password == params["password"]
      render json: {valid_user: true, user_id: user.user_id};
    else
      render json: {valid_user: false};
    end

  end

  def destroy

  end
end
