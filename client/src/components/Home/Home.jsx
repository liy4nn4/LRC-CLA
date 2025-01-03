import React, { useEffect, useState } from 'react';
import './Home.css';
import Navbar from '../Navbar/Navbar';
import book1 from '../../assets/OPAC/photos/book1.jpg';
import book2 from '../../assets/OPAC/photos/book2.jpg';
import Book from '../Book/Book';
import Footer from '../Footer/Footer';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
// import required modules
import { Pagination } from 'swiper/modules';
import Loading from '../Loading/Loading';


gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [featuredBook, setFeaturedBook] = useState({})
  const [journalNewsletter, setJournalNewsletter] = useState([])
  const [preview,setPreview] = useState()
  const [loading,setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchFilter, setSearchFilter] = useState('all')
  const navigate = useNavigate()

  useEffect(() => {
    // check if the page has already been loaded (only show loading on first access)
    if (!sessionStorage.getItem('hasVisited')) {
      sessionStorage.setItem('hasVisited', 'true');
      setLoading(true);
      getData();
    } else {
      getData();
    }
  }, []);

  useEffect(() => {
    // Only run GSAP animations when loading is complete
    if (!loading) {
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

      gsap.from('.featured-book .row', {
        opacity: 0,
        x: -200,
        duration: 1.5,
        delay: 1.5,
        ease: 'power3.out',
      });

      gsap.from('.thesis-dissertation', {
        opacity: 0,
        y: 100,
        duration: 1.5,
        delay: 2,
        ease: 'bounce.out',
      });

      gsap.utils.toArray('.btn').forEach((btn) => {
        gsap.fromTo(
          btn,
          { scale: 1 }, 
          {
            scale: 1.1, 
            duration: 0.3,
            ease: 'power1.out',
            paused: true,
            repeat: -1,  
            yoyo: true,  
          }
        );
      });
    }
  }, [loading]);

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

  const getData = async()=>{
    // setLoading(true)
    //get books
    await getFeaturedBooks()
    // get journals and newsletters
    await getJournalNewsletter()
    // get featured book
    await getFeaturedBook()
    setLoading(false)
  }

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

/*---------------HANDLE CHANGE--------------------- */
const handleChange = async(e)=>{
  const {value}=e.target;
  setSearchKeyword(value)
}

const handleSearch = async()=>{
  if(searchKeyword!=''){
    navigate(`/search?keyword=${searchKeyword}`)
  }
}

//display page from the top
const handleNavigate = () => {
  window.scrollTo(0, 0);
};

// handles enter
const handleEnter = (e)=>{
  if(e.key==='Enter'){
    handleSearch()
  }
}
  console.log(journalNewsletter)


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
            <div className="search-bar">
              <input type="text" placeholder='Search for resources' name='term' onKeyDown={handleEnter} onChange={(e)=>handleChange(e)}/>
              <button className='btn' onClick={handleSearch}>
                <i class="fa-solid fa-magnifying-glass"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* featured books and journal */}
      <section className='books-jn'>
        {/* featured books */}
        <div className="featured-books ">
          <div className="header mb-3">
            <h4>Featured Books</h4>
            <Link to={`/search?keyword=`} onClick={handleNavigate} className='see-all'>See all</Link>
          </div>
          <Swiper
              slidesPerView={5}
              spaceBetween={5}
              breakpoints={{
                320: { // Small screens (mobile)
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                480: { // Medium screens
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                768: { // Tablet screens
                  slidesPerView: 3,
                  spaceBetween: 15,
                },
                1024: { // Desktop screens
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1200: { // Large screens
                  slidesPerView: 5,
                  spaceBetween: 25,
                },
              }}
              // pagination={{
              //   clickable: true,
              // }}
              modules={[Pagination]}
              className="mySwiper"
            >
               <div className="books">
               {Array.isArray(featuredBooks) && featuredBooks.length > 0 ? (
                  featuredBooks.map(item => (
                    <SwiperSlide><Link to={`/resource/?id=${item.resource_id}`} onClick={handleNavigate} className='home-resource'><Book item={item} /></Link></SwiperSlide>
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
            <Link to={`/search?keyword=`} onClick={handleNavigate} className='see-all'>See all</Link>
          </div>
          <div className="journal-newsletter">
          <Swiper
              slidesPerView={5}
              spaceBetween={5}
              breakpoints={{
                320: { // Small screens (mobile)
                  slidesPerView: 1,
                  spaceBetween: 10,
                },
                480: { // Medium screens
                  slidesPerView: 2,
                  spaceBetween: 10,
                },
                768: { // Tablet screens
                  slidesPerView: 3,
                  spaceBetween: 15,
                },
                1024: { // Desktop screens
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1200: { // Large screens
                  slidesPerView: 5,
                  spaceBetween: 25,
                },
              }}
              // pagination={{
              //   clickable: true,
              // }}
              modules={[Pagination]}
              className="mySwiper"
            >
               <div className="books">
               {Array.isArray(journalNewsletter) && journalNewsletter.length > 0 ? (
                  journalNewsletter.map(item => (
                    <SwiperSlide><Link to={`/resource/?id=${item.resource_id}`} onClick={handleNavigate} className='home-resource'><Book item={item} /></Link></SwiperSlide>
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
          <div className="col-12 col-md-6 image">
            <img src={preview} alt="" />
          </div>
          {/* content */}
          <div className="col-12 col-md-6 content">
            <h3 className='m-0'>{featuredBook.resource_title}</h3>
            <p className="author mb-4">by {featuredBook.author_name}</p>
            <p className="description">{featuredBook.resource_description}</p>
            <Link to={`/resource/?id=${featuredBook.resource_id}`} onClick={handleNavigate} className="view-resource">View resource</Link>
          </div>
        </div>
      </section>

      {/* thesis and dissertation */}
      <section className="thesis-dissertation">
        <h3>The Learning Resources Center also houses<br/> 
        Theses and Dissertations</h3>
        <p>Look for inspiration or ideas for your upcoming projects here</p>
        <Link to={`/search?keyword=`} onClick={handleNavigate} ><button className='btn search-btn'>search more</button>
        </Link>
        
      </section>

      <Footer />
      <Loading loading={loading}/>
    </div>
  );
};

export default Home;
