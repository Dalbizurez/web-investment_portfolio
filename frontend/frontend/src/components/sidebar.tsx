import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useUser } from "./UserContext";


function SideBar() {
  const { userProfile } = useUser();
  const isAdmin = userProfile?.type === "admin";
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <button
        className="mobile-menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

      <div className={`sideBar ${menuOpen ? "open" : ""}`}>
        <Link to="/" className="sidebar-logo" onClick={handleLinkClick}>
          <img src="/src/assets/icon.png" alt="Logo" className="main-icon" />
        </Link>

        <ul>
          <li>
            <Link to="/homeUser" onClick={handleLinkClick} >
              Home
            </Link>
          </li>
          <li>
            <Link to="/transfers" onClick={handleLinkClick} >
              Transfers
            </Link>
          </li>
          <li>
            <Link to="/search" onClick={handleLinkClick} >
              Purchases
            </Link>
          </li>
          <li>
            <Link to="/sells" onClick={handleLinkClick} >
              Sells
            </Link>
          </li>
          <li>
            <Link to="/invite" onClick={handleLinkClick} >
              Invite
            </Link>
          </li>
          <li>
            <Link to="/portafolio" onClick={handleLinkClick} >
              Portafolio
            </Link>
          </li>
          <li>
            <Link to="/profile" onClick={handleLinkClick} data-icon="⋯">
              Profile
            </Link>
          </li>
          <li>
            {isAdmin && <Link to="/admin">Admin Panel</Link>}
          </li>
        </ul>
      </div>
    </>
  );
}

export default SideBar;