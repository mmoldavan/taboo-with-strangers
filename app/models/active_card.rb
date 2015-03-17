class ActiveCard
  include Mongoid::Document
  store_in collection: 'cards'

  field :word, type: String
  field :forbiddenWords, type: Array
  field :allForbiddenWords, type: Array
  field :difficulty, type: Integer
  field :unreadClues, type: Array
  field :readClues, type: Array

  index({ word: 1 }, { unique: true })

  validates_uniqueness_of :word
  validate :forbidden_words_present

  def forbidden_words_present
    return self.forbiddenWords.length == 5
  end

end