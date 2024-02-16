class ForgetMailer < ApplicationMailer

  # Subject can be set in your I18n file at config/locales/en.yml
  # with the following lookup:
  #
  #   en.forget_mailer.new_code.subject
  #
  def new_code(user_email)
    @user_email = user_email
    @greeting = "Hi"
    
    mail(
      from: "videostreamer60@gmail.com",
      to: @user_email,
      subject: "Reset Password Request"
    )
  end
end
