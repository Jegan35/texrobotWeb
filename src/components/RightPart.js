import React, { useState, useEffect, useCallback, memo } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import RightHeader from './RightHeader';
import RightMenuSidebar from './RightMenuSidebar';

// --- DATA MODELS ---
const INST_OPTIONS = ["Inst", "MOVJ", "MOVJ_dg", "MOVL", "MOVC", "MVLEX_Deg", "MVLEX_mm", "Pallet_Matrix", "Num_of_row", "Num_of_colm", "pos_add_x", "pos_add_y", "pos_add_z", "delay_ms", "go_to", "loop", "Start If", "End If", "Start-Con", "End-Con", "Wait", "DI-1", "DI-2", "DI-3", "DI-4", "DI-5", "DI-6", "DI-7", "DI-8", "DI-9", "DI-10", "DI-11", "DI-12", "DI-13", "DI-14", "DI-15", "DI-16", "DO-1", "DO-2", "DO-3", "DO-4", "DO-5", "DO-6", "DO-7", "DO-8", "DO-9", "DO-10", "DO-11", "DO-12", "DO-13", "DO-14", "DO-15", "DO-16", "AI-1", "AI-2", "AI-3", "AI-4", "AO-1", "AO-2", "AO-3", "AO-4", "DI-1 Chk", "DI-2 Chk", "DI-3 Chk", "DI-4 Chk", "DI-5 Chk", "DI-6 Chk", "DI-7 Chk", "DI-8 Chk", "DI-9 Chk", "DI-10 Chk", "DI-11 Chk", "DI-12 Chk", "DI-13 Chk", "DI-14 Chk", "DI-15 Chk", "DI-16 Chk", "DI-1 Un Chk", "DI-2 Un Chk", "DI-3 Un Chk", "DI-4 Un Chk", "DI-5 Un Chk", "DI-6 Un Chk", "DI-7 Un Chk", "DI-8 Un Chk", "DI-9 Un Chk", "DI-10 Un Chk", "DI-11 Un Chk", "DI-12 Un Chk", "DI-13 Un Chk", "DI-14 Un Chk", "DI-15 Un Chk", "DI-16 Un Chk", "= Assign", "== Equal", "!= Not Eql", "<", ">", "<=", ">=", "+", "-", "&", "stop", "Servo off"];
const DI_OPTIONS = ["Di-1", "D-1", "D-2", "D-3", "D-4", "D-5", "D-6", "D-7", "D-8", "D-9", "D-10", "D-11", "D-12", "D-13", "D-14", "D-15", "D-16"];
const DI2_OPTIONS = ["Di-2", "D-1", "D-2", "D-3", "D-4", "D-5", "D-6", "D-7", "D-8", "D-9", "D-10", "D-11", "D-12", "D-13", "D-14", "D-15", "D-16"];
const DIG_STATE_OPTIONS = ["Dig-state", "High", "Low"];
const VAR1_OPTIONS = ["Vr_1", "V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-7", "V-8", "V-9", "V-10", "AI-1", "AI-2", "AI-3", "AI-4", "AO-1", "AO-2", "AO-3", "AO-4"];
const VAR2_OPTIONS = ["Vr_2", "V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-7", "V-8", "V-9", "V-10", "AI-1", "AI-2", "AI-3", "AI-4", "AO-1", "AO-2", "AO-3", "AO-4"];
const MM_OPTIONS = ["mm", "50", "25", "15", "10", "5", "2", "1", "0.1", "0.01", "0.001"];
const DEG_OPTIONS = ["deg", "20", "15", "10", "5", "2", "1", "0.1", "0.01", "0.001", "0.0001"];
const FRAME_OPTIONS = ["frames", "Base", "Tool", "User"];

const MemoizedTpTableBody = memo(({ tpList, expandedTable, selectedTpIndex, onRowClick }) => {
    if (tpList.length === 0) {
        return <tbody><tr><td colSpan={expandedTable === 'TP' ? "7" : "4"} className="empty-table-text">Please open a Target Point file</td></tr></tbody>;
    }
    return (
        <tbody>
            {tpList.map((item, i) => (
                <tr key={i} className={`tr-hover ${i === selectedTpIndex ? "tr-blue" : ""}`} onClick={() => onRowClick(i)}>
                    <td>{i + 1}</td>
                    <td>{item.name || `tp${i+1}`}</td>
                    <td>{item.value || ''}</td>
                    {expandedTable === 'TP' && (
                        <>
                            <td>{item.deg || '--'}</td>
                            <td>{item.tool !== undefined ? item.tool : '--'}</td>
                            <td>{item.frame !== undefined ? item.frame : '--'}</td>
                        </>
                    )}
                    <td></td> 
                </tr>
            ))}
        </tbody>
    );
});

