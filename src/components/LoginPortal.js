import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import './LoginPortal.css';

const LoginPortal = () => {
    const { loginToRobot, authStatus, authMessage, connectionFailed } = useWebSocket();
    
    const [ip, setIp] = useState('192.168.1.36'); 
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Programmer');

    const handleSubmit = (e) => {
        e.preventDefault();
        loginToRobot(ip, userId, password, role);
    };

    return (
        /* 🚀 BACKGROUND IMAGE: Safely pulls bg.png from the public folder */
        <div 
            className="login-master-container" 
            style={{ backgroundImage: "url('/bg.png')" }}
        >
            <div className="login-box">
                
                {/* --- BLUE HEADER AREA WITH LOGO IMAGE --- */}
                <div className="login-header-blue">
                    {/* 🚀 LOGO IMAGE: Safely pulls logo.png from the public folder */}
                    <img src="/logo.png" alt="TEXSONICS Logo" className="login-logo-img" />
                </div>
                
                <div className="login-body">
                    {/* --- PIXEL/BLOCKY HEADING --- */}
                    <div className="auth-heading-container">
                        <h3 className="auth-heading">CONTROLLER<br/>AUTHENTICATION</h3>
                    </div>

                    {/* DYNAMIC ERROR / SUCCESS MESSAGES */}
                    {authStatus === 'rejected' && <div className="login-error">{authMessage}</div>}
                    
                    {(authStatus === 'error' || connectionFailed) && (
                        <div className="login-error">
                            {authMessage || "⚠️ SYSTEM OFFLINE: Unable to reach robot."}
                        </div>
                    )}

                    {authStatus === 'safety_lock' && (
                        <div className="login-warning">
                            <strong>⚠️ SAFETY HAZARD</strong><br/>
                            {authMessage}
                        </div>
                    )}

                    {authStatus === 'waiting_admin' && (
                        <div className="login-waiting">
                            <div className="spinner"></div>
                            <div>{authMessage}</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        
                        {/* Hidden Server IP Field */}
                        <div className="input-group" style={{ display: 'none' }}>
                            <label>Server IP</label>
                            <input 
                                type="text" 
                                value={ip} 
                                onChange={(e) => setIp(e.target.value)} 
                                disabled={authStatus === 'waiting_admin'}
                            />
                        </div>

                        <div className="input-group">
                            <label>Username</label>
                            <input 
                                type="text" 
                                placeholder="Enter your username" 
                                value={userId} 
                                onChange={(e) => setUserId(e.target.value)} 
                                disabled={authStatus === 'waiting_admin'}
                                required 
                            />
                        </div>
                        
                        <div className="input-group">
                            <label>Password</label>
                            <input 
                                type="password" 
                                placeholder="Enter your password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                disabled={authStatus === 'waiting_admin'}
                                required 
                            />
                        </div>

                        {/* RADIO BUTTONS FOR ROLE */}
                        <div className="input-group">
                            <label>Role</label>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input 
                                        type="radio" 
                                        name="role"
                                        value="Programmer"
                                        checked={role === 'Programmer'}
                                        onChange={(e) => setRole(e.target.value)}
                                        disabled={authStatus === 'waiting_admin'}
                                    />
                                    Programmer
                                </label>
                                <label className="radio-label">
                                    <input 
                                        type="radio" 
                                        name="role"
                                        value="Operator"
                                        checked={role === 'Operator'}
                                        onChange={(e) => setRole(e.target.value)}
                                        disabled={authStatus === 'waiting_admin'}
                                    />
                                    Operator
                                </label>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className={`login-submit-btn ${authStatus === 'waiting_admin' ? 'btn-disabled' : ''}`}
                            disabled={authStatus === 'waiting_admin'}
                        >
                            {authStatus === 'waiting_admin' ? 'AWAITING APPROVAL...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPortal;