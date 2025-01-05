const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

// MongoDB Initialization
require('./config/mongoose-connection');

// Routes
const mainRouter = require('../server/routes/main');
const usersRouter = require('../server/routes/users');
const blogsRouter = require('../server/routes/blogs');

const app = express();
const PORT = 3000;

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// app.use("/", mainRouter);
app.use("/users", usersRouter);
app.use("/blogs", blogsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});