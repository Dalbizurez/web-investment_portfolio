import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home_page";
import InvitePage from "./pages/invitePage";
import HomeUser from "./pages/home_user";
import Portafolio from "./pages/portafolio";
import TransferPage from "./pages/transfers";
import ProtectedRoute from "./components/ProtectedRoute";
import SearchPage from "./pages/search_page";
import SellsPage from "./pages/sells_page";
import ProfilePage from "./pages/profile";



function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
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
        path="/invite"
        element={
          <ProtectedRoute>
            <InvitePage />
          </ProtectedRoute>
        }
      />
      <Route path="/sells" 
        element={
          <ProtectedRoute>
            <SellsPage />
          </ProtectedRoute>} 
      />
      <Route path="/search" 
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>} 
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
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;