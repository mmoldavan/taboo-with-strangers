class ActiveCard
  include Mongoid::Document
  embedded_in :game

  embeds_many :clues

  field :card_id, type: String
  
  field :state, type: String, default: 'unplayed'
end