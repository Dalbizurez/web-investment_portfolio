import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home_page";
import LoginForm from "./pages/form_login";

function App() {
   return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<LoginForm />} />
    </Routes>
  );
}

export default App;
