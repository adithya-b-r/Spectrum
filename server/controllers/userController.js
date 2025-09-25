import { mongoose } from "mongoose";
import userModel from "../models/user-model.js";

export const updateName = async (req, res) => {
  try {
    const { id, name } = req.body;

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: id },
      { name: name },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message:"User not found."});
    }

    res.status(200).json({
      message: "Updated user successfully",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message:"Error while updating name section."});
  }
}

export const updateUsername = async (req, res) => {
  try {
    const { id, username } = req.body;

    const existingUser = await userModel.findOne({ username, _id: { $ne: id } });

    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: id },
      { username: username },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message:"User not found."});
    }
  } catch (err) {
    res.status(500).json({ message:"Error while updating username section."})
  }
}

export const updateAbout = async (req, res) => {
  try {
    const { id, about } = req.body;

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: id },
      { about: about },
      { new: true } //We add it because, using it, method returns the modified document after the update, not just old one.
    );

    if (!updatedUser) {
      return res.status(404).json({ message:"User not found."});
    }

    res.status(200).json({
      message: "Updated successfully.",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message:"Error while updating about section."});
  }
}

export const profileVisibility = async (req, res) => {
  try {
    const { id, profileVisibility } = req.body;

    const updatedUser = await userModel.findOneAndUpdate(
      { _id, id },
      { profileVisibility: profileVisibility },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Updated successfully.",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ message: "Error while updating profile visibility." });
  }
}