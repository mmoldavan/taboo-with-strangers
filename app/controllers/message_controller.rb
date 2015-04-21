class MessageController < ApplicationController
  skip_before_filter  :verify_authenticity_token

  def index
    messages = []

    Message.where({game_id: params["gameid"]}).each do |message|
      messages << message_json_full(message);
    end

    render json: {messages: messages};

  end

  def create
    message = Message.new({
      game_id: params["gameid"],
      text: params["text"],
      user: params["user_id"],
    });

    if message.save
      render json: message_json_full(message);
    else
      render json: {error: message.errors }, status: 400;
    end

  end

  def message_json_full(message)
    username = (message.user == params["user_id"]) ? "you" : "player2";

    return {
      user: username,
      text: message.text,
      created_at: message.created_at
    };
  end
end
