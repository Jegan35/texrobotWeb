import React, { useState, useEffect, useCallback, memo } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import RightHeader from './RightHeader';
import RightMenuSidebar from './RightMenuSidebar';
import './RightPart.css'; 

const INST_OPTIONS = ["Inst", "MOVJ", "MOVJ_dg", "MOVL", "MOVC", "MVLEX_Deg", "MVLEX_mm", "Pallet_Matrix", "Num_of_row", "Num_of_colm", "pos_add_x", "pos_add_y", "pos_add_z", "delay_ms", "go_to", "loop", "Start If", "End If", "Start-Con", "End-Con", "Wait", "DI-1", "DI-2", "DI-3", "DI-4", "DI-5", "DI-6", "DI-7", "DI-8", "DI-9", "DI-10", "DI-11", "DI-12", "DI-13", "DI-14", "DI-15", "DI-16", "DO-1", "DO-2", "DO-3", "DO-4", "DO-5", "DO-6", "DO-7", "DO-8", "DO-9", "DO-10", "DO-11", "DO-12", "DO-13", "DO-14", "DO-15", "DO-16", "AI-1", "AI-2", "AI-3", "AI-4", "AO-1", "AO-2", "AO-3", "AO-4", "DI-1 Chk", "DI-2 Chk", "DI-3 Chk", "DI-4 Chk", "DI-5 Chk", "DI-6 Chk", "DI-7 Chk", "DI-8 Chk", "DI-9 Chk", "DI-10 Chk", "DI-11 Chk", "DI-12 Chk", "DI-13 Chk", "DI-14 Chk", "DI-15 Chk", "DI-16 Chk", "DI-1 Un Chk", "DI-2 Un Chk", "DI-3 Un Chk", "DI-4 Un Chk", "DI-5 Un Chk", "DI-6 Un Chk", "DI-7 Un Chk", "DI-8 Un Chk", "DI-9 Un Chk", "DI-10 Un Chk", "DI-11 Un Chk", "DI-12 Un Chk", "DI-13 Un Chk", "DI-14 Un Chk", "DI-15 Un Chk", "DI-16 Un Chk", "= Assign", "== Equal", "!= Not Eql", "<", ">", "<=", ">=", "+", "-", "&", "stop", "Servo off"];
const DI_OPTIONS = ["Di-1", "D-1", "D-2", "D-3", "D-4", "D-5", "D-6", "D-7", "D-8", "D-9", "D-10", "D-11", "D-12", "D-13", "D-14", "D-15", "D-16"];
const DI2_OPTIONS = ["Di-2", "D-1", "D-2", "D-3", "D-4", "D-5", "D-6", "D-7", "D-8", "D-9", "D-10", "D-11", "D-12", "D-13", "D-14", "D-15", "D-16"];
const DIG_STATE_OPTIONS = ["Dig-state", "High", "Low"];
const VAR1_OPTIONS = ["Vr_1", "V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-7", "V-8", "V-9", "V-10", "AI-1", "AI-2", "AI-3", "AI-4", "AO-1", "AO-2", "AO-3", "AO-4"];
const VAR2_OPTIONS = ["Vr_2", "V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-7", "V-8", "V-9", "V-10", "AI-1", "AI-2", "AI-3", "AI-4", "AO-1", "AO-2", "AO-3", "AO-4"];
const MM_OPTIONS = ["mm", "50", "25", "15", "10", "5", "2", "1", "0.1", "0.01", "0.001"];
const DEG_OPTIONS = ["deg", "20", "15", "10", "5", "2", "1", "0.1", "0.01", "0.0001"];
const FRAME_OPTIONS = ["frames", "Base", "Tool", "User"];
const VAR_MONITOR_LIST = ["V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-7", "V-8", "V-9", "V-10", "AI-1", "AI-2", "AI-3", "AI-4", "AO-1", "AO-2", "AO-3", "AO-4"];
const DI_SIM_NUM_LIST = ["DI", "DI-1", "DI-2", "DI-3", "DI-4", "DI-5", "DI-6", "DI-7", "DI-8", "DI-9", "DI-10", "DI-11", "DI-12", "DI-13", "DI-14", "DI-15", "DI-16"];
const DO_SIM_NUM_LIST = ["DO", "DO-1", "DO-2", "DO-3", "DO-4", "DO-5", "DO-6", "DO-7", "DO-8", "DO-9", "DO-10", "DO-11", "DO-12", "DO-13", "DO-14", "DO-15", "DO-16"];
const SIM_STATE_LIST = ["State", "High", "Low"];

const MemoizedTpTableBody = memo(({ tpList, expandedTable, selectedTpIndex, onRowClick }) => {
    if (tpList.length === 0) {
        const colCount = expandedTable === 'TP' ? 6 : 4;
        return <tbody><tr><td colSpan={colCount} className="empty-table-text" style={{ border: 'none' }}>Please open a Target Point file</td></tr></tbody>;
    }
    return (
        <table className="data-table">
            <thead>
                <tr>
                    <th>S.No</th><th>Name</th><th>Value</th><th>Deg</th>
                    {expandedTable === 'TP' && (<><th>Tool</th><th>Frame</th></>)}
                </tr>
            </thead>
            <tbody>
                {tpList.map((item, i) => (
                    <tr key={i} className={`tr-hover ${i === selectedTpIndex ? "tr-blue" : ""}`} onClick={() => onRowClick(i)}>
                        <td>{i + 1}</td><td>{item.name || `tp${i+1}`}</td><td>{item.value || ''}</td><td>{item.deg || '--'}</td>
                        {expandedTable === 'TP' && (<><td>{item.tool !== undefined ? item.tool : '--'}</td><td>{item.frame !== undefined ? item.frame : '--'}</td></>)}
                    </tr>
                ))}
            </tbody>
        </table>
    );
});

const MemoizedPrTableBody = memo(({ prList, expandedTable, selectedPrIndex, onRowClick }) => {
    if (prList.length === 0) {
        const colCount = expandedTable === 'PR' ? 12 : 4;
        return <tbody><tr><td colSpan={colCount} className="empty-table-text" style={{ border: 'none' }}>Please open a Program file</td></tr></tbody>;
    }
    return (
        <table className="data-table">
            <thead>
                <tr>
                    <th>S.No</th><th>Inst</th><th>Name</th><th>Value</th>
                    {expandedTable === 'PR' && (<><th>Speed</th><th>Deg</th><th>Rad</th><th>Tool</th><th>Frame</th><th>Com</th><th>Dist</th><th>Time</th></>)}
                </tr>
            </thead>
            <tbody>
                {prList.map((item, i) => (
                    <tr key={i} className={`tr-hover ${i === selectedPrIndex ? "tr-blue" : ""}`} onClick={() => onRowClick(i)}>
                        <td>{i + 1}</td><td>{item.inst || 'MOVL'}</td><td>{item.name || ''}</td><td>{item.value || ''}</td>
                        {expandedTable === 'PR' && (<><td>{item.speed || '--'}</td><td>{item.deg || '--'}</td><td>{item.rad || '--'}</td><td>{item.tool || '--'}</td><td>{item.frame || '--'}</td><td>{item.comt || '--'}</td><td>{item.dist || '--'}</td><td>{item.time || '--'}</td></>)}
                    </tr>
                ))}
            </tbody>
        </table>
    );
});

