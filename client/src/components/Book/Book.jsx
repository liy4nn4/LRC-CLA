import React, { useEffect, useState } from 'react'
import book1 from '../../assets/OPAC/photos/book1.jpg'
import './Book.css'


const Book = ({isSearch, isView, item}) => {
  console.log(item)
  const authors = item?item.author_name.split(','):''
  const [preview,setPreview] =useState()

  useEffect(()=>{
    if(!item) return;

    let objectUrl;
    try{
        objectUrl = URL.createObjectURL(item.book_cover);
        setPreview(objectUrl);
    }catch{
        const blob = new Blob([new Uint8Array(item.book_cover.data)], { type: 'image/jpeg' });
        objectUrl = URL.createObjectURL(blob);
        setPreview(objectUrl)
    }

     // Cleanup function to revoke the Object URL
     return () => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
      };
  },[item])
  
  return (
    <div className={isSearch?'search-book-container':'book-container'}>
        <img src={preview} alt="" className={isSearch?'search-book':''}/>
        {isView?'':<div>
            <p className='title'>{item?item.resource_title:''}</p>
            <p className='author'>By {Array.isArray(authors)?authors[0]:''}</p>
        </div>}
        
        
    </div>
  )
}

export default Book
