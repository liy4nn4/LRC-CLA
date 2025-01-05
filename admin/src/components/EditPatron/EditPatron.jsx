import React, { useEffect, useState } from 'react';
import './EditPatron.css';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditPatron = () => {
    const [patronData, setPatronData] = useState({
        patron_fname: '',
        patron_lname: '',
        patron_sex: '',
        patron_mobile: '',
        patron_email: '',
        category: '',
        college: '',
        program: '',
        tup_id: ''
    });

    const [categories, setCategories] = useState([]); // To store category options
    const [colleges, setColleges] = useState([]); // To store college options
    const [courses, setCourses] = useState([]); // To store course options

    const { id } = useParams(); // ID from the route parameter
    const navigate = useNavigate(); // For programmatic navigation

    const [isLoading, setIsLoading] = useState(true);
    



    
    useEffect(() => {
        axios.get(`http://localhost:3001/update-patron/${id}`)
            .then(res => {
                setPatronData({
                    patron_fname: res.data.patronData.patron_fname,
                    patron_lname: res.data.patronData.patron_lname,
                    patron_sex: res.data.patronData.patron_sex,
                    patron_mobile: res.data.patronData.patron_mobile,
                    patron_email: res.data.patronData.patron_email,
                    category: res.data.patronData.category,
                    college: res.data.patronData.college_id, // Keep ID for saving
                    college_name: res.data.patronData.college_name, // Show name in dropdown
                    program: res.data.patronData.course_id, // Keep ID for saving
                    course_name: res.data.patronData.course_name, // Show name in dropdown
                    tup_id: res.data.patronData.tup_id || ''
                });
    
                setColleges(res.data.colleges);
                setCourses(res.data.courses);
                setIsLoading(false);
            })
            .catch(err => console.error(err));
    }, [id]);
    
    
    

    const handleChange = (e) => {
        setPatronData({
            ...patronData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = () => {
        const updatedData = {
            ...patronData,
            category: patronData.category === 'None' ? '' : patronData.category,
        };
        axios.put(`http://localhost:3001/update-patron/${id}`, patronData)
            .then(() => {
                console.log('Patron updated successfully');
                navigate('/patrons'); // Redirect after saving
            })
            .catch((error) => {
                console.error('There was an error updating the patron data:', error);
            });
    };
    
    

    return (
        <div className='edit-patron-container'>
            <h1 className='m-0'>Patrons</h1>

            <div className='edit-patron-path-button'>
                <Link to={'/patrons'}>
                    <button className='edit-patron-back-button'>
                        <i className='fa-solid fa-arrow-left'></i>
                        <p>Back</p>
                    </button>
                </Link>
                <div className='edit-patron-path'>
                    <p>Patrons / <span>Edit Patron</span></p>
                </div>
            </div>

            <div className='patron-info'>
                <div className='row'>
                    {/* header */}
                    <div className='col-12 patron-info-header'>
                        Edit Patron Information
                    </div>

                    <div className='row information-inputs'>
                        <div className='col-12'>
                            <div className='row'>
                                {/* TUP ID */}
                                <div className='col-3 patron-input-box'>
                                    <label htmlFor="">TUP ID</label>
                                    <input 
                                        type="text" 
                                        placeholder='Enter TUP ID' 
                                        name='tup_id' 
                                        value={patronData.tup_id} 
                                        onChange={handleChange}
                                    />
                                    <p className='patron-error'></p>
                                </div>
                            </div>

                            <div className='row'>
                                {/* First Name Input */}
                                <div className='col-6 patron-input-box'>
                                    <label htmlFor="">First name</label>
                                    <input 
                                        type="text" 
                                        placeholder='Enter first name' 
                                        name='patron_fname' 
                                        value={patronData.patron_fname}
                                        onChange={handleChange}
                                    />
                                    <p className='patron-error'></p>
                                </div>

                                {/* Last Name Input */}
                                <div className='col-6 patron-input-box'>
                                    <label htmlFor="">Last name</label>
                                    <input 
                                        type="text" 
                                        placeholder='Enter last name' 
                                        name='patron_lname' 
                                        value={patronData.patron_lname}
                                        onChange={handleChange}
                                    />
                                    <p className='patron-error'></p>
                                </div>
                            </div>

                            <div className='row'>
                                {/* SEX */}
                                <div className='col-3 patron-input-box'>
                                    <label htmlFor="">Sex</label>
                                    <select 
                                        name='patron_sex' 
                                        value={patronData.patron_sex} 
                                        onChange={handleChange}
                                        className='patron-dropdown'
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    <p className='patron-error'></p>
                                </div>

                                {/* PHONE NUMBER */}
                                <div className='col-4 patron-input-box'>
                                    <label htmlFor="">Phone number</label>
                                    <input 
                                        type="text" 
                                        placeholder='Enter phone number' 
                                        name='patron_mobile' 
                                        value={patronData.patron_mobile}
                                        onChange={handleChange}
                                    />
                                    <p className='patron-error'></p>
                                </div>

                                {/* EMAIL */}
                                <div className='col-5 patron-input-box'>
                                    <label htmlFor="">Email</label>
                                    <input 
                                        type="email" 
                                        placeholder='Enter email' 
                                        name='patron_email' 
                                        value={patronData.patron_email}
                                        onChange={handleChange}
                                    />
                                    <p className='patron-error'></p>
                                </div>

                                {/* CATEGORY */}
                                <div className="col-3 patron-input-box">
                                    <label htmlFor="">Category</label>
                                    <select
                                        name="category"
                                        value={patronData.category}
                                        onChange={handleChange}
                                        className="patron-dropdown"
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Student">Student</option>
                                        <option value="Faculty">Faculty</option>
                                    </select>
                                    <p className="patron-error"></p>
                                </div>


                                {/* COLLEGE */}
                                <div className='col-6 patron-input-box'>
                                    <label htmlFor="">College</label>
                                    <select
                                        name='college' 
                                        value={patronData.college} 
                                        onChange={handleChange}
                                        className='patron-dropdown'
                                    >
                                        <option value="">Select College</option>
                                        {colleges.map(college => (
                                            <option key={college.college_id} value={college.college_id}>
                                                {college.college_name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className='patron-error'></p>
                                </div>
                            </div>

                            <div className='row'>
                                {/* PROGRAM */}
                                    <div className='col-9 patron-input-box'>
                                        <label htmlFor="">Program</label>
                                        <select
                                            name='program'
                                            value={patronData.program}
                                            onChange={handleChange}
                                            className='patron-dropdown'
                                        >
                                            <option value="">Select Course</option>
                                            {courses.map(course => (
                                                <option key={course.course_id} value={course.course_id}>
                                                    {course.course_name}
                                                </option>
                                            ))}
                                        </select>
                                        <p className='patron-error'></p>
                                    </div>
                            </div>

                            <div className='row'>
                                {/* Save Button */}
                                <div className='col-16'>
                                    <button 
                                        type='button' 
                                        className='save-button' 
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPatron;
