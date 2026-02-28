import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false); 
  const [ipAddress, setIpAddress] = useState("192.168.1.51"); 
  
  const [accessFull, setAccessFull] = useState(false); 
  const [connectionFailed, setConnectionFailed] = useState(false); 
  const [rejectMessage, setRejectMessage] = useState(""); 
  
  const wsRef = useRef(null);
  const ipRef = useRef(ipAddress);
  const isAccessFullRef = useRef(false); 
  const isIntentionalDisconnect = useRef(false); 

  // --> NEW: Frontend Lock logic for Graph
  const [isGraphReading, setIsGraphReadingState] = useState(true);
  const isGraphReadingRef = useRef(true); 

  const setGraphReading = (status) => {
      setIsGraphReadingState(status);
      isGraphReadingRef.current = status;
  };

  useEffect(() => { ipRef.current = ipAddress; }, [ipAddress]);

  const [robotState, setRobotState] = useState({
    mode: "Sim", started: false, paused: false, servo_on: false, error_message: "No error",
    cartesian: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 },
    joints: { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
    tp_file_list: [], pr_file_list: [],
    current_tp_name: "None", current_pr_name: "None",
    tp_list: [], pr_program_data: [],
    program_count_output: "0", is_calculating_trajectory: false,
    is_physically_moving: false, 
    speed_op: 0, di_val: 0, do_val: 0,
    staging_data: {}, 
    error_pos_data: {}, ether_cat_data: {}, variable_data: {}, mech_data: {},
    blueTrajectory: [], redTrajectory: [],
    graph_data: [] 
  });

  const connectWebSocket = () => {
    const targetIp = ipRef.current.trim();
    
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      isIntentionalDisconnect.current = true; 
      wsRef.current.close();
    }
    
    setConnectionFailed(false); 
    setAccessFull(false);
    setIsConnecting(true); 
    setIsConnected(false);
    setRejectMessage("");
    isAccessFullRef.current = false; 
    isIntentionalDisconnect.current = false; 

    try {
      wsRef.current = new WebSocket(`ws://${targetIp}:8080`);

      wsRef.current.onopen = () => {
          console.log(`Connected to ${targetIp}:8080 physically. Waiting for C++ Admin Handshake...`);
      };

      wsRef.current.onerror = (err) => {
          console.error("WebSocket Error:", err);
          setIsConnecting(false);
          if (!isIntentionalDisconnect.current && !isAccessFullRef.current) setConnectionFailed(true);
      };

      wsRef.current.onclose = () => { 
          setIsConnected(false); 
          setIsConnecting(false);
          if (!isAccessFullRef.current && !isIntentionalDisconnect.current) setConnectionFailed(true); 
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "connection_accepted") {
          console.log("C++ Admin Accepted Connection!");
          setIsConnected(true); 
          setIsConnecting(false);
          setAccessFull(false); 
          setConnectionFailed(false);
        } 
        else if (data.type === "connection_rejected" || data.type === "access_full") {
          console.warn("C++ Admin Rejected Connection.");
          setIsConnected(false); setIsConnecting(false); setAccessFull(true); 
          setRejectMessage(data.message || "Connection denied by the server administrator.");
          isAccessFullRef.current = true; 
          wsRef.current.close();
        }
        else if (data.type === "force_disconnect") {
          setIsConnected(false); setIsConnecting(false); setAccessFull(true);
          setRejectMessage(data.message || "You have been disconnected by the server admin.");
          isIntentionalDisconnect.current = true;
          wsRef.current.close();
        }
        else if (data.type === "graph_update") {
          // --> FIXED: Only process graph data if Frontend Lock is TRUE
          if (isGraphReadingRef.current) {
              setRobotState(prevState => {
                const newGraphData = [...(prevState.graph_data || []), data.data];
                if (newGraphData.length > 100) newGraphData.shift(); 
                return { ...prevState, graph_data: newGraphData };
              });
          }
        }
        else if (data.type === "status_update" || data.type === "motion_update") {
          setRobotState(prevState => {
            let finalTpList = prevState.tp_list;
            if (data.tp_list) {
                if (data.tp_list.length !== finalTpList.length) finalTpList = data.tp_list;
                else if (data.tp_list.length > 0 && finalTpList.length > 0 && data.tp_list[0].value !== finalTpList[0].value) finalTpList = data.tp_list;
            }

            let finalPrList = prevState.pr_program_data;
            if (data.pr_program_data) {
                if (data.pr_program_data.length !== finalPrList.length) finalPrList = data.pr_program_data;
                else if (data.pr_program_data.length > 0 && finalPrList.length > 0 && data.pr_program_data[0].value !== finalPrList[0].value) finalPrList = data.pr_program_data;
            }

            const newErrStr = JSON.stringify(data.error_pos_data || {});
            const finalErr = newErrStr !== prevState._errStr ? data.error_pos_data : prevState.error_pos_data;

            const newEthStr = JSON.stringify(data.ether_cat_data || {});
            const finalEth = newEthStr !== prevState._ethStr ? data.ether_cat_data : prevState.ether_cat_data;

            const newMechStr = JSON.stringify(data.mech_data || {});
            const finalMech = newMechStr !== prevState._mechStr ? data.mech_data : prevState.mech_data;

            return {
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
                program_count_output: data.program_count_output !== undefined ? data.program_count_output : prevState.program_count_output,
                is_calculating_trajectory: data.is_calculating_trajectory !== undefined ? data.is_calculating_trajectory : prevState.is_calculating_trajectory,
                is_physically_moving: data.is_physically_moving !== undefined ? data.is_physically_moving : prevState.is_physically_moving,
                speed_op: data.speed_op !== undefined ? data.speed_op : prevState.speed_op,
                di_val: data.di_val !== undefined ? data.di_val : prevState.di_val,
                do_val: data.do_val !== undefined ? data.do_val : prevState.do_val,
                variable_data: data.variable_data || prevState.variable_data || {},
                staging_data: data.staging_data || prevState.staging_data || {},
                
                tp_list: finalTpList,
                pr_program_data: finalPrList,
                error_pos_data: finalErr, _errStr: newErrStr,
                ether_cat_data: finalEth, _ethStr: newEthStr,
                mech_data: finalMech, _mechStr: newMechStr
            };
          });
        }
        else if (data.type === "trajectory_chunk") {
          const color = data.color; 
          const flatPoints = data.points || [];
          const newPts = [];
          for (let i = 0; i < flatPoints.length; i += 3) newPts.push([flatPoints[i], flatPoints[i+1], flatPoints[i+2]]);
          setRobotState(prevState => {
            if (color === "blue") return { ...prevState, blueTrajectory: (prevState.blueTrajectory || []).concat(newPts) };
            else if (color === "red") return { ...prevState, redTrajectory: (prevState.redTrajectory || []).concat(newPts) };
            return prevState;
          });
        }
        else if (data.type === "clear_trajectories") {
          setRobotState(prevState => ({ ...prevState, blueTrajectory: [], redTrajectory: [] }));
        }
      };
    } catch (err) {
      console.error("INVALID IP OR NETWORK ERROR", err);
      setIsConnecting(false);
      if (!isIntentionalDisconnect.current) setConnectionFailed(true);
    }
  };

  const disconnectWebSocket = () => {
    isIntentionalDisconnect.current = true; 
    setIsConnecting(false);
    setIsConnected(false);
    if (wsRef.current) wsRef.current.close();
  };

  const sendCommand = (cmd, value = "", dataObj = null) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = { command: cmd, value: value.toString() };
      if (dataObj) payload.data = dataObj; 
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  return (
    <WebSocketContext.Provider value={{ 
      isConnected, isConnecting, ipAddress, setIpAddress, connectWebSocket, disconnectWebSocket, sendCommand, robotState,
      accessFull, setAccessFull, connectionFailed, setConnectionFailed, rejectMessage,
      isGraphReading, setGraphReading // Exported for RightPart.js
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);