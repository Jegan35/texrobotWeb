import { useWebSocket } from '../context/WebSocketContext';
import './RightPart.css'; // This connects the header to your existing CSS file!

const RightHeader = ({ onMenuToggle, currentMode, isOpen, onSettingsClick }) => {
    const { robotState } = useWebSocket();
    
    // Automatically read the physically moving state from context
    const isMoving = robotState?.is_physically_moving || false;

    // --- DYNAMIC INDICATOR COLORS ---
    // The dot will change color depending on what mode you select!
    const safeMode = currentMode || '';
    let dotColor = '#00bcd4'; // Default Cyan for JOG
    if (safeMode.includes('AUTO')) dotColor = '#9c27b0'; // Purple for AUTO
    else if (safeMode.includes('MOVE')) dotColor = '#4CAF50'; // Green for MOVE
    else if (safeMode.includes('MANUAL')) dotColor = '#FF9800'; // Orange for MANUAL
    else if (safeMode.includes('GRAPH')) dotColor = '#E91E63'; // Pink for GRAPH

    return (
        <div className="rh-master-container">
            
            {/* 1. LEFT: MENU BUTTON */}
            <div className="rh-menu-btn" onClick={onMenuToggle}>
                {/* Rotates 90 degrees gracefully via CSS when open */}
                <span className={`rh-hamburger ${isOpen ? 'rotated' : ''}`}>☰</span>
                <span style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '1px' }}>MENU</span>
            </div>

            {/* 2. CENTER-LEFT: MODE INDICATOR & BLINKING DOT */}
            <div className="rh-mode-box">
                {/* Dynamic colored dot with blinking CSS class */}
                <div 
                    className="rh-blinking-dot" 
                    style={{ backgroundColor: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
                ></div>
                <span style={{ fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                    {currentMode}
                </span>
            </div>

            {/* 3. CENTER-RIGHT: DYNAMIC STANDBY / IN-MOTION BUTTON */}
            <div className="rh-status-container">
                {isMoving ? (
                    <div className="rh-status-motion">IN MOTION</div>
                ) : (
                    <div className="rh-status-standby">STANDBY</div>
                )}
            </div>
            
            {/* 4. RIGHT: SETTINGS BUTTON */}
            <button className="rh-settings-btn" onClick={onSettingsClick}>
                <span style={{ fontSize: '1.2rem' }}>⚙</span> SETTINGS
            </button>
            
        </div>
    );
};

export default RightHeader;