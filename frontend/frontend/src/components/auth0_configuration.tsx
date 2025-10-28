import React from "react";
import { Auth0Provider } from "@auth0/auth0-react";

const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    scope: import.meta.env.VITE_AUTH0_SCOPE,
  },
  cacheLocation: "localstorage", 
  useRefreshTokens: true,        
};

interface Props {
  children: React.ReactNode;
}

const Auth0ProviderWithConfig: React.FC<Props> = ({ children }) => {
  return <Auth0Provider {...auth0Config}>{children}</Auth0Provider>;
};

export default Auth0ProviderWithConfig;