import React, { useEffect, useState, useRef } from 'react';
import { WebSocketProvider } from './context/WebSocketContext';

import RobotScene from './RobotScene';
import ControlButtons from './components/ControlButtons';
import RightPart from './components/RightPart';

function App() {
  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const [modalFocus, setModalFocus] = useState('cancel');

  useEffect(() => {
    const handleF5 = (e) => {
      if (e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault(); 
        setShowReloadWarning(true); 
        setModalFocus('cancel');
      }
    };
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Changes you made may not be saved."; 
    };
    window.addEventListener('keydown', handleF5);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('keydown', handleF5);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!showReloadWarning) return;
    const handleModalKeys = (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); setModalFocus('reload'); } 
      else if (e.key === 'ArrowLeft') { e.preventDefault(); setModalFocus('cancel'); } 
      else if (e.key === 'Enter') {
        e.preventDefault();
        if (modalFocus === 'cancel') setShowReloadWarning(false);
        else if (modalFocus === 'reload') window.location.reload();
      } 
      else if (e.key === 'Escape') { e.preventDefault(); setShowReloadWarning(false); }
    };
    window.addEventListener('keydown', handleModalKeys);
    return () => window.removeEventListener('keydown', handleModalKeys);
  }, [showReloadWarning, modalFocus]);

  const forceReload = () => window.location.reload();
  const cancelReload = () => setShowReloadWarning(false);

  return (
    <WebSocketProvider>
      {showReloadWarning && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#1e222b', border: '2px solid #F44336', borderRadius: '8px', padding: '30px', width: '400px', textAlign: 'center', boxShadow: '0px 10px 30px rgba(0,0,0,0.8)' }}>
            <h2 style={{ color: '#F44336', margin: '0 0 15px 0', fontSize: '1.5rem' }}>⚠️ WARNING</h2>
            <p style={{ color: '#ccc', marginBottom: '30px', fontSize: '1.1rem', lineHeight: '1.5' }}>
              If you reload this page, the WebSocket connection will drop and all unsaved robot data will be reset.<br/><br/>Are you sure you want to proceed?
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
              <button onClick={cancelReload} onMouseEnter={() => setModalFocus('cancel')} style={{ flex: 1, padding: '12px', backgroundColor: '#333947', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', outline: 'none', transition: 'all 0.1s', border: modalFocus === 'cancel' ? '2px solid #00bcd4' : '2px solid #555', boxShadow: modalFocus === 'cancel' ? '0 0 15px rgba(0, 188, 212, 0.6)' : 'none', transform: modalFocus === 'cancel' ? 'scale(1.05)' : 'scale(1)' }}>CANCEL</button>
              <button onClick={forceReload} onMouseEnter={() => setModalFocus('reload')} style={{ flex: 1, padding: '12px', backgroundColor: '#F44336', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', outline: 'none', transition: 'all 0.1s', border: modalFocus === 'reload' ? '2px solid white' : '2px solid transparent', boxShadow: modalFocus === 'reload' ? '0 0 15px rgba(244, 67, 54, 0.8)' : 'none', transform: modalFocus === 'reload' ? 'scale(1.05)' : 'scale(1)' }}>RELOAD ANYWAY</button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#1a1e29', color: 'white', overflow: 'hidden' }}>
        
        {/* LEFT PANEL */}
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column', borderRight: '2px solid #333' }}>
          
          {/* === THE REAL TOP HEADER YOU REQUESTED === */}
          <div style={{ height: '40px', backgroundColor: '#151822', borderBottom: '2px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
            <div style={{ color: '#00bcd4', fontWeight: '900', fontSize: '1.1rem', letterSpacing: '1.5px', fontFamily: 'Impact, sans-serif' }}>
              TECSONICS
            </div>
            <div style={{ color: '#ccc', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
              ROBOT CONTROLLER V1.0
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            <RobotScene />
          </div>
          <div style={{ backgroundColor: '#202430', padding: '10px', borderTop: '2px solid #111' }}>
            <ControlButtons />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ width: '50%', backgroundColor: '#202430', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <RightPart />
        </div>

      </div>
    </WebSocketProvider>
  );
}

export default App;