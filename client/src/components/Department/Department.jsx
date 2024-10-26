import React from 'react'
import './Department.css'
import entrep from '../../assets/OPAC/photos/entrepreneur.png'
import languages from '../../assets/OPAC/photos/languages.png'
import socsci from '../../assets/OPAC/photos/social-science.png'
import hotel from '../../assets/OPAC/photos/hotel-management.png'
import pe from '../../assets/OPAC/photos/pe.png'

const Departments = () => {
  return (
    <div className='departments-container'>
        {/* cover image */}
        <div className="departments-header-cover"></div>

        {/* departments */}
        <section className="container-fluid departments">
            <h1>Departments</h1>
            <div className="row">
                {/* department */}
                <div className="card col-md-6">
                    <img className="card-img-top" src={entrep} alt="Card image cap"/>
                    <div className="card-body">
                    <h5 className="card-title">Entrepreneurship</h5>
                    <p className="card-text">Learn about business planning, marketing, finance, and leadership to achieve your entrepreneurial goals.</p>
                    </div>
                </div>
                {/* department */}
                <div className="card col-md-6">
                    <img className="card-img-top" src={languages} alt="Card image cap"/>
                    <div className="card-body">
                    <h5 className="card-title">Languages</h5>
                    <p className="card-text">Develop strong communication skills and a deeper understanding of Philippine culture.</p>
                    </div>
                </div>
                {/* department */}
                <div className="card col-md-6">
                    <img className="card-img-top" src={hotel} alt="Card image cap"/>
                    <div className="card-body">
                    <h5 className="card-title">Hotel Management</h5>
                    <p className="card-text">Learn about hotel operations, food and beverage management, event planning, and customer department to excel in the dynamic world of hospitality.</p>
                    </div>
                </div>
                {/* department */}
                <div className="card col-md-6">
                    <img className="card-img-top" src={pe} alt="Card image cap"/>
                    <div className="card-body">
                    <h5 className="card-title">Physical Education</h5>
                    <p className="card-text">Learn about sportsmanship, teamwork, and the importance of regular exercise.</p>
                    </div>
                </div>
                {/* department */}
                <div className="card col-md-6">
                    <img className="card-img-top" src={socsci} alt="Card image cap"/>
                    <div className="card-body">
                    <h5 className="card-title">Social Sciences</h5>
                    <p className="card-text">Gain a deeper understanding of human society and behavior through the study of psychology, sociology, history, and political science.</p>
                    </div>
                </div>
                
                
            </div>
        </section>
    </div>
  )
}

export default Departments
