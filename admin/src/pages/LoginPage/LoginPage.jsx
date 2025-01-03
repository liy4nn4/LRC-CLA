import React, { useState } from 'react';
import './LoginPage.css';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    return (
        <div className='login-container'>
        <div className='wrapper'>
            <div className="logo-container">
                <img src="/tuplogo.png" alt="Logo 1" className="logo" />
                <img src="/clalogo.png" alt="Logo 2" className="logo" />
            </div>
            <form action="" className='login-form'>
                <h1>College of Liberal Arts</h1>
                <h2>Learning Resource Center</h2>
                <div className='input-box'>
                    <div className='input-container'>
                        <input type="text" placeholder='Username' name="" id="" />
                    </div>
                </div>
                <div className='input-box'>
                    <div className='input-container'>
                        <input 
                            type={passwordVisible ? "text" : "password"} 
                            placeholder='Password' 
                            name="" 
                            id="password" 
                        />
                        <span className="password-toggle" 
                            onClick={togglePasswordVisibility}
                        >
                            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                </div>
                <div className='login-button'>
                    <button type='submit'>Login</button>
                </div>
                
            </form>
        </div>
        </div>
    );
}

export default LoginPage;
