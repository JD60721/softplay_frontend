import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

export default function CanchaMap({ lat, lng }){
  const center = { lat: Number(lat) || 0, lng: Number(lng) || 0 };
  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API || ""}>
      <GoogleMap mapContainerStyle={{ width:"100%", height:"400px" }} center={center} zoom={15}>
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  )
}
