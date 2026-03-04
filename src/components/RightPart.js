import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import RightHeader from './RightHeader';
import RightMenuSidebar from './RightMenuSidebar';
import './RightPart.css'; 

const INST_OPTIONS = ["Inst", "MOVJ", "MOVJ_dg", "MOVL", "MOVC", "MVLEX_Deg", "MVLEX_mm", "Pallet_Matrix", "Num_of_row", "Num_of_colm", "pos_add_x", "pos_add_y", "pos_add_z", "delay_ms", "go_to", "loop", "Start If", "End If", "Start-Con", "End-Con", "Wait", "DI-1", "DI-2", "DI-3", "DI-4", "DI-5", "DI-6", "DI-7", "DI-8", "DI-9", "DI-10", "DI-11", "DI-12", "DI-13", "DI-14", "DI-15", "DI-16", "DO-1", "DO-2", "DO-3", "DO-4", "DO-5", "DO-6", "DO-7", "DO-8", "DO-9", "DO-10", "DO-11", "DO-12", "DO-13", "DO-14", "DO-15", "DO-16", "AI-1", "AI-2", "AI-3", "AI-4", "AO-1", "AO-2", "AO-3", "AO-4", "DI-1 Chk", "DI-2 Chk", "DI-3 Chk", "DI-4 Chk", "DI-5 Chk", "DI-6 Chk", "DI-7 Chk", "DI-8 Chk", "DI-9 Chk", "DI-10 Chk", "DI-11 Chk", "DI-12 Chk", "DI-13 Chk", "DI-14 Chk", "DI-15 Chk", "DI-16 Chk", "DI-1 Un Chk", "DI-2 Un Chk", "DI-3 Un Chk", "DI-4 Un Chk", "DI-5 Un Chk", "DI-6 Un Chk", "DI-7 Un Chk", "DI-8 Un Chk", "DI-9 Un Chk", "DI-10 Un Chk", "DI-11 Un Chk", "DI-12 Un Chk", "DI-13 Un Chk", "DI-14 Un Chk", "DI-15 Un Chk", "DI-16 Un Chk", "= Assign", "== Equal", "!= Not Eql", "<", ">", "<=", ">=", "+", "-", "&", "stop", "Servo off"];
const DI_OPTIONS = ["Di-1", "D-1", "D-2", "D-3", "D-4", "D-5", "D-6", "D-7", "D-8", "D-9", "D-10", "D-11", "D-12", "D-13", "D-14", "D-15", "D-16"];
const DI2_OPTIONS = ["Di-2", "D-1", "D-2", "D-3", "D-4", "D-5", "D-6", "D-7", "D-8", "D-9", "D-10", "D-11", "D-12", "D-13", "D-14", "D-15", "D-16"];
const DIG_STATE_OPTIONS = ["DIG-S", "High", "Low"];
const VAR1_OPTIONS = ["Vr_1", "V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-7", "V-8", "V-9", "V-10", "AI-1", "AI-2", "AI-3", "AI-4", "AO-1", "AO-2", "AO-3", "AO-4"];
const VAR2_OPTIONS = ["Vr_2", "V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-7", "V-8", "V-9", "V-10", "AI-1", "AI-2", "AI-3", "AI-4", "AO-1", "AO-2", "AO-3", "AO-4"];
const MM_OPTIONS = ["mm", "50", "25", "15", "10", "5", "2", "1", "0.1", "0.01", "0.001"];
const DEG_OPTIONS = ["deg", "20", "15", "10", "5", "2", "1", "0.1", "0.01", "0.0001"];
const FRAME_OPTIONS = ["frames", "Base", "Tool", "User"];

