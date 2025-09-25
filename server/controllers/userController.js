import { mongoose } from "mongoose";
import userModel from "../models/user-model.js";

export const updateName = async (req, res) => {
  try {
    const { id, name } = req.body;

    const updatedUser = await userModel(
      { _id: id },
      { name: name },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).status("User not found.");
    }

    res.status(200).json({
      message: "Updated user successfully",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).send("Error while updating name section.");
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

    console.log(updatedUser);

    if (!updatedUser) {
      return res.status(404).send("User not found.");
    }

    res.status(200).json({
      message: "Updated successfully.",
      user: updatedUser
    });
  } catch (err) {
    res.status(500).send("Error while updating about section.");
  }
}