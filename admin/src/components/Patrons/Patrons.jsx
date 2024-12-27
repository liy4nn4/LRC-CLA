import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Patrons.css'
import search from '../../assets/Management System/logbook/search.svg'
import checkout from '../../assets/Management System/patrons/checkout.svg'
import edit from '../../assets/Management System/patrons/edit-patron.svg'

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
                <img src={search} alt="" />
                Search
            </button>
        </div>

        {/* logbook table */}
        <div className='patrons-table-box'>
            <table className='patrons-table'>
                <thead>
                    <tr>
                        <th>TUP ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Category</th>
                        <th>Checkouts</th>
                        <th>Fines</th>
                        <th></th>
                        
                    </tr>
                </thead>

                <tbody>
                    {patrons.map((patron, index) => (
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
                                <img src={edit} alt="" />
                                Edit
                            </button>
                            <button className='patron-checkout-button'>
                                <img src={checkout} alt="" />
                                Checkout
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>

                
            </table>
        </div>
      
    </div>
  )
}

export default Patrons
