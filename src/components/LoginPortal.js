import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import './LoginPortal.css';

const LoginPortal = () => {
    // 🚀 THE FIX: Extract goFullScreenAndLock from Context!
    const { loginToRobot, authStatus, authMessage, connectionFailed, goFullScreenAndLock } = useWebSocket();
    
    // Set your default IP here
    const [ip, setIp] = useState('192.168.1.36'); 
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Programmer');

    const handleLoginClick = (e) => {
        e.preventDefault();
        
        if (!ip || !userId || !password) {
            alert("Please fill in the Server IP, Username, and Password fields.");
            return;
        }

        // 🚀 THE FIX: Force fullscreen the exact millisecond they click Login!
        goFullScreenAndLock();

        loginToRobot(ip, userId, password, role);
    };

    return (
        <div className="login-master-container" style={{ backgroundImage: "url('/bg.png')" }}>
            <div className="login-box">
                <div className="login-header-blue">
                    <img src="/logo.png" alt="TEXSONICS Logo" className="login-logo-img" />
                </div>
                
                <div className="login-body">
                    <div className="auth-heading-container">
                        <h3 className="auth-heading">CONTROLLER<br/>AUTHENTICATION</h3>
                    </div>

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

                    <div className="login-form">
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
                        
                        <div className="input-group">
                            <label>Password</label>
                            <input 
                                type="text" 
                                name="secure_hash_data" 
                                id="secure_hash_data"
                                autoComplete="new-password" 
                                spellCheck="false"
                                style={{ WebkitTextSecurity: 'disc' }} 
                                placeholder="Enter your password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                disabled={authStatus === 'waiting_admin'}
                            />
                        </div>

                        <div className="input-group">
                            <label>Role</label>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input type="radio" name="role" value="Programmer" checked={role === 'Programmer'} onChange={(e) => setRole(e.target.value)} disabled={authStatus === 'waiting_admin'} />
                                    Programmer
                                </label>
                                <label className="radio-label">
                                    <input type="radio" name="role" value="Operator" checked={role === 'Operator'} onChange={(e) => setRole(e.target.value)} disabled={authStatus === 'waiting_admin'} />
                                    Operator
                                </label>
                            </div>
                        </div>

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