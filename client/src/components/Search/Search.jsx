import React, { useEffect, useState } from 'react'
import './Search.css'
import cover from '../../assets/OPAC/photos/sample-cover.jpeg'
import {Link, useNavigate, useParams} from 'react-router-dom'
const Search = () => {
  //get params in URL
  const {searchInput} = useParams();
  //this is used to navigate to different pages
  //just put the page route
  const navigate = useNavigate();
  //this is where the search input is stored
  const [search,setSearch]=useState('');

  useEffect(()=>{
    setSearch(searchInput);
  },[])
  

  //this is executed whenever enter key in keyboard is pressed
  const handleEnter = (e)=>{
    if(e.key === "Enter"){
      navigate(`search/${searchInput}`);
    }
  }

  console.log(search)

  return (
    <div className='search-container'>
      {/* header cover */}
      <div className="search-header-cover">
      <div className="search-bar">
          {/* filter button */}
          <div class="dropdown">
            <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <span>Filter
              </span>
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Action</a></li>
              <li><a class="dropdown-item" href="#">Another action</a></li>
              <li><a class="dropdown-item" href="#">Something else here</a></li>
            </ul>
          </div>
          {/* search bar */}
          <input type="text" name="searchInput" id="searchInput" className='search' placeholder='Search for resources'  onKeyDown={handleEnter} value={search} onChange={(e)=>setSearch(e.target.value)}/>
          <button className='search-button'>
          <i class="fa-solid fa-magnifying-glass"></i>
          <span className='button-text'>Search</span> 
          </button>
        </div>
      </div>

      {/* results section */}
      <section className="search-results-box">
        <div className="search-results-filter">
          {/* search results total number */}
          <p className='search-results-total m-0'>Search Results (<span>1</span>)</p>
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
      </section>

      {/* book results */}
      <section className="book-results">
        <div className="row">
          {/* book */}
          <div className="card col-md-2">
                <img className="card-img-top" src={cover} alt="Card image cap"/>
                <div className="card-body">
                  <h5 className="card-title">Card title</h5>
                  <p className="card-text">by Author</p>
                </div>
          </div>
          {/* book */}
          <div className="card col-md-2">
              <img className="card-img-top" src={cover} alt="Card image cap"/>
              <div className="card-body">
                <h5 className="card-title">Card title</h5>
                <p className="card-text">by Author</p>
              </div>
          </div>
          {/* book */}
          <div className="card col-md-2">
              <img className="card-img-top" src={cover} alt="Card image cap"/>
              <div className="card-body">
                <h5 className="card-title">Card title</h5>
                <p className="card-text">by Author</p>
              </div>
          </div>
          {/* book */}
          <div className="card col-md-2">
              <img className="card-img-top" src={cover} alt="Card image cap"/>
              <div className="card-body">
                <h5 className="card-title">Card title</h5>
                <p className="card-text">by Author</p>
              </div>
          </div>
          {/* book */}
          <div className="card col-md-2">
              <img className="card-img-top" src={cover} alt="Card image cap"/>
              <div className="card-body">
                <h5 className="card-title">Card title</h5>
                <p className="card-text">by Author</p>
              </div>
          </div>
          {/* book */}
          <div className="card col-md-2">
              <img className="card-img-top" src={cover} alt="Card image cap"/>
              <div className="card-body">
                <h5 className="card-title">Card title</h5>
                <p className="card-text">by Author</p>
              </div>
          </div>
        </div>
      </section>

      {/* results pagination */}
      <section className="search-more">
        <button className='load-more'>Load more</button>
      </section>
    
    </div>
  )
}

export default Search
