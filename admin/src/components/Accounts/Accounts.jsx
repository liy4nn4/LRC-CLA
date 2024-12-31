import React, { useState } from 'react'
import './Accounts.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPlus, faUser, faPen, faUserSlash} from '@fortawesome/free-solid-svg-icons'
import CreateUserModal from '../CreateUserModal/CreateUserModal'

const Accounts = () => {
    const [openCreateUser, setOpenCreateUser] = useState(false)
  return (
    <div className='accounts-container'>
      <h1>User accounts</h1>

      {/* search and add */}
      <div className="search-add">
        {/* search */}
        <div className="search">
            <input type="text" placeholder='Search'/>   
            <button className="btn">Search</button>
        </div>
        {/* add */}
        <button className="btn create-btn" onClick={()=>setOpenCreateUser(true)}>
            <FontAwesomeIcon icon={faPlus} />
            Create account
        </button>
      </div>

      {/* header */}
      <div className="header row">
        <div className="col-3">User</div>
        <div className="col-3">Username</div>
        <div className="col-3">Role</div>
        <div className="col-3">Action</div>
      </div>

      {/* user */}
      <div className="user row">
        <div className="col-3 user-real-name">
            <FontAwesomeIcon icon={faUser} />
            Lance Bernal
        </div>
        <div className="col-3">admin1</div>
        <div className="col-3">Administrator</div>
        <div className="col-3 actions">
            {/*  edit user */}
            <button className="btn edit-btn">
                <FontAwesomeIcon icon={faPen} />
                Edit user
            </button>
            {/* deactivate */}
            <button className="btn deac-btn">
                <FontAwesomeIcon icon={faUserSlash} />
                Deactivate user
            </button>
        </div>
      </div>
      <CreateUserModal open={openCreateUser} close={()=>setOpenCreateUser(false)}/>
    </div>
  )
}

export default Accounts
