import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './CatalogFilterModal.css'
import Select from 'react-select'

const CatalogFilterModal = ({open,close}) => {

    if(!open){
        return null
    }

  return ReactDom.createPortal(
    <div className='catfil-modal-container'>
        {/* overlay */}
        <div className="catfil-modal-overlay overlay"></div>

        {/* modal box */}
        <div className="catfil-modal-box">
            {/* resource type */}
            <div className="category">
                <h6>Resource Type</h6>
                <div className="input">
                    <input type="checkbox" name="" id="" />
                    Book
                </div>
            </div>

            {/* Department  */}
            <div className="category">
                <h6>Department</h6>
                <div className="input">
                    <input type="checkbox" name="" id="" />
                    Book
                </div>
            </div>

            {/* resource type */}
            <div className="category">
                <h6>Resource Type</h6>
                <div className="input">
                    <input type="checkbox" name="" id="" />
                    Book
                </div>
            </div>
            
        </div>      
    </div>,
    document.getElementById('portal')
  )
}

export default CatalogFilterModal
