import React, { useEffect, useRef, useState } from 'react'
import './Search.css'
import claLogo  from '../../assets/OPAC/icons/cla-logo.png'
import Book from '../Book/Book'
import Footer from '../Footer/Footer'
import { Link, useLocation } from 'react-router-dom'
import ResourceModal from '../ResourceModal/ResourceModal'
import axios from 'axios'
import Navbar from '../Navbar/Navbar'
import { gsap } from "gsap";

const Search = () => {
  const [isSearch, setIsSearch] = useState(true)
  const [open, setOpen] = useState(false)
  const [resources, setResources] = useState([])
  const [resourceType, setResourceType] = useState([])
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [topic, setTopic] = useState([])
  const [offset, setOffset] = useState(0)
  const [selectedFilters, setSelectedFilters] = useState({ type: [], department: [], topic: [] });
  const [sort, setSort] = useState('a-z')
  const [totalCount, setTotalCount] = useState(0)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search);
  const [keyword,setKeyword] = useState(queryParams.get('keyword'));
  const [renderKeyword, setRenderKeyword] = useState('')
  const [selectedResource, setSelectedResource] = useState(null);
  
  const abortControllerRef = useRef(null); // Use a ref for AbortController
  const filterRef = useRef(null); // Ref for the filter element

  useEffect(() => {
    getType();
    getDepartment();
    getTopic();
  }, []);

  useEffect(()=>{
    getResources()
  },[selectedFilters, sort])

  useEffect(() => {
    if (open) {
      // Animate filter opening
      gsap.to(filterRef.current, {
        x: 0,
        duration: 0.5,
        ease: "power3.out",
      });
    } else {
      // Animate filter closing
      gsap.to(filterRef.current, {
        x: "100%",
        duration: 0.5,
        ease: "power3.in",
      });
    }
    
  }, [open]);

  const getResources = async () => {
    // Set loading to true immediately when the request starts
    setLoading(true);
  
    // Abort the previous request if it's still ongoing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  
    // Create a new AbortController instance
    const controller = new AbortController();
    abortControllerRef.current = controller; // Store the new controller for future requests
  
    // Reset states
    setResources([]);
    setOffset(0);
    setTotalCount(0);
    setRenderKeyword(keyword);
  
    try {
      console.log('getting resources');
      const response = await axios.get('http://localhost:3001/resources', {
        params: {
          offset: 0,
          keyword,
          type: selectedFilters.type,
          department: selectedFilters.department,
          topic: selectedFilters.topic,
          sort
        },
        signal: controller.signal,  // Attach the signal to the request
      });
  
      if (response.data.results) {
        setResources(response.data.results);
        setTotalCount(response.data.total || 0);
        setLoading(false)
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted'); // Optional: log the abort
      } else {
        console.error('Error fetching resources:', error);
      }
    } 
  };
  


 /*-----------FUNCTION FOR LOADING MORE RESOURCES----------- */
  const loadMoreResources = async () => {
  setLoading(true);

  // Handle offset
  const newOffset = offset + 10;
  setOffset(newOffset);

  try {
    const response = await axios.get('http://localhost:3001/resources', {
      params: { 
        offset: newOffset, 
        keyword, 
        type: selectedFilters.type, 
        department: selectedFilters.department, 
        topic: selectedFilters.topic 
      }
    });

    if (response.data.results) {
      setResources((prev) => [...prev, ...response.data.results]);
      setTotalCount(response.data.total || 0);
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error loading more resources:', error);
    }
  } finally {
    setLoading(false);
  }
};



  /*-------------HANDLE CHANGES---------------- */
  const handleFilterChange = (filterCategory, value) => {
    setSelectedFilters((prevFilters) => {
      const updatedFilters = { 
        ...prevFilters, 
        [filterCategory]: prevFilters[filterCategory].includes(value)
          ? prevFilters[filterCategory].filter((item) => item !== value)
          : [...prevFilters[filterCategory], value]
      };
      return updatedFilters; // Ensure a new reference
    });
  };
    

  const handleChange = (e)=>{
    const {value}=e.target;
    setKeyword(value)
  }

  const handleSortChange = (e)=>{
    const value = e.target.value
    setSort(value)
  }

  /*----------INITIALIZE USESTATES----------- */
  // get type
  const getType = async()=>{
    try{
      const response = await axios.get('http://localhost:3001/type');
      setResourceType(response.data)
    }catch (error) {
      console.error('Error retrieving resource type:', error.message);
    }
  }

   // get department
   const getDepartment = async()=>{
    try{
      const response = await axios.get('http://localhost:3001/departments');
      setDepartments(response.data)
    }catch (error) {
      console.error('Error retrieving resource type:', error.message);
    }
  }

  // get topic
  const getTopic = async()=>{
    try{
      const response = await axios.get('http://localhost:3001/topic');
      setTopic(response.data)
    }catch (error) {
      console.error('Error retrieving resource type:', error.message);
    }
  }

  //display page from the top
  const handleNavigate = () => {
    window.scrollTo(0, 0);
  };

  console.log('resources length:' ,resources.length)
  console.log('total count:', totalCount)
  console.log('offset: ', offset)
  console.log('resources: ', resources)
  console.log('selectedFilter: ', selectedFilters)
  console.log('loading: ', loading)
  console.log('abortController: ', abortControllerRef)

  return (
    <div className='search-container'>
      {open?<div className="overlay"></div>:''}
      <Navbar/>
      {/* logo-search */}
      <div className="logo-search container">
        {/* <img src={claLogo} alt="CLA Logo" /> */}
        {/* search */}
        <div className="search">
          <input type="text" placeholder='Search by title or author' value={keyword} onChange={(e)=>handleChange(e)}/>
          <button className="search-btn" onClick={getResources}>
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      

      {/* path */}
      <div className=" path">
        <Link to='/' onClick={handleNavigate} className='home'><span>Go back</span></Link>
      </div>

      {/* search-results */}
      <div className="filter-results ">
        <div className="row filter-box">
          <div  ref={filterRef} className={open?"filter":"filter-close"}>
              <div className="close-box">
                <button onClick={()=>setOpen(false)}>
                  <i class="fa-solid fa-x"></i>
                </button>
              </div>
              {/* resource type */}
              <div className="filter-cat">
                <p>Resource Type</p>
                {resourceType.length>1?resourceType.map((item)=>(<div className="option">
                    <input
                      type="checkbox"
                      name={item.type_name}
                      id={item.type_name}
                      value={item.type_id}
                      onChange={() => {handleFilterChange('type', item.type_id)}}
                    />
                    <label htmlFor={item.type_name}>{item.type_name}</label>
                  </div>)):''}
              </div>

              {/* department */}
              <div className="filter-cat">
                <p>Department</p>
                    {departments.length>1?departments.map((item)=>(<div className="option">
                      <input
                        type="checkbox"
                        name={item.dept_name}
                        id={item.dept_name}
                        value={item.dept_id}
                        onChange={() => handleFilterChange('department', item.dept_id)}
                      />
                    <label htmlFor={item.dept_name}>{item.dept_name}</label>
                  </div>)):''}
                  {/* <button>VIEW MORE</button> */}
              </div>

              {/* topic */}
              <div className="filter-cat">
                <p>Topic</p>
                    {topic.length>1?topic.map((item)=>(<div className="option">
                      <input
                        type="checkbox"
                        name={item.topic_name}
                        id={item.topic_name}
                        value={item.topic_id}
                        onChange={() => handleFilterChange('topic', item.topic_id)}
                      />
                    <label htmlFor={item.topic_name}>{item.topic_name}</label>
                  </div>)):''}
                  {/* <button>VIEW MORE</button> */}
              </div>

              {/* author */}
              {/* <div className="filter-cat">
                <p>Author</p>
                  <div className="option">
                    <input type="checkbox" name="author_fname" id="author_fname" />
                    <label htmlFor="author_fname">First name</label>
                  </div>
                  <div className="option">
                    <input type="checkbox" name="author_lname" id="author_lname" />
                    <label htmlFor="author_lname">Last name</label>
                  </div>
              </div> */}
          </div>

          {/* results */}
          <div className={`results`}>
            {/* header */}
            <div className="header">
              <div className="title-subtitle">
                <p className='title'>{renderKeyword||"Results"}</p>
                <p className='subtitle'>{renderKeyword && totalCount!=0?`A total of ${totalCount} resource/s found for ${renderKeyword}`:'Showing all resources'}</p>
              </div>
              

              {/* sort */}
              <div className="sort">
                <button className='btn search-filter' onClick={()=>setOpen(true)}>
                  <i class="fa-solid fa-filter"></i>
                </button>
                <select name="" id="" onChange={handleSortChange}>
                  <option value="a-z" selected>Sort by Title (A-Z)</option>
                  <option value="z-a">Sort by Title (Z-A)</option>
                  <option value="newest">Sort by Year (Newest First)</option>
                  <option value="oldest">Sort by Year (Oldest First)</option>
                  
                </select>
              </div>
            </div>

            {/* resources */}
            <div className="resources">
            {Array.isArray(resources) && resources.length > 0 ? (
              resources.map((item, index) => (
                <Link to={`/resource?keyword=${keyword}&id=${item.resource_id}`}className="resource" onClick={handleNavigate} >
                  <Book item={item} isSearch={isSearch} />
                </Link>
              ))
            ) :  ''}
            </div>

            {/* load more */}
            
            <div className="load-more-box">
              {loading ? (
                <div className="spinner-container">
                  <div className="spinner-grow text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : resources.length > 0 ? (
                <button className="btn load-btn" onClick={loadMoreResources} disabled={totalCount === resources.length}>
                  LOAD MORE
                </button>
              ) : (
                <p className="no-results-message">No results found for "{keyword}". Please try a different search.</p>
              )}
            </div>
           
            {/* {Array.isArray(resources) && resources.length > 0 && !loading?<div className="load-more-box">
              <button className="btn load-btn" onClick={loadMoreResources} disabled={totalCount==resources.length}>LOAD MORE</button>
              </div>:resources.length==0 && !loading?'':<div className="spinner-container">
                  <div className="spinner-grow text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>} */}
            
          </div>


          </div>
        </div>

        <Footer/>
    </div>
  )
}

export default Search
