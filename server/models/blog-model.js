const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: [{
    type: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: function () {
        return this.type === 'text';
      }
    },
    image: {
      type: String,
      required: function () {
        return this.type === 'image';
      }
    }
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
}, {
  timestamps: true,
});

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;


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