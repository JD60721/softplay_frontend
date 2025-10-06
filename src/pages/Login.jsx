import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../redux/slices/authSlice.js";
import { Navigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaSpinner } from "react-icons/fa";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  // Validaciones en tiempo real
  useEffect(() => {
    const errors = {};

    if (touched.email && !formData.email) {
      errors.email = "El email es requerido";
    } else if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Formato de email inválido";
    }

    if (touched.password && !formData.password) {
      errors.password = "La contraseña es requerida";
    }
    //else if (touched.password && formData.password.length < 6) {
    //errors.password = "La contraseña debe tener al menos 6 caracteres";
    //}

    setFormErrors(errors);
  }, [formData, touched]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    setTouched({ email: true, password: true });

    // Verificar si hay errores
    if (Object.keys(formErrors).length === 0 && formData.email && formData.password) {
      dispatch(loginThunk(formData));
    }
  };

  if (user) return <Navigate to="/home" />;

  return (
    <div className="h-screen overflow-hidden bg-slate-900 text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FaLock className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">¡Bienvenido!</h1>
          <p className="text-slate-300">Ingresa a tu cuenta para continuar</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-slate-200 flex items-center gap-2"
              >
                <FaEnvelope className="text-slate-400" />
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  className={`w-full px-4 py-3 bg-slate-900 text-slate-100 placeholder-slate-400 border-2 rounded-xl focus:outline-none transition-colors ${
                    formErrors.email
                      ? "border-red-400 focus:border-red-500 bg-red-900/20"
                      : "border-slate-700 focus:border-blue-500"
                  }`}
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  disabled={loading}
                />
              </div>
              {formErrors.email && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-slate-200 flex items-center gap-2"
              >
                <FaLock className="text-slate-400" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 pr-12 bg-slate-900 text-slate-100 placeholder-slate-400 border-2 rounded-xl focus:outline-none transition-colors ${
                    formErrors.password
                      ? "border-red-400 focus:border-red-500 bg-red-900/20"
                      : "border-slate-700 focus:border-blue-500"
                  }`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Server Error */}
            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-xl p-4">
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || Object.keys(formErrors).length > 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold
                       hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-700/30
                       disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all
                       shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" />
                  Ingresando...
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </button>

            {/* Forgot Password */}
            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </div>

        {/* Register Link */}
        <div className="text-center mt-8">
          <p className="text-slate-300">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/register"
              className="text-blue-400 hover:text-blue-300 font-semibold hover:underline transition-colors"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
