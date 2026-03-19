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
            
            {/* 1. FAR LEFT: Menu Toggle */}
            <div className="rh-menu-btn" onClick={onMenuToggle}>
                <span className={`rh-hamburger ${isOpen ? 'rotated' : ''}`}>≡</span>
                <span style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '1px' }}>MENU</span>
            </div>

            {/* 2. MIDDLE LEFT: Dynamic Mode Indicator */}
            <div className="rh-mode-box">
                {/* FIX: Added a fallback color so the dot NEVER disappears! */}
                <div 
                    className="rh-blinking-dot" 
                    style={{ 
                        backgroundColor: dotColor || '#00bcd4', 
                        boxShadow: `0 0 8px ${dotColor || '#00bcd4'}` 
                    }}
                ></div>
                
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

            {/* FIX: Removed the extra wrapper div! Now these are direct children. */}
            
            {/* 3. MIDDLE RIGHT: Status */}
            <div className="rh-status-container">
                {isMoving ? (
                    <div className="rh-status-motion">IN MOTION</div>
                ) : (
                    <div className="rh-status-standby">STANDBY</div>
                )}
            </div>
            
            {/* 4. FAR RIGHT: Industrial Disconnect Button */}
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