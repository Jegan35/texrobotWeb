import React from 'react';

const JointsPanel = () => {
  const joints = [
    { id: 'J1', val: '0.00°' },
    { id: 'J2', val: '0.00°' },
    { id: 'J3', val: '0.00°' },
    { id: 'J4', val: '0.00°' },
    { id: 'J5', val: '0.00°' },
    { id: 'J6', val: '0.00°' },
  ];

  return (
    <div className="joints-panel">
      <div className="joints-title">JOINTS</div>
      {joints.map((j) => (
        <div key={j.id} className="joint-item">
          <div className="joint-label">{j.id}</div>
          <div className="joint-val">{j.val}</div>
        </div>
      ))}
    </div>
  );
};

export default JointsPanel;