const MemoizedPrTableBody = memo(({ prList, expandedTable, selectedPrIndex, onRowClick }) => {
    if (prList.length === 0) {
        return <tbody><tr><td colSpan={expandedTable === 'PR' ? "13" : "5"} className="empty-table-text">Please open a Program file</td></tr></tbody>;
    }
    return (
        <tbody>
            {prList.map((item, i) => (
                <tr key={i} className={`tr-hover ${i === selectedPrIndex ? "tr-blue" : ""}`} onClick={() => onRowClick(i)}>
                    <td>{i + 1}</td>
                    <td>{item.inst || 'MOVL'}</td>
                    <td>{item.name || ''}</td>
                    <td>{item.value || ''}</td>
                    {expandedTable === 'PR' && (
                        <>
                            <td>{item.speed || '--'}</td>
                            <td>{item.deg || '--'}</td>
                            <td>{item.rad || '--'}</td>
                            <td>{item.tool || '--'}</td>
                            <td>{item.frame || '--'}</td>
                            <td>{item.comt || '--'}</td>
                            <td>{item.dist || '--'}</td>
                            <td>{item.time || '--'}</td>
                        </>
                    )}
                    <td></td>
                </tr>
            ))}
        </tbody>
    );
});

const RightPart = () => {
  const { sendCommand, robotState } = useWebSocket();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('JOG JOINTS');

  const [expandedTable, setExpandedTable] = useState('NONE'); 
  const [openDropdown, setOpenDropdown] = useState(null);
  const [instInput, setInstInput] = useState('');
  const [displayTpMode, setDisplayTpMode] = useState('TP Mode');
  const [selectedTpIndex, setSelectedTpIndex] = useState(0);
  const [selectedPrIndex, setSelectedPrIndex] = useState(0);
  const [showModTpModal, setShowModTpModal] = useState(false);
  const [modTpData, setModTpData] = useState({ name: '', x: '', y: '', z: '' });
  const [activeRow2Tab, setActiveRow2Tab] = useState('Programs File');

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
  
  // --- ADDED MISSING VARIABLE ---
  const isCalculating = rs.is_calculating_trajectory === true;

  useEffect(() => { if (rs.tp_run_mode) setDisplayTpMode(rs.tp_run_mode); }, [rs.tp_run_mode]);
  useEffect(() => { if (rs.current_tp_name && rs.current_tp_name !== "None") setTpNameVal(rs.current_tp_name); }, [rs.current_tp_name]);

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

  // --- FIXED: ENCODER OFFSET VIEW ---
  const renderEncoderOffset = () => (
      <div className="light-panel" style={{ padding: '15px 25px', overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'max-content minmax(80px, 1fr) max-content minmax(80px, 1fr) max-content minmax(80px, 1fr)', gap: '12px 25px', alignItems: 'center', minWidth: '700px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 100px auto 100px', gap: '15px 30px', alignItems: 'center' }}>
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
      <div className="light-panel" style={{ display: 'flex', gap: '20px', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, borderRight: '1px solid #ccc', paddingRight: '15px' }}>
              <div style={{ fontWeight: '900', marginBottom: '15px', textAlign: 'center', color: '#333' }}>Output Monitor</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                  <select className="light-input"><option>V-1</option></select>
                  <input className="light-input" style={{ color: 'blue', background: '#e0e0e0', textAlign: 'center' }} value="0" readOnly />
              </div>
          </div>
          <div style={{ flex: 1, borderRight: '1px solid #ccc', paddingRight: '15px' }}>
              <div style={{ fontWeight: '900', marginBottom: '15px', textAlign: 'center', color: '#333' }}>Input Control</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                  <select className="light-input"><option>V-1</option></select>
                  <input className="light-input" placeholder="Value" />
              </div>
          </div>
          <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '900', marginBottom: '15px', textAlign: 'center', color: '#333' }}>Instruction No.</div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>Inst #</span>
                  <input className="light-input" placeholder="#" />
              </div>
          </div>
      </div>
  );

  const renderAxisLimit = () => (
      <div className="light-panel" style={{ display: 'flex', gap: '15px', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, borderRight: '1px solid #ccc', paddingRight: '10px' }}>
              <div style={{ fontWeight: '900', marginBottom: '15px', color: '#333' }}>Digital Outputs</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', alignItems: 'center' }}>
                  <span className="light-label">Digital Out</span><input className="light-input" />
                  <span className="light-label">Analog 1</span><input className="light-input" />
                  <span className="light-label">Analog 2</span><input className="light-input" />
              </div>
          </div>
          <div style={{ flex: 1, borderRight: '1px solid #ccc', paddingRight: '10px' }}>
              <div style={{ fontWeight: '900', marginBottom: '15px', color: '#333' }}>Digital Inputs</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button className="light-btn">High_1</button><button className="light-btn">low_1</button>
                  <button className="light-btn">High_2</button><button className="light-btn">low_2</button>
                  <button className="light-btn">test_1</button>
              </div>
          </div>
          <div style={{ flex: 1.2 }}>
              <div style={{ fontWeight: '900', marginBottom: '15px', color: '#333' }}>Simulation</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                  <span className="light-label">DI Sim:</span><select className="light-input"><option>DI</option></select><select className="light-input"><option>State</option></select>
                  <span className="light-label">DO Sim:</span><select className="light-input"><option>DO</option></select><select className="light-input"><option>State</option></select>
                  <span className="light-label">Remote:</span><button className="light-btn">rem_h</button><button className="light-btn">rem_l</button>
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
                  {['l1', 'l2', 'l3', 'l4', 'l5', 'l6'].map(row => (
                      <tr key={row}>
                          <td style={{fontWeight: '900', fontSize: '0.8rem'}}>{row}</td>
                          <td><input className="light-input" /></td>
                          <td><input className="light-input" /></td>
                          <td><input className="light-input" /></td>
                          <td><input className="light-input" /></td>
                          <td><input className="light-input" /></td>
                          <td><input className="light-input" /></td>
                          <td><input className="light-input" /></td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );

  const renderSpeedConfig = () => (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100%', background: '#1a1e29', padding: '15px 10px', color: 'white', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 'clamp(12px, 1.8cqw, 16px)', fontWeight: '900', letterSpacing: '1px', marginBottom: '20px', color: '#00bcd4', textAlign: 'center', flexShrink: 0 }}>SPEED SETTINGS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, minHeight: 'min-content' }}>
        <div className="fluid-speed-row"><span className="fluid-speed-label">MM</span><select className="fluid-speed-input" value={mmIncVal} onChange={(e)=>{setMmIncVal(e.target.value); sendCommand("SET_MM_INC", e.target.value)}}>{MM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
        <div className="fluid-speed-row"><span className="fluid-speed-label">MM/S</span><input type="number" className="fluid-speed-input" value={mmSpeedText} onChange={(e) => setMmSpeedText(e.target.value)} onBlur={applyMmSpeed} /></div>
        <div className="fluid-speed-row"><span className="fluid-speed-label">DEG</span><select className="fluid-speed-input" value={degIncVal} onChange={(e)=>{setDegIncVal(e.target.value); sendCommand("SET_DEG_INC", e.target.value)}}>{DEG_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
        <div className="fluid-speed-row"><span className="fluid-speed-label">DEG/S</span><input type="number" className="fluid-speed-input" value={degSpeedText} onChange={(e) => setDegSpeedText(e.target.value)} onBlur={applyDegSpeed} /></div>
        <div className="fluid-speed-row"><span className="fluid-speed-label">FRAME</span><select className="fluid-speed-input" value={frameVal} onChange={(e)=>{setFrameVal(e.target.value); sendCommand("SET_FRAME", e.target.value)}}>{FRAME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
        <div className="fluid-speed-row">
          <span className="fluid-speed-label">SPEED</span>
          <div style={{ display: 'flex', width: '60%', alignItems: 'center', gap: '0.5cqw', minWidth: 0 }}>
              <input type="range" min="1" max="100" value={globalSpeed} onChange={(e) => setGlobalSpeed(e.target.value)} onMouseUp={handleGlobalSpeedChange} onTouchEnd={handleGlobalSpeedChange} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} />
              <input type="number" className="fluid-speed-input" style={{ flex: '0 0 40%', padding: '4px' }} value={globalSpeed} onChange={handleGlobalSpeedChange} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderJogPanel = () => {
    const axes = isJoints 
        ? [{m:'J1-',p:'J1+'}, {m:'J2-',p:'J2+'}, {m:'J3-',p:'J3+'}, {m:'J4-',p:'J4+'}, {m:'J5-',p:'J5+'}, {m:'J6-',p:'J6+'}]
        : [{m:'X-',p:'X+'}, {m:'Y-',p:'Y+'}, {m:'Z-',p:'Z+'}, {m:'Rx-',p:'Rx+'}, {m:'Ry-',p:'Ry+'}, {m:'Rz-',p:'Rz+'}];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100%', background: '#151822', padding: '10px 0.5cqw', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', fontSize: 'clamp(10px, 1.6cqw, 14px)', fontWeight: '900', color: '#00bcd4', paddingBottom: '10px', letterSpacing: '1px', flexShrink: 0 }}>{motionType} CONTROLS</div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '200px' }}>
          {axes.map(ax => (
            <div key={ax.m} style={{ display: 'flex', gap: '1cqw', flex: 1, minHeight: '30px', marginBottom: '4px' }}>
              <button className="pro-jog-btn neg" onPointerDown={()=>handlePointerDown(ax.m)} onPointerUp={()=>handlePointerUp(ax.m)} onPointerLeave={()=>handlePointerUp(ax.m)}><span className="btn-txt">{ax.m.slice(0, -1)}</span><span className="btn-sym">-</span></button>
              <button className="pro-jog-btn pos" onPointerDown={()=>handlePointerDown(ax.p)} onPointerUp={()=>handlePointerUp(ax.p)} onPointerLeave={()=>handlePointerUp(ax.p)}><span className="btn-txt">{ax.p.slice(0, -1)}</span><span className="btn-sym">+</span></button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .rp-master-container { display: flex; flex-direction: row; height: 100vh; width: 100%; background-color: #202430; overflow: hidden; }
        .rp-main-content { display: flex; flex-direction: column; flex: 1; min-width: 0; min-height: 0; height: 100%; transition: width 0.2s; container-type: size; overflow: hidden; }

        .rp-row-1 { flex: 30 1 0; display: flex; flex-direction: column; border-bottom: 2px solid #111; overflow: hidden; background: #f4f3ef; min-height: 0; }
        .rp-row-2 { flex: 30 1 0; display: flex; flex-direction: column; border-bottom: 2px solid #111; overflow: hidden; background: #f4f3ef; min-height: 0; } 
        .rp-row-3 { flex: 10 1 0; display: flex; flex-direction: column; justify-content: center; background: #202430; padding: 4px 1cqw; overflow: visible; min-height: 0; position: relative; z-index: 50; }
        .rp-row-4 { flex: 21 1 0; display: flex; flex-direction: column; border-bottom: 2px solid #111; overflow: hidden; background: #f4f3ef; min-height: 0; position: relative; z-index: 10; } 
        .rp-row-5 { flex: 9 1 0; display: flex; flex-direction: column; justify-content: center; background: #1a1e29; padding: 0.5cqh 1cqw; overflow: hidden; min-height: 0; }

        .row2-content { flex: 1; overflow: auto; background: #f4f3ef; color: #111; }
        .light-panel { padding: 10px 15px; font-size: 0.75rem; background: #f4f3ef; }
        .light-input { border: 1px solid #aaa; padding: 4px 6px; border-radius: 2px; width: 100%; box-sizing: border-box; font-weight: 900; font-size: 0.75rem; color: #111; background: #fff; outline: none; }
        .light-input:focus { border-color: #039BE5; background: #e3f2fd; }
        .light-btn { background: #fff; border: 1px solid #888; padding: 4px 10px; cursor: pointer; font-weight: 900; text-align: center; border-radius: 4px; box-shadow: 0 2px 0 rgba(0,0,0,0.1); color: #333; font-size: 0.75rem; transition: 0.1s; white-space: nowrap; }
        .light-btn:active { transform: translateY(2px); box-shadow: none; }
        .light-label { font-weight: 900; text-align: right; padding-right: 5px; white-space: nowrap; align-self: center; color: #333; font-size: 0.75rem; }
        
        .mech-table { width: 100%; border-collapse: collapse; text-align: center; }
        .mech-table th { border: 1px solid #ccc; padding: 6px; font-size: 0.75rem; background: #e0e0e0; color: #111; position: sticky; top: 0; }
        .mech-table td { padding: 3px 5px; border: 1px solid #ddd; }
        .mech-table input { width: 100%; box-sizing: border-box; text-align: center; border: 1px solid #ccc; padding: 4px; font-weight: 900; font-size: 0.75rem; }

        .fluid-speed-row { display: flex; align-items: center; justify-content: space-between; flex: 1; min-height: 25px; }
        .fluid-speed-label { font-size: clamp(10px, 1.5cqw, 14px); font-weight: bold; color: #ccc; white-space: nowrap; }
        .fluid-speed-input { width: 60%; min-width: 0; background: #fff; color: #111; border: none; border-radius: 4px; padding: 4px 6px; font-size: clamp(10px, 1.5cqw, 14px); font-weight: bold; outline: none; }

        .pro-jog-btn { flex: 1; min-width: 0; min-height: 0; display: flex; justify-content: space-between; align-items: center; padding: 0 1.5cqw; margin: 2px 0; border-radius: 6px; border: none; font-weight: 900; color: white; font-size: clamp(10px, 1.8cqw, 18px); cursor: pointer; box-shadow: 0 3px 6px rgba(0,0,0,0.4); transition: 0.1s; }
        .pro-jog-btn.neg { background: linear-gradient(135deg, #e53935, #b71c1c); border-bottom: 4px solid #7f0000; }
        .pro-jog-btn.pos { background: linear-gradient(135deg, #43a047, #1b5e20); border-bottom: 4px solid #003300; }
        .pro-jog-btn:active { transform: translateY(2px); border-bottom-width: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); }
        .btn-txt { opacity: 0.9; }
        .btn-sym { font-size: 1.2em; font-weight: 900; text-shadow: 0 2px 2px rgba(0,0,0,0.3); }

        .dark-tabs { display: flex; background: #1a1e29; padding-top: 5px; padding-left: 0.5cqw; border-bottom: 2px solid #00bcd4; overflow: hidden; flex-shrink: 0; }
        .dark-tab { padding: 6px 1cqw; color: #aaa; font-weight: bold; font-size: clamp(9px, 1.2cqw, 13px); cursor: pointer; border-radius: 4px 4px 0 0; white-space: nowrap; }
        .dark-tab.active { background: #202430; color: #00bcd4; border: 1px solid #444; border-bottom: none; }

        .table-container { flex: 1; display: flex; flexDirection: row; min-height: 0; padding: 0; background: #2b303b; }
        .table-wrapper { flex: 1; overflow-y: auto; overflow-x: auto; display: block; background: #fff; width: 100%; }
        .table-wrapper::-webkit-scrollbar { width: 14px; height: 14px; }
        .table-wrapper::-webkit-scrollbar-track { background: #1a1e29; border-radius: 0px; }
        .table-wrapper::-webkit-scrollbar-thumb { background: #00bcd4; border-radius: 7px; border: 2px solid #1a1e29; }
        .table-wrapper::-webkit-scrollbar-thumb:hover { background: #039BE5; }
        
        .data-table { width: 100%; min-width: max-content; border-collapse: collapse; font-weight: bold; background: white; border: 1px solid #ccc; text-align: center; }
        .data-table th, .data-table td { padding: 8px 10px; font-size: clamp(10px, 1.2vw, 15px); border: 1px solid #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 80px; height: 40px; }
        .data-table th { background: #e0e0e0; color: #111; position: sticky; top: 0; z-index: 5; box-shadow: 0 2px 2px rgba(0,0,0,0.1); }
        .data-table td { color: #333; }
        .tr-blue { background-color: #bbdefb !important; }
        .tr-hover:hover { background-color: #e3f2fd; cursor: pointer; }
        
        .empty-table-text { color: #aaa; font-style: italic; font-weight: normal; padding: 30px !important; height: auto !important; }
        .data-table th:first-child, .data-table td:first-child { min-width: 45px; width: 45px; }
        .min-max-btn { background: #2196f3 !important; color: white !important; cursor: pointer; transition: 0.2s; font-weight: 900; position: sticky; right: 0; z-index: 10 !important; width: 50px; min-width: 50px; text-align: center; box-shadow: -2px 0 5px rgba(0,0,0,0.2); }
        .min-max-btn:hover { background: #0b7dda !important; }

        .var-grid { display: grid; grid-template-columns: repeat(7, max-content minmax(15px, 1fr)); gap: 2px 4px; align-items: center; height: 100%; padding-right: 5px; }
        .var-label { font-size: clamp(6px, 0.8vw, 11px); font-weight: bold; color: #333; text-align: right; white-space: nowrap; margin-right: 1px; }
        .var-input { width: 100%; height: 85%; min-width: 0; border: 1px solid #ccc; padding: 0 2px; font-size: clamp(6px, 0.8vw, 11px); text-align: center; outline: none; box-sizing: border-box; }

        .btn-row-flex { display: flex; flex-wrap: nowrap; gap: 4px; align-items: stretch; flex: 1; overflow: visible; padding-bottom: 2px; }
        
        .tp-btn { 
            flex: 1; min-width: 0; height: 100%; min-height: 26px; border: none; border-radius: 4px; 
            color: white; font-weight: 900; font-size: clamp(7px, 0.8vw, 11px); cursor: pointer; 
            display: flex; align-items: center; justify-content: center; gap: 4px; white-space: nowrap; 
            overflow: hidden; text-overflow: ellipsis; border: 1px solid rgba(0,0,0,0.8);
            box-shadow: 0 2px 0 rgba(0,0,0,0.4), 0 3px 3px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.2);
            transition: 0.1s; text-transform: uppercase; letter-spacing: 0.5px; text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        }
        .tp-btn:active { transform: translateY(2px); box-shadow: 0 0 0 rgba(0,0,0,0.8), inset 0 2px 3px rgba(0,0,0,0.5); }
        
        .btn-blue { background: linear-gradient(180deg, #42A5F5 0%, #0D47A1 100%); box-shadow: 0 2px 0 #002171, 0 3px 3px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); }
        .btn-purple { background: linear-gradient(180deg, #BA68C8 0%, #6A1B9A 100%); box-shadow: 0 2px 0 #4A148C, 0 3px 3px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); }
        .btn-green { background: linear-gradient(180deg, #4CAF50 0%, #1B5E20 100%); box-shadow: 0 2px 0 #003300, 0 3px 3px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); }
        .btn-teal { background: linear-gradient(180deg, #26A69A 0%, #00695C 100%); box-shadow: 0 2px 0 #003D33, 0 3px 3px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); }
        .btn-dark { background: linear-gradient(180deg, #505868 0%, #2b303b 100%); box-shadow: 0 2px 0 #151822, 0 3px 3px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); }
        .btn-red { background: linear-gradient(180deg, #EF5350 0%, #B71C1C 100%); box-shadow: 0 2px 0 #7F0000, 0 3px 3px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); }

        .tp-standalone-input {
            flex: 1; min-width: 0; height: 100%; min-height: 26px;
            background: #fff; border: 2px solid rgba(0,0,0,0.8); border-radius: 4px;
            text-align: center; font-weight: 900; font-size: clamp(8px, 1vw, 12px);
            color: #111; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
            transition: 0.2s; padding: 0 2px; cursor: pointer;
        }
        .tp-standalone-input:focus { border-color: #039BE5; background: #e1f5fe; }
        
        .dropdown-menu {
            position: absolute; bottom: 120%; left: 0; width: 100%; min-width: 140px; 
            background: #1e222b; border: 2px solid #333; z-index: 2000; border-radius: 6px; 
            padding: 6px; display: flex; flex-direction: column; gap: 6px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.9);
        }
        .dd-btn {
            width: 100%; padding: 10px 6px; border: 1px solid rgba(0,0,0,0.8); border-radius: 4px; 
            font-weight: 900; color: white; cursor: pointer; text-transform: uppercase; font-size: clamp(8px, 0.9vw, 12px);
            box-shadow: 0 3px 0 rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2); transition: 0.1s; 
            display: flex; align-items: center; justify-content: center; gap: 6px; text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        }
        .dd-btn:active { transform: translateY(3px); box-shadow: 0 0 0 rgba(0,0,0,0); }
        .dd-blue { background: linear-gradient(180deg, #42A5F5 0%, #0D47A1 100%); }
        .dd-purple { background: linear-gradient(180deg, #BA68C8 0%, #6A1B9A 100%); }
        .dd-red { background: linear-gradient(180deg, #EF5350 0%, #B71C1C 100%); }
        
        @keyframes spinClockwise { 100% { transform: rotate(360deg); } }
        @keyframes spinCounter { 100% { transform: rotate(-360deg); } }
        
        .spinner-outer { width: 64px; height: 64px; border-radius: 50%; border: 4px solid transparent; border-top-color: #039BE5; border-right-color: #039BE5; animation: spinClockwise 1s linear infinite; position: relative; }
        .spinner-inner { position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border-radius: 50%; border: 4px solid transparent; border-bottom-color: #4CAF50; border-left-color: #4CAF50; animation: spinCounter 1.5s linear infinite; }
      `}</style>

      {showModTpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#202430', borderTop: '4px solid #8e24aa', borderRadius: '8px', padding: '20px', width: '320px', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
                <div style={{ color: 'white', fontWeight: '900', textAlign: 'center', fontSize: '1.1rem', letterSpacing: '1px' }}>MODIFY TP</div>
                <div style={{ height: '1px', backgroundColor: '#333', width: '100%', marginBottom: '5px' }}></div>
                
                <input type="text" placeholder="TP Name" value={modTpData.name} onChange={e => setModTpData({...modTpData, name: e.target.value})} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'bold', fontSize: '0.9rem', outline: 'none' }} />
                <input type="number" placeholder="X Value (mm)" value={modTpData.x} onChange={e => setModTpData({...modTpData, x: e.target.value})} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'bold', fontSize: '0.9rem', outline: 'none' }} />
                <input type="number" placeholder="Y Value (mm)" value={modTpData.y} onChange={e => setModTpData({...modTpData, y: e.target.value})} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'bold', fontSize: '0.9rem', outline: 'none' }} />
                <input type="number" placeholder="Z Value (mm)" value={modTpData.z} onChange={e => setModTpData({...modTpData, z: e.target.value})} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'bold', fontSize: '0.9rem', outline: 'none' }} />
                
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button style={{ flex: 1, padding: '12px', backgroundColor: '#E53935', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }} onClick={() => setShowModTpModal(false)}>Cancel</button>
                    <button style={{ flex: 1, padding: '12px', backgroundColor: '#43A047', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }} onClick={handleModifyConfirm}>Confirm</button>
                </div>
            </div>
        </div>
      )}

      {isCalculating && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#202430', border: '1px solid #3B3B50', borderRadius: '12px', padding: '30px', width: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', boxShadow: '0 0 20px rgba(3,155,229,0.3)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: -1, left: -1, right: -1, bottom: -1, border: '2px solid #039BE5', borderRadius: '13px', opacity: 0.5, pointerEvents: 'none' }}></div>
                <div className="spinner-outer"><div className="spinner-inner"></div></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: 'white', fontWeight: '900', fontSize: '1.1rem', letterSpacing: '1.5px' }}>CALCULATING TRAJECTORY</div>
                    <div style={{ color: '#90A4AE', fontSize: '0.85rem', textAlign: 'center', lineHeight: '1.4' }}>Please wait while the robotic<br/>path is being generated...</div>
                </div>
                <button className="tp-btn btn-red" style={{ width: '150px', height: '40px', marginTop: '10px' }} onClick={() => sendCommand('CANCEL_CALCULATION')}>FORCE CANCEL</button>
            </div>
        </div>
      )}

      <div className="rp-master-container">
        <div className="rp-main-content">
            
            <div className="rp-row-1">
                <div style={{ flex: '0 0 15%', minHeight: 0, overflow: 'hidden' }}>
                    <RightHeader onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} currentMode={currentView} isOpen={isSidebarOpen} />
                </div>
                <div style={{ flex: '0 0 85%', display: 'flex', minHeight: 0, overflow: 'hidden' }}>
                    <div style={{ flex: '0 0 30%', minWidth: 0, display: 'flex', flexDirection: 'column', borderRight: '2px solid #111', background: currentView === 'SPEED CONFIG' ? '#1a1e29' : '#151822', overflowY: 'auto', overflowX: 'hidden' }}>
                        {currentView === 'SPEED CONFIG' ? renderSpeedConfig() : renderJogPanel()}
                    </div>
                    <div style={{ flex: '0 0 70%', display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                        <div className="dark-tabs">
                            <div className="dark-tab active">Error Pos</div>
                            <div className="dark-tab">Ether Cat</div>
                            <div className="dark-tab">IO Modules</div>
                            <div className="dark-tab">Graph</div>
                        </div>
                        <div className="table-container" style={{ padding: '5px 1cqw', overflow: 'hidden' }}>
                            <div className="var-grid">
                                {['X','Y','Z','a','b','c'].map(axis => (
                                    <React.Fragment key={axis}>
                                        <span className="var-label">{axis}-S</span><input className="var-input" defaultValue="0"/>
                                        <span className="var-label">J{['X','Y','Z','a','b','c'].indexOf(axis)+1}-S</span><input className="var-input" defaultValue="0"/>
                                        <span className="var-label">{axis}-E</span><input className="var-input" defaultValue="0"/>
                                        <span className="var-label">J{['X','Y','Z','a','b','c'].indexOf(axis)+1}-E</span><input className="var-input" defaultValue="0"/>
                                        <span className="var-label">{axis}-Er</span><input className="var-input" defaultValue="0"/>
                                        <span className="var-label">J{['X','Y','Z','a','b','c'].indexOf(axis)+1}-Er</span><input className="var-input" defaultValue="0"/>
                                        <span className="var-label">Sp In</span><input className="var-input" defaultValue="0"/>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rp-row-2">
                <div className="dark-tabs" style={{ background: '#202430' }}>
                    {['Programs File', 'Encoder Offset', 'Settings View', 'Data Variable', 'Axis Limit', 'Mech Settings'].map(tab => (
                        <div key={tab} className={`dark-tab ${activeRow2Tab === tab ? 'active' : ''}`} onClick={() => setActiveRow2Tab(tab)}>
                            {tab}
                        </div>
                    ))}
                </div>
                
                <div className="row2-content" style={{ display: 'flex', flexDirection: 'column' }}>
                    {activeRow2Tab === 'Programs File' && (
                        <div className="table-container" style={{ gap: expandedTable === 'NONE' ? '4px' : '0' }}>
                            {(expandedTable === 'NONE' || expandedTable === 'TP') && (
                                <div className="table-wrapper">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>S.No</th><th>Name</th><th>Value</th>
                                                {expandedTable === 'TP' && (<><th>Deg</th><th>Tool</th><th>Frame</th></>)}
                                                <th className="min-max-btn" onClick={() => setExpandedTable(expandedTable === 'TP' ? 'NONE' : 'TP')}> {expandedTable === 'TP' ? '><' : '[ ]'} </th>
                                            </tr>
                                        </thead>
                                        <MemoizedTpTableBody tpList={tpList} expandedTable={expandedTable} selectedTpIndex={selectedTpIndex} onRowClick={handleTpRowClick} />
                                    </table>
                                </div>
                            )}

                            {(expandedTable === 'NONE' || expandedTable === 'PR') && (
                                <div className="table-wrapper" style={{ borderLeft: expandedTable === 'NONE' ? '2px solid #202430' : 'none' }}>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>S.No</th><th>Inst</th><th>Name</th><th>Value</th>
                                                {expandedTable === 'PR' && (<><th>Speed</th><th>Deg</th><th>Rad</th><th>Tool</th><th>Frame</th><th>Com</th><th>Dist</th><th>Time</th></>)}
                                                <th className="min-max-btn" onClick={() => setExpandedTable(expandedTable === 'PR' ? 'NONE' : 'PR')}> {expandedTable === 'PR' ? '><' : '[ ]'} </th>
                                            </tr>
                                        </thead>
                                        <MemoizedPrTableBody prList={prList} expandedTable={expandedTable} selectedPrIndex={selectedPrIndex} onRowClick={handlePrRowClick} />
                                    </table>
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

            <div className="rp-row-3">
                <div className="btn-row-flex">
                    <div style={{ position: 'relative', flex: 1, display: 'flex', minWidth: 0 }}>
                        <button className="tp-btn btn-blue" onClick={() => toggleDropdown('TP_MODE')}>⚙ {displayTpMode}</button>
                        {openDropdown === 'TP_MODE' && (
                            <div className="dropdown-menu">
                                <button className="dd-btn dd-blue" onClick={() => handleTpModeSelect('TP Mode', 'Tp')}>⚙ TP Mode</button>
                                <button className="dd-btn dd-blue" onClick={() => handleTpModeSelect('MOVJ', 'MOVJ')}>⚙ MOVJ</button>
                                <button className="dd-btn dd-blue" onClick={() => handleTpModeSelect('MOVL', 'MOVL')}>⚙ MOVL</button>
                            </div>
                        )}
                    </div>
                    <div style={{ position: 'relative', flex: 1, display: 'flex', minWidth: 0 }}>
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
                    <div style={{ position: 'relative', flex: 1, display: 'flex', minWidth: 0 }}>
                        <button className="tp-btn btn-purple" onClick={() => toggleDropdown('INST')}>📄 Inst</button>
                        {openDropdown === 'INST' && (
                            <div className="dropdown-menu" style={{ width: '200px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" placeholder="S..." value={instInput} onChange={e => setInstInput(e.target.value)} style={{ width: '50px', textAlign: 'center', borderRadius: '4px', border: '1px solid #111', fontWeight: '900', fontSize: '0.9rem', outline: 'none' }} />
                                    <button className="dd-btn dd-purple" style={{ flex: 1 }} onClick={() => { sendCommand(instInput ? 'INSERT_PR_INSTRUCTION_AT' : 'INSERT_PR_INSTRUCTION', instInput); setOpenDropdown(null); }}>📄 Insert Inst</button>
                                </div>
                                <button className="dd-btn dd-purple" onClick={() => { setOpenDropdown(null); }}>📄 Modify Inst</button>
                                <button className="dd-btn dd-red" onClick={() => { sendCommand('DELETE_PR_INSTRUCTION'); setOpenDropdown(null); }}>⎋ Delete Inst</button>
                            </div>
                        )}
                    </div>
                    <button className="tp-btn btn-green" onClick={() => sendCommand('RUN_PROGRAM')}>▶ Run Inst</button>
                </div>
                <div className="btn-row-flex">
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
                <div className="dark-tabs" style={{ background: '#202430' }}>
                    <div className="dark-tab active">Inst</div>
                    <div className="dark-tab">Debug</div>
                    <div className="dark-tab">Jog Deg</div>
                </div>
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
                                <td>1</td>
                                <td>{staging.instruction || '--'}</td>
                                <td>{staging.name1 || '--'}</td>
                                <td>{staging.value1 || '--'}</td>
                                <td>{staging.deg1 || '--'}</td>
                                <td>{staging.name2 || '--'}</td>
                                <td>{staging.value2 || '--'}</td>
                                <td>{staging.deg2 || '--'}</td>
                                <td>{staging.speed || '--'}</td>
                                <td>--</td>
                                <td>--</td>
                                <td>--</td>
                                <td>{staging.comment || '--'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="rp-row-5" style={{ padding: '4px 1cqw', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div className="btn-row-flex" style={{ gap: '4px' }}>
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
                <div className="btn-row-flex" style={{ gap: '4px' }}>
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
        <RightMenuSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onSelectView={setCurrentView} />
      </div>
    </>
  );
};

export default RightPart;