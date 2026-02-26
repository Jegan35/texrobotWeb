import React from 'react';

const RightHeader = ({ onMenuToggle, currentMode, isOpen }) => {
  return (
    <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '0 15px', 
        height: '100%', 
        background: '#202430', 
        color: 'white',
        borderBottom: '2px solid #111',
        boxSizing: 'border-box'
    }}>
        {/* LEFT SIDE: Hamburger Menu Button */}
        <button 
            onClick={onMenuToggle}
            style={{
                background: 'transparent', 
                border: '1px solid #555', 
                color: 'white',
                padding: '8px 15px',
                borderRadius: '6px',
                fontSize: '1rem', 
                cursor: 'pointer', 
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '900',
                transition: 'background 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#333'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
            {/* HORIZONTAL HAMBURGER ICON WITH 90-DEGREE ROTATION ANIMATION */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '4px',
                // MAGIC: Rotates 90 degrees when isOpen is true, back to 0 when false!
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease-in-out'
            }}>
                <div style={{ width: '18px', height: '2px', backgroundColor: 'white', borderRadius: '1px' }}></div>
                <div style={{ width: '18px', height: '2px', backgroundColor: 'white', borderRadius: '1px' }}></div>
                <div style={{ width: '18px', height: '2px', backgroundColor: 'white', borderRadius: '1px' }}></div>
            </div>
            
            MENU
        </button>

        {/* RIGHT SIDE: Green Dot + Active Mode Text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingRight: '10px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4CAF50', boxShadow: '0 0 5px #4CAF50' }}></div>
            <div style={{ fontWeight: '900', fontSize: 'clamp(12px, 1.2vw, 16px)', color: '#00bcd4', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {currentMode}
            </div>
        </div>
    </div>
  );
};

export default RightHeader;