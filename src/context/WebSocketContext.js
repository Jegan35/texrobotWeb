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

  // Initialize all states so the UI never crashes while waiting for the first backend payload
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
    pr_program_data: [],
    program_count_output: "0",
    is_calculating_trajectory: false,
    
    // FOR ROW 4 (Instruction Staging)
    staging_data: {}, 
    
    // FOR 3D SCENE (Trajectories)
    blueTrajectory: [], 
    redTrajectory: []
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
          setRobotState(prevState => ({
            ...prevState, 
            mode: data.mode !== undefined ? data.mode : prevState.mode,
            started: data.started !== undefined ? data.started : prevState.started,
            paused: data.paused !== undefined ? data.paused : prevState.paused,
            servo_on: data.servo_on !== undefined ? data.servo_on : prevState.servo_on,
            error_message: data.error_message || prevState.error_message,
            cartesian: data.cartesian || prevState.cartesian,
            joints: data.joints || prevState.joints,
            tp_file_list: data.tp_file_list || prevState.tp_file_list || [],
            pr_file_list: data.pr_file_list || prevState.pr_file_list || [],
            current_tp_name: data.current_tp_name || prevState.current_tp_name || "None",
            current_pr_name: data.current_pr_name || prevState.current_pr_name || "None",
            tp_list: data.tp_list || prevState.tp_list || [],
            pr_program_data: data.pr_program_data || prevState.pr_program_data || [],
            program_count_output: data.program_count_output !== undefined ? data.program_count_output : prevState.program_count_output,
            is_calculating_trajectory: data.is_calculating_trajectory !== undefined ? data.is_calculating_trajectory : prevState.is_calculating_trajectory,
            speed_op: data.speed_op !== undefined ? data.speed_op : prevState.speed_op,
            // MAP STAGING DATA FROM C++
            staging_data: data.staging_data !== undefined ? data.staging_data : prevState.staging_data
          }));
        }
        // =========================================================
        // TRAJECTORY STREAMING (HIGH-PERFORMANCE PARSER)
        // =========================================================
        else if (data.type === "trajectory_chunk") {
          const color = data.color; // "blue" or "red"
          const flatPoints = data.points || [];
          
          // Decode 1D C++ Array [x, y, z, x, y, z] into 2D JS Array [[x,y,z], [x,y,z]]
          const newPts = [];
          for (let i = 0; i < flatPoints.length; i += 3) {
            newPts.push([flatPoints[i], flatPoints[i+1], flatPoints[i+2]]);
          }

          setRobotState(prevState => {
            if (color === "blue") {
              return { ...prevState, blueTrajectory: [...(prevState.blueTrajectory || []), ...newPts] };
            } else if (color === "red") {
              return { ...prevState, redTrajectory: [...(prevState.redTrajectory || []), ...newPts] };
            }
            return prevState;
          });
        }
        else if (data.type === "clear_trajectories") {
          setRobotState(prevState => ({ ...prevState, blueTrajectory: [], redTrajectory: [] }));
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

  // Upgraded to handle generic commands AND nested JSON object payloads
  const sendCommand = (cmd, value = "", dataObj = null) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = { command: cmd, value: value.toString() };
      if (dataObj) {
          payload.data = dataObj; 
      }
      wsRef.current.send(JSON.stringify(payload));
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