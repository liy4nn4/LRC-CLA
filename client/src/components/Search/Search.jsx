import React, { useEffect, useState } from 'react'
import './Search.css'
import claLogo  from '../../assets/OPAC/icons/cla-logo.png'
import Book from '../Book/Book'
import Footer from '../Footer/Footer'
import { Link, useLocation } from 'react-router-dom'
import ResourceModal from '../ResourceModal/ResourceModal'
import axios from 'axios'
import Navbar from '../Navbar/Navbar'

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
  const [totalCount, setTotalCount] = useState(0)
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search);
  const [keyword,setKeyword] = useState(queryParams.get('keyword'));
  const [renderKeyword, setRenderKeyword] = useState('')
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    getType();
    getDepartment();
    getTopic();
    getResources();
    setRenderKeyword(keyword)
  }, [offset]);

  useEffect(() => {
    getResources();
  }, [selectedFilters]);

  const getResources = async () => {
    console.log('Getting resources...');
    setRenderKeyword(keyword);
    setResources({})

    try {
      // Set loading state
      setLoading(true);
  
      // Serialize filters to a JSON string
      const filter = JSON.stringify({
        type: selectedFilters.type || [],
        department: selectedFilters.department || [],
        topic: selectedFilters.topic || [],
      });
  
      const response = await axios.get('http://localhost:3001/resources', {
        params: { offset, keyword, filter },
      });
  
      console.log(response.data);
  
      if (Array.isArray(response.data.results)) {
        if (offset === 0) {
          // Replace resources for a new search
          setResources(response.data.results);
        } else {
          // Append resources for pagination
          setResources((prev) => [...prev, ...response.data.results]);
        }
  
        if (response.data.total) {
          setTotalCount(response.data.total); // Update total count
        }
      } else {
        console.error('Unexpected response format:', response.data);
      }
    } catch (error) {
      console.error('Error retrieving resources:', error.message);
    } finally {
      // Clear loading state
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
    

  const handleChange = async(e)=>{
    const {value}=e.target;
    setKeyword(value)
  }
  /*-----------FUNCTION FOR LOADING MORE RESOURCES----------- */
  const loadMoreResources = () => setOffset(prevOffset => prevOffset + 8);

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

  console.log(resources)

  const handleResourceClick = (resource) => {
    setSelectedResource(resource); // Store the selected book
    setOpen(true); // Open the modal
  };


  return (
    <div className='search-container'>
      <Navbar/>
      {/* logo-search */}
      <div className="logo-search container">
        {/* <img src={claLogo} alt="CLA Logo" /> */}
        {/* search */}
        <div className="search">
          <input type="text" placeholder='Search for resources by title or author' value={keyword} onChange={(e)=>handleChange(e)}/>
          <button className="search-btn" onClick={getResources}>
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      

      {/* path */}
      <div className=" path">
        <Link to='/' className='home'><span>Go back</span></Link>
      </div>

      {/* search-results */}
      <div className="filter-results ">
        <div className="row filter-box">
          <div className="filter col-2">
              {/* resource type */}
              <div className="filter-cat">
                <p>Resource Type</p>
                {resourceType.length>1?resourceType.map((item)=>(<div className="option">
                    <input
                      type="checkbox"
                      name={item.type_name}
                      id={item.type_name}
                      value={item.type_id}
                      onChange={() => handleFilterChange('type', item.type_id)}
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
          <div className="results col">
            {/* header */}
            <div className="header">
              <div className="title-subtitle">
                <p className='title'>{renderKeyword||"Results"}</p>
                <p className='subtitle'>{renderKeyword?`Showing all results for ${renderKeyword}`:'Showing all resources'}</p>
              </div>
              

              {/* sort */}
              <div className="sort">
                <p>Sort by:</p>
                <select name="" id="">
                  <option value="">Newest</option>
                </select>
              </div>
            </div>

            {/* resources */}
            <div className="resources">
            {Array.isArray(resources) && resources.length > 0 && !loading ? (
              resources.map((item, index) => (
                <button key={index} className="resource" onClick={() => handleResourceClick(item)}>
                  <Book item={item} isSearch={isSearch} />
                </button>
              ))
            ) : loading ? '' : (
              <p className="mt-5 no-resources">No resources available.</p>
            )}
            </div>

            {/* load more */}
            {Array.isArray(resources) && resources.length > 0 && !loading?<div className="load-more-box">
              <button className="btn load-btn" onClick={loadMoreResources} disabled={totalCount==resources.length}>LOAD MORE</button>
              </div>:resources.length==0 && !loading?'':<div className="spinner-container">
                  <div className="spinner-grow text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>}
            
          </div>


          </div>
        </div>

        <Footer/>
        <ResourceModal open={open} close={() => setOpen(false)} resource={selectedResource} />

    </div>
  )
}

export default Search
