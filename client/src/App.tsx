import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home/Home';
import { Favorites } from './pages/Favorites/Favorites';
import { Profile } from './pages/Profile/Profile';
import { CreatePost } from './pages/Write/CreatePost';
import { ToastNotification } from './components/Toast/ToastNotification'
import axios from 'axios';
import { Blog } from './pages/Blog/Blog';

axios.defaults.withCredentials = true;

function App() {
  return (
    <BrowserRouter>
      <ToastNotification />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:section" element={<Profile />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/blog/" element={<Blog />} />
        <Route path="/*" element={<h3 className='text-3xl w-full my-10 font-bold text-center'>🛠️Under Construction🛠️</h3>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
