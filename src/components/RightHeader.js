import React from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import './RightPart.css'; // Make sure this points to wherever your CSS is!

const RightHeader = ({ onMenuToggle, currentMode, isOpen, onDisconnectClick, isAutoMode }) => {         
    const { robotState } = useWebSocket();
    const isMoving = robotState?.is_physically_moving || false;

    // --- CHECK IF ROBOT IS IN AUTO MODE ---
    // 🚀 THE FIX: Safely checks the prop from RightPart AND the direct backend state
    const backendMode = String(robotState?.mode || '').toUpperCase();
    const isAuto = isAutoMode === true || backendMode === 'AUTO' || robotState?.run_mode === 'AUTO';

    // --- DETERMINE WHAT TO SHOW ---
    // If it's in Auto, FORCE the text to say "AUTO". Otherwise, show the current tab name.
    const displayMode = isAuto ? 'AUTO' : (currentMode || '');
    
    // 🚀 THE FIX: Dynamically assign the dot class
    const dotClass = isAuto ? 'dot-orange' : 'dot-blue';

    return (
        <div className="rh-master-container">
            
            {/* MENU BUTTON */}
            <div className="rh-menu-btn" onClick={onMenuToggle}>
                <span className={`rh-hamburger ${isOpen ? 'rotated' : ''}`}>≡</span>
                <span style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '1px' }}>MENU</span>
            </div>

            {/* MODE DISPLAY BOX (WITH BLINKING DOT) */}
            <div className="rh-mode-box">
                {/* 🚀 Flashes Orange in AUTO, Blue otherwise! */}
                <div className={`rh-blinking-dot ${dotClass}`}></div>
                
                <span style={{ 
                    fontWeight: '900', 
                    letterSpacing: '1px', 
                    textTransform: 'uppercase', 
                    fontSize: '0.85rem',
                    color: isAuto ? '#FF9800' : 'white', // Turns text orange too!
                    transition: 'color 0.3s ease'
                }}>
                    {displayMode}
                </span>
            </div>

            {/* MOTION STATUS */}
            <div className="rh-status-container">
                {isMoving ? (
                    <div className="rh-status-motion">IN MOTION</div>
                ) : (
                    <div className="rh-status-standby">STANDBY</div>
                )}
            </div>
            
            {/* DISCONNECT BUTTON */}
            <button 
                className="industrial-disconnect-btn" 
                onClick={onDisconnectClick}
                title="Disconnect from Robot"
            >
                <span className="disconnect-icon">⚠️</span>DISCONNECT
            </button>
            
        </div>
    );
};


export default RightHeader;