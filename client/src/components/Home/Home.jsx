import React, { useEffect, useState } from 'react'
import Navbar from '../Navbar/Navbar'
import './Home.css'
import axios from 'axios'
import { Link } from "react-router-dom"

// swiper will be used for the coverflow
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
//for the arrows
import 'swiper/css/navigation';

// import required modules
import { EffectCoverflow, Navigation, Pagination } from 'swiper/modules';

import './Home.css';
import cover from '../../assets/OPAC/photos/sample-cover.jpeg'
import dropdown from '../../assets/OPAC/icons/arrow-dropdown.svg'




const Home = () => {
  
  // this contains data about books
  const [bookData,setBookData]=useState([])

  useEffect(()=>{
    getBookCovers()
  },[])

  const getBookCovers=async()=>{
    try{
      // iisa lang yung finifetch mo na data here 
      const res = await axios.get('https://openlibrary.org/isbn/9781496413291.json')
      setBookData(res.data.covers[0])
      
    }catch(err){
      console.error('An error occurred: ',err.message)
    }
  }

  

  return (
    <div className='home-container'>
      
        {/* hero section */}
      <section className='home-hero-section'>

        <div className="home-title-subtitle">
          <h1 className='home-title m-0'>College of Liberal Arts</h1>
          <p className='home-subtitle m-0'>Learning Resource Center</p>
        </div>
        {/* search bar */}
        <div className="home-search-bar">
          {/* filter button */}
          <div className="dropdown">
            <button className="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <span>Filter</span>
            </button>
            <ul className="dropdown-menu">
              <li><a className="dropdown-item" href="#">Action</a></li>
              <li><a className="dropdown-item" href="#">Another action</a></li>
              <li><a className="dropdown-item" href="#">Something else here</a></li>
            </ul>
          </div>
          {/* search bar */}
          <input type="text" name="" id="" className='home-search' placeholder='Search for resources'/>
          <Link to='/search' className='link'><button className='home-search-button'>
          <i className="fa-solid fa-magnifying-glass"></i>
          <span className='button-text'>Search</span> 
          </button>
          </Link>
          
        </div>
      </section>

      {/* newly acquired books */}
      <section className='home-acquired-books'>
        <div className='home-acquired-books-header'>
          <h1 className='newly-acquired-text m-0'>Newly Acquired Books</h1>
          <p className='newly-acquired-description m-0'>Discover the latest reads</p>
        </div>
        

        {/* coverflow slider */}
        <div className="home-acquired-books-gallery">
        <Swiper
        effect={'coverflow'}
        grabCursor={true}
        centeredSlides={true}
        loop={true}
        slidesPerView={'auto'}
        initialSlide={3}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 50,
          modifier: 2,
        }}
        pagination={true}
        navigation={true}
        modules={[EffectCoverflow, Navigation, Pagination]}
        className="mySwiper">
          <SwiperSlide>
            <img src={bookData?`https://covers.openlibrary.org/b/id/${bookData}-L.jpg`:''} onClick={()=>console.log('clicked')}/>
          </SwiperSlide>
          <SwiperSlide>
          <img src={cover} />
          </SwiperSlide>
          <SwiperSlide>
          <img src={cover} />
          </SwiperSlide>
          <SwiperSlide>
          <img src={cover} />
          </SwiperSlide>
          <SwiperSlide>
          <img src={cover} />
          </SwiperSlide>
         </Swiper>
        </div>

        {/* coverflow description */}
        <p className='home-coverflow-description'>Looking for a specific book? Want to find academic resources for your next project? Our online catalog has been designed to make your search simple and intuitive. Start exploring now!</p>
      </section>
    </div>
  )
}

export default Home
