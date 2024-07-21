import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const VoiceControl = ({ micEnabled }) => {
  const map = useMap();
  const recognitionRef = useRef(null);

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
    recognition.lang = "es-ES"; // Set language to Spanish

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript
        .trim()
        .toLowerCase();
      console.log("Recognized text:", transcript);

      const currentCenter = map.getCenter();
      const panOffset = 0.01; // Adjust this value to control the pan distance
      map.panTo([currentCenter.lat, currentCenter.lng + panOffset]);

      if (transcript.includes("zoom in")) {
        map.setZoom(map.getZoom() + 1);
      } else if (transcript.includes("zoom out")) {
        map.setZoom(map.getZoom() - 1);
      } else if (transcript.includes("centro")) {
        map.setView([22.5937, 78.9629], 5); // Set to center on India
      } else if (transcript.includes("move right")) {
        map.panTo([currentCenter.lat, currentCenter.lng + panOffset]);
      } else if (transcript.includes("move left")) {
        map.panTo([currentCenter.lat, currentCenter.lng - panOffset]);
      } else if (transcript.includes("move up")) {
        map.panTo([currentCenter.lat + panOffset, currentCenter.lng]);
      } else if (transcript.includes("move down")) {
        map.panTo([currentCenter.lat - panOffset, currentCenter.lng]);
      }
      // Add more commands as needed
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "aborted" && micEnabled) {
        recognition.start(); // Restart recognition if aborted and mic is enabled
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
