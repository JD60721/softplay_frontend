import React, { useEffect, useRef, useState, useCallback, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from './home/Sidebar.jsx';
import Hero from './home/Hero.jsx';
import { ThemeSelector } from '../components/ThemeSelector.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice.js';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  X,
  Clock,
  Coffee,
  Car,
  Droplets,
  ShoppingBag,
  Lightbulb
} from "lucide-react";
import { Dialog, Transition, Menu, Disclosure } from '@headlessui/react';
import { ChevronDownIcon, AdjustmentsHorizontalIcon, XMarkIcon, ExclamationCircleIcon, InformationCircleIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// API Key desde .env (Vite)
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Opciones del mapa
const defaultCenter = {
  lat: 3.3928497,
  lng: -76.5370596
};

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const mapOptions = {
  mapTypeControl: true,
  streetViewControl: true,
  fullscreenControl: true
};

// Ocultar el mapa en Home; el mapa se muestra en /canchas
const showMapInHome = false;

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [selectedField, setSelectedField] = useState(null);
  const [map, setMap] = useState(null);
  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    id: 'google-map-script',
    libraries: []
  });

  const [fields, setFields] = useState([]);
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [userPos, setUserPos] = useState(null);

  // catálogos
  const fieldTypes = ["Césped Natural", "Césped Artificial", "Pista Cubierta"];
  const servicesCatalog = [
    "Aparcamiento",
    "Iluminación",
    "Vestuarios",
    "Duchas",
    "Alquiler de Equipos",
    "Cafetería",
  ];
  const timeSlots = ["Mañana (6-12h)", "Tarde (12-18h)", "Noche (18-24h)"];

  // Filtros
  const [filters, setFilters] = useState({
    location: "",
    radius: 10,
    minPrice: 0,
    maxPrice: 100,
    fieldType: "", // tipoCancha
    date: "",
    timeSlot: "", // horariosDisponibles
    services: [], // servicios
    minRating: 0, // valoracion
    fecha: new Date(),
  });

  // Callback para cuando el mapa se carga
  const onMapLoad = useCallback((map) => {
    setMap(map);
    
    // Geolocalización
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserPos({ lat, lng });
          
          // Centrar mapa en la ubicación del usuario
          map.setCenter({ lat, lng });
          map.setZoom(14);
        },
        (err) => {
          console.warn("Error de geolocalización:", err);
          setError("No pudimos obtener tu ubicación");
        }
      );
    }
    
    fetchFields();
  }, []);
  
  // Efecto para cargar datos cuando cambia el mapa
  useEffect(() => {
    if (map) {
      fetchFields();
    }
  }, [map]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleServiceToggle = (service) => {
    setFilters((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      radius: 10,
      minPrice: 0,
      maxPrice: 100,
      fieldType: "",
      date: "",
      timeSlot: "",
      services: [],
      minRating: 0,
    });
  };

  // No necesitamos esta función con el enfoque declarativo de react-google-maps/api

  const fetchFields = async () => {
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);

      params.set("minPrice", String(filters.minPrice));
      params.set("maxPrice", String(filters.maxPrice));
      if (filters.fieldType) params.set("fieldType", filters.fieldType);
      if (filters.location) params.set("location", filters.location);
      if (filters.date) params.set("date", filters.date);
      if (filters.timeSlot) params.set("timeSlot", filters.timeSlot);
      if (filters.minRating) params.set("minRating", String(filters.minRating));
      if (filters.services.length) params.set("services", filters.services.join(","));
      if (filters.radius) params.set("radius", String(filters.radius));

      if (userPos) {
        params.set("lat", String(userPos.lat));
        params.set("lng", String(userPos.lng));
      }

      try {
        // Intentar obtener datos reales de la API
        const res = await fetch(`/api/canchas?${params.toString()}`);
        if (!res.ok) throw new Error("Error al cargar canchas");
        const data = await res.json();
        setFields(data);
        
        // Ajustar el mapa para mostrar todos los marcadores si hay un mapa cargado
        if (map && data.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          
          data.forEach(field => {
            if (field.ubicacion?.lat && field.ubicacion?.lng) {
              bounds.extend({
                lat: field.ubicacion.lat,
                lng: field.ubicacion.lng
              });
            }
          });
          
          map.fitBounds(bounds);
          
          // Ajustar el zoom máximo
          window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
            if (map.getZoom() > 15) map.setZoom(15);
          });
        }
      } catch (apiError) {
        console.warn("Error al cargar datos de la API, usando datos de ejemplo:", apiError);
        // Si hay un error, usar datos de ejemplo como fallback
        const exampleData = [
          {
            _id: "1",
            nombre: "Cancha El Gol",
            direccion: "Av. Principal 123",
            precioHora: 50,
            tipoCancha: "Césped Artificial",
            ubicacion: { lat: 3.3928497, lng: -76.5370596 },
            valoracion: 4.5,
            servicios: ["Iluminación", "Vestuarios"],
            horariosDisponibles: ["Mañana (6-12h)", "Tarde (12-18h)"]
          },
          {
            _id: "2",
            nombre: "Complejo Deportivo Central",
            direccion: "Calle Secundaria 456",
            precioHora: 65,
            tipoCancha: "Césped Natural",
            ubicacion: { lat: 3.3930000, lng: -76.5372000 },
            valoracion: 4.0,
            servicios: ["Iluminación", "Vestuarios", "Cafetería"],
            horariosDisponibles: ["Tarde (12-18h)", "Noche (18-24h)"]
          },
          {
            _id: "3",
            nombre: "Pista Indoor",
            direccion: "Av. Deportiva 789",
            precioHora: 80,
            tipoCancha: "Pista Cubierta",
            ubicacion: { lat: 3.3926000, lng: -76.5368000 },
            valoracion: 4.8,
            servicios: ["Iluminación", "Vestuarios", "Duchas", "Cafetería"],
            horariosDisponibles: ["Mañana (6-12h)", "Tarde (12-18h)", "Noche (18-24h)"]
          }
        ];
        setFields(exampleData);
        
        // Ajustar el mapa para mostrar todos los marcadores si hay un mapa cargado
        if (map && exampleData.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          
          exampleData.forEach(field => {
            if (field.ubicacion?.lat && field.ubicacion?.lng) {
              bounds.extend({
                lat: field.ubicacion.lat,
                lng: field.ubicacion.lng
              });
            }
          });
          
          map.fitBounds(bounds);
          
          // Ajustar el zoom máximo
          window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
            if (map.getZoom() > 15) map.setZoom(15);
          });
        }
      }
    } catch (err) {
      console.error("Error cargando canchas:", err);
      setError("Error cargando canchas");
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-100">
      {/* Encabezado interno de la página */}
      <div className="mb-6 bg-slate-800/60 border border-slate-700 rounded-xl px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-semibold text-slate-200">SoftPlay</div>
        <div className="flex items-center gap-3 text-slate-300">
          <span>Tema</span>
        </div>
      </div>

      {/* Panel de Filtros - Usando Headless UI Dialog (mantenido, pero el hero es la vista principal) */}
      <Transition appear show={showFilters} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShowFilters(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                      Filtros Avanzados
                    </Dialog.Title>
                    <div className="flex space-x-2">
                      <button 
                        onClick={clearFilters}
                        className="text-blue-500 hover:text-blue-700 font-medium"
                      >
                        Limpiar filtros
                      </button>
                      <button 
                        onClick={() => setShowFilters(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Precio */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Precio por hora</h4>
                      <div className="flex items-center space-x-4">
                        <div>
                          <label className="block text-sm text-gray-600">Mínimo</label>
                          <input
                            type="number"
                            value={filters.minPrice}
                            onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600">Máximo</label>
                          <input
                            type="number"
                            value={filters.maxPrice}
                            onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fecha */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Fecha</h4>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => {
                          setSelectedDate(date);
                          handleFilterChange('date', date.toISOString().split('T')[0]);
                        }}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        dateFormat="dd/MM/yyyy"
                      />
                    </div>

                    {/* Tipo de Cancha */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Tipo de Cancha</h4>
                      <div className="space-y-2">
                        {fieldTypes.map((tipo) => (
                          <label key={tipo} className="flex items-center">
                            <input
                              type="radio"
                              name="fieldType"
                              value={tipo}
                              checked={filters.fieldType === tipo}
                              onChange={(e) => handleFilterChange('fieldType', e.target.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-gray-700">{tipo}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Horarios Disponibles */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Horarios Disponibles</h4>
                      <div className="space-y-2">
                        {timeSlots.map((horario) => (
                          <label key={horario} className="flex items-center">
                            <input
                              type="radio"
                              name="timeSlot"
                              value={horario}
                              checked={filters.timeSlot === horario}
                              onChange={(e) => handleFilterChange('timeSlot', e.target.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-gray-700">{horario}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Servicios */}
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <h4 className="font-medium text-gray-700">Servicios</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {servicesCatalog.map((servicio) => (
                          <label key={servicio} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.services.includes(servicio)}
                              onChange={() => handleServiceToggle(servicio)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-gray-700">{servicio}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Valoración */}
                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-700">Valoración mínima</h4>
                        <span className="text-blue-600 font-medium">{filters.minRating} estrellas</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.5"
                        value={filters.minRating}
                        onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0</span>
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 space-x-3">
                    <button 
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                      onClick={() => setShowFilters(false)}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      onClick={() => {
                        fetchFields();
                        setShowFilters(false);
                      }}
                    >
                      Aplicar filtros
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Hero principal */}
      <section className="flex-1">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Sidebar izquierda */}
          <div className="md:col-span-3">
            <Sidebar />
          </div>

          {/* Hero principal */}
          <div className="md:col-span-9">
            <Hero />
          </div>
        </div>

        {/* Selector de tema flotante */}
        <ThemeSelector />

        {error && (
          <div className="mt-6 bg-red-600 text-white px-4 py-2 rounded-lg shadow inline-block">
            {error}
          </div>
        )}
      </section>
    </div>
  );
}