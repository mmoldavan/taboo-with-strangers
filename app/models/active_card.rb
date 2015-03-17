class ActiveCard < Card
  include Mongoid::Document
  store_in collection: 'active_cards'

  field :unreadClues, type: Array
  field :readClues, type: Array

end