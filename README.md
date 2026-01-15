# Spectrum

A modern full-stack blogging platform built with the MERN stack and TypeScript. Spectrum allows users to create, share, and discover engaging blog content in a clean and intuitive interface.

## 🚀 Features

### Authentication & Authorization
- **User Registration** - Create new accounts with email and password
- **User Login** - Secure authentication with JWT tokens
- **Session Management** - HTTP-only cookie-based session handling
- **Password Security** - Passwords hashed using bcrypt
- **Auth Verification** - Protected routes with authentication middleware

### Blog Management
- **Create Posts** - Rich text editor with support for text and image content blocks
- **View All Blogs** - Browse all published blog posts
- **Blog Feed** - Home page with posts from followed users
- **Content Blocks** - Support for mixed content (text and images)
- **Dynamic Content** - Add and remove content sections while writing

### User Profiles
- **Profile Pages** - Personalized user profile pages
- **Edit Profile** - Update name, username, and about section
- **Profile Visibility** - Control profile visibility settings
- **Default Profile Pictures** - Placeholder images for new users
- **Unique Usernames** - UUID-based default usernames

### Social Features
- **Follow/Unfollow** - Connect with other users
- **Followers/Following** - Track user connections
- **Likes System** - Like and unlike blog posts
- **Comments** - Comment on blog posts (schema ready)
- **Topics** - Tag and categorize content by topics

### User Interface
- **Responsive Design** - Mobile-friendly interface with Tailwind CSS
- **Navigation Bar** - Easy navigation across different sections
- **Favorites Page** - Save and access favorite posts
- **Trending Section** - Discover trending content
- **Suggestions** - Get recommended users to follow
- **Toast Notifications** - User-friendly feedback messages

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **React Router DOM** - Client-side routing
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **React Toastify** - Notification system

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt.js** - Password hashing
- **Cookie Parser** - Cookie handling middleware
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone https://github.com/adithya-b-r/Spectrum.git
cd Spectrum
```

### 2. Install server dependencies
```bash
cd server
npm install
```

### 3. Install client dependencies
```bash
cd ../client
npm install
```

### 4. Configure MongoDB
Update the MongoDB connection string in `server/config/mongoose-connection.js`:
```javascript
const mongoDB_URI = 'mongodb://localhost:27017/spectrum'
```
Or use MongoDB Atlas by replacing with your connection string.

### 5. Start the development servers

**Terminal 1 - Start Backend:**
```bash
cd server
node index.js
```
The server will run on `http://localhost:3000`

**Terminal 2 - Start Frontend:**
```bash
cd client
npm run dev
```
The client will run on `http://localhost:5173`

## 📱 Usage

1. **Register an Account**
   - Navigate to the homepage
   - Click on the register/sign up option
   - Fill in your details (full name, email, password)
   - Submit to create your account

2. **Login**
   - Use your registered email and password
   - Access your personalized dashboard

3. **Create a Blog Post**
   - Navigate to the "Write" or "Create Post" page
   - Add a title for your post
   - Add content blocks (text or images)
   - Publish your post

4. **Explore Content**
   - Browse the home feed for posts
   - Check out trending topics
   - View suggested users to follow

5. **Manage Your Profile**
   - Navigate to your profile page
   - Update your name, username, and about section
   - Manage your profile visibility

## 📁 Project Structure

```
Spectrum/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── assets/        # Images and media
│   │   ├── components/    # Reusable React components
│   │   │   ├── AuthForms/ # Login/Register forms
│   │   │   ├── Modals/    # Modal components
│   │   │   ├── Toast/     # Toast notifications
│   │   │   ├── Navbar.tsx
│   │   │   └── PostCard.tsx
│   │   ├── controllers/   # Frontend controllers
│   │   ├── pages/         # Page components
│   │   │   ├── Home/      # Home page with feed
│   │   │   ├── Blog/      # Individual blog view
│   │   │   ├── Favorites/ # Saved posts
│   │   │   ├── Profile/   # User profile
│   │   │   └── Write/     # Create/edit posts
│   │   ├── utils/         # Utility functions
│   │   ├── App.tsx        # Main App component
│   │   └── main.tsx       # Entry point
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── config/           # Configuration files
│   │   └── mongoose-connection.js
│   ├── controllers/      # Route controllers
│   │   ├── authController.js
│   │   ├── blogController.js
│   │   └── userController.js
│   ├── models/           # Mongoose schemas
│   │   ├── user-model.js
│   │   └── blog-model.js
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── blogRoutes.js
│   │   └── userRoutes.js
│   ├── middlewares/      # Custom middleware
│   │   └── validateUserId.js
│   ├── utils/            # Utility functions
│   │   └── generateToken.js
│   ├── index.js          # Server entry point
│   └── package.json
│
└── README.md            # Project documentation
```

## 🔒 API Endpoints

### Authentication Routes (`/auth`)
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/logout` - Logout user
- `GET /auth/isauth` - Check authentication status

### Blog Routes (`/blog`)
- `POST /blog/create` - Create a new blog post
- `GET /blog/` - Get all blog posts

### User Routes (`/user`)
- `PUT /user/update-about` - Update user about section
- `PUT /user/update-name` - Update user name
- `PUT /user/update-username` - Update username
- `PUT /user/update-profile-visibility` - Update profile visibility

## 🌐 Deployment

The project is configured for deployment on Vercel:

- Frontend is deployed from the `client` directory
- Backend can be deployed separately or as serverless functions
- Update `vercel.json` configuration as needed for your deployment

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Adithya B R

## 👨‍💻 Author

**Adithya B R**

---

Made with ❤️ using React, Node.js, and MongoDB
