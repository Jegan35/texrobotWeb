import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import './RightPart.css';

const MM_OPTIONS = ["50", "25", "15", "10", "5", "2", "1", "0.1", "0.01", "0.001"];
const DEG_OPTIONS = ["20", "15", "10", "5", "2", "1", "0.1", "0.01", "0.001", "0.0001"];
const FRAME_OPTIONS = ["Base", "Tool", "User"];

const RightPart = () => {
  const { sendCommand } = useWebSocket();

  // Motion States
  const [motionType, setMotionType] = useState('JOG'); 
  const [coordSystem, setCoordSystem] = useState('JOINTS'); 
  const [isCoordMenuOpen, setIsCoordMenuOpen] = useState(false);

  // THE 6 DISTINCT CONFIG STATES
  const [globalSpeed, setGlobalSpeed] = useState(50);
  const [frameVal, setFrameVal] = useState(FRAME_OPTIONS[0]);
  const [mmIncVal, setMmIncVal] = useState(MM_OPTIONS[0]);
  const [degIncVal, setDegIncVal] = useState(DEG_OPTIONS[0]);
  
  // NEW: Free-text states for Speeds
  const [mmSpeedText, setMmSpeedText] = useState("50.0");
  const [degSpeedText, setDegSpeedText] = useState("50.0");

  // JOG Logic
  const handlePointerDown = (axis) => {
    if (motionType === 'JOG') sendCommand("BTN_PRESS", axis);
    else if (motionType === 'MOVE') sendCommand("BTN_CLICK", axis);
  };
  const handlePointerUp = (axis) => {
    if (motionType === 'JOG') sendCommand("BTN_RELEASE", axis);
  };

  // COMMAND HANDLERS
  const handleGlobalSpeedChange = (e) => {
    setGlobalSpeed(e.target.value);
    sendCommand("SET_GLOBAL_SPEED", e.target.value);
  };
  const handleFrameChange = (e) => {
    setFrameVal(e.target.value);
    sendCommand("SET_FRAME", e.target.value);
  };
  const handleMmIncChange = (e) => {
    setMmIncVal(e.target.value);
    sendCommand("SET_MM_INC", e.target.value);
  };
  const handleDegIncChange = (e) => {
    setDegIncVal(e.target.value);
    sendCommand("SET_DEG_INC", e.target.value);
  };

  // NEW: Triggered only when the "SET" button is clicked
  const applyMmSpeed = () => sendCommand("SET_MM_SPEED", mmSpeedText);
  const applyDegSpeed = () => sendCommand("SET_DEG_SPEED", degSpeedText);

  const JogRow = ({ label, axisPlus, axisMinus }) => (
    <div className="jog-row">
      <button className="jog-btn minus" onPointerDown={() => handlePointerDown(axisMinus)} onPointerUp={() => handlePointerUp(axisMinus)} onPointerLeave={() => handlePointerUp(axisMinus)}>{axisMinus}</button>
      <span className="jog-label">{label}</span>
      <button className="jog-btn plus" onPointerDown={() => handlePointerDown(axisPlus)} onPointerUp={() => handlePointerUp(axisPlus)} onPointerLeave={() => handlePointerUp(axisPlus)}>{axisPlus}</button>
    </div>
  );

  return (
    <>
      <style>{`
        .styled-select {
          width: 100%; background-color: #1a1d24; color: white; border: 1px solid #444; 
          padding: 6px; border-radius: 4px; font-weight: bold; outline: none; cursor: pointer;
          font-size: 0.85rem;
        }
        .styled-select:focus { border-color: #FF9800; }
        .config-label { color: #ccc; font-size: 0.75rem; margin-bottom: 3px; font-weight: bold; }
        
        /* NEW STYLES FOR INPUT + SET BUTTON */
        .speed-input-container { display: flex; width: 100%; }
        .speed-input {
          flex: 1; min-width: 0; background-color: #1a1d24; color: white; 
          border: 1px solid #444; border-right: none; padding: 5px 8px; 
          border-radius: 4px 0 0 4px; font-weight: bold; outline: none; font-size: 0.85rem;
        }
        .speed-input:focus { border-color: #FF9800; }
        .speed-btn {
          background-color: #FF9800; color: white; border: none; font-weight: bold; 
          padding: 0 10px; border-radius: 0 4px 4px 0; cursor: pointer; transition: 0.2s; font-size: 0.8rem;
        }
        .speed-btn:hover { background-color: #F57C00; }
      `}</style>

      <div className="right-part-container">
        
        {/* --- SPEED & FRAME CONFIG --- */}
        <div className="jog-panel" style={{ marginBottom: "15px" }}>
          <h3 className="panel-title" style={{ color: "#FF9800", marginBottom: "10px" }}>SPEED & FRAME CONFIG</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            
            {/* ROW 1: Global Speed & Frame */}
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
              <div style={{ flex: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                  <span className="config-label">Global Speed</span><span style={{ color: "#4CAF50", fontSize: "0.8rem", fontWeight: "bold" }}>{globalSpeed}%</span>
                </div>
                <input type="range" min="1" max="100" value={globalSpeed} onChange={(e) => setGlobalSpeed(e.target.value)} onMouseUp={handleGlobalSpeedChange} onTouchEnd={handleGlobalSpeedChange} style={{ width: "100%", cursor: "pointer" }} />
              </div>
              
              <div style={{ flex: 1 }}>
                <div className="config-label">Frame</div>
                <select className="styled-select" value={frameVal} onChange={handleFrameChange}>
                  {FRAME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            {/* ROW 2: Speeds (NOW INPUT BOXES) */}
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <div className="config-label">MM Speed (mm/s)</div>
                <div className="speed-input-container">
                  <input type="number" step="0.1" className="speed-input" value={mmSpeedText} onChange={(e) => setMmSpeedText(e.target.value)} />
                  <button className="speed-btn" onClick={applyMmSpeed}>SET</button>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="config-label">DEG Speed (°/s)</div>
                <div className="speed-input-container">
                  <input type="number" step="0.1" className="speed-input" value={degSpeedText} onChange={(e) => setDegSpeedText(e.target.value)} />
                  <button className="speed-btn" onClick={applyDegSpeed}>SET</button>
                </div>
              </div>
            </div>

            {/* ROW 3: Increments (REMAIN COMBOBOXES) */}
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <div className="config-label">MM Inc</div>
                <select className="styled-select" value={mmIncVal} onChange={handleMmIncChange}>
                  {MM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt} mm</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <div className="config-label">DEG Inc</div>
                <select className="styled-select" value={degIncVal} onChange={handleDegIncChange}>
                  {DEG_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}°</option>)}
                </select>
              </div>
            </div>

          </div>
        </div>

        {/* --- JOG CONTROL PANEL --- */}
        <div className="jog-panel">
          <h3 className="panel-title">MOTION CONTROLS</h3>
          
          <div className="jog-top-bar">
            <div className="jog-mode-toggles">
              <button className={`jog-toggle-btn ${motionType === 'JOG' ? 'active' : ''}`} onClick={() => setMotionType('JOG')}>JOG</button>
              <button className={`jog-toggle-btn ${motionType === 'MOVE' ? 'active' : ''}`} onClick={() => setMotionType('MOVE')}>MOVE</button>
            </div>

            <div className="coord-dropdown-container">
              <button className="coord-btn" onClick={() => setIsCoordMenuOpen(!isCoordMenuOpen)}>{coordSystem} <span>▼</span></button>
              {isCoordMenuOpen && (
                <div className="coord-menu">
                  <button className="coord-menu-item" onClick={() => { setCoordSystem('JOINTS'); setIsCoordMenuOpen(false); }}>JOINTS</button>
                  <button className="coord-menu-item" onClick={() => { setCoordSystem('CARTESIAN'); setIsCoordMenuOpen(false); }}>CARTESIAN</button>
                </div>
              )}
            </div>
          </div>

          <div className="jog-grid">
            {coordSystem === 'JOINTS' && (
              <>
                <JogRow label="J1" axisPlus="J1+" axisMinus="J1-" />
                <JogRow label="J2" axisPlus="J2+" axisMinus="J2-" />
                <JogRow label="J3" axisPlus="J3+" axisMinus="J3-" />
                <JogRow label="J4" axisPlus="J4+" axisMinus="J4-" />
                <JogRow label="J5" axisPlus="J5+" axisMinus="J5-" />
                <JogRow label="J6" axisPlus="J6+" axisMinus="J6-" />
              </>
            )}

            {coordSystem === 'CARTESIAN' && (
              <>
                <JogRow label="X" axisPlus="X+" axisMinus="X-" />
                <JogRow label="Y" axisPlus="Y+" axisMinus="Y-" />
                <JogRow label="Z" axisPlus="Z+" axisMinus="Z-" />
                <div style={{ height: "10px" }}></div>
                <JogRow label="Rx" axisPlus="Rx+" axisMinus="Rx-" />
                <JogRow label="Ry" axisPlus="Ry+" axisMinus="Ry-" />
                <JogRow label="Rz" axisPlus="Rz+" axisMinus="Rz-" />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RightPart;