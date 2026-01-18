import React, { createContext, useState, useEffect } from 'react';

export const DatC = createContext();

export const GameProvider = ({ children }) => {
    // Game Configuration from Landing Page]
    const [gameConfig, setGameConfig] = useState({
        duration: 20, // Default 20 mins
        theme: 'Sci-Fi'
    });

    const [planets, setPlanets] = useState([]);
    const [civ, setCiv] = useState({
        health: 100,
        spinSpeed: 0.01, // Target is 0.08 to win
        status: 'playing' // 'playing', 'won', 'lost'
    });

    const [maxPlacementRadius, setMaxPlacementRadius] = useState(150);

    // --- PHYSICS & DECAY LOOP ---
    useEffect(() => {
        if (civ.status !== 'playing') return;

        // Scaling factors based on user-selected duration]
        const stabilityDecay = 2 / (gameConfig.duration * 60); 
        const shrinkRate = 120 / (gameConfig.duration * 60);

        const engineLoop = setInterval(() => {
            // 1. Update Planets: Centrifugal Drift (The "Tug")
            setPlanets(prev => prev.map(p => {
                const multiplier = p.tugMultiplier || 1.0;
                // Planets move further away based on Earth's spin speed
                const drift = 1 + (civ.spinSpeed * 0.1 * multiplier);
                return {
                    ...p,
                    x: p.x * drift,
                    z: p.z * drift
                };
            }));

            // 2. Shrink Safe Placement Zone]
            setMaxPlacementRadius(prev => Math.max(30, prev - shrinkRate));

            // 3. Natural Stability Decay
            setCiv(prev => {
                const newHealth = prev.health - stabilityDecay;
                if (newHealth <= 0) return { ...prev, health: 0, status: 'lost' };
                if (prev.spinSpeed >= 0.08) return { ...prev, status: 'won' };
                return { ...prev, health: newHealth };
            });

        }, 1000); // Runs every second

        return () => clearInterval(engineLoop);
    }, [civ.status, gameConfig.duration, civ.spinSpeed]);

    // Helpers to update state from AI responses]
    const addPlanet = (newPlanet) => setPlanets(prev => [...prev, newPlanet]);
    
    const updatePhysics = (impacts) => {
        setCiv(prev => ({
            ...prev,
            health: Math.min(100, prev.health + impacts.healthImpact),
            spinSpeed: Math.min(0.08, Math.max(0.005, impacts.newSpinSpeed))
        }));
    };

    return (
        <DatC.Provider value={{ 
            planets, setPlanets, 
            civ, setCiv, 
            gameConfig, setGameConfig,
            maxPlacementRadius,
            addPlanet,
            updatePhysics 
        }}>
            {children}
        </DatC.Provider>
    );
};