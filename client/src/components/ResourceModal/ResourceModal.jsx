import React, { useState, useEffect, useRef } from 'react';
import './ResourceModal.css';
import book1 from '../../assets/OPAC/photos/book1.jpg';
import Book from '../Book/Book';
import { gsap } from 'gsap';

const ResourceModal = ({ open, close, resource }) => {
  const [isView, setIsView] = useState(true);
  const [preview,setPreview] =useState()
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
 
  
    useEffect(()=>{
      if(!resource) return;
  
      if(resource.type_id!=4){
        let objectUrl;
        try{
    
              objectUrl = URL.createObjectURL(resource.resource_cover);
              setPreview(objectUrl);
        }catch{
            const blob = new Blob([new Uint8Array(resource.resource_cover.data)], { type: 'image/jpeg' });
            objectUrl = URL.createObjectURL(blob);
            setPreview(objectUrl)
        }
    
        // Cleanup function to revoke the Object URL
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
          };
      }
      
    },[resource])

  // console.log(resource)

 
  useEffect(() => {
    if (open) {
      // Fade in upwards
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.2, ease: 'power3.out' }
      );
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power3.out' }
      );
    }
  }, [open]);

  const handleClose = () => {
    // Fade out downwards
    gsap.to(modalRef.current, {
      opacity: 0,
      y: 50,
      duration: 0.2,
      ease: 'power3.in',
      onComplete: close,
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: 'power3.in',
    });
  };

  if (!open) {
    return null;
  }

  return (
    <div className="res-modal-container">
      {/* Overlay */}
      <div className="res-modal-overlay" ref={overlayRef}></div>

      {/* Content */}
      <div className="res-content container" ref={modalRef}>
        {/* Exit */}
        <div className="close-box">
          <button className="close-btn" onClick={handleClose}>
            <i className="fa-solid fa-x"></i>
          </button>
        </div>

        <div className="res-info row">
          {/* Resource details */}
          <div className="res-details col-7">
            {/* Resource status */}
            <div className="res-status">Available</div>
            {/* Title and author */}
            <div className="title-author">
              <h4>{resource.resource_title}</h4>
              <p className="m-0">by {resource.author_name}</p>
            </div>
            {/* Published Date */}
            <div className="detail">
              <h4>Published Date</h4>
              <p className="m-0">
                2024
              </p>
            </div>
            {/* Department */}
            <div className="detail">
              <h4>Department</h4>
              <p className="m-0">
                Hospitality and Restaurant Management
              </p>
            </div>
            {/* Topic */}
            <div className="detail">
              <h4>Topic</h4>
              <p className="m-0">
                Food Preparation and Service
              </p>
            </div>
            {/* Shelf no */}
            <div className="detail">
              <h4>Shelf No.</h4>
              <p className="m-0">
                1
              </p>
            </div>
            {/* Row no */}
            <div className="detail">
              <h4>Row No.</h4>
              <p className="m-0">
                1
              </p>
            </div>
          </div>

          {/* Resource images */}
          <div className="res-img col">
            {resource.type_id!=4?
            (<img src={preview} alt="Book Cover" />):(
              <div className='thesis-cover'>
                <p className="title">{resource?resource.resource_title:''}</p>
              </div>
            )}
          </div>

          {/* Related resources */}
          <div className="col-12 related-res">
            <h4>Related Resources</h4>
            {/* Resources */}
            <div className="resource">
              <Book isView={isView} open={open} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceModal;
