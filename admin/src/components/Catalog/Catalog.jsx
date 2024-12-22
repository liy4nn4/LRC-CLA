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
import io from 'socket.io-client';
import Loading from '../Loading/Loading'
import { getAllFromStore, getAllUnsyncedFromStore, getBook, getBookPub, getCatalogDetailsOffline, getPub, getResource, getResourceAdviser, getResourceAuthors } from '../../indexedDb/getDataOffline'
import { markAsSynced } from '../../indexedDb/syncData'

// const socket = io('http://localhost:3001'); // Connect to the Socket.IO server

const Catalog = () => {
  const [openAuthor, setOpenAuthor] = useState(false)
  const [openPublisher, setOpenPublisher] = useState(false)
  const [catalog, setCatalog] = useState([])
  const [pagination,setPagination] = useState(0)
  const filterOptions = ['title','author','book','journal','newsletter','thesis']
  const [loading,setLoading] = useState(false)
  const [search, setSearch]=useState({
    searchKeyword: '',
    searchFilter: ''
  })
  
  useEffect(()=>{
    if(search.searchKeyword==''&&navigator.onLine){
      getCatalogOnline()
    }
  },[search.searchKeyword])

  useEffect(()=>{
    if(navigator.onLine){
      getCatalogOnline()
    }else{
      getCatalogOffline()
    }
  },[pagination])

/*-------------------DISPLAY RESOURCES IN CATALOG PAGE------------------- */
  //get resources details in mysql and display in catalog page
  const getCatalogOnline = async()=>{
    try {
      const response = await axios.get(`http://localhost:3001/catalogdetails/${pagination}`).then(res=>res.data);
      setCatalog(response)
    } catch (err) {
        console.log(err.message);
    }
  }

  //get resources details in indexeddb and display in catalog page
  const getCatalogOffline = async ()=>{
    await getCatalogDetailsOffline(setCatalog);
  }


/*------------HANDLE CHANGES------------------------------------*/
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

/*------------------------SYNC DATA------------------------------ */
const syncData2DB = async () => {
  setLoading(true)
  await syncResourcesOnline()
  setLoading(false)
  // await syncAuthorsOnline()
  // await syncResourceAuthorsOnline()
};

// Sync resources
const syncResourcesOnline = async () => {
  try {
    // Get all resources in IndexedDB
    const resources = await getAllFromStore('resources');
    console.log('Preparing resources for syncing: ', resources);

    for (const resource of resources) {
      try {
        const response = await axios.post('http://localhost:3001/sync/resources', resource);
        console.log(`Synced resource: ${resource.resource_id}`, response.data);

        // Retrieve resource_id from the server response
        const { resource_id } = response.data;
        console.log('resourceId: ', resource_id);

        // Get authors and sync them
        const authors = await getResourceAuthors(resource.resource_id);
        await syncAuthorsOnline(authors, resource_id);

        const resourceType = resource.type_id;
        switch(resourceType){
          case '1':
            // Get publisher and book for syncing
            const publisher = await getPub(resource.resource_id); 
            const book = await getResource('book',resource.resource_id);
            // Sync publisher and book
            const pubId = await syncPublisherOnline(publisher);
            // Sync the associated book after publisher is synced
            await syncBookOnline(book,resource_id,pubId);
            break;
          case '2':
          case '3':
            const jn = await getResource('journalnewsletter',resource.resource_id)
            await syncJournalNewsletterOnline(jn,resource_id)
            break;
          case '4':
            const adviser = await getResourceAdviser(resource.resource_id)
            //sync advisers
            await syncAdviserOnline(adviser,resource_id)
            break
        }
      } catch (error) {
        console.error(`Failed to sync resource: ${resource.resource_id}`, error.message);
      }
    }

    console.log('All resources processed.');
  } catch (error) {
    console.error('Error during data syncing:', error.message);
  }
};

//sync advisers
const syncAdviserOnline = async(adviser,resourceId)=>{
  try {
    console.log('syncing advisers')
    const response = await axios.post('http://localhost:3001/sync/adviser', { adviser, resourceId });
    console.log(`Synced adviser: ${adviser.adviser_id}`, response.data);
   
  } catch (error) {
    console.error('Error during authors syncing:', error.message);
  }
}

// Sync authors
const syncAuthorsOnline = async (authors, resourceId) => {
  try {
    for (const author of authors) {
      try {
        const response = await axios.post('http://localhost:3001/sync/authors', { author, resourceId });
        console.log(`Synced author: ${author.author_id}`, response.data);
      } catch (error) {
        console.error(`Failed to sync author: ${author.author_id}`, error.message);
      }
    }
    console.log('All authors processed.');
  } catch (error) {
    console.error('Error during authors syncing:', error.message);
  }
};

// Sync publisher
const syncPublisherOnline = async (publisher) => {
  try {
    const response = await axios.post('http://localhost:3001/sync/publisher', publisher);
    const { pub_id } = response.data;
    console.log('Publisher synced successfully with ID:', pub_id);
    return pub_id
  } catch (error) {
    console.error('Failed to sync publisher:', error.message);
  }
};

// Sync book
const syncBookOnline = async (book, resourceId, pubId) => {
  try {
    const formData = new FormData();

    // Append book fields to FormData
    Object.entries(book).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Append resourceId and pubId to FormData
    formData.append('resourceId', resourceId);
    formData.append('pubId', pubId);

    // Send the FormData to the backend
    const response = await axios.post('http://localhost:3001/sync/book', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log('Book synced successfully:', response.data);
  } catch (error) {
    console.error('Failed to sync book:', error.message);
  }
};

//sync journal and newsltter
const syncJournalNewsletterOnline = async (jn, resourceId) => {
  try {
    const formData = new FormData();
    // Append book fields to FormData
    Object.entries(jn).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Append resourceId to FormData
    formData.append('resourceId', resourceId);

    // Send the FormData to the backend
    const response = await axios.post('http://localhost:3001/sync/journalnewsletter', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log('Journal/Newsletter synced successfully:', response.data);
  } catch (error) {
    console.error('Failed to sync Journal/Newsletter:', error.message);
  }
};



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
          {/* sync*/}
          <div className="add-author-publisher">
              {/* sync to database */}
              <button className='btn sync-2-db' onClick={syncData2DB} disabled={!navigator.onLine} title='You need internet connection to sync to database.'>
                  Sync to database
              </button>
              {/* sync from database */}
              {/* <button className='btn sync-from-db' disabled={!navigator.onLine}>
                  Sync from database
              </button> */}
           </div>
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
                  {/* <th >ID</th> */}
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
                  {/* <td>{item.resource_id}</td> */}
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
      <Loading loading={loading}/>
    </div>
  )
}

export default Catalog
