import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import './LoginPortal.css';

const LoginPortal = () => {
    const { loginToRobot, authStatus, authMessage, connectionFailed } = useWebSocket();
    
    // Set your default IP here
    const [ip, setIp] = useState('192.168.1.36'); 
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Programmer');

    // 🚀 THE FIX: Now an onClick handler instead of a form submission
    const handleLoginClick = (e) => {
        e.preventDefault();
        
        // 🚀 THE FIX: Manual validation replaces the HTML "required" attribute
        if (!ip || !userId || !password) {
            alert("Please fill in the Server IP, Username, and Password fields.");
            return;
        }

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

                    {/* 🚀 THE FIX: Changed <form> to a standard <div> so Chrome doesn't scan it! */}
                    <div className="login-form">
                        
                        {/* 🚀 FIXED: IP Field (No history dropdown, no spellcheck) */}
                        <div className="input-group">
                            <label>Server IP</label>
                            <input 
                                type="text" 
                                autoComplete="off" 
                                spellCheck="false"
                                placeholder="Enter Server IP"
                                value={ip} 
                                onChange={(e) => setIp(e.target.value)} 
                                disabled={authStatus === 'waiting_admin'}
                            />
                        </div>

                        {/* 🚀 FIXED: Username Field (No history dropdown) */}
                        <div className="input-group">
                            <label>Username</label>
                            <input 
                                type="text" 
                                autoComplete="off"
                                spellCheck="false"
                                placeholder="Enter your username" 
                                value={userId} 
                                onChange={(e) => setUserId(e.target.value)} 
                                disabled={authStatus === 'waiting_admin'}
                            />
                        </div>
                        
                        {/* 🚀 THE GHOST INPUT: Chrome thinks this is just text! */}
                        <div className="input-group">
                            <label>Password</label>
                            <input 
                                type="text" 
                                name="secure_hash_data" 
                                id="secure_hash_data"
                                autoComplete="new-password" 
                                spellCheck="false"
                                style={{ WebkitTextSecurity: 'disc' }} /* Keeps the black dots! */
                                placeholder="Enter your password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                disabled={authStatus === 'waiting_admin'}
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

                        {/* 🚀 THE FIX: Changed type="submit" to type="button" and added onClick! */}
                        <button 
                            type="button" 
                            onClick={handleLoginClick}
                            className={`login-submit-btn ${authStatus === 'waiting_admin' ? 'btn-disabled' : ''}`}
                            disabled={authStatus === 'waiting_admin'}
                        >
                            {authStatus === 'waiting_admin' ? 'AWAITING APPROVAL...' : 'Login'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPortal;