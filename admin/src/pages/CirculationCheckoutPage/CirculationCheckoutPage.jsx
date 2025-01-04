import React from 'react'
import './CirculationCheckoutPage.css'
import CirculationCheckout from '../../components/CirculationCheckout/CirculationCheckout'
import CirculationCheckin from '../../components/CirculationCheckout/CirculationCheckin'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'

const CirculationCheckoutPage = () => {
  const clickedAction = localStorage.getItem('clickedAction'); // Get the clicked action

  return (
    <div className='circcheckoutpage'>
      <div>
        <AdminNavbar/>
      </div> 
      <div>
        <AdminTopNavbar/>
        {/* Render CirculationCheckout or CirculationCheckin based on clickedAction */}
        {clickedAction === 'Check In' ? <CirculationCheckin /> : <CirculationCheckout />}
      </div>
    </div>
  )
}

export default CirculationCheckoutPage;
