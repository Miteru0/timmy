import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing

const LoginPage = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use navigate for redirecting

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      const response = await fetch('${process.env.REACT_APP_API_URL}/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token; // Adjust based on your API response structure
        localStorage.setItem('authToken', token); // Save token to localStorage
        setToken(token); // Set token in the parent

        // Redirect to home page (or wherever you want to go after successful login)
        navigate('/'); // Redirect to the main page (home page)
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('Login failed, please try again');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleLogin}>Login</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default LoginPage;
