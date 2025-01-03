import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Patrons.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faSearch } from '@fortawesome/free-solid-svg-icons';

const Patrons = () => {
    const [patrons, setPatrons] = useState([]);

    useEffect(() => {
        // Fetch data from backend API
        axios
        .get(`http://localhost:3001/patron`) // Replace with your backend endpoint
        .then((response) => {
            setPatrons(response.data);
        })
        .catch((error) => {
            console.error("Error fetching patron data:", error);
        });
    }, []);
  return (
    <div className='patrons-container'>
        <h1>Patrons</h1>

        {/* search field and category filter */}
        <div className="search-field-category-filter">
            {/* search field box */}
            <div className="patrons-search-field">
                <label htmlFor="">Search field</label>
                <select name="" id="" className='patrons-filter'>
                    <option value="">Standard</option>
                </select>
            </div>

             {/* category box */}
             <div className="patrons-category">
                <label htmlFor="">Category</label>
                <select name="" id="" className='patrons-filter'>
                    <option value="">Any</option>
                </select>
            </div>
        </div>

        {/* search bar */}
        <div className="search-bar-box">
            <input type="text" className='patrons-search-bar'placeholder='Search'/>
            <button className="patrons-search-button">
                <FontAwesomeIcon icon={faSearch} className='icon'/>
                Search
            </button>
        </div>

        {/* logbook table */}
        
            <table className='patrons-table'>
                <thead>
                    <tr>
                        <td>TUP ID</td>
                        <td>Name</td>
                        <td>Email</td>
                        <td>Category</td>
                        <td>Checkouts</td>
                        <td>Fines</td>
                        <td></td>
                        
                    </tr>
                </thead>

                <tbody>
                    {patrons.length>0?patrons.map((patron, index) => (
                        <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                        <td style={{ padding: "10px" }}>{patron.tup_id}</td>
                        <td style={{ padding: "10px" }}>
                            {patron.patron_fname} {patron.patron_lname}
                        </td>
                        <td style={{ padding: "10px" }}>{patron.patron_email}</td>
                        <td style={{ padding: "10px" }}>{patron.category}</td>
                        <td style={{ padding: "10px" }}>{patron.total_checkouts}</td>
                        <td>₱<span>0.00</span></td>
                        <td className='patron-edit-checkout'>
                            <button className='patron-edit-button'>
                                <FontAwesomeIcon icon={faPen} className='icon'/>
                                Edit
                            </button>
                            
                        </td>
                        </tr>
                    )):''}
                    </tbody>

                
            </table>
        
      
    </div>
  )
}

export default Patrons
