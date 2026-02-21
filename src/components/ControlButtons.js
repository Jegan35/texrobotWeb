import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

const ControlButtons = () => {
  const { sendCommand, robotState } = useWebSocket();

  // READ DIRECTLY FROM C++ BACKEND (Multi-Computer Syncing!)
  const rs = robotState || {};
  const servoOn = rs.servo_on === true;
  const isStarted = rs.started === true;
  const isRunning = rs.paused === false; // If it's NOT paused, it's running
  const mode = rs.mode || "MODE";
  const currentError = rs.error_message || "No error";

  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isSystemOkOpen, setIsSystemOkOpen] = useState(false);

  // Command Senders
  const handleServoToggle = () => sendCommand("TOGGLE_SERVO", "");
  const handleHomeClick = () => sendCommand("TRIGGER_HOME", "");
  const handleRunPauseToggle = () => sendCommand("TOGGLE_PAUSE", "");
  const handleStartStopToggle = () => sendCommand("TOGGLE_START", "");
  const handleExitClick = () => sendCommand("EXIT", "");
  const handleModeSelect = (m) => { setIsModeMenuOpen(false); sendCommand(m === "SIM" ? "SET_SIM" : "SET_REAL", ""); };
  const handleErrorClear = () => sendCommand("CLEAR_ERRORS", "");
  const handleMarkClear = () => sendCommand("CLEAR_MARKS", "");

  // ERROR LOGIC: If it's not a safe phrase, show the RED button
  const errLower = currentError.toLowerCase().trim();
  const hasError = !["no error", "no active errors", "error cleared"].includes(errLower) && errLower !== "";

  return (
    <>
      <style>{`
        .control-buttons-container { display: flex; flex-direction: column; gap: 10px; width: 100%; height: 100%; }
        .btn-row { display: flex; flex-direction: row; gap: 10px; width: 100%; align-items: stretch; }
        .btn { flex: 1; padding: 10px 15px; border: none; border-radius: 4px; font-weight: bold; font-size: 0.85rem; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; text-transform: uppercase; transition: 0.1s; }
        .btn:hover { opacity: 0.85; } .btn:active { transform: scale(0.98); }
        .btn-dark { background-color: #333333; color: #aaaaaa; }
        .btn-green, .btn-green-full { background-color: #4CAF50; color: white; }
        .btn-blue { background-color: #2196F3; color: white; }
        .btn-yellow { background-color: #FFEB3B; color: #111; }
        .btn-orange { background-color: #FF9800; color: white; }
        .btn-red { background-color: #F44336; color: white; }
        .btn-purple { background-color: #9C27B0; color: white; }
        .btn-pink { background-color: #E91E63; color: white; }
        .btn-purple-dark { background-color: #673AB7; color: white; }
        .btn-outline-green { background-color: transparent; border: 2px solid #4CAF50; color: #4CAF50; }
        .btn-outline-green:hover { background-color: rgba(76, 175, 80, 0.1); }
        .info-box { flex: 1; display: flex; align-items: center; padding: 0 10px; border-radius: 4px; font-size: 0.85rem; font-family: monospace; }
        .dark-box { background-color: #111; border: 1px solid #333; color: #ccc; }
        .empty-box { background-color: transparent; border: 1px dashed #555; color: #666; }
        .text-green { color: #4CAF50; font-weight: bold; justify-content: flex-end; font-size: 1rem; }
      `}</style>

      <div className="control-buttons-container">
        <div className="btn-row">
          <button className={`btn ${servoOn ? 'btn-green' : 'btn-dark'}`} onClick={handleServoToggle}>SERVO: {servoOn ? 'ON' : 'OFF'}</button>
          <button className="btn btn-blue" onClick={handleHomeClick}>🏠 HOME</button>
          <button className={`btn ${isRunning ? 'btn-green' : 'btn-yellow'}`} onClick={handleRunPauseToggle}>{isRunning ? '▶ RUN' : '⏸ PAUSE'}</button>
          <button className={`btn ${isStarted ? 'btn-red' : 'btn-orange'}`} onClick={handleStartStopToggle}>{isStarted ? '⏹ STOP' : '⏻ START'}</button>
          <button className="btn btn-red" style={{ backgroundColor: "#d32f2f" }} onClick={handleExitClick}>🚪 EXIT</button>
          <div style={{ position: "relative", flex: 1, display: "flex" }}>
            <button className="btn btn-outline-green" style={{ width: "100%" }} onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}>{mode}</button>
            {isModeMenuOpen && (
              <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", zIndex: 100, backgroundColor: "#1a1e29", border: "1px solid #444", borderRadius: "4px", display: "flex", flexDirection: "column" }}>
                <button onClick={() => handleModeSelect("SIM")} style={{ padding: "10px", background: "transparent", color: "white", border: "none", borderBottom: "1px solid #333", cursor: "pointer", fontWeight: "bold" }}>SIM</button>
                <button onClick={() => handleModeSelect("REAL")} style={{ padding: "10px", background: "transparent", color: "white", border: "none", cursor: "pointer", fontWeight: "bold" }}>REAL</button>
              </div>
            )}
          </div>
        </div>

        <div className="btn-row">
          <button className="btn btn-purple">📁 FILES</button>
          <div className="info-box dark-box">Opened PR: mh_l1</div>
          <div className="info-box dark-box">TR: None</div>
          <div className="info-box dark-box">Opened: ppp</div>
          <button className="btn btn-pink">+ TOOLS</button>
          <div className="info-box empty-box">Tool Name...</div>
        </div>

        <div className="btn-row">
          <div style={{ position: "relative", flex: 1, display: "flex" }}>
            {/* DYNAMIC ERROR BUTTON */}
            <button className={`btn ${hasError ? 'btn-orange' : 'btn-green-full'}`} style={{ width: "100%" }} onClick={() => setIsSystemOkOpen(!isSystemOkOpen)}>
              {hasError ? "⚠️ VIEW ERROR" : "✔️ SYSTEM OK"}
            </button>
            {isSystemOkOpen && (
              <div style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: "8px", backgroundColor: "#282c34", border: "1px solid #555", borderRadius: "4px", padding: "8px", width: "300px", display: "flex", flexDirection: "column", zIndex: 100, boxShadow: "0px -4px 15px rgba(0,0,0,0.6)" }}>
                <div style={{ display: "flex", justifyContent: "flex-end" }}><button onClick={() => setIsSystemOkOpen(false)} style={{ background: "none", border: "none", color: "#ff4444", cursor: "pointer", fontWeight: "bold" }}>✖</button></div>
                <div style={{ color: hasError ? "#FF9800" : "#4CAF50", textAlign: "center", fontWeight: "bold", paddingBottom: "5px" }}>{currentError}</div>
              </div>
            )}
          </div>
          <button className="btn btn-red" style={{ backgroundColor: "#F44336" }} onClick={handleErrorClear}>🗑 Error Clear</button>
          <button className="btn btn-yellow" onClick={handleMarkClear}>✖ Mark Clear</button>
          <button className="btn btn-purple-dark">⟳ RESET</button>
          <div className="info-box text-green">Speed: 0.0 %</div>
        </div>
      </div>
    </>
  );
};

export default ControlButtons;