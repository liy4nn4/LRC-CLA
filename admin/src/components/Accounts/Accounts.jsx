import React, { useState } from 'react'
import './Accounts.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPlus, faUser, faPen, faUserSlash} from '@fortawesome/free-solid-svg-icons'
import CreateUserModal from '../CreateUserModal/CreateUserModal'
import EditUserModal from '../EditUserModal/EditUserModal'
import DeactivateModal from '../DeactivateModal/DeactivateModal'
import ActivateModal from '../ActivateModal/ActivateModal'

const Accounts = () => {
    const [openCreateUser, setOpenCreateUser] = useState(false)
    const [openEditUser, setEditCreateUser] = useState(false)
    const [openDeactivate, setOpenDeactivate] = useState(false)
    const [openActivate, setOpenActivate] = useState(false)

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
            <button className="btn edit-btn" onClick={()=>setEditCreateUser(true)}>
                <FontAwesomeIcon icon={faPen} />
                Edit user
            </button>
            {/* deactivate */}
            <button className="btn deac-btn" onClick={()=>setOpenDeactivate(true)}>
                <FontAwesomeIcon icon={faUserSlash}/>
                Activate user
            </button>
        </div>
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
            <button className="btn edit-btn" onClick={()=>setEditCreateUser(true)}>
                <FontAwesomeIcon icon={faPen} />
                Edit user
            </button>
            {/* deactivate */}
            <button className="btn deac-btn" onClick={()=>setOpenActivate(true)}>
                <FontAwesomeIcon icon={faUserSlash}/>
                Activate user
            </button>
        </div>
      </div>

      <CreateUserModal open={openCreateUser} close={()=>setOpenCreateUser(false)}/>
      <EditUserModal open={openEditUser} close={()=>setEditCreateUser(false)}/>
      <DeactivateModal open={openDeactivate} close={()=>setOpenDeactivate(false)}/>
      <ActivateModal open={openActivate} close={()=>setOpenActivate(false)}/>
    </div>
  )
}

export default Accounts
