import React, { useEffect, useState } from 'react';
import { WebSocketProvider, useWebSocket } from './context/WebSocketContext';

// Components
import RobotScene from './RobotScene';
import RightPart from './components/RightPart';
import LoginPortal from './components/LoginPortal'; 

function AppContent() {
  const { accessFull, setAccessFull, connectionFailed, setConnectionFailed, connectWebSocket, userRole, isConnected, disconnectWebSocket } = useWebSocket(); 
  
  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const [reloadFocus, setReloadFocus] = useState('cancel');
  const [failedFocus, setFailedFocus] = useState('retry');
  
  // 🚀 THE UNIFIED TRAP STATE (Handles both ESC and Tablet Swipes!)
  const [enforceFS, setEnforceFS] = useState(false);

  // 1. Detect if the browser drops out of fullscreen (ESC Key)
  useEffect(() => {
    const handleFSChange = () => {
      if (isConnected && !document.fullscreenElement && !document.webkitFullscreenElement) {
        setEnforceFS(true); 
      }
    };
    
    document.addEventListener("fullscreenchange", handleFSChange);
    document.addEventListener("webkitfullscreenchange", handleFSChange);
    
    return () => {
      document.removeEventListener("fullscreenchange", handleFSChange);
      document.removeEventListener("webkitfullscreenchange", handleFSChange);
    };
  }, [isConnected]);

  // 2. Resume Operation function
  const handleResumeFullscreen = async () => {
    setEnforceFS(false); // Instantly drop the black screen
    try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) await elem.requestFullscreen();
        else if (elem.webkitRequestFullscreen) await elem.webkitRequestFullscreen();
        
        if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
            await window.screen.orientation.lock("landscape").catch(e => console.warn("Orientation lock skipped", e));
        }
    } catch (err) {
        console.warn("Could not resume:", err);
    }
  };

  useEffect(() => { if (connectionFailed) setFailedFocus('retry'); }, [connectionFailed]);
  useEffect(() => { if (showReloadWarning) setReloadFocus('cancel'); }, [showReloadWarning]);

  // ========================================================
  // 🚀 BROWSER LOCKDOWN & SWIPE TRAP
  // ========================================================
  useEffect(() => {
    if (isConnected) {
      // Create the deep history trap
      window.history.pushState({ page: 'robot' }, "", window.location.href);
      window.history.pushState({ page: 'robot' }, "", window.location.href);

      // Intercept the Tablet Edge Swipe!
      const handlePopState = (e) => {
        // Shove them back into the trap
        window.history.pushState({ page: 'robot' }, "", window.location.href);
        // 🚀 THE FIX: Trigger the EXACT SAME Pause screen as the ESC key!
        setEnforceFS(true); 
      };

      window.addEventListener("popstate", handlePopState);

      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "Are you sure? This will instantly cut the robot connection!"; 
      };
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("popstate", handlePopState);
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [isConnected]);

  // --- RELOAD INTERCEPTOR LOGIC (F5 / CTRL+R) ---
  useEffect(() => {
    const handleF5 = (e) => {
      if (e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault(); 
        setShowReloadWarning(true); 
      }
    };
    window.addEventListener('keydown', handleF5);
    return () => window.removeEventListener('keydown', handleF5);
  }, []);

  // --- KEYBOARD MODAL CONTROLS ---
  useEffect(() => {
    if (!showReloadWarning && !accessFull && !connectionFailed && !enforceFS) return;
    
    const handleModalKeys = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      
      if (showReloadWarning) {
        if (e.key === 'ArrowRight') setReloadFocus('reload');
        else if (e.key === 'ArrowLeft') setReloadFocus('cancel');
        else if (e.key === 'Enter') { e.preventDefault(); reloadFocus === 'cancel' ? setShowReloadWarning(false) : window.location.reload(); } 
        else if (e.key === 'Escape') { e.preventDefault(); setShowReloadWarning(false); }
      }
      else if (enforceFS) {
        // Block ESC from doing anything while the pause screen is up
        if (e.key === 'Escape') { e.preventDefault(); }
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
  }, [showReloadWarning, accessFull, connectionFailed, reloadFocus, failedFocus, setAccessFull, setConnectionFailed, connectWebSocket, enforceFS]);

  return (
    <>
      {/* 🚀 THE UNIFIED OPERATION PAUSED / DISCONNECT OVERLAY */}
      {/* 🚀 THE UNIFIED OPERATION PAUSED OVERLAY */}
      {enforceFS && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 999999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
          <div style={{ textAlign: 'center', backgroundColor: '#1e222b', padding: '40px', borderRadius: '12px', borderTop: '4px solid #F44336', boxShadow: '0 15px 35px rgba(0,0,0,0.8)' }}>
            <h1 style={{ color: '#F44336', fontSize: '2.5rem', margin: '0 0 10px 0', textTransform: 'uppercase' }}>⚠️ Operation Paused</h1>
            <div style={{ width: '100%', height: '1px', backgroundColor: '#333', marginBottom: '20px' }}></div>
            <p style={{ color: '#ddd', fontSize: '1.2rem', marginBottom: '35px' }}>Application must run in Fullscreen mode to continue.</p>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button 
                    onClick={handleResumeFullscreen} 
                    style={{ padding: '15px 30px', fontSize: '1.2rem', fontWeight: '900', backgroundColor: '#00bcd4', color: '#111', border: 'none', borderRadius: '8px', cursor: 'pointer', textTransform: 'uppercase', boxShadow: '0 0 20px rgba(0, 188, 212, 0.5)' }}
                >
                  RESUME OPERATION
                </button>
            </div>
          </div>
        </div>
      )}

      {/* WARNING MODALS */}
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

      {/* MAIN CONTAINER */}
      <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#1a1e29', color: 'white', overflow: 'hidden' }}>
        
        {/* LEFT PANEL */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', borderRight: '2px solid #333' }}>
          
          {/* --- DYNAMIC TOP HEADER --- */}
          <div style={{ height: 'clamp(40px, 6vh, 50px)', flexShrink: 0, backgroundColor: '#151822', borderBottom: '2px solid #111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 clamp(10px, 2vw, 20px)', overflow: 'hidden', gap: '10px' }}>
            
           {/* 1. LEFT: BRANDING */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', flexShrink: 1, minWidth: 0 }}>
                <img 
                    src="/logo.png" 
                    alt="TEXSONICS Logo" 
                    style={{ 
                        height: 'clamp(20px, 4vh, 35px)', /* 🚀 Scales perfectly with the header height */
                        width: 'auto', 
                        objectFit: 'contain', /* Keeps the logo proportions perfect */
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' /* Optional: adds a nice subtle shadow */
                    }} 
                />
            </div>

           {/* 2. CENTER: GREEN ROLE INDICATOR */}
            <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                <style>
                    {`
                    @keyframes blinkBulb {
                        0% { opacity: 1; box-shadow: 0 0 6px #00E676, 0 0 12px #00E676; }
                        50% { opacity: 0.2; box-shadow: none; }
                        100% { opacity: 1; box-shadow: 0 0 6px #00E676, 0 0 12px #00E676; }
                    }
                    .live-blink-dot {
                        width: clamp(8px, 1vw, 12px);
                        height: clamp(8px, 1vw, 12px);
                        background-color: #00E676;
                        border-radius: 50%;
                        margin-right: clamp(6px, 1vw, 10px);
                        animation: blinkBulb 1.5s ease-in-out infinite;
                        flex-shrink: 0;
                    }
                    `}
                </style>

                <div style={{ 
                    backgroundColor: '#0a0c11', 
                    border: '2px solid #00E676', 
                    borderRadius: '4px', 
                    padding: 'clamp(4px, 0.5vh, 6px) clamp(10px, 1.5vw, 20px)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    boxShadow: 'inset 0 0 8px rgba(0, 230, 118, 0.1), 0 0 5px rgba(0, 230, 118, 0.3)',
                    whiteSpace: 'nowrap'
                }}>
                    <div className="live-blink-dot"></div>
                    <span style={{ 
                        color: '#fff', 
                        fontWeight: '1000', 
                        fontSize: 'clamp(0.9rem, 1.5vw, 1.3rem)', 
                        letterSpacing: '1px',
                        textShadow: 'none', 
                        WebkitFontSmoothing: 'antialiased', 
                        lineHeight: '1',
                        paddingTop: '2px' 
                    }}>
                        {userRole ? userRole.toUpperCase() : 'CONNECTED'}
                    </span>
                </div>
            </div>

            {/* 3. RIGHT: VERSION */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 1, minWidth: 0 }}>
                <div style={{ color: '#ccc', fontWeight: 'bold', fontSize: 'clamp(0.6rem, 1.2vw, 0.85rem)', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>ROBOT CONTROLLER V1.0</div>
            </div>

          </div>

          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <RobotScene /> 
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

// MAIN ROUTER
function MainRouter() {
  const { isConnected } = useWebSocket();

  if (!isConnected) {
      return <LoginPortal />;
  }

  return <AppContent />;
}

// APP WRAPPER
function App() {
  return (
    <WebSocketProvider>
      <MainRouter />
    </WebSocketProvider>
  );
}

export default App;