import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

const RightMenuSidebar = ({ isOpen, onClose, onSelectView }) => {
  const { sendCommand, robotState } = useWebSocket();
  
  // Local states for the white outline and current menus
  const [activeMode, setActiveMode] = useState('Manual');
  const [activeView, setActiveView] = useState('JOG JOINTS');
  
  // NEW: State to track which dropdown menu is currently open
  const [expandedMenu, setExpandedMenu] = useState(null); 

  // Sync Robot Mode perfectly with the C++ Backend state!
  useEffect(() => {
      if (robotState?.mode) {
          const m = robotState.mode.toLowerCase();
          if (m.includes('auto')) setActiveMode('Auto');
          else if (m.includes('manual')) setActiveMode('Manual');
          else if (m.includes('remote')) setActiveMode('Remote');
      }
  }, [robotState?.mode]);

  const handleModeSelect = (mode) => {
      setActiveMode(mode);
      sendCommand(`SET_${mode.toUpperCase()}`, '');
  };

  const handleViewSelect = (fullViewName) => {
      setActiveView(fullViewName);
      onSelectView(fullViewName);
      setExpandedMenu(null); // Close the dropdown
      onClose(); // Close the sidebar
  };

  if (!isOpen) return null;

  // Reusable button component to perfectly match your screenshot's design + White Outline
  const NavButton = ({ title, icon, color, isActive, onClick, rightIcon }) => (
      <button 
          onClick={onClick}
          style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px',
              backgroundColor: color,
              color: 'white',
              // MAGIC LINE: Forms the white line notification when clicked!
              border: isActive ? '3px solid white' : '3px solid transparent',
              borderRadius: '8px',
              fontSize: '1.2rem',
              fontWeight: '900',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.1s ease',
              textTransform: 'uppercase',
              boxSizing: 'border-box'
          }}
      >
          <span style={{ fontSize: '1.4rem', width: '30px', textAlign: 'left' }}>{icon}</span>
          <span style={{ flex: 1, textAlign: 'right', marginRight: rightIcon ? '10px' : '0' }}>{title}</span>
          {rightIcon && <span style={{ fontSize: '1.2rem' }}>{rightIcon}</span>}
      </button>
  );

  return (
    <div style={{
        position: 'absolute', top: 0, right: 0, width: '340px', height: '100%',
        backgroundColor: '#151822', borderLeft: '2px solid #333',
        zIndex: 9999, display: 'flex', flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.9)', boxSizing: 'border-box'
    }}>
        {/* HEADER */}
        <div style={{ padding: '20px', borderBottom: '2px solid #202430' }}>
            <h2 style={{ color: 'white', margin: 0, letterSpacing: '2px', fontSize: '1.4rem', fontWeight: '900' }}>MENUS</h2>
        </div>

        {/* BUTTON LIST */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, overflowY: 'auto' }}>
            
            <NavButton 
                title="SPEED" icon="⏱" color="#607D8B" 
                isActive={activeView === 'SPEED CONFIG'} 
                onClick={() => handleViewSelect('SPEED CONFIG')} 
            />
            
            {/* JOG WITH POPUP DROPDOWN */}
            <div style={{ position: 'relative', width: '100%' }}>
                <NavButton 
                    title="JOG" icon="〰" color="#039BE5" 
                    rightIcon={expandedMenu === 'JOG' ? "▼" : "▶"} 
                    isActive={activeView.includes('JOG')} 
                    onClick={() => setExpandedMenu(expandedMenu === 'JOG' ? null : 'JOG')} 
                />
                {expandedMenu === 'JOG' && (
                    <div style={{
                        position: 'absolute', top: '100%', left: 0, width: '100%',
                        backgroundColor: '#1e222b', border: '2px solid #333', zIndex: 2000,
                        borderRadius: '6px', padding: '6px', display: 'flex', flexDirection: 'column',
                        gap: '6px', boxShadow: '0 10px 30px rgba(0,0,0,0.9)', marginTop: '4px'
                    }}>
                        <button onClick={() => handleViewSelect('JOG JOINTS')} style={{ width: '100%', padding: '12px', background: '#039BE5', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>
                            JOG - JOINTS
                        </button>
                        <button onClick={() => handleViewSelect('JOG CARTESIAN')} style={{ width: '100%', padding: '12px', background: '#039BE5', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>
                            JOG - CARTESIAN
                        </button>
                    </div>
                )}
            </div>

            {/* MOVE WITH POPUP DROPDOWN */}
            <div style={{ position: 'relative', width: '100%' }}>
                <NavButton 
                    title="MOVE" icon="🎯" color="#4CAF50" 
                    rightIcon={expandedMenu === 'MOVE' ? "▼" : "▶"} 
                    isActive={activeView.includes('MOVE')} 
                    onClick={() => setExpandedMenu(expandedMenu === 'MOVE' ? null : 'MOVE')} 
                />
                {expandedMenu === 'MOVE' && (
                    <div style={{
                        position: 'absolute', top: '100%', left: 0, width: '100%',
                        backgroundColor: '#1e222b', border: '2px solid #333', zIndex: 2000,
                        borderRadius: '6px', padding: '6px', display: 'flex', flexDirection: 'column',
                        gap: '6px', boxShadow: '0 10px 30px rgba(0,0,0,0.9)', marginTop: '4px'
                    }}>
                        <button onClick={() => handleViewSelect('MOVE JOINTS')} style={{ width: '100%', padding: '12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>
                            MOVE - JOINTS
                        </button>
                        <button onClick={() => handleViewSelect('MOVE CARTESIAN')} style={{ width: '100%', padding: '12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>
                            MOVE - CARTESIAN
                        </button>
                    </div>
                )}
            </div>
            
            <div style={{ height: '10px' }}></div> {/* Spacing separator */}

            <NavButton title="AUTO" icon="↻" color="#9C27B0" isActive={activeMode === 'Auto'} onClick={() => handleModeSelect('Auto')} />
            <NavButton title="MANUAL" icon="⚙" color="#673AB7" isActive={activeMode === 'Manual'} onClick={() => handleModeSelect('Manual')} />
            <NavButton title="REMOTE" icon="🌍" color="#FF9800" isActive={activeMode === 'Remote'} onClick={() => handleModeSelect('Remote')} />
        </div>

        {/* CLOSE BUTTON */}
        <div style={{ padding: '20px', borderTop: '2px solid #202430' }}>
            <NavButton title="CLOSE" icon="◀" color="#E53935" isActive={false} onClick={onClose} />
        </div>
    </div>
  );
};

export default RightMenuSidebar;