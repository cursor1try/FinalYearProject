import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const VoiceControl = ({ micEnabled }) => {
  const map = useMap();
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if the browser supports Speech Recognition
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser doesn't support speech recognition.");
      return;
    }

    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // Configure the Speech Recognition settings
    recognition.continuous = true; // Keep recognition running continuously
    recognition.interimResults = false; // Do not return interim results
    recognition.lang = "en-US"; // Set language to English

    // Function to handle geocoding and navigating to the city
    const navigateToCity = async (city) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${city}`);
        const data = await response.json();
        if (data.length > 0) {
          const { lat, lon } = data[0];
          map.setView([lat, lon], 13);
        } else {
          console.log(`City not found: ${city}`);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    };

    // Handle the result of speech recognition
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript
        .trim()
        .toLowerCase();
      console.log("Recognized text:", transcript);

      // Regular expressions for command matching
      const zoomInRegex = /zoom in/;
      const zoomOutRegex = /zoom out/;
      const centerRegex = /center/;
      const moveRegex = /move (right|left|up|down)/;
      const navigateRegex = /navigate to ([a-zA-Z\s]+)/; // Matches "navigate to <city>"

      const currentCenter = map.getCenter();
      const panOffset = 0.02; // Adjust this value to control the pan distance

      if (zoomInRegex.test(transcript)) {
        map.setZoom(map.getZoom() + 1);
      } else if (zoomOutRegex.test(transcript)) {
        map.setZoom(map.getZoom() - 1);
      } else if (centerRegex.test(transcript)) {
        map.setView([22.5937, 78.9629], 5); // Set to center on India
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
      } else if (navigateRegex.test(transcript)) {
        const city = transcript.match(navigateRegex)[1];
        navigateToCity(city);
      } else {
        console.log("Command not recognized:", transcript);
      }
    };

    // Handle recognition errors
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "aborted" && micEnabled) {
        recognition.start(); // Restart recognition if aborted and mic is enabled
      }
    };

    // Start or stop recognition based on micEnabled state
    if (micEnabled) {
      recognition.start();
    } else {
      recognition.stop();
    }

    // Cleanup: stop recognition on component unmount
    return () => {
      recognition.stop();
    };
  }, [map, micEnabled]);

  return null;
};

export default VoiceControl;
