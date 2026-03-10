import React from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import './RightPart.css'; // <-- This is the missing link!

const RightHeader = ({ onMenuToggle, currentMode, isOpen, onSettingsClick }) => {
    const { robotState } = useWebSocket();
    const isMoving = robotState?.is_physically_moving || false;

    const safeMode = currentMode || '';
    let dotColor = '#00bcd4';
    if (safeMode.includes('AUTO')) dotColor = '#9c27b0';
    else if (safeMode.includes('MOVE')) dotColor = '#4CAF50';
    else if (safeMode.includes('MANUAL')) dotColor = '#FF9800';
    else if (safeMode.includes('GRAPH')) dotColor = '#E91E63';

    return (
        <div className="rh-master-container">
            <div className="rh-menu-btn" onClick={onMenuToggle}>
                <span className={`rh-hamburger ${isOpen ? 'rotated' : ''}`}>≡</span>
                <span style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '1px' }}>MENU</span>
            </div>

            <div className="rh-mode-box">
                <div className="rh-blinking-dot" style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}` }}></div>
                <span style={{ fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                    {currentMode}
                </span>
            </div>

            <div className="rh-status-container">
                {isMoving ? (
                    <div className="rh-status-motion">IN MOTION</div>
                ) : (
                    <div className="rh-status-standby">STANDBY</div>
                )}
            </div>
            
            <button className="rh-settings-btn" onClick={onSettingsClick}>
                <span style={{ fontSize: '1.2rem' }}>⚙</span> SETTINGS
            </button>
        </div>
    );
};

export default RightHeader;