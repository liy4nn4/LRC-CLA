import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../Navbar/Navbar';
import './AboutUs.css';
import claDoor from '../../assets/OPAC/photos/cla-lrc-door.JPG';
import claLrc from '../../assets/OPAC/photos/cla-lrc.JPG';
import Footer from '../Footer/Footer';

gsap.registerPlugin(ScrollTrigger);


const AboutUs = () => {
  useEffect(() => {
    gsap.from('.aboutus-header', {
      opacity: 0,
      y: -50,
      duration: 1.5,
      ease: 'power3.out',
    });

    gsap.from('.purpose .row', {
      scrollTrigger: {
        trigger: '.purpose',
        start: 'top 80%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      y: 50,
      stagger: 0.2,
      duration: 1.5,
      ease: 'power3.out',
    });

    gsap.from('.purpose .subtitle, .purpose .subtitle2', {
      scrollTrigger: {
        trigger: '.purpose',
        start: 'top 60%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      x: -50,
      duration: 1.5,
      stagger: 0.3,
      ease: 'power3.out',
    });

    gsap.from('.coordinator-box', {
      scrollTrigger: {
        trigger: '.coordinator-box',
        start: 'top 70%',
        toggleActions: 'play none none reverse',
      },
      opacity: 0,
      scale: 0.8,
      duration: 1.5,
      ease: 'elastic.out(1, 0.5)',
    });
  }, []);

  return (
    <div className='aboutus-container'>
      <Navbar />

      <section className='aboutus-header'>
        <h3>About Us</h3>
        <p>The College of Liberal Arts Learning Resource Center (CLA LRC) is your dedicated hub for academic exploration and intellectual growth. Our mission is to provide a comprehensive range of resources and services that support your academic journey.</p>
      </section>

      <div className="purpose">
        {/* first purpose */}
        <div className="row purpose1">
          <div className="col-12 col-lg-6 title-subtitle1">
            <h4>A Space for <br/>Learning <br/>and Collaboration</h4>
            <p>The CLA LRC offers a serene and conducive environment for focused study and collaborative work. Our facilities include study areas and specialized sections for each Liberal Arts discipline: Entrepreneurship, Languages, Hotel and Restaurant Management, Physical Education, Social Sciences.</p>
          </div>
          <div className="col-12 col-lg-6 img1">
            <img src={claDoor} alt="" />
          </div>
        </div>
        {/* second purpose */}
        <div className="row purpose2">
          <div className="col-12 col-lg-6 img2 order-lg-1 order-2">
            <img src={claLrc} alt="" />
          </div>
          <div className="col-12 col-lg-6 order-lg-2 order-1 title-subtitle2">
            <h4>Comprehensive<br/>Resources at your<br/>Fingertips</h4>
            <p>Our extensive collection of books, newsletters, magazines, and theses resources provide you with the tools you need to succeed. Whether you're researching a complex topic, preparing for an exam, or working on a creative project, the CLA LRC has you covered.</p>
          </div>
        </div>
      </div>

      <section className="coordinator-box container row">
        {/* second purpose <div className="col-12 col-lg-6 coor-img">
          <img src={claLrc} alt="" />
        </div> */}
        <div className="col-12 col-lg-6 coor-remarks">
          <div>
            <h4>Prof. Jaime Jr. E. Mozo</h4>
            <p className='position'>Coordinator of College of Liberal Arts’ Learning Resources Center</p>
          </div>
          <p className='remark'>The vision is to create an environment where students, faculty, and staff can easily access valuable resources, benefit from exceptional services, and thrive within a culture of continuous learning and collaboration. By prioritizing accessibility, responsiveness, and innovation, the coordinator aims to contribute to the academic and personal growth of every individual who engages with the center, fostering a supportive community that encourages success and development.






</p>
        </div>
      </section>

      <Footer/>
    </div>
  );
};

export default AboutUs;
