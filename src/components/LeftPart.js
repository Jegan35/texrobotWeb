import React, { useState, memo, useCallback, useEffect, useRef, useMemo, Suspense } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport, Text, Billboard, Line } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from 'three';
import HamburgerMenu from './HamburgerMenu'; 
import './LeftPart.css'; 

// --- FULL CONSTANTS ---
const COLORS = { Y_GREEN: "#1b5e20", X_RED: "#b71c1c", Z_BLUE: "#0d47a1" };
const INST_OPTIONS = ["Inst", "MOVJ", "MOVJ_dg", "MOVL", "MOVC", "MVLEX_Deg", "MVLEX_mm", "Pallet_Matrix", "Num_of_row", "Num_of_colm", "pos_add_x", "pos_add_y", "pos_add_z", "delay_ms", "go_to", "loop", "Start If", "End If", "Start-Con", "End-Con", "Wait", "DI-1", "DI-2", "DI-3", "DI-4", "DI-5", "DI-6", "DI-7", "DI-8", "DI-9", "DI-10", "DI-11", "DI-12", "DI-13", "DI-14", "DI-15", "DI-16", "DO-1", "DO-2", "DO-3", "DO-4", "DO-5", "DO-6", "DO-7", "DO-8", "DO-9", "DO-10", "DO-11", "DO-12", "DO-13", "DO-14", "DO-15", "DO-16", "AI-1", "AI-2", "AI-3", "AI-4", "AO-1", "AO-2", "AO-3", "AO-4", "DI-1 Chk", "DI-2 Chk", "DI-3 Chk", "DI-4 Chk", "DI-5 Chk", "DI-6 Chk", "DI-7 Chk", "DI-8 Chk", "DI-9 Chk", "DI-10 Chk", "DI-11 Chk", "DI-12 Chk", "DI-13 Chk", "DI-14 Chk", "DI-15 Chk", "DI-16 Chk", "DI-1 Un Chk", "DI-2 Un Chk", "DI-3 Un Chk", "DI-4 Un Chk", "DI-5 Un Chk", "DI-6 Un Chk", "DI-7 Un Chk", "DI-8 Un Chk", "DI-9 Un Chk", "DI-10 Un Chk", "DI-11 Un Chk", "DI-12 Un Chk", "DI-13 Un Chk", "DI-14 Un Chk", "DI-15 Un Chk", "DI-16 Un Chk", "= Assign", "== Equal", "!= Not Eql", "<", ">", "<=", ">=", "+", "-", "&", "stop", "Servo off"];
const DI_OPTIONS = ["Di-1", "D-1", "D-2", "D-3", "D-4", "D-5", "D-6", "D-7", "D-8", "D-9", "D-10", "D-11", "D-12", "D-13", "D-14", "D-15", "D-16"];
const DI2_OPTIONS = ["Di-2", "D-1", "D-2", "D-3", "D-4", "D-5", "D-6", "D-7", "D-8", "D-9", "D-10", "D-11", "D-12", "D-13", "D-14", "D-15", "D-16"];
const DIG_STATE_OPTIONS = ["DIG-S", "High", "Low"];
const VAR1_OPTIONS = ["Vr_1", "V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-7", "V-8", "V-9", "V-10", "AI-1", "AI-2", "AI-3", "AI-4", "AO-1", "AO-2", "AO-3", "AO-4"];
const VAR2_OPTIONS = ["Vr_2", "V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-7", "V-8", "V-9", "V-10", "AI-1", "AI-2", "AI-3", "AI-4", "AO-1", "AO-2", "AO-3", "AO-4"];

// ==========================================
// 3D ROBOT COMPONENTS
// ==========================================
const StaticLine = React.memo(({ points, color, lineWidth }) => (
  <Line points={points} color={color} lineWidth={lineWidth} transparent opacity={0.9} />
));

const FastThickLine = React.memo(({ points, color, lineWidth }) => {
  const [renderData, setRenderData] = useState({ chunks: [], active: [] });
  const chunksRef = useRef([]);
  const lastLen = useRef(0);
  const latestPoints = useRef(points);
  latestPoints.current = points;

  useEffect(() => {
    const interval = setInterval(() => {
      const pts = latestPoints.current;
      if (!pts) return;
      const len = pts.length;
      if (len < 2) {
        if (lastLen.current > 0) { chunksRef.current = []; setRenderData({ chunks: [], active: [] }); lastLen.current = 0; }
        return;
      }
      if (len !== lastLen.current) {
        if (len < lastLen.current) chunksRef.current = [];
        const CHUNK_SIZE = 250;
        const numChunks = Math.floor(len / CHUNK_SIZE);
        if (numChunks > chunksRef.current.length) {
          for (let i = chunksRef.current.length; i < numChunks; i++) {
            const start = Math.max(0, i * CHUNK_SIZE - 1);
            const end = (i + 1) * CHUNK_SIZE;
            chunksRef.current.push(pts.slice(start, end));
          }
        }
        const activeStart = Math.max(0, chunksRef.current.length * CHUNK_SIZE - 1);
        const activePts = pts.slice(activeStart, len);
        setRenderData({ chunks: [...chunksRef.current], active: activePts });
        lastLen.current = len;
      }
    }, 150); 
    return () => clearInterval(interval);
  }, []);

  if (renderData.chunks.length === 0 && renderData.active.length < 2) return null;
  return (
    <group>
      {renderData.chunks.map((chunk, idx) => (<StaticLine key={idx} points={chunk} color={color} lineWidth={lineWidth || 2.5} />))}
      {renderData.active.length > 1 && (<StaticLine points={renderData.active} color={color} lineWidth={lineWidth || 2.5} />)}
    </group>
  );
});

