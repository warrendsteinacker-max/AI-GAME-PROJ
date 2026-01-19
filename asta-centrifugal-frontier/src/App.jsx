// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import LandingPage from './components/LandingPage';
// import PlanetMap from './components/PlanetMap';
// import Cockpit from './components/Cockpit';

/**
 * App Routing Configuration
 * - /         : Landing Page to select Duration (10-40m) and Theme.
 * - /map      : Tactical deployment and drawing interface].
 * - /cockpit  : First-person 3D view of the Centrifugal Frontier.
 */
function App() {
  return (
    // <Router>
    //   <div className="app-container">
    //     <Routes>
    //       {/* Entry point for theme and time selection] */}
    //       <Route path="/" element={<LandingPage />} />
          
    //       {/* Tactical map for planet placement and AI dilemmas] */}
    //       <Route path="/map" element={<PlanetMap />} />
          
    //       {/* 3D Visualizer for the orbital physics] */}
    //       <Route path="/cockpit" element={<Cockpit />} />
    //     </Routes>
    //   </div>
    // </Router>
  
  <Router>
    <Route to='/' element={</>}/>
  </Router>
  
  );
}

export default App;
