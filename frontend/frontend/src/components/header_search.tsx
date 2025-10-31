import { useAuth0 } from "@auth0/auth0-react";

function Header() {
  const { logout, isAuthenticated, user } = useAuth0();

  // Función para obtener las iniciales del nombre del usuario
  const getUserInitials = (name: string | undefined) => {
    if (!name) return "U"; // por si no hay nombre disponible
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = isAuthenticated ? getUserInitials(user?.name) : "G"; // G = Guest

  return (
    <header className="search-header">
      <input
        type="text"
        className="search-input"
        placeholder="Search a stock or ETF"
      />

      <div className="acount-section">
        {isAuthenticated ? (
          <div
            className="acount-services"
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
            {initials}
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