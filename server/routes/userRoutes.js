import express from 'express';
import { validateUserId } from '../middlewares/validateUserId.js';
import { editAbout } from '../controllers/userController.js';

const router = express.Router();

router.post("/edit-about", validateUserId, editAbout);

export default router;