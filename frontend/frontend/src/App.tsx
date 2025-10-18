import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home_page";
import LoginForm from "./pages/form_login";
import InvitePage from "./pages/invitePage";
import SignupForm from "./pages/form_signup";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<LoginForm />} />
      <Route path="/invite" element={<InvitePage />} />
      <Route path="/get-started" element={<SignupForm />} />
    </Routes>
  );
}

export default App;
