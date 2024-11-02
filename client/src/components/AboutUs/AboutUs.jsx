import React from 'react'
import './AboutUs.css'
import staff from '../../assets/OPAC/photos/staff.png'


const AboutUs = () => {
  return (
    <div className='about-container'>
        {/* cover image */}
        <div className="about-header-cover"></div>

        {/* about us */}
        <section className='about-us'>
            <h1 className='text-center mb-4'>About Us</h1>
            <p>The College of Liberal Arts Learning Resource Center (CLA LRC) is your dedicated hub for academic exploration and intellectual growth. Our mission is to provide a comprehensive range of resources and services that support your academic journey.</p>
        </section>

        {/* mission vision */}
        <section className='mission-vision-box'>
            <div className='vision-cover'></div>
            <div className="vision-content">
                <h2 className="vision-title">A Space for Learning and Collaboration</h2>
                <p className='vision-text'>The CLA LRC offers a serene and conducive environment for focused study and collaborative work. Our facilities include study areas and specialized sections for each Liberal Arts discipline: Entrepreneurship, Languages, Hotel and Restaurant Management, Physical Education, Social Sciences.</p>
            </div>
            <div className="mission-content">
                <h2 className="mission-title">Comprehensive Resources at Your Fingertips</h2>
                <p className='mission-text'>Our extensive collection of books, newsletters, magazines, and theses resources provide you with the tools you need to succeed. Whether you're researching a complex topic, preparing for an exam, or working on a creative project, the CLA LRC has you covered.</p>
            </div>
            <div className='mission-cover'></div>
        </section>

        
        {/* Administration and Staff */}
        <section className="staff">
            <div>
                <h3 className='staff-header'>Administration and Staff</h3>
                <p className='staff-description'>We are committed to assisting you with your academic needs, from finding resources to scheduling study spaces.</p>
            </div>
            

            <div className="row staff-members m-0">
                {/* head */}
                <div className="col-md-12 staff-box">
                    {/* staff ico */}
                    <img src={staff} className="staff-icon"/>
                    {/* staff-info */}
                    <div className="staff-info">
                        <p className='staff-name m-0'>Jaime Jr. E. Mozo</p>
                        <p className='satff-position m-0'>Head</p>
                    </div>
                </div>
                {/* staff */}
                <div className="col-md-4 col-12 staff-box">
                    {/* staff ico */}
                    <img src={staff} className="staff-icon"/>
                    {/* staff-info */}
                    <div className="staff-info">
                        <p className='staff-name m-0'>Student Name</p>
                        <p className='satff-position m-0'>Staff</p>
                    </div>
                </div>

                {/* staff */}
                <div className="col-md-4 col-12 staff-box">
                    {/* staff ico */}
                    <img src={staff} className="staff-icon"/>
                    {/* staff-info */}
                    <div className="staff-info">
                        <p className='staff-name m-0'>Student Name</p>
                        <p className='satff-position m-0'>Staff</p>
                    </div>
                </div>

                {/* staff */}
                <div className="col-md-4 col-12 staff-box">
                    {/* staff ico */}
                    <img src={staff} className="staff-icon"/>
                    {/* staff-info */}
                    <div className="staff-info">
                        <p className='staff-name m-0'>Student Name</p>
                        <p className='satff-position m-0'>Staff</p>
                    </div>
                </div>
                {/* staff */}
                <div className="col-md-4 col-12 staff-box">
                    {/* staff ico */}
                    <img src={staff} className="staff-icon"/>
                    {/* staff-info */}
                    <div className="staff-info">
                        <p className='staff-name m-0'>Student Name</p>
                        <p className='satff-position m-0'>Staff</p>
                    </div>
                </div>
                {/* staff */}
                <div className="col-md-4 col-12 staff-box">
                    {/* staff ico */}
                    <img src={staff} className="staff-icon"/>
                    {/* staff-info */}
                    <div className="staff-info">
                        <p className='staff-name m-0'>Student Name</p>
                        <p className='satff-position m-0'>Staff</p>
                    </div>
                </div>
                {/* staff */}
                <div className="col-md-4 col-12 staff-box">
                    {/* staff ico */}
                    <img src={staff} className="staff-icon"/>
                    {/* staff-info */}
                    <div className="staff-info">
                        <p className='staff-name m-0'>Student Name</p>
                        <p className='satff-position m-0'>Staff</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
  )
}

export default AboutUs
