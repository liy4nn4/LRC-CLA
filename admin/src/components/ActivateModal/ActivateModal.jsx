import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './ActivateModal.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faX} from '@fortawesome/free-solid-svg-icons'


const ActivateModal = ({open, close}) => {

    if(!open){
        return null
    }

  return ReactDom.createPortal(
    <div className='activate-modal-container'>
        {/* overlay */}
        <div className="activate-modal-overlay overlay"></div>

        {/* modal box */}
        <div className="activate-modal-box">
           {/* close */}
           <div className="close-box">
            <FontAwesomeIcon icon={faX} onClick={close} className='close-btn'/>
           </div>
           {/* content */}
           <div className="content">
            <p className='label'>Activate 'insert role here'</p>
            <p className='uname'>Username</p>
           </div>
            {/* buttons */}
            <div className="buttons">
                <div className="btn cancel-btn">Cancel</div>
                <div className="btn acc-btn">Activate</div>
            </div>
        </div>      
    </div>,
    document.getElementById('portal')
  )
}

export default ActivateModal
