import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import './Loading.css';
import claLogo  from '../../assets/OPAC/icons/cla-logo.png'

const Loading = ({ loading, isView}) => {
  const [loadingText, setLoadingText] = useState("Loading");
  const [dotCount, setDotCount] = useState(0);
  const texts = ["Retrieving Resources", "Please Wait", "Almost There", "Just a Moment", "Don't leave yet"];

  useEffect(() => {
    if (loading === false) {
      return;
    }

    const textInterval = setInterval(() => {
      setLoadingText(prevText => {
        // Find the next text in the array
        const currentIndex = texts.indexOf(prevText);
        return texts[(currentIndex + 1) % texts.length];
      });
    }, 3000); // Change text every 3 seconds

    const dotInterval = setInterval(() => {
      setDotCount(prevCount => (prevCount + 1) % 4); // Loop from 0 to 3 (for 3 dots)
    }, 1000); // Change dot every 1 second

    // Cleanup intervals when loading is false
    return () => {
      clearInterval(textInterval);
      clearInterval(dotInterval);
    };
  }, [loading]);

  if (!loading) {
    return null;
  }

  return ReactDom.createPortal(
    <div className="loading-container">
      <div className="loading-modal-overlay">
        {!isView?<img src={claLogo} alt="" />:''}
        {!isView?<div className="loading-text">
          {loadingText}{'.'.repeat(dotCount)}
        </div>:<div className="spinner-grow text-danger" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>}
        
      </div>
    </div>,
    document.getElementById('portal')
  );
};

export default Loading;
