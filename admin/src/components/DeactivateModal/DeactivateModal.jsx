import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './DeactivateModal.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faX} from '@fortawesome/free-solid-svg-icons'


const DeactivateModal = ({open, close}) => {

    if(!open){
        return null
    }

  return ReactDom.createPortal(
    <div className='deactivate-modal-container'>
        {/* overlay */}
        <div className="deactivate-modal-overlay overlay"></div>

        {/* modal box */}
        <div className="deactivate-modal-box">
           {/* close */}
           <div className="close-box">
            <FontAwesomeIcon icon={faX} onClick={close} className='close-btn'/>
           </div>
           {/* content */}
           <div className="content">
            <p className='label'>Deactivate 'insert role here'</p>
            <p className='uname'>Username</p>
           </div>
            {/* buttons */}
            <div className="buttons">
                <div className="btn cancel-btn">Cancel</div>
                <div className="btn deac-btn">Deactivate</div>
            </div>
        </div>      
    </div>,
    document.getElementById('portal')
  )
}

export default DeactivateModal
