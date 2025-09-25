import express from 'express';
import { validateUserId } from '../middlewares/validateUserId.js';
import { editAbout, editName } from '../controllers/userController.js';

const router = express.Router();

router.put("/edit-about", validateUserId, editAbout);
router.put("/edit-name", validateUserId, editName);

export default router;