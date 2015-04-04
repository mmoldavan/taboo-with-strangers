class Clue
  include Mongoid::Document
  include Mongoid::Token
  include Mongoid::Timestamps

  embedded_in :active_card

  field :clue_id, type: Integer
  field :clue_text, type: String
  field :read, type: Boolean

end