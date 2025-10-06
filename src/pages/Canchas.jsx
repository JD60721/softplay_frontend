import { useEffect, useState, useRef } from "react";
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
    SlidersHorizontal,
    ArrowLeft
  } from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from "@react-google-maps/api";

export default function Canchas() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.canchas);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    id: 'google-map-script',
    libraries: [],
  });
  
  // Estados para búsqueda y filtros
  const [q, setQ] = useState("");
  const filterTimeout = useRef(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState('grid');
  const [tab, setTab] = useState('map');
  const [favorites, setFavorites] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  
  // Obtiene coordenadas válidas desde "ubicacion" o "location"
  const getCoords = (item) => {
    if (!item) return null;
    const u = item.ubicacion;
    const l = item.location;
    if (u && Number.isFinite(Number(u.lat)) && Number.isFinite(Number(u.lng))) {
      return { lat: Number(u.lat), lng: Number(u.lng) };
    }
    if (l && Number.isFinite(Number(l.lat)) && Number.isFinite(Number(l.lng))) {
      return { lat: Number(l.lat), lng: Number(l.lng) };
    }
    return null;
  };
  
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

  const fieldTypes = ["Césped Natural", "Césped Artificial", "Pista Cubierta"];
  const services = ["Aparcamiento", "Iluminación", "Vestuarios", "Duchas", "Alquiler de Equipos", "Cafetería"];
  const timeSlots = ["Mañana (6-12h)", "Tarde (12-18h)", "Noche (18-24h)"];

  const defaultCenter = { lat: 3.3928497, lng: -76.5370596 };
  const mapContainerStyle = { width: "100%", height: "500px" };
  const mapOptions = { mapTypeControl: true, streetViewControl: true, fullscreenControl: true };

  // Aplicar fondo oscuro a toda la pantalla mientras esta página esté activa
  useEffect(() => {
    const body = document.body;
    body.classList.remove('bg-gray-50');
    body.classList.add('bg-slate-900');
  }, []);

  const onMapLoad = (map) => {
    mapRef.current = map;
    if (list?.length) {
      const bounds = new window.google.maps.LatLngBounds();
      list.forEach((c) => {
        const p = getCoords(c);
        if (p) bounds.extend(p);
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }
    }
  };

  useEffect(() => {
    // Cargar canchas iniciales sin filtros
    dispatch(fetchCanchas());
  }, [dispatch]);

  // Título de la página para /canchas
  useEffect(() => {
    document.title = "Encuentra tu cancha perfecta · Softplay";
  }, []);

  // Intentar obtener la ubicación actual del usuario
  useEffect(() => {
    if (!navigator.geolocation) {
      // Fallback: usar centro por defecto (Cali)
      setUserLocation(defaultCenter);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      () => {
        // Si se rechaza o falla, usar Cali
        setUserLocation(defaultCenter);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Ajustar vista cuando cambia la ubicación del usuario o lista de canchas
  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    const bounds = new window.google.maps.LatLngBounds();

    const points = [];
    if (list?.length) {
      list.forEach((c) => {
        const p = getCoords(c);
        if (p) {
          points.push(p);
          bounds.extend(p);
        }
      });
    }
    if (userLocation) {
      points.push(userLocation);
      bounds.extend(userLocation);
    }

    if (points.length === 1) {
      mapRef.current.setCenter(points[0]);
      mapRef.current.setZoom(15);
    } else if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds);
    } else if (userLocation) {
      mapRef.current.panTo(userLocation);
    }
  }, [userLocation, list]);

  const search = () => {
    // Si hay texto de búsqueda, lo enviamos junto con los filtros activos
    const searchParams = {
      q,
      ...(filters.location && { location: filters.location }),
      ...(filters.radius && { radius: filters.radius }),
      ...(filters.minPrice > 0 && { minPrice: filters.minPrice }),
      ...(filters.maxPrice < 100 && { maxPrice: filters.maxPrice }),
      ...(filters.fieldType && { fieldType: filters.fieldType }),
      ...(filters.date && { date: filters.date }),
      ...(filters.timeSlot && { timeSlot: filters.timeSlot }),
      ...(filters.services.length > 0 && { services: filters.services }),
      ...(filters.minRating > 0 && { minRating: filters.minRating })
    };
    
    dispatch(fetchCanchas(searchParams));
  };

  const centerOnUser = () => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.panTo(userLocation);
    mapRef.current.setZoom(14);
  };

  const fitAllMarkers = () => {
    if (!mapRef.current || !window.google) return;
    const bounds = new window.google.maps.LatLngBounds();
    list.forEach((c) => {
      const p = getCoords(c);
      if (p) bounds.extend(p);
    });
    if (userLocation) bounds.extend(userLocation);
    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds);
    }
  };

  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
    
    // Aplicar filtros automáticamente después de un breve retraso
    // para evitar múltiples llamadas durante cambios rápidos
    if (filterTimeout.current) {
      clearTimeout(filterTimeout.current);
    }
    
    filterTimeout.current = setTimeout(() => {
      search();
    }, 500);
  };

  const handleServiceToggle = (service) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
    
    // Aplicar filtros automáticamente después de un breve retraso
    if (filterTimeout.current) {
      clearTimeout(filterTimeout.current);
    }
    
    filterTimeout.current = setTimeout(() => {
      search();
    }, 500);
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
    
    // Realizar búsqueda con filtros limpios
    if (q) {
      dispatch(fetchCanchas({ q }));
    } else {
      dispatch(fetchCanchas());
    }
  };

  // Vista completa con buscador y mapa en /canchas

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Botón Volver al Panel */}
      <div className="flex justify-start px-4 pt-4">
        <Link 
          to="/admin" 
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        > 
          <ArrowLeft className="w-5 h-5" /> 
          <span>Volver al Panel</span> 
        </Link> 
      </div>
      {/* Header con búsqueda principal */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              Encuentra tu cancha perfecta
            </h1>
            <p className="text-slate-400">
              Más de {list.length} canchas disponibles cerca de ti
            </p>
          </div>

          {/* Búsqueda principal */}
          <div className="max-w-4xl mx-auto">
            <div className="relative flex gap-3 mb-4 justify-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400"
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
                className="px-6 py-4 border border-slate-700 text-slate-200 rounded-2xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filtros
              </button>
              {/* Tabs Mapa / Lista junto al botón de Filtros */}
              <div className="inline-flex items-center gap-2 bg-slate-800 p-1 rounded-xl border border-slate-700 shadow-sm">
                <button
                  onClick={() => setTab('map')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${tab === 'map' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
                >
                  <MapPin className="w-4 h-4" />
                  Mapa
                </button>
                <button
                  onClick={() => setTab('list')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${tab === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                  Lista
                </button>
              </div>
            </div>

            {/* Se eliminó la sección de búsquedas populares */}
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
            
            {/* Botón para aplicar filtros */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={search}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar Filtros
              </button>
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

            {/* Valoración Mínima */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="w-4 h-4 inline mr-1 fill-yellow-400 stroke-yellow-400" />
                Valoración Mínima
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                  className="w-full accent-yellow-400"
                />
                <span className="ml-2 font-medium">{filters.minRating}</span>
              </div>
              <div className="flex mt-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star}
                    className={`w-5 h-5 ${star <= filters.minRating ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-gray-300'}`}
                  />
                ))}
              </div>
            </div>
      </div>
    </div>
  )}

  {/* Controles de vista y resultados */}
  <div className="max-w-7xl mx-auto px-4 py-6">
    {/* Mapa de canchas */}
    {tab === 'map' && (
    <div className="mb-6">
      <div className="w-full rounded-2xl overflow-hidden border border-slate-700 shadow-sm bg-slate-800 relative">
        {loadError && (
          <div className="h-[500px] w-full flex items-center justify-center bg-red-900/20 text-red-400">Error al cargar el mapa</div>
        )}
        {!isLoaded ? (
          <div className="h-[500px] w-full flex items-center justify-center bg-blue-900/20 text-blue-400">Cargando mapa...</div>
        ) : (
          <>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={12}
            options={mapOptions}
            onLoad={onMapLoad}
          >
            {list.map((c) => {
              const pos = getCoords(c);
              return (
                pos && (
                  <Marker
                    key={c._id}
                    position={pos}
                    title={c.nombre}
                    onClick={() => setSelected(c)}
                    zIndex={1000}
                    icon={{
                      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                      scaledSize: new window.google.maps.Size(40, 40),
                    }}
                  />
                )
              );
            })}

            {userLocation && (
              <Marker
                position={userLocation}
                title="Tu ubicación"
                zIndex={1100}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            )}

            {userLocation && filters.radius && (
              <Circle
                center={userLocation}
                radius={Number(filters.radius) * 1000}
                options={{
                  fillColor: "#3B82F6",
                  fillOpacity: 0.1,
                  strokeColor: "#3B82F6",
                  strokeOpacity: 0.6,
                  strokeWeight: 2,
                }}
              />
            )}

            {selected && getCoords(selected) && (
              <InfoWindow
                position={getCoords(selected)}
                onCloseClick={() => setSelected(null)}
              >
                <div className="max-w-[280px] p-2">
                  <h3 className="font-semibold mb-1">{selected.nombre}</h3>
                  {selected.direccion && (
                    <p className="text-xs text-gray-600 mb-2">{selected.direccion}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium">${selected.precioHora} / hora</span>
                  </div>
                  <Link
                    to={`/canchas/${selected._id}`}
                    className="block mt-3 text-center bg-blue-600 text-white text-sm py-1.5 px-3 rounded-lg hover:bg-blue-700"
                  >
                    Ver Detalles y Reservar
                  </Link>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
          </>
        )}
      </div>
    </div>
    )}

    {tab === 'list' && (
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
    )}

        {/* Grid de canchas (solo en Lista) */}
        {tab === 'list' && (
          <div className={
            viewType === 'grid'
              ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
              : 'grid gap-6 grid-cols-1 max-w-4xl mx-auto'
          }>
            {list.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
              >
              {/* Imagen con overlay */}
              <div className="relative">
                {(c.imagenes && c.imagenes[0]) ? (
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
        )}

        {/* Estado vacío (solo en Lista) */}
        {tab === 'list' && !loading && list.length === 0 && (
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

