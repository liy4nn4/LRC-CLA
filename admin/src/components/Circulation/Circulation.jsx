import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Circulation.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom'

const Circulation = () => {
  const [borrowers, setBorrowers] = useState([]);

    useEffect(() => {
        getBorrowers();
        
    }, []);

   
    const getBorrowers = async()=>{
      try {
        const response = await axios.get(`http://localhost:3001/getCirculation`).then(res=>res.data);
        setBorrowers(response)
        console.log(response)
      } catch (err) {
          console.log(err.message);
      }
    }
    
  return (
    <div className='circulation-container'>
      <h1>Circulation</h1>

      {/* check in button */}
      <Link to='/circulation/patron'>
        <button className='btn checkin-btn'>
          <FontAwesomeIcon icon={faCartPlus} className='icon'/>
          <span>Check in</span>
        </button>
      </Link>

      {/* search */}
      <div className="search-container">
        <input type="text" className='search-bar' placeholder='Search'/>
        <button className='btn search-btn'>Search</button>
        <div class="dropdown">
          <button class="btn dropdown-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            Dropdown button
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </div>
      </div>

      <div>
        <h2>Recent transactions</h2>
        {/* table */} 
        <table className='circ-table'> 
          <thead>
            <tr>
              <th>TUP ID</th>
              <th>Name</th>
              <th>No. of book/s issued</th>
              <th>Book/s issued</th>
              <th>Course</th>
              <th>Borrow Date</th>
              <th>Return Date</th>
            </tr>
          </thead>

          <tbody>
              {borrowers.map((borrower, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "10px" }}>{borrower.tup_id}</td>
                  <td style={{ padding: "10px" }}>
                      {borrower.patron_fname} {borrower.patron_lname}
                  </td>
                  <td style={{ padding: "10px" }}>{borrower.total_checkouts}</td>
                  <td style={{ padding: "10px" }}>{borrower.borrowed_books}</td>
                  <td style={{ padding: "10px" }}>{borrower.course}</td>
                  <td style={{ padding: "10px" }}>{new Date(borrower.checkout_date).toLocaleDateString('en-CA')}</td>
                  <td style={{ padding: "10px" }}>{new Date(borrower.checkout_due).toLocaleDateString('en-CA')}</td>
                  
                  
                  
                  </tr>
              ))}
            </tbody>

          
        </table>
      </div>
      


      {/* pagination */}
      <div className="pagination">
        <span>Page 1 of 1</span>
        <div className="buttons">
          <button className="btn">Previous</button>
          <button className="btn">Next</button>
        </div>
      </div>
    </div>
  )
}

export default Circulation
