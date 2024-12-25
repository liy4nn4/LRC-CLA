import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './CirculationCheckout.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faPen} from '@fortawesome/free-solid-svg-icons';
import CirculationSuccessful from '../CirculationSuccessful/CirculationSuccessful';

const CirculationCheckout = () => {
  const [open,setOpen] = useState(false)

  return (
    <div className='circ-checkout-container'>
      <h1>Circulation</h1>
      
      {/* path and back */}
      <div className="back-path">
        <Link to='/circulation/patron/item'>
          <button className="btn">Back</button>
        </Link>
        <p>Circulation / Select patron / Select items / <span>Check out</span></p>
      </div>

      {/* info */}
      <div className="checkout-details row">
        {/* items to be issued */}
        <div className="items col-5">
          <div>
            <h5>Items to be issued (<span>1</span>)</h5>
            {/* item */}
            <div className="item row">
              {/* cover */}
              <div className="col-3 cover">
                <img src="https://i.pinimg.com/originals/a1/f8/87/a1f88733921c820db477d054fe96afbb.jpg" alt="" />
              </div>
              {/* item info */}
              <div className="col-8 info">
                <p className='title'>Book Title</p>
                <p className='qnty'>Quantity: <span>1</span></p>
              </div>
              {/* remove item button */}
              <div className="col-1 remove">
                <FontAwesomeIcon icon={faX} />
              </div>
            </div>
          </div>

          {/* edit */}
          <div>
            <Link to='/circulation/patron/item'>
              <button className="btn edit-btn">
                <FontAwesomeIcon icon={faPen} />
                Edit button
              </button>
            </Link>
          </div>
        </div>

        {/* checkout summary */}
        <div className="checkout-sum col">
          {/* header */}
          <div className="header">
            Check out summary
          </div>

          {/* info */}
          <div className="row patron-info-box">
            <div className="col-4">
              <p className="label">Book issued for:</p>
            </div>
            {/* patron details */}
            <div className="col patron-info">
              {/* patron */}
              <div>
                <p className="patron-name">Bernal, Lance R.</p>
                <p className='id'>tupm-21-2222</p>
              </div>
              {/* college */}
              <div>
                <p className="college">college of science</p>
                <p className="course">bachelor of science in information technology</p>
              </div>
              {/* email */}
              <p className='email'>lance.bernal@tup.edu.ph</p>
            </div>

            {/* break */}
            <hr />

            {/* book info */}
            <div className="book-info-box row">
              {/* book info labels */}
              <div className="col labels">
                <p>No. of books issued:</p>
                <p>Book issued on:</p>
                <p>Book must be returned on/before:</p>
              </div>
              {/* book info content */}
              <div className="col contents">
                <p>1</p>
                <p>07/20/2024 7:1201 AM</p>
                <p className='due'>07/27/2024</p>
              </div>
            </div>

            {/*checkout button  */}
            <div className="checkout-btn-box">
              <button className="btn" onClick={()=>setOpen(true)}>Check out item</button>
            </div>
          </div>
        </div>
      </div>

      <CirculationSuccessful open={open} close={()=>setOpen(false)}/>
    </div>
  )
}

export default CirculationCheckout
