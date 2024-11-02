import React, { useEffect, useState } from 'react'
import './Dashboard.css'
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
  // sample data
  const [user,setUser] = useState({
    //creates a new array whereit only has a day
    labels: UserData.map((data)=>data.day),
    datasets:[{
      label:"Visitors",
      data:  UserData.map((data)=>data.visitors),
      backgroundColor: '#94152B',
    },{
      label:"Borrowers",
      data:  UserData.map((data)=>data.borrowers),
      backgroundColor: '#948F15',
    },]
  })

  const [dateTime,setDateTime] = useState(new Date());
  const [dropdown, setDropdown]= useState(false)

  useEffect(() => {
    //setInterval throws an id na pwede natin gamitin to stop the interval
    const intervalId = setInterval(()=>setDateTime(new Date()), 1000 )
    // iccall lang ng react ung cleanup kapag lumipat kana ng component
     return function cleanup() {
        //stops the interval
         clearInterval(intervalId)
    }
},[]);

  const toggleDropdown = ()=>{
    setDropdown(prev=>!prev)
  }

  return (
    <div className='dashboard-container'>

      {/* dashboard heading */}
      <div className="dashboard-heading">
        {/* Goodmorning,admin */}
        <p className='dashboard-heading-text'>{dateTime.getHours()>=1 && dateTime.getHours()<12?'Good morning, ':dateTime.getHours()>=12&&dateTime.getHours()<17?'Good afternoon, ':'Good evening,'} <span>admin</span></p>
        
        {/* filter button */}
        {/* <div>
          <button className='dashboard-dropdown' onClick={toggleDropdown}>
            Today <img src={dropdown_black} alt="" className='dashboard-dropdown-icon'/>
          </button>
          <div className={`dashboard-dropdown-list ${dropdown?'show-dash-dropdown':''}`}>
            <p>List 1</p>
            <p>List 2</p>
          </div>
        </div> */}
        <div>
        <div class="dropdown">
                  <button class="btn cat-dropdown dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Today
                  </button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#">Action</a></li>
                    <li><a class="dropdown-item" href="#">Another action</a></li>
                    <li><a class="dropdown-item" href="#">Something else here</a></li>
                  </ul>
                </div>
        </div>
        
      </div>

      {/* dashboard boxes */}
      <div className='dashboard-overview'>
        {/* total visitors */}
        <div className="dash-box">
          <p className='total-visitors-p'>Total Visitors</p>
          <div className='visitor-count-icon'>
            <p className='total-visitors-count'>10</p>
            <img src={visitors} alt="" className='total-visitors-icon'/>
          </div>
        </div>

        {/* borrowed books */}
        <div className="dash-box">
          <p className='borrowed-books-p'>Borrowed Books</p>
          <div className='borrowed-count-icon'>
            <p className='borrowed-books-count'>10</p>
            <img src={borrowed} alt="" className='borrowed-books-icon'/>
          </div>
        </div>
      </div>

      {/* borrowers and books list */}
      <div className="borrowers-books-list">
        {/* borrower list box */}
        <div className='borrowers-list'>
          <div className='borrowers-heading'>
            <p className='list-heading'>Borrowers List</p>
            <button className='btn list-add-button'>
              <img src={add} alt="" className='add-icon'/>
              Add new
            </button>
          </div>
          <table className='borrower-table'>
            <tr>
              <th>TUP ID</th>
              <th>Name</th>
              <th>Course</th>
              <th>Book Issued</th>
              <th></th>
            </tr>
            <tr>
              <td>TUPM-21-0220</td>
              <td>Pauleen Dingcong</td>
              <td>BSIT-NS</td>
              <td>2</td>
              <td><button className='more-button'><img src={more} alt="" /></button></td>
            </tr>
          </table>
          <div className='see-all-box'><button className='see-all-button'>See all</button></div>
        </div>
        {/* book list box */}
        <div className='books-list'>
          <div className='books-heading'>
            <p className='list-heading'>Books List</p>
            <button className='btn list-add-button'>
              <img src={add} alt="" className='add-icon'/>
              Add new
            </button>
          </div>
          <table className='book-table'>
            <tr>
              <th>Book ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Copies Available</th>
              <th></th>
            </tr>
            <tr>
              <td>#B-10021-30</td>
              <td>Happiness At Work</td>
              <td>Jessica Pryce-Jones</td>
              <td>2</td>
              <td><button className='more-button'><img src={more} alt="" /></button></td>
            </tr>
          </table>
          <div className='see-all-box'><button className='see-all-button'>See all</button></div>
        </div>        

          
      </div>

       {/* Popular choices */}
       <div className="popular-choices">
          <p className='popular-choices-text'>Popular Choices</p>
          <div className="popular-books">
            <img src="" alt="" />
            <img src="" alt="" />
            <img src="" alt="" />
            <img src="" alt="" />
            <img src="" alt="" />
          </div>
        </div>

        {/* overdue book list */}
        <div className="overdue-book-list">
          <div className='overdue-text-table'>
            <p className='overdue-book-text'>Overdue Book List</p>
              <table className='overdue-book-table'>
                  <tr>
                    <th>TUP ID</th>
                    <th>Borrowers Name</th>
                    <th>Book ID</th>
                    <th>Title</th>
                    <th>Overdue</th>
                    <th>Status</th>
                    <th>Fine</th>
                  </tr>
                  <tr>
                    <td>TUPM-01-0203</td>
                    <td>Giolliana Plandez</td>
                    <td>Happiness At Work</td>
                    <td>Jessica Pryce-Jones</td>
                    <td>3 days</td>
                    <td className='overdue-delay'>Delay</td>
                    <td>₱ <span>60.00</span></td>
                  </tr>
                </table>
          </div>
          {/* pagination */}
          <div className='table-pages'>
            <img src={left} alt="" />
            <div className='page-numbers'>
              <div className='page-number current-page'>3</div>
              <div className='page-number'>2</div>
              <div className='page-number'>1</div>
            </div>
            <img src={right} alt="" />
          </div>
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
                <th>Title</th>
                <th>Return Date</th>
                <th></th>
              </tr>
              <tr>
                <td>TUPM-01-0203</td>
                <td>A Theory of Justice</td>
                <td>0/0/0</td>
                <td><button className='more-button'><img src={more} alt="" /></button></td>
              </tr>
            </table>
            <div className='see-all-box'><button className='see-all-button'>See all</button></div>            
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
