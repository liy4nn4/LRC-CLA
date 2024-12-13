import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import './Logbook.css'
import search from '../../assets/Management System/logbook/search.svg'
import exportIcon from '../../assets/Management System/logbook/export.svg'
import left from '../../assets/Management System/logbook/arrow-left-red.svg'
import right from '../../assets/Management System/logbook/arrow-right-red.svg'

const Logbook = () => {
    const [patron, setPatron] = useState([])

    useEffect(()=>{
        getPatron()
        
      },[])

    const getPatron = async()=>{
        try {
          const response = await axios.get(`http://localhost:3001/patron`).then(res=>res.data);
          setPatron(response)
          console.log(response)
        } catch (err) {
            console.log(err.message);
        }
      }
    
    /* useEffect(()=>{
        getPatron()
        console.log(patron)
        
      },[]) */

  return (
    <div className='logbook-container'>
        <h1>Logbook</h1>

        {/* search bar and export button */}
        <div className="search-export">
            {/* search bar */}
            <form class="d-flex " role="search">
                  <input class="form-control me-2 log-search-bar" type="search" placeholder="Enter Student ID or Student Name" aria-label="Search"/>
                  <button class="btn log-search-button" onClick={getPatron}><img src={search} alt="" />
                  Search</button>
            </form>
            {/* export button */}
            <button className='btn logbook-export-button'>
                <img src={exportIcon} alt="" />
                Export
            </button>
        </div>

        {/* logbook filters */}
        <div className="logbook-filters">
            {/* logbook entries per page */}
            <div className="logbook-entries-page">
                <label htmlFor="entries">Entries per page</label>
                <div class="dropdown">
                  <button class="btn log-dropdown dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    1
                  </button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#">Action</a></li>
                    <li><a class="dropdown-item" href="#">Another action</a></li>
                    <li><a class="dropdown-item" href="#">Something else here</a></li>
                  </ul>
                </div>
            </div>

            {/* date filter */}
            <div className="logbook-date-filter">
                <label htmlFor="" >Date Filter</label>
                <input type="date" className='logbook-filter-date'/>
                <p>to</p>
                <input type="date" className='logbook-filter-date'/>
                <button className='btn logbook-clear-button'>Clear</button>
            </div>
        </div>

        {/* logbook table */}
        <div className='logbook-table-box'>
            <table className='logbook-table'>
                <thead>
                    <tr>
                        <th>Number</th>
                        <th>TUP ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Gender</th>
                        <th>Phone No.</th>
                        <th>Course</th>
                        <th>College</th>
                        <th>Date</th>
                        <th>Time in</th>
                    </tr>
                </thead>

                <tbody>
                    {patron?patron.length>0?patron.map((item,key)=>(
                    <tr key={key}>
                        <td>{item.patron_id}</td>
                        <td>{item.tup_id}</td>
                        <td>{item.patron_fname}</td>
                        <td>{item.patron_lname}</td>
                        <td>{item.patron_sex}</td>
                        <td>{item.patron_mobile}</td>
                        <td>{item.course}</td>
                        <td>{item.college}</td>
                        <td>{new Date(item.att_date).toISOString().split('T')[0]}</td>
                        <td>{item.att_log_in_time}</td>
                        {/* <td>
                        { <Link to={`/view-item/${item.resource_id}`}>
                            <button className='btn cat-view'>
                            <i class="fa-solid fa-bars"></i>
                            View
                            </button>
                        </Link> }
                        </td> */}
                    </tr> )):
                        <tr>
                            <td colSpan="7">No records available</td> 
                        </tr>:''}
                </tbody>





                <tbody>
                    <tr>
                        <td>x</td>
                        <td>xxxx-xx-xxxx</td>
                        <td>xxxx</td>
                        <td>xxxx</td>
                        <td>xxxx</td>
                        <td>xxxxx</td>
                        <td>xxxx-xx</td>
                        <td>xxx</td>
                        <td>xx-xx-xxxx</td>
                        <td>x:xx:xx AM</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {/* logbook table pagination */}
        <div className="logbook-table-pagination">
            <div className="logbook-table-entries">
                Showing <span className='logbook-current-entry'>5</span> of <span className='logbook-total-entry'>10</span> Entries
            </div>
            <div className="logbook-table-button-pagination">
                <img src={left}alt="" />
                <div className='logbook-pages'>
                    <div className='logbook-pages-current'>2</div>
                    <div className='logbook-pages-not-current'>1</div>
                </div>
                <img src={right}alt="" />
            </div>
        </div>


      
    </div>
  )
}

export default Logbook
