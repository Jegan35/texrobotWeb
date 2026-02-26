import React from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import './LeftPart.css'; 

const LeftPart = () => {
  const { 
      isConnected, 
      isConnecting, 
      ipAddress, 
      setIpAddress, 
      connectWebSocket, 
      disconnectWebSocket, 
      connectionFailed, 
      setConnectionFailed,
      accessFull,
      setAccessFull,
      rejectMessage,
      robotState 
  } = useWebSocket();

  // STRICT ZEROING LOGIC: If not fully connected, force everything to 0.00
  const c = isConnected ? (robotState?.cartesian || {}) : { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
  const j = isConnected ? (robotState?.joints || {}) : { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 };

  const handleConnectToggle = () => {
      if (isConnected || isConnecting) {
          disconnectWebSocket();
      } else {
          // PASS EXACT IP TO AVOID CLOSURE BUGS
          connectWebSocket(ipAddress);
      }
  };

  return (
    <div className="left-part-container">
      
      {/* ------------------------------------------------------------------- */}
      {/* POPUP MODALS FOR CONNECTION ERRORS */}
      {/* ------------------------------------------------------------------- */}
      {(connectionFailed || accessFull) && (
          <div className="connection-modal-overlay">
              <div className="connection-modal">
                  <div className="modal-header">
                      {connectionFailed ? "CONNECTION FAILED" : "ACCESS DENIED"}
                  </div>
                  <div className="modal-body">
                      {connectionFailed 
                          ? "The backend server is offline, or the IP address is incorrect. Please check your network and try again." 
                          : (rejectMessage || "Connection denied by the server administrator.")}
                  </div>
                  <button className="modal-btn" onClick={() => {
                      setConnectionFailed(false);
                      setAccessFull(false);
                  }}>
                      ACKNOWLEDGE
                  </button>
              </div>
          </div>
      )}

      {/* BRANDING */}
      <div className="left-brand-header">
          <h2 className="brand-title">TECSONICS</h2>
          <div className="brand-subtitle">ROBOTICS</div>
      </div>

      {/* CONNECTION PANEL */}
      <div className="left-panel connection-panel">
          <div className="panel-title">CONNECTION</div>
          
          <input 
              type="text" 
              className="ip-input" 
              value={ipAddress} 
              onChange={(e) => setIpAddress(e.target.value)} 
              disabled={isConnected || isConnecting}
              placeholder="Server IP Address"
          />

          <button 
              className={`connect-btn ${isConnected ? 'btn-disconnect' : (isConnecting ? 'btn-connecting' : 'btn-connect')}`} 
              onClick={handleConnectToggle}
          >
              {isConnected ? 'DISCONNECT' : (isConnecting ? 'WAITING FOR ADMIN...' : 'CONNECT')}
          </button>
      </div>

      {/* CARTESIAN PANEL */}
      <div className="left-panel">
          <div className="panel-title">CARTESIAN (mm / °)</div>
          <div className="cartesian-grid">
              {[ { l: 'X', v: c.x }, { l: 'Y', v: c.y }, { l: 'Z', v: c.z },
                 { l: 'Rx', v: c.rx }, { l: 'Ry', v: c.ry }, { l: 'Rz', v: c.rz }
              ].map(item => (
                  <div key={item.l} className="cartesian-item">
                      <span className="cart-lbl">{item.l}</span>
                      <span className={`cart-val ${isConnected ? 'val-active' : 'val-inactive'}`}>
                          {item.v !== undefined ? Number(item.v).toFixed(3) : "0.000"}
                      </span>
                  </div>
              ))}
          </div>
      </div>

      {/* JOINTS PROGRESS BARS */}
      <div className="left-panel" style={{ flex: 1 }}>
          <div className="panel-title">JOINTS (°)</div>
          <div className="joints-list">
              {['j1', 'j2', 'j3', 'j4', 'j5', 'j6'].map((jointKey, idx) => {
                  const val = j[jointKey] || 0;
                  // Calculate percentage for progress bar (Assuming -180 to 180 range for visual)
                  const percentage = isConnected ? Math.min(100, Math.max(0, ((val + 180) / 360) * 100)) : 50; 

                  return (
                      <div key={jointKey} className="joint-row">
                          <div className="joint-header">
                              <span className="joint-lbl">J{idx + 1}</span>
                              <span className={`joint-val ${isConnected ? 'val-active' : 'val-inactive'}`}>
                                  {val.toFixed(2)}°
                              </span>
                          </div>
                          <div className="progress-track">
                              <div 
                                  className={`progress-fill ${isConnected ? 'fill-active' : 'fill-inactive'}`} 
                                  style={{ width: `${percentage}%` }}
                              ></div>
                          </div>
                      </div>
                  );
              })}
          </div>
      </div>

    </div>
  );
};

export default LeftPart;