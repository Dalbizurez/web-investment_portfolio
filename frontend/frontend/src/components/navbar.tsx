import { useAuth0 } from "@auth0/auth0-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Icon from "../assets/icon.png";
import "../styles/navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { loginWithRedirect, isAuthenticated, isLoading, logout, user } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
  if (isAuthenticated && (window.location.pathname === "/signin" || window.location.pathname === "/get-started")) {
    navigate("/homeUser");
  }
}, [isAuthenticated, navigate]);

  if (isLoading) return <h2 style={{ textAlign: "center" }}>Cargando...</h2>;

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
          {!isAuthenticated ? (
            <>
              <button onClick={() => loginWithRedirect()} className="link-signin">
                Sign In
              </button>
              <button onClick={() => loginWithRedirect()} className="link-getstarted">
                Get Started
              </button>
            </>
          ) : (
            <>
              <span>Hola, {user?.name}</span>
              <Link to="/homeUser">
                <button className="link-getstarted">Ir a mi Home</button>
              </Link>
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="link-signin"
              >
                Logout
              </button>
            </>
          )}
        </div>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {menuOpen && (
        <div className="navbar-mobile">
          <a href="#about">About</a>
          <a href="#help">Help</a>
          <a href="#learning">Learning</a>
          <a href="#blog">Blog</a>

          {!isAuthenticated ? (
            <>
              <button onClick={() => loginWithRedirect()} className="link-signin">
                Sign In
              </button>
              <button onClick={() => loginWithRedirect()} className="link-getstarted">
                Get Started
              </button>
            </>
          ) : (
            <>
              <span>Hola, {user?.name}</span>
              <Link to="/homeUser">
                <button className="link-getstarted">Ir a mi Home</button>
              </Link>
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="link-signin"
              >
                Logout
              </button>
            </>
          )}

          <Link to="/search">Buscar Acciones</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;