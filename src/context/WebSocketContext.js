import React, { createContext, useState, useContext, useRef } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [ipAddress, setIpAddress] = useState("192.168.1.42");
  const wsRef = useRef(null);

  // FIXED: We now store ALL the data your C++ backend broadcasts!
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
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }
    
    try {
      wsRef.current = new WebSocket(`ws://${ipAddress}:8080`);

      wsRef.current.onopen = () => console.log("WAITING APPROVAL...");
      wsRef.current.onclose = () => setIsConnected(false);
      wsRef.current.onerror = () => setIsConnected(false);

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "connection_accepted") {
          setIsConnected(true);
        } else if (data.type === "status_update") {
          // FIXED: Instantly updates React with the real C++ state!
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
      console.error("INVALID IP", err);
    }
  };

  const disconnectWebSocket = () => {
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
      isConnected, ipAddress, setIpAddress, connectWebSocket, disconnectWebSocket, sendCommand, robotState 
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);