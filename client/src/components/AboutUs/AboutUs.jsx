import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '../Navbar/Navbar';
import './AboutUs.css';
import claDoor from '../../assets/OPAC/photos/cla-lrc-door.JPG';
import claLrc from '../../assets/OPAC/photos/cla-lrc.JPG';

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
        <div className="row">
          <div className="col title">A Space for<br/> Learning<br/>and Collaboration</div>
          <div className="col">
            <img src={claLrc} alt="CLA LRC" className='cla-lrc'/>
          </div>
        </div>
        <div className="subtitle">
          The CLA LRC offers a serene and conducive environment for focused study and collaborative work. Our facilities include study areas and specialized sections for each Liberal Arts discipline.
        </div>
        <div className="subtitle2">
          Our extensive collection of books, newsletters, magazines, and theses resources provide you with the tools you need to succeed.
        </div>
        <div className="row">
          <div className="col">
            <img src={claDoor} alt="CLA Door" className='cla-door'/>
          </div>
          <div className="col title2">Comprehensive<br/>Resources at your<br/>Fingertips</div>
        </div>
      </div>

      <section className="coordinator-box row">
        <div className="col-6 coor-img">
          <img src={claLrc} alt="" />
        </div>
        <div className="col coor-remarks">
          <div>
            <h4>Prof. Jaime Jr. E. Mozo</h4>
            <p className='position'>Coordinator of College of Liberal Arts’ Learning Resources Center</p>
          </div>
          <p className='remark'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Culpa deleniti non sunt fuga incidunt. Culpa, alias? Libero earum necessitatibus, cumque beatae cupiditate exercitationem quo a quod alias enim fugiat ex aperiam sint corporis dolorem praesentium nam consequatur! Dolorem, explicabo ea aut excepturi, quam neque magnam nisi, facilis animi ut suscipitt.</p>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
