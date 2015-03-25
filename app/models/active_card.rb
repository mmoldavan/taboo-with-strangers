class ActiveCard
  include Mongoid::Document
  embedded_in :game

  embeds_many :clues

  field :card_id, type: String
end