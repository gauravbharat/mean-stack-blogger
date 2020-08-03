const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });

    user
      .save()
      .then((result) => {
        res.status(201).json({
          message: 'User created!',
          result,
        });
      })
      .catch((error) => {
        res.status(500).json({
          message: 'Invalid authentication credentials!',
        });
      });
  });
};

exports.userLogin = (req, res, next) => {
  let fetchedUser;

  User.findOne({ email: req.body.email })
    .then((user) => {
      // Check that user exists
      if (!user) {
        return res.status(401).json({
          message: 'Invalid authentication credentials!',
        });
      }

      fetchedUser = user;

      // We cannot de-hash the hashed password but can compare two hash strings
      // Check that the user supplied password is correct
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: 'Invalid authentication credentials!',
        });
      }

      // create a new web token based on the input data (1st argument) to sign() method
      // 2nd argument => secret
      // 3rd argument => options to configure the token
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.JWT_SECTRE,
        { expiresIn: '1h' }
      );

      // Send expiresIn, 1hr as seconds
      res.status(200).json({
        token,
        expiresIn: 3600,
        userId: fetchedUser._id,
      });
    })
    .catch((error) => {
      console.log('user login error', error);
      return res.status(401).json({
        message: 'Invalid authentication credentials!',
      });
    });
};
