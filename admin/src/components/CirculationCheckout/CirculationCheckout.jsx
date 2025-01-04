import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './CirculationCheckout.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faPen } from '@fortawesome/free-solid-svg-icons';
import CirculationSuccessful from '../CirculationSuccessful/CirculationSuccessful';

const CirculationCheckout = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItems, setSelectedItems] = useState(JSON.parse(localStorage.getItem('selectedItems')) || []);
  const id = localStorage.getItem('id');
  const clickedAction = localStorage.getItem('clickedAction'); // Get clicked action
  const [patron, setPatron] = useState([]);
  const length = selectedItems.length;
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
  const time = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Manila" });
  const currentDate = new Date(date); // Convert to Date object
  currentDate.setDate(currentDate.getDate() + 7); // Add 7 days
  const dueDate = currentDate.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

  const getPatron = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/checkoutPatron`, {
        params: { id },
      });
      setPatron(response.data); // Update patron state with response data
      console.log('Fetched Patron:', response.data); // Log for debugging
    } catch (error) {
      console.error('Error fetching patron:', error.message);
    }
  };

  useEffect(() => {
    getPatron();
    console.log(patron)
  }, []);

  const handleCheckout = async () => {
    try {
      // Create an array of promises to insert all items
      const checkoutPromises = selectedItems.map((item) => {
        return axios.post(`http://localhost:3001/checkout`, {
          checkout_date: date,
          checkout_due: dueDate,
          resource_id: item.resource_id,
          patron_id: id,
        });
      });

      // Await all promises to complete
      await Promise.all(checkoutPromises);

      console.log('All items checked out successfully!');
      setOpen(true); // Open success modal
      
      setSelectedItems([]); // Update state
    } catch (error) {
      console.error('Error during checkout:', error.message);
    }
  };

  const patronName = patron.length > 0 ? `${patron[0].patron_fname} ${patron[0].patron_lname}` : '';

  return (
    <div className='circ-checkout-container'>
      <h1>Circulation</h1>

      {/* path and back */}
      <div className="back-path">
        <button onClick={() => navigate(-1)} className="btn">Back</button>
        <p>Circulation / Select patron / Select items / <span>{clickedAction === 'Check In' ? 'Check in' : 'Check out'}</span></p>
      </div>

      {/* info */}
      <div className="checkout-details row">
        {/* items to be issued */}
        <div className="items col-5">
          <div>
            <h5>Items to be {clickedAction === 'Check In' ? 'returned' : 'issued'} (<span>{length}</span>)</h5>
            {/* Selected items */}
            <div className='inner overflow-y-auto overflow-x-hidden '>
              {selectedItems.map((item) => (
                <div className="item row mt-2 w-100 m-auto" key={item.resource_id}>
                  {/* Cover */}
                  <div className="col-3 cover">
                    <img src={`data:image/jpeg;base64,${item.cover}` || 'https://via.placeholder.com/100'} alt={item.title} />
                  </div>
                  {/* Item info */}
                  <div className="col-9 info">
                    <p className='title'>{item.resource_title}</p>
                    <p className='qnty'>Quantity: <span>1</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* edit */}
          <div>
            <Link to={`/circulation/patron/item/${id}`} state={{ selectedItems }}>
              <button className="btn edit-btn">
                <FontAwesomeIcon icon={faPen} />
                Edit
              </button>
            </Link>
          </div>
        </div>

        {/* checkout summary */}
        <div className="checkout-sum col">
          {/* header */}
          <div className="header">
            {clickedAction === 'Check In' ? 'Return summary' : 'Check out summary'}
          </div>

          {/* info */}
          <div className="row patron-info-box">
            <div className="col-4">
              <p className="label">{clickedAction === 'Check In' ? 'Book returned by:' : 'Book issued for:'}</p>
            </div>
            {/* patron details */}
            <div className="col patron-info">
              <div>
                {patron.map((item, index) => (
                  <div key={index}>
                    <p className="patron-name">{item.patron_lname}, {item.patron_fname}</p>
                    <p className='id'>{item.tup_id}</p>
                    <p className="college">{item.college}</p>
                    <p className="course">{item.course}</p>
                    <p className='email'>{item.patron_email}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* break */}
            <hr />

            {/* book info */}
            <div className="book-info-box row">
              <div className="col labels">
                <p>No. of books {clickedAction === 'Check In' ? 'returned' : 'issued'}:</p>
                <p>Book {clickedAction === 'Check In' ? 'returned' : 'issued'} on:</p>
                <p>Book must be {clickedAction === 'Check In' ? 'returned' : 'returned'} on/before:</p>
              </div>
              <div className="col contents">
                <p>{length}</p>
                <p>{date} {time}</p>
                <p className='due'>{dueDate}</p>
              </div>
            </div>

            {/* checkout button  */}
            <div className="checkout-btn-box">
              <button className="btn" onClick={handleCheckout}>
                {clickedAction === 'Check In' ? 'Return item' : 'Check out item'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <CirculationSuccessful open={open} close={() => setOpen(false)} patronName={patronName} />
    </div>
  )
}

export default CirculationCheckout
