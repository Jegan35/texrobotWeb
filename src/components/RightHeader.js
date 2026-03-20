import React from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import './RightPart.css';

const RightHeader = ({ onMenuToggle, currentMode, isOpen, onDisconnectClick, isAutoMode, activeView }) => {         
    const { robotState } = useWebSocket();
    const isMoving = robotState?.is_physically_moving || false;

    // --- CHECK IF ROBOT IS IN AUTO MODE ---
    // 🚀 THE FIX: We check the backend state AND the Sidebar active view!
    const backendMode = String(robotState?.mode || '').toUpperCase();
    const isAuto = robotState?.auto_mode === true || backendMode === 'AUTO' || isAutoMode === true || activeView === 'AUTO';

    // --- DETERMINE WHAT TO SHOW ---
    const displayMode = isAuto ? 'AUTO' : (currentMode || '');
    
    // Determine the dot CSS class
    let dotClass = 'dot-blue'; // Default
    if (isAuto) {
        dotClass = 'dot-orange';
    }

    return (
        <div className="rh-master-container">
            
            <div className="rh-menu-btn" onClick={onMenuToggle}>
                <span className={`rh-hamburger ${isOpen ? 'rotated' : ''}`}>≡</span>
                <span style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '1px' }}>MENU</span>
            </div>

            <div className="rh-mode-box">
                {/* 🚀 THE FIX: Uses pure CSS classes so the animation colors don't conflict! */}
                <div className={`rh-blinking-dot ${dotClass}`}></div>
                
                <span style={{ 
                    fontWeight: '900', 
                    letterSpacing: '1px', 
                    textTransform: 'uppercase', 
                    fontSize: '0.85rem',
                    color: isAuto ? '#FF9800' : 'white' 
                }}>
                    {displayMode}
                </span>
            </div>

            <div className="rh-status-container">
                {isMoving ? (
                    <div className="rh-status-motion">IN MOTION</div>
                ) : (
                    <div className="rh-status-standby">STANDBY</div>
                )}
            </div>
            
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