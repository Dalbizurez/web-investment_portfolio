import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home_page";
import LoginForm from "./pages/form_login";
import HomeUser from "./pages/home_user";

function App() {
   return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<LoginForm />} />
      <Route path="homeUser" element={<HomeUser/>} />
    </Routes>
  );
}

export default App
