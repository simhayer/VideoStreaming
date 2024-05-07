var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'videostreamer60@gmail.com',
    pass: 'myzftkwjjtigjkok'
  }
});

var mailOptions = {
  from: 'videostreamer60@gmail.com',
  to: 'hayersimrat23@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};


exports.sendEmail = (req, res, next) => {
    
    try {
        transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
  }