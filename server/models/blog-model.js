import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['text', 'image'], // Valid types
  },
  content: {
    type: String,
    required: true, // Always required
    validate: {
      validator: function (value) {
        // Ensure content is a non-empty string
        return typeof value === 'string' && value.trim().length > 0;
      },
      message: 'Content cannot be empty.',
    },
  },
});

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: [ContentSchema], // Array of content blocks
      validate: {
        validator: function (value) {
          return value.length > 0; // Ensure at least one content block exists
        },
        message: 'Content cannot be empty.',
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Users who liked the blog
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment', // Comments related to the blog
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

export default mongoose.model('Blog', BlogSchema);