import express from 'express';
import {registerUser, loginUser, logout, isauth} from '../controllers/authController.js';

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/logout", logout);

router.get("/isauth", isauth);

export default router;