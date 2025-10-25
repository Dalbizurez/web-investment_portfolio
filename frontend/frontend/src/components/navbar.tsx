import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Icon from "../assets/icon.png";
import "../styles/navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo"><img src={Icon} alt="IconHapi" /></div>

        <div className="navbar-links">
          <a href="#about">About</a>
          <a href="#help">Help</a>
          <a href="#learning">Learning</a>
          <a href="#blog">Blog</a>
        </div>

        <div className="navbar-buttons">
          <Link to="/signin" className="link-signin">Sign in</Link>
          <a href="/get-started" className="link-getstarted">Get started</a>
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {menuOpen && (
        <div className="navbar-mobile">
          <a href="#about">About</a>
          <a href="#help">Help</a>
          <a href="#learning">Learning</a>
          <a href="#blog">Blog</a>
          <Link to="/signin" className="link-signin">Sign In</Link>
          <a href="/get-started" className="link-getstarted">Create Account</a>
          <Link to="/search">Buscar Acciones</Link>

        </div>
      )}
    </nav>
  );
}

export default Navbar;
