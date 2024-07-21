import React, { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import VoiceControl from "./VoiceControl";
import "leaflet/dist/leaflet.css";

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
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        <VoiceControl micEnabled={micEnabled} />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
