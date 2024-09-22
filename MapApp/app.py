from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from geopy.geocoders import Nominatim

import speech_recognition as sr
import re

app = Flask(__name__)
socketio = SocketIO(app)

# Initialize Speech Recognizer and Geocoder globally
recognizer = sr.Recognizer()
geolocator = Nominatim(user_agent="address_geocoder")

@app.route('/')
def index():
    return render_template('index.html')

def recognize_speech():
    with sr.Microphone() as source:
        print("Listening...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)
        try:
            command = recognizer.recognize_google(audio)
            print(f"Recognized: {command}")
            return command.lower()
        except sr.UnknownValueError:
            print("Google Speech Recognition could not understand the audio")
            return ""
        except sr.RequestError as e:
            print(f"Could not request results; {e}")
            return ""

@socketio.on('start_recognition')
def handle_recognition():
    command = recognize_speech()
    if command:
        # Use regex to check and extract city name from the command (handles multiple-word city names)
        match = re.match(r"navigate to (.+)", command)
        if match:
            city_name = match.group(1)
            print(f"City Name: {city_name}")

            # Handle potential geocoding errors
            try:
                location = geolocator.geocode(city_name)
                if location:
                    latitude = location.latitude
                    longitude = location.longitude
                    print(f"Lat : {latitude}, Lon : {longitude}")
                    
                    # Send the city name, latitude, and longitude to the client
                    emit('recognized_command', {
                        'city': city_name,
                        'latitude': latitude,
                        'longitude': longitude
                    })
                else:
                    print(f"City '{city_name}' not found.")
                    emit('recognized_command', {'error': 'City not found'})
            except Exception as e:
                print(f"Geocoding error: {e}")
                emit('recognized_command', {'error': 'Geocoding error'})
        else:
            print("Command not recognized or city name not found")
            emit('recognized_command', {'error': 'Command not recognized'})

if __name__ == '__main__':
    socketio.run(app)
