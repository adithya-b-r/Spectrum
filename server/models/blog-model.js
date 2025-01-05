const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['text', 'image'],
  },
  text: {
    type: String,
    required: function () {
      return this.type === 'text';
    },
  },
  image: {
    type: String,
    required: function () {
      return this.type === 'image';
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
      type: [ContentSchema],
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: 'Content cannot be empty.',
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Blog', BlogSchema);



/*Structure

const blogPost = new Blog({
  title: 'My First Blog',
  content: [
    { type: 'text', text: 'First text block' },
    { type: 'image', image: 'image1.jpg' },
    { type: 'image', image: 'image2.jpg' },
    { type: 'text', text: 'Second text block' },
    { type: 'image', image: 'image3.jpg' },
    { type: 'text', text: 'Third text block' }
  ]
});

blogPost.save().then(() => {
  console.log('Blog post saved!');
});*/