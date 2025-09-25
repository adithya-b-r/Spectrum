import express from 'express';
import { validateUserId } from '../middlewares/validateUserId.js';
import { updateAbout, updateName } from '../controllers/userController.js';

const router = express.Router();

router.put("/update-about", validateUserId, updateAbout);
router.put("/update-name", validateUserId, updateName);

export default router;