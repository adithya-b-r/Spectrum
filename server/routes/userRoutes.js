import express from 'express';
import { validateUserId } from '../middlewares/validateUserId.js';
import { updateAbout, updateName, updateUsername } from '../controllers/userController.js';

const router = express.Router();

router.put("/update-about", validateUserId, updateAbout);
router.put("/update-name", validateUserId, updateName);
router.put("/update-username", validateUserId, updateUsername);

export default router;