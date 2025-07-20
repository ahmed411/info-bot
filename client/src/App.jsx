import React, { useState } from 'react';
import './App.css'; // You can style this later
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');
    setError('');

    try {
      const backendUrl = 'http://localhost:5000/api/chat'; // Your backend URL
      const res = await axios.post(backendUrl, { prompt });
      setResponse(res.data.reply);
    } catch (err) {
      console.error("Error fetching from backend:", err);
      setError('Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <form onSubmit={handleSubmit}>
          <textarea
            rows="5"
            cols="50"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            disabled={loading}
          />
          <br />
          <button type="submit" disabled={loading}>
            {loading ? 'Thinking...' : 'Get Response'}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}

        {response && (
          <div className="response-container">
            <h2>AI Response:</h2>
            <p>{response}</p>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;