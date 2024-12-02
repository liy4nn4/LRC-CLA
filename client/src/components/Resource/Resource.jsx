import React, { useEffect, useState } from 'react'
import './Resource.css'
import cover from '../../assets/OPAC/photos/sample-cover.jpeg'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { useLocation, useNavigate } from 'react-router-dom'; //for retrieving query


// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// import required modules
import { Pagination, Navigation } from 'swiper/modules';

import './Resource.css'
import { useParams } from 'react-router-dom';
import axios from 'axios'


const Resource = () => {
    const location = useLocation();
    const {id} = useParams();
    const navigate = useNavigate();

    // Retrieve the query parameters
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q');
    const filter = searchParams.get('filter');
    console.log(filter)

    
    const [resource,setResource]=useState({})
    const [image, setImage] = useState()
    const [preview,setPreview] =useState() 
    

    console.log(id)

    useEffect(()=>{
        getResource()
    },[])

    const getResource = async()=>{
        try{
            const response = await axios.get(`http://localhost:3001/resource/${id}`)
            console.log(response.data)
            setResource(response.data[0])
            
        }catch(err){
            console.log('An error occurred:  ', err.message)
        }
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

    const handleBack = ()=>{
        navigate(`/results?q=${query}&filter=${filter}`)
    }

    if(Object.keys(resource).length==0){
        return (<div className='loading-resource container'>
            <div class="spinner-grow text-danger container" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>)
    }
  
  return (
    <div className='resource-container container'>
        {/* view selected resource */}
        <button className='back-to-results' onClick={handleBack}><i class="fa-solid fa-arrow-left"></i>
        <span >Back to Results</span></button>  
    
        {/*resource cover and resource info  */}
        <section className='row resource-info-cover container'>
            {/* book info */}
            
            <div className="col-md-7 col-12  resource-info">
                {/* resource status */}
                <p className='resource-status'>{resource?resource.avail_name:''}</p>

                {/* resource image and author */}
                <div className='resource-title-author'>
                    <h2 className='resource-name'>{resource?resource.resource_title:''}</h2>
                    <p className="resource-author">by <span>{resource?resource.author_name:''}</span></p>
                </div>

                {/* resource summary */}
                <div className="resource-summary">
                    <h3 className="resource-summary-text">Summary</h3>
                    <p className="resource-summary-content">
                        {resource?resource.resource_description:''}
                    </p>
                </div>

                {/* resource subject */}
                <div className="resource-subject">
                    <h3 className="resource-subject-text">Subject</h3>
                    <ul>
                        <li>{resource?resource.cat_course_code:''}</li>
                    </ul>
                </div>

                {/* resource isbn */}
                <div className="resource-isbn">
                <h3 className="resource-isbn-text">ISBN</h3>
                    <ul>
                        <li>{resource?resource.book_isbn:''}</li>
                    </ul>
                </div>

            </div>
            {/* book cover */}
            <div className="col-md-5 col-12  resource-cover-box">
                <img src={resource.book_cover?handleCover(resource.book_cover):''} alt="" className='resource-cover'/>
                
            </div>
        </section>

        {/* related books */}
        <section className="related-books container">
            <h3>Related Books</h3>
            <Swiper
                pagination={true} //set pagination to true
                navigation={true}
                modules={[Pagination, Navigation]}
                watchOverflow={true} //if no more slides, arrow will be disabled
                slidesPerView={4} // Display 4 books per slide
                spaceBetween={10} // Adjust space between the books
                className="mySwiper">
                <SwiperSlide>
                    <img src={cover} alt="" />
                </SwiperSlide>
                <SwiperSlide>
                    <img src={cover} alt="" />
                </SwiperSlide>
                <SwiperSlide>
                    <img src={cover} alt="" />
                </SwiperSlide>
                <SwiperSlide>
                    <img src={cover} alt="" />
                </SwiperSlide>
                <SwiperSlide>
                    <img src={cover} alt="" />
                </SwiperSlide>
            </Swiper>
        </section>
      
    </div>
  )
}

export default Resource
