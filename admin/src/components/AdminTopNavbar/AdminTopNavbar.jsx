import React, { useEffect, useState } from 'react';
import './AdminTopNavbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser } from '@fortawesome/free-solid-svg-icons';

const AdminTopNavbar = () => {
    const [dateTime, setDateTime] = useState(new Date());
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const currentDay = days[today.getDay()];

    useEffect(() => {
        const updateOnlineStatus = () => {
            setIsOnline(navigator.onLine);
        };

        // Add event listeners for online/offline events
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // Update date and time every second
        const intervalId = setInterval(() => setDateTime(new Date()), 1000);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
            clearInterval(intervalId);
        };
    }, []);

    return (
        <div className="top-navbar">
            {/* Online/Offline Indicator */}
            <div className="indicator">
                {isOnline ? 'Online' : 'Offline'}
            </div>
            <div className="info">
                {/* Date and Time */}
                <div className="top-navbar-datetime">
                    <span>{dateTime.toLocaleTimeString()}</span>
                    <span>|</span>
                    <span>{currentDay}</span>
                    <span>|</span>
                    <span>{dateTime.toLocaleDateString()}</span>
                </div>

                {/* Admin Account Dropdown */}
                <div className="user-box">
                    <div className="dropdown">
                        <button className="btn cat-dropdown dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <FontAwesomeIcon icon={faCircleUser} className="icon" />
                            <span>
                                Hello, <span className="user-welcome-uname">@admin</span>
                            </span>
                        </button>
                        <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#">Action</a></li>
                            <li><a className="dropdown-item" href="#">Another action</a></li>
                            <li><a className="dropdown-item" href="#">Something else here</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTopNavbar;
