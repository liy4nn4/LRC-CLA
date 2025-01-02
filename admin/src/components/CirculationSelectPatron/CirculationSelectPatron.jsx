import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './CirculationSelectPatron.css'
import { Link, useNavigate } from 'react-router-dom'

const CirculationSelectPatron = () => {
    const navigate = useNavigate();
    const [patrons, setPatrons] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // State for search query
    const [filteredPatrons, setFilteredPatrons] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Current page number
    const [itemsPerPage] = useState(5); // Number of items per page

    const getPatrons = async () => {
        try {
            const response = await axios.get('http://localhost:3001/patron'); // Replace with your backend endpoint
            const sortedPatrons = response.data.sort((a, b) => b.total_checkouts - a.total_checkouts);
            setPatrons(sortedPatrons);
            setFilteredPatrons(sortedPatrons);
        } catch (error) {
            console.error("Error fetching patron data:", error);
        }
    };

    useEffect(() => {
        getPatrons();
        localStorage.clear();
    }, []);

    const handleSearch = () => {
        const query = searchQuery.toLowerCase();
        console.log(query)
        const filtered = patrons.filter((patron) => {
            return (
                patron.tup_id.toLowerCase().includes(query) ||
                `${patron.patron_fname} ${patron.patron_lname}`.toLowerCase().includes(query) ||
                patron.category.toLowerCase().includes(query) ||
                patron.course_name.toLowerCase().includes(query)
            );
        });
        setFilteredPatrons(filtered);
        setCurrentPage(1);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPatrons.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(filteredPatrons.length / itemsPerPage);

    const goToPreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };


  return (
    <div className='circ-select-patron-container'>
        <h1>Circulation</h1>
      
        {/* path and back */}
        <div className="back-path">
                <button onClick={() => navigate(-1)}className="btn">Back</button>
            <p>Circulation / <span>Select patron</span></p>
        </div>

        {/* search */}
        <div className="search-container">
            <p className='m-0'>Check in item for</p>
            <input type="text" 
                    value={searchQuery} 
                    onChange={(e) => {setSearchQuery(e.target.value); handleSearch(e.target.value)}} 
                    placeholder="Search by name, ID, category, or course" />
            <button className="btn" onClick={handleSearch}>Search</button>
        </div>

        {/* list of patrons */}
        <div className="patron-list">
            <p>List of registered patrons</p>

            {/* header */}
            <div className="row patron-list-header">
                <div class="col">Patron ID</div>
                <div class="col-3   ">Name</div>
                <div class="col">Category</div>
                <div class="col-3">Course</div>
                <div class="col-2">Checkouts</div>
            </div>

            {/* patron */}
            <div className="">
                {currentItems.map((patron, index) => (
                    <Link to={`/circulation/patron/item/${patron.patron_id}`}>
                        <div className="row patron" key={index}>
                            
                            <div class="col "><input type="radio" /> {patron.tup_id}</div>
                            <div class="col-3 text-start d-flex align-items-center">{patron.patron_fname} {patron.patron_lname}</div>
                            <div class="col d-flex align-items-center justify-content-center">{patron.category}</div>
                            <div class="col-3 d-flex align-items-center">{patron.course_name}</div>
                            
                            <div class="col-2 d-flex align-items-center justify-content-center">{patron.total_checkouts}</div>
                        </div>
                    </Link>
                ))}
            </div>
 
            
            

            {/* pagination */}
            <div className="pagination">
                <div className="buttons">
                    <button className="btn" onClick={goToPreviousPage} disabled={currentPage === 1}>Previous</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button className="btn" onClick={goToNextPage} disabled={currentPage === totalPages}>Next</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default CirculationSelectPatron
