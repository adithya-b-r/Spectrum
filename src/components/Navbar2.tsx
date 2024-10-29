import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link to="/">Spectrum</Link>
        </div>

        {/* Navbar Links - hidden on small screens */}
        <div className="hidden md:flex space-x-4">
          <Link to="/" className="hover:text-gray-200">
            Home
          </Link>
          <Link to="/about" className="hover:text-gray-200">
            About
          </Link>
          <Link to="/contact" className="hover:text-gray-200">
            Contact
          </Link>
          <Link to="/blog" className="hover:text-gray-200">
            Blog
          </Link>
          <Link to="/profile" className="hover:text-gray-200">
            Profile
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden focus:outline-none">
            ☰
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-blue-700">
          <Link
            to="/"
            className="block px-4 py-2 hover:bg-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="block px-4 py-2 hover:bg-blue-600"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>

          <Link
            to="/contact"
            className="block px-4 py-2 hover:bg-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
          <Link
            to="/blog"
            className="block px-4 py-2 hover:bg-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Blog
          </Link>
          <Link
            to="/profile"
            className="block px-4 py-2 hover:bg-blue-600"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
        </div>
      )}
    </nav>
  );
}
