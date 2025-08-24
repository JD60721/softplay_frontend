import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { misReservasThunk } from "../redux/slices/reservasSlice.js";

export default function MisReservas(){
  const dispatch = useDispatch();
  const { list } = useSelector(s=>s.reservas);

  useEffect(()=>{ dispatch(misReservasThunk()); }, [dispatch]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {list.map(r => (
        <div key={r._id} className="card">
          <h3 className="text-lg font-semibold">{r.cancha?.nombre}</h3>
          <p>{new Date(r.fecha).toLocaleString()}</p>
          <p>Horas: {r.horas}</p>
          <p>Total: ${r.total.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Estado: {r.estado}</p>
        </div>
      ))}
      {!list.length && <p>No tienes reservas.</p>}
    </div>
  )
}
