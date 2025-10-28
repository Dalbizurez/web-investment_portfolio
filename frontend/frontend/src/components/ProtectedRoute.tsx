import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";

interface Props {
  children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <h2 style={{ textAlign: "center" }}>Cargando...</h2>;

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;