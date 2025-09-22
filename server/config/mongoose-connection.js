import mongoose from 'mongoose';
const mongoDB_URI = 'mongodb://localhost:27017/spectrum'

mongoose
  .connect(mongoDB_URI)
  .then(() => {
    console.log("Connected to MongoDB Successfully!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });