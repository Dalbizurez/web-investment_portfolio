import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom"; 

function Header() {
  const { logout, isAuthenticated, user } = useAuth0();
  const navigate = useNavigate(); 

  const getUserInitials = (name: string | undefined) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleProfileClick = () => {
    navigate("/profile"); 
  };

  const initials = isAuthenticated ? getUserInitials(user?.name) : "G"; 

  return (
    <header className="search-header">
      <div className="account-section">
        <div
          className="account-circle"
          onClick={handleProfileClick}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

export default Header;
