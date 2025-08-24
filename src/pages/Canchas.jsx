import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCanchas } from "../redux/slices/canchasSlice.js";
import { Link } from "react-router-dom";
import { imageUrl } from "../utils/imageUrl.js";
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Star, 
  Filter, 
  X, 
  ChevronDown, 
  Heart, 
  Share2,
  Grid3X3,
  List,
  SlidersHorizontal
} from "lucide-react";

export default function Canchas() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.canchas);
  
  // Estados para búsqueda y filtros
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState('grid');
  const [favorites, setFavorites] = useState(new Set());
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    location: "",
    radius: 10,
    minPrice: 0,
    maxPrice: 100,
    fieldType: "",
    date: "",
    timeSlot: "",
    services: [],
    minRating: 0
  });

  const popularSearches = ["Centro"];
  const fieldTypes = ["Césped Natural", "Césped Artificial", "Pista Cubierta"];
  const services = ["Aparcamiento", "Iluminación", "Vestuarios", "Duchas", "Alquiler de Equipos", "Cafetería"];
  const timeSlots = ["Mañana (6-12h)", "Tarde (12-18h)", "Noche (18-24h)"];

  useEffect(() => {
    dispatch(fetchCanchas());
  }, [dispatch]);

  const search = () => {
    dispatch(fetchCanchas(q));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
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
      minRating: 0
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header con búsqueda principal */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Encuentra tu cancha perfecta
            </h1>
            <p className="text-gray-600">
              Más de {list.length} canchas disponibles cerca de ti
            </p>
          </div>

          {/* Búsqueda principal */}
          <div className="max-w-4xl mx-auto">
            <div className="relative flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  placeholder="Buscar canchas por nombre, ubicación..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && search()}
                />
              </div>
              <button 
                onClick={search}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Buscar
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filtros
              </button>
            </div>

            {/* Búsquedas populares */}
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-gray-500 mr-2">Populares:</span>
              {popularSearches.map(search => (
                <button
                  key={search}
                  onClick={() => setQ(search)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
              <div className="flex gap-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md hover:bg-gray-100"
                >
                  Limpiar filtros
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Ciudad/Zona"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2">
                  <label className="text-xs text-gray-500">Radio: {filters.radius}km</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={filters.radius}
                    onChange={(e) => handleFilterChange('radius', e.target.value)}
                    className="w-full mt-1 accent-blue-600"
                  />
                </div>
              </div>

              {/* Fecha y Hora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={filters.timeSlot}
                  onChange={(e) => handleFilterChange('timeSlot', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                >
                  <option value="">Cualquier horario</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Precio por Hora
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Máx"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  ${filters.minPrice} - ${filters.maxPrice}
                </div>
              </div>

              {/* Tipo de Campo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Campo
                </label>
                <select
                  value={filters.fieldType}
                  onChange={(e) => handleFilterChange('fieldType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los tipos</option>
                  {fieldTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Servicios */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Servicios</label>
              <div className="flex flex-wrap gap-2">
                {services.map(service => (
                  <button
                    key={service}
                    onClick={() => handleServiceToggle(service)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.services.includes(service)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
            </div>

            {/* Valoración */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Valoración Mínima</label>
              <div className="flex gap-2">
                {[0, 3, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange('minRating', rating)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      filters.minRating === rating
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                    {rating > 0 ? `${rating}+` : 'Todas'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controles de vista y resultados */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {list.length} canchas encontradas
            </h2>
            {loading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Buscando...
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded-lg ${viewType === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-2 rounded-lg ${viewType === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grid de canchas */}
        <div className={`grid gap-6 ${
          viewType === 'grid' 
            ? 'md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 max-w-4xl mx-auto'
        }`}>
          {list.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
            >
              {/* Imagen con overlay */}
              <div className="relative">
                {c.imagenes?.[0] ? (
                  <img
                    src={imageUrl(c.imagenes[0])}
                    alt={c.nombre}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Botones de acción en overlay */}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => toggleFavorite(c._id)}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        favorites.has(c._id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-600'
                      }`} 
                    />
                  </button>
                  <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Badge de disponibilidad */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                    Disponible
                  </span>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {c.nombre}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">4.8</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{c.direccion}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">${c.precioHora}</span>
                    <span className="text-sm text-gray-500">/hora</span>
                  </div>
                  <span className="text-sm text-gray-500">2.3 km</span>
                </div>

                {/* Servicios disponibles */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {['Aparcamiento', 'Vestuarios', 'Iluminación'].slice(0, 3).map(service => (
                    <span 
                      key={service}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>

                {/* Botón de acción */}
                <Link 
                  to={`/canchas/${c._id}`}
                  className="block w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Ver Detalles y Reservar
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Estado vacío */}
        {!loading && list.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron canchas
            </h3>
            <p className="text-gray-600 mb-4">
              Intenta ajustar tus criterios de búsqueda
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}