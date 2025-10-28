import { useAuth0 } from "@auth0/auth0-react";

function Header() {
  const { logout, isAuthenticated } = useAuth0();

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
            style={{ cursor: "pointer" }}
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            title="Cerrar sesión"
          >
            FD
          </div>
        ) : (
          <div className="acount-services">Invitado</div>
        )}
      </div>
    </header>
  );
}

export default Header;