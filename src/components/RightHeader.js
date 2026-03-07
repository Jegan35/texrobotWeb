import React from 'react';
import { useWebSocket } from '../context/WebSocketContext';

const RightHeader = ({ onMenuToggle, currentMode, isOpen, onSettingsClick }) => {
    const { robotState } = useWebSocket();
    
    // Automatically read the physically moving state from context
    const isMoving = robotState?.is_physically_moving || false;

    return (
        <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 15px', color: 'white', boxSizing: 'border-box' }}>
            
            {/* 1. LEFT: MENU BUTTON */}
            <div 
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }} 
                onClick={onMenuToggle}
            >
                <span style={{ fontSize: '1.8rem', marginRight: '10px' }}>{isOpen ? '✕' : '≡'}</span>
                <span style={{ fontWeight: '900', fontSize: '1.1rem', letterSpacing: '1px' }}>MENU</span>
            </div>

            {/* 2. CENTER-LEFT: MODE INDICATOR (JOG : CARTESIAN) */}
            <div style={{ 
                marginLeft: '30px', 
                border: '1px solid #333', 
                borderRadius: '4px', 
                padding: '6px 12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                backgroundColor: '#151822' 
            }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00bcd4', boxShadow: '0 0 5px #00bcd4' }}></div>
                <span style={{ fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                    {currentMode}
                </span>
            </div>

            {/* 3. CENTER: THE NEW "2-IN-1" DYNAMIC STANDBY / IN-MOTION BUTTON */}
            <div style={{ marginLeft: '15px' }}>
                {isMoving ? (
                    <div style={{ 
                        border: '2px solid #FF9800', 
                        color: '#FF9800', 
                        padding: '5px 15px', 
                        borderRadius: '4px', 
                        fontWeight: '900', 
                        letterSpacing: '1px', 
                        backgroundColor: 'rgba(255, 152, 0, 0.1)', 
                        textShadow: '0 0 5px rgba(255,152,0,0.4)', 
                        boxShadow: 'inset 0 0 5px rgba(255,152,0,0.2)',
                        fontSize: '0.85rem'
                    }}>
                        IN MOTION
                    </div>
                ) : (
                    <div style={{ 
                        border: '2px solid #4CAF50', 
                        color: '#4CAF50', 
                        padding: '5px 15px', 
                        borderRadius: '4px', 
                        fontWeight: '900', 
                        letterSpacing: '1px', 
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        fontSize: '0.85rem'
                    }}>
                        STANDBY
                    </div>
                )}
            </div>
            
            {/* 4. RIGHT: SETTINGS BUTTON */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    onClick={onSettingsClick}
                    style={{
                        background: 'linear-gradient(180deg, #373d49 0%, #262b33 100%)',
                        border: '1px solid #111',
                        color: '#00bcd4',
                        padding: '6px 20px',
                        borderRadius: '4px',
                        fontWeight: '900',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: 'inset 1px 1px 0 rgba(255,255,255,0.1), 0 3px 5px rgba(0,0,0,0.4)',
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                    <span style={{ fontSize: '1.2rem' }}>⚙</span> SETTINGS
                </button>
            </div>
            
        </div>
    );
};

export default RightHeader;