const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const db = require('../models')
const User = db.users

const verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'];

  if (!token) return res.status(403).send({ message: 'No token provided!' });

  jwt.verify(token, config.key, (err, decoded) => {
    if (err) return res.status(401).send({
      message: 'Unauthorized!'
    });

    req.accountNumber = decoded.id;
    next();
  });
};

const checkDuplicateAccountNumberOrEmail = (req, res, next) => {
  User.findOne({
    accountNumber: req.body.accountNumber
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user) {
      res.status(400).send({ message: "Failed! Account number is already in use!" });
      return;
    }

    User.findOne({
      emailAddress: req.body.emailAddress
    }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (user) {
        res.status(400).send({ message: "Failed! Email is already in use!" });
        return;
      }

      User.findOne({
        identityNumber: req.body.identityNumber
      }).exec((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (user) {
          res.status(400).send({ message: "Failed! Identity number is already in use!" });
          return;
        }

        next();
      });
    });
  });
};

const auth = {
  verifyToken,
  checkDuplicateAccountNumberOrEmail
};

module.exports = auth;
