const blogModel = require('../models/blog-model');
const bcrypt = require('bcryptjs');

const createBlog = async (req, res) => {
  const { title, content, author } = req.body;

  // console.log(title);
  // console.log(content);
  // console.log(author);

  if (!title || !content || content.length == 0 || !author) {
    return res.status(400).json({ message: "Title, content, and author are required" });
  }

  try {
    const newBlog = new blogModel({ title, content, author });
    await newBlog.save();
    console.log("Blog: '"+title+"' created Successfully.");
    res.status(201).json({ message: "Blog created successfully", blog: newBlog });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create blog", error });
  }
}

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await blogModel.find().populate('author', 'name email').populate('comments');
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blogs', error });
  }
};

const getSingleBlog = async (req, res) => {
  try {
    const blog = await blogModel.findById(req.params.id).populate('author', 'name email').populate('comments');
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blog', error });
  }
};

const updateBlog = async (req, res) => {
  try {
    const updatedBlog = await blogModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBlog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ message: 'Blog updated successfully', blog: updatedBlog });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update blog', error });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await blogModel.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return res.status(404).json({ message: 'Blog not found' });
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete blog', error });
  }
};

module.exports = { createBlog, getAllBlogs, getSingleBlog, updateBlog, deleteBlog };