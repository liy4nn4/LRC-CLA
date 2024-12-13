import React, { useEffect, useState } from 'react'
import './Catalog.css'
import addItem from '../../assets/Management System/inventory/add-item.svg'
import scanItem from '../../assets/Management System/inventory/scan-item.svg'
import search from '../../assets/Management System/logbook/search.svg'
import exportIcon from '../../assets/Management System/logbook/export.svg'
import dropdown from '../../assets/Management System/inventory/arrow-dropdown.svg'
import { Link } from 'react-router-dom'
import AuthorModal from '../AuthorModal/AuthorModal'
import PublisherModal from '../PublisherModal/PublisherModal'
import axios from 'axios'
import { getResourcesCatalog } from '../../indexedDb'


const Catalog = () => {
  const [openAuthor, setOpenAuthor] = useState(false)
  const [openPublisher, setOpenPublisher] = useState(false)
  const [catalog, setCatalog] = useState([])
  const [pagination,setPagination] = useState(0)
  const filterOptions = ['title','author']
  const [search, setSearch]=useState({
    searchKeyword: '',
    searchFilter: ''
  })
  
  useEffect(()=>{
    console.log('get catalog')
    getCatalog()
  },[pagination])

  useEffect(()=>{
    if(search.searchKeyword==''){
      getCatalog()
    }
  },[search.searchKeyword])

  const getCatalog = async()=>{
    try {
      const response = await axios.get(`http://localhost:3001/catalogdetails/${pagination}`).then(res=>res.data);
      setCatalog(response)
    } catch (err) {
        console.log(err.message);
    }
  }

  const handleSearch = async ()=>{
    try{
      const response = await axios.get(`http://localhost:3001/catalog/search`, { params: search });
      console.log(response.data)
      setCatalog(response.data)
    }catch(err){
      console.log('Cannot search resource. An error occurred: ', err.message)
    }
  }

  const handleSelectedFilter = (filter)=>{
    setSearch((prevdata)=>({
      ...prevdata,
      searchFilter: filter
    }))
  }

  const handleChange = (e)=>{
    const {value} = e.target
    setSearch((prevdata)=>({
      ...prevdata,
      searchKeyword: value
    }))
  }


  console.log(search)

  return (
    <div className='cat-container'>
      <h1>Catalog</h1>

        <div className='cat-buttons'>
          {/* add and scan item buttons */}
          <div className="add-scan-item">
              {/* add item */}
              <Link to='/add-item'>
                <button type="button" class="btn cat-add-item">
                  <i class="fa-solid fa-pen"></i>
                  Add item
                </button>
              </Link>
          </div>
          {/* add author and publisher*/}
          {/* <div className="add-author-publisher"> */}
              {/* add author */}

              {/* <button className='btn cat-add-author' onClick={()=>setOpenAuthor(!openAuthor)}>
                <i class="fa-solid fa-plus"></i>
                  Add Author
              </button> */}
              {/* add publisher */}
              {/* <button className='btn cat-add-pub' onClick={()=>setOpenPublisher(!openPublisher)}>
                <i class="fa-solid fa-plus" ></i>
                  Add Publisher
              </button> */}
          {/* </div> */}
        </div>
        
        {/* search,filter,export */}
        <div className="search-filter-export">
            {/* search-filter */}
            <div className="search-filter">
                <form class="d-flex " role="search">
                  <input class="form-control me-2 cat-search-bar" type="search" placeholder="Search" aria-label="Search" onChange={handleChange}/>
                  <button class="btn cat-search-button" type="submit" onClick={handleSearch}>Search</button>
                </form>
                <div class="dropdown">
                  <button class="btn cat-dropdown dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    {search.searchFilter==''?'Search by':search.searchFilter}
                  </button>
                  <ul class="dropdown-menu">
                    {filterOptions.map(item=>{
                      return <li><a class="dropdown-item" href="#" onClick={()=>handleSelectedFilter(item)}>{item}</a></li>
                    })}
                  </ul>
                </div>

            </div>

        </div>
            <table className="cat-table">
              <thead>
                <tr>
                  <th >ID</th>
                  <th >Title</th>
                  <th >Type</th>
                  <th >Authors</th>
                  <th >Shelf No.</th>
                  <th >Copies</th>
                  <th ></th>
                </tr>
              </thead>
              <tbody>
                {catalog?catalog.length>0?catalog.map((item,key)=>(
                <tr key={key}>
                  <td>{item.resource_id}</td>
                  <td>{item.resource_title}</td>
                  <td>{item.type_name}</td>
                  <td>{item.author_names>1?
                    <ul>
                      {item.author_names.map(a=>(
                        <li>{a}</li>
                      ))}
                    </ul>    
                  :<ul><li>{item.author_names}</li></ul>}</td>
                  <td>{item.dept_shelf_no}</td>
                  <td>{item.resource_quantity}</td>
                  <td>
                    <Link to={`/view-item/${item.resource_id}`}>
                      <button className='btn cat-view'>
                        <i class="fa-solid fa-bars"></i>
                        View
                      </button>
                    </Link>
                  </td>
                </tr> )):
                  <tr>
                      <td colSpan="7">No records available</td> 
                  </tr>:''}
              </tbody>
            </table> 
            {/* pagination */}
            <nav aria-label="Page navigation example">
              <div class="pagination justify-content-end">
                <button className={pagination===0?'btn disabled':'btn enabled'} onClick={()=>{
                  pagination!=0?setPagination(pagination-5):setPagination(0)}} disabled={pagination===0}>
                  Previous
                </button>
                <button className={Object.keys(catalog).length!=5?'btn disabled':'btn enabled'} onClick={()=>setPagination(pagination+5)} disabled={Object.keys(catalog).length!=5}>
                  Next
                </button>
              </div>
            </nav>
        
        

      <AuthorModal open={openAuthor} close={()=>setOpenAuthor(!openAuthor)}/>
      <PublisherModal open={openPublisher} close={()=>setOpenPublisher(!openPublisher)}/>
    </div>
  )
}

export default Catalog
