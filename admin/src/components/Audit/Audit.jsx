import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Audit.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faFileExport} from '@fortawesome/free-solid-svg-icons'

const Audit = () => {
    
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
                    <td>Timestamp</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>staff1</td>
                    <td>catalog item</td>
                    <td>07-20-2024  10:30 AM</td>
                </tr>
                <tr>
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
