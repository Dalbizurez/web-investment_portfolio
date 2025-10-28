import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/main.css";
import Auth0ProviderWithConfig from "./components/auth0_configuration";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0ProviderWithConfig>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0ProviderWithConfig>
  </React.StrictMode>
);
