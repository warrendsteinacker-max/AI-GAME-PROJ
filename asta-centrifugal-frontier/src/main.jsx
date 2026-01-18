import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GameProvider } from './context/GameContext'; // Ensures the engine runs globally
import './index.css'; // Global reset and Orbitron font

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* The GameProvider manages the 10-40min timers and physics loops] */}
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>
);
