import { useState } from "react";
import type { FormEvent } from "react";


function LoginForm() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Correo:", email);
    console.log("Contraseña:", password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Correo:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Contraseña:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <br />
      <button type="submit">Entrar</button>
    </form>
  );
}

export default LoginForm;
