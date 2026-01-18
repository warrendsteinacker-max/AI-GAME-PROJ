import React, { useRef, useState, useEffect } from 'react';

const DrawingCanvas = ({ onSave }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#00ffff'); // Neon Cyan default

    // Initialize Canvas with a space-themed dark background
    useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, 256, 256);
    }, []);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        const ctx = canvasRef.current.getContext('2d');
        ctx.strokeStyle = color;
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const handleConfirm = () => {
        // Convert the drawing to a Base64 string for Three.js textures
        const textureData = canvasRef.current.toDataURL('image/png');
        onSave(textureData);
    };

    return (
        <div style={overlayStyle}>
            <div style={headerStyle}>PLANET SURFACE DESIGNER</div>
            
            <canvas
                ref={canvasRef}
                width={256}
                height={256}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={canvasStyle}
            />

            <div style={paletteStyle}>
                {['#00ffff', '#ff00ff', '#ffff00', '#00ff00'].map(c => (
                    <div 
                        key={c} 
                        onClick={() => setColor(c)} 
                        style={{...colorDot, background: c, border: color === c ? '2px solid white' : 'none'}} 
                    />
                ))}
            </div>

            <button onClick={handleConfirm} style={deployBtn}>
                CONFIRM DEPLOYMENT
            </button>
        </div>
    );
};

// --- STYLES ---
const overlayStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,10,10,0.95)', border: '2px solid #0ff', padding: '20px', textAlign: 'center', zIndex: 200, boxShadow: '0 0 30px rgba(0,255,255,0.3)' };
const headerStyle = { color: '#0ff', fontSize: '0.8rem', letterSpacing: '3px', marginBottom: '15px' };
const canvasStyle = { cursor: 'crosshair', borderRadius: '50%', boxShadow: 'inset 0 0 10px #0ff' };
const paletteStyle = { display: 'flex', justifyContent: 'center', gap: '10px', margin: '15px 0' };
const colorDot = { width: '25px', height: '25px', borderRadius: '50%', cursor: 'pointer' };
const deployBtn = { background: '#0ff', color: '#000', border: 'none', padding: '10px 20px', fontFamily: 'Orbitron', fontWeight: 'bold', cursor: 'pointer', width: '100%' };

export default DrawingCanvas;