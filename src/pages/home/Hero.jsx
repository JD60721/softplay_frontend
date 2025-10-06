import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero(){
  return (
    <div>
      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white">
        Reserva
        <br />
        canchas
        <br />
        en un solo
        <br />
        lugar
      </h1>
      <p className="mt-6 text-slate-300 text-lg max-w-xl">
        Encuentra y reserva las mejores canchas deportivas cerca de ti. Fútbol,
        tenis, básquet, pádel y más deportes disponibles con reserva inmediata.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          to="/canchas"
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-colors"
        >
          Reservar ahora
        </Link>
        <Link
          to="/reservas"
          className="px-6 py-3 border border-slate-700 text-slate-200 rounded-xl hover:bg-slate-800"
        >
          Mis reservas
        </Link>
      </div>

      {/* Tarjeta tipo cancha */}
      <div className="relative mt-8">
        <div className="rounded-2xl bg-green-600 p-4 shadow-xl">
          <div className="text-center text-white font-semibold mb-2">SoftPlay</div>
          <svg viewBox="0 0 400 240" className="w-full h-[260px] bg-green-500 rounded-xl">
            <rect x="10" y="10" width="380" height="220" fill="none" stroke="#fff" strokeWidth="4" />
            <line x1="200" y1="10" x2="200" y2="230" stroke="#fff" strokeWidth="3" />
            <circle cx="200" cy="120" r="26" fill="none" stroke="#fff" strokeWidth="3" />
            <rect x="40" y="70" width="60" height="100" fill="none" stroke="#fff" strokeWidth="3" />
            <rect x="300" y="70" width="60" height="100" fill="none" stroke="#fff" strokeWidth="3" />
          </svg>
          <div className="mt-3 text-center">
            <Link to="/canchas" className="inline-block bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800">
              Reserva tu cancha ahora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}