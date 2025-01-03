import React, { useState, useEffect } from 'react';
import './LoginPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Check if the user is already logged in
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get('http://localhost:3001/user-details', {
                    withCredentials: true
                });
                if (response.status === 200) {
                    navigate('/dashboard'); // Redirect to dashboard if logged in
                }
            } catch (err) {
                console.log("User is not logged in.");
            }
        };

        checkLoginStatus();
    }, [navigate]);

    const login = async () => {
        if (!username || !password) {
            setError("Both fields are required.");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                'http://localhost:3001/login',
                { username, password },
                { withCredentials: true } // Important for cookies
            );

            if (response.status === 201) {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login-container'>
            <div className='wrapper'>
                <div className="logo-container">
                    <img src="/tuplogo.png" alt="Logo 1" className="logo" />
                    <img src="/clalogo.png" alt="Logo 2" className="logo" />
                </div>
                <div>
                    <h1>College of Liberal Arts</h1>
                    <h2>Learning Resource Center</h2>
                </div>
                <div className='input-box'>
                    <input
                        type="text"
                        placeholder='Enter Username'
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type='password'
                        placeholder='Enter Password'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="login">
                    {loading ? (
                        <div className="spinner-grow text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    ) : (
                        <button className='btn login-btn' onClick={login}>Login</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
