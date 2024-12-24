import React from 'react'
import './AdminNavbar.css'
import tuplogo from '../../assets/tuplogo.png'
import clalogo from '../../assets/clalogo.png'
import dashboard from '../../assets/dashboard.svg'
import logbook from '../../assets/logbook.svg'
import inventory from '../../assets/inventory.svg'
import circulation from '../../assets/circulation.svg'
import patrons from '../../assets/patrons.svg'
import cataloging from '../../assets/cataloging.svg'
import reports from '../../assets/reports.svg'
import { Link } from 'react-router-dom'



const AdminNavbar = () => {
  return (
    <div className='admin-navbar-container'>
        {/* logo and heading */}
        <div className="navbar-logo-heading">
                {/* logos */}
                <div className="navbar-logos">
                    <img src={tuplogo} alt="tup-logo" />
                    <img src={clalogo} alt="cla-log" />
                </div>
                {/* heading */}
                <div className="navbar-heading">
                    <p className='navbar-heading-text navbar-heading-cla'>College of Liberal Arts</p>
                    <p className='navbar-heading-text navbar-heading-lrc'>Learning Resource Center</p>
                </div>
                
        </div>

        {/* menu */}
        <div className="navbar-menu">
            <ul>
                {/*dashboard */}
                <li>
                    <Link to='/dashboard' className='menu'>
                            <img src={dashboard} alt="" className='menu-icon'/>
                           <p>Dashboard</p>
                    </Link>
                </li>

                {/* logbook */}
                <li>
                    <Link to='/logbook' className="menu">
                        <img src={logbook} alt="" className='menu-icon' />
                        <p>Logbook</p>
                    </Link>
                </li>

                
                {/* circulation */}
                <li>
                    <Link to='/circulation' className="menu">
                        <img src={circulation} alt="" className='menu-icon'/>
                        <p>Circulation</p>
                    </Link>
                </li>
                
                {/* patrons */}
                <li>
                    <Link to='/patrons' className="menu">
                        <img src={patrons} alt="" className='menu-icon'/>
                        <p>Patrons</p>
                    </Link>
                </li>

                {/* cataloging */}
                <li>
                    <Link to='/catalog' className='menu'>
                        <img src={cataloging} alt="" className='menu-icon'/>
                        <p>Cataloging</p>

                    </Link>
                </li>
                
                {/* reports */}
                <li>
                    <Link to='/reports' className="menu">
                        <img src={reports} alt="" className='menu-icon'/>
                        <p>Reports</p>
                    </Link>
                </li>
            </ul>
        </div>

      
    </div>
  )
}

export default AdminNavbar
