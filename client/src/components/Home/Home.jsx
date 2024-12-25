import React from 'react'
import './Home.css'
import Navbar from '../Navbar/Navbar'
import book1 from '../../assets/OPAC/photos/book1.jpg'
import book2 from '../../assets/OPAC/photos/book2.jpg'
import Book from '../Book/Book'
import Footer from '../Footer/Footer'

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

      {/* featured book */}
      <section className="featured-book">
        <div className="row">
          {/* image */}
          <div className="col image">
            <img src={book1} alt="" />
          </div>
          {/* content */}
          <div className="col content">
            <h3 className='m-0'>Bread & Pastry Production Manual</h3>
            <p className="author mb-4">by Jessica Pryce-Jones</p>
            <p className="description">According to Jessica Pryce-Jones, happiness at work is not some abstract idea but a practical reality with a clear impact on you and your workplace. This book reveals that the happier you are the more you ll achieve, yielding tangible benefits to you and your organization.</p>
            <button className="btn search-btn">search more like this</button>
          </div>
        </div>
      </section>

      {/* thesis and dissertation */}
      <section className="thesis-dissertation">
        <h3>The Learning Resources Center also houses<br/> 
        Theses and Dissertations</h3>
        <p>Look for inspiration or ideas for your upcoming projects here</p>
        <button className='btn search-btn'>search more</button>
      </section>

      <Footer/>

    </div>
  )
}

export default Home
