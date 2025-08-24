// frontend/src/utils/imageUrl.js

/**
 * Construye la URL absoluta de una imagen almacenada en /uploads del backend
 * @param {string} filename - Nombre o ruta (ej: "1755996775927.png" o "/uploads/1755996775927.png")
 * @returns {string} - URL completa para usar en <img src="..." />
 */
export const imageUrl = (filename) => {
  if (!filename) return "/no-image.png"; // Imagen por defecto si no hay archivo

  const baseUrl = import.meta.env.VITE_API_URL.replace("/api", "");

  // Si ya contiene /uploads/, evitar duplicarlo
  if (filename.startsWith("/uploads")) {
    return `${baseUrl}${filename}`;
  }

  return `${baseUrl}/uploads/${filename}`;
};