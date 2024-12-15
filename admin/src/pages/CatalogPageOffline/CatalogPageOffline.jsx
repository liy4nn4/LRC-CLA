import React, { useEffect } from 'react'
import AdminNavbar from '../../components/AdminNavbar/AdminNavbar'
import AdminTopNavbar from '../../components/AdminTopNavbar/AdminTopNavbar'

import './CatalogPageOffline.css'
import Catalog from '../../components/Catalog/Catalog'
import CatalogOffline from '../../components/Catalog/CatalogOffline'

const CatalogPageOffline = () => {
  useEffect(()=>{
    console.log("Main catalogpage mounted")
  },[])
  return (
    <div className='catalogpage'>
      <div>
       <AdminNavbar/>
      </div> 
      <div>
        <AdminTopNavbar/>
        <CatalogOffline/>
      </div>
    </div>
  )
}

export default CatalogPageOffline
