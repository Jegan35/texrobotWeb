import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import RightHeader from './RightHeader';
import RightMenuSidebar from './RightMenuSidebar';

const MM_OPTIONS = ["mm", "50", "25", "15", "10", "5", "2", "1", "0.1", "0.01", "0.001"];
const DEG_OPTIONS = ["deg", "20", "15", "10", "5", "2", "1", "0.1", "0.01", "0.001", "0.0001"];
const FRAME_OPTIONS = ["frames", "Base", "Tool", "User"];

const RightPart = () => {
  const { sendCommand } = useWebSocket();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('JOG JOINTS');

  // --- SPEED STATES ---
  const [globalSpeed, setGlobalSpeed] = useState(50);
  const [frameVal, setFrameVal] = useState(FRAME_OPTIONS[0]);
  const [mmIncVal, setMmIncVal] = useState(MM_OPTIONS[0]);
  const [degIncVal, setDegIncVal] = useState(DEG_OPTIONS[0]);
  const [mmSpeedText, setMmSpeedText] = useState("50.0");
  const [degSpeedText, setDegSpeedText] = useState("50.0");

  const isJog = currentView.includes('JOG');
  const isJoints = currentView.includes('JOINTS');
  const motionType = isJog ? 'JOG' : 'MOVE';

  const handlePointerDown = (axis) => sendCommand(motionType === 'JOG' ? "BTN_PRESS" : "BTN_CLICK", axis);
  const handlePointerUp = (axis) => { if (motionType === 'JOG') sendCommand("BTN_RELEASE", axis); };

  const handleGlobalSpeedChange = (e) => { setGlobalSpeed(e.target.value); sendCommand("SET_GLOBAL_SPEED", e.target.value); };
  const applyMmSpeed = () => sendCommand("SET_MM_SPEED", mmSpeedText);
  const applyDegSpeed = () => sendCommand("SET_DEG_SPEED", degSpeedText);

  const renderSpeedConfig = () => (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100%', background: '#1a1e29', padding: '15px 10px', color: 'white', boxSizing: 'border-box' }}>
      <div style={{ fontSize: 'clamp(12px, 1.8cqw, 16px)', fontWeight: '900', letterSpacing: '1px', marginBottom: '20px', color: '#00bcd4', textAlign: 'center', flexShrink: 0 }}>
        SPEED SETTINGS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, minHeight: 'min-content' }}>
        <div className="fluid-speed-row">
          <span className="fluid-speed-label">MM</span>
          <select className="fluid-speed-input" value={mmIncVal} onChange={(e)=>{setMmIncVal(e.target.value); sendCommand("SET_MM_INC", e.target.value)}}>
              {MM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="fluid-speed-row">
          <span className="fluid-speed-label">MM/S</span>
          <input type="number" className="fluid-speed-input" value={mmSpeedText} onChange={(e) => setMmSpeedText(e.target.value)} onBlur={applyMmSpeed} />
        </div>
        <div className="fluid-speed-row">
          <span className="fluid-speed-label">DEG</span>
          <select className="fluid-speed-input" value={degIncVal} onChange={(e)=>{setDegIncVal(e.target.value); sendCommand("SET_DEG_INC", e.target.value)}}>
              {DEG_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div className="fluid-speed-row">
          <span className="fluid-speed-label">DEG/S</span>
          <input type="number" className="fluid-speed-input" value={degSpeedText} onChange={(e) => setDegSpeedText(e.target.value)} onBlur={applyDegSpeed} />
        </div>
        <div className="fluid-speed-row">
          <span className="fluid-speed-label">FRAME</span>
          <select className="fluid-speed-input" value={frameVal} onChange={(e)=>{setFrameVal(e.target.value); sendCommand("SET_FRAME", e.target.value)}}>
              {FRAME_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
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
        <div style={{ textAlign: 'center', fontSize: 'clamp(10px, 1.6cqw, 14px)', fontWeight: '900', color: '#00bcd4', paddingBottom: '10px', letterSpacing: '1px', flexShrink: 0 }}>
          {motionType} CONTROLS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '200px' }}>
          {axes.map(ax => (
            <div key={ax.m} style={{ display: 'flex', gap: '1cqw', flex: 1, minHeight: '30px', marginBottom: '4px' }}>
              <button className="pro-jog-btn neg" onPointerDown={()=>handlePointerDown(ax.m)} onPointerUp={()=>handlePointerUp(ax.m)} onPointerLeave={()=>handlePointerUp(ax.m)}>
                <span className="btn-txt">{ax.m.slice(0, -1)}</span><span className="btn-sym">-</span>
              </button>
              <button className="pro-jog-btn pos" onPointerDown={()=>handlePointerDown(ax.p)} onPointerUp={()=>handlePointerUp(ax.p)} onPointerLeave={()=>handlePointerUp(ax.p)}>
                <span className="btn-txt">{ax.p.slice(0, -1)}</span><span className="btn-sym">+</span>
              </button>
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
        
        .rp-main-content { 
            display: flex; flex-direction: column; flex: 1; min-width: 0; min-height: 0; height: 100%; 
            transition: width 0.2s; container-type: size; overflow: hidden;
        }

        .rp-row-1 { flex: 35 1 0; display: flex; flex-direction: column; border-bottom: 2px solid #111; overflow: hidden; background: #f4f3ef; min-height: 0; }
        .rp-row-2 { flex: 25 1 0; display: flex; flex-direction: column; border-bottom: 2px solid #111; overflow: hidden; background: #f4f3ef; min-height: 0; }
        .rp-row-3 { flex: 10 1 0; display: flex; flex-direction: column; justify-content: center; background: #202430; padding: 0.5cqh 0.5cqw; overflow: hidden; min-height: 0; }
        .rp-row-4 { flex: 20 1 0; display: flex; flex-direction: column; border-bottom: 2px solid #111; overflow: hidden; background: #f4f3ef; min-height: 0; }
        .rp-row-5 { flex: 10 1 0; display: flex; flex-direction: column; justify-content: center; background: #1a1e29; padding: 0.5cqh 1cqw; overflow: hidden; min-height: 0; }

        .fluid-speed-row { display: flex; align-items: center; justify-content: space-between; flex: 1; min-height: 25px; }
        .fluid-speed-label { font-size: clamp(10px, 1.5cqw, 14px); font-weight: bold; color: #ccc; white-space: nowrap; }
        .fluid-speed-input { width: 60%; min-width: 0; background: #fff; color: #111; border: none; border-radius: 4px; padding: 4px 6px; font-size: clamp(10px, 1.5cqw, 14px); font-weight: bold; outline: none; }

        .pro-jog-btn {
            flex: 1; min-width: 0; min-height: 0; display: flex; justify-content: space-between; align-items: center;
            padding: 0 1.5cqw; margin: 2px 0; border-radius: 6px; border: none; font-weight: 900; color: white;
            font-size: clamp(10px, 1.8cqw, 18px); cursor: pointer; box-shadow: 0 3px 6px rgba(0,0,0,0.4); transition: 0.1s;
        }
        .pro-jog-btn.neg { background: linear-gradient(135deg, #e53935, #b71c1c); border-bottom: 4px solid #7f0000; }
        .pro-jog-btn.pos { background: linear-gradient(135deg, #43a047, #1b5e20); border-bottom: 4px solid #003300; }
        .pro-jog-btn:active { transform: translateY(2px); border-bottom-width: 2px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); }
        .btn-txt { opacity: 0.9; }
        .btn-sym { font-size: 1.2em; font-weight: 900; text-shadow: 0 2px 2px rgba(0,0,0,0.3); }

        .dark-tabs { display: flex; background: #1a1e29; padding-top: 5px; padding-left: 0.5cqw; border-bottom: 2px solid #00bcd4; overflow: hidden; flex-shrink: 0; }
        .dark-tab { padding: 6px 1cqw; color: #aaa; font-weight: bold; font-size: clamp(8px, 1.4cqw, 12px); cursor: pointer; border-radius: 4px 4px 0 0; white-space: nowrap; }
        .dark-tab.active { background: #202430; color: #00bcd4; border: 1px solid #444; border-bottom: none; }

        /* FIXED: Set to overflow: auto and allow horizontal scrolling if it gets incredibly small */
        .table-container { flex: 1; overflow: auto; padding: 5px 1cqw; display: flex; flex-direction: column; min-height: 0; }
        
        .data-table { width: 100%; height: 100%; border-collapse: collapse; font-weight: bold; background: white; border: 1px solid #ccc; text-align: center; table-layout: fixed; }
        .data-table th, .data-table td { padding: 4px 0.5cqw; font-size: clamp(7px, 1.3cqw, 12px); border: 1px solid #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .data-table th { background: #e0e0e0; color: #111; }
        .data-table td { color: #333; }
        .tr-blue { background-color: #bbdefb; }

        /* FIXED: Shrunk gaps to 2px/4px and used tight font sizes so the 7 columns NEVER hide */
        .var-grid { 
            display: grid; 
            grid-template-columns: repeat(7, max-content minmax(15px, 1fr)); 
            gap: 2px 4px; 
            align-items: center; 
            height: 100%; 
            padding-right: 5px; 
        }
        .var-label { font-size: clamp(6px, 0.8vw, 11px); font-weight: bold; color: #333; text-align: right; white-space: nowrap; margin-right: 1px; }
        .var-input { width: 100%; height: 85%; min-width: 0; border: 1px solid #ccc; padding: 0 2px; font-size: clamp(6px, 0.8vw, 11px); text-align: center; outline: none; box-sizing: border-box; }

        .btn-row-flex { display: flex; flex-wrap: nowrap; gap: 0.5cqw; align-items: center; flex: 1; min-height: 0; overflow: hidden; padding-bottom: 2px; }
        .tp-btn { flex: 1; min-width: 0; height: 100%; border: none; border-radius: 4px; color: white; font-weight: bold; font-size: clamp(7px, 1.3cqw, 12px); cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5cqw; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tp-btn.cyan { background: #00bcd4; color: #111; }
        .tp-btn.purple { background: #8e24aa; }
        .tp-btn.green { background: #2e7d32; }
        .tp-btn.teal { background: #00897b; }
        
        .tp-input-group { flex: 1; min-width: 0; height: 100%; display: flex; background: #333; border-radius: 4px; overflow: hidden; border: 1px solid #555; }
        .tp-label { padding: 0 0.5cqw; background: #374151; color: white; font-weight: bold; font-size: clamp(7px, 1.3cqw, 12px); border-right: 1px solid #555; white-space: nowrap; display: flex; align-items: center; }
        .tp-input-box { flex: 1; min-width: 0; height: 100%; border: none; text-align: center; font-weight: bold; font-size: clamp(7px, 1.3cqw, 12px); outline: none; }

        .ft-select { flex: 1; min-width: 0; height: 100%; background: #333; color: white; border: 1px solid #555; padding: 0 0.5cqw; border-radius: 4px; font-size: clamp(7px, 1.3cqw, 12px); font-weight: bold; outline: none; }
        .ft-group { flex: 1; min-width: 0; height: 100%; display: flex; background: #333; border: 1px solid #555; border-radius: 4px; overflow: hidden; }
        .ft-label { padding: 0 0.5cqw; color: white; font-size: clamp(7px, 1.3cqw, 12px); font-weight: bold; background: #4b5563; white-space: nowrap; display: flex; align-items: center; }
        .ft-input { flex: 1; min-width: 0; height: 100%; border: none; text-align: center; font-size: clamp(7px, 1.3cqw, 12px); font-weight: bold; outline: none; }
      `}</style>

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
                        <div className="table-container">
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
                <div className="table-container" style={{ display: 'flex', gap: '1cqw', flexDirection: 'row' }}>
                    <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex' }}>
                        <table className="data-table">
                            <thead><tr><th>S.No</th><th>Name</th><th>Value</th><th style={{background:'#2196f3', color:'white'}}>[]</th></tr></thead>
                            <tbody>
                                <tr className="tr-blue"><td>1</td><td>tp1</td><td>x:939 z:1151</td><td>a:0</td></tr>
                                <tr><td>2</td><td>tp2</td><td>x:939 z:1151</td><td>a:0</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex' }}>
                        <table className="data-table">
                            <thead><tr><th>S.No</th><th>Inst</th><th>Name</th><th>Value</th><th style={{background:'#2196f3', color:'white'}}>[]</th></tr></thead>
                            <tbody>
                                <tr className="tr-blue"><td>1</td><td>MOVL</td><td>tp1</td><td></td><td></td></tr>
                                <tr><td>2</td><td>MOVL</td><td>tp2</td><td></td><td></td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="rp-row-3">
                <div className="btn-row-flex">
                    <button className="tp-btn cyan">⚙ MOVL</button>
                    <button className="tp-btn purple">⚙ TP</button>
                    <button className="tp-btn green">▶ Run TP</button>
                    <div className="tp-input-group"><span className="tp-label">📄 Op Pg</span><input className="tp-input-box" defaultValue="0"/></div>
                    <button className="tp-btn purple">📄 Inst</button>
                    <button className="tp-btn green">▶ Run Inst</button>
                </div>
                <div className="btn-row-flex">
                    <div className="tp-input-group"><span className="tp-label">📄 Ip Pg</span><input className="tp-input-box" defaultValue="0"/></div>
                    <div className="tp-input-group"><span className="tp-label">🏷 Tp name</span><input className="tp-input-box" defaultValue="0"/></div>
                    <div className="tp-input-group"><span className="tp-label">🌍 Com</span><input className="tp-input-box" defaultValue="0"/></div>
                    <button className="tp-btn teal">🧮 Calc Traj</button>
                </div>
            </div>

            <div className="rp-row-4">
                <div className="dark-tabs" style={{ background: '#202430' }}>
                    <div className="dark-tab active">Inst</div>
                    <div className="dark-tab">Debug</div>
                    <div className="dark-tab">Jog Deg</div>
                </div>
                <div className="table-container">
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