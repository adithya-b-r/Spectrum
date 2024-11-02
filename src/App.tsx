import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Favorites } from './pages/Favorites/Favorites';
import { Profile } from './pages/Profile/Profile';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/*" element={<h3>Page Not Found ¯\_(ツ)_/¯</h3>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
