import React, { useState } from 'react'
import tupLogo from '../../assets/OPAC/icons/tup-logo.png'
import claLogo  from '../../assets/OPAC/icons/cla-logo.png'
import './Navbar.css'
import MenuModal from '../MenuModal/MenuModal'
import { Link } from 'react-router-dom'



const Navbar = () => {
  const [overlay,setOverlay]=useState(false)

  return (
    <div className='navbar-container'>
      <div className={overlay?"overlay":''}></div>
        <nav class="navbar navbar-expand-lg">
            <div class="container navbar-cont">
              <div className='logos'>
              <a class="navbar-brand m-0" href="#"><img src={tupLogo} alt="tup-logo" className='logo'/></a>
              <a class="navbar-brand m-0" href="#"><img src={claLogo} alt="cla-logo" className='logo'/></a>
              </div>
                
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation" onClick={()=>setOverlay(!overlay)}>
                <span class="navbar-toggler-icon"></span>
                </button>
                {/* menu that will appear when hamburger is clicked */}
                <div class="collapse navbar-collapse " id="navbarNavAltMarkup">
                    {/* ms auto moves the menu to the right */}
                    <div class="navbar-nav ms-auto">
                        <Link class="nav-link" to='/'>Home</Link>
                        <Link class="nav-link" to='/about-us'>About Us</Link>
                        {/* <Link class="nav-link" to="/department">Departments</Link> */}
                        <Link class="nav-link" to="/services">Services</Link>
                    </div>
                </div>
            </div>
            </nav>
    </div>
    
  )
}

export default Navbar
