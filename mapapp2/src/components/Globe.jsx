import { MapContainer, TileLayer, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// const { BaseLayer } = LayersControl;
const Globe = () => {
  return (
    <div className="h-auto">
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        // style={{ width: "100%" }}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
      </MapContainer>
    </div>
  );
};
export default Globe;
