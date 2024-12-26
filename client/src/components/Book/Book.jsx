import React from 'react'
import book1 from '../../assets/OPAC/photos/book1.jpg'
import './Book.css'

const Book = ({isSearch, isView}) => {
  return (
    <div className={isSearch?'search-book-container':'book-container'}>
        <img src={book1} alt="" className={isSearch?'search-book':''}/>
        {isView?'':<div>
            <p className='title'>Book title</p>
            <p className='author'>By Book Author</p>
        </div>}
        
        
    </div>
  )
}

export default Book
