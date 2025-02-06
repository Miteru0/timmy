import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Model from '../public/Model';
import './App.css'

// Function to handle text-to-speech using Web Speech API
const playTTS = (text, setAnimation) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 1; // Optional
  utterance.rate = 1;  // Optional

  // Pick a random animation for speech
  const animations = ['talk1', 'talk2']; // Your speech animations array
  const randomAnimation = animations[Math.floor(Math.random() * animations.length)];

  // Start speech and trigger animation
  utterance.onstart = () => {
    setAnimation(randomAnimation); // Set the random animation when speech starts
  };

  // Reset animation when speech ends
  utterance.onend = () => {
    setAnimation('chicken'); // Reset to idle animation after speech ends
  };

  // Speak the text
  speechSynthesis.speak(utterance);
};

const App = () => {
  const [selectedAnimation, setSelectedAnimation] = useState('Idle');
  const [text, setText] = useState('');

  // Update text input
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  // Trigger speech and random animation
  const handleSpeakClick = () => {
    if (text) {
      playTTS(text, setSelectedAnimation); // Trigger TTS and animation change
    }
  };

  return (
    <>
      <Canvas>
        <ambientLight />
        <OrbitControls />
        <Model animationName={selectedAnimation} scale={0.01} />
        <Environment preset="sunset" />
      </Canvas>

      {/* Input and buttons for triggering speech */}
      <div style={{ position: 'absolute', top: 10, left: 10 }}>
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type something for TTS"
        />
        <button onClick={handleSpeakClick}>Speak</button>
      </div>
    </>
  );
};

export default App;
