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
            <h1>What We Offer</h1>
            <div className="row">
                {/* service */}
                <div className="card col-md-6">
                    <img className="card-img-top" src={resourcecollection} alt="Card image cap"/>
                    <div className="card-body">
                    <h5 className="card-title">Extensive Resource Collection</h5>
                    <p className="card-text">Access a diverse collection of books, magazines, newsletter, and theses related to the liberal arts.</p>
                    </div>
                </div>
                {/* service */}
                <div className="card col-md-6">
                    <img className="card-img-top" src={studyspace} alt="Card image cap"/>
                    <div className="card-body">
                    <h5 className="card-title">Study and Collaboration Spaces</h5>
                    <p className="card-text">Find quiet study areas and group study spaces to enhance your learning experience.</p>
                    </div>
                </div>
                {/* service */}
                <div className="card col-md-6">
                    <img className="card-img-top" src={faculty} alt="Card image cap"/>
                    <div className="card-body">
                    <h5 className="card-title">Faculty Consultation</h5>
                    <p className="card-text">Connect with CLA faculty for academic guidance, research assistance, and thesis support.</p>
                    </div>
                </div>
                {/* service */}
                <div className="card col-md-6">
                    <img className="card-img-top" src={eventspace} alt="Card image cap"/>
                    <div className="card-body">
                    <h5 className="card-title">Event and Meeting Spaces</h5>
                    <p className="card-text">Utilize our facilities for student organization meetings, workshops, and other academic events.</p>
                    </div>
                </div>
                {/* service */}
                <div className="card col-md-6">
                    <img className="card-img-top" src={research} alt="Card image cap"/>
                    <div className="card-body">
                    <h5 className="card-title">OBE and Research Support</h5>
                    <p className="card-text">Benefit from the expertise of our OBE Coordinator and Research and Extension staff.</p>
                    </div>
                </div>
                
                
            </div>
        </section>
    </div>
  )
}

export default Services
