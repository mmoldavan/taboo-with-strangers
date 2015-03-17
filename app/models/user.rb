class User
  include Mongoid::Document
  store_in collection: 'users'

  field :username, type: String
  field :email, type: String
  field :password, type: String
  field :age, type: String
  field :language, type: String
  field :country, type: String

  index({ username: 1 }, { unique: true })

  validates_uniqueness_of :username
  validates_presence_of :email
  validates_presence_of :password

  validates :age, format: { with: /[0-99]/, allow_blank: true }


  def before_save


  end

end