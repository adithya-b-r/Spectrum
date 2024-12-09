const userModel = require('../models/user-model');
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const { generateToken } = require('../utils/generateToken');

mongoose.connect("mongodb://127.0.0.1:27017/spectrum");

module.exports.registerUser = async (req, res) => {
  try {
    let { fullname, email, password, confirmPassword } = req.body;

    if (password != confirmPassword) {
      return res.status(400).send("Passwords do not match");
    }

    if (!fullname || !email || !password) {
      return res.status(400).send("Invalid Request");
    }

    if (await userModel.findOne({ email: email })) {
      return res.status(401).send("You already have an account, Please Login.");
    }

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err)
          return res.send(err.message);
        else {
          let user = await userModel.create({
            fullname,
            email,
            password: hash
          });

          console.log(user);

          let token = generateToken(user);
          console.log(token);
          res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
          });

          res.status(200).send({ message: "Registration successful", token });
        }
      });
    });
  } catch (err) {
    console.log("Error: " + err);
  }
}

module.exports.loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Invalid Request");
    }

    let user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(401).send("Email or Password incorrect.")
    }

    bcrypt.compare(password, user.password, async (err, result) => {
      if (result) {
        console.log(user);

        let token = generateToken(user);
        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "lax"
        });

        res.status(200).send({ message: "Login successful", token });
      } else {
        return res.status(404).send("Email or Password incorrect.");
      }
    })
  } catch (err) {
    console.log(err)
  }
}

module.exports.logout = (req, res) => {
  try {
    console.log("Logout endpoint triggered");

    res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
    res.status(200).send("Successfully logged out");
  } catch (err) {
    console.error("Error during logout:", err);
    res.status(500).send("Logout failed");
  }
};

module.exports.isauth = (req, res) => {
  try {
    let token = req.cookies.token;
    if (!token) 
      return res.status(401).send("Unauthorized");
    else
      return res.status(200).send("Authorized");
  } catch (err) {
    console.log("Error");
  }
}