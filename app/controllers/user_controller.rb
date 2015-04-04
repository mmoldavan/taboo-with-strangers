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

  def new

  end

  def create
    user = User.new({
      username: params["username"],
      password: params["password"],
      email: params["email"],
      country: params["country"],
      language: params["langauge"],
      age: params["age"]
      });

    if user.save
      render json: user;
    else
      render json: {error: user.errors };
    end
  end

  def update
    user = User.where({userid: params["userid"]}).first;
    if user
      user.username = params["username"];
      user.password = params["password"];
      user.email = params["email"];
      user.country = params["country"];
      user.language = params["language"];
      user.age = params["age"];

      user.save!;
    end

    render json: user;
  end

  def show
    user = User.where({username: params["username"]}).first;

    if user
      render json: user;
    else
      render json: {error: "User doesn't exist"};
    end
  end

  def destroy

  end
end
