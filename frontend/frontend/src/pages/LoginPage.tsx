import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";


function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {

      if (username && password) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate("/DashBoardPage");
      }
    } catch (error) {
      console.error("Error de login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Cargando..." : "Entrar"}
          </button>
        </form>
        <p>
          ¿No tienes cuenta? <span className="link">Regístrate</span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;