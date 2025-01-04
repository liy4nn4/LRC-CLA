import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Dashboard.css'
import { Link,  useNavigate  } from 'react-router-dom'
import dropdown_black from '../../assets/Management System/dashboard/dropdown-black.svg'
import add from '../../assets/Management System/dashboard/add.svg'
import more from'../../assets/Management System/dashboard/more.svg'
import left from'../../assets/Management System/dashboard/arrow-left-black.svg'
import right from'../../assets/Management System/dashboard/arrow-right-black.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers ,faBook, faPlus} from '@fortawesome/free-solid-svg-icons';
import { faker } from '@faker-js/faker';
import MultiLineGraph from '../MultiLineGraph'
import { Doughnut } from 'react-chartjs-2'
import PieChart from '../PieChart'
import BarChart from '../BarChart'


const Dashboard = () => {
  const [totalVisitors, setTotalVisitors] = useState("");
  const [totalBorrowed, setTotalBorrowed] = useState("");
  const [borrower, setBorrower] = useState([]);
  const [addedBooks, setAddedBooks] = useState([]);
  const [covers, setCovers] = useState([]);
  const date = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });  // e.g., "2024-12-16"
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [dateTime,setDateTime] = useState(new Date());
  const [dropdown, setDropdown]= useState(false);
  const [checkoutData, setCheckoutData] = useState([]);
  // sample data
  let navigate = useNavigate();


  // for borrowing trends (per week)
  const weeklyLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const booksData = [50, 65, 80, 45, 90, 100]; // Example: Borrowed books data
  const journalsData = [20, 30, 50, 25, 40, 60]; // Example: Borrowed journals data

  const data = {
    labels:weeklyLabels,
    datasets: [
      {
        label: 'Books',
        animations: {
          y: {
            duration: 2000,
            delay: 500
          }
        },
        data: booksData, // Updated API
        borderColor: '#94152B',
        backgroundColor: '#94152B',
        yAxisID: 'y',
      },
      {
        label: 'Journals & Newsletters',
        data: journalsData, // Updated API
        borderColor: '#EDDF13',
        backgroundColor: '#EDDF13',
        yAxisID: 'y1',
      },
    ],
  };

 const bardata = {
    labels:weeklyLabels,
    datasets: [
      {
        label: 'Visitors',
        data: booksData,
        backgroundColor: '#94152B',
      }
    ],
  };

  useEffect(() => {
    //setInterval throws an id na pwede natin gamitin to stop the interval
    const intervalId = setInterval(()=>setDateTime(new Date()), 1000 );
    getTotalVisitors();
    getBorrowedBooks();
    getBorrowers();
    getAddedBooks();
    fetchCovers();
    fetchOverdueBooks();
    fetchCheckoutInfo();
    // iccall lang ng react ung cleanup kapag lumipat kana ng component
     return function cleanup() {
        //stops the interval
         clearInterval(intervalId)
    }
},[]);

  const toggleDropdown = ()=>{
    setDropdown(prev=>!prev)
  }

  const getTotalVisitors = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/getTotalVisitors`, {
        params: { date }, // Send date as a query parameter
      });
      setTotalVisitors(response.data.total_attendance); // Adjust based on your backend response
      console.log(response.data);
    } catch (err) {
      console.error("Error fetching total visitors:", err.message);
    }
  };

  const getBorrowedBooks = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/getBorrowedBooks`, {
        params: { date }, // Send date as a query parameter
      });
      setTotalBorrowed(response.data.total_borrowed); // Adjust based on your backend response
      console.log(response.data);
    } catch (err) {
      console.error("Error fetching total visitors:", err.message);
    }
  };

  const getAddedBooks = async()=>{
    try {
      const response = await axios.get(`http://localhost:3001/getAddedBooks`).then(res=>res.data);
      setAddedBooks(response)
      console.log(response)
    } catch (err) {
        console.log(err.message);
    }
  }

  const getBorrowers = async()=>{
    try {
      const response = await axios.get(`http://localhost:3001/getBorrowers`).then(res=>res.data);
      setBorrower(response)
      console.log(response)
    } catch (err) {
        console.log(err.message);
    }
  }
  
  const fetchCovers = async () => {
    try {
        const response = await axios.get(`http://localhost:3001/getCover`);
        setCovers(response.data);
    } catch (error) {
        console.error('Error fetching book covers:', error);
    }
  }



  const fetchOverdueBooks = async () => {
      try {
          const response = await axios.get(`http://localhost:3001/api/overdue-books`);
          setOverdueBooks(response.data);
      } catch (error) {
          console.error('Error fetching overdue books:', error);
      }
  };


  const fetchCheckoutInfo = async () => {
      try {
          const response = await fetch(`http://localhost:3001/checkout-info`);
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          setCheckoutData(data);
      } catch (error) {
          console.error('Error fetching checkout info:', error);
      }
  };
  

  return (
    <div className='dashboard-container'>

      {/* dashboard heading */}
      <div className="dashboard-heading">
        {/* Goodmorning,admin */}
        <p className='dashboard-heading-text'>{dateTime.getHours()>=1 && dateTime.getHours()<12?'Good morning, ':dateTime.getHours()>=12&&dateTime.getHours()<17?'Good afternoon, ':'Good evening,'} <span>admin</span></p>
      </div>

      {/* dashboard boxes */}
      <div className='dashboard-overview'>
        {/* total visitors */}
        <div className="dash-box">
          <div className="total-box">
            <span className='total'>{totalVisitors}</span>
            <span className='label'>Total Visits</span>
          </div>
          <FontAwesomeIcon icon={faUsers} className='icon'/>
        </div>

        {/* borrowed books */}
        <div className="dash-box">
          <div className="total-box">
            <span className='total'>{totalBorrowed}</span>
            <span className='label'>Borrowed Books</span>
          </div>
          <FontAwesomeIcon icon={faBook} className='icon'/>
        </div>
      </div>

      {/* borrowed trends */}
      <div className="graphs">
        <MultiLineGraph data={data}/>
        <BarChart data={bardata}/>
      </div>

      {/* Popular choices */}
      <div className="popular-choices">
        <h5>Popular Choices</h5>
        <div className="popular-books">
          {covers.map((item, index) => (
            <div>
            <Link to={`/view-item/${item.resource_id}`}>
              <img 
                  key={index} 
                  src={`data:image/jpeg;base64,${item.cover}`} 
                  alt={`Book Cover ${item.resource_title}`} 
              />
            </Link>
            </div>
          ))}
        </div>
      </div>

      {/* borrowers list and books issued */}
      <div className="borrowed">
        {/* borrower list box */}
          <div className='borrowers-list'>
            <div className='heading'>
              <h5>Borrowers List</h5>
                <Link to='/circulation/patron'>
                  <button className='btn list-add-button'>
                    <FontAwesomeIcon icon={faPlus}/>
                    Add new
                  </button>
                </Link>
            </div>
            <table className='borrower-table'>
              <thead>
                <tr>
                  <td>TUP ID</td>
                  <td>Name</td>
                  <td>Course</td>
                  <td>Book Issued</td>
                  
                </tr>
              </thead>
              <tbody>
                {borrower.length>0?borrower.map((item,key)=>(
                <tr key={key}>
                  <td>{item.tup_id}</td>
                  <td>{item.patron_fname} {item.patron_lname}</td>
                  <td>{item.course}</td>
                  <td><pre style={{whiteSpace: "pre-wrap"}}><span>{item.borrowed_books}</span></pre></td>
                </tr> )):
                <tr>
                  <td colSpan="7">No records available</td> 
                </tr>}
              </tbody>
            </table>
            <div className='see-all-box'><Link to='/patrons'><button className='see-all-button'>See all</button></Link></div>
          </div>
          {/* book list */}
          <div className='borrowers-list'>
            <div className='heading'>
              <h5>Books List</h5>
                <Link to={'/add-item'}>
                  <button className='btn list-add-button'>
                    <FontAwesomeIcon icon={faPlus}/>
                    Add new
                  </button>
                </Link>
            </div>
            <table className='borrower-table'>
              <thead>
                <tr>
                  <td>ID</td>
                  <td>Title</td>
                  <td>Author</td>
                  <td>Quantity</td>
          
                </tr>
              </thead>
              <tbody>
                {addedBooks?addedBooks.length>0?addedBooks.map((item,key)=>(
                  <tr key={key}>
                    <td>{item.resource_id}</td>
                    <td>{item.resource_title}</td>
                    <td>{item.authors}</td>
                    <td>{item.resource_quantity}</td>     
                  </tr> )):
                    <tr>
                      <td colSpan="7">No records available</td> 
                    </tr>:
                ''}
              </tbody>
            </table>
            <div className='see-all-box'><Link to={'/catalog'}><button className='see-all-button'>See all</button></Link></div>
          </div>
      </div>

      {/* overdue book list */}
      <div className='borrowers-list'>
            <div className='heading'>
              <h5>Overdue Book List</h5>
            </div>
            <table className='borrower-table'>
              <thead>
                <tr>
                  <td>TUP ID</td>
                  <td>Borrowers Name</td>
                  <td>Book ID</td>
                  <td>Title</td>
                  <td>Overdue</td>
                  <td>Status</td>
                  <td>Fine</td>
                </tr>
              </thead>
              <tbody>
                {overdueBooks.length>0?overdueBooks.map((book, index) => (
                  <tr key={index}>
                    <td>{book.tup_id}</td>
                    <td>{book.patron_fname} {book.patron_lname}</td>
                    <td>{book.resource_id}</td>
                    <td>{book.resource_title}</td>
                    <td>{book.overdue_days} days</td>
                    <td>overdue</td>
                    <td>{book.overdue_days * 20} pesos</td>
                    </tr>
                )):<tr>
                <td colSpan="7">No records available</td> 
              </tr>}
              </tbody>
            </table>
            <div className='see-all-box'><Link to={'/catalog'}><button className='see-all-button'>See all</button></Link></div>
            {/* <div className='table-pages'>
              <img src={left} alt="" />
              <div className='page-numbers'>
              <div className='page-number current-page'>3</div>
              <div className='page-number'>2</div>
              <div className='page-number'>1</div>
              </div>
              <img src={right} alt="" />
            </div> */}
          </div>

      {/* book issued */}
      <div className='borrowers-list'>
            <div className='heading'>
              <h5>Books issued</h5>
            </div>
            <table className='borrower-table'>
              <thead>
                <tr>
                  <td>TUP ID</td>
                  <td>Name</td>
                  <td>Title</td>
                  <td>Return Date</td>
                </tr>
              </thead>
              <tbody>
              {checkoutData.length>0?checkoutData.map((item, index) => (
                    <tr key={index}>
                        <td>{item.tup_id}</td>
                        <td>{item.patron_fname} {item.patron_lname}</td>
                        <td>{item.resource_title}</td>
                        <td>{new Date(item.checkout_due).toLocaleDateString("en-CA")}</td>
                    </tr>
              )):<tr>
              <td colSpan="7">No records available</td> 
            </tr>}
              </tbody>
            </table>
            <div className='see-all-box'><Link to={'/catalog'}><button className='see-all-button'>See all</button></Link></div>
          </div>
    </div>
  )
}

export default Dashboard
