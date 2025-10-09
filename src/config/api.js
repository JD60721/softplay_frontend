// Centralización de URL del backend
// Si estás en desarrollo, usa localhost; en producción, usa backend en Vercel

export const BACKEND_ORIGIN = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://softplay-backend.vercel.app";

// La base de la API, siempre con sufijo /api
export const API_BASE_URL = `${BACKEND_ORIGIN}/api`;