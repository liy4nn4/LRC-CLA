import React, { useState } from 'react'
import tupLogo from '../../assets/OPAC/icons/tup-logo.png'
import claLogo  from '../../assets/OPAC/icons/cla-logo.png'
import './Navbar.css'
import MenuModal from '../MenuModal/MenuModal'
import { Link } from 'react-router-dom'


const Navbar = () => {

  const handleNavigate = () => {
    window.scrollTo(0, 0);
  };
  
  return (
    <div className='navbar-container'>
      <nav class="navbar navbar-expand-lg">
        <div class="container">
          <Link to='/' onClick={handleNavigate} className='link'><img src={claLogo} alt="CLA Logo" /></Link>
          
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="#"><Link to='/' onClick={handleNavigate} className='link'>Home</Link></a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#"><Link to='/services' onClick={handleNavigate} className='link'>Services</Link></a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#"><Link to='/about-us' onClick={handleNavigate} className='link'>About us</Link></a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
    
  )
}

export default Navbar
