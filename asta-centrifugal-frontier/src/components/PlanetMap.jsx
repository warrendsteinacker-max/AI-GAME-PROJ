import React, { useState, useContext, useEffect } from 'react';
import { DatC } from '../context/GameContext';
import DrawingCanvas from './DrawingCanvas';
import axios from 'axios';

const PlanetMap = () => {
    const { planets, addPlanet, civ, updatePhysics, maxPlacementRadius, gameConfig } = useContext(DatC);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tempCoords, setTempCoords] = useState({ x: 0, z: 0 });
    const [activeScenario, setActiveScenario] = useState(null);

    // 1. Handle Map Click: Collision & Range Check]
    const handleMapClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left - 400) / 5; 
        const z = (e.clientY - rect.top - 300) / 5;
        const distance = Math.sqrt(x**2 + z**2);

        // Prevent overlapping existing planets]
        const isOverlap = planets.some(p => Math.sqrt((p.x - x)**2 + (p.z - z)**2) < 15);
        
        if (isOverlap) return alert("Space Occupied: Cannot overlap celestial bodies!");
        if (distance > maxPlacementRadius) return alert("Outside Safe Zone: The frontier is constricting!");

        setTempCoords({ x, z });
        setIsDrawing(true); // Open the DrawingCanvas]
    };

    // 2. Deploy Planet & Trigger AI]
    const finalizeDeployment = async (texture) => {
        setIsDrawing(false);
        try {
            const res = await axios.post('http://localhost:5000/api/generate-scenario', {
                theme: gameConfig.theme,
                civHealth: civ.health,
                planetData: tempCoords,
                gameDuration: gameConfig.duration
            });
            setActiveScenario({ ...res.data, texture });
        } catch (err) {
            console.error("AI manifest error", err);
        }
    };

    // 3. Resolve Choice & Update Physics]
    const handleOption = async (option) => {
        try {
            const res = await axios.post('http://localhost:5000/api/judge-response', {
                scenario: activeScenario.scenario,
                playerAnswer: option,
                theme: gameConfig.theme,
                gameDuration: gameConfig.duration
            });
            
            // Add the planet to state and update Earth's spin/health]
            addPlanet({ 
                ...tempCoords, 
                texture: activeScenario.texture, 
                tugMultiplier: res.data.tugMultiplier 
            });
            updatePhysics(res.data);
            setActiveScenario(null);
        } catch (err) {
            setActiveScenario(null);
        }
    };

    return (
        <div style={mapContainer}>
            <div style={radarStyle} onClick={handleMapClick}>
                {/* Visualizing the Shrinking Zone] */}
                <div style={{...zoneIndicator, width: maxPlacementRadius*10, height: maxPlacementRadius*10}} />
                
                {/* Render Existing Planets */}
                {planets.map((p, i) => (
                    <div key={i} style={{...planetIcon, left: 400 + p.x*5, top: 300 + p.z*5}} />
                ))}
                
                <center><h3>TACTICAL MAP: {gameConfig.theme}</h3></center>
            </div>

            {/* Sub-Components (Overlays)] */}
            {isDrawing && <DrawingCanvas onSave={finalizeDeployment} />}
            
            {activeScenario && (
                <div style={modalStyle}>
                    <h2>{activeScenario.title}</h2>
                    <p>{activeScenario.scenario}</p>
                    {activeScenario.options.map(opt => (
                        <button key={opt} onClick={() => handleOption(opt)} style={optBtn}>{opt}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const mapContainer = { width: '100vw', height: '100vh', background: '#000', color: '#0ff', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const radarStyle = { width: '800px', height: '600px', border: '1px solid #0ff', position: 'relative', overflow: 'hidden', cursor: 'crosshair' };
const zoneIndicator = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '1px dashed #0ff', borderRadius: '50%', pointerEvents: 'none' };
const planetIcon = { position: 'absolute', width: '10px', height: '10px', background: '#0ff', borderRadius: '50%' };
const modalStyle = { position: 'fixed', top: '30%', left: '25%', width: '50%', background: 'rgba(0,0,10,0.95)', border: '2px solid #0ff', padding: '30px', zIndex: 100 };
const optBtn = { display: 'block', width: '100%', margin: '10px 0', padding: '10px', background: 'transparent', color: '#0ff', border: '1px solid #0ff', cursor: 'pointer' };

export default PlanetMap;