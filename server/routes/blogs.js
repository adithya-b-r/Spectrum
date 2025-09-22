import express from 'express'
const router = express.Router();

import {createBlog, getAllBlogs, getSingleBlog, updateBlog, deleteBlog} from '../controllers/blogController.js';

router.post('/create', createBlog);
router.get('/', getAllBlogs);

export default router;