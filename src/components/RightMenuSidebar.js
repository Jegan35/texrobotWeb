// src/components/RightMenuSidebar.js
import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import './RightPart.css'; // <-- ALL CSS MOVED HERE

const RightMenuSidebar = ({ isOpen, onClose, onSelectView, activeView }) => {
  const { sendCommand } = useWebSocket();
  const [menuLevel, setMenuLevel] = useState('MAIN'); // MAIN, JOG_SUB, MOVE_SUB
  const [activeMode, setActiveMode] = useState(''); // Tracks AUTO, MANUAL, REMOTE selection

  if (!isOpen) return null;

  // FIXED: Now sends exact commands like "SET_AUTO" instead of "SET_MODE"
  const handleModeClick = (mode) => {
    sendCommand("SET_" + mode, ""); 
    setActiveMode(mode); // Set Active to show white border
    setMenuLevel('MAIN');
  };

  const handleViewClick = (viewName) => {
      onSelectView(viewName);
      setActiveMode(''); // Clear mode if changing views
      setMenuLevel('MAIN');
  }

  // Determine active states for highlighting
  const isSpeedActive = activeView === 'SPEED CONFIG';
  const isJogActive = activeView && activeView.includes('JOG');
  const isMoveActive = activeView && activeView.includes('MOVE');

  return (
        <div className="rms-container">
            <div className="rms-title">MENUS</div>
            
            {menuLevel === 'MAIN' && (
                <>
                    <button className={`rms-btn btn-speed ${isSpeedActive ? 'rms-active' : ''}`} onClick={() => handleViewClick('SPEED CONFIG')}><span>⏱</span> SPEED</button>
                    <button className={`rms-btn btn-jog ${isJogActive ? 'rms-active' : ''}`} onClick={() => setMenuLevel('JOG_SUB')}><span>〰</span> JOG <span>▶</span></button>
                    <button className={`rms-btn btn-move ${isMoveActive ? 'rms-active' : ''}`} onClick={() => setMenuLevel('MOVE_SUB')}><span>🎯</span> MOVE <span>▶</span></button>
                    
                    {/* Fixed to send correct backend requests with active indication */}
                    <button className={`rms-btn btn-auto ${activeMode === 'AUTO' ? 'rms-active' : ''}`} onClick={() => handleModeClick('AUTO')}><span>↻</span> AUTO</button>
                    <button className={`rms-btn btn-manual ${activeMode === 'MANUAL' ? 'rms-active' : ''}`} onClick={() => handleModeClick('MANUAL')}><span>⚙</span> MANUAL</button>
                    <button className={`rms-btn btn-remote ${activeMode === 'REMOTE' ? 'rms-active' : ''}`} onClick={() => handleModeClick('REMOTE')}><span>🌍</span> REMOTE</button>
                </>
            )}

            {menuLevel === 'JOG_SUB' && (
                <>
                    <button className="rms-btn btn-back" onClick={() => setMenuLevel('MAIN')}><span>◄</span> BACK TO MENUS</button>
                    <button className={`rms-btn btn-jog ${activeView === 'JOG JOINTS' ? 'rms-active' : ''}`} onClick={() => handleViewClick('JOG JOINTS')}>JOINTS</button>
                    <button className={`rms-btn btn-jog ${activeView === 'JOG CARTESIAN' ? 'rms-active' : ''}`} onClick={() => handleViewClick('JOG CARTESIAN')}>CARTESIAN</button>
                </>
            )}

            {menuLevel === 'MOVE_SUB' && (
                <>
                    <button className="rms-btn btn-back" onClick={() => setMenuLevel('MAIN')}><span>◄</span> BACK TO MENUS</button>
                    <button className={`rms-btn btn-move ${activeView === 'MOVE JOINTS' ? 'rms-active' : ''}`} onClick={() => handleViewClick('MOVE JOINTS')}>JOINTS</button>
                    <button className={`rms-btn btn-move ${activeView === 'MOVE CARTESIAN' ? 'rms-active' : ''}`} onClick={() => handleViewClick('MOVE CARTESIAN')}>CARTESIAN</button>
                </>
            )}

            <button className="rms-btn btn-close" onClick={onClose}><span>◄</span> CLOSE</button>
        </div>
  );
};
//control panel .com ghun
export default RightMenuSidebar;