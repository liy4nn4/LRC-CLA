import React from 'react'
import './Footer.css'
import tupLogo from '../../assets/OPAC/icons/tup-logo.png'
import claLogo  from '../../assets/OPAC/icons/cla-logo.png'
import { Link } from 'react-router-dom'

const Footer = () => {
  //display page from the top
  const handleNavigate = () => {
    window.scrollTo(0, 0);
  };
  
  return (
    <div className='footer-container'>
      {/* footer logo and college name */}
      <div className='footer-text'>
        <p>College of Liberal Arts</p>
        <p>Learning Resource Center</p>
      </div>
      {/* connect with us */}
      <div className="connect">
        <p className='m-2'>Connect with us</p>
        <div className="socials">
          <i class="fa-brands fa-facebook"></i>
          <i class="fa-brands fa-x-twitter"></i>
          <i class="fa-brands fa-instagram"></i>
          <i class="fa-regular fa-envelope"></i>
          <i class="fa-regular fa-phone"></i>
        </div>
      </div>
      {/* copyright */}
      <div className="tc-cpy">
        <Link to='/terms-conditions' onClick={handleNavigate} className='tc'>Terms & Conditions</Link>
       <p className='m-0 copyright'>Copyright©2024. All Rights Reserved TUP-CLA Learning Resource Center</p>
      </div>
        
    </div>
  )
}

export default Footer
