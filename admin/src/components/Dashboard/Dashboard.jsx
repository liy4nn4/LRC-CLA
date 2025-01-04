import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Dashboard.css'
import { Link,  useNavigate  } from 'react-router-dom'
import dropdown_black from '../../assets/Management System/dashboard/dropdown-black.svg'
import visitors from '../../assets/Management System/dashboard/total-visitors.svg'
import borrowed from '../../assets/Management System/dashboard/total-borrowed.svg'
import add from '../../assets/Management System/dashboard/add.svg'
import more from'../../assets/Management System/dashboard/more.svg'
import left from'../../assets/Management System/dashboard/arrow-left-black.svg'
import right from'../../assets/Management System/dashboard/arrow-right-black.svg'

import {UserData} from '../../Data'
import VisitorsBorrowersStatistics from '../VisitorsBorrowersStatistics/VisitorsBorrowersStatistics'

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
  const [uname, setUname] = useState(null)
  let navigate = useNavigate();
  const weeklyLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [booksData, setBooksData] = useState([])
  const [jnData, setJnData] = useState([])
  const [visitStats, setVisitStats] = useState([])
  // const booksData = [50, 65, 80, 45, 90, 100]; // Example: Borrowed books data
  // const journalsData = [20, 30, 50, 25, 40, 60]; // Example: Borrowed journals data

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
        data: jnData, // Updated API
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
    // Fetch session or user data from the server to get the username
    const getUsername = async () => {
        try {
            const response = await axios.get('http://localhost:3001/session', { withCredentials: true });
            if (response.data.user) {
                setUname(response.data.user.username); // Assuming the role is returned from session
            }
        } catch (err) {
            console.log('Error fetching session data', err);
        }
    };

    getBookTrends()
    getJnTrends()
    visitorStats()
    getUsername();
  }, []);

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

  //get book trends
  const getBookTrends = async()=>{
    try{
      const response = await axios.get(`http://localhost:3001/borrowed/book/trends`)
      const books = response.data;
      console.log(books)

      const borrowingTrends = books.map(item=>
        item.total_books_borrowed
      )
      setBooksData(borrowingTrends)
      
    }catch(err){
      console.log('Cannot get borrowed book trends. An error occurred: ', err.message)
    }
  }

  //get journal and newsletter trends
  const getJnTrends = async()=>{
    try{
      const response = await axios.get(`http://localhost:3001/borrowed/jn/trends`)
      const jn = response.data;
      console.log(jn)

      const jnTrends = jn.map(item=>
        item.total_jn_borrowed
      )
      setJnData(jnTrends)
      
    }catch(err){
      console.log('Cannot get borrowed book trends. An error occurred: ', err.message)
    }
  }

  const visitorStats = async()=>{
    try{
      const response = await axios.get(`http://localhost:3001/visitor/stats`)
      const visitors = response.data;
      console.log(visitors)

      const visitorsStats = visitors.map(item=>
        item.total_attendance
      )
      setVisitStats(visitorStats)
      
    }catch(err){
      console.log('Cannot get borrowed book trends. An error occurred: ', err.message)
    }
  }

  //total visitors
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

  //total borrowed
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

  //books list
  const getAddedBooks = async()=>{
    try {
      const response = await axios.get(`http://localhost:3001/getAddedBooks`).then(res=>res.data);
      setAddedBooks(response)
      console.log(response)
    } catch (err) {
        console.log(err.message);
    }
  }

  //borrower
  const getBorrowers = async()=>{
    try {
      const response = await axios.get(`http://localhost:3001/getBorrowers`).then(res=>res.data);
      setBorrower(response)
      console.log(response)
    } catch (err) {
        console.log(err.message);
    }
  }
  
  //popular book
  const fetchCovers = async () => {
    try {
        const response = await axios.get(`http://localhost:3001/getCover`);
        setCovers(response.data);
    } catch (error) {
        console.error('Error fetching book covers:', error);
    }
  }

  //overdue books
  const fetchOverdueBooks = async () => {
      try {
          const response = await axios.get(`http://localhost:3001/api/overdue-books`);
          setOverdueBooks(response.data);
      } catch (error) {
          console.error('Error fetching overdue books:', error);
      }
  };

  //books issued
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
        <p className='dashboard-heading-text'>{dateTime.getHours()>=1 && dateTime.getHours()<12?'Good morning, ':dateTime.getHours()>=12&&dateTime.getHours()<17?'Good afternoon, ':'Good evening,'} <span>{uname}</span></p>
      </div>

      {/* dashboard boxes */}
      <div className='dashboard-overview'>
        {/* total visitors */}
        <div className="dash-box">
          <p className='total-visitors-p'>Total Visits</p>
          <div className='visitor-count-icon'>
            <p className='total-visitors-count'>{totalVisitors}</p>
            <img src={visitors} alt="" className='total-visitors-icon'/>
          </div>
        </div>

        {/* borrowed books */}
        <div className="dash-box">
          <p className='borrowed-books-p'>Borrowed Books</p>
          <div className='borrowed-count-icon'>
            <p className='borrowed-books-count'>{totalBorrowed}</p>
            <img src={borrowed} alt="" className='borrowed-books-icon'/>
          </div>
        </div>
      </div>

      {/* borrowers and books list */}
      <div className="borrowers-books-list">
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
                  <td>{item.borrowed_books}</td>
                </tr> )):
                <tr>
                  <td colSpan="7">No records available</td> 
                </tr>}
              </tbody>
            </table>
            <div className='see-all-box'><Link to='/patrons'><button className='see-all-button'>See all</button></Link></div>
          </div>
          <table className='borrower-table'>
            <tr>
              <th>TUP ID</th>
              <th>Name</th>
              <th>Course</th>
              <th>Book Issued</th>
              <th></th>
            </tr>

            <tbody>
                    {borrower?borrower.length>0?borrower.map((item,key)=>(
                    <tr key={key}>
                        <td>{item.tup_id}</td>
                        <td>{item.patron_fname} {item.patron_lname}</td>
                        <td>{item.course}</td>
                        <td><pre style={{whiteSpace: "pre-wrap"}}><span>{item.borrowed_books}</span></pre></td>
                    </tr> )):
                        <tr>
                            <td colSpan="7">No records available</td> 
                        </tr>:''}
            </tbody>
          </table>
          <div className='see-all-box'><Link to='/patrons'><button className='see-all-button'>See all</button></Link></div>
        </div>
        {/* book list box */}
        <div className='books-list'>
          <div className='books-heading'>
            <p className='list-heading'>Books List</p>
            <Link to={'/add-item'}><button className='btn list-add-button'>
              <img src={add} alt="" className='add-icon'/>
              Add new
            </button></Link>
          </div>
          <table className='book-table'>
            <tr>
              <th>Book ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Copies Available</th>
              <th></th>
            </tr>
            <tbody>
                      {addedBooks?addedBooks.length>0?addedBooks.map((item,key)=>(
                      <tr key={key}>
                          <td>{item.resource_id}</td>
                          <td>{item.resource_title}</td>
                          <td><pre style={{whiteSpace: "pre-wrap"}}><span className='d-flex justify-content-center align-middle m-auto'>{item.authors}</span></pre></td>
                          <td>{item.resource_quantity}</td>
                          
                      </tr> )):
                          <tr>
                              <td colSpan="7">No records available</td> 
                          </tr>:''}
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
            <div className='see-all-box'><Link to={'/circulation'}><button className='see-all-button'>See all</button></Link></div>
            {/* <div className='table-pages'>
              <img src={left} alt="" />
              <div className='page-numbers'>
              <div className='page-number current-page'>3</div>
              <div className='page-number'>2</div>
              <div className='page-number'>1</div>
            </div>
            <img src={right} alt="" />
          </div>*/}
        </div>

        {/* books issued and statistics */}
        <div className="books-issued-statistics">
          <div className="books-issued">
            <div className='book-issued-heading'>
              <p className='list-heading'>Books Issued</p>
              <button className='btn list-add-button'>
                <img src={add} alt="" className='add-icon'/>
                Add new
              </button>
            </div>
            <table className='book-issued-table'>
              <tr>
                <th>TUP ID</th>
                <th>Name</th>
                <th>Title</th>
                <th>Return Date</th>
              </tr>
              
              {checkoutData.map((item, index) => (
                    <tr key={index}>
                        <td>{item.tup_id}</td>
                        <td>{item.patron_fname} {item.patron_lname}</td>
                        <td>{item.resource_title}</td>
                        <td>{new Date(item.checkout_due).toLocaleDateString("en-CA")}</td>
                    </tr>
                ))}
            </table>
            <div className='see-all-box'><Link to={'/circulation'}><button className='see-all-button'>See all</button></Link></div>
          </div>


          {/* visitors and borrowers stats */}
          <div className="statistics">
            <p className='stats-text'>Visitors & Borrowed Statistics</p>
            <div>
              <VisitorsBorrowersStatistics chartData={user}/>
            </div>

          </div>
        </div>



    </div>
  )
}

export default Dashboard
