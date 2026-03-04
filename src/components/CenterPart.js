import React, { useState } from 'react';
import RobotScene from '../RobotScene'; // 🔴 Path கவனம்: RobotScene src/ போல்டரில் உள்ளது
import ControlButtons from './ControlButtons'; // பட்டன்கள் அதே components போல்டரில் உள்ளது
import { useWebSocket } from '../context/WebSocketContext';

const CenterPart = () => {
  const { robotState } = useWebSocket();
  
  // System OK Popup State
  const [isSystemOkOpen, setIsSystemOkOpen] = useState(false);

  const rs = robotState || {};
  const currentError = rs.error_message || "No error";
  const errLower = currentError.toLowerCase().trim();
  const hasError = !["no error", "no active errors", "error cleared"].includes(errLower) && errLower !== "";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#151822' }}>
      
      {/* ==========================================
          1. TOP HEADER (Branding & System Status)
          ========================================== */}
      <div style={{ height: '45px', flexShrink: 0, backgroundColor: '#151822', borderBottom: '2px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 15px' }}>
        
        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ color: '#00bcd4', fontWeight: '900', fontSize: 'clamp(1rem, 1.2vw, 1.2rem)', letterSpacing: '2px', fontFamily: 'Impact, sans-serif' }}>TEXSONICS</div>
            <div style={{ color: '#555', fontWeight: 'bold', fontSize: '0.75rem', letterSpacing: '1px' }}>ROBOT CONTROLLER V1.0</div>
        </div>
        
        {/* SYSTEM OK BUTTON WITH ERROR POPUP */}
        <div style={{ position: 'relative' }}>
            <button 
                onClick={() => setIsSystemOkOpen(!isSystemOkOpen)}
                style={{ background: hasError ? 'linear-gradient(180deg, #E53935, #b71c1c)' : 'linear-gradient(180deg, #00E676, #1B5E20)', color: hasError ? 'white' : '#000', fontWeight: '900', border: '1px solid #111', padding: '6px 15px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', boxShadow: hasError ? '0 0 10px red' : '0 2px 5px rgba(0,0,0,0.5)' }}
            >
                {hasError ? "⚠️ VIEW ERROR" : "✓ SYSTEM OK"}
            </button>
            
            {isSystemOkOpen && (
                <div style={{ position: 'absolute', top: '130%', right: '0', width: '220px', background: '#1e222b', border: hasError ? '2px solid #fc0606' : '2px solid #00E676', zIndex: 1000, borderRadius: '6px', padding: '15px', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.9)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: hasError ? '#f50707' : '#00E676', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>SYSTEM STATUS</h4>
                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>{currentError}</p>
                    <button style={{ marginTop: '15px', width: '100%', padding: '8px', background: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }} onClick={() => setIsSystemOkOpen(false)}>CLOSE</button>
                </div>
            )}
        </div>

      </div>

      {/* ==========================================
          2. CORE: 3D ROBOT SCENE
          (இதற்குள்ளேயே கீழே Cartesian பேனல் மற்றும் Joints வந்துவிடும்)
          ========================================== */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <RobotScene />
      </div>

      {/* ==========================================
          3. BOTTOM DECK: CONTROL BUTTONS
          (Controls & Close பொத்தான்கள் நீக்கப்பட்டு, பழைய பட்டன்கள் நிரந்தரமாக வைக்கப்பட்டுள்ளது)
          ========================================== */}
      <div style={{ backgroundColor: '#1a1e29', borderTop: '2px solid #111', padding: '10px', flexShrink: 0 }}>
         <ControlButtons />
      </div>

    </div>
  );
};

export default CenterPart;