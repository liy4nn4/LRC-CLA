import React, { useState } from 'react'
import './Search.css'
import claLogo  from '../../assets/OPAC/icons/cla-logo.png'
import Book from '../Book/Book'
import Footer from '../Footer/Footer'
import { Link } from 'react-router-dom'
import ResourceModal from '../ResourceModal/ResourceModal'


const Search = () => {
  const [isSearch, setIsSearch] = useState(true)
  const [open, setOpen] = useState(true)

  return (
    <div className='search-container'>
      {/* logo-search */}
      <div className="logo-search container">
        <img src={claLogo} alt="CLA Logo" />
        {/* search */}
        <div className="search">
          <input type="text" placeholder='Search for resources'/>
          <button className="search-btn">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>

      {/* path */}
      <div className="container path">
        <p><Link to='/' className='home'>Home</Link> / <span>Search</span></p>
      </div>

      {/* search-results */}
      <div className="filter-results container">
        <div className="row filter-box">
          <div className="filter col-2">
              {/* resource type */}
              <div className="filter-cat">
                <p>Resource Type</p>
                  <div className="option">
                    <input type="checkbox" name="book" id="book" />
                    <label htmlFor="book">Book</label>
                  </div>
              </div>

              {/* department */}
              <div className="filter-cat">
                <p>Department</p>
                  <div className="option">
                    <input type="checkbox" name="book" id="book" />
                    <label htmlFor="book">Book</label>
                  </div>
                  <button>VIEW MORE</button>
              </div>

              {/* topic */}
              <div className="filter-cat">
                <p>Topic</p>
                  <div className="option">
                    <input type="checkbox" name="book" id="book" />
                    <label htmlFor="book">Book</label>
                  </div>
                  <button>VIEW MORE</button>
              </div>

              {/* author */}
              <div className="filter-cat">
                <p>Author</p>
                  <div className="option">
                    <input type="checkbox" name="author_fname" id="author_fname" />
                    <label htmlFor="author_fname">First name</label>
                  </div>
                  <div className="option">
                    <input type="checkbox" name="author_lname" id="author_lname" />
                    <label htmlFor="author_lname">Last name</label>
                  </div>
              </div>
          </div>

          {/* results */}
          <div className="results col">
            {/* header */}
            <div className="header">
              <div className="title-subtitle">
                <p className='title'>Restaurant</p>
                <p className='subtitle'>Showing results for Restaurant</p>
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
              <button className='resource' onClick={()=>setOpen(true)}>
                <Book isSearch={isSearch}/>
              </button>              
            </div>

            </div>


          </div>
        </div>

        <Footer/>
        <ResourceModal open={open} close={()=>setOpen(false)}/>
    </div>
  )
}

export default Search
