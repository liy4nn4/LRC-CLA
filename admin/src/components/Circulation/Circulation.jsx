import React from 'react'
import './Circulation.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom'

const Circulation = () => {
  return (
    <div className='circulation-container'>
      <h1>Circulation</h1>

      {/* check in button */}
      <Link to='/circulation/select-patron'>
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
              <th>Return Date</th>
              <th>Time in</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TUPM-21-222</td>
              <td>Giolliana Plandez</td>
              <td>2</td>
              <td>
                <ul>
                  <li>Book1</li>
                  <li>Book2</li>
                </ul>
              </td>
              <td>BSIT-NS</td>
              <td>07-21-2024</td>
              <td>7:12:01 AM</td>
            </tr>
            <tr>
              <td>TUPM-21-222</td>
              <td>Giolliana Plandez</td>
              <td>2</td>
              <td>
                <ul>
                  <li>Book1</li>
                  <li>Book2</li>
                </ul>
              </td>
              <td>BSIT-NS</td>
              <td>07-21-2024</td>
              <td>7:12:01 AM</td>
            </tr>
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
