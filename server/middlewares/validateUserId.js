import mongoose from "mongoose";

export const validateUserId = (req, res, next) => {
  const {id} = req.body;

  if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(400).send("Invalid user ID.");
  }

  next();
}