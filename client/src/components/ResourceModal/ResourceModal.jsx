import React, { useState, useEffect, useRef } from 'react';
import './ResourceModal.css';
import book1 from '../../assets/OPAC/photos/book1.jpg';
import Book from '../Book/Book';
import { gsap } from 'gsap';

const ResourceModal = ({ open, close }) => {
  const [isView, setIsView] = useState(true);
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

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
              <h4>Happiness at WORK: Maximizing your psychological capital for success</h4>
              <p className="m-0">by Jessica Pryce-Jones</p>
            </div>
            {/* Description */}
            <div className="description">
              <h4>Description</h4>
              <p className="m-0">
                According to Jessica Pryce-Jones, happiness at work is not some abstract idea but a practical reality
                with a clear impact on you and your workplace. This book reveals that the happier you are the more
                you’ll achieve, yielding tangible benefits to you and your organization.
              </p>
            </div>
          </div>

          {/* Resource images */}
          <div className="res-img col">
            <img src={book1} alt="Book Cover" />
          </div>

          {/* Related resources */}
          <div className="col-12">
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
