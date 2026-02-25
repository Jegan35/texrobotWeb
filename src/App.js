import React, { useEffect, useState } from 'react';
import { WebSocketProvider, useWebSocket } from './context/WebSocketContext';

// Components
import RobotScene from './RobotScene';
import ControlButtons from './components/ControlButtons';
import RightPart from './components/RightPart';

function AppContent() {
  const { accessFull, setAccessFull, connectionFailed, setConnectionFailed, connectWebSocket } = useWebSocket(); 
  
  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const [reloadFocus, setReloadFocus] = useState('cancel');
  const [failedFocus, setFailedFocus] = useState('retry');

  useEffect(() => { if (connectionFailed) setFailedFocus('retry'); }, [connectionFailed]);
  useEffect(() => { if (showReloadWarning) setReloadFocus('cancel'); }, [showReloadWarning]);

  // --- RELOAD INTERCEPTOR LOGIC ---
  useEffect(() => {
    const handleF5 = (e) => {
      if (e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault(); 
        setShowReloadWarning(true); 
      }
    };
    const handleBeforeUnload = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener('keydown', handleF5);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => { window.removeEventListener('keydown', handleF5); window.removeEventListener('beforeunload', handleBeforeUnload); };
  }, []);

  // --- KEYBOARD MODAL CONTROLS ---
  useEffect(() => {
    if (!showReloadWarning && !accessFull && !connectionFailed) return;
    const handleModalKeys = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      if (showReloadWarning) {
        if (e.key === 'ArrowRight') setReloadFocus('reload');
        else if (e.key === 'ArrowLeft') setReloadFocus('cancel');
        else if (e.key === 'Enter') { e.preventDefault(); reloadFocus === 'cancel' ? setShowReloadWarning(false) : window.location.reload(); } 
        else if (e.key === 'Escape') { e.preventDefault(); setShowReloadWarning(false); }
      }
      else if (accessFull && (e.key === 'Enter' || e.key === 'Escape')) { e.preventDefault(); setAccessFull(false); }
      else if (connectionFailed) {
        if (e.key === 'ArrowRight') setFailedFocus('retry');
        else if (e.key === 'ArrowLeft') setFailedFocus('dismiss');
        else if (e.key === 'Enter') { e.preventDefault(); failedFocus === 'dismiss' ? setConnectionFailed(false) : connectWebSocket(); }
        else if (e.key === 'Escape') { e.preventDefault(); setConnectionFailed(false); }
      }
    };
    window.addEventListener('keydown', handleModalKeys);
    return () => window.removeEventListener('keydown', handleModalKeys);
  }, [showReloadWarning, accessFull, connectionFailed, reloadFocus, failedFocus, setAccessFull, setConnectionFailed, connectWebSocket]);

  return (
    <>
      {/* ==========================================
          WARNING MODALS
          ========================================== */}
      {showReloadWarning && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#1e222b', border: '2px solid #F44336', borderRadius: '8px', padding: '30px', width: '400px', textAlign: 'center', boxShadow: '0px 10px 30px rgba(0,0,0,0.8)' }}>
            <h2 style={{ color: '#F44336', margin: '0 0 15px 0', fontSize: '1.5rem' }}>⚠️ WARNING</h2>
            <p style={{ color: '#ccc', marginBottom: '30px', fontSize: '1.1rem', lineHeight: '1.5' }}>Unsaved data will be reset.<br/><br/>Proceed?</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px' }}>
              <button onClick={()=>setShowReloadWarning(false)} onMouseEnter={()=>setReloadFocus('cancel')} style={{ flex: 1, padding: '12px', backgroundColor: '#333947', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', outline: 'none', border: reloadFocus === 'cancel' ? '2px solid #00bcd4' : '2px solid #555' }}>CANCEL</button>
              <button onClick={()=>window.location.reload()} onMouseEnter={()=>setReloadFocus('reload')} style={{ flex: 1, padding: '12px', backgroundColor: '#F44336', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', outline: 'none', border: reloadFocus === 'reload' ? '2px solid white' : '2px solid transparent' }}>RELOAD</button>
            </div>
          </div>
        </div>
      )}

      {accessFull && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#1e222b', border: '2px solid #FF9800', borderRadius: '8px', padding: '30px', width: '350px', textAlign: 'center', boxShadow: '0px 10px 30px rgba(0,0,0,0.8)' }}>
            <h2 style={{ color: '#FF9800', margin: '0 0 15px 0', fontSize: '1.3rem' }}>⚠️ CONNECTION REJECTED</h2>
            <p style={{ color: '#fff', marginBottom: '30px', fontSize: '1.1rem', fontWeight: 'bold' }}>ACCESS IS TEMPORARY FULL</p>
            <button onClick={()=>setAccessFull(false)} style={{ width: '100%', padding: '12px', backgroundColor: '#FF9800', color: '#111', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', border: '2px solid white', outline: 'none' }}>OK</button>
          </div>
        </div>
      )}

      {connectionFailed && !accessFull && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.8)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#1e222b', border: '2px solid #F44336', borderRadius: '8px', padding: '30px', width: '380px', textAlign: 'center', boxShadow: '0px 10px 30px rgba(0,0,0,0.8)' }}>
            <h2 style={{ color: '#F44336', margin: '0 0 15px 0', fontSize: '1.3rem' }}>⚠️ CONNECTION FAILED</h2>
            <p style={{ color: '#fff', marginBottom: '30px', fontSize: '1.1rem', fontWeight: 'bold' }}>UNABLE TO REACH ROBOT</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button onClick={()=>setConnectionFailed(false)} onMouseEnter={()=>setFailedFocus('dismiss')} style={{ flex: 1, padding: '12px', backgroundColor: '#333947', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', border: failedFocus === 'dismiss' ? '2px solid #00bcd4' : '2px solid #555' }}>DISMISS</button>
              <button onClick={()=>connectWebSocket()} onMouseEnter={()=>setFailedFocus('retry')} style={{ flex: 1, padding: '12px', backgroundColor: '#F44336', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', border: failedFocus === 'retry' ? '2px solid white' : '2px solid transparent' }}>RETRY</button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MAIN CONTAINER
          ========================================== */}
      <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#1a1e29', color: 'white', overflow: 'hidden' }}>
        
        {/* LEFT PANEL */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', borderRight: '2px solid #333' }}>
          
          <div style={{ height: '40px', flexShrink: 0, backgroundColor: '#151822', borderBottom: '2px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
            <div style={{ color: '#00bcd4', fontWeight: '900', fontSize: '1.1rem', letterSpacing: '1.5px', fontFamily: 'Impact, sans-serif' }}>TEXSONICS</div>
            <div style={{ color: '#ccc', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '0.5px' }}>ROBOT CONTROLLER V1.0</div>
          </div>

          {/* DYNAMIC SCENE WRAPPER: Let RobotScene render its own Cartesian & Joints perfectly! */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <RobotScene />
          </div>

          <div style={{ backgroundColor: '#202430', padding: '10px', flexShrink: 0, borderTop: '2px solid #111' }}>
            <ControlButtons />
          </div>
          
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, minWidth: 0, backgroundColor: '#202430', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <RightPart />
        </div>

      </div>
    </>
  );
}

function App() {
  return (
    <WebSocketProvider>
      <AppContent />
    </WebSocketProvider>
  );
}

export default App;