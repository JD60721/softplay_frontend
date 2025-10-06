import { Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Canchas from "./pages/Canchas.jsx";
import CanchaDetalle from "./pages/CanchaDetalle.jsx";
import NuevaReserva from "./pages/NuevaReserva.jsx";
import MisReservas from "./pages/MisReservas.jsx";
import AdminCanchas from "./pages/admin/AdminCanchas.jsx";
import AdminSistema from "./pages/admin/AdminSistema.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./redux/slices/authSlice.js";

export default function App(){
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Forzar logout al iniciar la app para evitar sesión persistida
  useEffect(() => {
    dispatch(logout());
  }, [dispatch]);

  return (
    <div>
      {location.pathname !== '/canchas' && location.pathname !== '/home' && (
        <header className="bg-slate-900 border-b border-slate-800 text-slate-100">
          <div className="max-w-6xl mx-auto p-4 flex items-center gap-4">
            <nav className="flex gap-3 text-slate-200">
              {user && <Link to="/reservas">Mis reservas</Link>}
              {user?.role === "admin_sistema" && <Link to="/admin/sistema">Admin Sistema</Link>}
            </nav>
            <div className="ml-auto">
              {!user ? null : (
                <div className="flex items-center gap-3">
                  <span>Hola, {user.name}</span>
                  <button
                    className="btn"
                    onClick={() => {
                      dispatch(logout());
                      navigate('/login');
                    }}
                  >
                    Salir
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/canchas" element={<Canchas />} />
          <Route path="/canchas/:id" element={<CanchaDetalle />} />
          <Route path="/reservar/:id" element={<ProtectedRoute><NuevaReserva /></ProtectedRoute>} />
          <Route path="/reservas" element={<ProtectedRoute><MisReservas /></ProtectedRoute>} />

          <Route path="/admin/canchas" element={<ProtectedRoute requireRoles={['admin_cancha','admin_sistema']}><AdminCanchas /></ProtectedRoute>} />
          <Route path="/admin/sistema" element={<ProtectedRoute requireRoles={['admin_sistema']}><AdminSistema /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  )
}