const Custom3DArrows = React.memo(() => {
  const shaftLength = 0.35; const shaftRadius = 0.0035; const headLength = 0.05; const headRadius = 0.012;
  const Arrow = ({ color, rotation }) => (
    <group rotation={rotation}>
      <mesh position={[0, shaftLength / 2, 0]}><cylinderGeometry args={[shaftRadius, shaftRadius, shaftLength, 32]} /><meshBasicMaterial color={color} depthTest={false} transparent opacity={0.9} /></mesh>
      <mesh position={[0, shaftLength + headLength / 2, 0]}><coneGeometry args={[headRadius, headLength, 32]} /><meshBasicMaterial color={color} depthTest={false} transparent opacity={0.9} /></mesh>
    </group>
  );
  return (
    <group>
      <Arrow color={COLORS.Y_GREEN} rotation={[0, 0, 0]} />
      <Arrow color={COLORS.X_RED} rotation={[0, 0, -Math.PI / 2]} />
      <Arrow color={COLORS.Z_BLUE} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
});

const RealRobot = () => {
  const link0 = useLoader(STLLoader, "/meshes/link0.stl");
  const link1 = useLoader(STLLoader, "/meshes/link1.stl");
  const link2 = useLoader(STLLoader, "/meshes/link2.stl");
  const link3 = useLoader(STLLoader, "/meshes/link3.stl");
  const link4 = useLoader(STLLoader, "/meshes/link4.stl");
  const link5 = useLoader(STLLoader, "/meshes/link5.stl");

  const { robotState } = useWebSocket();
  const j = robotState?.joints || { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 };
  const rad = (deg) => (deg * Math.PI) / 180;
  const matProps = { metalness: 0.6, roughness: 0.3 };

  return (
    <group position={[0, 0, 0]} scale={[1000, 1000, 1000]}>
      <mesh geometry={link0}><meshStandardMaterial color="#222222" {...matProps} /></mesh>
      <Custom3DArrows />
      <group position={[0, 0, 0]} rotation={[0, 0, rad(j.j1)]}>
        <mesh geometry={link1} position={[0, 0, 0]}><meshStandardMaterial color="#0277bd" {...matProps} /></mesh>
        <group position={[0.150, 0, 0.462]} rotation={[0, rad(j.j2), 0]}>
          <mesh geometry={link2} position={[-0.150, 0, -0.462]}><meshStandardMaterial color="#0277bd" {...matProps} /></mesh>
          <group position={[0, 0, 0.600]} rotation={[0, rad(j.j3), 0]}>
            <mesh geometry={link3} position={[-0.150, 0, -1.062]}><meshStandardMaterial color="#0277bd" {...matProps} /></mesh>
            <group position={[0, 0, 0.190]} rotation={[rad(j.j4), 0, 0]}>
              <mesh geometry={link4} position={[-0.150, 0, -1.252]}><meshStandardMaterial color="#d32f2f" {...matProps} /></mesh>
              <group position={[0.687, 0, 0]} rotation={[0, rad(j.j5), 0]}>
                <mesh geometry={link5} position={[-0.837, 0, -1.252]}><meshStandardMaterial color="#ffb300" {...matProps} /></mesh>
                <group position={[0.101, 0, 0]} rotation={[rad(j.j6), 0, 0]}><Custom3DArrows /></group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

const CustomGridWalls = React.memo(() => {
  const size = 2500; const step = 100; const height = 3000;
  const floorGrid = useMemo(() => {
    const pts = [];
    for (let i = -size; i <= size; i += step) { pts.push(-size, i, 0, size, i, 0); pts.push(i, -size, 0, i, size, 0); }
    return new Float32Array(pts);
  }, []);
  const backWallGrid = useMemo(() => {
    const pts = [];
    for (let x = -size; x <= size; x += step) pts.push(x, 0, 0, x, 0, height);
    for (let z = 0; z <= height; z += step) pts.push(-size, 0, z, size, 0, z);
    return new Float32Array(pts);
  }, []);
  const sideWallGrid = useMemo(() => {
    const pts = [];
    for (let y = -size; y <= size; y += step) pts.push(0, y, 0, 0, y, height);
    for (let z = 0; z <= height; z += step) pts.push(0, -size, z, 0, size, z);
    return new Float32Array(pts);
  }, []);

  return (
    <group>
      <lineSegments><bufferGeometry><bufferAttribute attach="attributes-position" count={floorGrid.length / 3} array={floorGrid} itemSize={3} /></bufferGeometry><lineBasicMaterial color="#81c784" transparent opacity={0.6} /></lineSegments>
      <group position={[0, size, 0]}><lineSegments><bufferGeometry><bufferAttribute attach="attributes-position" count={backWallGrid.length / 3} array={backWallGrid} itemSize={3} /></bufferGeometry><lineBasicMaterial color="#64b5f6" transparent opacity={0.6} /></lineSegments></group>
      <group position={[-size, 0, 0]}><lineSegments><bufferGeometry><bufferAttribute attach="attributes-position" count={sideWallGrid.length / 3} array={sideWallGrid} itemSize={3} /></bufferGeometry><lineBasicMaterial color="#e57373" transparent opacity={0.6} /></lineSegments></group>
      <group position={[0, size - 10, 1600]} rotation={[Math.PI / 2, 0, 0]}>
        <Text fontSize={220} color="#333" fontWeight="900" anchorX="center" anchorY="bottom" letterSpacing={0.1}>TEXSONICS</Text>
        <Text position={[0, -50, 0]} fontSize={80} color="#666" fontWeight="bold" anchorX="center" anchorY="top" letterSpacing={0.6}>R O B O T I C S</Text>
      </group>
    </group>
  );
});

const WorldCoordinates = React.memo(() => {
  const labels = []; const step = 100; const fontSize = 40; const axisLabelSize = 120;
  labels.push(<Billboard key="y" position={[0, -2600, 0]}><Text fontSize={axisLabelSize} color={COLORS.Y_GREEN} fontWeight="bold" outlineWidth={3}>Y</Text></Billboard>);
  labels.push(<Billboard key="x" position={[2600, 0, 0]}><Text fontSize={axisLabelSize} color={COLORS.X_RED} fontWeight="bold" outlineWidth={3}>X</Text></Billboard>);
  labels.push(<Billboard key="z" position={[2600, 2600, 1500]}><Text fontSize={axisLabelSize} color={COLORS.Z_BLUE} fontWeight="bold" outlineWidth={3}>Z</Text></Billboard>);
  for (let i = -2400; i <= 2400; i += step) {
    labels.push(<Billboard key={`yn-${i}`} position={[i, -2550, 0]}><Text fontSize={fontSize} color={COLORS.Y_GREEN} fontWeight="bold">{i}</Text></Billboard>);
    if (i !== 0) labels.push(<Billboard key={`xn-${i}`} position={[2550, i, 0]}><Text fontSize={fontSize} color={COLORS.X_RED} fontWeight="bold">{i}</Text></Billboard>);
  }
  for (let z = 100; z <= 3000; z += step) { labels.push(<Billboard key={`zn-${z}`} position={[2550, 2550, z]}><Text fontSize={fontSize} color={COLORS.Z_BLUE} fontWeight="bold">{z}</Text></Billboard>); }
  return <group>{labels}</group>;
});


// ==========================================
// MAIN LEFTPART COMPONENT
// ==========================================
const LeftPart = () => {
  const { sendCommand, robotState } = useWebSocket();
  const rs = robotState || {};
  
  const c = rs.cartesian || { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
  const j = rs.joints || { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 };
  const bluePts = rs.blueTrajectory || [];
  const redPts = rs.redTrajectory || [];

  const servoOn = rs.servo_on === true;
  const isStarted = rs.started === true;
  const isRunning = rs.paused === false;
  const mode = rs.mode || "MODE";
  const currentError = rs.error_message || "No active errors";
  const speedOp = rs.speed_op !== undefined ? Number(rs.speed_op).toFixed(1) : "0.0";
  const tpFiles = rs.tp_file_list || [];
  const prFiles = rs.pr_file_list || [];
  const currentTp = rs.current_tp_name || "None";
  const currentPr = rs.current_pr_name || "None";

  // 🔴 FULL SCREEN STATE 🔴
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isSystemOkOpen, setIsSystemOkOpen] = useState(false);
  
  const [fileModalStep, setFileModalStep] = useState('CLOSED'); 
  const [fileType, setFileType] = useState('TP'); 
  const [fileNameInput, setFileNameInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadio, setSelectedRadio] = useState('');
  const [selectedChecks, setSelectedChecks] = useState({});
  const [lastAction, setLastAction] = useState({ TP: '', PR: '' });

  const [activeBottomTab, setActiveBottomTab] = useState('MAIN');
  const [openDropdown, setOpenDropdown] = useState(null);
  
  const [displayTpMode, setDisplayTpMode] = useState('TP Mode');
  const [ipPgInput, setIpPgInput] = useState('0');
  const [tpNameVal, setTpNameVal] = useState('0');
  const [comVal, setComVal] = useState('0');

  const [selInst, setSelInst] = useState("Inst");
  const [selDi1, setSelDi1] = useState(DI_OPTIONS[0]);
  const [selDi2, setSelDi2] = useState(DI2_OPTIONS[0]);
  const [selHL, setSelHL] = useState(DIG_STATE_OPTIONS[0]);
  const [selVar1, setSelVar1] = useState(VAR1_OPTIONS[0]);
  const [selVar2, setSelVar2] = useState(VAR2_OPTIONS[0]);
  const [delayVal, setDelayVal] = useState('0');
  const [gotoVal, setGotoVal] = useState('0');
  const [loopVal, setLoopVal] = useState('0');
  const [progSpeedVal, setProgSpeedVal] = useState('0');
  const [radiusVal, setRadiusVal] = useState('0');
  const [varInputVal, setVarInputVal] = useState('0');
  const [anIpVal, setAnIpVal] = useState('0');
  const [anOpVal, setAnOpVal] = useState('0');

  const controlsRef = useRef();

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.object.position.set(0, -6500, 3000);
      controlsRef.current.target.set(0, 0, 800);
      controlsRef.current.update();
    }
  };

  useEffect(() => {
      if (fileModalStep === 'OPEN' || fileModalStep === 'DELETE') sendCommand(`REFRESH_${fileType}_FILES`, "");
  }, [fileModalStep, fileType, sendCommand]);

  const handleServoToggle = () => sendCommand("TOGGLE_SERVO", "");
  const handleHomeClick = () => sendCommand("TRIGGER_HOME", "");
  const handleRunPauseToggle = () => sendCommand("TOGGLE_PAUSE", "");
  const handleStartStopToggle = () => sendCommand("TOGGLE_START", "");
  const handleExitClick = () => sendCommand("EXIT", "");
  const handleModeSelect = (m) => { setIsModeMenuOpen(false); sendCommand(m === "SIM" ? "SET_SIM" : "SET_REAL", ""); };
  const handleErrorClear = () => sendCommand("CLEAR_ERRORS", "");
  const handleMarkClear = () => sendCommand("CLEAR_MARKS", "");

  const openFileMenu = () => { setFileModalStep('TYPE'); sendCommand("REFRESH_TP_FILES", ""); sendCommand("REFRESH_PR_FILES", ""); };
  const selectType = (type) => { setFileType(type); setFileModalStep('OPS'); sendCommand(`REFRESH_${type}_FILES`, ""); };
  const forceRefresh = () => sendCommand(`REFRESH_${fileType}_FILES`, "");

  const activeRawList = fileType === 'TP' ? tpFiles : prFiles;
  const parsedList = (Array.isArray(activeRawList) ? activeRawList : []).map(item => {
      const parts = typeof item === 'string' ? item.split('|') : [item, ''];
      return { name: parts[0] || 'Unknown', date: parts[1] || '' };
  });
  const filteredList = parsedList.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const fileExists = parsedList.some(f => f.name.toLowerCase() === fileNameInput.trim().toLowerCase());
  const canCreate = fileNameInput.trim().length > 0 && !fileExists;

  const executeNewFile = () => {
      if (!canCreate) return;
      const cleanName = fileNameInput.trim();
      sendCommand(`NEW_${fileType}_FILE`, cleanName);
      setLastAction(prev => ({ ...prev, [fileType]: `Create ${fileType}: ${cleanName}` }));
      setFileModalStep('CLOSED'); setFileNameInput('');
  };
  const executeOpenFile = () => {
      if (!selectedRadio) return;
      sendCommand(`OPEN_${fileType}_FILE`, selectedRadio);
      setLastAction(prev => ({ ...prev, [fileType]: `Open ${fileType}: ${selectedRadio}` }));
      setFileModalStep('CLOSED'); setSelectedRadio(''); setSearchQuery('');
  };
  const executeDeleteFiles = () => {
      const filesToDelete = Object.keys(selectedChecks).filter(k => selectedChecks[k]);
      if(filesToDelete.length === 0) return;
      filesToDelete.forEach(file => sendCommand(`DELETE_${fileType}_FILE`, file));
      setLastAction(prev => ({ ...prev, [fileType]: `Deleted files` }));
      setTimeout(() => sendCommand(`REFRESH_${fileType}_FILES`, ""), 500);
      setSelectedChecks({}); setFileModalStep('OPS');
  };

  const errLower = currentError.toLowerCase().trim();
  const hasError = !["no error", "no active errors", "error cleared"].includes(errLower) && errLower !== "";

  const toggleDropdown = (menu) => setOpenDropdown(openDropdown === menu ? null : menu);

  const renderOldPopup = (menuKey, options, currentValue, onSelect, btnClass = "cb-btn", hasInput = false) => (
      <div className="rel-flex" style={{zIndex: openDropdown === menuKey ? 99999 : 1}}>
          <button className={btnClass} onClick={() => toggleDropdown(menuKey)}>⚙ {currentValue}</button>
          
          {openDropdown === menuKey && (
              <div className="custom-select-menu-old">
                  {options.map((o, index) => (
                      <div key={o} style={{ display: 'flex', gap: '5px', width: '100%', alignItems: 'center' }}>
                          {hasInput && index === 0 && (
                              <input 
                                  className="popup-inline-input"
                                  type="text" 
                                  placeholder="S..." 
                                  onBlur={(e) => {
                                      sendCommand('SET_POPUP_VAL', e.target.value);
                                      setOpenDropdown(null);
                                  }} 
                              />
                          )}
                          <button className="custom-select-item-old" style={{ flex: 1 }} onClick={() => { onSelect(o); setOpenDropdown(null); }}>
                              {o}
                          </button>
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  const renderFileModal = () => {
      if (fileModalStep === 'CLOSED') return null;
      return (
          <div className="file-modal-overlay">
              {fileModalStep === 'TYPE' && (
                  <div className="fm-box">
                      <div className="fm-title">SELECT TYPE</div>
                      <button className="fm-btn bg-teal" onClick={() => selectType('TP')}>TARGET POINT FILES</button>
                      <button className="fm-btn bg-blue" onClick={() => selectType('PR')}>PROGRAM FILES</button>
                      <button className="fm-btn bg-purple">TRAJECTORY FILES</button>
                      <button className="fm-btn bg-dark mt-10" onClick={() => setFileModalStep('CLOSED')}>CLOSE</button>
                  </div>
              )}
              {fileModalStep === 'OPS' && (
                  <div className="fm-box">
                      <div className="fm-title">{fileType} OPERATIONS</div>
                      <button className="fm-btn bg-green" onClick={() => { setFileModalStep('NEW'); setFileNameInput(''); }}>NEW {fileType}</button>
                      <button className="fm-btn bg-blue" onClick={() => { setFileModalStep('OPEN'); setSearchQuery(''); }}>OPEN {fileType}</button>
                      <button className="fm-btn bg-red" onClick={() => { setFileModalStep('DELETE'); setSelectedChecks({}); }}>DELETE {fileType}</button>
                      <button className="fm-btn bg-dark mt-10" onClick={() => setFileModalStep('TYPE')}>BACK</button>
                  </div>
              )}
              {fileModalStep === 'NEW' && (
                  <div className="fm-box">
                      <div className="fm-title" style={{color:'#00E676'}}>CREATE NEW {fileType}</div>
                      <input className="fm-input" placeholder="Filename..." value={fileNameInput} onChange={e=>setFileNameInput(e.target.value)}/>
                      {fileExists && <div style={{color:'red', fontSize:'0.7rem'}}>Exists!</div>}
                      <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                          <button className="fm-btn bg-red" style={{flex:1}} onClick={() => setFileModalStep('OPS')}>CANCEL</button>
                          <button className="fm-btn" style={{flex:1, background: canCreate?'#4CAF50':'#333'}} onClick={executeNewFile}>CREATE</button>
                      </div>
                  </div>
              )}
              {fileModalStep === 'OPEN' && (
                  <div className="fm-box" style={{width:'320px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                          <div className="fm-title" style={{color:'#039BE5'}}>OPEN FILE</div>
                          <button onClick={forceRefresh} className="fm-sm-btn">↻</button>
                      </div>
                      <input className="fm-input" placeholder="Search..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
                      <div className="fm-list">
                          {filteredList.map(f => (
                              <label key={f.name} className={`fm-list-item ${selectedRadio===f.name?'active':''}`}>
                                  <input type="radio" checked={selectedRadio===f.name} onChange={()=>setSelectedRadio(f.name)}/>
                                  <span>{f.name}</span>
                              </label>
                          ))}
                      </div>
                      <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                          <button className="fm-btn bg-dark" style={{flex:1}} onClick={() => setFileModalStep('OPS')}>BACK</button>
                          <button className="fm-btn bg-blue" style={{flex:1}} onClick={executeOpenFile}>OPEN</button>
                      </div>
                  </div>
              )}
              {fileModalStep === 'DELETE' && (
                  <div className="fm-box" style={{width:'320px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                          <div className="fm-title" style={{color:'#E53935'}}>DELETE FILE</div>
                          <button onClick={forceRefresh} className="fm-sm-btn">↻</button>
                      </div>
                      <input className="fm-input" placeholder="Search..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
                      <div className="fm-list">
                          {filteredList.map(f => (
                              <label key={f.name} className={`fm-list-item ${selectedChecks[f.name]?'active-red':''}`}>
                                  <input type="checkbox" checked={!!selectedChecks[f.name]} onChange={e=>setSelectedChecks({...selectedChecks, [f.name]:e.target.checked})}/>
                                  <span>{f.name}</span>
                              </label>
                          ))}
                      </div>
                      <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                          <button className="fm-btn bg-dark" style={{flex:1}} onClick={() => setFileModalStep('OPS')}>BACK</button>
                          <button className="fm-btn bg-red" style={{flex:1}} onClick={executeDeleteFiles}>DELETE</button>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="lp-master-container">

      <div className="lp-top-header">
          <div className="header-logo">TEXSONICS</div>
          <div className="header-title">ROBOT CONTROL v1</div>
          <button 
              className={`header-sys-btn ${hasError ? 'error-btn' : 'ok-btn'}`}
              onClick={() => setIsSystemOkOpen(!isSystemOkOpen)}
          >
              {hasError ? "⚠️ VIEW ERROR" : "✓ SYSTEM OK"}
          </button>
          
          {isSystemOkOpen && (
              <div className="global-sys-error-modal">
                  <h4 style={{color: hasError ? '#f50707' : '#00E676'}}>SYSTEM STATUS</h4>
                  <p>{currentError}</p>
                  <button onClick={() => setIsSystemOkOpen(false)}>CLOSE</button>
              </div>
          )}
      </div>

      {/* 🔴 ANIMATED SCENE WRAPPER 🔴 */}
      <div className={`lp-scene-wrapper ${isFullScreen ? 'full-screen' : ''}`}>
          <HamburgerMenu />
          <button className="recenter-btn" onClick={resetCamera}>⛶ RECENTER</button>

          {/* 🔴 NEW FULL SCREEN TOGGLE BUTTON 🔴 */}
          <button className="scene-fullscreen-btn" onClick={() => setIsFullScreen(!isFullScreen)}>
             {isFullScreen ? '▼ COMPACT' : '▲ FULL'}
          </button>

          <div className="lp-cartesian-overlay">
              <div className="oc-title">CARTESIAN</div>
              <div className="oc-body">
                  <div className="cart-box"><span>X(mm)</span><div className="val">{c.x !== undefined ? c.x.toFixed(2) : "0.00"}</div></div>
                  <div className="cart-box"><span>Y(mm)</span><div className="val">{c.y !== undefined ? c.y.toFixed(2) : "0.00"}</div></div>
                  <div className="cart-box"><span>Z(mm)</span><div className="val">{c.z !== undefined ? c.z.toFixed(2) : "0.00"}</div></div>
                  <div className="cart-box"><span>A(°)</span><div className="val" style={{color:'#fff'}}>{c.rx !== undefined ? c.rx.toFixed(2) : "0.00"}</div></div>
                  <div className="cart-box"><span>B(°)</span><div className="val" style={{color:'#fff'}}>{c.ry !== undefined ? c.ry.toFixed(2) : "0.00"}</div></div>
                  <div className="cart-box"><span>C(°)</span><div className="val" style={{color:'#fff'}}>{c.rz !== undefined ? c.rz.toFixed(2) : "0.00"}</div></div>
              </div>
          </div>

          <div className="lp-joints-overlay">
              <div className="joints-title">JOINTS</div>
              {['J1', 'J2', 'J3', 'J4', 'J5', 'J6'].map((label, idx) => {
                  const val = j[`j${idx+1}`];
                  return (
                      <div key={label} className="joint-box">
                          <span>{label}</span>
                          <div className="val">{val !== undefined ? val.toFixed(2) : "0.00"}°</div>
                      </div>
                  );
              })}
          </div>

          <div className="canvas-container">
            <Canvas camera={{ position: [0, -6500, 3000], up: [0, 0, 1], fov: 45, near: 1, far: 30000 }}>
              <ambientLight intensity={1.2} />
              <hemisphereLight skyColor="#ffffff" groundColor="#444444" intensity={1.0} />
              <directionalLight position={[2000, -4000, 4000]} intensity={2.5} castShadow />
              <pointLight position={[-2000, -2000, 3000]} intensity={1.8} />
              <OrbitControls ref={controlsRef} makeDefault target={[0, 0, 800]} maxDistance={15000} minDistance={500} maxPolarAngle={Math.PI / 2 + 0.1} enablePan={false} />
              <group><CustomGridWalls /><WorldCoordinates /></group>
              <Suspense fallback={null}>
                <group rotation={[0, 0, -Math.PI / 2]}>
                  <RealRobot />
                  {bluePts.length > 1 && <FastThickLine points={bluePts} color="#039BE5" lineWidth={2.5} />}
                  {redPts.length > 1 && <FastThickLine points={redPts} color="#E53935" lineWidth={4} />}
                </group>
              </Suspense>
              
              {/* 🔴 ADJUSTED GIZMO TO NEVER HIDE 🔴 */}
              <GizmoHelper alignment="bottom-right" margin={[160, 120]}>
                <GizmoViewport axisColors={[COLORS.X_RED, COLORS.Y_GREEN, COLORS.Z_BLUE]} labelColor="white" />
              </GizmoHelper>
            </Canvas>
          </div>
      </div>

      {/* 🔴 ANIMATED CONTROLS WRAPPER 🔴 */}
      <div className={`lp-controls-wrapper ${isFullScreen ? 'hidden-controls' : ''}`}>
          <div className="lp-tabs-header">
              <button className={`lp-tab-btn ${activeBottomTab === 'MAIN' ? 'active' : ''}`} onClick={() => setActiveBottomTab('MAIN')}>MAIN CONTROLS</button>
              <button className={`lp-tab-btn ${activeBottomTab === 'PROG1' ? 'active' : ''}`} onClick={() => setActiveBottomTab('PROG1')}>PROG CONTROLS 1</button>
              <button className={`lp-tab-btn ${activeBottomTab === 'PROG2' ? 'active' : ''}`} onClick={() => setActiveBottomTab('PROG2')}>PROG CONTROLS 2</button>
          </div>

          <div className="lp-tabs-body">
              {activeBottomTab === 'MAIN' && (
                  <div className="cb-grid">
                      <button className={`cb-btn ${servoOn ? 'bg-green' : 'bg-dark'}`} onClick={handleServoToggle}>⚡ SERVO: {servoOn ? 'ON' : 'OFF'}</button>
                      <button className="cb-btn bg-blue" onClick={handleHomeClick}>⌂ HOME</button>
                      <button className={`cb-btn ${isRunning ? 'bg-green' : 'bg-yellow'}`} onClick={handleRunPauseToggle}>{isRunning ? '► RUN' : '❚❚ PAUSE'}</button>
                      <button className={`cb-btn ${isStarted ? 'bg-red' : 'bg-purple'}`} onClick={handleStartStopToggle}>{isStarted ? '⏹ STOP' : '▶ START'}</button>
                      <button className="cb-btn bg-red" onClick={handleExitClick}>✖ EXIT</button>
                      <div className="rel-flex">
                          {renderOldPopup('MODE_MENU', ['SIM', 'REAL'], mode, handleModeSelect, "cb-btn bg-outline-green")}
                      </div>

                      <div className="rel-flex">
                          <button className="cb-btn bg-teal" onClick={openFileMenu}>📁 FILES</button>
                          {renderFileModal()}
                      </div>
                      <div className="cb-info-box" title={lastAction.TP || `Open TP: ${currentTp}`}>{lastAction.TP || `TP: ${currentTp}`}</div>
                      <div className="cb-info-box" title={lastAction.PR || `Open PR: ${currentPr}`}>{lastAction.PR || `PR: ${currentPr}`}</div>
                      <div className="cb-info-box">Op: ppp</div>
                      <button className="cb-btn bg-pink">+ TOOLS</button>
                      <div className="cb-info-box empty">Tool...</div>

                      <div className="cb-span-2 rel-flex">
                          <button className={`cb-btn ${hasError ? 'bg-red' : 'bg-green-full'}`} onClick={() => setIsSystemOkOpen(!isSystemOkOpen)}>
                              {hasError ? "⚠️ VIEW ERROR" : "✓ SYSTEM OK"}
                          </button>
                      </div>
                      <button className="cb-btn bg-red" onClick={handleErrorClear}>✕ ERR CLR</button>
                      <button className="cb-btn bg-yellow" onClick={handleMarkClear}>✕ MRK CLR</button>
                      <button className="cb-btn bg-purple-dark">⟳ RESET</button>
                      <div className="cb-info-box text-green">Spd: {speedOp}%</div>
                  </div>
              )}

              {activeBottomTab === 'PROG1' && (
                  <div className="cb-grid-4">
                      {renderOldPopup('TP_MODE', ['TP Mode', 'MOVJ', 'MOVL'], displayTpMode, setDisplayTpMode, "cb-btn bg-blue")}
                      {renderOldPopup('TP_INSERT', ['Insert TP', 'Modify TP', 'Delete TP'], 'TP', () => {}, "cb-btn bg-purple")}
                      <button className="cb-btn bg-green" onClick={() => sendCommand('RUN_TP')}>▶ RUN TP</button>
                      <button className="cb-btn bg-dark">📄 OP PG</button>

                      <input className="cb-input" value={rs.program_count_output || '0'} readOnly />
                      {renderOldPopup('INST_INSERT', ['Insert Inst', 'Modify Inst', 'Delete Inst'], 'INST', () => {}, "cb-btn bg-purple", true)}
                      <button className="cb-btn bg-green" onClick={() => sendCommand('RUN_PROGRAM')}>▶ RUN INST</button>
                      <button className="cb-btn bg-teal" onClick={() => sendCommand('CALCULATE_TRAJECTORY')}>🧮 CALC</button>

                      <button className="cb-btn bg-dark" onClick={() => sendCommand("SET_PROGRAM_INPUT", ipPgInput)}>📄 IP PG</button>
                      <input className="cb-input" value={ipPgInput} onChange={(e) => setIpPgInput(e.target.value)} />
                      <button className="cb-btn bg-dark" onClick={() => sendCommand("SET_TP_NAME", tpNameVal)}>🏷 NAME</button>
                      <input className="cb-input" value={tpNameVal} onChange={(e) => setTpNameVal(e.target.value)} />
                      
                      <button className="cb-btn bg-dark" onClick={() => sendCommand("SET_PROGRAM_COMMENT", comVal)}>🌍 COM</button>
                      <input className="cb-input" value={comVal} onChange={(e) => setComVal(e.target.value)} />
                      <button className="cb-btn dummy-btn" disabled>--</button>
                      <button className="cb-btn dummy-btn" disabled>--</button>
                  </div>
              )}

              {activeBottomTab === 'PROG2' && (
                  <div className="cb-grid-5">
                      {renderOldPopup('R5_INST', INST_OPTIONS, selInst, setSelInst, "cb-btn bg-blue", true)}
                      {renderOldPopup('R5_DI1', DI_OPTIONS, selDi1, setSelDi1, "cb-btn bg-dark")}
                      {renderOldPopup('R5_DI2', DI2_OPTIONS, selDi2, setSelDi2, "cb-btn bg-dark")}
                      <button className="cb-btn bg-dark" onClick={() => sendCommand('CONFIRM_HIGH_LOW')}># H/L</button>
                      {renderOldPopup('R5_HL', DIG_STATE_OPTIONS, selHL, setSelHL, "cb-btn bg-dark")}

                      <button className="cb-btn bg-dark" onClick={() => sendCommand('SET_DELAY', delayVal)}>⏱ DELAY</button>
                      <input className="cb-input" value={delayVal} onChange={e => setDelayVal(e.target.value)} />
                      <button className="cb-btn bg-dark" onClick={() => sendCommand('SET_GOTO_PROGRAM', gotoVal)}>→ GO TO</button>
                      <input className="cb-input" value={gotoVal} onChange={e => setGotoVal(e.target.value)} />
                      <button className="cb-btn bg-dark" onClick={() => sendCommand('SET_LOOP', loopVal)}>↺ LOOP</button>

                      <input className="cb-input" value={loopVal} onChange={e => setLoopVal(e.target.value)} />
                      <button className="cb-btn bg-dark" onClick={() => sendCommand('SET_PROGRAM_SPEED', progSpeedVal)}>⏱ MM/S</button>
                      <input className="cb-input" value={progSpeedVal} onChange={e => setProgSpeedVal(e.target.value)} />
                      <button className="cb-btn bg-dark" onClick={() => {}}>🎯 RAD</button>
                      <input className="cb-input" value={radiusVal} onChange={e => setRadiusVal(e.target.value)} />

                      {renderOldPopup('R5_VAR1', VAR1_OPTIONS, selVar1, setSelVar1, "cb-btn bg-dark")}
                      <input className="cb-input" value={varInputVal} onChange={e => setVarInputVal(e.target.value)} onBlur={(e) => sendCommand('SET_VAR_VAL', e.target.value)} />
                      {renderOldPopup('R5_VAR2', VAR2_OPTIONS, selVar2, setSelVar2, "cb-btn bg-dark")}
                      <button className="cb-btn bg-dark" onClick={() => {}}>🌍 AN ip</button>
                      <input className="cb-input" value={anIpVal} onChange={e => setAnIpVal(e.target.value)} />

                      <button className="cb-btn bg-dark" onClick={() => {}}>🌍 AN op</button>
                      <input className="cb-input" value={anOpVal} onChange={e => setAnOpVal(e.target.value)} />
                      <button className="cb-btn dummy-btn" disabled>--</button>
                      <button className="cb-btn dummy-btn" disabled>--</button>
                      <button className="cb-btn dummy-btn" disabled>--</button>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default LeftPart;