class Message
  include Mongoid::Document
  include Mongoid::Token
  include Mongoid::Timestamps

  field :game_id, type: String
  field :user, type: String
  field :text, type: String

end