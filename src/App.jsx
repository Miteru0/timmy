import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { jwtDecode } from 'jwt-decode'; // Use named import
import { OrbitControls, Environment } from '@react-three/drei';
import Model from '../public/Model';
import { useNavigate } from 'react-router-dom'; // For routing
import './App.css';

// Function to handle text-to-speech using Web Speech API
const playTTS = (text, setAnimation, emotion, setSubtitles) => {
  if (!text.trim()) return; // Prevent empty speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 1;
  utterance.rate = 1;

  utterance.onstart = () => {
    setAnimation(emotion); // Set animation based on emotion
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
    body: JSON.stringify({ prompt }),
  });

  const responseText = await response.text();
  console.log(responseText);

  try {
    const data = JSON.parse(responseText);
    return data || {}; // Return full object with emotion and text
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return {};
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
    const token = localStorage.getItem('authToken');
  
    if (!token) {
      navigate('/login'); // Redirect if no token
    } else {
      try {
        const decoded = jwtDecode(token); // Corrected import usage
        const currentTime = Date.now() / 1000; // Convert to seconds
  
        if (decoded.exp < currentTime) {
          console.warn('Token expired, redirecting to login...');
          localStorage.removeItem('authToken'); // Remove expired token
          navigate('/login'); // Redirect to login
        } else {
          setAuthToken(token);
        }
      } catch (error) {
        console.error('Invalid token format, redirecting to login:', error);
        localStorage.removeItem('authToken'); // Remove invalid token
        navigate('/login'); // Redirect to login
      }
    }
  }, [navigate]);
  

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleSpeakClick = async () => {
    if (text && authToken) {
      const response = await fetchAIResponse(text, authToken);
      if (response?.text && response?.emotion) {
        setAiResponse(response.text);
        playTTS(response.text, setSelectedAnimation, response.emotion, setSubtitles);
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
