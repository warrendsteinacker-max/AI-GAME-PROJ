import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatC } from '../context/GameContext';

const LandingPage = () => {
    const { gameConfig, setGameConfig, setCiv } = useContext(DatC);
    const navigate = useNavigate();

    const themes = [
        "Cyberpunk", 
        "Cosmic Horror", 
        "Ancient Mythology", 
        "Dungeons & Dragons", 
        "Pandemic", 
        "Funny/Absurd"
    ];

    const handleStart = () => {
        // Reset game state for a fresh mission
        setCiv({
            health: 100,
            spinSpeed: 0.01,
            status: 'playing'
        });
        // Navigate to the tactical map to begin deployment
        navigate('/map');
    };

    return (
        <div style={containerStyle}>
            <div style={scanlineOverlay} />
            
            <header style={headerStyle}>
                <h1 style={titleStyle}>ASTRA</h1>
                <h2 style={subtitleStyle}>THE CENTRIFUGAL FRONTIER</h2>
            </header>

            <main style={mainContent}>
                {/* 1. Playtime Selector (10 - 40 Minutes) */}
                <section style={configSection}>
                    <h3 style={labelStyle}>MISSION DURATION: {gameConfig.duration} MINUTES</h3>
                    <input 
                        type="range" 
                        min="10" 
                        max="40" 
                        step="5"
                        value={gameConfig.duration} 
                        onChange={(e) => setGameConfig({...gameConfig, duration: parseInt(e.target.value)})}
                        style={sliderStyle}
                    />
                    <p style={descriptionStyle}>
                        Adjusts stability decay and placement zone constriction speed.
                    </p>
                </section>

                {/* 2. Theme Selection */}
                <section style={configSection}>
                    <h3 style={labelStyle}>SELECT TIMELINE THEME</h3>
                    <div style={themeGrid}>
                        {themes.map(theme => (
                            <button 
                                key={theme}
                                onClick={() => setGameConfig({...gameConfig, theme})}
                                style={{
                                    ...themeBtn,
                                    background: gameConfig.theme === theme ? 'rgba(0, 255, 255, 0.2)' : 'transparent',
                                    borderColor: gameConfig.theme === theme ? '#0ff' : '#055'
                                }}
                            >
                                {theme}
                            </button>
                        ))}
                    </div>
                </section>

                <button onClick={handleStart} style={startButtonStyle}>
                    INITIALIZE NEURAL LINK
                </button>
            </main>

            <footer style={footerStyle}>
                SYSTEM STATUS: READY // SPIN VELOCITY: STABLE
            </footer>
        </div>
    );
};

// --- STYLING (Inline for Vite flexibility) ---
const containerStyle = { height: '100vh', width: '100vw', background: '#000', color: '#0ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Orbitron, sans-serif', overflow: 'hidden', position: 'relative' };
const scanlineOverlay = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 3px 100%', pointerEvents: 'none', zIndex: 10 };
const titleStyle = { fontSize: '5rem', margin: 0, letterSpacing: '20px', textShadow: '0 0 20px #0ff' };
const subtitleStyle = { fontSize: '1.2rem', letterSpacing: '5px', color: '#0aa', marginBottom: '40px' };
const configSection = { background: 'rgba(0, 20, 20, 0.5)', padding: '20px', borderRadius: '5px', border: '1px solid #055', marginBottom: '20px', width: '450px', textAlign: 'center' };
const labelStyle = { margin: '0 0 15px 0', fontSize: '0.9rem' };
const sliderStyle = { width: '100%', cursor: 'pointer', accentColor: '#0ff' };
const descriptionStyle = { fontSize: '0.7rem', color: '#088', marginTop: '10px' };
const themeGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' };
const themeBtn = { padding: '10px', border: '1px solid', color: '#0ff', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '0.8rem', transition: 'all 0.2s' };
const startButtonStyle = { marginTop: '20px', padding: '15px 40px', fontSize: '1.2rem', background: '#0ff', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 0 15px #0ff' };
const footerStyle = { position: 'absolute', bottom: '20px', fontSize: '0.7rem', color: '#055' };

export default LandingPage;