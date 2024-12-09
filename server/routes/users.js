const express = require('express');
const router = express.Router();
const {registerUser, loginUser, logout, isauth} = require('../controllers/authController')

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", logout);

router.get("/isauth", isauth);

module.exports = router;