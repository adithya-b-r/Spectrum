import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home/Home';
import { Favorites } from './pages/Favorites/Favorites';
import { Profile } from './pages/Profile/Profile';
import { UserProfile } from './pages/UserProfile/UserProfile';
import { MyBlogs } from './pages/MyBlogs/MyBlogs';
import { CreatePost } from './pages/Write/CreatePost';
import { ToastNotification } from './components/Toast/ToastNotification'
import axios from 'axios';
import { Blog } from './pages/Blog/Blog';
import { SearchResults } from './pages/Search/SearchResults';

axios.defaults.withCredentials = true;

function App() {
  return (
    <BrowserRouter>
      <ToastNotification />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/blogs" element={<MyBlogs />} />
        <Route path="/my-blogs" element={<MyBlogs />} />
        <Route path="/stories" element={<MyBlogs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:section" element={<Profile />} />
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/user/profile/:username" element={<UserProfile />} />
        <Route path="/user/:username" element={<UserProfile />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/create-post/:id" element={<CreatePost />} />
        <Route path="/edit-post/:id" element={<CreatePost />} />
        <Route path="/edit/:id" element={<CreatePost />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<Blog />} />
        <Route path="/*" element={<h3 className='text-2xl w-full my-12 font-bold text-center text-gray-700'>Page Under Construction</h3>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
