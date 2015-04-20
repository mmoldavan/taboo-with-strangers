class CardController < ApplicationController
  skip_before_filter  :verify_authenticity_token

  def index
    cards = []

    Card.each do |card|
      cards << card_json_full(card);
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
      render json: card_json_full(card);
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
      render json: card_json_full(card);
    else
      render json: {error: card.errors }, status: 400;
    end
  end

  def add_clue
    
  end

  def retrieve
    card = Card.where({card_id: params["cardid"]}).first;

    if card.save
      render json: card_json_full(card);
    else
      render json: {error: card.errors }, status: 400;
    end
  end

  def get_cards
    cards = [];
    randoms = [];
    card_count = Card.count;

    5.times do
      #
      #loop do
      #  random = rand(card_count);
      #  break if !randoms.include? random
      #end
      
      #randoms << random unless randoms.include? rand(card_count);

      randoms << rand(card_count);
    end

    randoms.each do |random|
      card = Card.skip(random).first;

      cards << card_json_full(card);
    end

    render json: {cards: cards}

  end

  def card_json_full(card)
    return {
      card_id: card.card_id,
      word: card.word,
      forbiddenWords: card.forbiddenWords,
      allForbiddenWords: card.allForbiddenWords,
      difficulty: card.difficulty
    };
  end
end
