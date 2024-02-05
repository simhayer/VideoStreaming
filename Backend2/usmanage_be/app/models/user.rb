class User
  include Mongoid::Document
  include Mongoid::Timestamps
  include ActiveModel::SecurePassword

  field :fullname, type: String
  field :email, type: String
  field :password_digest, type: String
  field :type, type: Integer
  field :token, type: String

  validates :fullname, presence: true
  validates :email, uniqueness: true, presence: true
  validates :password, presence: true, :length => { :minimum => 6 }, :on => :create

  has_secure_password
end
