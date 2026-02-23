import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

const RightMenuSidebar = ({ isOpen, onClose, onSelectView }) => {
  const { sendCommand } = useWebSocket();
  const [menuLevel, setMenuLevel] = useState('MAIN'); // MAIN, JOG_SUB, MOVE_SUB

  if (!isOpen) return null;

  // FIXED: Now sends exact commands like "SET_AUTO" instead of "SET_MODE"
  const handleModeClick = (mode) => {
    sendCommand("SET_" + mode, ""); 
    setMenuLevel('MAIN');
  };

  const handleViewClick = (viewName) => {
      onSelectView(viewName);
      setMenuLevel('MAIN');
  }

  return (
    <>
        <style>{`
            .rms-container {
                width: 260px; height: 100%; background-color: #1a1e29; border-left: 2px solid #333;
                display: flex; flex-direction: column; padding: 15px; box-sizing: border-box;
                flex-shrink: 0; 
                overflow-y: auto;
            }
            .rms-title { color: white; font-weight: 900; font-size: 1rem; margin-bottom: 20px; letter-spacing: 1px; }
            .rms-btn {
                width: 100%; padding: 15px; margin-bottom: 10px; border: none; border-radius: 4px;
                color: white; font-weight: 900; font-size: 1rem; text-transform: uppercase;
                display: flex; justify-content: space-between; align-items: center; cursor: pointer;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: transform 0.1s;
            }
            .rms-btn:active { transform: scale(0.97); }
            
            .btn-speed { background: linear-gradient(to right, #546e7a, #78909c); }
            .btn-jog { background: linear-gradient(to right, #0288d1, #03a9f4); }
            .btn-move { background: linear-gradient(to right, #2e7d32, #4caf50); }
            .btn-auto { background: linear-gradient(to right, #7b1fa2, #9c27b0); }
            .btn-manual { background: linear-gradient(to right, #4527a0, #673ab7); }
            .btn-remote { background: linear-gradient(to right, #e65100, #ff9800); }
            .btn-close { background: linear-gradient(to right, #c62828, #f44336); margin-top: auto; }
            .btn-back { background: #333947; color: #fff; border: 1px solid #555; }
        `}</style>
        
        <div className="rms-container">
            <div className="rms-title">MENUS</div>
            
            {menuLevel === 'MAIN' && (
                <>
                    <button className="rms-btn btn-speed" onClick={() => handleViewClick('SPEED CONFIG')}><span>⏱</span> SPEED</button>
                    <button className="rms-btn btn-jog" onClick={() => setMenuLevel('JOG_SUB')}><span>〰</span> JOG <span>▶</span></button>
                    <button className="rms-btn btn-move" onClick={() => setMenuLevel('MOVE_SUB')}><span>🎯</span> MOVE <span>▶</span></button>
                    
                    {/* Fixed to send correct backend requests */}
                    <button className="rms-btn btn-auto" onClick={() => handleModeClick('AUTO')}><span>↻</span> AUTO</button>
                    <button className="rms-btn btn-manual" onClick={() => handleModeClick('MANUAL')}><span>⚙</span> MANUAL</button>
                    <button className="rms-btn btn-remote" onClick={() => handleModeClick('REMOTE')}><span>🌍</span> REMOTE</button>
                </>
            )}

            {menuLevel === 'JOG_SUB' && (
                <>
                    <button className="rms-btn btn-back" onClick={() => setMenuLevel('MAIN')}><span>◄</span> BACK TO MENUS</button>
                    <button className="rms-btn btn-jog" onClick={() => handleViewClick('JOG JOINTS')}>JOINTS</button>
                    <button className="rms-btn btn-jog" onClick={() => handleViewClick('JOG CARTESIAN')}>CARTESIAN</button>
                </>
            )}

            {menuLevel === 'MOVE_SUB' && (
                <>
                    <button className="rms-btn btn-back" onClick={() => setMenuLevel('MAIN')}><span>◄</span> BACK TO MENUS</button>
                    <button className="rms-btn btn-move" onClick={() => handleViewClick('MOVE JOINTS')}>JOINTS</button>
                    <button className="rms-btn btn-move" onClick={() => handleViewClick('MOVE CARTESIAN')}>CARTESIAN</button>
                </>
            )}

            <button className="rms-btn btn-close" onClick={onClose}><span>◄</span> CLOSE</button>
        </div>
    </>
  );
};

export default RightMenuSidebar;