import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import CatalogPage from "./pages/CatalogPage";
import CarDetailPage from "./pages/CarDetailPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";

import { useAuth, AuthContext } from "./context/AuthContext";

function LogoutRedirect() {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/", { replace: true });
  }, [navigate, setToken]);

  return null;
}

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route path="/cars/:id" element={<CarDetailPage />} />
          <Route path="/logout" element={<LogoutRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
