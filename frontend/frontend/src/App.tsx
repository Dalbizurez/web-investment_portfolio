import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home_page";
import LoginForm from "./pages/form_login";
import InvitePage from "./pages/invitePage";
import SignupForm from "./pages/form_signup";
import HomeUser from "./pages/home_user";
import Portafolio from "./pages/portafolio";
import TransferPage from "./pages/transfers";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<LoginForm />} />
      <Route path="/invite" element={<InvitePage />} />
      <Route path="/get-started" element={<SignupForm />} />
      <Route path="/homeUser" element={<HomeUser />} />
      <Route path="/portafolio/" element={<Portafolio />} />
      <Route path="/transfers" element={<TransferPage />} />
    </Routes>
  );
}

export default App;
