class User
  include Mongoid::Document
  include Mongoid::Token
  include Mongoid::Timestamps
  
  store_in collection: 'users'
  token :field_name => :user_id, :retry_count => 8, :pattern => "U%d9"

  field :username, type: String
  field :email, type: String
  field :password, type: String
  field :avatar, type: String
  field :city, type: String
  field :country, type: String

  index({ username: 1 }, { unique: true })

  validates_uniqueness_of :username
  validates_presence_of :email
  validates_presence_of :password


  def before_save


  end

end