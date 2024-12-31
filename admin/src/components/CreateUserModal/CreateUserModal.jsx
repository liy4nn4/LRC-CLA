import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './CreateUserModal.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faX} from '@fortawesome/free-solid-svg-icons'


const CreateUserModal = ({open, close}) => {

    if(!open){
        return null
    }


  return ReactDom.createPortal(
    <div className='create-u-modal-container'>
        {/* overlay */}
        <div className="create-u-modal-overlay overlay"></div>

        {/* modal box */}
        <div className="create-u-modal-box">
           {/* header */}
           <div className="header">
            <h4>Create user account</h4>
            <FontAwesomeIcon icon={faX} onClick={close} className='close-btn'/>
           </div>

            <div className="content">
                <div className="col input-box">
                    <label htmlFor="fname">First Name <span>*</span></label>
                    <input type="text" id='fname' placeholder='Enter first name'/>
                </div>
                <div className="col input-box">
                    <label htmlFor="lname">Last Name <span>*</span></label>
                    <input type="text" id='lname' placeholder='Enter last name'/>
                </div>
                <div className="col input-box">
                    <label htmlFor="uname">Username <span>*</span></label>
                    <input type="text" id='uname' placeholder='Enter username'/>
                </div>
                <div className="col input-box">
                    <label htmlFor="">Role <span>*</span></label>
                    <select name="role" id="role">
                        <option value="" disabled selected>Select role</option>
                    </select>
                </div>
                <div className="col input-box">
                    <label htmlFor="" id='pass'>Password <span>*</span></label>
                    <input type="text" id='pass' placeholder='Enter password'/>
                </div>
                <div className="col input-box">
                    <label htmlFor="" id='confirm-pass'>Confirm Password <span>*</span></label>
                    <input type="text" id='confirm-pass' placeholder='Confirm password'/>
                </div>
            </div>
            <div className="buttons">
                <button className="btn cancel-btn">
                    Cancel
                </button>
                <button className="btn create-btn">
                    Create User
                </button>
            </div>
            
        </div>      
    </div>,
    document.getElementById('portal')
  )
}

export default CreateUserModal
