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
import { clearObjectStore, deleteResourceFromIndexedDB, markAsSynced } from '../../indexedDb/syncData'
import ResourceStatusModal from '../ResourceStatusModal/ResourceStatusModal'


const socket = io('http://localhost:3001'); // Connect to the Socket.IO server

const Catalog = () => {
  const [openAuthor, setOpenAuthor] = useState(false)
  const [openPublisher, setOpenPublisher] = useState(false)
  const [catalog, setCatalog] = useState([])
  // Pagination state
  const [pagination, setPagination] = useState(5); // Items per page
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(0); // Total pages
  const filterOptions = ['title','author','book','journal','newsletter','thesis']
  const [loading,setLoading] = useState(false)
  const [search, setSearch]=useState({
    searchKeyword: '',
    searchFilter: ''
  })
  const [statusModal, setStatusModal] = useState(false)
  const [statusModalContent, setStatusModalContent] =useState({
    status:'',
    message:''
  })
  const [isOnline, setIsOnline] = useState(true)

  
  useEffect(() => {
    const fetchCatalog = async () => {
      if (search.searchKeyword === '' && navigator.onLine) {
        await getCatalogOnline();
      }
    };
    fetchCatalog();
  }, [search.searchKeyword]);
  

  useEffect(() => {
    const fetchData = async () => {
      if (navigator.onLine) {
        setIsOnline(true);
        await getCatalogOnline();
      } else {
        setIsOnline(false);
        await getCatalogOffline();
      }
    };

    fetchData();

    const handleConnectionChange = () => {
      setIsOnline(navigator.onLine);
      fetchData();
    };

    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    return () => {
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleConnectionChange);
    };
  }, [currentPage, pagination]);


/*-------------------DISPLAY RESOURCES IN CATALOG PAGE------------------- */
const getCatalogOnline = async () => {
  try {
      setLoading(true); // Show loading spinner
      const offset = (currentPage - 1) * pagination;

      const response = await axios.get(`http://localhost:3001/catalogdetails`, {
          params: { limit: pagination, offset }
      });

      if (response.data.records) {
          setCatalog(response.data.records);
          setTotalPages(Math.ceil(response.data.total / pagination)); // Calculate total pages
      } else {
          setCatalog([]);
          setTotalPages(0);
      }
  } catch (err) {
      console.error('Error fetching catalog data:', err.message);
  } finally {
      setLoading(false); // Hide loading spinner
  }
};

//get catalog offline
const getCatalogOffline = async () => {
  const data = await getCatalogDetailsOffline();
  setCatalog(data);
  setTotalPages(Math.ceil(data.length / pagination));
};

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
        // Sync the resource
        const response = await axios.post('http://localhost:3001/sync/resources', resource);
        if (response.data.status === 409) {
          alert(response.data.message);
          continue; // Skip the resource if there's a conflict
        }
        console.log(`Synced resource: ${resource.resource_id}`, response.data);

        // Retrieve resource_id from the server response
        const { resource_id: serverResourceId } = response.data;

        // Sync related data
        const authors = await getResourceAuthors(resource.resource_id);
        await syncAuthorsOnline(authors, serverResourceId);

        const resourceType = resource.type_id;
        switch (resourceType) {
          case '1': // Book
            const publisher = await getPub(resource.resource_id); 
            const book = await getResource('book', resource.resource_id);
            const pubId = await syncPublisherOnline(publisher);
            await syncBookOnline(book, serverResourceId, pubId);
            break;
          case '2': // Journal
          case '3': // Newsletter
            const jn = await getResource('journalnewsletter', resource.resource_id);
            await syncJournalNewsletterOnline(jn, serverResourceId);
            break;
          case '4': // Thesis
            const adviser = await getResourceAdviser(resource.resource_id);
            await syncAdviserOnline(adviser, serverResourceId);
            break;
          default:
            console.warn(`Unhandled resource type: ${resourceType}`);
        }

        //  Delete resource from IndexedDB after successful sync
        await deleteResourceFromIndexedDB(resource.resource_id);
        console.log(`Resource ${resource.resource_id} deleted from IndexedDB.`);
      } catch (error) {
        setStatusModal(true);
        setStatusModalContent({
          status: 'error',
          message: `Failed to sync resource with title "${resource.resource_title}".`,
        });
        console.error(`Failed to sync resource: ${resource.resource_id}`, error.message);
      }
    }

    //delete all data from object stores used in cataloging
    //clear author object store
    await clearObjectStore('author')
    //clear resoruceauthors
    await clearObjectStore('resourceauthors')
    //clear book
    await clearObjectStore('book')
    //clear publisher
    await clearObjectStore('publisher')
    //clear adviser
    await clearObjectStore('adviser')
    //clear thesis
    await clearObjectStore('thesis')
    //clear journalnewsletter
    await clearObjectStore('journalnewsletter')

    setStatusModal(true);
    setStatusModalContent({
      status: 'success',
      message: 'All resources processed.',
    });
    console.log('All resources processed.');
  } catch (error) {
    setStatusModal(true);
    setStatusModalContent({
      status: 'error',
      message: 'Error during data syncing. Please try again.',
    });
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

 /*------------HANDLE PAGINATION---------------- */
 const handlePreviousButton = () => {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
  }
};

const handleNextButton = () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
  }
};
  console.log(catalog)        

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
              <button
              className='btn sync-2-db'
              onClick={syncData2DB}
              disabled={!navigator.onLine}
              title='You need internet connection to sync to database.'
            >
              Sync to database
            </button>
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
              {catalog.length > 0 ? (
                catalog.map((item, key) => (
                  <tr key={key}>
                    <td>{item.resource_title}</td>
                    <td>{item.type_name}</td>
                    <td>{item.author_names}</td>
                    <td>{item.dept_shelf_no}</td>
                    <td>{item.resource_quantity}</td>
                    <td>
                      <Link to={`/view-item/${item.resource_id}`}>
                        <button className="btn cat-view">
                          <i className="fa-solid fa-bars"></i>
                          View
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No records available</td>
                </tr>
              )}
            </tbody>

            </table> 
            {/* pagination */}
            <nav aria-label="Page navigation example">
              <div class="pagination">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className='buttons'>
                  <button
                    className="btn"
                    onClick={handlePreviousButton}
                    disabled={currentPage === 1}
                    aria-label="Go to previous page"
                  >
                    Previous
                  </button>
                  <button
                    className='btn'
                    onClick={handleNextButton}
                    disabled={currentPage === totalPages}
                    aria-label="Go to next page"
                  >
                    Next
                  </button>
                </div>
                
              </div>
            </nav>
        
        

      <AuthorModal open={openAuthor} close={()=>setOpenAuthor(!openAuthor)}/>
      <PublisherModal open={openPublisher} close={()=>setOpenPublisher(!openPublisher)}/>
      <Loading loading={loading}/>
      <ResourceStatusModal open={statusModal} close={()=>setStatusModal(false)} content={statusModalContent} isOnline={isOnline}/>
    </div>
  )
}

export default Catalog
