import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext'; // IMPORT THE HOOK

const HamburgerMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Pull real connection state and functions from the Context!
  const { isConnected, ipAddress, setIpAddress, connectWebSocket, disconnectWebSocket } = useWebSocket();

  return (
    <>
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{
          position: "absolute", top: "15px", left: "15px", zIndex: 10,
          backgroundColor: "#1a1e29", color: "white", border: "1px solid #444",
          borderRadius: "4px", cursor: "pointer", width: "45px", height: "45px", 
          display: "flex", alignItems: "center", justifyContent: "center"
        }}
      >
        <div style={{ fontSize: "1.5rem", transition: "transform 0.3s ease-in-out", transform: isMenuOpen ? "rotate(90deg)" : "rotate(0deg)" }}>
          ☰
        </div>
      </button>

      {isMenuOpen && (
        <div style={{
          position: "absolute", top: "65px", left: "15px", zIndex: 10,
          backgroundColor: "rgba(26, 30, 41, 0.95)", border: "1px solid #444",
          padding: "15px", borderRadius: "5px", display: "flex", flexDirection: "column", gap: "10px", width: "200px"
        }}>
          <div style={{ color: "#00bcd4", fontSize: "0.8rem", fontWeight: "bold" }}>CONTROLLER COMMS</div>
          
          <input 
            type="text" 
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            style={{ padding: "8px", borderRadius: "3px", border: "1px solid #555", backgroundColor: "#111", color: "white" }}
          />

          <button 
            onClick={() => isConnected ? disconnectWebSocket() : connectWebSocket()}
            style={{
              backgroundColor: isConnected ? "#F44336" : "#4CAF50", color: "white", 
              padding: "10px", border: "none", borderRadius: "3px", fontWeight: "bold", cursor: "pointer"
            }}
          >
            {isConnected ? "⏹ Disconnect" : "▶ Connect"}
          </button>
        </div>
      )}
    </>
  );
};

export default HamburgerMenu;