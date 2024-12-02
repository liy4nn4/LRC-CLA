import React, { useEffect, useState } from 'react'
import './Search.css'
import cover from '../../assets/OPAC/photos/sample-cover.jpeg'
import {Link, useNavigate, useParams} from 'react-router-dom'
import { useLocation } from 'react-router-dom'; //for retrieving query
import axios from 'axios'

const Search = () => {
  const location = useLocation();

  // Retrieve the query parameters
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q');
  const filter = searchParams.get('filter');

  //this is used to navigate to different pages
  //just put the page route
  const navigate = useNavigate();

  //this is where the search input is stored
  const [search,setSearch]=useState('');

  //filters
  const [searchFilter, setSearchFilter]= useState('all'); 
  const filterOptions = ['all','book','journal','newsletter','thesis','author']

  console.log(query)

  //store results from database
  const [results, setResults] = useState([]);

  const [image,setImage]=useState(null)

  useEffect(()=>{
    setSearch(query)
    getResource()
    getImage()
  },[query])

  const getResource = async()=>{
    try{
      const response = await axios.get(`http://localhost:3001/search?q=${query}`);
      console.log(response.data);
      setResults(response.data)
      
    }catch(err){
      console.log('An error occurred: ', err.message)
    }
  }

  //for handling filter
  const handleFilter = (value)=>{
    setSearchFilter(value)
  }
  
  const handleCover = (cover)=>{
   console.log(cover.data)
    // return URL.createObjectURL(new Blob([Buffer.from(cover.data)]));
    if (cover && cover.data) {
      const blob = new Blob([new Uint8Array(cover.data)], { type: 'image/jpeg' });
      return URL.createObjectURL(blob);
    }
    return null; // Handle case where there is no cover
  }

  const getImage = async()=>{
    const response = await axios.get('http://localhost:3001/view',{
      responseType:'blob'
    })
    const url = URL.createObjectURL(response.data)
    setImage(url)

    console.log(response.data)
  }

  //handling search 
  const handleSearch = (searchInput,searchFilter)=>{
    navigate(`/results?q=${searchInput}&filter=${searchFilter}`)
  }


  console.log(search)

  return (
    <div className='search-container'>
      {/* header cover */}
      <div className="search-header-cover">
        <div className="search-bar">
            {/* filter button */}
            <button className="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <span>{searchFilter}</span>
            </button>
            <ul className="dropdown-menu">
              {filterOptions.map(item=>(
                  <li onClick={()=>handleFilter(item)}><a className="dropdown-item" href="#" >{item}</a></li>
              ))}
            </ul>
            {/* search bar */}
            <input type="text" name="searchInput" id="searchInput" className='search' placeholder='Search for resources' value={search} onChange={(e)=>setSearch(e.target.value)}/>
            {/* search button */}
            <button className='search-button' onClick={()=>handleSearch(search,'all')}>
              <i class="fa-solid fa-magnifying-glass"></i>
              <span className='button-text'>Search</span> 
            </button>
        </div>
      </div>

      {/* results section */}
      {results.length!=0?<section className="search-results-box">
        <div className="search-results-filter">
          {/* search results total number */}
          <p className='search-results-total m-0'>Search Results (<span>{results?results.length:''}</span>)</p>
          <div className='search-sort'>
            {/* filter button */}
            <div class="dropdown">
              <button class="btn results-filter-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <span>Relevance</span>
                <i class="fa-solid fa-caret-down"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Action</a></li>
                <li><a class="dropdown-item" href="#">Another action</a></li>
                <li><a class="dropdown-item" href="#">Something else here</a></li>
              </ul>
            </div>
          </div>
        </div>
        </section>:
        <div class="spinner-grow text-danger container" role="status">
          <span class="sr-only">Loading...</span>
        </div>}
      

      {/* book results */}
      <section className="book-results">
        <div className="row">
          
          
          {/* book */}
          {results.length!=0?results.map(item=>{
           return <div className="card search-book col-md-2"><Link to={`/resource/${item.id}?q=${query}&filter=${filter}`} className='book-link'>
                    <img className="card-img-top search-book-cover" src={handleCover(item.cover)} alt="Card image cap"/>
                    <div className="card-body">
                      <h5 className="card-title">{item.title}</h5>
                      <p className="card-text">by {item.author}</p>
                    </div></Link>
                  </div>
          }):''}
          
        </div>
      </section>

      {/* results pagination */}
      {results.length!=0?<section className="search-more">
        <button className='load-more'>Load more</button>
      </section>:''}
      
    
    </div>
  )
}

export default Search
