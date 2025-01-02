import React, { useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import './EditUserModal.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faX} from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'

const EditUserModal = ({open, close, account, handleEditChange,error, editUserAccount}) => {
    const id = account?account.id:0
    const [roles, setRoles] = useState([])

    useEffect(()=>{
        getRole()
    },[])

    const getRole = async()=>{
        try{
            const response = await axios.get('http://localhost:3001/roles')
            console.log(response)
            setRoles(response.data)
        }catch(err){
            console.log('Cannot retrieve roles. An error occurred: ', err.message)
        }
    }

    console.log(account)
    if(!open){
        return null
    }


  return ReactDom.createPortal(
    <div className='edit-u-modal-container'>
        {/* overlay */}
        <div className="edit-u-modal-overlay overlay"></div>

        {/* modal box */}
        <div className="edit-u-modal-box">
           {/* header */}
           <div className="header">
            <h4>Edit user account</h4>
            <FontAwesomeIcon icon={faX} onClick={close} className='close-btn'/>
           </div>

            <div className="content">
                <div className="col input-box">
                    <label htmlFor="fname">First Name <span>*</span></label>
                    <input type="text" id='fname' name='fname' placeholder='Enter first name' value={account?.fname} onChange={handleEditChange}/>
                    <p className="error m-0">{error.fname}</p>
                </div>
                <div className="col input-box">
                    <label htmlFor="lname">Last Name <span>*</span></label>
                    <input type="text" id='lname' name='lname' placeholder='Enter last name' value={account&&account.lname} onChange={handleEditChange}/>
                    <p className="error m-0">{error.lname}</p>
                </div>
                <div className="col input-box">
                    <label htmlFor="uname">Username <span>*</span></label>
                    <input type="text" id='uname' name='uname' placeholder='Enter username' value={account&&account.uname} onChange={handleEditChange}/>
                    <p className="error m-0">{error.uname}</p>
                </div>
                <div className="col input-box">
                    <label htmlFor="">Role <span>*</span></label>
                    <select name="role" id="role" >
                        <option value="" disabled selected>Select role</option>
                        {roles.length>0?roles.map(item=>{
                            return <option value={item.role_id} selected={account&&item.role_id==account.role}>{item.role_name}</option>
                        }):''}
                    </select>
                    <p className="error m-0">{error.role}</p>
                </div>
                <div className="col input-box">
                    <label htmlFor="" id='pass'>Password <span>*</span></label>
                    <input type="password" id='pass' placeholder='Enter new password' name='password' onChange={handleEditChange}/>
                    <p className="error m-0">{error.password}</p>
                </div>
                <div className="col input-box">
                    <label htmlFor="" id='confirm-pass'>Confirm Password <span>*</span></label>
                    <input type="password" id='confirm-pass' placeholder='Confirm new password' name='confirmPassword' onChange={handleEditChange}/>
                    <p className="error m-0" >{error.confirmPassword}</p>
                </div>
            </div>
            <div className="buttons">
                <button className="btn cancel-btn">
                    Cancel
                </button>
                <button className="btn create-btn" onClick={()=>editUserAccount(id)}>
                    Edit user
                </button>
            </div>
            
        </div>      
    </div>,
    document.getElementById('portal')
  )
}

export default EditUserModal
