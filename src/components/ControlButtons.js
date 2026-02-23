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
  
  const handleModeSelect = (m) => { 
      setIsModeMenuOpen(false); 
      sendCommand(m === "SIM" ? "SET_SIM" : "SET_REAL", ""); 
  };
  
  const handleErrorClear = () => sendCommand("CLEAR_ERRORS", "");
  const handleMarkClear = () => sendCommand("CLEAR_MARKS", "");

  const errLower = currentError.toLowerCase().trim();
  const hasError = !["no error", "no active errors", "error cleared"].includes(errLower) && errLower !== "";

  return (
    <>
      <style>{`
        .control-buttons-container { 
          display: flex; flex-direction: column; gap: 12px; width: 100%; padding-top: 5px;
        }
        
        /* EXACT 6-COLUMN GRID */
        .btn-row { 
          display: grid; 
          grid-template-columns: repeat(6, minmax(0, 1fr)); 
          gap: 10px; 
          width: 100%;
          align-items: stretch;
        }
        
        .span-2 { grid-column: span 2; }
        
        /* PREMIUM 3D PHYSICAL BUTTON DESIGN */
        .btn { 
          width: 100%; min-height: 45px; box-sizing: border-box; padding: 5px 2px; 
          border-radius: 6px; font-weight: 900; 
          font-size: clamp(8px, 0.85vw, 13px); color: white; cursor: pointer; 
          display: flex; align-items: center; justify-content: center; text-align: center;
          text-transform: uppercase; letter-spacing: 0.5px; 
          border: 1px solid rgba(0,0,0,0.8);
          /* The 4px shadow creates the "physical edge" of the button */
          transition: all 0.1s ease-in-out; 
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        
        .btn:hover { filter: brightness(1.15); } 
        
        /* Physical press down animation */
        .btn:active { 
            transform: translateY(4px); 
            box-shadow: 0 0px 0px rgba(0,0,0,0.8), inset 0 3px 5px rgba(0,0,0,0.6) !important; 
        }

        /* Upgraded Rich Gradients & 3D Edges */
        .btn-dark { background: linear-gradient(180deg, #505868 0%, #2b303b 100%); box-shadow: 0 4px 0 #151822, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2); }
        .btn-green { background: linear-gradient(180deg, #4CAF50 0%, #1B5E20 100%); box-shadow: 0 4px 0 #003300, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); text-shadow: 0 0 5px rgba(0,255,0,0.5); }
        .btn-green-full { background: linear-gradient(180deg, #00E676 0%, #1B5E20 100%); box-shadow: 0 4px 0 #003300, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.4); color: #000; text-shadow: none; }
        .btn-blue { background: linear-gradient(180deg, #42A5F5 0%, #0D47A1 100%); box-shadow: 0 4px 0 #002171, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); }
        .btn-yellow { background: linear-gradient(180deg, #FFEE58 0%, #F57F17 100%); box-shadow: 0 4px 0 #BC5100, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.5); color: #111; text-shadow: none; }
        .btn-orange { background: linear-gradient(180deg, #FFA726 0%, #E65100 100%); box-shadow: 0 4px 0 #822C00, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
        .btn-red { background: linear-gradient(180deg, #EF5350 0%, #B71C1C 100%); box-shadow: 0 4px 0 #7F0000, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); text-shadow: 0 0 5px rgba(255,0,0,0.5); }
        .btn-purple { background: linear-gradient(180deg, #BA68C8 0%, #6A1B9A 100%); box-shadow: 0 4px 0 #4A148C, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); }
        .btn-pink { background: linear-gradient(180deg, #F06292 0%, #880E4F 100%); box-shadow: 0 4px 0 #4A0024, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); }
        .btn-purple-dark { background: linear-gradient(180deg, #9575CD 0%, #4527A0 100%); box-shadow: 0 4px 0 #311B92, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); }
        
        .btn-outline-green { background: #1a1e29; border: 2px solid #4CAF50; color: #4CAF50; box-shadow: 0 4px 0 #003300, 0 5px 5px rgba(0,0,0,0.4); text-shadow: 0 0 5px rgba(76,175,80,0.4); }

        /* RECESSED DIGITAL LCD SCREEN DESIGN */
        .info-box { 
          width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; padding: 0 5px; 
          border-radius: 4px; font-size: clamp(8px, 0.8vw, 12px); font-family: 'Consolas', monospace; 
          overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-weight: bold;
        }
        .dark-box { background-color: #0a0e17; border: 2px solid #333; border-top-color: #000; border-left-color: #000; color: #00bcd4; box-shadow: inset 0 3px 6px rgba(0,0,0,0.8); text-shadow: 0 0 3px rgba(0,188,212,0.4); }
        .empty-box { background-color: #111; border: 1px dashed #444; color: #555; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); }
        .text-green { background-color: #0a0e17; border: 2px solid #333; border-top-color: #000; border-left-color: #000; color: #00e676; font-size: clamp(10px, 1vw, 14px); text-shadow: 0 0 5px rgba(0,230,118,0.5); box-shadow: inset 0 3px 6px rgba(0,0,0,0.8); }
        
        .popup-menu-btn { width: 100%; padding: 12px; background: transparent; color: white; border: none; cursor: pointer; font-weight: 900; font-size: 1rem; transition: 0.1s; text-transform: uppercase; }
        .popup-menu-btn:hover { background: #4CAF50; color: #000; }
      `}</style>

      <div className="control-buttons-container">
        
        {/* ROW 1: 6 Columns */}
        <div className="btn-row">
          <button className={`btn ${servoOn ? 'btn-green' : 'btn-dark'}`} onClick={handleServoToggle}>⚡ SERVO: {servoOn ? 'ON' : 'OFF'}</button>
          <button className="btn btn-blue" onClick={handleHomeClick}>⌂ HOME</button>
          <button className={`btn ${isRunning ? 'btn-green' : 'btn-yellow'}`} onClick={handleRunPauseToggle}>{isRunning ? '⏵ RUN' : '⏸ PAUSE'}</button>
          <button className={`btn ${isStarted ? 'btn-red' : 'btn-orange'}`} onClick={handleStartStopToggle}>{isStarted ? '⏹ STOP' : '⏻ START'}</button>
          <button className="btn btn-red" onClick={handleExitClick}>⎋ EXIT</button>
          
          <div style={{ position: "relative", display: "flex", width: "100%" }}>
            <button className="btn btn-outline-green" style={{ width: "100%" }} onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}>{mode}</button>
            {isModeMenuOpen && (
              <div style={{ position: 'absolute', bottom: '120%', left: 0, width: '100%', background: '#111', border: '2px solid #4CAF50', zIndex: 1000, borderRadius: '6px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.8)' }}>
                <button className="popup-menu-btn" style={{ borderBottom: '1px solid #333' }} onClick={() => handleModeSelect('SIM')}>SIM</button>
                <button className="popup-menu-btn" onClick={() => handleModeSelect('REAL')}>REAL</button>
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: 6 Columns */}
        <div className="btn-row">
          <button className="btn btn-purple">📁 FILES</button>
          <div className="info-box dark-box">PR: mh_l1</div>
          <div className="info-box dark-box">TR: None</div>
          <div className="info-box dark-box">Op: ppp</div>
          <button className="btn btn-pink">+ TOOLS</button>
          <div className="info-box empty-box">Tool...</div>
        </div>

        {/* ROW 3: SYSTEM OK takes 2 Columns, the rest take 1 (Total = 6) */}
        <div className="btn-row">
          <div className="span-2" style={{ position: "relative", display: "flex", width: "100%" }}>
            <button className={`btn ${hasError ? 'btn-orange' : 'btn-green-full'}`} style={{ width: "100%" }} onClick={() => setIsSystemOkOpen(!isSystemOkOpen)}>
              {hasError ? "⚠️ VIEW ERROR" : "✓ SYSTEM OK"}
            </button>
            {isSystemOkOpen && (
              <div style={{ position: 'absolute', bottom: '120%', left: 0, width: '200%', background: '#1e222b', border: hasError ? '2px solid #FF9800' : '2px solid #00E676', zIndex: 1000, borderRadius: '6px', padding: '15px', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.9)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: hasError ? '#FF9800' : '#00E676', textTransform: 'uppercase', letterSpacing: '1px' }}>SYSTEM STATUS</h4>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{currentError}</p>
                <button style={{ marginTop: '15px', width: '100%', padding: '10px', background: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }} onClick={() => setIsSystemOkOpen(false)}>CLOSE</button>
              </div>
            )}
          </div>

          {/* Abbreviated names to guarantee they never overlap in a 6 column grid! */}
          <button className="btn btn-red" onClick={handleErrorClear}>✕ ERR CLR</button>
          <button className="btn btn-yellow" onClick={handleMarkClear}>✕ MRK CLR</button>
          <button className="btn btn-purple-dark">⟳ RESET</button>
          <div className="info-box text-green">Spd: 0.0%</div>
        </div>
      </div>
    </>
  );
};

export default ControlButtons;