import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  useMapEvents,
} from "react-leaflet";
import VoiceControl from "./VoiceControl";
import "leaflet/dist/leaflet.css";

const { BaseLayer } = LayersControl;

const CoordinatesDisplay = () => {
  const [coords, setCoords] = useState({ lat: null, lng: null });

  useMapEvents({
    mousemove(e) {
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return (
    <div
      style={{
        position: "absolute",
        zIndex: 1000,
        background: "white",
        border: "1px solid black",
        borderRadius: "5px",
        padding: "5px",
        top: "10px",
        right: "500px",
      }}
    >
      {coords.lat !== null && coords.lng !== null ? (
        <div>
          <strong>Lat:</strong> {coords.lat.toFixed(5)}, <strong>Lng:</strong>{" "}
          {coords.lng.toFixed(5)}
        </div>
      ) : (
        <div>Move mouse over the map</div>
      )}
    </div>
  );
};

const MapComponent = () => {
  const [micEnabled, setMicEnabled] = useState(false);

  const toggleMic = () => {
    micEnabled ? console.log("Mic is Off") : console.log("Mic is On");
    setMicEnabled((prevState) => !prevState);
  };

  return (
    <div>
      <button
        onClick={toggleMic}
        style={{
          position: "absolute",
          zIndex: 1000,
          padding: "10px",
          background: "white",
          border: "1px solid black",
          borderRadius: "5px",
          margin: "100px",
        }}
      >
        {micEnabled ? "Disable Mic" : "Enable Mic"}
      </button>
      <MapContainer
        center={[22.5937, 78.9629]}
        zoom={6}
        style={{ height: "100vh", width: "100%" }}
      >
        <LayersControl position="topright">
          <BaseLayer checked name="Standard Map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
            />
          </BaseLayer>
          <BaseLayer name="Cycle Map">
            <TileLayer
              url="https://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}/&layers=H.png"
              attribution="&copy; <a href='https://www.opencyclemap.org/'>OpenCycleMap</a> contributors"
            />
          </BaseLayer>
          <BaseLayer name="Transport Map">
            <TileLayer
              url="https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://www.opencyclemap.org/'>OpenCycleMap</a> contributors"
            />
          </BaseLayer>
          <BaseLayer name="Humanitarian Map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://www.openstreetmap.fr/'>Humanitarian OSM</a> contributors"
            />
          </BaseLayer>
        </LayersControl>
        <VoiceControl micEnabled={micEnabled} />
        <CoordinatesDisplay /> {/* Add the CoordinatesDisplay component here */}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
