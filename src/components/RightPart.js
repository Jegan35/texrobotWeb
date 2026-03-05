import React, { useState, memo } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import RightMenuSidebar from './RightMenuSidebar';
import './RightPart.css'; 

const LocalRightHeader = ({ onMenuClick, onSettingsClick, currentView }) => (
    <div className="local-header">
        <button className="hd-menu-btn" onClick={onMenuClick}>≡ MENU</button>
        <div className="hd-indicator">● {currentView}</div>
        <button className="hd-standby-btn">STANDBY</button>
        <button className="hd-settings-btn" onClick={onSettingsClick}>⚙ SETTINGS</button>
    </div>
);

const MemoizedTpTableBody = memo(({ tpList }) => {
    if (!tpList || tpList.length === 0) return <tbody><tr><td colSpan={4} className="empty-table-text">No TP Data</td></tr></tbody>;
    return <tbody>{tpList.map((item, i) => (<tr key={i}><td>{i + 1}</td><td>{item.name}</td><td>{item.value}</td><td>{item.deg}</td></tr>))}</tbody>;
});

const MemoizedPrTableBody = memo(({ prList }) => {
    if (!prList || prList.length === 0) return <tbody><tr><td colSpan={4} className="empty-table-text">No PR Data</td></tr></tbody>;
    return <tbody>{prList.map((item, i) => (<tr key={i}><td>{i + 1}</td><td>{item.inst}</td><td>{item.name}</td><td>{item.value}</td></tr>))}</tbody>;
});

