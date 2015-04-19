class CardController < ApplicationController
  skip_before_filter  :verify_authenticity_token

  def index
    cards = []

    Card.each do |card|
      cards << {
        word: card.word,
        forbiddenWords: card.forbiddenWords,
        allForbiddenWords: card.allForbiddenWords,
        difficulty: card.difficulty
      };
    end

    render json: cards;

  end

  def create
    card = Card.new({
      word: params["word"],
      forbiddenWords: params["forbiddenWords"],
      allForbiddenWords: params["allForbiddenWords"],
      difficulty: params["difficulty"]
    });

    if card.save
      render json: card;
    else
      render json: {error: card.errors }, status: 400;
    end

  end

  def update
    card = Card.where({card_id: params["cardid"]}).first;

    card.word = params["word"];
    card.forbiddenWords = params["forbiddenWords"];
    card.allForbiddenWords = params["allForbiddenWords"];
    card.difficulty = params["difficulty"];

    if card.save
      render json: card;
    else
      render json: {error: card.errors }, status: 400;
    end
  end

  def add_clue
    
  end

  def retrieve
    card = Card.where({card_id: params["cardid"]}).first;

    if card.save
      render json: card;
    else
      render json: {error: card.errors }, status: 400;
    end
  end

end
