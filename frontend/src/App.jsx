import { Routes, Route } from "react-router";
import LoginPage from "./pages/auth/login";
import SignupPage from "./pages/auth/signup";
import Home from "./pages/home";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth">
          <Route path="sign-in" element={<LoginPage />} />
          <Route path="sign-up" element={<SignupPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
