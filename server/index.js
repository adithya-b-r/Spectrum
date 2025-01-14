const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

// MongoDB Initialization
require('./config/mongoose-connection');

// Routes
const usersRouter = require('../server/routes/users');
const blogsRouter = require('../server/routes/blogs');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));


// For error: PayloadTooLargeError: request entity too large
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true }, {limit: '50mb'}));

app.use(cookieParser());

app.use("/users", usersRouter);
app.use("/blogs", blogsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});