from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import speech_recognition as sr

app = Flask(__name__)
socketio = SocketIO(app)

# Initialize Speech Recognizer
recognizer = sr.Recognizer()

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
        emit('recognized_command', command)

if __name__ == '__main__':
    socketio.run(app)
