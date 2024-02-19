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

  def logout
    user = User.find_by(:email => params[:email])

    if !user
      render json: { msg: 'Email does not exist'}, status: :unprocessable_entity
      return true;
    end
      user.set(:token => nil)
      render json: {msg: 'Success Logout', user: user.as_json({ :except => [:password_digest]})}, status: :ok

  end


  def forgetCode
    user = User.find_by(:email => params[:email])

    # checkk user is exist
    # print (user)

    if !user
      render json: { msg: 'Email does not exist'}, status: :unprocessable_entity
      return true;
    end

    resetCode = rand(10_000..99_999)
    user.set(:resetCode => resetCode)
    user.set(:resetCodeExpiry => Time.now + 15.minutes)

    mail = ForgetMailer.new_code(user.email, resetCode).deliver_later
    render json: { msg: 'Res', result: 'Mail sent successfully', email_info: mail }, status: :ok
    # else
    #   render json: { msg: 'Password did not match'}, status: :unprocessable_entity
    # end

  end


  def forgetCodeCheck
    user = User.find_by(:email => params[:email])

    # checkk user is exist
    # print (user)

    if !user
      render json: { msg: 'Email does not exist'}, status: :unprocessable_entity
      return true;
    end

    resetCode = params[:resetCode].to_i

    if user.resetCodeExpiry < Time.now
      render json: { msg: 'Code has expired'}, status: :unprocessable_entity
      return true;
    end

    # Check if the reset code matches
  if resetCode == user.resetCode
    render json: { msg: 'Code Auth Successful' }, status: :ok
  else
    render json: { msg: 'Code didn\'t match' }, status: :unprocessable_entity
  end

  end
end
