import userModel from '../models/user-model.js';
import { generateToken } from '../utils/generateToken.js';
import bcrypt from 'bcryptjs/dist/bcrypt.js';

export const registerUser = async (req, res) => {
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

    bcrypt.genSalt(10, (_err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err)
          return res.send(err.message);
        else {
          let user = await userModel.create({
            fullname,
            email,
            password: hash
          });

          console.log("Successfully registered user: " + user.fullname);

          let token = generateToken(user);
          // console.log("Token generated: " + token);
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

export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Invalid Request");
    }

    let user = await userModel.findOne({ email: email });

    if (!user) {
      return res.status(401).send("Email or Password incorrect.")
    }

    bcrypt.compare(password, user.password, async (_err, result) => {
      if (result) {
        console.log(user.fullname + " logged in");

        let token = generateToken(user);
        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "lax",
        });

        res.status(200).send({ message: "Login successful", token });
      } else {
        return res.status(401).send("Email or Password incorrect.");
      }
    })
  } catch (err) {
    console.log(err)
  }
}

export const logout = (_req, res) => {
  try {
    console.log("Logout endpoint triggered");

    res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
    res.status(200).send("Successfully logged out");
  } catch (err) {
    console.error("Error during logout:", err);
    res.status(500).send("Logout failed");
  }
};

export const isauth = (req, res) => {
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

export const editAbout = async (req, res) => {
  try {
    const { username, about } = req.body;

    const updatedUser = await userModel.findOneAndUpdate(
      { username: username },
      { about: about },
      { new: true } //We add it because, using it, method returns the modified document after the update, not just old one.
    );

    if (!updatedUser) {
      return res.status(404).send("User not found.");
    }

    console.log(updatedUser);

    res.status(200).json({
      message: "Updated successfully.",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).send("Error while updating about section.");
  }
}