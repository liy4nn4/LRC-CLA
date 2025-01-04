import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Services.css';
import pci1 from '../../assets/OPAC/photos/pci1.jpg';
import pci2 from '../../assets/OPAC/photos/pci2.jpg';
import pci3 from '../../assets/OPAC/photos/pci3.jpg';
import pci4 from '../../assets/OPAC/photos/pci4.jpg';
import pci5 from '../../assets/OPAC/photos/pci5.jpg';

/* import studyspace from '../../assets/OPAC/photos/study-space.png';
import faculty from '../../assets/OPAC/photos/faculty-consultation.png';
import eventspace from '../../assets/OPAC/photos/event-space.png';
import research from '../../assets/OPAC/photos/research-support.png'; */
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

gsap.registerPlugin(ScrollTrigger);

const Services = () => {
  useEffect(() => {
    gsap.from('.services-header', {
      opacity: 0,
      y: -50,
      duration: 1.5,
      ease: 'power3.out',
    });

    gsap.from('.service', {
      scrollTrigger: {
        trigger: '.service-list',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      scale: 0.8,
      duration: 1.2,
      stagger: 0.3,
      ease: 'power3.out',
    });
  }, []);

  return (
    <div className='services-container'>
      <Navbar />

      <section className='services-header'>
        <h3>What We Offer</h3>
        <p>The College of Liberal Arts’<br/>Learning Resources Center offers<br/>various services</p>
      </section>

      <div className="row service-list">
        {/* service */}
        <div className="col-md-4 col-12 service">
          <img src={pci1} alt="" />
          <div>
            <h5>Extensive Resource Collection</h5>
            <span>Access a diverse collection of books, magazines, newsletter, and theses related to the liberal arts.</span>
          </div>
        </div>
        <div className="col-md-4 col-12 service">
          <img src={pci2} alt="" />
          <div>
            <h5>Study and Collaboration Spaces</h5>
            <span>Find quiet study areas and group study spaces to enhance your learning experience.</span>
          </div>
        </div>
        <div className="col-md-4 col-12 service">
          <img src={pci5} alt="" />
          <div>
            <h5>Faculty Consultation</h5>
            <span>Connect with CLA faculty for academic guidance, research assistance, and thesis support.</span>
          </div>
        </div>
        <div className="col-md-6 col-12 service">
          <img src={pci3} alt="" />
          <div>
            <h5>Event and Meeting Spaces</h5>
            <span>Utilize our facilities for student organization meetings, workshops, and other academic events.</span>
          </div>
        </div>
        <div className="col-md-6 col-12 service">
          <img src={pci4} alt="" />
          <div>
            <h5>OBE and Research Support</h5>
            <span>Benefit from the expertise of our OBE Coordinator and Research and Extension staff.</span>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
};

export default Services;
