# Preview all emails at http://localhost:3000/rails/mailers/forget_mailer
class ForgetMailerPreview < ActionMailer::Preview

  # Preview this email at http://localhost:3000/rails/mailers/forget_mailer/new_code
  def new_code
    ForgetMailer.new_code
  end

end
