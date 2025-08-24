import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCanchas, createCancha, uploadFiles } from "../../redux/slices/canchasSlice.js";
import { imageUrl } from "../../utils/imageUrl.js";

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
    imagenes:[] 
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
    setForm({ nombre:"", descripcion:"", direccion:"", precioHora:0, lat:"", lng:"", imagenes:[] });
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
              <p>${c.precioHora} / h</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}