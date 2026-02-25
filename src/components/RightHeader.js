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
        {/* LEFT SIDE: Hamburger Menu Button (Restored to your design) */}
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
                transition: '0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#333'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
            <span style={{fontSize: '1.2rem', letterSpacing: '-1px'}}>|||</span> MENU
        </button>

        {/* RIGHT SIDE: Green Dot + Active Mode Text (Restored to your design) */}
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