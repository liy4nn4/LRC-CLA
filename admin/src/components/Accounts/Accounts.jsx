import React, { useEffect, useState } from 'react'
import './Accounts.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faPlus, faUser, faPen, faUserSlash} from '@fortawesome/free-solid-svg-icons'
import CreateUserModal from '../CreateUserModal/CreateUserModal'
import EditUserModal from '../EditUserModal/EditUserModal'
import DeactivateModal from '../DeactivateModal/DeactivateModal'
import ActivateModal from '../ActivateModal/ActivateModal'
import axios from 'axios'
import Loading from '../Loading/Loading'
import ResourceStatusModal from '../ResourceStatusModal/ResourceStatusModal';
import io from 'socket.io-client';
const socket = io('http://localhost:3001'); // Connect to the Socket.IO server

const Accounts = () => {
    const [openCreateUser, setOpenCreateUser] = useState(false)
    const [openEditUser, setEditUser] = useState(false)
    const [openDeactivate, setOpenDeactivate] = useState(false)
    const [openActivate, setOpenActivate] = useState(false)
    const [accounts, setAccounts] = useState([])
    const [account, setAccount] = useState({
      fname:'',
      lname:'',
      uname:'',
      role:'',
      password:'',
      confirmPassword:''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState({
      error:'error'
    })
    const [errorEdit, setErrorEdit] = useState({
      error:'error'
    })
    const [statusModal, setStatusModal] = useState(false)
    const [statusModalContent, setStatusModalContent] =useState({
            status:'',
            message:''
        })
    const [toEditAccount, setToEditAccount] = useState()
    const [selectedUname, setSelectedUname] = useState()
    const [selectedId, setSelectedId] = useState()


    useEffect(() => {
      userAccounts();
      
      // Listen for updates from the server (via socket)
      socket.on('userUpdated', (data) => {
          console.log('Received socket event: ', data);
          // Call userAccounts to refresh the list
          userAccounts();
      });

      return () => {
          socket.off('userUpdated'); // Cleanup on component unmount
      };
  }, []);

/*----------fetch user accounts------- */
    const userAccounts = async()=>{
      try{
        const response = await axios.get('http://localhost:3001/accounts')
        setAccounts(response.data)
      }catch(err){
        console.log('Cannot get accounts. An error occurred: ', err.message)
      }
    }
/*-------create user account----------------- */
    const createUserAccount = async () => {
      formValidation()
      if(Object.keys(error).length==0){
        setLoading(true);
        try {
          const response = await axios.post('http://localhost:3001/accounts/create', account);
          setLoading(false);
          
          if(response.data.status==409){
            setOpenCreateUser(false)
            setStatusModal(true)
            setStatusModalContent({
                status:'duplicated',
                message: response.data.message
            })
          }else if(response.data.status==201){
              setOpenCreateUser(false)
              setStatusModal(true)
              setStatusModalContent({
                  status:'success',
                  message: response.data.message
              })
          }
          
        } catch (err) {
            console.log('Cannot create account. An error occurred: ', err.message);
            setLoading(false); // Ensure loading is reset on error
        }
      }
  };

  /*-------------EDIT USER------------ */
  //fetch id to be edited
  const getToEdit = async(id)=>{
    try{
      const response = await axios.get(`http://localhost:3001/account/${id}`)
      setToEditAccount({
        id:response.data[0].staff_id,
        fname:response.data[0].staff_fname,
        lname:response.data[0].staff_lname,
        uname:response.data[0].staff_uname,
        role:response.data[0].role_id,
        password:'',
        confirmPassword:''
      })

    }catch(err){
      console.log('Cannot get account to be edited. An error occurred: ', err.message)
    }
  }
/*---------------edit user account------------------- */
const editUserAccount = async(id)=>{
  formValidationEdit()
      if(Object.keys(errorEdit).length==0){
        setLoading(true);
        try {
          console.log('editing account with id: ',id)
          const response = await axios.put(`http://localhost:3001/account`, toEditAccount)
          if(response.data.status==201){
              setEditUser(false)
              setStatusModal(true)
              setStatusModalContent({
                  status:'success',
                  message: response.data.message
              })
          }
        } catch (err) {
            console.log('Cannot edit account. An error occurred: ', err.message);
        } finally{
          setLoading(false);
        }
      }
}

/*-------deactivate user------------------ */
  const deactivateUser = async()=>{
    setLoading(true)
    try{
      const response = await axios.put(`http://localhost:3001/account/deactivate/${selectedId}`)
      if(response.data.status==201){
        setOpenDeactivate(false)
        setStatusModal(true)
        setStatusModalContent({
            status:'success',
            message: response.data.message
        })
      }
    }catch(err){
      console.log('Cannot deactivate user. An error occurred: ', err.message)
    }finally{
      setLoading(false);
    }
  }
/*-------------------Activate user------------------ */
const activateUser = async()=>{
  setLoading(true)
  try{
    const response = await axios.put(`http://localhost:3001/account/activate/${selectedId}`)
    if(response.data.status==201){
      setOpenActivate(false)
      setStatusModal(true)
      setStatusModalContent({
          status:'success',
          message: response.data.message
      })
    }
  }catch(err){
    console.log('Cannot deactivate user. An error occurred: ', err.message)
  }finally{
    setLoading(false);
  }
}
/*-------handle changes----- */
    //handle changes when creating user
  const handleChange = async(e)=>{
    const {name,value} = e.target
    setAccount((prevdata)=>({
        ...prevdata,
        [name]:value
    }))
  }

  // handle changes when editing user
  const handleEditChange = async(e)=>{
    const {name,value} = e.target
    setToEditAccount((prevdata)=>({
        ...prevdata,
        [name]:value
    }))
  }

  const handleEdit = (id)=>{
    setEditUser(true)
    getToEdit(id)
  }

  const handleDeac = (uname,id)=>{
    setOpenDeactivate(true)
    setSelectedUname(uname)
    setSelectedId(id)
  }

  const handleAct = (uname,id)=>{
    setOpenActivate(true)
    setSelectedUname(uname)
    setSelectedId(id)
  }


/*form validation for creating user account */
const formValidation = async () => {
  const err = {};
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

  if (account.fname === '') {
      err.fname = 'Enter first name';
  }
  if (account.lname === '') {
      err.lname = 'Enter last name';
  }
  if (account.uname === '') {
      err.uname = 'Enter username';
  }
  if (account.role === '') {
      err.role = 'Choose a role';
  }
  if (account.password === '') {
      err.password = 'Enter a password';
  } else if (!passwordRegex.test(account.password)) {
      err.password = 'Password must at least have one character, digit, lowercase, and uppercase letter';
  }
  if (account.confirmPassword === '') {
      err.confirmPassword = 'Confirm your password';
  } else if (account.password !== account.confirmPassword) {
      err.confirmPassword = 'Passwords do not match';
  }

  setError(err);
}

/*form validation for editing user account */
const formValidationEdit = async () => {
  const err = {};
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

  if (toEditAccount.fname === '') {
      err.fname = 'Enter first name';
  }
  if (toEditAccount.lname === '') {
      err.lname = 'Enter last name';
  }
  if (toEditAccount.uname === '') {
      err.uname = 'Enter username';
  }
  if (toEditAccount.role === '') {
      err.role = 'Choose a role';
  }
  if (toEditAccount.password === '') {
      err.password = 'Enter a password';
  } else if (!passwordRegex.test(toEditAccount.password)) {
      err.password = 'Password must at least have one character, digit, lowercase, and uppercase letter';
  }
  if (toEditAccount.confirmPassword === '') {
      err.confirmPassword = 'Confirm your password';
  } else if (toEditAccount.password !== toEditAccount.confirmPassword) {
      err.confirmPassword = 'Passwords do not match';
  }

  setErrorEdit(err);
}

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
      {accounts.length>0?accounts.map(item=>(
        <div className="user row">
        <div className="col-3 user-real-name">
            <FontAwesomeIcon icon={faUser} />
            {`${item.staff_fname} ${item.staff_lname}`}
        </div>
        <div className="col-3">{item.staff_uname}</div>
        <div className="col-3">{item.role_name}</div>
        <div className="col-3 actions">
            {/*  edit user */}
            <button className="btn edit-btn" onClick={()=>handleEdit(item.staff_id)}>
                <FontAwesomeIcon icon={faPen} />
                Edit user
            </button>
            {/* deactivate */}
            {item.staff_status=='active'?
            <button className="btn deac-acc-btn" onClick={()=>handleDeac(item.staff_uname, item.staff_id)}>
              <FontAwesomeIcon icon={faUserSlash}/>
              Deactivate user
            </button>
            :<button className="btn deac-acc-btn" onClick={()=>handleAct(item.staff_uname, item.staff_id)}>
              <FontAwesomeIcon icon={faUser}/>
              Activate user
              </button>
            }
            
        </div>
      </div>
      ))
      :''}
      <CreateUserModal open={openCreateUser} close={()=>{
        setOpenCreateUser(false);
        setAccount({
          fname:'',
          lname:'',
          uname:'',
          role:'',
          password:'',
          confirmPassword:''
        });
        setError({
          error:'error'
        });
        }} handleChange={handleChange} createUserAccount={()=>createUserAccount()} error={error} formValidation={()=>formValidation()}/>
      <EditUserModal 
        open={openEditUser} 
        close={()=>setEditUser(false)} 
        account={toEditAccount} 
        handleEditChange={handleEditChange} 
        error={errorEdit}
        editUserAccount={(id)=>editUserAccount(id)}
        />
      <DeactivateModal open={openDeactivate} close={()=>setOpenDeactivate(false)} uname={selectedUname} deactivateUser={()=>deactivateUser()}/>
      <ActivateModal open={openActivate} close={()=>setOpenActivate(false)} uname={selectedUname} activateUser={()=>activateUser()}/>
      <Loading loading={loading}/>
      <ResourceStatusModal open={statusModal} close={()=>setStatusModal(false)} content={statusModalContent} path={'/accounts'}/>
    </div>
  )
}

export default Accounts
