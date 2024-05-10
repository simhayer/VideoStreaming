const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtSecret =
  '0bbb60bc7d2fe832d54d785370672901832d3ba849366219ddfea07bd5eed8dc06d485';
const {sendResetCodeMail} = require('./mail');

// auth.js
exports.register = async (req, res, next) => {
  console.log('Register function called');
  console.log('Request body:', req.body);
  const {fullname, email, password} = req.body;

  try {
    const existingUser = await User.findOne({email});
    if (existingUser) {
      return res
        .status(400)
        .json({message: 'User with this email already exists'});
    }
    if (!password) {
      return res.status(400).json({message: 'Password does not exist'});
    }
    if (password.length < 6) {
      return res.status(400).json({message: 'Password less than 6 characters'});
    }

    bcrypt.hash(password, 10).then(async hash => {
      await User.create({
        fullname,
        email,
        password: hash,
      })
        .then(user =>
          res.status(200).json({
            message: 'User successfully created',
            user,
          }),
        )
        .catch(error =>
          res.status(400).json({
            message: 'User not successful created',
            error: error.message,
          }),
        );
    });
  } catch (err) {
    res.status(401).json({
      message: 'User not successful created',
      error: err.mesage,
      stack: err.stack,
    });
  }
};

exports.login = async (req, res, next) => {
  const {email, password} = req.body;
  // Check if username and password is provided
  if (!email || !password) {
    return res.status(400).json({
      message: 'email or Password not present',
    });
  }
  try {
    const user = await User.findOne({email});
    if (!user) {
      res.status(400).json({
        message: 'Login not successful',
        error: 'User not found',
      });
    } else {
      bcrypt.compare(password, user.password, (err, compareRes) => {
        if (err) {
          // error while comparing
          res.status(502).json({message: 'error while checking user password'});
        } else if (compareRes) {
          // password match
          const token = jwt.sign({email: req.body.email}, 'secret', {
            expiresIn: '20d',
          });
          res.status(200).json({message: 'user logged in', token: token, user});
        } else {
          // password doesnt match
          res.status(401).json({message: 'invalid credentials'});
        }
      });
    }
  } catch (error) {
    res.status(400).json({
      message: 'An error occurred',
      error: error.message,
    });
  }
};

exports.update = async (req, res, next) => {
  const {role, id} = req.body;

  // First - Verifying if role and id are present
  if (role && id) {
    // Second - Verifying if the value of role is admin
    if (role === 'admin') {
      try {
        // Finds the user with the id
        const user = await User.findById(id);

        // Third - Verifies the user is not an admin
        if (user.role !== 'admin') {
          user.role = role;
          await user.save(); // Save the user, now returns a promise

          res.status(201).json({message: 'Update successful', user});
        } else {
          res.status(400).json({message: 'User is already an Admin'});
        }
      } catch (error) {
        res
          .status(400)
          .json({message: 'An error occurred', error: error.message});
      }
    }
  }
};

function generateRandomCode() {
  return Math.floor(1000 + Math.random() * 9000);
}

exports.sendResetCode = async (req, res, next) => {
  const {email} = req.body;

  const code = generateRandomCode();

  // First - Verifying if email is present
  if (email) {
    try {
      // Update user's code directly in the database
      const currentDate = new Date();
      const newCode = code + '.' + currentDate.toString();

      const updateResult = await User.updateOne({email}, {resetCode: newCode});

      if (updateResult.nModified === 0) {
        return res
          .status(404)
          .json({message: 'User not found or code not updated'});
      }

      // Call function to send reset code mail
      sendResetCodeMail(email, code);

      res.status(201).json({message: 'Update successful', email});
    } catch (error) {
      res
        .status(400)
        .json({message: 'An error occurred', error: error.message});
    }
  } else {
    res.status(400).json({message: 'Email is required'});
  }
};

exports.verifyResetCode = async (req, res, next) => {
  const {email, resetCode} = req.body;
  

  // First - Verifying if email and code are present
  if (email && resetCode) {
    try {
      // Find the user with the given email
      const user = await User.findOne({email});

      if (!user) {
        return res.status(404).json({message: 'User not found'});
      }

      // Extract the reset code and the date from the user's code
      const [storedCode, storedDate] = user.resetCode.split('.');

      // Check if the provided code matches the stored code
      if (resetCode === storedCode) {
        // Check if the code is expired (you can set an expiration time here)
        const currentDate = new Date();
        const storedDateObject = new Date(storedDate);

        // Assuming the code expires after 24 hours
        const expirationTime = 15 * 60 * 1000; // 15mins in milliseconds
        const isExpired =
          currentDate.getTime() - storedDateObject.getTime() > expirationTime;

        if (isExpired) {
          return res.status(400).json({message: 'Reset code has expired'});
        }

        return res.status(200).json({message: 'Reset code is valid'});
      } else {
        return res.status(400).json({message: 'Reset code is invalid'});
      }
    } catch (error) {
      res
        .status(400)
        .json({message: 'An error occurred', error: error.message});
    }
  } else {
    res.status(400).json({message: 'Email and code are required'});
  }
};

exports.updatePassword = async (req, res, next) => {
  console.log(req.body)
  const {email, password} = req.body;
  
  // First - Verifying if email is present
  if (email) {
    try {
      const existingUser = await User.findOne({email});
      if (!existingUser) {
        return res.status(400).json({message: 'User not found'});
      }
      if (!password) {
        return res.status(400).json({message: 'Password does not exist'});
      }
      if (password.length < 6) {
        return res
          .status(400)
          .json({message: 'Password less than 6 characters'});
      }

      bcrypt.hash(password, 10).then(async hash => {
        await User.updateOne({email}, {password: hash})
          .then(user =>
            res.status(200).json({
              message: 'Password Updated',
              user,
            }),
          )
          .catch(error =>
            res.status(400).json({
              message: 'Password not updated',
              error: error.message,
            }),
          );
      });

      //res.status(201).json({message: 'Update successful', email});
    } catch (error) {
      res
        .status(400)
        .json({message: 'An error occurred', error: error.message});
    }
  } else {
    res.status(400).json({message: 'Email is required'});
  }
};

exports.deleteUser = async (req, res, next) => {
  const {id} = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    await user.deleteOne(); // Use deleteOne method instead of remove

    res.status(201).json({message: 'User successfully deleted', user});
  } catch (error) {
    res.status(400).json({message: 'An error occurred', error: error.message});
  }
};

exports.logout = async (req, res, next) => {
  const {email} = req.body;
  // Check if username and password is provided
  if (!email) {
    return res.status(400).json({
      message: 'email not present',
    });
  }
  try {
    const user = await User.findOne({email});
    if (!user) {
      res.status(400).json({
        message: 'Logout not successful',
        error: 'User not found',
      });
    } else {
      res.status(200).json({
        message: 'Logout successful',
        user,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: 'An error occurred',
      error: error.message,
    });
  }
};
