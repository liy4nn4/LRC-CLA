import React from 'react'
import './CirculationSelectPatron.css'
import { Link } from 'react-router-dom'

const CirculationSelectPatron = () => {
  return (
    <div className='circ-select-patron-container'>
        <h1>Circulation</h1>
      
        {/* path and back */}
        <div className="back-path">
            <Link to='/circulation'>
                <button className="btn">Back</button>
            </Link>
            <p>Circulation / <span>Select patron    </span></p>
        </div>

        {/* search */}
        <div className="search-container">
            <p className='m-0'>Check in item for</p>
            <input type="text" />
            <button className="btn">Search</button>
        </div>

        {/* list of patrons */}
        <div className="patron-list">
            <p>List of registered patrons</p>

            {/* header */}
            <div className="row patron-list-header">
                <div className="col">Patron ID</div>
                <div className="col">Name</div>
                <div className="col">Category</div>
                <div className="col">Course</div>
                <div className="col">Checkouts</div>
            </div>

            {/* patron */}
            <div className="row patron">
                <div className="col">
                    <input type="radio" /> TUPM-21-1232
                </div>
                <div className="col">Lance Bernal</div>
                <div className="col">Student</div>
                <div className="col">BSIT-NS</div>
                <div className="col">1</div>
            </div>

            {/* pagination */}
            <div className="pagination">
                <div className="buttons">
                    <button className="btn">Previous</button>
                    <button className="btn">Next</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default CirculationSelectPatron
