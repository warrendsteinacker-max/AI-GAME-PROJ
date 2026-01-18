import React, { useRef, useContext } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Stars, useTexture, PerspectiveCamera } from '@react-three/drei';
import { DatC } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

// Component for the central Civilization Earth
const Earth = ({ spinSpeed }) => {
  const earthRef = useRef();
  // Ensure these files exist in your /public folder
  const [day, night, clouds] = useTexture([
    '/earth_day.jpg',
    '/earth_night.jpg',
    '/earth_clouds.jpg'
  ]);

  useFrame(() => {
    // Rotation is driven by your success in AI dilemmas
    earthRef.current.rotation.y += spinSpeed;
  });

  return (
    <group ref={earthRef}>
      <Sphere args={[1.5, 64, 64]}>
        <meshStandardMaterial map={day} roughness={0.7} />
      </Sphere>
      {/* Cloud layer for realistic depth */}
      <Sphere args={[1.52, 64, 64]}>
        <meshStandardMaterial map={clouds} transparent opacity={0.4} />
      </Sphere>
    </group>
  );
};

// Component for your hand-drawn satellite planets
const SatellitePlanet = ({ position, textureUrl }) => {
  const planetRef = useRef();
  const texture = useTexture(textureUrl);

  useFrame(() => {
    planetRef.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={planetRef} position={position}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial map={texture} emissive="#0ff" emissiveIntensity={0.2} />
    </mesh>
  );
};

const Cockpit = () => {
  const { civ, planets } = useContext(DatC);
  const navigate = useNavigate();

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      {/* HUD Overlay */}
      <div style={hudStyle}>
        <div>SYSTEM STABILITY: {Math.round(civ.health)}%</div>
        <div>SPIN VELOCITY: {(civ.spinSpeed * 1000).toFixed(1)} rad/s</div>
        <button onClick={() => navigate('/map')} style={navBtn}>OPEN TACTICAL MAP</button>
      </div>

      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2, 7]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Earth spinSpeed={civ.spinSpeed} />

        {planets.map((p, i) => (
          <SatellitePlanet 
            key={i} 
            position={[p.x / 10, 0, p.z / 10]} 
            textureUrl={p.texture} 
          />
        ))}
      </Canvas>
    </div>
  );
};

// --- STYLES ---
const hudStyle = { position: 'absolute', top: 20, left: 20, zIndex: 10, color: '#0ff', fontFamily: 'Orbitron', fontSize: '1.2rem', textShadow: '0 0 10px #0ff' };
const navBtn = { marginTop: '10px', padding: '10px', background: 'transparent', color: '#0ff', border: '1px solid #0ff', cursor: 'pointer', display: 'block' };

export default Cockpit;