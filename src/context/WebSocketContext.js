import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [ipAddress, setIpAddress] = useState("192.168.1.51"); 
  
  const [accessFull, setAccessFull] = useState(false); 
  const [connectionFailed, setConnectionFailed] = useState(false); 
  
  const wsRef = useRef(null);
  const isAccessFullRef = useRef(false); 
  const isIntentionalDisconnect = useRef(false); 

  // Initialize with empty arrays so the UI doesn't crash before the first update
  const [robotState, setRobotState] = useState({
    mode: "Sim",
    started: false,
    paused: false,
    servo_on: false,
    error_message: "No error",
    cartesian: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
    joints: { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
    tp_file_list: [],
    pr_file_list: [],
    current_tp_name: "None",
    current_pr_name: "None",
    tp_list: [],
    pr_program_data: []
  });

  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      isIntentionalDisconnect.current = true; 
      wsRef.current.close();
    }
    
    setConnectionFailed(false);
    setAccessFull(false);
    isAccessFullRef.current = false;
    isIntentionalDisconnect.current = false; 

    try {
      wsRef.current = new WebSocket(`ws://${ipAddress}:8080`);

      wsRef.current.onopen = () => console.log("ATTEMPTING CONNECTION...");
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        if (!isAccessFullRef.current && !isIntentionalDisconnect.current) {
          setConnectionFailed(true);
        }
      };
      
      wsRef.current.onerror = () => {
        setIsConnected(false);
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
          isAccessFullRef.current = true; 
        }
        else if (data.type === "status_update" || data.type === "motion_update") {
          // PERFECT FUNCTIONAL STATE UPDATE: Merges all data safely!
          setRobotState(prevState => ({
            ...prevState, 
            mode: data.mode !== undefined ? data.mode : prevState.mode,
            started: data.started !== undefined ? data.started : prevState.started,
            paused: data.paused !== undefined ? data.paused : prevState.paused,
            servo_on: data.servo_on !== undefined ? data.servo_on : prevState.servo_on,
            error_message: data.error_message || prevState.error_message,
            cartesian: data.cartesian || prevState.cartesian,
            joints: data.joints || prevState.joints,
            
            // Grabbing file lists and names directly from your C++ broadcastState
            tp_file_list: data.tp_file_list || prevState.tp_file_list || [],
            pr_file_list: data.pr_file_list || prevState.pr_file_list || [],
            current_tp_name: data.current_tp_name || prevState.current_tp_name || "None",
            current_pr_name: data.current_pr_name || prevState.current_pr_name || "None",
            
            // Added these so your tables in Row 2 actually get the points!
            tp_list: data.tp_list || prevState.tp_list || [],
            pr_program_data: data.pr_program_data || prevState.pr_program_data || []
          }));
        }
        else if (data.type === "file_update") {
          setRobotState(prevState => ({
            ...prevState,
            tp_file_list: data.tp_file_list || [],
            pr_file_list: data.pr_file_list || [],
            current_tp_name: data.current_tp_name || "None",
            current_pr_name: data.current_pr_name || "None",
            tp_list: data.tp_list || [],
            pr_program_data: data.pr_program_data || []
          }));
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
        isIntentionalDisconnect.current = true; 
        wsRef.current.close();
      }
    };
    // eslint-disable-next-line
  }, []); 

  const disconnectWebSocket = () => {
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