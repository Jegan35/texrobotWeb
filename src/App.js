import React, { useEffect, useState } from 'react';
import { WebSocketProvider, useWebSocket } from './context/WebSocketContext';

// Components
import LeftPart from './components/LeftPart';
import RightPart from './components/RightPart';
// CenterPart removed as per the new 60/40 layout

function AppContent() {
  const { accessFull, setAccessFull, connectionFailed, setConnectionFailed, connectWebSocket } = useWebSocket(); 
  
  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const [reloadFocus, setReloadFocus] = useState('cancel');
  const [failedFocus, setFailedFocus] = useState('retry');

  useEffect(() => { if (connectionFailed) setFailedFocus('retry'); }, [connectionFailed]);
  useEffect(() => { if (showReloadWarning) setReloadFocus('cancel'); }, [showReloadWarning]);

  // 🔴 TABLET LONG PRESS PREVENTION 🔴
  useEffect(() => {
    const disableContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableContextMenu);
    return () => document.removeEventListener("contextmenu", disableContextMenu);
  }, []);

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
      <style>{`
        * { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; touch-action: manipulation; }
        input, textarea { -webkit-user-select: auto; user-select: auto; }
        body { margin: 0; padding: 0; overflow: hidden; background-color: #151822; }
      `}</style>

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
          THE NEW 11-INCH TABLET 2-COLUMN COCKPIT (60 - 40)
          ========================================== */}
      <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#151822', color: 'white', overflow: 'hidden' }}>
        
        {/* 1. LEFT STAGE (60%) - Contains 3D Scene and Operations */}
        <div style={{ width: '60%', backgroundColor: '#1a1e29', display: 'flex', flexDirection: 'column', zIndex: 10, borderRight: '2px solid #111' }}>
          <LeftPart />
        </div>

        {/* 2. RIGHT THUMB ZONE (40%) - Contains Settings, Jog, Table */}
        <div style={{ width: '40%', backgroundColor: '#1a1e29', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
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