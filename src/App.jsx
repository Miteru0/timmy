import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import Model from '../public/Model';
import { useNavigate } from 'react-router-dom'; // For routing
import './App.css';

// Function to handle text-to-speech using Web Speech API
const playTTS = (text, setAnimation, setSubtitles) => {
  if (!text.trim()) return; // Prevent empty speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 1;
  utterance.rate = 1;

  // Random animation selection
  const animations = ['talk1', 'talk2'];
  const randomAnimation = animations[Math.floor(Math.random() * animations.length)];

  utterance.onstart = () => {
    setAnimation(randomAnimation);
    setSubtitles(text); // Display the subtitles when TTS starts
  };

  utterance.onend = () => {
    setAnimation('chicken'); // Reset to "chicken" animation after speech
    setSubtitles(''); // Clear the subtitles when TTS ends
  };

  speechSynthesis.speak(utterance);
};

// Function to make an API request to your backend
const fetchAIResponse = async (prompt, token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/timmy/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      prompt: prompt,
    }),
  });

  const responseText = await response.text();
  console.log(responseText);

  try {
    const data = JSON.parse(responseText);
    return data?.response || '';
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return '';
  }
};

const App = () => {
  const [selectedAnimation, setSelectedAnimation] = useState('Idle');
  const [text, setText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [subtitles, setSubtitles] = useState('');
  const [authToken, setAuthToken] = useState(null); // Token state

  const navigate = useNavigate(); // Use navigate instead of history

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login'); // Redirect to login if no token
    } else {
      setAuthToken(token);
    }
  }, [navigate]);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleSpeakClick = async () => {
    if (text && authToken) {
      const response = await fetchAIResponse(text, authToken);
      setAiResponse(response);
      if (response) {
        playTTS(response, setSelectedAnimation, setSubtitles);
      }
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

      <div className="controls">
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type something for TTS"
        />
        <button onClick={handleSpeakClick}>Ask Timmy</button>
      </div>

      {aiResponse && (
        <div className="ai-response">
          <strong>Timmy response:</strong> {aiResponse}
        </div>
      )}

      {subtitles && (
        <div className="subtitles">
          <strong>Subtitles:</strong> {subtitles}
        </div>
      )}
    </>
  );
};

export default App;
