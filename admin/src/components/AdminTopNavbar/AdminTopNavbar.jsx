import React, { useEffect, useState } from 'react'
import './AdminTopNavbar.css'
import user from '../../assets/Management System/dashboard/user-profile.svg'
import dropdown_yellow from '../../assets/Management System/dashboard/dropdown-yellow.svg'

const AdminTopNavbar = () => {
    const [dateTime,setDateTime] = useState(new Date());
    const [userDropdown, setUserDropdown] = useState(false)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date()
    const currentDay = days[today.getDay()]
    
    

    useEffect(() => {
        //setInterval throws an id na pwede natin gamitin to stop the interval
        const intervalId = setInterval(()=>setDateTime(new Date()), 1000 )

        

        // iccall lang ng react ung cleanup kapag lumipat kana ng component
         return function cleanup() {
            //stops the interval
             clearInterval(intervalId)
        }
    },[]);


    const toggleDropdown=()=>{
        setUserDropdown(!userDropdown)
    }

    
    

  return (
    <div className='top-navbar'>
        {/* date and time */}
        <div className="top-navbar-datetime">
            <span>{dateTime.toLocaleTimeString()}</span>
            <span>|</span>
            <span>{currentDay}</span>
            <span>|</span>
            <span>{dateTime.toLocaleDateString()}</span>
        </div>

        {/* admin account */}
        <div className='user-box'>
            <div class="dropdown">
                  <button class="btn cat-dropdown dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src={user} alt="" />
                    <span>Hello, 
                    <span className='user-welcome-uname'> @admin</span></span>
                  </button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#">Action</a></li>
                    <li><a class="dropdown-item" href="#">Another action</a></li>
                    <li><a class="dropdown-item" href="#">Something else here</a></li>
                  </ul>
            </div>
            {/* <div className="user-dropdown">
                <button className='user-button' onClick={toggleDropdown}><img src={dropdown_yellow} alt="" /></button>
                <div className={`user-dropdown-list ${userDropdown?'show-user-list':''}`}>
                    <p>List 1</p>
                    <p>List 2</p>
                </div>
            </div> */}
            
        </div>
      
    </div>
  )
}

export default AdminTopNavbar
