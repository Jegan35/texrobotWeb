import React, { useState } from 'react';
import { useWebSocket } from '../context/WebSocketContext';
import './LoginPortal.css';

const LoginPortal = () => {
    // FIX: Added 'connectionFailed' here just in case the websocket uses that flag when offline
    const { loginToRobot, authStatus, authMessage, connectionFailed } = useWebSocket();
    
    const [ip, setIp] = useState('192.168.1.36'); 
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Operator'); // Default role

    const handleSubmit = (e) => {
        e.preventDefault();
        // Pass the role along with IP, User, and Pass!
        loginToRobot(ip, userId, password, role);
    };

    return (
        <div className="login-master-container">
            <div className="login-box">
                <div className="login-header">
                    <h2 className="login-title">TEXSONICS</h2>
                    <div className="login-subtitle">ROBOTICS</div>
                </div>
                <div className="login-divider"></div>
                <h3 className="login-prompt">SYSTEM AUTHENTICATION</h3>

                {/* DYNAMIC ERROR / SUCCESS MESSAGES FROM C++ */}
                {authStatus === 'rejected' && <div className="login-error">{authMessage}</div>}
                
                {/* --- CLEAN SYSTEM OFFLINE ERROR --- */}
                {(authStatus === 'error' || connectionFailed) && (
                    <div className="login-error">
                        {authMessage || "⚠️ SYSTEM OFFLINE: Unable to reach robot."}
                    </div>
                )}

                {/* PROFESSIONAL SAFETY LOCK WARNING */}
                {authStatus === 'safety_lock' && (
                    <div className="login-warning">
                        <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>⚠️ SAFETY HAZARD</span>
                        {authMessage}
                    </div>
                )}

                {/* WAITING FOR ADMIN SPINNER */}
                {authStatus === 'waiting_admin' && (
                    <div className="login-waiting">
                        <div className="spinner"></div>
                        <div>{authMessage}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label>SERVER IP ADDRESS</label>
                        <input 
                            type="text" 
                            placeholder="ws://192.168.1.100:8080" 
                            value={ip} 
                            onChange={(e) => setIp(e.target.value)} 
                            disabled={authStatus === 'waiting_admin'}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>USER ID</label>
                        <input 
                            type="text" 
                            placeholder="Enter User ID" 
                            value={userId} 
                            onChange={(e) => setUserId(e.target.value)} 
                            disabled={authStatus === 'waiting_admin'}
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>PASSWORD</label>
                        <input 
                            type="password" 
                            placeholder="Enter Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            disabled={authStatus === 'waiting_admin'}
                            required 
                        />
                    </div>

                    {/* ROLE SELECTION BUTTONS */}
                    <div className="input-group">
                        <label>REQUESTED ACCESS LEVEL</label>
                        <div className="role-btn-group">
                            <button 
                                type="button" 
                                className={`role-btn ${role === 'Operator' ? 'role-active' : ''}`}
                                onClick={() => setRole('Operator')}
                                disabled={authStatus === 'waiting_admin'}
                            >
                                OPERATOR
                            </button>
                            <button 
                                type="button" 
                                className={`role-btn ${role === 'Programmer' ? 'role-active' : ''}`}
                                onClick={() => setRole('Programmer')}
                                disabled={authStatus === 'waiting_admin'}
                            >
                                PROGRAMMER
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className={`login-submit-btn ${authStatus === 'waiting_admin' ? 'btn-disabled' : ''}`}
                        disabled={authStatus === 'waiting_admin'}
                    >
                        {authStatus === 'waiting_admin' ? 'AWAITING APPROVAL...' : 'AUTHORIZE ACCESS'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPortal;