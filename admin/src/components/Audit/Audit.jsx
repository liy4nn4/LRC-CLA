import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Audit.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faFileExport} from '@fortawesome/free-solid-svg-icons'

const Audit = () => {
    const [audit, setAudit] = useState([]);
    const [loading, setLoading] = useState(false)

    const getAudit = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/getAudit`);
            setAudit(response.data); // Use response.data directly since the API returns the results array
        } catch (err) {
            console.error('Error fetching audit logs:', err.message);
        }
    };

    useEffect(() => {
        getAudit();
    }, []);

    useEffect(() => {
        console.log('Audit data updated:', audit);
    }, [audit]);


  return (
    <div className='audit-container'>
        <h1>User activity log</h1>

        {/* filter dropdown */}
        <div className="filter-dropdown">
            {/* filter by user */}
            <select name="" id="">
                <option value="" selected disabled>Filter by user</option>
            </select>
            {/* filter by activity */}
            <select name="" id="">
                <option value="" selected disabled>Filter by activity</option>
                <option value="">Catalog item</option>
                <option value="">Edit item</option>
                <option value="">Remove item</option>
                <option value="">Issue book</option>
                <option value="">Return book</option>
                <option value="">Add patron</option>
                <option value="">Edit patron</option>
                <option value="">Remove patron</option>
                <option value="">Generate report</option>
                <option value="">Login</option>
                <option value="">Logout</option>
            </select>
        </div>

        {/* filter by date and export */}
        <div className="filter-date-export">
            {/* filter date */}
            <div className="filter-date">
                <input type="date" />
                <span>to</span>
                <input type="date" name="" id="" />
                <button className="btn">Clear</button>
            </div>
            {/* export */}
            <button className="btn export-btn">
                <FontAwesomeIcon icon={faFileExport} />
                Export
            </button>
        </div>
        
        {/* table */}
        <table>
            <thead>
                <tr>
                    <td>User</td>
                    <td>Action</td>
                    <td>Affected Table</td>
                    <td>Old Value</td>
                    <td>New Value</td>
                    <td>Timestamp</td>

                    
                </tr>
            </thead>
            <tbody>
            {audit.length > 0 ? (
                            audit.map((item, index) => (
                                <tr key={index}>
                                    <div className="row ">
                                        <div className="col"><input type="radio" /> {item.user_id}</div>
                                        <div className="col d-flex align-items-center justify-content-center">{item.action_type}</div>
                                        <div className="col-3 d-flex align-items-center">{item.table_name}</div>
                                        <div className="col-3 d-flex align-items-center">{item.old_value}</div>
                                        <div className="col-3 d-flex align-items-center">{item.new_value}</div>
                                        <div className="col-2 d-flex align-items-center justify-content-center">{item.action_timestamp}</div>
                                    </div>
                                    {/* <td>{entriesPerPage === "All"
                        ? index + 1 
                        : index + 1 + (currentPage - 1) * entriesPerPage}</td> */}
                                    <td>{item.user_id}</td>
                                    <td>{item.action_type}</td>
                                    <td>{item.table_name}</td>
                                    <td>{item.old_value}</td>
                                    <td>{item.new_value}</td>
                                    <td>{item.action_timestamp}</td>
                                    
                                    
                                </tr>
                            ))
                        ) : audit.length==0 && !loading?(
                            <tr>
                                <td colSpan="10">No records available</td>
                            </tr>
                        ):(
                            <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                              <div className="spinner-box">
                                <div className="spinner-grow text-danger" role="status">
                                  <span className="sr-only">Loading...</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                <tr>
                    <td>staff1</td>
                    <td>catalog item</td>
                    <td>07-20-2024  10:30 AM</td>
                    <td>staff1</td>
                    <td>catalog item</td>
                    <td>07-20-2024  10:30 AM</td>
                </tr>
                <tr>
                    <td>staff1</td>
                    <td>catalog item</td>
                    <td>07-20-2024  10:30 AM</td>
                    <td>staff1</td>
                    <td>catalog item</td>
                    <td>07-20-2024  10:30 AM</td>
                </tr>
            </tbody>
        </table>
    </div>
  )
}

export default Audit
