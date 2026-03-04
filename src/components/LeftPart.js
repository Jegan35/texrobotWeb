import React, { useState, memo, useCallback, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import './LeftPart.css'; 

const VAR_MONITOR_LIST = ["V-1", "V-2", "V-3", "V-4", "V-5", "V-6", "V-7", "V-8", "V-9", "V-10", "AI-1", "AI-2", "AI-3", "AI-4", "AO-1", "AO-2", "AO-3", "AO-4"];
const DI_SIM_NUM_LIST = ["DI", "DI-1", "DI-2", "DI-3", "DI-4", "DI-5", "DI-6", "DI-7", "DI-8", "DI-9", "DI-10", "DI-11", "DI-12", "DI-13", "DI-14", "DI-15", "DI-16"];
const DO_SIM_NUM_LIST = ["DO", "DO-1", "DO-2", "DO-3", "DO-4", "DO-5", "DO-6", "DO-7", "DO-8", "DO-9", "DO-10", "DO-11", "DO-12", "DO-13", "DO-14", "DO-15", "DO-16"];
const SIM_STATE_LIST = ["State", "High", "Low"];

const MemoizedTpTableBody = memo(({ tpList, expandedTable, selectedTpIndex, onRowClick }) => {
    if (tpList.length === 0) return <tbody><tr><td colSpan={expandedTable === 'TP' ? 6 : 4} className="empty-table-text" style={{ border: 'none' }}>Please open a Target Point file</td></tr></tbody>;
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
    if (prList.length === 0) return <tbody><tr><td colSpan={expandedTable === 'PR' ? 12 : 4} className="empty-table-text" style={{ border: 'none' }}>Please open a Program file</td></tr></tbody>;
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

const LeftPart = () => {
  const { sendCommand, robotState, isGraphReading, setGraphReading } = useWebSocket();
  const rs = robotState || {};
  const tpList = rs.tp_list || [];
  const prList = rs.pr_program_data || [];
  const errorData = rs.error_pos_data || {};
  const etherData = rs.ether_cat_data || {};
  const variableData = rs.variable_data || {};
  const mechData = rs.mech_data || {};
  const diVal = rs.di_val || 0;
  const doVal = rs.do_val || 0;

  const [mainCategory, setMainCategory] = useState('ROW1'); 
  const [activeRow1Tab, setActiveRow1Tab] = useState('Error Pos');
  const [activeRow2Tab, setActiveRow2Tab] = useState('Programs File');
  
  // 🔴 FIXED: Removed unused setExpandedTable 🔴
  const [expandedTable] = useState('NONE'); 
  
  const [selectedTpIndex, setSelectedTpIndex] = useState(0);
  const [selectedPrIndex, setSelectedPrIndex] = useState(0);
  const [selectedGraphAxis, setSelectedGraphAxis] = useState('All-axis');
  const [zoomWindow, setZoomWindow] = useState(5); 

  const [displayTpMode, setDisplayTpMode] = useState('TP Mode');
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // 🔴 FIXED: Removed unused instInput 🔴
  
  const [ipPgInput, setIpPgInput] = useState('0');
  const [tpNameVal, setTpNameVal] = useState('0');
  const [comVal, setComVal] = useState('0');

  const [varOutSel, setVarOutSel] = useState(VAR_MONITOR_LIST[0]);
  const [varInSel, setVarInSel] = useState(VAR_MONITOR_LIST[0]);
  const [simDiNum, setSimDiNum] = useState(DI_SIM_NUM_LIST[0]);
  const [simDiState, setSimDiState] = useState(SIM_STATE_LIST[0]);
  const [simDoNum, setSimDoNum] = useState(DO_SIM_NUM_LIST[0]);
  const [simDoState, setSimDoState] = useState(SIM_STATE_LIST[0]);

  useEffect(() => { if (rs.tp_run_mode) setDisplayTpMode(rs.tp_run_mode); }, [rs.tp_run_mode]);
  const handleZoomIn = () => setZoomWindow(prev => Math.max(1, prev / 1.5));
  const handleZoomOut = () => setZoomWindow(prev => Math.min(20, prev * 1.5));
  const handleZoomReset = () => setZoomWindow(5);
  const handleTpRowClick = useCallback((index) => { setSelectedTpIndex(index); sendCommand('SELECT_TP_INDEX', index); }, [sendCommand]);
  const handlePrRowClick = useCallback((index) => { setSelectedPrIndex(index); sendCommand('SELECT_PR_ROW', index); }, [sendCommand]);
  const handleTpModeSelect = (uiLabel, backendCmd) => { setDisplayTpMode(uiLabel); sendCommand('SET_TP_RUN_MODE', backendCmd); setOpenDropdown(null); };
  const toggleDropdown = (menu) => setOpenDropdown(openDropdown === menu ? null : menu);

  const renderDropdown = (menuKey, options, currentValue, onSelect, btnClass = "ind-input", direction = "down") => (
      <div className="rel-flex">
          <button className={btnClass} onClick={() => toggleDropdown(menuKey)}>{currentValue}</button>
          {openDropdown === menuKey && (
              <div className={`custom-select-menu custom-select-menu-${direction}`}>
                  {options.map(o => (
                      <div key={o} className="custom-select-item" onClick={() => { onSelect(o); setOpenDropdown(null); }}>{o}</div>
                  ))}
              </div>
          )}
      </div>
  );

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
                      {[...Array(16)].map((_, i) => (<div key={i} className="io-led-col"><div className={`io-led ${(diVal >> i) & 1 ? 'on' : 'off'}`}></div><span>{i + 1}</span></div>))}
                  </div>
              </div>
              <div className="io-module-box">
                  <div className="io-module-title" style={{ borderColor: '#039BE5' }}>DIGITAL OUTPUTS (DO 1-16)</div>
                  <div className="io-module-flex">
                      {[...Array(16)].map((_, i) => (<div key={i} className="io-led-col"><div className={`io-led ${(doVal >> i) & 1 ? 'on' : 'off'}`}></div><span>{i + 1}</span></div>))}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderGraphView = () => {
      const gData = rs.graph_data || [];
      const hasData = gData.length > 0;
      const svgWidth = 800; const svgHeight = 250;
      const maxY = 360; const minY = -360;
      const mapY = (val) => { const clamped = Math.max(minY, Math.min(maxY, val || 0)); const norm = (clamped - minY) / (maxY - minY); return svgHeight - (norm * svgHeight); };
      let maxX = 5; if (hasData) { maxX = gData[gData.length - 1][0] || 5; }
      let minX = maxX - zoomWindow; if (minX < 0 && !hasData) minX = 0;
      const mapX = (t) => { const norm = (t - minX) / zoomWindow; return norm * svgWidth; };
      const axisConfig = [
          { name: 'X', index: 1, color: '#FF3B30' }, { name: 'Y', index: 2, color: '#4CAF50' }, { name: 'Z', index: 3, color: '#2196F3' },
          { name: 'J1', index: 4, color: '#FFC107' }, { name: 'J2', index: 5, color: '#9C27B0' }, { name: 'J3', index: 6, color: '#00BCD4' },
          { name: 'J4', index: 7, color: '#8BC34A' }, { name: 'J5', index: 8, color: '#FF9800' }, { name: 'J6', index: 9, color: '#E91E63' },
      ];
      const axesToDraw = selectedGraphAxis === 'All-axis' ? axisConfig : axisConfig.filter(a => a.name === selectedGraphAxis);

      return (
          <div className="modern-graph-container">
              <div className="mg-header">
                  <button className={`mg-toggle-btn ${isGraphReading ? 'mg-stop' : 'mg-start'}`} onClick={() => setGraphReading(!isGraphReading)}>{isGraphReading ? '■ STOP' : '▶ START'}</button>
                  <div className="mg-axis-selector">
                      <label>AXIS:</label>
                      {renderDropdown('GRAPH_AXIS', ["All-axis", "X", "Y", "Z", "J1", "J2", "J3", "J4", "J5", "J6"], selectedGraphAxis, setSelectedGraphAxis, "gas-dropdown", "down")}
                  </div>
              </div>
              <div className="mg-scroll-wrapper">
                  <div className="mg-body">
                      <div className="mg-y-label-col"><span>deg / mm</span></div>
                      <div className="mg-y-axis"><span>360.0</span><span>240.0</span><span>120.0</span><span>0.0</span><span>-120.0</span><span>-240.0</span><span>-360.0</span></div>
                      <div className="mg-plot-wrapper">
                          <svg className="mg-svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                              {hasData && axesToDraw.map(axis => {
                                  const pointsStr = gData.map(d => `${mapX(d[0]||0)},${mapY(d[axis.index]||0)}`).join(' ');
                                  return <polyline key={axis.name} points={pointsStr} fill="none" stroke={axis.color} strokeWidth="2.5" strokeLinejoin="round" />
                              })}
                          </svg>
                      </div>
                      <div className="mg-tools">
                          <button className="mg-tool-btn" onClick={handleZoomIn}>+</button><button className="mg-tool-btn" onClick={handleZoomOut}>-</button><button className="mg-tool-btn" onClick={handleZoomReset}>↺</button>
                      </div>
                  </div>
                  <div className="mg-x-axis"><span>{(minX).toFixed(2)}</span><span>{(maxX).toFixed(2)}</span></div>
              </div>
          </div>
      );
  };

  const renderEncoderOffset = () => (
      <div className="light-panel">
          <div className="encoder-offset-grid">
              {[1,2,3,4,5,6].map(i => (
                  <React.Fragment key={i}>
                      <span className="light-label">J{i}-Encoder Pos</span><input className="light-input" readOnly placeholder="0" />
                      <span className="light-label">J{i}-Encoder Offset</span><input className="light-input" placeholder="0" />
                      <button className="light-btn" onClick={() => sendCommand('ZERO_AXIS', i)}>J{i} - Zero</button><input className="light-input" placeholder="0" />
                  </React.Fragment>
              ))}
          </div>
      </div>
  );

  const renderSettingsView = () => (
      <div className="light-panel">
          <div className="settings-view-grid">
              <span className="light-label">Ace_tm %</span><input className="light-input" defaultValue="50"/>
              <span className="light-label">Dec sp %</span><input className="light-input" defaultValue="100"/>
              <span className="light-label">Dec_tm %</span><input className="light-input" defaultValue="50"/>
              <span className="light-label">Init_vel %</span><input className="light-input" defaultValue="0"/>
              <span className="light-label">Ace sp %</span><input className="light-input" defaultValue="100"/>
              <span className="light-label">end_vel %</span><input className="light-input" defaultValue="0"/>
          </div>
          <button className="light-btn" style={{marginTop: '20px', width: '100px'}}>Ok</button>
      </div>
  );

  const renderDataVariable = () => (
      <div className="light-panel">
          <div className="data-var-wrapper">
              <div className="data-var-col">
                  <div className="data-var-title">Output Monitor</div>
                  <div className="data-var-flex">
                      {renderDropdown('VAR_OUT_SEL', VAR_MONITOR_LIST, varOutSel, (v) => { setVarOutSel(v); sendCommand("SET_VAR_OUTPUT_SELECTOR", v); }, "light-input", "down")}
                      <input className="light-input" value={variableData.outputValue || "0"} readOnly />
                  </div>
              </div>
              <div className="data-var-col">
                  <div className="data-var-title">Input Control</div>
                  <div className="data-var-flex">
                      {renderDropdown('VAR_IN_SEL', VAR_MONITOR_LIST, varInSel, (v) => { setVarInSel(v); sendCommand("SET_VAR_INPUT_SELECTOR", v); }, "light-input", "down")}
                      <input className="light-input" placeholder="Value" onBlur={(e) => sendCommand("SET_VAR_INPUT_VALUE", e.target.value)} />
                  </div>
              </div>
              <div className="data-var-col no-border">
                  <div className="data-var-title">Inst No.</div>
                  <div className="data-var-flex">
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
              <div className="data-var-col no-border">
                  <div className="data-var-title">Simulation</div>
                  <div className="sim-grid">
                      <span className="light-label">DI Sim:</span>
                      {renderDropdown('SIM_DI_NUM', DI_SIM_NUM_LIST, simDiNum, (v) => { setSimDiNum(v); sendCommand("SET_SIM_DI_NUMBER", v); }, "light-input", "down")}
                      {renderDropdown('SIM_DI_ST', SIM_STATE_LIST, simDiState, (v) => { setSimDiState(v); sendCommand("SET_SIM_DI_STATE", v); }, "light-input", "down")}
                      
                      <span className="light-label">DO Sim:</span>
                      {renderDropdown('SIM_DO_NUM', DO_SIM_NUM_LIST, simDoNum, (v) => { setSimDoNum(v); sendCommand("SET_SIM_DO_NUMBER", v); }, "light-input", "down")}
                      {renderDropdown('SIM_DO_ST', SIM_STATE_LIST, simDoState, (v) => { setSimDoState(v); sendCommand("SET_SIM_DO_STATE", v); }, "light-input", "down")}
                      
                      <span className="light-label">Remote:</span><button className="light-btn">rem_h</button><button className="light-btn">rem_l</button>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderMechSettings = () => (
      <div className="light-panel" style={{ padding: 0 }}>
          <table className="mech-table">
              <thead><tr><th></th><th>Dh-nal</th><th>Encod</th><th>Gear R</th><th>deg c</th><th>couple</th><th>joint min</th><th>joint max</th></tr></thead>
              <tbody>
                  {['l1', 'l2', 'l3', 'l4', 'l5', 'l6'].map((row, rIndex) => (
                      <tr key={row}>
                          <td style={{fontWeight: '900', fontSize: '0.8rem'}}>{row}</td>
                          <td><input defaultValue={mechData[`dh_${rIndex}`] || ''} onBlur={e => sendCommand("UPDATE_MECH_SETTING", "", {column_type: "dh", row_index: rIndex, value: e.target.value})} /></td>
                          <td><input defaultValue={mechData[`enc_${rIndex}`] || ''} onBlur={e => sendCommand("UPDATE_MECH_SETTING", "", {column_type: "enc", row_index: rIndex, value: e.target.value})} /></td>
                          <td><input defaultValue={mechData[`gear_${rIndex}`] || ''} onBlur={e => sendCommand("UPDATE_MECH_SETTING", "", {column_type: "gear", row_index: rIndex, value: e.target.value})} /></td>
                          <td><input defaultValue={mechData[`degc_${rIndex}`] || ''} onBlur={e => sendCommand("UPDATE_MECH_SETTING", "", {column_type: "degc", row_index: rIndex, value: e.target.value})} /></td>
                          <td><input defaultValue={mechData[`couple_${rIndex}`] || ''} onBlur={e => sendCommand("UPDATE_MECH_SETTING", "", {column_type: "couple", row_index: rIndex, value: e.target.value})} /></td>
                          <td><input defaultValue={mechData[`jmin_${rIndex}`] || ''} onBlur={e => sendCommand("UPDATE_MECH_SETTING", "", {column_type: "jmin", row_index: rIndex, value: e.target.value})} /></td>
                          <td><input defaultValue={mechData[`jmax_${rIndex}`] || ''} onBlur={e => sendCommand("UPDATE_MECH_SETTING", "", {column_type: "jmax", row_index: rIndex, value: e.target.value})} /></td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );

  return (
    <div className="lp-master-container">

      <div className="lp-top-half">
         <div className="lp-main-category-toggle">
            <button className="lp-main-category-btn" onClick={() => setMainCategory('ROW1')} style={{ background: mainCategory === 'ROW1' ? '#E53935' : 'transparent', color: mainCategory === 'ROW1' ? 'white' : '#888' }}>DIAGNOSTICS (ROW 1)</button>
            <button className="lp-main-category-btn" onClick={() => setMainCategory('ROW2')} style={{ background: mainCategory === 'ROW2' ? '#4CAF50' : 'transparent', color: mainCategory === 'ROW2' ? 'white' : '#888' }}>CONFIG (ROW 2)</button>
         </div>

         <div className="lp-content-area">
            
            {mainCategory === 'ROW1' && (
                <>
                    <div className="lp-sub-tabs-grid">
                       {['Error Pos', 'Ether Cat', 'IO Modules', 'Graph'].map(tab => (
                           <button key={tab} className={`lp-sub-tab-btn ${activeRow1Tab === tab ? 'active-red' : 'inactive'}`} onClick={() => setActiveRow1Tab(tab)}>{tab}</button>
                       ))}
                    </div>
                    <div className="row2-content">
                        {activeRow1Tab === 'Error Pos' && renderErrorPos()}
                        {activeRow1Tab === 'Ether Cat' && renderEtherCat()}
                        {activeRow1Tab === 'IO Modules' && renderIOModules()}
                        {activeRow1Tab === 'Graph' && renderGraphView()}
                    </div>
                </>
            )}

            {mainCategory === 'ROW2' && (
                <>
                    <div className="lp-sub-tabs-grid-3">
                       {['Programs File', 'Encoder Offset', 'Settings View', 'Data Variable', 'Axis Limit', 'Mech Settings'].map(tab => (
                           <button key={tab} className={`lp-sub-tab-btn ${activeRow2Tab === tab ? 'active-green' : 'inactive'}`} onClick={() => setActiveRow2Tab(tab)}>{tab}</button>
                       ))}
                    </div>
                    <div className="row2-content">
                        {activeRow2Tab === 'Programs File' && (
                            <div className="table-container">
                                <div className="table-wrapper">
                                    <div className="table-scroller"><MemoizedTpTableBody tpList={tpList} expandedTable={expandedTable} selectedTpIndex={selectedTpIndex} onRowClick={handleTpRowClick} /></div>
                                </div>
                                <div className="table-wrapper">
                                    <div className="table-scroller"><MemoizedPrTableBody prList={prList} expandedTable={expandedTable} selectedPrIndex={selectedPrIndex} onRowClick={handlePrRowClick} /></div>
                                </div>
                            </div>
                        )}
                        {activeRow2Tab === 'Encoder Offset' && renderEncoderOffset()}
                        {activeRow2Tab === 'Settings View' && renderSettingsView()}
                        {activeRow2Tab === 'Data Variable' && renderDataVariable()}
                        {activeRow2Tab === 'Axis Limit' && renderAxisLimit()}
                        {activeRow2Tab === 'Mech Settings' && renderMechSettings()}
                    </div>
                </>
            )}
         </div>
      </div>

      <div className="lp-bottom-half">
          <div className="lp-bottom-title">PROGRAM OPERATIONS</div>
          
          <div className="lp-operations-wrapper">
              <div className="ind-grid-3">
                  {renderDropdown('TP_MODE', ['TP Mode', 'MOVJ', 'MOVL'], displayTpMode, (v) => handleTpModeSelect(v, v), "ind-btn bg-blue", "up")}
                  {renderDropdown('TP', ['⚙ Insert TP', '📄 Modify TP', '⎋ Delete TP'], '⚙ TP', (v) => {}, "ind-btn bg-purple", "up")}
                  <button className="ind-btn bg-green" onClick={() => sendCommand('RUN_TP')}>▶ RUN TP</button>
              </div>

              <div className="ind-grid-3">
                  <button className="ind-btn bg-dark">📄 OP PG</button>
                  <input className="ind-input" value={rs.program_count_output || '0'} readOnly />
                  {renderDropdown('INST', ['📄 Insert', '📄 Modify Inst', '⎋ Delete Inst'], '📄 INST', (v) => {}, "ind-btn bg-purple", "up")}
              </div>

              <div className="ind-grid-3">
                  <button className="ind-btn bg-green" onClick={() => sendCommand('RUN_PROGRAM')}>▶ RUN INST</button>
                  <button className="ind-btn bg-teal" onClick={() => sendCommand('CALCULATE_TRAJECTORY')}>🧮 CALC</button>
                  <button className="ind-btn bg-dark" onClick={() => sendCommand("SET_PROGRAM_INPUT", ipPgInput)}>📄 IP PG</button>
              </div>

              <div className="ind-grid-3">
                  <input className="ind-input" value={ipPgInput} onChange={(e) => setIpPgInput(e.target.value)} />
                  <button className="ind-btn bg-dark" onClick={() => sendCommand("SET_TP_NAME", tpNameVal)}>🏷 NAME</button>
                  <input className="ind-input" value={tpNameVal} onChange={(e) => setTpNameVal(e.target.value)} />
              </div>
              
              <div className="ind-grid-3">
                  <button className="ind-btn bg-dark" onClick={() => sendCommand("SET_PROGRAM_COMMENT", comVal)}>🌍 COM</button>
                  <input className="ind-input" value={comVal} onChange={(e) => setComVal(e.target.value)} />
                  <button className="ind-btn dummy-btn" disabled>--</button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default LeftPart;