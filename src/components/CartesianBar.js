import React from 'react';

const CartesianBar = () => {
  return (
    <div className="cartesian-bar">
      <div className="cart-title">CARTESIAN</div>
      <div className="cart-data">
        <div className="cart-item"><span>X (mm)</span><span className="val blue-text">0.000</span></div>
        <div className="cart-item"><span>Y (mm)</span><span className="val blue-text">0.000</span></div>
        <div className="cart-item"><span>Z (mm)</span><span className="val blue-text">0.000</span></div>
        <div className="cart-item"><span>A (°)</span><span className="val">0.00</span></div>
        <div className="cart-item"><span>B (°)</span><span className="val">00.00</span></div>
        <div className="cart-item"><span>C (°)</span><span className="val">0.00</span></div>
      </div>
    </div>
  );
};

export default CartesianBar;