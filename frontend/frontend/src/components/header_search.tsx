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
      <div className="acount-section">
        {isAuthenticated ? (
          <div
            className="acount-services"
            onClick={handleProfileClick} 
            style={{
              cursor: "pointer",
              backgroundColor: "#4C58ED",
              color: "white",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            {initials} {/* Muestra las iniciales reales */}
          </div>
        ) : (
          <div
            className="acount-services"
            style={{
              backgroundColor: "#ccc",
              color: "white",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            G
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;