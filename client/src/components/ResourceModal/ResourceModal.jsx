import React, { useState, useEffect, useRef } from 'react';
import './ResourceModal.css';
import Book from '../Book/Book';
import { gsap } from 'gsap';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import Loading from '../Loading/Loading';
import Navbar from '../Navbar/Navbar';

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

  console.log(id);

  return (
    <div className="res-modal-container">
      <Navbar />

      {/* Content */}
      <div className="res-content container">
        {/* Exit */}
        <div className="close-box">
          <Link to={`/search?keyword=${keyword}`} className="close-btn">
            Go back to Search
          </Link>
        </div>

        <div className="res-info row">
          {/* Resource details */}
          <div className="res-details col-7" ref={resourceDetailsRef}>
            <div className="res-status">Available</div>
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
            <div className="detail">
              <h4>Topic</h4>
              <p className="m-0">
                {resource ? resource.topic_name : ''}
              </p>
            </div>
            <div className="detail">
              <h4>Shelf No.</h4>
              <p className="m-0">
                {resource ? resource.dept_shelf_no : ''}
              </p>
            </div>
            <div className="detail">
              <h4>Row No.</h4>
              <p className="m-0">
                {resource ? resource.topic_row_no : ''}
              </p>
            </div>
          </div>

          {/* Resource images */}
          <div className="res-img col" ref={resourceImageRef}>
            {resource && resource.type_id !== 4 ? (
              <img src={preview} alt="Book Cover" />
            ) : (
              <div className="thesis-cover">
                <p className="title">{resource ? resource.resource_title : ''}</p>
              </div>
            )}
          </div>

          {/* Related resources */}
          <div className="col-12 related-res" ref={relatedResourcesRef}>
            <h4>Related Resources</h4>
            <div className="resource">
              {Array.isArray(relatedBooks) && relatedBooks.length > 0 ? (
                relatedBooks.map((item, index) => (
                  <Link to={`/resource?keyword=${keyword}&id=${item.resource_id}`} className="resource" key={index}>
                    <Book item={item} isSearch={isSearch} />
                  </Link>
                ))
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      </div>
      <Loading loading={loading} isView={true}></Loading>
    </div>
  );
};

export default ResourceModal;
