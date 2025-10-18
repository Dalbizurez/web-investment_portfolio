import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import "../styles/form_login.css";

import Logo from "../assets/FIcon.png";

function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Correo:", email);
    console.log("Contraseña:", password);
  };

  return (
    <section className="login-section">
      <title>Hapi | App</title>
      <div className="login-container">
        <img src={Logo} alt="Logo" className="login-logo" />

        <div className="login-box">
          <h2>¡Hola de nuevo!</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <input placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input placeholder="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Link to="/invite">
              <button type="button" className="login-button">Ingresar</button>
            </Link>
          </form>

          <Link to="/get-started" className="register-link">
            <button className="register-btn">Registrarte</button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LoginForm;
