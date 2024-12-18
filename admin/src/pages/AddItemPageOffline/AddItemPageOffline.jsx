import React from 'react'
import './AddItemPageOffline.css'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'
import AddItemOffline from '../../components/AddItem/AddItemOffline'

const AddItemPageOffline = () => {
  console.log('AddItemPage mounted');
  return (
    <div className='additempage'>
      <div>
       <AdminNavbar/>
      </div> 
      <div>
        <AdminTopNavbar/>
        <AddItemOffline/>
      </div>
    </div>
  )
}

export default AddItemPageOffline
