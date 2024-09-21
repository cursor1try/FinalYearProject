import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const VoiceControl = ({ micEnabled }) => {
  const map = useMap();
  const markerRef = useRef(null);
  const recognitionRef = useRef(null);
  const layersRef = useRef({
    standard: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
    cycle: L.tileLayer(
      "https://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png"
    ),
    transport: L.tileLayer(
      "https://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png"
    ),
    humanitarian: L.tileLayer(
      "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
    ),
  });

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    const navigateToCity = async (city) => {
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${city}&limit=1&format=json&addressdetails=1`
        );
        const data = await response.json();

        // Clear existing markers
        if (markerRef.current) {
          map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
              map.removeLayer(layer);
            }
          });
        }

        // Add markers for each result
        data.forEach((item) => {
          const { lat, lon } = item;
          L.marker([lat, lon]).addTo(map);
        });

        // Optionally, zoom to the first result
        if (data.length > 0) {
          const { lat, lon } = data[0];
          map.setView([lat, lon], 13);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    };

    const addMarker = function(city) {
      var markerUrl = "https://nominatim.openstreetmap.org/search?q=" + city + "&format=json&limit=1";
      $.ajax({
          url: markerUrl,
          dataType: "json",
          success: function(data) {
              var lat = data[0].lat;
              var lon = data[0].lon;
              var marker = L.marker([lat, lon]).addTo(map).bindPopup(city).openPopup();
              markersArray.push(marker); // Store marker in array
              addToHistory('Mark ' + city);
          }
      });
  };
  
  const removeMarker = function(city) {
      map.eachLayer(function(layer) {
          if (layer instanceof L.Marker && layer.getPopup().getContent() === city) {
              map.removeLayer(layer);
              addToHistory('Unmark ' + city);
          }
      });
      // Remove from markersArray as well
      markersArray = markersArray.filter(marker => marker.getPopup().getContent() !== city);
  };
  



    recognition.onresult = (event) => {
      // map.setView([22.5937, 78.9629], 5);

      const transcript = event.results[event.results.length - 1][0].transcript
        .trim()
        .toLowerCase();
      console.log("Recognized text:", transcript);

      const zoomInRegex = /zoom in/;
      const zoomOutRegex = /zoom out/;
      const centerRegex = /center/;
      const moveRegex = /move (right|left|up|down)/;
      const navigateRegex = /navigate to ([a-zA-Z\s]+)/;
      const layerRegex =
        /switch to (standard|cycle|transport|humanitarian) map/;

      const currentCenter = map.getCenter();
      const panOffset = 0.02;

      if (zoomInRegex.test(transcript)) {
        map.setZoom(map.getZoom() + 1);
      } else if (zoomOutRegex.test(transcript)) {
        map.setZoom(map.getZoom() - 1);
      } else if (centerRegex.test(transcript)) {
        map.setView([22.5937, 78.9629], 5);
      } else if (moveRegex.test(transcript)) {
        const direction = transcript.match(moveRegex)[1];
        if (direction === "right") {
          map.panTo([currentCenter.lat, currentCenter.lng + panOffset]);
        } else if (direction === "left") {
          map.panTo([currentCenter.lat, currentCenter.lng - panOffset]);
        } else if (direction === "up") {
          map.panTo([currentCenter.lat + panOffset, currentCenter.lng]);
        } else if (direction === "down") {
          map.panTo([currentCenter.lat - panOffset, currentCenter.lng]);
        }

        if (markerRef.current) {
          markerRef.current.setLatLng(map.getCenter());
        } else {
          markerRef.current = L.marker(map.getCenter()).addTo(map);
        }
      } else if (navigateRegex.test(transcript)) {
        const city = transcript.match(navigateRegex)[1];
        navigateToCity(city);
      } else if (layerRegex.test(transcript)) {
        const layerName = transcript.match(layerRegex)[1];

        Object.values(layersRef.current).forEach((layer) =>
          map.removeLayer(layer)
        );

        if (layersRef.current[layerName]) {
          map.addLayer(layersRef.current[layerName]);
        } else {
          console.log("Layer not recognized:", layerName);
        }
      } else {
        console.log("Command not recognized:", transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "aborted" && micEnabled) {
        recognition.start();
      }
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      if (micEnabled) {
        // Restart recognition if micEnabled is true
        recognition.start();
      }
    };

    if (micEnabled) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
    };
  }, [map, micEnabled]);

  return null;
};

export default VoiceControl;
