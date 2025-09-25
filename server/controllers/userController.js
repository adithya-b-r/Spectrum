import { mongoose } from "mongoose";
import userModel from "../models/user-model.js";

// export const editName = async(req, res) => {
//   try{
//     const {id, name} = req.body;


//   }catch(err){
//     res.status(500).send("Error while updating name section.");
//   }
// }

export const editAbout = async (req, res) => {
  try {
    const { id, about } = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(400).send("Invalid user ID.");
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { _id: id },
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