import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [ipAddress, setIpAddress] = useState("192.168.1.51"); 
  
  const [accessFull, setAccessFull] = useState(false); 
  const [connectionFailed, setConnectionFailed] = useState(false); 
  
  const wsRef = useRef(null);
  const isAccessFullRef = useRef(false); 
  // NEW: Tracks if the user intentionally clicked Connect/Disconnect
  const isIntentionalDisconnect = useRef(false); 

  const [robotState, setRobotState] = useState({
    mode: "Sim",
    started: false,
    paused: false,
    servo_on: false,
    error_message: "No error",
    cartesian: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
    joints: { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 }
  });

  const connectWebSocket = () => {
    // If there's an existing socket, close it INTENTIONALLY before making a new one
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      isIntentionalDisconnect.current = true; 
      wsRef.current.close();
    }
    
    // Reset all flags for the fresh connection attempt
    setConnectionFailed(false);
    setAccessFull(false);
    isAccessFullRef.current = false;
    isIntentionalDisconnect.current = false; 

    try {
      wsRef.current = new WebSocket(`ws://${ipAddress}:8080`);

      wsRef.current.onopen = () => console.log("ATTEMPTING CONNECTION...");
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        // ONLY show the red popup if the server crashed or dropped us unexpectedly!
        if (!isAccessFullRef.current && !isIntentionalDisconnect.current) {
          setConnectionFailed(true);
        }
      };
      
      wsRef.current.onerror = () => {
        setIsConnected(false);
        // ONLY show the red popup if it wasn't an intentional user action
        if (!isAccessFullRef.current && !isIntentionalDisconnect.current) {
          setConnectionFailed(true); 
        }
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "connection_accepted") {
          setIsConnected(true);
          setAccessFull(false);
          setConnectionFailed(false);
          isAccessFullRef.current = false;
          isIntentionalDisconnect.current = false;
        } 
        else if (data.type === "access_full") {
          setIsConnected(false);
          setAccessFull(true);
          isAccessFullRef.current = true; // Block standard error popup
        }
        else if (data.type === "status_update") {
          setRobotState({
            mode: data.mode,
            started: data.started,
            paused: data.paused,
            servo_on: data.servo_on,
            error_message: data.error_message,
            cartesian: data.cartesian || { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
            joints: data.joints || { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 }
          });
        }
      };
    } catch (err) {
      console.error("INVALID IP OR NETWORK ERROR", err);
      if (!isIntentionalDisconnect.current) {
        setConnectionFailed(true);
      }
    }
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        isIntentionalDisconnect.current = true; // Clean up silently when app closes
        wsRef.current.close();
      }
    };
    // eslint-disable-next-line
  }, []); 

  const disconnectWebSocket = () => {
    // Flag this as an intentional user action BEFORE closing the socket!
    isIntentionalDisconnect.current = true; 
    if (wsRef.current) wsRef.current.close();
    setIsConnected(false);
  };

  const sendCommand = (cmd, value = "") => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ command: cmd, value: value.toString() }));
    }
  };

  return (
    <WebSocketContext.Provider value={{ 
      isConnected, ipAddress, setIpAddress, connectWebSocket, disconnectWebSocket, sendCommand, robotState,
      accessFull, setAccessFull, connectionFailed, setConnectionFailed 
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);