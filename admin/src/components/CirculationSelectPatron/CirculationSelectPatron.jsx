import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CirculationSelectPatron.css';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const CirculationSelectPatron = () => {
  const navigate = useNavigate();
  const [patrons, setPatrons] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [filteredPatrons, setFilteredPatrons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [itemsPerPage] = useState(5); // Number of items per page
  const clickedAction = localStorage.getItem('clickedAction');
  const getPatrons = async () => {
    try {
      // Determine the URL based on clickedAction
      const url =
        localStorage.getItem('clickedAction') === 'Check Out'
          ? `http://localhost:3001/patron`
          : `http://localhost:3001/patronCheckin`;

      const response = await axios.get(url);
      const sortedPatrons = response.data.sort(
        (a, b) => b.total_checkouts - a.total_checkouts
      );
      setPatrons(sortedPatrons);
      setFilteredPatrons(sortedPatrons);
    } catch (error) {
      console.error('Error fetching patron data:', error);
    }
  };

  useEffect(() => {
    getPatrons();
    console.log("clicked Action: ", clickedAction)
    localStorage.removeItem('selectedItems');
  }, [clickedAction]);

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const filtered = patrons.filter((patron) => {
      return (
        patron.tup_id.toLowerCase().includes(query) ||
        `${patron.patron_fname} ${patron.patron_lname}`.toLowerCase().includes(query) ||
        patron.category.toLowerCase().includes(query) ||
        patron.course_name.toLowerCase().includes(query)
      );
    });
    setFilteredPatrons(filtered);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPatrons.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredPatrons.length / itemsPerPage);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Determine the action to display in the UI
  const actionText = localStorage.getItem('clickedAction') === 'Check Out' ? 'Check out item for' : 'Check in item for';

  return (
    <div className='circ-select-patron-container'>
      <h1>Circulation</h1>

      {/* path and back */}
      <div className="back-path">
        <button onClick={() => navigate(-1)} className="btn">Back</button>
        <p>Circulation / <span>Select patron</span></p>
      </div>

      {/* search */}
      <div className="search-container">
        <p className='m-0'>{actionText}</p>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            handleSearch();
          }}
          placeholder="Search by name, ID, category, or course"
        />
        <button className="btn" onClick={handleSearch}>Search</button>
      </div>

      {/* list of patrons */}
      <div className="patron-list">
        <p>List of registered patrons</p>

        {/* header */}
        <div className="row patron-list-header">
          <div className="col">Patron ID</div>
          <div className="col-3">Name</div>
          <div className="col">Category</div>
          <div className="col-3">Course</div>
          <div className="col-2">Checkouts</div>
        </div>

        {/* If no patrons found */}
        {/* {filteredPatrons.length === 0 ? (
          <div className="no-patrons">No patrons found</div>
        ) : (
          // patron items
          currentItems.map((patron, index) => (
            <Link to={`/circulation/patron/item/${patron.patron_id}`} key={index}>
              <div className="row patron">
                <div className="col"><input type="radio" /> {patron.tup_id}</div>
                <div className="col-3 text-start d-flex align-items-center">
                  {patron.patron_fname} {patron.patron_lname}
                </div>
                <div className="col d-flex align-items-center justify-content-center">{patron.category}</div>
                <div className="col-3 d-flex align-items-center">{patron.course_name}</div>
                <div className="col-2 d-flex align-items-center justify-content-center">{patron.total_checkouts}</div>
              </div>
            </Link>
          ))
        )} */}


        {filteredPatrons.length === 0 ? (
          <div className="no-patrons">No patrons found</div>
        ) : (
          currentItems.map((patron, index) => {
            const isCheckIn = localStorage.getItem('clickedAction') === 'Check In';
            return isCheckIn || patron.total_checkouts < 1 ? (
              <Link to={`/circulation/patron/item/${patron.patron_id}`} key={index}>
                <div className="row patron">
                  <div className="col"><input type="radio" /> {patron.tup_id}</div>
                  <div className="col-3 text-start d-flex align-items-center">
                    {patron.patron_fname} {patron.patron_lname}
                  </div>
                  <div className="col d-flex align-items-center justify-content-center">{patron.category}</div>
                  <div className="col-3 d-flex align-items-center">{patron.course_name}</div>
                  <div className="col-2 d-flex align-items-center justify-content-center">{patron.total_checkouts}</div>
                </div>
              </Link>
            ) : (
              <div className="row patron disabled grey" key={index}>
                <div className="col"><input type="radio" disabled /> {patron.tup_id}</div>
                <div className="col-3 text-start d-flex align-items-center">
                  {patron.patron_fname} {patron.patron_lname}
                </div>
                <div className="col d-flex align-items-center justify-content-center">{patron.category}</div>
                <div className="col-3 d-flex align-items-center">{patron.course_name}</div>
                <div className="col-2 d-flex align-items-center justify-content-center">{patron.total_checkouts}</div>
              </div>
            );
          })
        )}

        {/* pagination */}
        {filteredPatrons.length > 0 && (
          <div className="pagination">
            <div className="buttons">
              <button className="btn" onClick={goToPreviousPage} disabled={currentPage === 1}><FontAwesomeIcon icon={faArrowLeft} className='icon'/></button>
              <span>Page {currentPage} of {totalPages}</span>
              <button className="btn" onClick={goToNextPage} disabled={currentPage === totalPages}><FontAwesomeIcon icon={faArrowRight} className='icon'/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CirculationSelectPatron;
