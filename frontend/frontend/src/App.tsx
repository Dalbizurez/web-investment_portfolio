import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home_page";
import InvitePage from "./pages/invitePage";
import HomeUser from "./pages/home_user";
import Portafolio from "./pages/portafolio";
//import TransferPage from "./pages/transfers";
import ProtectedRoute from "./components/ProtectedRoute";
import SearchPage from "./pages/search_page";
import SellsPage from "./pages/sells_page";
import ProfilePage from "./pages/profile";
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStocks from "./pages/admin/AdminStocks";
import AdminTransactions from "./pages/admin/AdminTransactions";
import TransfersRouter from "./pages/TransfersRouter";



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
            <TransfersRouter />
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
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="stocks" element={<AdminStocks />} />
        <Route path="transactions" element={<AdminTransactions />} />
      </Route>
    </Routes>
  );
}

export default App;