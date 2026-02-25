import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

const ControlButtons = () => {
  const { sendCommand, robotState } = useWebSocket();

  const rs = robotState || {};
  const servoOn = rs.servo_on === true;
  const isStarted = rs.started === true;
  const isRunning = rs.paused === false;
  const mode = rs.mode || "MODE";
  const currentError = rs.error_message || "No error";
  
  // LIVE SPEED FROM BACKEND
  const speedOp = rs.speed_op !== undefined ? Number(rs.speed_op).toFixed(1) : "0.0";
  
  const tpFiles = rs.tp_file_list || [];
  const prFiles = rs.pr_file_list || [];
  const currentTp = rs.current_tp_name || "None";
  const currentPr = rs.current_pr_name || "None";

  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isSystemOkOpen, setIsSystemOkOpen] = useState(false);

  // --- FILE MODAL STATES ---
  const [fileModalStep, setFileModalStep] = useState('CLOSED'); 
  const [fileType, setFileType] = useState('TP'); 
  const [fileNameInput, setFileNameInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadio, setSelectedRadio] = useState('');
  const [selectedChecks, setSelectedChecks] = useState({});

  // --- TRACK LAST ACTION STRINGS ---
  const [lastAction, setLastAction] = useState({ TP: '', PR: '' });

  useEffect(() => {
      if (fileModalStep === 'OPEN' || fileModalStep === 'DELETE') {
          sendCommand(`REFRESH_${fileType}_FILES`, "");
      }
  }, [fileModalStep, fileType, sendCommand]);

  const handleServoToggle = () => sendCommand("TOGGLE_SERVO", "");
  const handleHomeClick = () => sendCommand("TRIGGER_HOME", "");
  const handleRunPauseToggle = () => sendCommand("TOGGLE_PAUSE", "");
  const handleStartStopToggle = () => sendCommand("TOGGLE_START", "");
  const handleExitClick = () => sendCommand("EXIT", "");
  const handleModeSelect = (m) => { setIsModeMenuOpen(false); sendCommand(m === "SIM" ? "SET_SIM" : "SET_REAL", ""); };
  const handleErrorClear = () => sendCommand("CLEAR_ERRORS", "");
  const handleMarkClear = () => sendCommand("CLEAR_MARKS", "");

  const openFileMenu = () => {
      setFileModalStep('TYPE');
      sendCommand("REFRESH_TP_FILES", "");
      sendCommand("REFRESH_PR_FILES", "");
  };
  
  const selectType = (type) => {
      setFileType(type);
      setFileModalStep('OPS');
      sendCommand(`REFRESH_${type}_FILES`, "");
  };

  const forceRefresh = () => sendCommand(`REFRESH_${fileType}_FILES`, "");

  const activeRawList = fileType === 'TP' ? tpFiles : prFiles;
  const parsedList = (Array.isArray(activeRawList) ? activeRawList : []).map(item => {
      const parts = typeof item === 'string' ? item.split('|') : [item, ''];
      return { name: parts[0] || 'Unknown', date: parts[1] || '' };
  });

  const filteredList = parsedList.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const fileExists = parsedList.some(f => f.name.toLowerCase() === fileNameInput.trim().toLowerCase());
  const canCreate = fileNameInput.trim().length > 0 && !fileExists;

  // --- ACTION EXECUTORS & UI STRING UPDATERS ---
  const executeNewFile = () => {
      if (!canCreate) return;
      const cleanName = fileNameInput.trim();
      sendCommand(`NEW_${fileType}_FILE`, cleanName);
      setLastAction(prev => ({ ...prev, [fileType]: `Create ${fileType}: ${cleanName}` }));
      setFileModalStep('CLOSED');
      setFileNameInput('');
  };

  const executeOpenFile = () => {
      if (!selectedRadio) return;
      sendCommand(`OPEN_${fileType}_FILE`, selectedRadio);
      setLastAction(prev => ({ ...prev, [fileType]: `Open ${fileType}: ${selectedRadio}` }));
      setFileModalStep('CLOSED');
      setSelectedRadio('');
      setSearchQuery('');
  };

  const executeDeleteFiles = () => {
      const filesToDelete = Object.keys(selectedChecks).filter(k => selectedChecks[k]);
      if(filesToDelete.length === 0) return;

      filesToDelete.forEach(file => sendCommand(`DELETE_${fileType}_FILE`, file));
      
      const statusName = filesToDelete.length === 1 ? filesToDelete[0] : `${filesToDelete.length} files`;
      setLastAction(prev => ({ ...prev, [fileType]: `Deleted ${fileType}: ${statusName}` }));

      setTimeout(() => sendCommand(`REFRESH_${fileType}_FILES`, ""), 500);
      setSelectedChecks({});
      setFileModalStep('OPS');
  };

  const errLower = currentError.toLowerCase().trim();
  const hasError = !["no error", "no active errors", "error cleared"].includes(errLower) && errLower !== "";

  const renderFileModal = () => {
      if (fileModalStep === 'CLOSED') return null;

      return (
          <div style={{ position: 'absolute', bottom: '110%', left: 0, width: '300px', background: '#151822', border: '2px solid #333', zIndex: 9999, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.9)' }}>
              {fileModalStep === 'TYPE' && (
                  <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ color: '#aaa', fontWeight: '900', textAlign: 'center', fontSize: '0.85rem', marginBottom: '5px', letterSpacing: '1px' }}>SELECT TYPE</div>
                      <button className="btn" style={{ background: '#00897B', minHeight: '40px' }} onClick={() => selectType('TP')}>TARGET POINT FILES</button>
                      <button className="btn" style={{ background: '#039BE5', minHeight: '40px' }} onClick={() => selectType('PR')}>PROGRAM FILES</button>
                      <button className="btn" style={{ background: '#7E57C2', minHeight: '40px' }}>TRAJECTORY FILES</button>
                      <button className="btn" style={{ background: '#2b303b', marginTop: '10px', minHeight: '40px' }} onClick={() => setFileModalStep('CLOSED')}>CLOSE</button>
                  </div>
              )}

              {fileModalStep === 'OPS' && (
                  <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ color: '#aaa', fontWeight: '900', textAlign: 'center', fontSize: '0.85rem', marginBottom: '5px', letterSpacing: '1px', textTransform: 'uppercase' }}>{fileType} OPERATIONS</div>
                      <button className="btn" style={{ background: '#43A047', minHeight: '40px' }} onClick={() => { setFileModalStep('NEW'); setFileNameInput(''); }}>NEW {fileType} FILE</button>
                      <button className="btn" style={{ background: '#039BE5', minHeight: '40px' }} onClick={() => { setFileModalStep('OPEN'); setSearchQuery(''); }}>OPEN {fileType} FILE</button>
                      <button className="btn" style={{ background: '#E53935', minHeight: '40px' }} onClick={() => { setFileModalStep('DELETE'); setSelectedChecks({}); }}>DELETE {fileType} FILE</button>
                      <button className="btn" style={{ background: '#2b303b', marginTop: '10px', minHeight: '40px' }} onClick={() => setFileModalStep('TYPE')}>BACK</button>
                  </div>
              )}

              {fileModalStep === 'NEW' && (
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ color: '#00E676', fontWeight: '900', textAlign: 'center', fontSize: '1rem' }}>CREATE NEW {fileType}</div>
                      <div>
                          <div style={{ color: '#aaa', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '5px' }}>FILENAME</div>
                          <input type="text" placeholder="e.g., Weld_Path_01" value={fileNameInput} onChange={(e) => setFileNameInput(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px', background: '#111', border: fileExists ? '2px solid #E53935' : '1px solid #444', color: 'white', borderRadius: '4px', outline: 'none', fontWeight: 'bold' }} />
                          {fileExists && <div style={{ color: '#E53935', fontSize: '0.7rem', marginTop: '5px', fontWeight: 'bold' }}>File already exists!</div>}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button className="btn" style={{ background: '#E53935', minHeight: '40px' }} onClick={() => setFileModalStep('OPS')}>CANCEL</button>
                          <button className="btn" style={{ background: canCreate ? '#43A047' : '#333', color: canCreate ? 'white' : '#888', minHeight: '40px' }} onClick={executeNewFile}>CREATE</button>
                      </div>
                  </div>
              )}

              {fileModalStep === 'OPEN' && (
                  <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '400px' }}>
                      <div style={{ padding: '15px', borderBottom: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ color: '#039BE5', fontWeight: '900', fontSize: '1rem' }}>SELECT TO OPEN</div>
                              <button onClick={forceRefresh} style={{ background: '#333', color: 'white', border: '1px solid #555', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>↻ REFRESH</button>
                          </div>
                          <input type="text" placeholder={`Search ${fileType} files...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', background: '#111', border: '1px solid #444', color: 'white', borderRadius: '4px', outline: 'none' }} />
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '250px' }}>
                          {filteredList.map(f => (
                              <label key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', cursor: 'pointer', background: selectedRadio === f.name ? 'rgba(3,155,229,0.2)' : '#1a1e29', borderLeft: selectedRadio === f.name ? '4px solid #039BE5' : '4px solid transparent', borderRadius: '4px', transition: '0.1s' }}>
                                  <input type="radio" name="file_open" checked={selectedRadio === f.name} onChange={() => setSelectedRadio(f.name)} style={{ transform: 'scale(1.2)', accentColor: '#039BE5' }} />
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ color: selectedRadio === f.name ? '#039BE5' : 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>{f.name}</span>
                                      <span style={{ color: '#aaa', fontSize: '0.7rem' }}>Created: {f.date}</span>
                                  </div>
                              </label>
                          ))}
                          {filteredList.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No files found.</div>}
                      </div>
                      <div style={{ padding: '15px', borderTop: '1px solid #333', display: 'flex', gap: '10px' }}>
                          <button className="btn" style={{ background: '#2b303b', minHeight: '40px' }} onClick={() => { setSelectedRadio(''); setFileModalStep('OPS'); }}>RETURN TO MENU</button>
                          <button className="btn" style={{ background: selectedRadio ? '#039BE5' : '#333', color: selectedRadio ? 'white' : '#888', minHeight: '40px' }} onClick={executeOpenFile}>OPEN FILE</button>
                      </div>
                  </div>
              )}

              {fileModalStep === 'DELETE' && (
                  <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '400px' }}>
                      <div style={{ padding: '15px', borderBottom: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ color: '#E53935', fontWeight: '900', fontSize: '1rem' }}>SELECT TO DELETE</div>
                              <button onClick={forceRefresh} style={{ background: '#333', color: 'white', border: '1px solid #555', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}>↻ REFRESH</button>
                          </div>
                          <input type="text" placeholder={`Search ${fileType} files...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '8px', background: '#111', border: '1px solid #444', color: 'white', borderRadius: '4px', outline: 'none' }} />
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '250px' }}>
                          {filteredList.map(f => (
                              <label key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', cursor: 'pointer', background: selectedChecks[f.name] ? 'rgba(229,57,53,0.2)' : '#1a1e29', borderLeft: selectedChecks[f.name] ? '4px solid #E53935' : '4px solid transparent', borderRadius: '4px', transition: '0.1s' }}>
                                  <input type="checkbox" checked={!!selectedChecks[f.name]} onChange={(e) => setSelectedChecks({...selectedChecks, [f.name]: e.target.checked})} style={{ transform: 'scale(1.2)', accentColor: '#E53935' }} />
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ color: selectedChecks[f.name] ? '#E53935' : 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>{f.name}</span>
                                      <span style={{ color: '#aaa', fontSize: '0.7rem' }}>Created: {f.date}</span>
                                  </div>
                              </label>
                          ))}
                          {filteredList.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>No files found.</div>}
                      </div>
                      <div style={{ padding: '15px', borderTop: '1px solid #333', display: 'flex', gap: '10px' }}>
                          <button className="btn" style={{ background: '#2b303b', minHeight: '40px' }} onClick={() => { setSelectedChecks({}); setFileModalStep('OPS'); }}>RETURN TO MENU</button>
                          <button className="btn" style={{ background: Object.values(selectedChecks).some(v=>v) ? '#E53935' : '#333', color: Object.values(selectedChecks).some(v=>v) ? 'white' : '#888', minHeight: '40px' }} onClick={executeDeleteFiles}>DELETE</button>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  return (
    <>
      <style>{`
        .control-buttons-container { display: flex; flex-direction: column; gap: 12px; width: 100%; padding-top: 5px; }
        .btn-row { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; width: 100%; align-items: stretch; }
        .span-2 { grid-column: span 2; }
        
        .btn { 
          width: 100%; min-height: 45px; box-sizing: border-box; padding: 5px 2px; 
          border-radius: 6px; font-weight: 900; 
          font-size: clamp(8px, 0.85vw, 13px); color: white; cursor: pointer; 
          display: flex; align-items: center; justify-content: center; text-align: center;
          text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(0,0,0,0.8);
          transition: all 0.1s ease-in-out; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .btn:hover { filter: brightness(1.15); } 
        .btn:active { transform: translateY(4px); box-shadow: 0 0px 0px rgba(0,0,0,0.8), inset 0 3px 5px rgba(0,0,0,0.6) !important; }

        .btn-dark { background: linear-gradient(180deg, #505868 0%, #2b303b 100%); box-shadow: 0 4px 0 #151822, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2); }
        .btn-green { background: linear-gradient(180deg, #4CAF50 0%, #1B5E20 100%); box-shadow: 0 4px 0 #003300, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); text-shadow: 0 0 5px rgba(0,255,0,0.5); }
        .btn-green-full { background: linear-gradient(180deg, #00E676 0%, #1B5E20 100%); box-shadow: 0 4px 0 #003300, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.4); color: #000; text-shadow: none; }
        .btn-blue { background: linear-gradient(180deg, #42A5F5 0%, #0D47A1 100%); box-shadow: 0 4px 0 #002171, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); }
        .btn-yellow { background: linear-gradient(180deg, #FFEE58 0%, #F57F17 100%); box-shadow: 0 4px 0 #BC5100, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.5); color: #111; text-shadow: none; }
        .btn-orange { background: linear-gradient(180deg, #FFA726 0%, #E65100 100%); box-shadow: 0 4px 0 #822C00, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
        .btn-red { background: linear-gradient(180deg, #EF5350 0%, #B71C1C 100%); box-shadow: 0 4px 0 #7F0000, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); text-shadow: 0 0 5px rgba(255,0,0,0.5); }
        .btn-purple { background: linear-gradient(180deg, #BA68C8 0%, #6A1B9A 100%); box-shadow: 0 4px 0 #4A148C, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); }
        .btn-pink { background: linear-gradient(180deg, #F06292 0%, #880E4F 100%); box-shadow: 0 4px 0 #4A0024, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); }
        .btn-purple-dark { background: linear-gradient(180deg, #9575CD 0%, #4527A0 100%); box-shadow: 0 4px 0 #311B92, 0 5px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3); }
        
        .btn-outline-green { background: #1a1e29; border: 2px solid #4CAF50; color: #4CAF50; box-shadow: 0 4px 0 #003300, 0 5px 5px rgba(0,0,0,0.4); text-shadow: 0 0 5px rgba(76,175,80,0.4); }

        .info-box { 
          width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; padding: 0 5px; 
          border-radius: 4px; font-size: clamp(8px, 0.8vw, 12px); font-family: 'Consolas', monospace; 
          overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-weight: bold;
        }
        .dark-box { background-color: #0a0e17; border: 2px solid #333; border-top-color: #000; border-left-color: #000; color: #00bcd4; box-shadow: inset 0 3px 6px rgba(0,0,0,0.8); text-shadow: 0 0 3px rgba(0,188,212,0.4); }
        .empty-box { background-color: #111; border: 1px dashed #444; color: #555; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); }
        .text-green { background-color: #0a0e17; border: 2px solid #333; border-top-color: #000; border-left-color: #000; color: #00e676; font-size: clamp(10px, 1vw, 14px); text-shadow: 0 0 5px rgba(0,230,118,0.5); box-shadow: inset 0 3px 6px rgba(0,0,0,0.8); }
        
        .popup-menu-btn { width: 100%; padding: 12px; background: transparent; color: white; border: none; cursor: pointer; font-weight: 900; font-size: 1rem; transition: 0.1s; text-transform: uppercase; }
        .popup-menu-btn:hover { background: #4CAF50; color: #000; }
      `}</style>

      <div className="control-buttons-container">
        
        <div className="btn-row">
          <button className={`btn ${servoOn ? 'btn-green' : 'btn-dark'}`} onClick={handleServoToggle}>⚡ SERVO: {servoOn ? 'ON' : 'OFF'}</button>
          <button className="btn btn-blue" onClick={handleHomeClick}>⌂ HOME</button>
          <button className={`btn ${isRunning ? 'btn-green' : 'btn-yellow'}`} onClick={handleRunPauseToggle}>{isRunning ? '⏵ RUN' : '⏸ PAUSE'}</button>
          <button className={`btn ${isStarted ? 'btn-red' : 'btn-orange'}`} onClick={handleStartStopToggle}>{isStarted ? '⏹ STOP' : '⏻ START'}</button>
          <button className="btn btn-red" onClick={handleExitClick}>⎋ EXIT</button>
          <div style={{ position: "relative", display: "flex", width: "100%" }}>
            <button className="btn btn-outline-green" style={{ width: "100%" }} onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}>{mode}</button>
            {isModeMenuOpen && (
              <div style={{ position: 'absolute', bottom: '120%', left: 0, width: '100%', background: '#111', border: '2px solid #4CAF50', zIndex: 1000, borderRadius: '6px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.8)' }}>
                <button className="popup-menu-btn" style={{ borderBottom: '1px solid #333' }} onClick={() => handleModeSelect('SIM')}>SIM</button>
                <button className="popup-menu-btn" onClick={() => handleModeSelect('REAL')}>REAL</button>
              </div>
            )}
          </div>
        </div>

        <div className="btn-row">
          <div style={{ position: "relative", display: "flex", width: "100%" }}>
              <button className="btn btn-purple" style={{ width: "100%" }} onClick={openFileMenu}>📁 FILES</button>
              {renderFileModal()}
          </div>
          <div className="info-box dark-box" title={lastAction.TP || `Open TP: ${currentTp}`}>
              {lastAction.TP || `Open TP: ${currentTp}`}
          </div>
          <div className="info-box dark-box" title={lastAction.PR || `Open PR: ${currentPr}`}>
              {lastAction.PR || `Open PR: ${currentPr}`}
          </div>
          <div className="info-box dark-box">Op: ppp</div>
          <button className="btn btn-pink">+ TOOLS</button>
          <div className="info-box empty-box">Tool...</div>
        </div>

        <div className="btn-row">
          <div className="span-2" style={{ position: "relative", display: "flex", width: "100%" }}>
            <button className={`btn ${hasError ? 'btn-orange' : 'btn-green-full'}`} style={{ width: "100%" }} onClick={() => setIsSystemOkOpen(!isSystemOkOpen)}>
              {hasError ? "⚠️ VIEW ERROR" : "✓ SYSTEM OK"}
            </button>
            {isSystemOkOpen && (
              <div style={{ position: 'absolute', bottom: '120%', left: 0, width: '200%', background: '#1e222b', border: hasError ? '2px solid #FF9800' : '2px solid #00E676', zIndex: 1000, borderRadius: '6px', padding: '15px', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.9)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: hasError ? '#FF9800' : '#00E676', textTransform: 'uppercase', letterSpacing: '1px' }}>SYSTEM STATUS</h4>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{currentError}</p>
                <button style={{ marginTop: '15px', width: '100%', padding: '10px', background: '#333', color: 'white', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }} onClick={() => setIsSystemOkOpen(false)}>CLOSE</button>
              </div>
            )}
          </div>

          <button className="btn btn-red" onClick={handleErrorClear}>✕ ERR CLR</button>
          <button className="btn btn-yellow" onClick={handleMarkClear}>✕ MRK CLR</button>
          <button className="btn btn-purple-dark">⟳ RESET</button>
          
          {/* FINALLY: THE LIVE BACKEND SPEED READOUT */}
          <div className="info-box text-green">Spd: {speedOp}%</div>
        </div>
      </div>
    </>
  );
};

export default ControlButtons;