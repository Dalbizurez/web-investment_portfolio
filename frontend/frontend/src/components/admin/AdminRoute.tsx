// src/components/admin/AdminRoute.tsx
import { Navigate } from "react-router-dom";
import { useUser } from "../UserContext";


type Props = { children: React.ReactNode };

export default function AdminRoute({ children }: Props) {
  const { userProfile } = useUser();
  const isAdmin = userProfile?.type === "admin";
  if (!isAdmin) return <Navigate to="/home" replace />;
  return <>{children}</>;
}
