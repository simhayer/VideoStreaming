class Api::Auth::AuthController < ApplicationController
  def login
    user = User.find_by(:email => params[:email])

    # checkk user is exist
    # print (user)

    if !user
      render json: { msg: 'Email does not exist'}, status: :unprocessable_entity
      return true;
    end

    if user.authenticate(params[:password])
      token = self.create_token(user.id.to_s, user.email, user.type.to_s)
      user.set(:token => token)
      render json: {msg: 'Success Login', user: user.as_json({ :except => [:password_digest]})}, status: :ok
    else
      render json: { msg: 'Password did not match'}, status: :unprocessable_entity
    end

  end
end
