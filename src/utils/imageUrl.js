// frontend/src/utils/imageUrl.js

/**
 * Construye la URL absoluta de una imagen almacenada en /uploads del backend
 * @param {string} filename - Nombre o ruta (ej: "1755996775927.png" o "/uploads/1755996775927.png")
 * @returns {string} - URL completa para usar en <img src="..." />
 */
import { BACKEND_ORIGIN } from "../config/api.js";

export const imageUrl = (filename) => {
  if (!filename) {
    console.warn('imageUrl: No filename provided');
    return "/no-image.png"; // Imagen por defecto si no hay archivo
  }

  const baseUrl = BACKEND_ORIGIN;

  // Si ya contiene /uploads/, evitar duplicarlo
  if (filename.startsWith("/uploads")) {
    const fullUrl = `${baseUrl}${filename}`;
    console.log('imageUrl (with /uploads):', fullUrl);
    return fullUrl;
  }

  const fullUrl = `${baseUrl}/uploads/${filename}`;
  console.log('imageUrl (adding /uploads):', fullUrl);
  return fullUrl;
};

/**
 * Verifica si una imagen existe y está disponible
 * @param {string} url - URL de la imagen
 * @returns {Promise<boolean>} - true si la imagen existe
 */
export const checkImageExists = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking image:', error);
    return false;
  }
};