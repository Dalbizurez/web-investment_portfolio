import { useAuth0 } from "@auth0/auth0-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Icon from "../assets/icon.png";
import "../styles/navbar.css";
import { useUser } from "./UserContext";
import axios from "axios";

const API_URL = "http://back.g4.atenea.lat/api"; 


function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { loginWithRedirect, isAuthenticated, isLoading, logout, user } = useAuth0();
  const navigate = useNavigate();
  const { userProfile, isLoadingProfile } = useUser();

  const [setPublicApiResponse] = useState<any>(null);

  const fetchPublicData = async () => {
    try {
      const response = await axios.get(`${API_URL}/stocks/search/?q=apple`);
      setPublicApiResponse(response.data);
    } catch (err: any) {
      console.error("Error al llamar al endpoint público:", err.message);
    }
  };


  useEffect(() => {
    if (isAuthenticated) {
      if (window.location.pathname === "/signin" || window.location.pathname === "/get-started") {
        navigate("/homeUser");
      }

      fetchPublicData();
    }
  }, [isAuthenticated, navigate]);

  const getDisplayName = () => {
    if (!isAuthenticated) return "User";
    const fullName = userProfile?.username || user?.name || "User";
    const cleanName = fullName.replace(/_/g, " ");
    const parts = cleanName.split(" ").slice(0, 2);
    return parts
      .map((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
      .join(" ");
  };

  if (isLoading || (isAuthenticated && isLoadingProfile)) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo"><img src={Icon} alt="IconHapi" /></div>
          <div style={{ textAlign: "center", flex: 1 }}>
            <span>Cargando...</span>
          </div>
        </div>
      </nav>
    );
  }

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
              <span>Hola, {getDisplayName()}</span>
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
              <span>Hola, {getDisplayName()}</span>
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
