import React, { useState, useEffect } from 'react';

const RightHeader = ({ onMenuToggle, currentMode, isOpen }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const dateString = currentTime.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <>
      <style>{`
        .rh-container {
            display: flex; justify-content: space-between; align-items: center;
            height: 100%; padding: 0 15px; background-color: #1a1e29; 
            border-bottom: 2px solid #333; box-sizing: border-box; width: 100%;
        }
        .rh-menu-btn {
            background: transparent; border: 1px solid #555; border-radius: 4px; color: white;
            padding: 6px 15px; font-size: 0.9rem; font-weight: bold; cursor: pointer;
            display: flex; align-items: center; gap: 8px; transition: 0.2s;
        }
        .rh-menu-btn:hover { background: #333947; border-color: #00bcd4; }
        .rh-mode-label {
            background-color: transparent; border: 1px solid #444; padding: 6px 15px;
            border-radius: 4px; color: #fff; font-weight: bold; font-size: 0.85rem; letter-spacing: 1px;
            display: flex; align-items: center; gap: 8px;
        }
        .green-dot { width: 8px; height: 8px; background-color: #4caf50; border-radius: 50%; display: inline-block; }
        .rh-time { font-size: 1.2rem; font-weight: bold; line-height: 1.1; color: white; text-align: right; }
        .rh-date { font-size: 0.75rem; color: #aaa; text-align: right; }
        
        /* THE ROTATION ANIMATION */
        .burger-icon {
            display: inline-block;
            font-size: 1.1rem;
            font-weight: normal;
            transition: transform 0.3s ease-in-out;
        }
      `}</style>
      <div className="rh-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="rh-menu-btn" onClick={onMenuToggle}>
            {/* THIS ROTATES BASED ON THE MENU STATE */}
            <span className="burger-icon" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>|||</span> MENU
          </button>
          <div className="rh-mode-label">
            <span className="green-dot"></span> {currentMode}
          </div>
        </div>
        <div>
          <div className="rh-time">{timeString}</div>
          <div className="rh-date">{dateString}</div>
        </div>
      </div>
    </>
  );
};

export default RightHeader;