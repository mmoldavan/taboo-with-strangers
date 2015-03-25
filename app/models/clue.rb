class Clue
  include Mongoid::Document
  include Mongoid::Token
  store_in collections: 'clues'
  embedded_in :active_card

  token :field_name => :clue_id, :retry_count => 8, :pattern => "CL%d7"

  field :clue_text, type: String
  field :read, type: Boolean

end