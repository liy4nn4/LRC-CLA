import React from 'react'
import './Home.css'
import Navbar from '../Navbar/Navbar'
import book1 from '../../assets/OPAC/photos/book1.jpg'
import book2 from '../../assets/OPAC/photos/book2.jpg'
import Book from '../Book/Book'

const Home = () => {
  return (
    <div className='client-home-container'>
      <Navbar/>

      {/* hero section */}
      <section className='hero'>
        <div className="row">
          {/* images */}
          <div className="col images">
              {/* circle */}
              <div className="circle">
                <img src={book1} alt="Book 1" className='book1'/>
                <img src={book2} alt="Book 2" className='book2'/>
              </div>
          </div>

          {/* content */}
          <div className="col content">
            <h2>Welcome to <span>College of Liberal Arts'</span></h2>
            <h2>Learning Resources Center</h2>
            <p>Want to find academic resources for your next project? Our online catalog has been designed to make your search simple and intuitive.</p>
            <button className="btn">
              Start exploring now
            </button>
          </div>
        </div>
      </section>

      {/* featured books and journal */}
      <section className='books-jn'>
        {/* featured books */}
        <div className="featured-books">
          <div className="header mb-3">
            <h4>Featured Books</h4>
            <button className="btn">See all</button>
          </div>
          <div className="books">
            <Book/>
          </div>
        </div>

        {/* journal */}
        <div className="journals-newsletters">
          <div className="header mb-3">
            <h4>Journals and Newsletters</h4>
            <button className="btn">See all</button>
          </div>
          <div className="journal-newsletter">
            <Book/>
          </div>
        </div>
      </section>

    </div>
  )
}

export default Home
