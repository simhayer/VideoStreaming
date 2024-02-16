require "test_helper"

class ForgetMailerTest < ActionMailer::TestCase
  test "new_code" do
    mail = ForgetMailer.new_code
    assert_equal "New code", mail.subject
    assert_equal ["to@example.org"], mail.to
    assert_equal ["from@example.com"], mail.from
    assert_match "Hi", mail.body.encoded
  end

end
