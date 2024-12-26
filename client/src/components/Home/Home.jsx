import React, { useEffect, useState } from 'react';
import './Home.css';
import Navbar from '../Navbar/Navbar';
import book1 from '../../assets/OPAC/photos/book1.jpg';
import book2 from '../../assets/OPAC/photos/book2.jpg';
import Book from '../Book/Book';
import Footer from '../Footer/Footer';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import axios from 'axios'

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
// import required modules
import { Pagination } from 'swiper/modules';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [featuredBook, setFeaturedBook] = useState({})
  const [journalNewsletter, setJournalNewsletter] = useState([])
  const [preview,setPreview] = useState()

  useEffect(() => {
    // Hero Section: Zoom In with a Parallax effect
    gsap.from('.hero .col.content', {
      opacity: 0,
      y: 100,
      duration: 1.5,
      delay: 0.5,
      ease: 'power3.out',
    });
  
    gsap.from('.hero .circle img', {
      opacity: 0,
      scale: 0.5,
      stagger: 0.2,
      duration: 1.5,
      ease: 'elastic.out(1, 0.5)',
    });
  
    // Featured Books and Journals: Scroll-triggered fade-in
    gsap.from('.featured-books .header', {
      scrollTrigger: {
        trigger: '.featured-books',
        start: 'top bottom',
        end: 'top top',
        scrub: true,
      },
      opacity: 0,
      y: 50,
      duration: 1.5,
      ease: 'power3.out',
    });
  
    gsap.from('.featured-books .books', {
      scrollTrigger: {
        trigger: '.featured-books',
        start: 'top bottom',
        end: 'top top',
        scrub: true,
      },
      opacity: 0,
      y: 50,
      duration: 1.5,
      delay: 0.5,
      ease: 'power3.out',
    });
  
    // Featured Book Section: Dramatic fade-in from the sides
    gsap.from('.featured-book .row', {
      opacity: 0,
      x: -200,
      duration: 1.5,
      delay: 1.5,
      ease: 'power3.out',
    });
  
    // Thesis and Dissertation Section: Bounce-in Effect
    gsap.from('.thesis-dissertation', {
      opacity: 0,
      y: 100,
      duration: 1.5,
      delay: 2,
      ease: 'bounce.out',
    });
  
    // New Button Hover Effect (Grow and Shrink)
    gsap.utils.toArray('.btn').forEach((btn) => {
      gsap.fromTo(
        btn,
        { scale: 1 }, // Initial scale
        {
          scale: 1.1,  // Grow on hover
          duration: 0.3,
          ease: 'power1.out',
          paused: true,
          repeat: -1,  // Repeat the scale animation (shrink and grow)
          yoyo: true,  // Make it reverse and shrink back
        }
      );
    });

    //get books
    getFeaturedBooks()
    // get journals and newsletters
    getJournalNewsletter()
    // get featured book
    getFeaturedBook()
  }, []);

  useEffect(()=>{
      if(!featuredBook.book_cover) return;
  
      let objectUrl;
      try{
          objectUrl = URL.createObjectURL(featuredBook.book_cover);
          setPreview(objectUrl);
         
          
      }catch{
          const blob = new Blob([new Uint8Array(featuredBook.book_cover.data)], { type: 'image/jpeg' });
          objectUrl = URL.createObjectURL(blob);
          setPreview(objectUrl)  
      }
  
       // Cleanup function to revoke the Object URL
       return () => {
          if (objectUrl) {
              URL.revokeObjectURL(objectUrl);
          }
        };
    },[featuredBook])

  const getFeaturedBooks = async () => {
    console.log('getting featured books')
    try {
        const response = await axios.get('http://localhost:3001/featured-books');
        console.log('Featured Books:', response);
        setFeaturedBooks(response.data);
    } catch (error) {
        console.error('Error retrieving featured books:', error.message);
    }
  };

  const getJournalNewsletter = async () => {
    console.log('getting journals/newsletter')
    try {
        const response = await axios.get('http://localhost:3001/journals-newsletters');
        console.log('Journal and newsletters:', response);
        setJournalNewsletter(response.data);
    } catch (error) {
        console.error('Error retrieving journals and newsletters:', error.message);
    }
  };

  const getFeaturedBook = async () => {
    console.log('getting featured book')
    try {
        const response = await axios.get('http://localhost:3001/featured-book');
        console.log('Featured book:', response);
        setFeaturedBook(response.data[0]);
    } catch (error) {
        console.error('Error retrieving featured book:', error.message);
    }
  };
  
  console.log(featuredBooks)
  console.log(journalNewsletter)
  console.log(featuredBook)


  return (
    <div className='client-home-container'>
      <Navbar />

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
            <Link to='/search'>
              <button className="btn">
                Start exploring now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* featured books and journal */}
      <section className='books-jn'>
        {/* featured books */}
        <div className="featured-books ">
          <div className="header mb-3">
            <h4>Featured Books</h4>
            <button className="btn">See all</button>
          </div>
          <Swiper
              slidesPerView={5}
              spaceBetween={5}
              // pagination={{
              //   clickable: true,
              // }}
              modules={[Pagination]}
              className="mySwiper"
            >
               <div className="books">
               {Array.isArray(featuredBooks) && featuredBooks.length > 0 ? (
                  featuredBooks.map(item => (
                    <SwiperSlide><Book item={item} /></SwiperSlide>
                  ))
                ) : (
                  <p>No featured books available.</p>
                )}
              </div>
            </Swiper>
        </div>

        {/* journal */}
        <div className="journals-newsletters">
          <div className="header mb-3">
            <h4>Journals and Newsletters</h4>
            <button className="btn">See all</button>
          </div>
          <div className="journal-newsletter">
          <Swiper
              slidesPerView={5}
              spaceBetween={5}
              // pagination={{
              //   clickable: true,
              // }}
              modules={[Pagination]}
              className="mySwiper"
            >
               <div className="books">
               {Array.isArray(journalNewsletter) && journalNewsletter.length > 0 ? (
                  journalNewsletter.map(item => (
                    <SwiperSlide><Book item={item} /></SwiperSlide>
                  ))
                ) : (
                  <p>No journals or newsletters available.</p>
                )}
              </div>
            </Swiper>
          </div>
        </div>
      </section>

      {/* featured book */}
      <section className="featured-book">
        <div className="row">
          {/* image */}
          <div className="col image">
            <img src={preview} alt="" />
          </div>
          {/* content */}
          <div className="col content">
            <h3 className='m-0'>{featuredBook.resource_title}</h3>
            <p className="author mb-4">by {featuredBook.author_name}</p>
            <p className="description">{featuredBook.resource_description}</p>
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

      <Footer />
    </div>
  );
};

export default Home;
