import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

const ControlButtons = () => {
  const { sendCommand, robotState } = useWebSocket();

  const rs = robotState || {};
  const servoOn = rs.servo_on === true;
  const isStarted = rs.started === true;
  const isRunning = rs.paused === false;
  const mode = rs.mode || "MODE";
  const currentError = rs.error_message || "No error";

  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isSystemOkOpen, setIsSystemOkOpen] = useState(false);

  const handleServoToggle = () => sendCommand("TOGGLE_SERVO", "");
  const handleHomeClick = () => sendCommand("TRIGGER_HOME", "");
  const handleRunPauseToggle = () => sendCommand("TOGGLE_PAUSE", "");
  const handleStartStopToggle = () => sendCommand("TOGGLE_START", "");
  const handleExitClick = () => sendCommand("EXIT", "");
  const handleModeSelect = (m) => { setIsModeMenuOpen(false); sendCommand(m === "SIM" ? "SET_SIM" : "SET_REAL", ""); };
  const handleErrorClear = () => sendCommand("CLEAR_ERRORS", "");
  const handleMarkClear = () => sendCommand("CLEAR_MARKS", "");

  const errLower = currentError.toLowerCase().trim();
  const hasError = !["no error", "no active errors", "error cleared"].includes(errLower) && errLower !== "";

  return (
    <>
      {/* =======================================================
          PERFECT CSS GRID ALIGNMENT
          Forces a strict 6-column layout straight down!
          ======================================================= */}
      <style>{`
        .control-buttons-container { 
          display: flex; flex-direction: column; gap: 8px; width: 100%; padding-top: 2px;
        }
        
        /* THE MAGIC GRID */
        .btn-row { 
          display: grid; 
          grid-template-columns: repeat(6, 1fr); 
          gap: 8px; 
          width: 100%; 
          min-height: 38px;
        }
        
        /* Tells the System OK button to take exactly 2 grid spaces */
        .span-2 { grid-column: span 2; }
        
        .btn { 
          width: 100%; box-sizing: border-box; padding: 0 10px; border-radius: 4px; font-weight: 800; font-size: 0.75rem; 
          color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; 
          text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(0,0,0,0.6);
          box-shadow: 0 3px 5px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.15); text-shadow: 0 1px 2px rgba(0,0,0,0.5);
          transition: all 0.1s ease-in-out;
        }
        
        .btn:hover { filter: brightness(1.1); } 
        .btn:active { transform: translateY(2px); box-shadow: 0 1px 2px rgba(0,0,0,0.4), inset 0 2px 4px rgba(0,0,0,0.4); }

        .btn-dark { background: linear-gradient(180deg, #444b59 0%, #2b303b 100%); color: #ccc; }
        .btn-green { background: linear-gradient(180deg, #4CAF50 0%, #2E7D32 100%); }
        .btn-green-full { background: linear-gradient(180deg, #00C853 0%, #1B5E20 100%); }
        .btn-blue { background: linear-gradient(180deg, #2196F3 0%, #1565C0 100%); }
        .btn-yellow { background: linear-gradient(180deg, #FFEB3B 0%, #F9A825 100%); color: #111; text-shadow: none; }
        .btn-orange { background: linear-gradient(180deg, #FF9800 0%, #E65100 100%); }
        .btn-red { background: linear-gradient(180deg, #ef5350 0%, #c62828 100%); }
        .btn-purple { background: linear-gradient(180deg, #ab47bc 0%, #6a1b9a 100%); }
        .btn-pink { background: linear-gradient(180deg, #ec407a 0%, #ad1457 100%); }
        .btn-purple-dark { background: linear-gradient(180deg, #7e57c2 0%, #4527a0 100%); }
        
        .btn-outline-green { background: rgba(0, 0, 0, 0.2); border: 2px solid #4CAF50; color: #4CAF50; text-shadow: none; box-shadow: none; }
        .btn-outline-green:hover { background: rgba(76, 175, 80, 0.15); box-shadow: 0 0 10px rgba(76,175,80,0.3); }

        .info-box { 
          width: 100%; box-sizing: border-box; display: flex; align-items: center; padding: 0 8px; 
          border-radius: 4px; font-size: 0.75rem; font-family: 'Consolas', monospace; overflow: hidden; white-space: nowrap; 
        }
        .dark-box { background-color: #151822; border: 1px inset #000; color: #aaa; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); }
        .empty-box { background-color: transparent; border: 1px dashed #555; color: #666; }
        .text-green { color: #4CAF50; font-weight: bold; justify-content: flex-end; font-size: 0.85rem; text-shadow: 0 0 5px rgba(76,175,80,0.4); }
      `}</style>

      <div className="control-buttons-container">
        
        {/* ROW 1: 6 Equal Columns */}
        <div className="btn-row">
          <button className={`btn ${servoOn ? 'btn-green' : 'btn-dark'}`} onClick={handleServoToggle}>⚡ SERVO: {servoOn ? 'ON' : 'OFF'}</button>
          <button className="btn btn-blue" onClick={handleHomeClick}>⌂ HOME</button>
          <button className={`btn ${isRunning ? 'btn-green' : 'btn-yellow'}`} onClick={handleRunPauseToggle}>{isRunning ? '⏵ RUN' : '⏸ PAUSE'}</button>
          <button className={`btn ${isStarted ? 'btn-red' : 'btn-orange'}`} onClick={handleStartStopToggle}>{isStarted ? '⏹ STOP' : '⏻ START'}</button>
          <button className="btn btn-red" onClick={handleExitClick}>⎋ EXIT</button>
          
          <div style={{ position: "relative", display: "flex", width: "100%" }}>
            <button className="btn btn-outline-green" style={{ width: "100%" }} onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}>{mode}</button>
            {isModeMenuOpen && (
              <div style={{ position: "absolute", bottom: "100%", left: 0, width: "100%", zIndex: 100, backgroundColor: "#1a1e29", border: "1px solid #444", borderRadius: "4px", display: "flex", flexDirection: "column", marginBottom: "4px", overflow: 'hidden', boxShadow: '0 -4px 15px rgba(0,0,0,0.5)' }}>
                <button onClick={() => handleModeSelect("SIM")} style={{ padding: "8px", background: "transparent", color: "white", border: "none", borderBottom: "1px solid #333", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem" }}>SIM</button>
                <button onClick={() => handleModeSelect("REAL")} style={{ padding: "8px", background: "transparent", color: "white", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem" }}>REAL</button>
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: 6 Equal Columns */}
        <div className="btn-row">
          <button className="btn btn-purple">📁 FILES</button>
          <div className="info-box dark-box">Opened PR: mh_l1</div>
          <div className="info-box dark-box">TR: None</div>
          <div className="info-box dark-box">Opened: ppp</div>
          <button className="btn btn-pink">+ TOOLS</button>
          <div className="info-box empty-box">Tool Name...</div>
        </div>

        {/* ROW 3: System OK spans 2 columns, others take 1 column each. Total = 6 */}
        <div className="btn-row">
          <div className="span-2" style={{ position: "relative", display: "flex", width: "100%" }}>
            <button className={`btn ${hasError ? 'btn-orange' : 'btn-green-full'}`} style={{ width: "100%" }} onClick={() => setIsSystemOkOpen(!isSystemOkOpen)}>
              {hasError ? "⚠️ VIEW ERROR" : "✓ SYSTEM OK"}
            </button>
            {isSystemOkOpen && (
              <div style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: "4px", backgroundColor: "#282c34", border: "1px solid #555", borderRadius: "4px", padding: "8px", width: "100%", display: "flex", flexDirection: "column", zIndex: 100, boxShadow: "0px -4px 15px rgba(0,0,0,0.6)", boxSizing: "border-box" }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}><button onClick={() => setIsSystemOkOpen(false)} style={{ background: "none", border: "none", color: "#ff4444", cursor: "pointer", fontWeight: "bold" }}>✖</button></div>
                <div style={{ color: hasError ? "#FF9800" : "#4CAF50", textAlign: "center", fontWeight: "bold", paddingBottom: "5px", fontSize: "0.85rem" }}>{currentError}</div>
              </div>
            )}
          </div>
          
          <button className="btn btn-red" onClick={handleErrorClear}>✕ Error Clear</button>
          <button className="btn btn-yellow" onClick={handleMarkClear}>✕ Mark Clear</button>
          <button className="btn btn-purple-dark">⟳ RESET</button>
          
          <div className="info-box text-green">Speed: 0.0 %</div>
        </div>
      </div>
    </>
  );
};

export default ControlButtons;