const RightPart = () => {
  const { sendCommand, robotState } = useWebSocket();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('JOG JOINTS');

  const [expandedRowPanel, setExpandedRowPanel] = useState('NONE'); 

  const [expandedTable, setExpandedTable] = useState('NONE'); 
  const [openDropdown, setOpenDropdown] = useState(null);
  const [instInput, setInstInput] = useState('');
  const [displayTpMode, setDisplayTpMode] = useState('TP Mode');
  const [selectedTpIndex, setSelectedTpIndex] = useState(0);
  const [selectedPrIndex, setSelectedPrIndex] = useState(0);
  const [showModTpModal, setShowModTpModal] = useState(false);
  const [modTpData, setModTpData] = useState({ name: '', x: '', y: '', z: '' });
  
  const [activeRow1Tab, setActiveRow1Tab] = useState('Graph'); // Default to Graph for testing
  const [activeRow2Tab, setActiveRow2Tab] = useState('Programs File');
  const [activeRow4Tab, setActiveRow4Tab] = useState('Inst');

  // --> GRAPH STATES <--
  const [selectedGraphAxis, setSelectedGraphAxis] = useState('All-axis');
  const [isGraphReading, setIsGraphReading] = useState(false); // New state to control readings
  const [zoomWindow, setZoomWindow] = useState(5); // Default 5 seconds zoom window

  // Zoom handlers
  const handleZoomIn = () => setZoomWindow(prev => Math.max(1, prev / 1.5));
  const handleZoomOut = () => setZoomWindow(prev => Math.min(20, prev * 1.5));
  const handleZoomReset = () => setZoomWindow(5);
  
  const [ipPgInput, setIpPgInput] = useState('0');
  const [tpNameVal, setTpNameVal] = useState('0');
  const [comVal, setComVal] = useState('0');
  
  const [delayVal, setDelayVal] = useState('0');
  const [gotoVal, setGotoVal] = useState('0');
  const [loopVal, setLoopVal] = useState('0');
  const [progSpeedVal, setProgSpeedVal] = useState('0');
  const [radiusVal, setRadiusVal] = useState('0');
  const [varInputVal, setVarInputVal] = useState('0');
  const [anIpVal, setAnIpVal] = useState('0');
  const [anOpVal, setAnOpVal] = useState('0');
  const [debugGoto, setDebugGoto] = useState('');

  const [globalSpeed, setGlobalSpeed] = useState(50);
  const [frameVal, setFrameVal] = useState(FRAME_OPTIONS[0]);
  const [mmIncVal, setMmIncVal] = useState(MM_OPTIONS[0]);
  const [degIncVal, setDegIncVal] = useState(DEG_OPTIONS[0]);
  const [mmSpeedText, setMmSpeedText] = useState("50.0");
  const [degSpeedText, setDegSpeedText] = useState("50.0");

  const isJog = currentView.includes('JOG');
  const isJoints = currentView.includes('JOINTS');
  const motionType = isJog ? 'JOG' : 'MOVE';

  const rs = robotState || {};
  const tpList = rs.tp_list || [];
  const prList = rs.pr_program_data || [];
  const staging = rs.staging_data || {};
  const isCalculating = rs.is_calculating_trajectory === true;

  const errorData = rs.error_pos_data || {};
  const etherData = rs.ether_cat_data || {};
  const variableData = rs.variable_data || {};
  const mechData = rs.mech_data || {};
  const diVal = rs.di_val || 0;
  const doVal = rs.do_val || 0;

  useEffect(() => { if (rs.tp_run_mode) setDisplayTpMode(rs.tp_run_mode); }, [rs.tp_run_mode]);

  const handlePointerDown = (axis) => sendCommand(motionType === 'JOG' ? "BTN_PRESS" : "BTN_CLICK", axis);
  const handlePointerUp = (axis) => { if (motionType === 'JOG') sendCommand("BTN_RELEASE", axis); };
  const handleGlobalSpeedChange = (e) => { setGlobalSpeed(e.target.value); sendCommand("SET_GLOBAL_SPEED", e.target.value); };
  const applyMmSpeed = () => sendCommand("SET_MM_SPEED", mmSpeedText);
  const applyDegSpeed = () => sendCommand("SET_DEG_SPEED", degSpeedText);
  const toggleDropdown = (menu) => setOpenDropdown(openDropdown === menu ? null : menu);
  const handleTpModeSelect = (uiLabel, backendCmd) => { setDisplayTpMode(uiLabel); sendCommand('SET_TP_RUN_MODE', backendCmd); setOpenDropdown(null); };
  const handleTpRowClick = useCallback((index) => { setSelectedTpIndex(index); sendCommand('SELECT_TP_INDEX', index); }, [sendCommand]);
  const handlePrRowClick = useCallback((index) => { setSelectedPrIndex(index); sendCommand('SELECT_PR_ROW', index); }, [sendCommand]);

  const openModifyTpModal = () => {
      const item = tpList[selectedTpIndex] || {};
      let cx = '', cy = '', cz = '';
      if (item.value) {
          const matchX = item.value.match(/x:([-\d.]+)/);
          const matchY = item.value.match(/y:([-\d.]+)/);
          const matchZ = item.value.match(/z:([-\d.]+)/);
          if (matchX) cx = matchX[1]; if (matchY) cy = matchY[1]; if (matchZ) cz = matchZ[1];
      }
      setModTpData({ name: item.name || '', x: cx, y: cy, z: cz });
      setShowModTpModal(true); setOpenDropdown(null);
  };

  const handleModifyConfirm = () => {
      sendCommand('MODIFY_TP', '', { name: modTpData.name, x: modTpData.x, y: modTpData.y, z: modTpData.z });
      setShowModTpModal(false);
  };

  // ==============================================================
  // NEW: MODIFIED GRAPH RENDERER (INDUSTRIAL DESIGN)
  // ==============================================================
// ==============================================================
  // MODERN INDUSTRIAL GRAPH RENDERER
  // ==============================================================
// ==============================================================
  // MODERN INDUSTRIAL GRAPH RENDERER (PERFECT GRID & ZOOM)
  // ==============================================================
  const renderGraphView = () => {
      const gData = rs.graph_data || [];
      const hasData = gData.length > 0;
      
      const svgWidth = 800; 
      const svgHeight = 250;
      const maxY = 360;
      const minY = -360;
      
      // Y-Axis Mapping
      const mapY = (val) => {
          const clamped = Math.max(minY, Math.min(maxY, val || 0));
          const norm = (clamped - minY) / (maxY - minY);
          return svgHeight - (norm * svgHeight);
      };

      // X-Axis Mapping with Dynamic Zoom
      let maxX = 5; 
      if (hasData) {
          maxX = gData[gData.length - 1][0] || 5;
      }
      let minX = maxX - zoomWindow;
      if (minX < 0 && !hasData) minX = 0;
      
      const mapX = (t) => {
          const norm = (t - minX) / zoomWindow;
          return norm * svgWidth;
      };

      const axisConfig = [
          { name: 'X', index: 1, color: '#FF3B30' },
          { name: 'Y', index: 2, color: '#4CAF50' },
          { name: 'Z', index: 3, color: '#2196F3' },
          { name: 'J1', index: 4, color: '#FFC107' },
          { name: 'J2', index: 5, color: '#9C27B0' },
          { name: 'J3', index: 6, color: '#00BCD4' },
          { name: 'J4', index: 7, color: '#8BC34A' },
          { name: 'J5', index: 8, color: '#FF9800' },
          { name: 'J6', index: 9, color: '#E91E63' },
      ];

      const axesToDraw = selectedGraphAxis === 'All-axis' 
          ? axisConfig 
          : axisConfig.filter(a => a.name === selectedGraphAxis);

      const toggleGraphReading = () => {
          const nextState = !isGraphReading;
          setIsGraphReading(nextState);
          sendCommand(nextState ? 'START_GRAPH' : 'STOP_GRAPH');
      };

      // Generate Perfect SVG Grids
      const yGridLines = [];
      for (let y = -360; y <= 360; y += 30) {
          const isZero = y === 0;
          const isMajor = y % 120 === 0;
          const yPos = mapY(y);
          yGridLines.push(
              <line key={`hy-${y}`} x1="0" y1={yPos} x2={svgWidth} y2={yPos}
                    className={isZero ? "mg-zero-line" : (isMajor ? "mg-major-grid" : "mg-minor-grid")} />
          );
      }

      const vGridLines = [];
      let majorStep = zoomWindow / 5;
      let minorStep = majorStep / 5;
      let startX = Math.floor(minX / minorStep) * minorStep;
      for (let t = startX; t <= maxX + minorStep; t += minorStep) {
           const isMajor = Math.abs((t % majorStep)) < 0.0001 || Math.abs((t % majorStep) - majorStep) < 0.0001;
           const xPos = mapX(t);
           vGridLines.push(
              <line key={`vx-${t.toFixed(2)}`} x1={xPos} y1="0" x2={xPos} y2={svgHeight}
                    className={isMajor ? "mg-major-grid" : "mg-minor-grid"} />
          );
      }

      return (
          <div className="modern-graph-container">
              {/* Header Controls */}
              <div className="mg-header">
                  <button className={`mg-toggle-btn ${isGraphReading ? 'mg-stop' : 'mg-start'}`} onClick={toggleGraphReading}>
                      {isGraphReading ? '■ STOP GRAPH' : '▶ START GRAPH'}
                  </button>
                  
                  <div className="mg-axis-selector">
                      <label>SELECT AXIS:</label>
                      <select value={selectedGraphAxis} onChange={(e) => setSelectedGraphAxis(e.target.value)}>
                          <option value="All-axis">All-axis</option>
                          <option value="X">X Axis</option><option value="Y">Y Axis</option><option value="Z">Z Axis</option>
                          <option value="J1">J1 Axis</option><option value="J2">J2 Axis</option><option value="J3">J3 Axis</option>
                          <option value="J4">J4 Axis</option><option value="J5">J5 Axis</option><option value="J6">J6 Axis</option>
                      </select>
                  </div>
              </div>

              {/* Main Graph Area */}
              <div className="mg-body">
                  {/* Left Label - PERFECTLY SEPARATED */}
                  <div className="mg-y-label-col">
                      <span>deg / mm</span>
                  </div>

                  {/* Y-Axis Values */}
                  <div className="mg-y-axis">
                      <span>360.0</span><span>240.0</span><span>120.0</span>
                      <span>0.0</span><span>-120.0</span><span>-240.0</span><span>-360.0</span>
                  </div>

                  {/* SVG Plot */}
                  <div className="mg-plot-wrapper">
                      <svg className="mg-svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                          {yGridLines}
                          {vGridLines}
                          {/* Data Lines */}
                          {hasData && axesToDraw.map(axis => {
                              const pointsStr = gData.map(d => `${mapX(d[0]||0)},${mapY(d[axis.index]||0)}`).join(' ');
                              return <polyline key={axis.name} points={pointsStr} fill="none" stroke={axis.color} strokeWidth="2.5" strokeLinejoin="round" />
                          })}
                      </svg>
                  </div>

                  {/* Right Tools - ZOOM ENABLED */}
                  <div className="mg-tools">
                      <button className="mg-tool-btn" onClick={handleZoomIn}>+</button>
                      <button className="mg-tool-btn" onClick={handleZoomOut}>-</button>
                      <button className="mg-tool-btn" onClick={handleZoomReset}>↺</button>
                  </div>
              </div>

              {/* X-Axis */}
              <div className="mg-x-axis">
                  <span>{(minX).toFixed(2)}</span>
                  <span>{(minX + zoomWindow*0.2).toFixed(2)}</span>
                  <span>{(minX + zoomWindow*0.4).toFixed(2)}</span>
                  <span>{(minX + zoomWindow*0.6).toFixed(2)}</span>
                  <span>{(minX + zoomWindow*0.8).toFixed(2)}</span>
                  <span>{(maxX).toFixed(2)}</span>
              </div>
              <div className="mg-x-label">Time [s]</div>
          </div>
      );
  };
  const renderErrorPos = () => {
      const axes = ['X','Y','Z','a','b','c'];
      const extras = ['Sp In', 'fun', 'Num', 'Dist', 'ms', 'Trj'];
      return (
          <div className="light-panel">
              <div className="error-pos-grid">
                  {axes.map((ax, i) => (
                      <React.Fragment key={ax}>
                          <span className="light-label">{ax}-S</span><input className="light-input" value={errorData[`${ax}_S`] || 0} readOnly />
                          <span className="light-label">J{i+1}-S</span><input className="light-input" value={errorData[`J${i+1}_S`] || 0} readOnly />
                          <span className="light-label">{ax}-E</span><input className="light-input" value={errorData[`${ax}_E`] || 0} readOnly />
                          <span className="light-label">J{i+1}-E</span><input className="light-input" value={errorData[`J${i+1}_E`] || 0} readOnly />
                          <span className="light-label">{ax}-Er</span><input className="light-input" value={errorData[`${ax}_Er`] || 0} readOnly />
                          <span className="light-label">J{i+1}-Er</span><input className="light-input" value={errorData[`J${i+1}_Er`] || 0} readOnly />
                          <span className="light-label">{extras[i]}</span><input className="light-input" value={errorData[extras[i]] || 0} readOnly />
                      </React.Fragment>
                  ))}
              </div>
          </div>
      );
  };

  const renderEtherCat = () => {
      const rows = [1,2,3,4,5,6,7];
      return (
          <div className="light-panel">
              <div className="ether-cat-grid">
                  {rows.map(r => (
                      <React.Fragment key={r}>
                          <span className="light-label">state {r}</span><input className="light-input" value={etherData[`state_${r}`] || 0} readOnly />
                          <span className="light-label">AI_state {r}</span><input className="light-input" value={etherData[`AI_state_${r}`] || 0} readOnly />
                          <span className="light-label">status {r}</span><input className="light-input" value={etherData[`status_${r}`] || 0} readOnly />
                          <span className="light-label">et_error {r}</span><input className="light-input" value={etherData[`et_error_${r}`] || 0} readOnly />
                      </React.Fragment>
                  ))}
              </div>
          </div>
      );
  };

  const renderIOModules = () => (
      <div className="light-panel">
          <div className="io-modules-wrapper">
              <div className="io-module-box">
                  <div className="io-module-title" style={{ borderColor: '#4CAF50' }}>DIGITAL INPUTS (DI 1-16)</div>
                  <div className="io-module-flex">
                      {[...Array(16)].map((_, i) => (
                          <div key={i} className="io-led-col">
                              <div className={`io-led ${(diVal >> i) & 1 ? 'on' : 'off'}`}></div>
                              <span>{i + 1}</span>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="io-module-box">
                  <div className="io-module-title" style={{ borderColor: '#039BE5' }}>DIGITAL OUTPUTS (DO 1-16)</div>
                  <div className="io-module-flex">
                      {[...Array(16)].map((_, i) => (
                          <div key={i} className="io-led-col">
                              <div className={`io-led ${(doVal >> i) & 1 ? 'on' : 'off'}`}></div>
                              <span>{i + 1}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderEncoderOffset = () => (
      <div className="light-panel">
          <div className="encoder-offset-grid">
              {[1,2,3,4,5,6].map(i => (
                  <React.Fragment key={i}>
                      <span className="light-label" style={{textAlign: 'left'}}>J{i}-Encoder Pos</span>
                      <input className="light-input" readOnly placeholder="0" />
                      <span className="light-label" style={{textAlign: 'left'}}>J{i}-Encoder Offset</span>
                      <input className="light-input" placeholder="0" />
                      <button className="light-btn" onClick={() => sendCommand('ZERO_AXIS', i)}>J{i} - Zero</button>
                      <input className="light-input" placeholder="0" />
                  </React.Fragment>
              ))}
          </div>
      </div>
  );

  const renderSettingsView = () => (
      <div className="light-panel">
          <div className="settings-view-grid">
              <span className="light-label">Ace_tm %</span><input className="light-input" style={{background: '#00E676', color: '#000'}} defaultValue="50"/>
              <span className="light-label">Dec sp %</span><input className="light-input" defaultValue="100"/>
              <span className="light-label">Dec_tm %</span><input className="light-input" defaultValue="50"/>
              <span className="light-label">Init_vel %</span><input className="light-input" defaultValue="0"/>
              <span className="light-label">Ace sp %</span><input className="light-input" defaultValue="100"/>
              <span className="light-label">end_vel %</span><input className="light-input" defaultValue="0"/>
          </div>
          <button className="light-btn" style={{marginTop: '25px', width: '120px', padding: '8px'}}>Ok</button>
      </div>
  );

  const renderDataVariable = () => (
      <div className="light-panel">
          <div className="data-var-wrapper">
              <div className="data-var-col">
                  <div className="data-var-title">Output Monitor</div>
                  <div className="data-var-flex">
                      <select className="light-input" onChange={(e) => sendCommand("SET_VAR_OUTPUT_SELECTOR", e.target.value)}>
                            {VAR_MONITOR_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <input className="light-input" style={{ color: 'blue', background: '#e0e0e0', textAlign: 'center' }} value={variableData.outputValue || "0"} readOnly />
                  </div>
              </div>
              <div className="data-var-col">
                  <div className="data-var-title">Input Control</div>
                  <div className="data-var-flex">
                      <select className="light-input" onChange={(e) => sendCommand("SET_VAR_INPUT_SELECTOR", e.target.value)}>
                            {VAR_MONITOR_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <input className="light-input" placeholder="Value" onBlur={(e) => sendCommand("SET_VAR_INPUT_VALUE", e.target.value)} />
                  </div>
              </div>
              <div className="data-var-col no-border">
                  <div className="data-var-title">Instruction No.</div>
                  <div className="data-var-flex">
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>Inst #</span>
                      <input className="light-input" placeholder="#" onBlur={(e) => sendCommand("SET_VAR_INST_NUMBER", e.target.value)} />
                  </div>
              </div>
          </div>
      </div>
  );

  const renderAxisLimit = () => (
      <div className="light-panel">
          <div className="axis-limit-wrapper">
              <div className="data-var-col">
                  <div className="data-var-title">Digital Outputs</div>
                  <div className="axis-limit-grid">
                      <span className="light-label">Digital Out</span><input className="light-input" />
                      <span className="light-label">Analog 1</span><input className="light-input" />
                      <span className="light-label">Analog 2</span><input className="light-input" />
                  </div>
              </div>
              <div className="data-var-col">
                  <div className="data-var-title">Digital Inputs</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button className="light-btn">High_1</button><button className="light-btn">low_1</button>
                      <button className="light-btn">High_2</button><button className="light-btn">low_2</button>
                      <button className="light-btn">test_1</button>
                  </div>
              </div>
              <div className="data-var-col no-border" style={{ flex: 1.4 }}>
                  <div className="data-var-title">Simulation</div>
                  <div className="sim-grid">
                      <span className="light-label">DI Sim:</span>
                      <select className="light-input" onChange={(e) => sendCommand("SET_SIM_DI_NUMBER", e.target.value)}>
                           {DI_SIM_NUM_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <select className="light-input" onChange={(e) => sendCommand("SET_SIM_DI_STATE", e.target.value)}>
                           {SIM_STATE_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <span className="light-label">DO Sim:</span>
                      <select className="light-input" onChange={(e) => sendCommand("SET_SIM_DO_NUMBER", e.target.value)}>
                           {DO_SIM_NUM_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <select className="light-input" onChange={(e) => sendCommand("SET_SIM_DO_STATE", e.target.value)}>
                           {SIM_STATE_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <span className="light-label">Remote:</span><button className="light-btn">rem_h</button><button className="light-btn">rem_l</button>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderMechSettings = () => (
      <div className="light-panel" style={{ padding: 0 }}>
          <table className="mech-table">
              <thead>
                  <tr>
                      <th></th><th>Dh-nal</th><th>Encod</th><th>Gear R</th><th>deg c</th><th>couple</th><th>joint min</th><th>joint max</th>
                  </tr>
              </thead>
              <tbody>
                  {['l1', 'l2', 'l3', 'l4', 'l5', 'l6'].map((row, rIndex) => (
                      <tr key={row}>
                          <td style={{fontWeight: '900', fontSize: '0.8rem'}}>{row}</td>
                          <td><input className="light-input" defaultValue={mechData[`dh_${rIndex}`] || ''} onBlur={e => sendCommand("UPDATE_MECH_SETTING", "", {column_type: "dh", row_index: rIndex, value: e.target.value})} /></td>
                          <td><input className="light-input" defaultValue={mechData[`enc_${rIndex}`] || ''} onBlur={e => sendCommand("UPDATE_MECH_SETTING", "", {column_type: "enc", row_index: rIndex, value: e.target.value})} /></td>
                          <td><input className="light-input" defaultValue={mechData[`gear_${rIndex}`] || ''} onBlur={e => sendCommand("UPDATE_MECH_SETTING", "", {column_type: "gear", row_index: rIndex, value: e.target.value})} /></td>
                          <td><input className="light-input" defaultValue={mechData[`degc_${rIndex}`] || ''} onBlur={e => sendCommand("UPDATE_MECH_SETTING", "", {column_type: "degc", row_index: rIndex, value: e.target.value})} /></td>
                          <td><input className="light-input" defaultValue={mechData[`couple_${rIndex}`] || ''} onBlur={e => sendCommand("UPDATE_MECH_SETTING", "", {column_type: "couple", row_index: rIndex, value: e.target.value})} /></td>
                          <td><input className="light-input" defaultValue={mechData[`jmin_${rIndex}`] || ''} onBlur={e => sendCommand("UPDATE_MECH_SETTING", "", {column_type: "jmin", row_index: rIndex, value: e.target.value})} /></td>
                          <td><input className="light-input" defaultValue={mechData[`jmax_${rIndex}`] || ''} onBlur={e => sendCommand("UPDATE_MECH_SETTING", "", {column_type: "jmax", row_index: rIndex, value: e.target.value})} /></td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );

  const renderSpeedConfig = () => (
    <div className="speed-config-container">
      <div className="speed-config-title">SPEED SETTINGS</div>
      <div className="speed-config-body">
        <div className="fluid-speed-row"><span className="fluid-speed-label">MM</span><select className="fluid-speed-input" value={mmIncVal} onChange={(e)=>{setMmIncVal(e.target.value); sendCommand("SET_MM_INC", e.target.value)}}>{MM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
        <div className="fluid-speed-row"><span className="fluid-speed-label">MM/S</span><input type="number" className="fluid-speed-input" value={mmSpeedText} onChange={(e) => setMmSpeedText(e.target.value)} onBlur={applyMmSpeed} /></div>
        <div className="fluid-speed-row"><span className="fluid-speed-label">DEG</span><select className="fluid-speed-input" value={degIncVal} onChange={(e)=>{setDegIncVal(e.target.value); sendCommand("SET_DEG_INC", e.target.value)}}>{DEG_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
        <div className="fluid-speed-row"><span className="fluid-speed-label">DEG/S</span><input type="number" className="fluid-speed-input" value={degSpeedText} onChange={(e) => setDegSpeedText(e.target.value)} onBlur={applyDegSpeed} /></div>
        <div className="fluid-speed-row"><span className="fluid-speed-label">FRAME</span><select className="fluid-speed-input" value={frameVal} onChange={(e)=>{setFrameVal(e.target.value); sendCommand("SET_FRAME", e.target.value)}}>{FRAME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
        <div className="fluid-speed-row">
          <span className="fluid-speed-label">SPEED</span>
          <div className="speed-range-group">
              <input type="range" min="1" max="100" value={globalSpeed} onChange={(e) => setGlobalSpeed(e.target.value)} onMouseUp={handleGlobalSpeedChange} onTouchEnd={handleGlobalSpeedChange} />
              <input type="number" className="fluid-speed-input" value={globalSpeed} onChange={handleGlobalSpeedChange} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderJogPanel = () => {
    if (isJoints) {
        return (
          <div className="jog-panel-container">
            <div className="jog-panel-title">JOINTS CONTROL</div>
            <div className="joints-two-col-layout">
              {/* Column 1: J1, J2, J3 */}
              <div className="joints-col">
                 <div className="joints-col-title">BASE / ARM</div>
                 {['J1', 'J2', 'J3'].map(id => {
                     const ax = { id, m: `${id}-`, p: `${id}+` };
                     return (
                         <div key={ax.id} className="joint-industrial-block">
                             <button className="jib-btn text-neg" onPointerDown={()=>handlePointerDown(ax.m)} onPointerUp={()=>handlePointerUp(ax.m)} onPointerLeave={()=>handlePointerUp(ax.m)}>{ax.id}-</button>
                             <div className="jib-label">{ax.id}</div>
                             <button className="jib-btn text-pos" onPointerDown={()=>handlePointerDown(ax.p)} onPointerUp={()=>handlePointerUp(ax.p)} onPointerLeave={()=>handlePointerUp(ax.p)}>{ax.id}+</button>
                         </div>
                     )
                 })}
              </div>
              <div className="joints-divider"></div>
              {/* Column 2: J4, J5, J6 */}
              <div className="joints-col">
                 <div className="joints-col-title">WRIST</div>
                 {['J4', 'J5', 'J6'].map(id => {
                     const ax = { id, m: `${id}-`, p: `${id}+` };
                     return (
                         <div key={ax.id} className="joint-industrial-block">
                             <button className="jib-btn text-neg" onPointerDown={()=>handlePointerDown(ax.m)} onPointerUp={()=>handlePointerUp(ax.m)} onPointerLeave={()=>handlePointerUp(ax.m)}>{ax.id}-</button>
                             <div className="jib-label">{ax.id}</div>
                             <button className="jib-btn text-pos" onPointerDown={()=>handlePointerDown(ax.p)} onPointerUp={()=>handlePointerUp(ax.p)} onPointerLeave={()=>handlePointerUp(ax.p)}>{ax.id}+</button>
                         </div>
                     )
                 })}
              </div>
            </div>
          </div>
        );
    } else {
        return (
          <div className="jog-panel-container">
            <div className="jog-panel-title">CARTESIAN D-PAD</div>
            <div className="dpad-two-col-layout">
                {/* Column 1: TRANSLATION */}
                <div className="dpad-col">
                    <div className="dpad-col-title">TRANSLATION</div>
                    <div className="dpad-cross">
                        <button className="dpad-btn dpad-up text-pos" onPointerDown={()=>handlePointerDown('Y+')} onPointerUp={()=>handlePointerUp('Y+')} onPointerLeave={()=>handlePointerUp('Y+')}>Y+</button>
                        <button className="dpad-btn dpad-left text-neg" onPointerDown={()=>handlePointerDown('X-')} onPointerUp={()=>handlePointerUp('X-')} onPointerLeave={()=>handlePointerUp('X-')}>X-</button>
                        <div className="dpad-center">XYZ</div>
                        <button className="dpad-btn dpad-right text-pos" onPointerDown={()=>handlePointerDown('X+')} onPointerUp={()=>handlePointerUp('X+')} onPointerLeave={()=>handlePointerUp('X+')}>X+</button>
                        <button className="dpad-btn dpad-down text-neg" onPointerDown={()=>handlePointerDown('Y-')} onPointerUp={()=>handlePointerUp('Y-')} onPointerLeave={()=>handlePointerUp('Y-')}>Y-</button>
                    </div>
                    <div className="dpad-z-row">
                        <button className="dpad-btn text-neg" onPointerDown={()=>handlePointerDown('Z-')} onPointerUp={()=>handlePointerUp('Z-')} onPointerLeave={()=>handlePointerUp('Z-')}>Z-</button>
                        <button className="dpad-btn text-pos" onPointerDown={()=>handlePointerDown('Z+')} onPointerUp={()=>handlePointerUp('Z+')} onPointerLeave={()=>handlePointerUp('Z+')}>Z+</button>
                    </div>
                </div>
                <div className="joints-divider"></div>
                {/* Column 2: ROTATION */}
                <div className="dpad-col">
                    <div className="dpad-col-title">ROTATION</div>
                    <div className="dpad-cross">
                        <button className="dpad-btn dpad-up text-pos" onPointerDown={()=>handlePointerDown('Ry+')} onPointerUp={()=>handlePointerUp('Ry+')} onPointerLeave={()=>handlePointerUp('Ry+')}>Ry+</button>
                        <button className="dpad-btn dpad-left text-neg" onPointerDown={()=>handlePointerDown('Rx-')} onPointerUp={()=>handlePointerUp('Rx-')} onPointerLeave={()=>handlePointerUp('Rx-')}>Rx-</button>
                        <div className="dpad-center">ROT</div>
                        <button className="dpad-btn dpad-right text-pos" onPointerDown={()=>handlePointerDown('Rx+')} onPointerUp={()=>handlePointerUp('Rx+')} onPointerLeave={()=>handlePointerUp('Rx+')}>Rx+</button>
                        <button className="dpad-btn dpad-down text-neg" onPointerDown={()=>handlePointerDown('Ry-')} onPointerUp={()=>handlePointerUp('Ry-')} onPointerLeave={()=>handlePointerUp('Ry-')}>Ry-</button>
                    </div>
                    <div className="dpad-z-row">
                        <button className="dpad-btn text-neg" onPointerDown={()=>handlePointerDown('Rz-')} onPointerUp={()=>handlePointerUp('Rz-')} onPointerLeave={()=>handlePointerUp('Rz-')}>Rz-</button>
                        <button className="dpad-btn text-pos" onPointerDown={()=>handlePointerDown('Rz+')} onPointerUp={()=>handlePointerUp('Rz+')} onPointerLeave={()=>handlePointerUp('Rz+')}>Rz+</button>
                    </div>
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {showModTpModal && (
        <div className="modal-overlay">
            <div className="modal-box">
                <div className="modal-title">MODIFY TP</div>
                <div className="modal-divider"></div>
                <input type="text" className="modal-input" placeholder="TP Name" value={modTpData.name} onChange={e => setModTpData({...modTpData, name: e.target.value})} />
                <input type="number" className="modal-input" placeholder="X Value (mm)" value={modTpData.x} onChange={e => setModTpData({...modTpData, x: e.target.value})} />
                <input type="number" className="modal-input" placeholder="Y Value (mm)" value={modTpData.y} onChange={e => setModTpData({...modTpData, y: e.target.value})} />
                <input type="number" className="modal-input" placeholder="Z Value (mm)" value={modTpData.z} onChange={e => setModTpData({...modTpData, z: e.target.value})} />
                <div className="modal-btn-row">
                    <button className="modal-btn modal-btn-cancel" onClick={() => setShowModTpModal(false)}>Cancel</button>
                    <button className="modal-btn modal-btn-confirm" onClick={handleModifyConfirm}>Confirm</button>
                </div>
            </div>
        </div>
      )}

      {isCalculating && (
        <div className="modal-overlay calc-modal">
            <div className="modal-box calc-box">
                <div className="calc-glow"></div>
                <div className="spinner-outer"><div className="spinner-inner"></div></div>
                <div className="calc-text">
                    <div className="calc-title">CALCULATING TRAJECTORY</div>
                    <div className="calc-desc">Please wait while the robotic<br/>path is being generated...</div>
                </div>
                <button className="tp-btn btn-red" style={{ width: '150px', height: '40px', marginTop: '10px' }} onClick={() => sendCommand('CANCEL_CALCULATION')}>FORCE CANCEL</button>
            </div>
        </div>
      )}

      <div className="rp-master-container">
        <div className="rp-main-content">
            
            {/* UPPER HALF WRAPPER */}
            <div className="rp-upper-half">
                
                {/* ROW 1 */}
                <div className={`rp-row-1 ${expandedRowPanel === 'ROW1' ? 'row-maximized' : expandedRowPanel === 'ROW2' ? 'row-minimized' : ''}`}>
                    <div className="rp-header-col">
                        <RightHeader onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} currentMode={currentView} isOpen={isSidebarOpen} />
                    </div>
                    
                    <div className="rp-content-col" style={{ display: expandedRowPanel === 'ROW2' ? 'none' : 'flex' }}>
                        <div className={`rp-panel-left ${currentView === 'SPEED CONFIG' ? 'bg-dark' : 'bg-light-dark'}`}>
                            {currentView === 'SPEED CONFIG' ? renderSpeedConfig() : renderJogPanel()}
                        </div>
                        <div className="rp-panel-right">
                            
                            <div className="dark-tabs">
                                {['Error Pos', 'Ether Cat', 'IO Modules', 'Graph'].map(tab => (
                                    <div key={tab} className={`dark-tab ${activeRow1Tab === tab ? 'active' : ''}`} onClick={() => setActiveRow1Tab(tab)}>
                                        {tab}
                                    </div>
                                ))}
                                {/* ROW 1 MAX/MIN BUTTON */}
                                <div className="panel-min-max-btn" onClick={() => setExpandedRowPanel(expandedRowPanel === 'ROW1' ? 'NONE' : 'ROW1')}>
                                    {expandedRowPanel === 'ROW1' ? '>< MIN' : '[ ] MAX'}
                                </div>
                            </div>
                            
                            <div className="row2-content">
                                {activeRow1Tab === 'Error Pos' && renderErrorPos()}
                                {activeRow1Tab === 'Ether Cat' && renderEtherCat()}
                                {activeRow1Tab === 'IO Modules' && renderIOModules()}
                                
                                {/* --> NEW: GRAPH VIEW RENDERING <-- */}
                                {activeRow1Tab === 'Graph' && renderGraphView()}
                                
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROW 2 */}
                <div className={`rp-row-2 ${expandedRowPanel === 'ROW2' ? 'row-maximized' : expandedRowPanel === 'ROW1' ? 'row-minimized' : ''}`}>
                    <div className="dark-tabs bg-dark-deep">
                        {['Programs File', 'Encoder Offset', 'Settings View', 'Data Variable', 'Axis Limit', 'Mech Settings'].map(tab => (
                            <div key={tab} className={`dark-tab ${activeRow2Tab === tab ? 'active' : ''}`} onClick={() => setActiveRow2Tab(tab)}>
                                {tab}
                            </div>
                        ))}
                        {/* ROW 2 MAX/MIN BUTTON */}
                        <div className="panel-min-max-btn" onClick={() => setExpandedRowPanel(expandedRowPanel === 'ROW2' ? 'NONE' : 'ROW2')}>
                            {expandedRowPanel === 'ROW2' ? '>< MIN' : '[ ] MAX'}
                        </div>
                    </div>
                    
                    <div className="row2-content" style={{ display: expandedRowPanel === 'ROW1' ? 'none' : 'flex' }}>
                        {activeRow2Tab === 'Programs File' && (
                            <div className="table-container" style={{ gap: expandedTable === 'NONE' ? '4px' : '0' }}>
                                {(expandedTable === 'NONE' || expandedTable === 'TP') && (
                                    <div className="table-wrapper">
                                        <MemoizedTpTableBody tpList={tpList} expandedTable={expandedTable} selectedTpIndex={selectedTpIndex} onRowClick={handleTpRowClick} />
                                        {tpList.length > 0 && (
                                            <div className="min-max-btn" onClick={() => setExpandedTable(expandedTable === 'TP' ? 'NONE' : 'TP')}> {expandedTable === 'TP' ? '><' : '[ ]'} </div>
                                        )}
                                    </div>
                                )}

                                {(expandedTable === 'NONE' || expandedTable === 'PR') && (
                                    <div className="table-wrapper" style={{ borderLeft: expandedTable === 'NONE' ? '2px solid #202430' : 'none' }}>
                                        <MemoizedPrTableBody prList={prList} expandedTable={expandedTable} selectedPrIndex={selectedPrIndex} onRowClick={handlePrRowClick} />
                                        {prList.length > 0 && (
                                            <div className="min-max-btn" onClick={() => setExpandedTable(expandedTable === 'PR' ? 'NONE' : 'PR')}> {expandedTable === 'PR' ? '><' : '[ ]'} </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        {activeRow2Tab === 'Encoder Offset' && renderEncoderOffset()}
                        {activeRow2Tab === 'Settings View' && renderSettingsView()}
                        {activeRow2Tab === 'Data Variable' && renderDataVariable()}
                        {activeRow2Tab === 'Axis Limit' && renderAxisLimit()}
                        {activeRow2Tab === 'Mech Settings' && renderMechSettings()}
                    </div>
                </div>
            
            </div>

            <div className="rp-row-3">
                <div className="grid-7-col">
                    <div className="rel-flex">
                        <button className="tp-btn btn-blue" onClick={() => toggleDropdown('TP_MODE')}>⚙ {displayTpMode}</button>
                        {openDropdown === 'TP_MODE' && (
                            <div className="dropdown-menu">
                                <button className="dd-btn dd-blue" onClick={() => handleTpModeSelect('TP Mode', 'Tp')}>⚙ TP Mode</button>
                                <button className="dd-btn dd-blue" onClick={() => handleTpModeSelect('MOVJ', 'MOVJ')}>⚙ MOVJ</button>
                                <button className="dd-btn dd-blue" onClick={() => handleTpModeSelect('MOVL', 'MOVL')}>⚙ MOVL</button>
                            </div>
                        )}
                    </div>
                    
                    <div className="rel-flex">
                        <button className="tp-btn btn-purple" onClick={() => toggleDropdown('TP')}>⚙ TP</button>
                        {openDropdown === 'TP' && (
                            <div className="dropdown-menu">
                                <button className="dd-btn dd-purple" onClick={() => { sendCommand('INSERT_TP'); setOpenDropdown(null); }}>⚙ Insert TP</button>
                                <button className="dd-btn dd-purple" onClick={openModifyTpModal}>📄 Modify TP</button>
                                <button className="dd-btn dd-red" onClick={() => { sendCommand('DELETE_TP_INDEX', selectedTpIndex); setOpenDropdown(null); }}>⎋ Delete TP</button>
                            </div>
                        )}
                    </div>
                    
                    <button className="tp-btn btn-green" onClick={() => sendCommand('RUN_TP')}>▶ Run TP</button>
                    <button className="tp-btn btn-dark" onClick={() => {}}>📄 Op Pg</button>
                    <input className="tp-standalone-input" value={rs.program_count_output || '0'} readOnly />
                    
                    <div className="rel-flex">
                        <button className="tp-btn btn-purple" onClick={() => toggleDropdown('INST')}>📄 Inst</button>
                        {openDropdown === 'INST' && (
                            <div className="dropdown-menu inst-qty-input-dropdown">
                                <div className="gap-flex">
                                    <input type="text" placeholder="S..." value={instInput} onChange={e => setInstInput(e.target.value)} className="inst-qty-input" />
                                    <button className="dd-btn dd-purple f1" onClick={() => { sendCommand(instInput ? 'INSERT_PR_INSTRUCTION_AT' : 'INSERT_PR_INSTRUCTION', instInput); setOpenDropdown(null); }}>📄 Insert</button>
                                </div>
                                <button className="dd-btn dd-purple" onClick={() => { setOpenDropdown(null); }}>📄 Modify Inst</button>
                                <button className="dd-btn dd-red" onClick={() => { sendCommand('DELETE_PR_INSTRUCTION'); setOpenDropdown(null); }}>⎋ Delete Inst</button>
                            </div>
                        )}
                    </div>
                    
                    <button className="tp-btn btn-green" onClick={() => sendCommand('RUN_PROGRAM')}>▶ Run Inst</button>
                </div>
                
                <div className="grid-7-col">
                    <button className="tp-btn btn-dark" onClick={() => sendCommand("SET_PROGRAM_INPUT", ipPgInput)}>📄 Ip Pg</button>
                    <input className="tp-standalone-input" value={ipPgInput} onChange={(e) => setIpPgInput(e.target.value)} />
                    <button className="tp-btn btn-dark" onClick={() => sendCommand("SET_TP_NAME", tpNameVal)}>🏷 Tp name</button>
                    <input className="tp-standalone-input" value={tpNameVal} onChange={(e) => setTpNameVal(e.target.value)} />
                    <button className="tp-btn btn-dark" onClick={() => sendCommand("SET_PROGRAM_COMMENT", comVal)}>🌍 Com</button>
                    <input className="tp-standalone-input" value={comVal} onChange={(e) => setComVal(e.target.value)} />
                    <button className="tp-btn btn-teal" onClick={() => sendCommand('CALCULATE_TRAJECTORY')}>🧮 Calc Traj</button>
                </div>
            </div>

            <div className="rp-row-4">
                <div className="dark-tabs bg-dark-deep">
                    {['Inst', 'Debug', 'Jog Deg'].map(tab => (
                        <div key={tab} className={`dark-tab ${activeRow4Tab === tab ? 'active' : ''}`} onClick={() => setActiveRow4Tab(tab)}>
                            {tab}
                        </div>
                    ))}
                </div>
                
                <div className="row2-content">
                    {activeRow4Tab === 'Inst' && (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>S.No</th><th>Inst</th><th>Name</th><th>Value 1</th><th>Deg 1</th>
                                        <th>Name</th><th>Value 2</th><th>Deg 2</th><th>Speed</th>
                                        <th>Radius</th><th>Frame</th><th>Tool</th><th>Comment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td><td>{staging.instruction || '--'}</td><td>{staging.name1 || '--'}</td><td>{staging.value1 || '--'}</td>
                                        <td>{staging.deg1 || '--'}</td><td>{staging.name2 || '--'}</td><td>{staging.value2 || '--'}</td><td>{staging.deg2 || '--'}</td>
                                        <td>{staging.speed || '--'}</td><td>--</td><td>--</td><td>--</td><td>{staging.comment || '--'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeRow4Tab === 'Debug' && (
                        <div className="light-panel" style={{ display: 'flex', gap: '8px', padding: '10px' }}>
                             <button className="debug-btn debug-red" style={{width: '90px'}} onClick={() => sendCommand('TOGGLE_START')}>Start_Stop</button>
                             <button className="debug-btn" style={{width: '70px'}} onClick={() => {}}>Step</button>
                             <button className="debug-btn" style={{width: '70px'}} onClick={() => sendCommand('EXIT')}>Exit</button>
                             <div style={{width: '10px'}}></div>
                             <button className="debug-btn" style={{width: '80px'}} onClick={() => {}}>Jump In</button>
                             <button className="debug-btn" style={{width: '80px'}} onClick={() => {}}>Jump Out</button>
                             <button className="debug-btn" style={{fontWeight: '900', border: '2px solid black'}} onClick={() => sendCommand('SET_GOTO_PROGRAM', debugGoto)}>go to</button>
                             <input className="light-input" style={{width: '60px', textAlign: 'center'}} value={debugGoto} onChange={e => setDebugGoto(e.target.value)} />
                             <button className="debug-btn" style={{width: '60px'}} onClick={() => {}}>prv</button>
                        </div>
                    )}

                    {activeRow4Tab === 'Jog Deg' && (
                        <div className="light-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', fontStyle: 'italic' }}>
                            Jog Degrees not set
                        </div>
                    )}
                </div>
            </div>

            <div className="rp-row-5">
                <div className="grid-11-col">
                    <select className="tp-standalone-input" onChange={(e) => sendCommand("SET_INSTRUCTION_TYPE", e.target.value)}>
                        {INST_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select className="tp-standalone-input" onChange={(e) => sendCommand("SET_DIGI_1", e.target.value)}>
                        {DI_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select className="tp-standalone-input" onChange={(e) => sendCommand("SET_DIGI_2", e.target.value)}>
                        {DI2_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <button className="tp-btn btn-dark" onClick={() => sendCommand('CONFIRM_HIGH_LOW')}># H/L</button>
                    <select className="tp-standalone-input" onChange={(e) => sendCommand("SET_HIGH_LOW", e.target.value)}>
                        {DIG_STATE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <button className="tp-btn btn-dark" onClick={() => sendCommand('SET_DELAY', delayVal)}>⏱ delay</button>
                    <input className="tp-standalone-input" value={delayVal} onChange={e => setDelayVal(e.target.value)} />
                    <button className="tp-btn btn-dark" onClick={() => sendCommand('SET_GOTO_PROGRAM', gotoVal)}>→ go to</button>
                    <input className="tp-standalone-input" value={gotoVal} onChange={e => setGotoVal(e.target.value)} />
                    <button className="tp-btn btn-dark" onClick={() => sendCommand('SET_LOOP', loopVal)}>↺ loop</button>
                    <input className="tp-standalone-input" value={loopVal} onChange={e => setLoopVal(e.target.value)} />
                </div>
                <div className="grid-11-col">
                    <button className="tp-btn btn-dark" onClick={() => sendCommand('SET_PROGRAM_SPEED', progSpeedVal)}>⏱ mm/s</button>
                    <input className="tp-standalone-input" value={progSpeedVal} onChange={e => setProgSpeedVal(e.target.value)} />
                    <button className="tp-btn btn-dark" onClick={() => {}}>🎯 Radius</button>
                    <input className="tp-standalone-input" value={radiusVal} onChange={e => setRadiusVal(e.target.value)} />
                    <select className="tp-standalone-input" onChange={(e) => sendCommand("SET_VAR1", e.target.value)}>
                        {VAR1_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <input className="tp-standalone-input" value={varInputVal} onChange={e => setVarInputVal(e.target.value)} onBlur={(e) => sendCommand('SET_VAR_VAL', e.target.value)} />
                    <select className="tp-standalone-input" onChange={(e) => sendCommand("SET_VAR2", e.target.value)}>
                        {VAR2_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <button className="tp-btn btn-dark" onClick={() => {}}>🌍 AN ip</button>
                    <input className="tp-standalone-input" value={anIpVal} onChange={e => setAnIpVal(e.target.value)} />
                    <button className="tp-btn btn-dark" onClick={() => {}}>🌍 AN op</button>
                    <input className="tp-standalone-input" value={anOpVal} onChange={e => setAnOpVal(e.target.value)} />
                </div>
            </div>

        </div>
        
        <RightMenuSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onSelectView={setCurrentView} activeView={currentView} />
      </div>
    </>
  );
};

export default RightPart;