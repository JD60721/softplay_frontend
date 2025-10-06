import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCanchas, createCancha, uploadFiles } from "../../redux/slices/canchasSlice.js";
import { imageUrl } from "../../utils/imageUrl.js";
import { Star, Clock } from "lucide-react";

export default function AdminCanchas(){
  const dispatch = useDispatch();
  const { list } = useSelector(s=>s.canchas);
  const [form, setForm] = useState({ 
    nombre:"", 
    descripcion:"", 
    direccion:"", 
    precioHora:0, 
    lat:"", 
    lng:"", 
    imagenes:[],
    tipoCancha: "",
    servicios: [],
    valoracion: 0,
    horariosDisponibles: []
  });

  useEffect(()=>{ 
    dispatch(fetchCanchas()); 
  }, [dispatch]);

  const onFiles = async (e)=>{
    const urls = await uploadFiles(e.target.files);
    setForm(prev => ({ ...prev, imagenes:[...prev.imagenes, ...urls] }));
  };

  const submit = async ()=>{
    const payload = { 
      ...form, 
      ubicacion: { lat:Number(form.lat), lng:Number(form.lng) } 
    };
    await dispatch(createCancha(payload));
    setForm({ 
      nombre:"", 
      descripcion:"", 
      direccion:"", 
      precioHora:0, 
      lat:"", 
      lng:"", 
      imagenes:[],
      tipoCancha: "",
      servicios: [],
      valoracion: 0,
      horariosDisponibles: []
    });
    dispatch(fetchCanchas());
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Nueva cancha</h2>
        <input className="input mb-2" placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} />
        <textarea className="input mb-2" placeholder="Descripción" value={form.descripcion} onChange={e=>setForm({...form, descripcion:e.target.value})} />
        <input className="input mb-2" placeholder="Dirección" value={form.direccion} onChange={e=>setForm({...form, direccion:e.target.value})} />
        <input className="input mb-2" type="number" placeholder="Precio por hora" value={form.precioHora} onChange={e=>setForm({...form, precioHora:Number(e.target.value)})} />
        <div className="grid grid-cols-2 gap-2">
          <input className="input" placeholder="Latitud" value={form.lat} onChange={e=>setForm({...form, lat:e.target.value})} />
          <input className="input" placeholder="Longitud" value={form.lng} onChange={e=>setForm({...form, lng:e.target.value})} />
        </div>
        
        {/* Tipo de Cancha */}
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cancha</label>
          <select 
            className="input w-full" 
            value={form.tipoCancha} 
            onChange={e=>setForm({...form, tipoCancha:e.target.value})}
          >
            <option value="">Seleccionar tipo</option>
            <option value="Césped Natural">Césped Natural</option>
            <option value="Césped Artificial">Césped Artificial</option>
            <option value="Pista Cubierta">Pista Cubierta</option>
          </select>
        </div>
        
        {/* Servicios */}
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Servicios</label>
          <div className="grid grid-cols-2 gap-2">
            {["Aparcamiento", "Iluminación", "Vestuarios", "Duchas", "Alquiler de Equipos", "Cafetería"].map(servicio => (
              <label key={servicio} className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={form.servicios.includes(servicio)}
                  onChange={() => {
                    const servicios = [...form.servicios];
                    const index = servicios.indexOf(servicio);
                    if (index === -1) {
                      servicios.push(servicio);
                    } else {
                      servicios.splice(index, 1);
                    }
                    setForm({...form, servicios});
                  }}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">{servicio}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Valoración */}
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Valoración</label>
          <div className="flex items-center">
            <input 
              type="range" 
              min="0" 
              max="5" 
              step="0.5" 
              value={form.valoracion}
              onChange={e=>setForm({...form, valoracion:parseFloat(e.target.value)})}
              className="w-full accent-yellow-400"
            />
            <span className="ml-2 font-medium">{form.valoracion}</span>
          </div>
        </div>
        
        {/* Horarios Disponibles */}
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Horarios Disponibles</label>
          <div className="grid grid-cols-3 gap-2">
            {["Mañana (6-12h)", "Tarde (12-18h)", "Noche (18-24h)"].map(horario => (
              <label key={horario} className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  checked={form.horariosDisponibles.includes(horario)}
                  onChange={() => {
                    const horariosDisponibles = [...form.horariosDisponibles];
                    const index = horariosDisponibles.indexOf(horario);
                    if (index === -1) {
                      horariosDisponibles.push(horario);
                    } else {
                      horariosDisponibles.splice(index, 1);
                    }
                    setForm({...form, horariosDisponibles});
                  }}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">{horario}</span>
              </label>
            ))}
          </div>
        </div>
        
        <input className="mt-2" type="file" multiple onChange={onFiles} />
        <button className="btn btn-primary mt-3" onClick={submit}>Guardar</button>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-3">Tus canchas</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {list.map(c => (
            <div key={c._id} className="card">
              {c.imagenes?.[0] && (
                <img 
                  src={imageUrl(c.imagenes[0])} 
                  alt={c.nombre}
                  className="w-full h-32 object-cover rounded-xl mb-2" 
                />
              )}
              <h3 className="font-semibold">{c.nombre}</h3>
              <p className="text-sm text-gray-600">{c.direccion}</p>
              <p className="text-sm">${c.precioHora} / h</p>
              {c.tipoCancha && <p className="text-sm text-blue-600">{c.tipoCancha}</p>}
              {c.servicios?.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {c.servicios.map(servicio => (
                    <span key={servicio} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {servicio}
                    </span>
                  ))}
                </div>
              )}
              {c.valoracion > 0 && (
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < c.valoracion ? 'fill-yellow-400 stroke-yellow-400' : 'stroke-gray-300'}`}
                    />
                  ))}
                  <span className="ml-1 text-sm">{c.valoracion}</span>
                </div>
              )}
              {c.horariosDisponibles?.length > 0 && (
                <div className="mt-1">
                  <p className="text-xs font-medium text-gray-600">Horarios:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {c.horariosDisponibles.map(horario => (
                      <span key={horario} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {horario}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}