const express = require('express');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const expressSession = require('express-session');

// Routes
const mainRouter = require('../server/routes/main');
const usersRouter = require('../server/routes/users');
const blogsRouter = require('../server/routes/blogs');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// app.use("/", mainRouter);
// app.use("/users", usersRouter);
// app.use("/blogs", blogsRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000...');
})