const RightPart = () => {
  const { sendCommand, robotState } = useWebSocket();
  const rs = robotState || {};

  const [currentView, setCurrentView] = useState('JOG JOINTS');
  const [activeRow4Tab, setActiveRow4Tab] = useState('Inst');
  const [debugGoto, setDebugGoto] = useState('');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsCategory, setSettingsCategory] = useState('ROW1');
  const [activeSetRow1, setActiveSetRow1] = useState('Error Pos');
  const [activeSetRow2, setActiveSetRow2] = useState('Encoder Offset'); 

  const isJog = currentView.includes('JOG');
  const isJoints = currentView.includes('JOINTS');
  const motionType = isJog ? 'JOG' : 'MOVE';

  const handlePointerDown = (axis) => sendCommand(motionType === 'JOG' ? "BTN_PRESS" : "BTN_CLICK", axis);
  const handlePointerUp = (axis) => { if (motionType === 'JOG') sendCommand("BTN_RELEASE", axis); };

  const renderTopMain = () => {
    if (currentView === 'SPEED CONFIG') {
        return (
            <div className="speed-config-container">
                <div className="speed-config-title">SPEED SETTINGS</div>
                <div className="speed-config-body">
                    <div className="fluid-speed-row"><span className="fluid-speed-label">MM</span><button className="ind-input">mm</button></div>
                    <div className="fluid-speed-row"><span className="fluid-speed-label">MM/S</span><input type="number" className="ind-input" defaultValue="50" /></div>
                    <div className="fluid-speed-row"><span className="fluid-speed-label">DEG</span><button className="ind-input">deg</button></div>
                    <div className="fluid-speed-row"><span className="fluid-speed-label">DEG/S</span><input type="number" className="ind-input" defaultValue="50" /></div>
                    <div className="fluid-speed-row"><span className="fluid-speed-label">FRAME</span><button className="ind-input">Base</button></div>
                </div>
            </div>
        );
    }
    if (isJoints) {
        return (
            <div className="jog-panel-container">
                <div className="joints-two-col-layout">
                  <div className="joints-col">
                     <div className="joints-col-title">BASE / ARM</div>
                     {['J1', 'J2', 'J3'].map(id => (
                         <div key={id} className="joint-industrial-block">
                             <button className="jib-btn text-neg" onPointerDown={()=>handlePointerDown(`${id}-`)} onPointerUp={()=>handlePointerUp(`${id}-`)}>{id}-</button>
                             <div className="jib-label">{id}</div>
                             <button className="jib-btn text-pos" onPointerDown={()=>handlePointerDown(`${id}+`)} onPointerUp={()=>handlePointerUp(`${id}+`)}>{id}+</button>
                         </div>
                     ))}
                  </div>
                  <div className="joints-divider"></div>
                  <div className="joints-col">
                     <div className="joints-col-title">WRIST</div>
                     {['J4', 'J5', 'J6'].map(id => (
                         <div key={id} className="joint-industrial-block">
                             <button className="jib-btn text-neg" onPointerDown={()=>handlePointerDown(`${id}-`)} onPointerUp={()=>handlePointerUp(`${id}-`)}>{id}-</button>
                             <div className="jib-label">{id}</div>
                             <button className="jib-btn text-pos" onPointerDown={()=>handlePointerDown(`${id}+`)} onPointerUp={()=>handlePointerUp(`${id}+`)}>{id}+</button>
                         </div>
                     ))}
                  </div>
                </div>
            </div>
        );
    }
    // 🔴 FIXED: CARTESIAN RENDER LOGIC 🔴
    return (
        <div className="jog-panel-container">
            <div className="dpad-two-col-layout">
                <div className="dpad-col">
                    <div className="dpad-col-title">TRANSLATION</div>
                    <div className="dpad-cross">
                        <button className="dpad-btn dpad-up text-pos">Y+</button>
                        <button className="dpad-btn dpad-left text-neg">X-</button>
                        <div className="dpad-center">XYZ</div>
                        <button className="dpad-btn dpad-right text-pos">X+</button>
                        <button className="dpad-btn dpad-down text-neg">Y-</button>
                    </div>
                    <div className="dpad-z-row">
                        <button className="dpad-btn text-neg">Z-</button>
                        <button className="dpad-btn text-pos">Z+</button>
                    </div>
                </div>
                <div className="joints-divider"></div>
                <div className="dpad-col">
                    <div className="dpad-col-title">ROTATION</div>
                    <div className="dpad-cross">
                        <button className="dpad-btn dpad-up text-pos">Ry+</button>
                        <button className="dpad-btn dpad-left text-neg">Rx-</button>
                        <div className="dpad-center">ROT</div>
                        <button className="dpad-btn dpad-right text-pos">Rx+</button>
                        <button className="dpad-btn dpad-down text-neg">Ry-</button>
                    </div>
                    <div className="dpad-z-row">
                        <button className="dpad-btn text-neg">Rz-</button>
                        <button className="dpad-btn text-pos">Rz+</button>
                    </div>
                </div>
            </div>
        </div>
    );
  };

 const renderSettingsContent = () => {
      if (settingsCategory === 'ROW1') {
          return (
              <>
                  <div className="set-tabs-grid">
                      {['Error Pos', 'Ether Cat', 'IO Modules', 'Graph'].map(t => (
                          <button key={t} className={`set-tab-btn ${activeSetRow1 === t ? 'active-red' : ''}`} onClick={()=>setActiveSetRow1(t)}>{t}</button>
                      ))}
                  </div>
                  <div className="set-panel-content">
                      {activeSetRow1 === 'Error Pos' && (
                          <div className="light-panel">
                              <div className="error-pos-grid">
                                  {['X','Y','Z','a','b','c'].map((ax, i) => (
                                      <React.Fragment key={ax}>
                                          <span className="light-label">{ax}-S</span><input className="light-input" value="0.00" readOnly />
                                          <span className="light-label">J{i+1}-S</span><input className="light-input" value="0.00" readOnly />
                                          <span className="light-label">{ax}-E</span><input className="light-input" value="0.00" readOnly />
                                          <span className="light-label">J{i+1}-E</span><input className="light-input" value="0.00" readOnly />
                                      </React.Fragment>
                                  ))}
                              </div>
                          </div>
                      )}
                      {activeSetRow1 === 'IO Modules' && (
                           <div className="light-panel">
                               <div className="io-modules-wrapper">
                                   <div className="io-module-box">
                                       <div className="io-module-title" style={{ borderColor: '#4CAF50' }}>DIGITAL INPUTS (DI 1-16)</div>
                                       <div className="io-module-flex">
                                           {[...Array(16)].map((_, i) => (<div key={i} className="io-led-col"><div className="io-led off"></div><span>{i + 1}</span></div>))}
                                       </div>
                                   </div>
                                   <div className="io-module-box">
                                       <div className="io-module-title" style={{ borderColor: '#039BE5' }}>DIGITAL OUTPUTS (DO 1-16)</div>
                                       <div className="io-module-flex">
                                           {[...Array(16)].map((_, i) => (<div key={i} className="io-led-col"><div className="io-led off"></div><span>{i + 1}</span></div>))}
                                       </div>
                                   </div>
                               </div>
                           </div>
                      )}
                      {activeSetRow1 === 'Ether Cat' && <div className="light-panel">Ether Cat Data...</div>}
                      {activeSetRow1 === 'Graph' && <div className="light-panel">Graph View...</div>}
                  </div>
              </>
          );
      }
      return (
          <>
              <div className="set-tabs-grid">
                  {['Encoder Offset', 'Settings View', 'Data Variable', 'Axis Limit', 'Mech Settings'].map(t => (
                      <button key={t} className={`set-tab-btn ${activeSetRow2 === t ? 'active-green' : ''}`} onClick={()=>setActiveSetRow2(t)}>{t}</button>
                  ))}
              </div>
              <div className="set-panel-content">
                  {activeSetRow2 === 'Mech Settings' && (
                      <div className="light-panel" style={{ padding: 0 }}>
                          <table className="mech-table">
                              <thead><tr><th></th><th>Dh-nal</th><th>Encod</th><th>Gear R</th><th>deg c</th><th>couple</th><th>j min</th><th>j max</th></tr></thead>
                              <tbody>
                                  {['l1', 'l2', 'l3', 'l4', 'l5', 'l6'].map((row) => (
                                      <tr key={row}>
                                          <td style={{fontWeight: '900', fontSize: '0.8rem'}}>{row}</td>
                                          <td><input defaultValue="0" /></td><td><input defaultValue="0" /></td>
                                          <td><input defaultValue="0" /></td><td><input defaultValue="0" /></td>
                                          <td><input defaultValue="0" /></td><td><input defaultValue="0" /></td>
                                          <td><input defaultValue="0" /></td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  )}
                  {activeSetRow2 === 'Encoder Offset' && (
                      <div className="light-panel">
                          <div className="encoder-offset-grid">
                              {[1,2,3,4,5,6].map(i => (
                                  <React.Fragment key={i}>
                                      <span className="light-label">J{i}-Encoder Pos</span><input className="light-input" readOnly placeholder="0" />
                                      <span className="light-label">J{i}-Offset</span><input className="light-input" placeholder="0" />
                                      <button className="light-btn">J{i} - Zero</button><input className="light-input" placeholder="0" />
                                  </React.Fragment>
                              ))}
                          </div>
                      </div>
                  )}
                  {activeSetRow2 === 'Settings View' && <div className="light-panel">Settings Data...</div>}
                  {activeSetRow2 === 'Data Variable' && <div className="light-panel">Variables Data...</div>}
                  {activeSetRow2 === 'Axis Limit' && <div className="light-panel">Axis Limit Data...</div>}
              </div>
          </>
      );
  };
  return (
    <div className="rp-master-container">
        
        {/* OVERLAY SETTINGS */}
        <div className={`rp-settings-overlay ${isSettingsOpen ? 'open' : ''}`}>
            <div className="rp-settings-header">
                <button className="set-cat-btn" onClick={()=>setSettingsCategory('ROW1')} style={{background: settingsCategory === 'ROW1' ? '#E53935' : '#111'}}>DIAGNOSTICS</button>
                <button className="set-cat-btn" onClick={()=>setSettingsCategory('ROW2')} style={{background: settingsCategory === 'ROW2' ? '#4CAF50' : '#111'}}>CONFIG</button>
                <button className="set-close-btn" onClick={()=>setIsSettingsOpen(false)}>✖</button>
            </div>
            <div className="rp-settings-body">
                {renderSettingsContent()}
            </div>
        </div>

        <div className="rp-main-content">
            <div className="rp-header-col">
                <LocalRightHeader 
                    onMenuClick={() => setIsSidebarOpen(true)} 
                    onSettingsClick={() => setIsSettingsOpen(true)} 
                    currentView={currentView} 
                />
            </div>

            <div className="rp-upper-40">
                {renderTopMain()}
            </div>

            <div className="rp-middle-40">
                <div className="dark-tabs bg-dark-deep">
                    <div className="dark-tab active" style={{color: '#4CAF50', borderTopColor: '#4CAF50'}}>PROGRAMS FILE</div>
                </div>
                <div className="table-split-view">
                    <div className="table-wrapper-fixed"><MemoizedTpTableBody tpList={rs.tp_list} /></div>
                    <div className="table-wrapper-fixed"><MemoizedPrTableBody prList={rs.pr_program_data} /></div>
                </div>
            </div>

            <div className="rp-lower-20">
                <div className="dark-tabs bg-dark-deep" style={{marginBottom: 0}}>
                    {['Inst', 'Debug', 'Jog Deg'].map(tab => (
                        <div key={tab} className={`dark-tab ${activeRow4Tab === tab ? 'active' : ''}`} onClick={() => setActiveRow4Tab(tab)}>{tab}</div>
                    ))}
                </div>
                
                <div className="row2-content-fixed">
                    {activeRow4Tab === 'Inst' && (
                        <div className="table-wrapper-fixed" style={{borderTop: 'none'}}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>S.No</th><th>Inst</th><th>Name</th><th>Val 1</th><th>Deg 1</th>
                                        <th>Name</th><th>Val 2</th><th>Deg 2</th><th>Speed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="sno-col">1</td>
                                        <td>{rs.staging_data?.instruction || '--'}</td><td>--</td><td>--</td><td>--</td>
                                        <td>--</td><td>--</td><td>--</td><td>--</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                    {activeRow4Tab === 'Debug' && (
                        <div className="debug-panel">
                             <button className="ind-btn bg-red">Start_Stop</button>
                             <button className="ind-btn bg-dark">Step</button>
                             <button className="ind-btn bg-dark">Exit</button>
                             <button className="ind-btn bg-dark">Jump In</button>
                        </div>
                    )}
                    {activeRow4Tab === 'Jog Deg' && (<div className="jog-deg-panel">Jog Degrees</div>)}
                </div>
            </div>
        </div>

        {/* 🔴 RIGHT MENU SIDEBAR INCLUDED HERE 🔴 */}
        <RightMenuSidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            onSelectView={setCurrentView} 
            activeView={currentView} 
        />
    </div>
  );
};

export default RightPart;