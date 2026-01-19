import React, { useState, useContext } from 'react';
import { DatC } from '../context/GameContext';
import DrawingCanvas from './DrawingCanvas';
import axios from 'axios';

const PlanetMap = () => {
    // Defaulting planets to [] here prevents the .map error even if Context fails
    const { planets = [], addPlanet, civ = { health: 100 }, updatePhysics, maxPlacementRadius, gameConfig } = useContext(DatC);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tempCoords, setTempCoords] = useState({ x: 0, z: 0 });
    const [activeScenario, setActiveScenario] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleMapClick = (e) => {
        if (activeScenario || isDrawing) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left - 400) / 5; 
        const z = (e.clientY - rect.top - 300) / 5;
        const distance = Math.sqrt(x**2 + z**2);

        const isOverlap = planets.some(p => Math.sqrt((p.x - x)**2 + (p.z - z)**2) < 15);
        if (isOverlap) return alert("Space Occupied!");
        if (distance > maxPlacementRadius) return alert("Outside Safe Zone!");

        setTempCoords({ x, z });
        setIsDrawing(true); 
    };

    const finalizeDeployment = async (texture) => {
        setIsDrawing(false);
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/generate-scenario', {
                theme: gameConfig.theme,
                civHealth: civ.health,
                planetData: tempCoords,
                gameDuration: gameConfig.duration
            });
            setActiveScenario({ ...res.data, texture });
        } catch (err) {
            alert("AI Link Failure. Check Server Console.");
        } finally {
            setLoading(false);
        }
    };

    const handleOption = async (option) => {
        try {
            const res = await axios.post('http://localhost:5000/api/judge-response', {
                scenario: activeScenario.scenario,
                playerAnswer: option,
                theme: gameConfig.theme
            });
            addPlanet({ ...tempCoords, texture: activeScenario.texture, tugMultiplier: res.data.tugMultiplier });
            updatePhysics(res.data);
            alert(`OUTCOME: ${res.data.outcome}`);
            setActiveScenario(null);
        } catch (err) {
            setActiveScenario(null);
        }
    };

    return (
        <div style={mapContainer}>
            <div style={radarStyle} onClick={handleMapClick}>
                <div style={{...zoneIndicator, width: maxPlacementRadius * 10, height: maxPlacementRadius * 10 }} />
                <div style={{...planetIcon, left: 395, top: 295, background: '#fff', boxShadow: '0 0 10px #fff'}} />

                {planets?.map((p, i) => (
                    <div key={i} style={{
                        ...planetIcon, 
                        left: 400 + p.x * 5, 
                        top: 300 + p.z * 5,
                        background: `url(${p.texture})`, // Shows your custom drawing
                        backgroundSize: 'cover',
                        width: '15px', height: '15px'
                    }} />
                ))}
                
                <div style={headerText}>
                    <h3 style={{margin: 0}}>TACTICAL MAP: {gameConfig.theme?.toUpperCase()}</h3>
                    <small>STABILITY: {Math.round(civ.health)}%</small>
                </div>
            </div>

            {loading && <div style={loadingOverlay}>COMMUNICATING WITH NEURAL LINK...</div>}
            {isDrawing && <DrawingCanvas onSave={finalizeDeployment} />}
            
            {activeScenario && (
                <div style={modalStyle}>
                    <h2 style={{color: '#0ff', borderBottom: '1px solid #0ff', marginTop: 0}}>{activeScenario.title}</h2>
                    <p style={{lineHeight: '1.4'}}>{activeScenario.scenario}</p>
                    {activeScenario.options?.map(opt => (
                        <button key={opt} onClick={() => handleOption(opt)} style={optBtn}>{opt}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- STYLES ---
const mapContainer = { width: '100vw', height: '100vh', background: '#000', color: '#0ff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Orbitron, sans-serif' };
const radarStyle = { width: '800px', height: '600px', border: '2px solid #055', position: 'relative', overflow: 'hidden', cursor: 'crosshair', background: 'radial-gradient(circle, #001111 0%, #000 70%)' };
const zoneIndicator = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '1px dashed #0ff', borderRadius: '50%', pointerEvents: 'none', transition: 'all 0.5s ease' };
const planetIcon = { position: 'absolute', width: '10px', height: '10px', background: '#0ff', borderRadius: '50%', transform: 'translate(-50%, -50%)', border: '1px solid #fff' };
const headerText = { position: 'absolute', top: '20px', width: '100%', textAlign: 'center', pointerEvents: 'none', textShadow: '0 0 5px #0ff' };
const loadingOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200, color: '#0ff', fontSize: '1.2rem', letterSpacing: '2px' };
const modalStyle = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '450px', background: 'rgba(0,15,15,0.98)', border: '2px solid #0ff', padding: '30px', zIndex: 300, boxShadow: '0 0 40px #044' };
const optBtn = { display: 'block', width: '100%', margin: '12px 0', padding: '14px', background: 'transparent', color: '#0ff', border: '1px solid #0ff', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.85rem', transition: '0.3s' };

export default PlanetMap;