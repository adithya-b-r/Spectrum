const mongoose = require('mongoose');
const mongoDB_URI = 'mongodb://localhost:27071/spectrum'

mongoose
  .connect(mongoDB_URI)
  .then(() => {
    console.log("Connected to MongoDB Successfully!");
  })