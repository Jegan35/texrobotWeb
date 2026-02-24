import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import RightHeader from './RightHeader';
import RightMenuSidebar from './RightMenuSidebar';

const MM_OPTIONS = ["mm", "50", "25", "15", "10", "5", "2", "1", "0.1", "0.01", "0.001"];
const DEG_OPTIONS = ["deg", "20", "15", "10", "5", "2", "1", "0.1", "0.01", "0.001", "0.0001"];
const FRAME_OPTIONS = ["frames", "Base", "Tool", "User"];

const RightPart = () => {
  const { sendCommand, robotState } = useWebSocket();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('JOG JOINTS');

  // --- MAXIMIZE & ROW 3 STATES ---
  const [expandedTable, setExpandedTable] = useState('NONE'); 
  const [openDropdown, setOpenDropdown] = useState(null);
  const [instInput, setInstInput] = useState('');

  // --- NEW: ROW SELECTION STATES ---
  const [selectedTpIndex, setSelectedTpIndex] = useState(0);
  const [selectedPrIndex, setSelectedPrIndex] = useState(0);

  // --- MODIFY TP MODAL STATES ---
  const [showModTpModal, setShowModTpModal] = useState(false);
  const [modTpData, setModTpData] = useState({ name: '', x: '', y: '', z: '' });

  // --- ROW 3 INPUT STATES ---
  const [ipPgInput, setIpPgInput] = useState('0');
  const [tpNameVal, setTpNameVal] = useState('0');
  const [comVal, setComVal] = useState('0');

  const [globalSpeed, setGlobalSpeed] = useState(50);
  const [frameVal, setFrameVal] = useState(FRAME_OPTIONS[0]);
  const [mmIncVal, setMmIncVal] = useState(MM_OPTIONS[0]);
  const [degIncVal, setDegIncVal] = useState(DEG_OPTIONS[0]);
  const [mmSpeedText, setMmSpeedText] = useState("50.0");
  const [degSpeedText, setDegSpeedText] = useState("50.0");

  const isJog = currentView.includes('JOG');
  const isJoints = currentView.includes('JOINTS');
  const motionType = isJog ? 'JOG' : 'MOVE';

  // --- FILE DATA FROM BACKEND ---
  const rs = robotState || {};
  const tpList = rs.tp_list || [];
  const prList = rs.pr_program_data || [];
  const tpRunMode = rs.tp_run_mode || 'TP Mode';

  useEffect(() => {
      if (rs.current_tp_name && rs.current_tp_name !== "None") {
          setTpNameVal(rs.current_tp_name);
      }
  }, [rs.current_tp_name]);

  const handlePointerDown = (axis) => sendCommand(motionType === 'JOG' ? "BTN_PRESS" : "BTN_CLICK", axis);
  const handlePointerUp = (axis) => { if (motionType === 'JOG') sendCommand("BTN_RELEASE", axis); };

  const handleGlobalSpeedChange = (e) => { setGlobalSpeed(e.target.value); sendCommand("SET_GLOBAL_SPEED", e.target.value); };
  const applyMmSpeed = () => sendCommand("SET_MM_SPEED", mmSpeedText);
  const applyDegSpeed = () => sendCommand("SET_DEG_SPEED", degSpeedText);

  const toggleDropdown = (menu) => {
      setOpenDropdown(openDropdown === menu ? null : menu);
  };

  // --- NEW: ROW CLICK HANDLERS ---
  const handleTpRowClick = (index) => {
      setSelectedTpIndex(index);
      sendCommand('SELECT_TP_INDEX', index);
  };

  const handlePrRowClick = (index) => {
      setSelectedPrIndex(index);
      sendCommand('SELECT_PR_ROW', index);
  };

  // --- SMART MODIFY TP HANDLER ---
  const openModifyTpModal = () => {
      const item = tpList[selectedTpIndex] || {};
      let cx = '', cy = '', cz = '';
      
      // Extract X, Y, Z from the backend string (e.g., "x:100.0 y:200.0 z:300.0")
      if (item.value) {
          const matchX = item.value.match(/x:([-\d.]+)/);
          const matchY = item.value.match(/y:([-\d.]+)/);
          const matchZ = item.value.match(/z:([-\d.]+)/);
          if (matchX) cx = matchX[1];
          if (matchY) cy = matchY[1];
          if (matchZ) cz = matchZ[1];
      }
      
      setModTpData({ name: item.name || '', x: cx, y: cy, z: cz });
      setShowModTpModal(true);
      setOpenDropdown(null);
  };

  const handleModifyConfirm = () => {
      sendCommand('MODIFY_TP', '', { name: modTpData.name, x: modTpData.x, y: modTpData.y, z: modTpData.z });
      setShowModTpModal(false);
  };

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
        .rp-row-2 { flex: 38 1 0; display: flex; flex-direction: column; border-bottom: 2px solid #111; overflow: hidden; background: #f4f3ef; min-height: 0; }
        .rp-row-3 { flex: 10 1 0; display: flex; flex-direction: column; justify-content: center; background: #202430; padding: 4px 1cqw; overflow: visible; min-height: 0; position: relative; z-index: 50; }
        .rp-row-4 { flex: 13 1 0; display: flex; flex-direction: column; border-bottom: 2px solid #111; overflow: hidden; background: #f4f3ef; min-height: 0; position: relative; z-index: 10; }
        .rp-row-5 { flex: 9 1 0; display: flex; flex-direction: column; justify-content: center; background: #1a1e29; padding: 0.5cqh 1cqw; overflow: hidden; min-height: 0; }

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
        .dark-tab { padding: 6px 1cqw; color: #aaa; font-weight: bold; font-size: clamp(10px, 1.4cqw, 14px); cursor: pointer; border-radius: 4px 4px 0 0; white-space: nowrap; }
        .dark-tab.active { background: #202430; color: #00bcd4; border: 1px solid #444; border-bottom: none; }

        .table-container { flex: 1; display: flex; flexDirection: row; min-height: 0; padding: 0; background: #2b303b; }
        .table-wrapper { flex: 1; overflow: auto; display: block; background: #fff; }
        .table-wrapper::-webkit-scrollbar { width: 14px; height: 14px; }
        .table-wrapper::-webkit-scrollbar-track { background: #1a1e29; border-radius: 0px; }
        .table-wrapper::-webkit-scrollbar-thumb { background: #00bcd4; border-radius: 7px; border: 2px solid #1a1e29; }
        .table-wrapper::-webkit-scrollbar-thumb:hover { background: #039BE5; }
        
        .data-table { width: 100%; border-collapse: collapse; font-weight: bold; background: white; border: 1px solid #ccc; text-align: center; }
        .data-table th, .data-table td { padding: 5px 6px; font-size: clamp(9px, 1vw, 13px); border: 1px solid #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 65px; height: 35px; }
        .data-table th { background: #e0e0e0; color: #111; position: sticky; top: 0; z-index: 5; box-shadow: 0 2px 2px rgba(0,0,0,0.1); }
        .data-table td { color: #333; }
        
        /* THE ROW HIGHLIGHT COLOR (Active Selection) */
        .tr-blue { background-color: #bbdefb !important; }
        .tr-hover:hover { background-color: #e3f2fd; cursor: pointer; }
        
        .empty-table-text { color: #aaa; font-style: italic; font-weight: normal; padding: 20px !important; height: auto !important; }
        .data-table th:first-child, .data-table td:first-child { min-width: 40px; width: 40px; }
        .min-max-btn { background: #2196f3 !important; color: white !important; cursor: pointer; transition: 0.2s; font-weight: 900; position: sticky; right: 0; z-index: 10 !important; width: 45px; min-width: 45px; text-align: center; box-shadow: -2px 0 5px rgba(0,0,0,0.2); }
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

        .tp-standalone-input {
            flex: 1; min-width: 0; height: 100%; min-height: 26px;
            background: #fff; border: 2px solid rgba(0,0,0,0.8); border-radius: 4px;
            text-align: center; font-weight: 900; font-size: clamp(8px, 1vw, 12px);
            color: #111; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
            transition: 0.2s;
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

        .ft-select { flex: 1; min-width: 0; height: 100%; background: #333; color: white; border: 1px solid #555; padding: 0 0.5cqw; border-radius: 4px; font-size: clamp(7px, 1.3cqw, 12px); font-weight: bold; outline: none; }
        .ft-group { flex: 1; min-width: 0; height: 100%; display: flex; background: #333; border: 1px solid #555; border-radius: 4px; overflow: hidden; }
        .ft-label { padding: 0 0.5cqw; color: white; font-size: clamp(7px, 1.3cqw, 12px); font-weight: bold; background: #4b5563; white-space: nowrap; display: flex; align-items: center; }
        .ft-input { flex: 1; min-width: 0; height: 100%; border: none; text-align: center; font-size: clamp(7px, 1.3cqw, 12px); font-weight: bold; outline: none; }
      `}</style>

      {/* ==========================================
          MODIFY TP MODAL OVERLAY
          ========================================== */}
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
                    <div className="dark-tab active">Programs File</div>
                    <div className="dark-tab">Encoder Offset</div>
                    <div className="dark-tab">Settings View</div>
                    <div className="dark-tab">Data Variable</div>
                    <div className="dark-tab">Axis Limit</div>
                </div>
                
                <div className="table-container" style={{ gap: expandedTable === 'NONE' ? '4px' : '0' }}>
                    
                    {/* LEFT TABLE: Target Points (NOW CLICKABLE WITH STATE SELECTION) */}
                    {(expandedTable === 'NONE' || expandedTable === 'TP') && (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Name</th>
                                        <th>Value</th>
                                        {expandedTable === 'TP' && (
                                            <>
                                                <th>Deg</th>
                                                <th>Tool</th>
                                                <th>Frame</th>
                                            </>
                                        )}
                                        <th className="min-max-btn" onClick={() => setExpandedTable(expandedTable === 'TP' ? 'NONE' : 'TP')} title={expandedTable === 'TP' ? "Minimize" : "Maximize"}>
                                            {expandedTable === 'TP' ? '><' : '[ ]'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tpList.length === 0 ? (
                                        <tr><td colSpan={expandedTable === 'TP' ? "7" : "4"} className="empty-table-text">Please open a Target Point file</td></tr>
                                    ) : (
                                        tpList.map((item, i) => (
                                            <tr key={i} 
                                                className={`tr-hover ${i === selectedTpIndex ? "tr-blue" : ""}`} 
                                                onClick={() => handleTpRowClick(i)}>
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* RIGHT TABLE: Program Instructions (NOW CLICKABLE WITH STATE SELECTION) */}
                    {(expandedTable === 'NONE' || expandedTable === 'PR') && (
                        <div className="table-wrapper" style={{ borderLeft: expandedTable === 'NONE' ? '2px solid #202430' : 'none' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Inst</th>
                                        <th>Name</th>
                                        <th>Value</th>
                                        {expandedTable === 'PR' && (
                                            <>
                                                <th>Speed</th>
                                                <th>Deg</th>
                                                <th>Rad</th>
                                                <th>Tool</th>
                                                <th>Frame</th>
                                                <th>Com</th>
                                                <th>Dist</th>
                                                <th>Time</th>
                                            </>
                                        )}
                                        <th className="min-max-btn" onClick={() => setExpandedTable(expandedTable === 'PR' ? 'NONE' : 'PR')} title={expandedTable === 'PR' ? "Minimize" : "Maximize"}>
                                            {expandedTable === 'PR' ? '><' : '[ ]'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prList.length === 0 ? (
                                        <tr><td colSpan={expandedTable === 'PR' ? "13" : "5"} className="empty-table-text">Please open a Program file</td></tr>
                                    ) : (
                                        prList.map((item, i) => (
                                            <tr key={i} 
                                                className={`tr-hover ${i === selectedPrIndex ? "tr-blue" : ""}`} 
                                                onClick={() => handlePrRowClick(i)}>
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>

            <div className="rp-row-3">
                
                {/* 1ST ROW */}
                <div className="btn-row-flex">
                    <div style={{ position: 'relative', flex: 1, display: 'flex', minWidth: 0 }}>
                        <button className="tp-btn btn-blue" onClick={() => toggleDropdown('TP_MODE')}>⚙ {tpRunMode}</button>
                        {openDropdown === 'TP_MODE' && (
                            <div className="dropdown-menu">
                                <button className="dd-btn dd-blue" onClick={() => { sendCommand('SET_TP_RUN_MODE', 'Tp'); setOpenDropdown(null); }}>⚙ TP Mode</button>
                                <button className="dd-btn dd-blue" onClick={() => { sendCommand('SET_TP_RUN_MODE', 'MOVJ'); setOpenDropdown(null); }}>⚙ MOVJ</button>
                                <button className="dd-btn dd-blue" onClick={() => { sendCommand('SET_TP_RUN_MODE', 'MOVL'); setOpenDropdown(null); }}>⚙ MOVL</button>
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'relative', flex: 1, display: 'flex', minWidth: 0 }}>
                        <button className="tp-btn btn-purple" onClick={() => toggleDropdown('TP')}>⚙ TP</button>
                        {openDropdown === 'TP' && (
                            <div className="dropdown-menu">
                                <button className="dd-btn dd-purple" onClick={() => { sendCommand('INSERT_TP'); setOpenDropdown(null); }}>⚙ Insert TP</button>
                                <button className="dd-btn dd-purple" onClick={openModifyTpModal}>📄 Modify TP</button>
                                {/* NEW: Delete sends exact selected index! */}
                                <button className="dd-btn dd-red" onClick={() => { sendCommand('DELETE_TP_INDEX', selectedTpIndex); setOpenDropdown(null); }}>⎋ Delete TP</button>
                            </div>
                        )}
                    </div>

                    <button className="tp-btn btn-green" onClick={() => sendCommand('RUN_TP')}>▶ Run TP</button>
                    
                    <button className="tp-btn btn-dark" onClick={() => { /* Script placeholder */ }}>📄 Op Pg</button>
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

                {/* 2ND ROW */}
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
                        <thead><tr><th>S.No</th><th>Inst</th><th>Name</th><th>Value 1</th><th>Deg 1</th></tr></thead>
                        <tbody><tr><td>1</td><td>--</td><td>--</td><td>--</td><td>--</td></tr></tbody>
                    </table>
                </div>
            </div>

            <div className="rp-row-5">
                <div className="btn-row-flex">
                    <select className="ft-select"><option>Inst</option></select>
                    <select className="ft-select"><option>Di-1</option></select>
                    <select className="ft-select"><option>Di-2</option></select>
                    <button className="tp-btn" style={{ background: '#555' }}># H/L</button>
                    <select className="ft-select"><option>Dig...</option></select>
                    <div className="ft-group"><span className="ft-label">⏱ delay</span><input className="ft-input" defaultValue="0"/></div>
                    <div className="ft-group"><span className="ft-label">→ go to</span><input className="ft-input" defaultValue="0"/></div>
                    <div className="ft-group"><span className="ft-label">↺ loop</span><input className="ft-input" defaultValue="0"/></div>
                </div>
                <div className="btn-row-flex">
                    <div className="ft-group"><span className="ft-label">⏱ mm/s</span><input className="ft-input" defaultValue="0"/></div>
                    <div className="ft-group"><span className="ft-label">🎯 Radius</span><input className="ft-input" defaultValue="0"/></div>
                    <select className="ft-select"><option>Vr_1</option></select>
                    <input className="ft-input" style={{ flex: '0 0 10cqw', borderRadius:'4px' }} defaultValue="0"/>
                    <select className="ft-select"><option>Vr_2</option></select>
                    <div className="ft-group"><span className="ft-label">🌍 AN ip</span><input className="ft-input" defaultValue="0"/></div>
                    <div className="ft-group"><span className="ft-label">🌍 AN op</span><input className="ft-input" defaultValue="0"/></div>
                </div>
            </div>

        </div>

        <RightMenuSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onSelectView={setCurrentView} />

      </div>
    </>
  );
};

export default RightPart;