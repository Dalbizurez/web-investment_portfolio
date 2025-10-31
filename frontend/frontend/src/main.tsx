import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/main.css";
import Auth0ProviderWithConfig from "./components/auth0_configuration";
import { UserProvider } from "./components/UserContext"; // 🔥 AGREGAR

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0ProviderWithConfig>
      <UserProvider> {/* 🔥 AGREGAR */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </UserProvider> {/* 🔥 AGREGAR */}
    </Auth0ProviderWithConfig>
  </React.StrictMode>
);