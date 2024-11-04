// this is a component for cataloging (active item etc)
import React, { useEffect, useState } from 'react'
import './Cataloging.css'
import axios from 'axios'
import { getDepartmentOffline, getCatalogOffline } from '../../indexedDb'

const Cataloging = ({disabled,handleChange,bookData,handleToggle,formValidation, error,isDbInitialized}) => {
    const [department, setDepartment] = useState([])
    const [catalog, setCatalog] = useState([])

    useEffect(() => {
        console.log('cataloging mounted')
        if(!navigator.onLine){
            getDepartmentOffline(setDepartment);
            getCatalogOffline(setCatalog);
        }else{
            getDept()
            getCatalog()
        }
    }, [isDbInitialized]);
    

    const getDept = async()=>{
        try{
            const response = await axios.get('http://localhost:3001/departments').then(res=>res.data)
            setDepartment(response)
        }catch(err){
            console.log(err.message)
        }
    }

    const getCatalog = async()=>{
        try{
            const response = await axios.get('http://localhost:3001/catalog').then(res=>res.data)
            setCatalog(response)
        }catch(err){
            console.log(err.message)
        }
    }

    console.log(department)

  return (
    <div className='cataloging-box'>
        <div className="row">
            {/* header */}
            <div className="col-12 cataloging-info-header">Cataloging</div>

            <div className="row cataloging-inputs">
                {/* cataloging*/}
                <div className="col-12 ">
                    <div className="row">
                        {/* department */}
                        <div className="col-6 info-input-box">
                            <label htmlFor="">Department</label>
                            <select className="form-select"
                            name='department'
                            disabled={disabled} onChange={handleChange} onBlur={formValidation}>
                                <option selected disabled className=''>Select department</option>
                                {department.length>0?department.map((item,key)=>(
                                    <option value={item.dept_id} className='dept_name'>{item.dept_name}</option>
                                )):''}
                                
                            </select>
                            <p className='resource-error'>{error.department}</p>
                        </div>
                        {/* course */}
                        <div className="col-6 info-input-box">
                            <label htmlFor="">Course</label>
                            <select className="form-select" name='course' disabled={disabled} onChange={handleChange} onBlur={formValidation}>
                                <option selected disabled>Select Course</option>
                                {catalog.length>0?catalog.map((item,key)=>(
                                    <option value={item.cat_id}>{`${item.cat_course_code} (${item.cat_course_name})`}</option>
                                )):''}
                            </select>
                            <p className='resource-error'>{error.course}</p>
                        </div>
                        {/* shelf no */}
                        {/* <div className="col-3 info-input-box">
                            <label htmlFor="">Shelf No.</label>
                            <input type="number" name='shelfNo' placeholder='Enter shelf number' disabled={disabled?true:false} onChange={handleChange}/>
                        </div> */}
                        {/* active item */}
                        {/* <div className="col-12 mt-5">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" role="switch" id="active-item" disabled={disabled?true:false} onChange={handleToggle} name='isActive'/>
                                <div className="switch-label">
                                    <label class="form-check-label" for="active-item">Active Item</label>
                                    <span>Item is available for checking out and OPAC listing</span>
                                </div>
                            </div>
                        </div> */}
                        {/* published*/}
                        {/* <div className="col-12 mt-3">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" role="switch" id="published" disabled={disabled?true:false} onChange={handleToggle} name='isPublished'/>
                                <div className="switch-label">
                                    <label class="form-check-label" for="published">Published</label>
                                    <span>Enable OPAC listing, uncheck if you don't want to put this item on OPAC.</span>
                                </div>
                            </div>
                        </div> */}
                        {/* circulation*/}
                        <div className="col-12 mt-3">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" role="switch" id="circulation" disabled={disabled} onChange={handleToggle} name='isCirculation'/>
                                <div className="switch-label">
                                    <label class="form-check-label" for="circulation">Circulation</label>
                                    <span>Enable circulation, uncheck if you want to disable circulation for this item.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                
            </div>
        </div>
    </div>
  )
}

export default Cataloging
