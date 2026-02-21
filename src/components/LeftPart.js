import React from 'react';
import RobotScene from '../RobotScene'; 
import CartesianBar from './CartesianBar';
import ControlButtons from './ControlButtons';
import JointsPanel from './JointsPanel'; // Import the new panel

const LeftPart = () => {
  return (
    <div className="left-half">
      {/* Top Header */}
      <div className="left-header">
        <span className="brand">TEXSONICS</span>
        <span className="title">ROBOT CONTROLLER V1.0</span>
      </div>

      {/* Middle Section: Groups the 3D view AND the Joints Panel */}
      <div className="middle-section">
        <div className="scene-area">
          <RobotScene />
        </div>
        <JointsPanel />
      </div>

      {/* Bottom Controls */}
      <CartesianBar />
      <ControlButtons />
    </div>
  );
};

export default LeftPart;