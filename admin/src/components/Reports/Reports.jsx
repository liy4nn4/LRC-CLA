import React from 'react'
import './Reports.css'
import dropdown from '../../assets/Management System/reports/arrow-dropdown.svg'
import report from '../../assets/Management System/reports/generate-report.svg'

const Reports = () => {
  return (
    <div className='reports-container'>
      <h1>Reports</h1>
        {/* reports summary */}
        <div className="reports-summary">
          <h4>Generate Reports</h4>
          {/* type of report */}
          <div className="report-type">
            <label htmlFor="">Type of Report</label>
            <select name="" id="">
              <option value="" disabled selected>Select a type</option>
            </select>
          </div>
          {/* date range */}
          <div className="date-range">
            {/* start date */}
            <div className="start-date">
              <label htmlFor="start-date">Start date</label>
              <input type="date" name="" id="start-date" />
            </div>
            {/* end date */}
            <div className="end-date">
              <label htmlFor="end-date">End date</label>
              <input type="date" name="" id="end-date" />
            </div>
          </div>
          <div className="buttons">
            <button className="btn clear-btn">Clear</button>
            <div className="btn generate-report">Generate Report</div>
          </div>
        </div>
     
    </div>
  )
}

export default Reports