const RightPart = () => {
  const { sendCommand, robotState } = useWebSocket();
  const rs = robotState || {};
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('JOG JOINTS');

  const [activeRow4Tab, setActiveRow4Tab] = useState('Inst');
  const [openDropdown, setOpenDropdown] = useState(null);

  const [selInst, setSelInst] = useState(INST_OPTIONS[0]);
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
  const staging = rs.staging_data || {};

  const handlePointerDown = (axis) => sendCommand(motionType === 'JOG' ? "BTN_PRESS" : "BTN_CLICK", axis);
  const handlePointerUp = (axis) => { if (motionType === 'JOG') sendCommand("BTN_RELEASE", axis); };
  const handleGlobalSpeedChange = (e) => { setGlobalSpeed(e.target.value); sendCommand("SET_GLOBAL_SPEED", e.target.value); };
  const applyMmSpeed = () => sendCommand("SET_MM_SPEED", mmSpeedText);
  const applyDegSpeed = () => sendCommand("SET_DEG_SPEED", degSpeedText);

  const toggleDropdown = (menu) => setOpenDropdown(openDropdown === menu ? null : menu);

  const renderDropdown = (menuKey, options, currentValue, onSelect, btnClass = "ind-input", direction = "down") => (
      <div className="rel-flex">
          <button className={btnClass} onClick={() => toggleDropdown(menuKey)}>
              {currentValue}
          </button>
          {openDropdown === menuKey && (
              <div className={`custom-select-menu custom-select-menu-${direction}`}>
                  {options.map(o => (
                      <div key={o} className="custom-select-item" onClick={() => { onSelect(o); setOpenDropdown(null); }}>
                          {o}
                      </div>
                  ))}
              </div>
          )}
      </div>
  );

  const renderSpeedConfig = () => (
    <div className="speed-config-container">
      <div className="speed-config-title">SPEED SETTINGS</div>
      <div className="speed-config-body">
        <div className="fluid-speed-row"><span className="fluid-speed-label">MM</span>
            {renderDropdown('SPEED_MM', MM_OPTIONS, mmIncVal, (v) => { setMmIncVal(v); sendCommand("SET_MM_INC", v); }, "ind-input", "down")}
        </div>
        <div className="fluid-speed-row"><span className="fluid-speed-label">MM/S</span><input type="number" className="ind-input" value={mmSpeedText} onChange={(e) => setMmSpeedText(e.target.value)} onBlur={applyMmSpeed} /></div>
        <div className="fluid-speed-row"><span className="fluid-speed-label">DEG</span>
            {renderDropdown('SPEED_DEG', DEG_OPTIONS, degIncVal, (v) => { setDegIncVal(v); sendCommand("SET_DEG_INC", v); }, "ind-input", "down")}
        </div>
        <div className="fluid-speed-row"><span className="fluid-speed-label">DEG/S</span><input type="number" className="ind-input" value={degSpeedText} onChange={(e) => setDegSpeedText(e.target.value)} onBlur={applyDegSpeed} /></div>
        <div className="fluid-speed-row"><span className="fluid-speed-label">FRAME</span>
            {renderDropdown('SPEED_FRAME', FRAME_OPTIONS, frameVal, (v) => { setFrameVal(v); sendCommand("SET_FRAME", v); }, "ind-input", "down")}
        </div>
        <div className="fluid-speed-row">
          <span className="fluid-speed-label">SPEED</span>
          <div className="speed-range-group">
              <input type="range" min="1" max="100" value={globalSpeed} onChange={(e) => setGlobalSpeed(e.target.value)} onMouseUp={handleGlobalSpeedChange} onTouchEnd={handleGlobalSpeedChange} />
              <input type="number" className="ind-input speed-num-input" value={globalSpeed} onChange={handleGlobalSpeedChange} />
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
    <div className="rp-master-container">
        <div className="rp-main-content">
            
            <div className="rp-upper-half">
                <div className="rp-header-col">
                    <RightHeader onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} currentMode={currentView} isOpen={isSidebarOpen} />
                </div>
                <div className="rp-content-col">
                    <div className={`rp-panel-left ${currentView === 'SPEED CONFIG' ? 'bg-dark' : 'bg-light-dark'}`}>
                        {currentView === 'SPEED CONFIG' ? renderSpeedConfig() : renderJogPanel()}
                    </div>
                </div>
            </div>

            <div className="rp-lower-half">
                
                <div className="rp-row-4">
                    <div className="dark-tabs bg-dark-deep">
                        {['Inst', 'Debug', 'Jog Deg'].map(tab => (
                            <div key={tab} className={`dark-tab ${activeRow4Tab === tab ? 'active' : ''}`} onClick={() => setActiveRow4Tab(tab)}>
                                {tab}
                            </div>
                        ))}
                    </div>
                    
                    <div className="row2-content-fixed">
                        {activeRow4Tab === 'Inst' && (
                            <div className="table-wrapper-fixed">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>S.No</th><th>Inst</th><th>Name</th><th>Val 1</th><th>Deg 1</th>
                                            <th>Name</th><th>Val 2</th><th>Deg 2</th><th>Speed</th>
                                            <th>Radius</th><th>Frame</th><th>Tool</th><th>Comment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="sno-col">1</td>
                                            <td>{staging.instruction || '--'}</td><td>{staging.name1 || '--'}</td><td>{staging.value1 || '--'}</td>
                                            <td>{staging.deg1 || '--'}</td><td>{staging.name2 || '--'}</td><td>{staging.value2 || '--'}</td><td>{staging.deg2 || '--'}</td>
                                            <td>{staging.speed || '--'}</td><td>--</td><td>--</td><td>--</td><td>{staging.comment || '--'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {activeRow4Tab === 'Debug' && (
                            <div className="debug-panel">
                                 <button className="ind-btn bg-red" onClick={() => sendCommand('TOGGLE_START')}>Start_Stop</button>
                                 <button className="ind-btn bg-dark">Step</button>
                                 <button className="ind-btn bg-dark" onClick={() => sendCommand('EXIT')}>Exit</button>
                                 <button className="ind-btn bg-dark">Jump In</button>
                                 <button className="ind-btn bg-dark">Jump Out</button>
                                 <button className="ind-btn bg-dark" style={{border: '2px solid black'}} onClick={() => sendCommand('SET_GOTO_PROGRAM', debugGoto)}>Go To</button>
                                 <input className="ind-input" value={debugGoto} onChange={e => setDebugGoto(e.target.value)} />
                                 <button className="ind-btn bg-dark">Prv</button>
                            </div>
                        )}
                        {activeRow4Tab === 'Jog Deg' && (
                            <div className="jog-deg-panel">Jog Degrees not set</div>
                        )}
                    </div>
                </div>

                {/* 🔴 FIXED: ROW 5 LA CUSTOMIZED 6-ROW LAYOUT 🔴 */}
                <div className="rp-row-5">
                    
                    {/* 1st Row: 3 Buttons */}
                    <div className="ind-grid-3">
                        {renderDropdown('R5_INST', INST_OPTIONS, selInst, (v) => { setSelInst(v); sendCommand("SET_INSTRUCTION_TYPE", v); }, "ind-btn bg-blue", "up")}
                        {renderDropdown('R5_DI1', DI_OPTIONS, selDi1, (v) => { setSelDi1(v); sendCommand("SET_DIGI_1", v); }, "ind-btn bg-dark", "up")}
                        {renderDropdown('R5_DI2', DI2_OPTIONS, selDi2, (v) => { setSelDi2(v); sendCommand("SET_DIGI_2", v); }, "ind-btn bg-dark", "up")}
                    </div>

                    {/* 2nd Row: 4 Buttons */}
                    <div className="ind-grid-4">
                        <button className="ind-btn bg-dark" onClick={() => sendCommand('CONFIRM_HIGH_LOW')}># H/L</button>
                        {renderDropdown('R5_HL', DIG_STATE_OPTIONS, selHL, (v) => { setSelHL(v); sendCommand("SET_HIGH_LOW", v); }, "ind-btn bg-dark", "up")}
                        <button className="ind-btn bg-dark" onClick={() => sendCommand('SET_DELAY', delayVal)}>⏱ DELAY</button>
                        <input className="ind-input" value={delayVal} onChange={e => setDelayVal(e.target.value)} />
                    </div>

                    {/* 3rd Row: 4 Buttons */}
                    <div className="ind-grid-4">
                        <button className="ind-btn bg-dark" onClick={() => sendCommand('SET_GOTO_PROGRAM', gotoVal)}>→ GO TO</button>
                        <input className="ind-input" value={gotoVal} onChange={e => setGotoVal(e.target.value)} />
                        <button className="ind-btn bg-dark" onClick={() => sendCommand('SET_LOOP', loopVal)}>↺ LOOP</button>
                        <input className="ind-input" value={loopVal} onChange={e => setLoopVal(e.target.value)} />
                    </div>

                    {/* 4th Row: 4 Buttons */}
                    <div className="ind-grid-4">
                        <button className="ind-btn bg-dark" onClick={() => sendCommand('SET_PROGRAM_SPEED', progSpeedVal)}>⏱ MM/S</button>
                        <input className="ind-input" value={progSpeedVal} onChange={e => setProgSpeedVal(e.target.value)} />
                        <button className="ind-btn bg-dark" onClick={() => {}}>🎯 RAD</button>
                        <input className="ind-input" value={radiusVal} onChange={e => setRadiusVal(e.target.value)} />
                    </div>
                    
                    {/* 5th Row: 3 Buttons */}
                    <div className="ind-grid-3">
                        {renderDropdown('R5_VAR1', VAR1_OPTIONS, selVar1, (v) => { setSelVar1(v); sendCommand("SET_VAR1", v); }, "ind-btn bg-dark", "up")}
                        <input className="ind-input" value={varInputVal} onChange={e => setVarInputVal(e.target.value)} onBlur={(e) => sendCommand('SET_VAR_VAL', e.target.value)} />
                        {renderDropdown('R5_VAR2', VAR2_OPTIONS, selVar2, (v) => { setSelVar2(v); sendCommand("SET_VAR2", v); }, "ind-btn bg-dark", "up")}
                    </div>

                    {/* 6th Row: 4 Buttons */}
                    <div className="ind-grid-4">
                        <button className="ind-btn bg-dark" onClick={() => {}}>🌍 AN ip</button>
                        <input className="ind-input" value={anIpVal} onChange={e => setAnIpVal(e.target.value)} />
                        <button className="ind-btn bg-dark" onClick={() => {}}>🌍 AN op</button>
                        <input className="ind-input" value={anOpVal} onChange={e => setAnOpVal(e.target.value)} />
                    </div>

                </div>

            </div>
        </div>
        
        <RightMenuSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onSelectView={setCurrentView} activeView={currentView} />
    </div>
  );
};

export default RightPart;