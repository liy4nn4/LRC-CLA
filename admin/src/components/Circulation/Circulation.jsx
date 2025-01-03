import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Circulation.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Circulation = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [filteredBorrowers, setFilteredBorrowers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getBorrowers();
    localStorage.removeItem('clickedAction');
  }, []);

  const getBorrowers = async () => {
    try {
      const response = await axios
        .get(`http://localhost:3001/getCirculation`)
        .then((res) => res.data);
      setBorrowers(response);
      setFilteredBorrowers(response); // Initialize filteredBorrowers with all borrowers
      console.log(response);
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleActionClick = (action) => {
    // Store the action in localStorage
    localStorage.setItem('clickedAction', action);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    // Filter borrowers based on the search term
    const filtered = borrowers.filter((borrower) =>
      `${borrower.patron_fname} ${borrower.patron_lname}`.toLowerCase().includes(value) ||
      borrower.tup_id.toLowerCase().includes(value) ||
      borrower.course.toLowerCase().includes(value) ||
      borrower.borrowed_books.toLowerCase().includes(value)
    );
    setFilteredBorrowers(filtered);
  };

  return (
    <div className="circulation-container">
      <h1>Circulation</h1>

      {/* Check-in buttons */}
      <div className="buttons">
      <Link to='/circulation/patron'>
          <button
            className='btn checkin-btn'
            onClick={() => handleActionClick('Check Out')}
          >
            <FontAwesomeIcon icon={faCartShopping} className='icon' />
            <span>Check out</span>
          </button>
        </Link>
        <Link to='/circulation/patron'>
          <button
            className='btn checkin-btn'
            onClick={() => handleActionClick('Check In')}
          >
            <FontAwesomeIcon icon={faCartPlus} className='icon' />
            <span>Check in</span>
          </button>
        </Link>
      </div>

      {/* Search */}
      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="Search"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="btn search-btn">Search</button>
      </div>

      <div>
        <h2>Recent transactions</h2>
        {/* Table */}
        <table className="circ-table">
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
            {filteredBorrowers.length > 0 ? (
              filteredBorrowers.map((borrower, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{borrower.tup_id}</td>
                  <td style={{ padding: '10px' }}>
                    {borrower.patron_fname} {borrower.patron_lname}
                  </td>
                  <td style={{ padding: '10px' }}>{borrower.total_checkouts}</td>
                  <td style={{ padding: '10px' }}>{borrower.borrowed_books}</td>
                  <td style={{ padding: '10px' }}>{borrower.course}</td>
                  <td style={{ padding: '10px' }}>
                    {new Date(borrower.checkout_date).toLocaleDateString('en-CA')}
                  </td>
                  <td style={{ padding: '10px' }}>
                    {new Date(borrower.checkout_due).toLocaleDateString('en-CA')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '10px' }}>
                  No records found...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <span>Page 1 of 1</span>
        <div className="buttons">
          <button className="btn">Previous</button>
          <button className="btn">Next</button>
        </div>
      </div>
    </div>
  );
};

export default Circulation;
