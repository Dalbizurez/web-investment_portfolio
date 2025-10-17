import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home_page";
import LoginForm from "./pages/form_login";
import InvitePage from "./pages/invitePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<LoginForm />} />
      <Route path="/invite" element={<InvitePage />} />
    </Routes>
  );
}

export default App;
