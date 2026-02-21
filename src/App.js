import React from 'react';
import { WebSocketProvider } from './context/WebSocketContext';

// Components
import RobotScene from './RobotScene';
import ControlButtons from './components/ControlButtons';
import RightPart from './components/RightPart';

function App() {
  return (
    <WebSocketProvider>
      {/* MAIN CONTAINER: Full Screen */}
      <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#1a1e29', color: 'white', overflow: 'hidden' }}>
        
        {/* =========================================
            LEFT PANEL (Exactly 50% width)
            ========================================= */}
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column', borderRight: '2px solid #333' }}>
          
          {/* TOP: 3D Robot Scene (Takes up remaining vertical space) */}
          <div style={{ flex: 1, position: 'relative' }}>
            <RobotScene />
          </div>

          {/* BOTTOM: Control Buttons Panel (Fixed height at bottom) */}
          <div style={{ backgroundColor: '#202430', padding: '10px', borderTop: '2px solid #111' }}>
            <ControlButtons />
          </div>

        </div>

        {/* =========================================
            RIGHT PANEL (Exactly 50% width)
            ========================================= */}
        <div style={{ width: '50%', backgroundColor: '#202430', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          
          <RightPart />

        </div>

      </div>
    </WebSocketProvider>
  );
}

export default App;