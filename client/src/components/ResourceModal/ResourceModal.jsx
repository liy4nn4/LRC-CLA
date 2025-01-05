import React, { useState, useEffect, useRef } from 'react';
import './ResourceModal.css';
import Book from '../Book/Book';
import { gsap } from 'gsap';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import Loading from '../Loading/Loading';
import Navbar from '../Navbar/Navbar';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
// import required modules
import { Pagination } from 'swiper/modules';
import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // Connect to the Socket.IO server

const ResourceModal = () => {
  console.log('resource modal rendered');
  const [isSearch, setIsSearch] = useState(true);
  const [resource, setResource] = useState();
  const [preview, setPreview] = useState();
  const [relatedBooks, setRelatedBooks] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [keyword, setKeyword] = useState(queryParams.get('keyword') || '');
  const id = queryParams.get('id');
  const [loading, setLoading] = useState(false);

  // Refs for GSAP animations
  const resourceDetailsRef = useRef(null);
  const resourceImageRef = useRef(null);
  const relatedResourcesRef = useRef(null);

  useEffect(() => {
    viewResource();
  }, [id]);

  useEffect(()=>{
    viewResource();
    
    socket.on('updatedCatalog', () => {
      console.log('catalog updated, refreshing catalog...');
      viewResource();
    });

    return () => {
      socket.off('updatedCatalog');
    };
  },[])

  useEffect(() => {
    if (resource) {
      // GSAP animation for resource details and image
      gsap.fromTo(resourceDetailsRef.current, { opacity: 0, x: -100 }, { opacity: 1, x: 0, duration: 1 });
      gsap.fromTo(resourceImageRef.current, { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1, delay: 0.5 });
      gsap.fromTo(relatedResourcesRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, delay: 1 });
    }
  }, [resource]);

  useEffect(() => {
    let objectUrl;
    if (resource && resource.type_id !== 4) {
      try {
        if (resource.resource_cover instanceof Blob) {
          objectUrl = URL.createObjectURL(resource.resource_cover);
        } else if (resource.resource_cover?.data) {
          const blob = new Blob([new Uint8Array(resource.resource_cover.data)], { type: 'image/jpeg' });
          objectUrl = URL.createObjectURL(blob);
        }
        setPreview(objectUrl);
      } catch (error) {
        console.error('Error creating object URL:', error);
      }
    }
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [resource]);

  const viewResource = async () => {
    console.log('viewing resource');
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/resources/view', {
        params: { id },
      });

      setResource(response.data.results[0]);
      setRelatedBooks(response.data.relatedBooks);
      console.log('Resource viewed:', response.data);
    } catch (error) {
      console.error('Error retrieving resource:', error.message);
    } finally {
      setLoading(false);
    }
  };

  //display page from the top
  const handleNavigate = () => {
    window.scrollTo(0, 0);
  };


  return (
    <div className="res-modal-container">
      <Navbar />

      {/* Content */}
      <div className="res-content container">
        {/* Exit */}
        <div className="close-box">
          <Link to={`/search?keyword=${keyword}`} onClick={handleNavigate} className="close-btn">
            Go to Search
          </Link>
        </div>

        <div className="res-info row">
          {/* Resource details */}
          <div className="res-details col-md-7 col-12 order-md-7 order-md-1 order-2" ref={resourceDetailsRef}>
            <div className="res-status">{resource?resource.resource_quantity==0?'Unavailable':'Available':''}</div>
            <div className="title-author">
              <h4>{resource ? resource.resource_title : ''}</h4>
              <p className="m-0">by {resource ? resource.author_name : ''}</p>
            </div>
            <div className="detail">
              <h4>Published Date</h4>
              <p className="m-0">
                {resource ? resource.resource_published_date : ''}
              </p>
            </div>
            <div className="detail">
              <h4>Department</h4>
              <p className="m-0">
                {resource ? resource.dept_name : ''}
              </p>
            </div>
            {resource?resource.type_id==4?'':<div className="detail">
              <h4>Topic</h4>
              <p className="m-0">
                {resource ? resource.topic_name : ''}
              </p>
            </div>:''}
            <div className="detail">
              <h4>Shelf No.</h4>
              <p className="m-0">
                {resource ? resource.dept_shelf_no : ''}
              </p>
            </div>
            {resource?resource.type_id==4?'':<div className="detail">
              <h4>Row No.</h4>
              <p className="m-0">
                {resource ? resource.topic_row_no : ''}
              </p>
            </div>:''}
            <p className='isCirculation'>{resource?resource.resource_is_circulation==0?'This resource cannot be borrowed and is available for use within the premises only.':'This resource can be borrowed and is not limited to use within the premises.':''}</p>
          </div>

          {/* Resource images */}
          <div className="res-img col-md-5 col-12 order-md-7 order-1 order-md-2" ref={resourceImageRef}>
            {resource && resource.type_id !== 4 ? (
              <img src={preview} alt="Book Cover" />
            ) : (
              <div className="thesis-cover">
                <p className="title">{resource ? resource.resource_title : ''}</p>
              </div>
            )}
          </div>

          {/* Related resources */}
          <div className="col-12 order-3 related-res" ref={relatedResourcesRef}>
            <h4>Related Resources</h4>
            <div className="resource col">
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
               
               {Array.isArray(relatedBooks) && relatedBooks.length > 0 ? (
                relatedBooks.map((item, index) => (
                  <SwiperSlide><Link to={`/resource?keyword=${keyword}&id=${item.resource_id}`} onClick={handleNavigate} className="resource" key={index}>
                    <Book item={item} isSearch={isSearch} />
                  </Link></SwiperSlide>
                ))
              ) : (
                <p className='no-related'>No related resources.</p>
              )}
             
            </Swiper>
            </div>
          </div>
        </div>
      </div>
      <Loading loading={loading} isView={true}></Loading>
    </div>
  );
};

export default ResourceModal;
