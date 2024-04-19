const db = require("../models");
const User = db.users;
const jwt = require("jsonwebtoken");
const config = require('../config/auth.config.js');
const { redisClient, cacheData } = require('../middlewares/cache.js')

exports.create = (req, res) => {
  // Validate request
  /* console.log(req.body)
  if (!req.body.title) {
    res.status(400).send({ message: "Cannot be empty!" });
    return;
  } */

  const user = new User({
    userName: req.body.userName,
    accountNumber: req.body.accountNumber,
    emailAddress: req.body.emailAddress,
    identityNumber: req.body.identityNumber
  });

  user
    .save(user)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    });
};

exports.generateToken = (req, res) => {
  if (!req.body.accountNumber) {
    res.status(400).send({ message: "Cannot be empty!" });
    return;
  }

  User.findOne({
    accountNumber: req.body.accountNumber
  }).then(data => {
    if (!data) {
      res.status(400).send({ message: `Not found account with account ${req.body.accountNumber}` });
    } else {
      const payload = {
        id: data.id,
        accountNumber: data.accountNumber,
        emailAddress: data.emailAddress
      }
      // const token = jwt.sign(payload, config.key, { expiresIn: 300 });
      const token = jwt.sign(payload, config.key, { expiresIn: 3000 });

      res.send({ data, token });
    }
  }).catch(err => {
    res.status(500)
       .send({ message: `Error retrieving account with account ${req.body.accountNumber}` });
  })
};

exports.findAll = async (req, res) => {
  const { accountNumber, identityNumber } = req.query;

  let condition = accountNumber || identityNumber
    ? { $or: [{ accountNumber }, { identityNumber }] }
    : {};

  try {
    const data = await User.find(condition)

    const payload = {
      cachedData: data,
      params: req.query
    }

    await redisClient.set('redis_rickyaditya_betest', JSON.stringify(payload), {
      EX: 180,
      NX: true
    });

    res.send(data);
  } catch (error) {
    res.status(500).send("Some error occurred while retrieving data");
  }
};

exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!"
    });
  }

  const accountNumber = req.params.accountNumber;

  User.findOneAndUpdate({ accountNumber }, req.body)
    .then(data => {
      if (!data) {
        res.status(400).send({
          message: `Cannot update user with account number ${accountNumber}. Maybe user was not found!`
        });
      } else res.send({ message: "User was updated successfully." });
    })
    .catch(err => {
      res.status(500).send({
        message: `Error updating user with account number ${accountNumber}`
      });
    });
};

exports.delete = (req, res) => {
  const accountNumber = req.params.accountNumber;

  User.findOneAndDelete(accountNumber)
    .then(data => {
      if (!data) {
        res.status(400).send({
          message: `Cannot delete user with account number ${accountNumber}. Maybe account was not found!`
        });
      } else {
        res.send({
          message: "Account was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: `Could not delete account with account number ${accountNumber}`
      });
    });
};
