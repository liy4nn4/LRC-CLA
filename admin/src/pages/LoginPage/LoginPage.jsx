import React, { useState } from 'react';
import './LoginPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");  // New state for error message
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Initialize navigate function

    const login = async () => {
        // Form validation
        if (!username || !password) {
            setError("Both fields are required.");
            return;
        } else {
            setError("");  // Clear error message if validation passes
        }

        try {
            setLoading(true);
            const response = await axios.post('http://localhost:3001/login', {
                username: username,
                password: password
            });
            console.log(response.data)
            // Check if backend returns a message indicating incorrect username/password
            if (response.data) {
                if (response.data.status === 404) {
                    setError(response.data.message);
                } else if (response.data.status === 201) {
                    localStorage.setItem('userRole', response.data.role);
                    localStorage.setItem('uname', response.data.uname);
                    // Navigate to the dashboard
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            console.log('Cannot login. An error occurred: ', err.message);
            setError("An error occurred. Please try again.");
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
                        name=""
                        id=""
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type='password'
                        name=""
                        id="password"
                        placeholder='Enter Password'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {/* Display error message if validation fails or credentials are incorrect */}
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
