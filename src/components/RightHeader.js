import React from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import './RightPart.css';

const RightHeader = ({ onMenuToggle, currentMode, isOpen, onSettingsClick, onDisconnectClick }) => {
    const { robotState } = useWebSocket();
    const isMoving = robotState?.is_physically_moving || false;

    // --- CHECK IF ROBOT IS IN AUTO MODE ---
    const isAuto = robotState?.auto_mode === true || robotState?.mode === 'AUTO';

    // --- DETERMINE WHAT TO SHOW ---
    // If in Auto, force it to say "AUTO", otherwise show the normal current mode
    const displayMode = isAuto ? 'AUTO' : (currentMode || '');
    
    // Determine the dot color
    let dotColor = '#00bcd4'; // Default Blue/Cyan for normal modes
    
    if (isAuto) {
        dotColor = '#FF9800'; // Orange when in AUTO mode
    } else {
        // Normal color logic for other specific modes (optional)
        if (displayMode.includes('MOVE')) dotColor = '#4CAF50';
        else if (displayMode.includes('MANUAL')) dotColor = '#FF9800';
        else if (displayMode.includes('GRAPH')) dotColor = '#E91E63';
    }

    return (
        <div className="rh-master-container">
            {/* LEFT: Menu Toggle */}
            <div className="rh-menu-btn" onClick={onMenuToggle}>
                <span className={`rh-hamburger ${isOpen ? 'rotated' : ''}`}>≡</span>
                <span style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '1px' }}>MENU</span>
            </div>

            {/* CENTER: Dynamic Mode Indicator */}
            <div className="rh-mode-box">
                {/* The blinking dot dynamically changes color! */}
                <div className="rh-blinking-dot" style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}` }}></div>
                
                {/* Text changes to AUTO and gets a slight orange tint if in Auto mode */}
                <span style={{ 
                    fontWeight: '900', 
                    letterSpacing: '1px', 
                    textTransform: 'uppercase', 
                    fontSize: '0.85rem',
                    color: isAuto ? '#FFB74D' : 'white' 
                }}>
                    {displayMode}
                </span>
            </div>

            {/* RIGHT: Status & Disconnect */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                
                <div className="rh-status-container">
                    {isMoving ? (
                        <div className="rh-status-motion">IN MOTION</div>
                    ) : (
                        <div className="rh-status-standby">STANDBY</div>
                    )}
                </div>
                
                {/* --- INDUSTRIAL DISCONNECT BUTTON --- */}
                <button 
                    className="industrial-disconnect-btn" 
                    onClick={onDisconnectClick}
                    title="Disconnect from Robot"
                >
                    <span className="disconnect-icon">⏹</span> DISCONNECT
                </button>
                
            </div>
        </div>
    );
};

export default RightHeader;