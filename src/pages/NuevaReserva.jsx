import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useDispatch } from "react-redux";
import { crearReservaThunk } from "../redux/slices/reservasSlice.js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK || "");

function Checkout({ reservaId }){
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const pagar = async ()=>{
    setLoading(true);
    try{
      const { data } = await api.post("/payments/intent", { reservaId });
      const { clientSecret } = data;
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });
      if(result.error) setMsg(result.error.message);
      else if(result.paymentIntent.status === "succeeded") setMsg("Pago exitoso ✅");
    }catch(e){
      setMsg(e.message);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="card mt-4">
      <h3 className="text-lg font-semibold mb-2">Paga con tarjeta</h3>
      <CardElement className="p-3 border rounded-xl" />
      <button className="btn btn-primary mt-3" onClick={pagar} disabled={!stripe || loading}>
        {loading ? "Procesando..." : "Pagar"}
      </button>
      {msg && <p className="mt-2">{msg}</p>}
    </div>
  )
}

export default function NuevaReserva(){
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [fecha, setFecha] = useState("");
  const [horas, setHoras] = useState(1);
  const [reserva, setReserva] = useState(null);
  const nav = useNavigate();
  const dispatch = useDispatch();

  useEffect(()=>{
    api.get(`/canchas/${id}`).then(({data})=> setC(data));
  }, [id]);

  const reservar = async ()=>{
    const { payload } = await dispatch(crearReservaThunk({ canchaId: id, fecha, horas }));
    setReserva(payload);
  };

  if(!c) return <p>Cargando...</p>;

  return (
    <div className="max-w-xl mx-auto">
      <div className="card">
        <h1 className="text-xl font-semibold mb-2">Reservar: {c.nombre}</h1>
        <label className="block mb-1">Fecha y hora de inicio</label>
        <input type="datetime-local" className="input mb-3" value={fecha} onChange={e=>setFecha(e.target.value)} />
        <label className="block mb-1">Horas</label>
        <input type="number" className="input mb-3" value={horas} min={1} onChange={e=>setHoras(Number(e.target.value))} />
        <p className="font-semibold">Total: ${ (c.precioHora || 0) * Number(horas) }</p>
        <button className="btn btn-primary mt-3" onClick={reservar}>Crear reserva</button>
      </div>

      {reserva && (
        <Elements stripe={stripePromise}>
          <Checkout reservaId={reserva._id} />
        </Elements>
      )}
    </div>
  )
}
