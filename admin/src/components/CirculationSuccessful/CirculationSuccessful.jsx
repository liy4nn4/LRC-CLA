import React from 'react'
import './CirculationSuccessful.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const CirculationSuccessful = ({open, close, patronName }) => {
    if(!open){
        return null
    }
  return (
    <div className='circ-success-container'>
      {/* Overlay */}
      <div className="circ-success-overlay"></div>
        
        {/* Box */}
        <div className="circ-success-box">
            {/* close button */}
            <div className="close">
                <button className="btn" onClick={close}>
                    <FontAwesomeIcon icon={faX} className='icon'/>
                </button>
            </div>
            {/* patron info */}
            <div className="patron">
                <p>Item/s has been successfully issued to:</p>
                <p>{patronName}.</p>
            </div>
            {/* email confirmation */}
            <p className='email mt-4'>Email confirmation has been sent to the  borrower</p>
            {/* okay  */}
            <Link to={'/circulation'}>
            <button className="btn okay-btn" onClick={close
            }>Okay</button>
            </Link>
        </div>                                     
    </div>
  )
}

export default CirculationSuccessful
