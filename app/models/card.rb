class Card
  include Mongoid::Document
  store_in collection: 'cards'

  token :field_name => :card_id, :retry_count => 8, :pattern => "C%d5"

  field :word, type: String
  field :forbiddenWords, type: Array
  field :allForbiddenWords, type: Array
  field :difficulty, type: Integer

  index({ word: 1 }, { unique: true })

  validates_uniqueness_of :word
  validate :forbidden_words_present

  def forbidden_words_present
    return self.forbiddenWords.length == 5
  end

end