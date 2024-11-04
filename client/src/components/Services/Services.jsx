import React from 'react'
import './Services.css'
import resourcecollection from '../../assets/OPAC/photos/resource-collection.png'
import studyspace from '../../assets/OPAC/photos/study-space.png'
import faculty from '../../assets/OPAC/photos/faculty-consultation.png'
import eventspace from '../../assets/OPAC/photos/event-space.png'
import research from '../../assets/OPAC/photos/research-support.png'

const Services = () => {
  return (
    <div className='services-container'>
        {/* cover image */}
        <div className="services-header-cover"></div>

        {/* services */}
        <section className="container-fluid services">
            <div className='services-header'>
                <h1>What We Offer</h1>
                <p>The College of Liberal Arts’ Learning Resource Center<br/>offers various services</p>
            </div>
            
            <div className="row service-list">
                {/* service */}
                <div className="col-4 service">
                    <img src={resourcecollection} alt="" />
                    <div>
                        <h5>Extensive Resource Collection</h5>
                        <span>Access a diverse collection of books, magazines, newsletter, and theses related to the liberal arts.</span>
                    </div>
                </div>
                <div className=" col-4 service">
                    <img className="" src={studyspace}/>
                    <div className="">
                        <h5 className="">Study and Collaboration Spaces</h5>
                        <span className="">Find quiet study areas and group study spaces to enhance your learning experience.</span>
                    </div>
                </div>
                {/* service */}
                <div className="col-4 service">
                    <img className="" src={faculty} alt=""/>
                    <div className="">
                        <h5 className="">Faculty Consultation</h5>
                        <span className="">Connect with CLA faculty for academic guidance, research assistance, and thesis support.</span>
                    </div>
                </div>
                {/* service */}
                <div className="col-4 service">
                    <img className="" src={eventspace} alt=""/>
                    <div className="">
                        <h5 className="">Event and Meeting Spaces</h5>
                        <span className="">Utilize our facilities for student organization meetings, workshops, and other academic events.</span>
                    </div>
                </div>
                {/* service */}
                <div className="col-4 service">
                    <img className="" src={research} alt=""/>
                    <div className="">
                        <h5 className="">OBE and Research Support</h5>
                        <span className="">Benefit from the expertise of our OBE Coordinator and Research and Extension staff.</span>
                    </div>
                </div>
                
                
            </div>
        </section>
    </div>
  )
}

export default Services
