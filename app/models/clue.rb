class Clue
  include Mongoid::Document
  store_in collections: 'clues'
  embedded_in :active_card

  token :field_name => :game_id, :retry_count => 8, :pattern => "CL%d7"

  field :clue_text, type: String
  field :read, type: Boolean

end