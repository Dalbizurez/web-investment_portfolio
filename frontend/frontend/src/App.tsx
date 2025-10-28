import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home_page";
import InvitePage from "./pages/invitePage";
import HomeUser from "./pages/home_user";
import Portafolio from "./pages/portafolio";
import TransferPage from "./pages/transfers";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/invite" element={<InvitePage />} />
      {/* Rutas protegidas */}
      <Route
        path="/homeUser"
        element={
          <ProtectedRoute>
            <HomeUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/portafolio"
        element={
          <ProtectedRoute>
            <Portafolio />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transfers"
        element={
          <ProtectedRoute>
            <TransferPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;