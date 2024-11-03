import React, { useEffect, useState } from 'react';
import './AddItem.css';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CatalogInfo from '../CatalogInfo/CatalogInfo';
import Cataloging from '../Cataloging/Cataloging';
import axios from 'axios';
import Loading from '../Loading/Loading';
import { initDatabase,getTypeOffline,getStatusOffline,saveResourcesOffline,getPublishersOffline, getGenreOffline, getAuthorsOffline} from '../../indexedDb';


const AddItem = () => {
    const navigate = useNavigate()
    // initialize offline database
    const [isDbInitialized, setDbInitialized] = useState(false);
    const [disabled,setDisabled] = useState(false)
    const [type, setType] = useState('');
    const [bookData, setBookData] = useState({
        mediaType: '1',
        authors: [],
        genre: [],
        isCirculation: false,
        publisher_id: 0,
        publisher: ''
    });
    const [error, setError] = useState({
        error: 'error'
    });
    const [publishers, setPublishers] = useState([]);
    // authorlist and adviserlist are for the <Select>. These are the options to be displayed
    const [authorList, setAuthorList] = useState([]);
    const [adviserList, setAdviserList] = useState([]);
    const [genreList, setGenreList] = useState([])
    // for loading modal
    const [loading,setLoading] = useState(false)
    const [resourceType,setResourceType]=useState([])
    // Reset bookData when mediaType changes

    //this is for viewing resource purposes
    const {resourceId} = useParams();
    //console.log(resourceId)
    const [resourceStatus,setResourceStatus] = useState([])

    useEffect(() => {
        if (bookData.mediaType== 1) {
            setBookData({
                mediaType: bookData.mediaType, // keep the changed mediaType
                authors: [],
                genre: [],
                isCirculation: false,
                publisher_id: 0,
                publisher: ''
            });
        } else {
            setBookData({
                mediaType: bookData.mediaType, // keep the changed mediaType
                authors: [],
                isCirculation: false,
            });
        }
    }, [bookData.mediaType]);

    useEffect(()=>{
        console.log('AddItem Component Mounted')

        // handles system if you're offline
        const offlineHandler = ()=>{
            alert("You're Offline")
            //initialize indexedDb database first
            if(!isDbInitialized){
                //initdatabase accepts a callback. so whatever is inside the callback ay maeexecute after maginitialize ng database
                initDatabase(()=>{
                    setDbInitialized(true)
                    getTypeOffline(setResourceType)
                    getStatusOffline(setResourceStatus)
                    getGenreOffline(setGenreList)
                    getPublishersOffline(setPublishers)
                    getAuthorsOffline(setAuthorList)
                })
            }else{
                getTypeOffline(setResourceType)
                getStatusOffline(setResourceStatus)
                getGenreOffline(setGenreList)
                getPublishersOffline(setPublishers)
                getAuthorsOffline(setAuthorList)
            }
        }

        //checks if your're offline
        window.addEventListener('offline', offlineHandler)

        if(!navigator.onLine){
            offlineHandler()
        }

        return () => {
            window.removeEventListener('offline', offlineHandler);
            
        };
    },[])

    // Fetch publishers when component mounts
    // useEffect(() => {
    //     console.log('additem mounted');
    
    //     // Define handlers
    //     const offlineHandler = () => {
    //         alert("You're offline")
    //         if (!isDbInitialized) {
    //             initDatabase(() => {
    //                 setDbInitialized(true);
    //                 getTypeOffline(setResourceType);
    //                 getStatusOffline(setResourceStatus);
    //                 getPublishersOffline(setPublishers)
    //             });
    //         } else {
    //             getTypeOffline(setResourceType);
    //             getStatusOffline(setResourceStatus);
    //         }
    //         console.log('not connected to internet');
    //     };
    
    //     const onlineHandler = () => {
    //         alert("You're online")
    //         getPublishers();
    //         getAuthors();
    //         getType();
    //         getAdvisers();
    //         getStatus()
    //         console.log('connected to internet');
    //     };
    
    //     // Check online status immediately on mount
    //     if (navigator.onLine) {
    //         onlineHandler();
    //     } else {
    //         offlineHandler();
    //     }
    
    //     // Attach event listeners for dynamic online/offline handling
    //     window.addEventListener('offline', offlineHandler);
    //     window.addEventListener('online', onlineHandler);
    
    //     // Cleanup listeners on component unmount
    //     return () => {
    //         window.removeEventListener('offline', offlineHandler);
    //         window.removeEventListener('online', onlineHandler);
    //     };
    // }, []);

    // this gets executed every first render and everytime disabled usestate changes
    // useEffect(()=>{
    //     if(disabled){
    //         viewResource()
    //     }
    // },[disabled])

    //get specific resource for viewing purposes
    // const viewResource = async ()=>{
    //     try{
    //         const response = await axios.get(`http://localhost:3001/resource/${resourceId}`).then(res=>res.data[0]);
    //         console.log(response)
            
    //     }catch(err){
    //         console.log(err.message)
    //     }
       
    // }


    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookData({ ...bookData, [name]: value });
        formValidation();
    };

    // Add author
    const addAuthor = (author) => {
        if (author.length !== 1) {
            if(!bookData.authors.includes(author)){
                 setBookData((prevData) => ({
                    ...prevData,
                    authors: [...prevData.authors, author]
                }));
                return true
            }else{
                console.log('you inserted it already!')
            }
           
        } else {
            console.log('Please enter valid author data');
        }
    };

    // delete author 
    const deleteAuthor = (index)=>{
        //(_,i) is the index of each element in authors
        //pag true ung condition marereturn sa updatedAuthors
        setBookData(prevData => ({
            ...prevData,
            authors: prevData.authors.filter((_, i) => i !== index)
          }));
    }

    // delete adviser 
    const deleteAdviser = ()=>{
       
        setBookData(prevData => ({
            ...prevData,
            adviser: ''
        }));
    }

    // Add publisher
    const addPublisher = (publisher) => {
        if (publisher.length !== 1) {
            setBookData((prevData) => ({
                ...prevData,
                publisher
            }));
        } else {
            console.log('Please enter valid publisher data');
        }
    };

    // Add adviser
    const addAdviser = (adviser) => {
        console.log(adviser)
        setBookData((prevdata)=>({
            ...prevdata,
            adviser: adviser
        }))
    };

    // Handle chosen genre
    const addGenre = (selectedGenre) => {
        const genre = selectedGenre.map(item => item.value);
        setBookData((prevData) => ({
            ...prevData,
            genre
        }));
    };

    // Handle file input
    const handleFileChange = (e) => {
        const file = e.target.files[0];  // Get the first file from the input
        console.log(file)
        if (file) {  // Check if a file was selected
            const blob = new Blob([file], { type: file.type });  // Create a Blob from the file

            setBookData((prevData) => ({
                ...prevData,
                file: blob  // Store the Blob in the bookData state
            }));
        }
    };


    // Form validation
    const formValidation = () => {
        const err = {};

        if (!bookData.quantity || bookData.quantity === 0) {
            err.quantity = 'Please enter quantity';
        }
        if (!bookData.status) {
            err.status = 'Please select status';
        }
        if (!bookData.title || bookData.title.length === 0) {
            err.title = 'Please enter title';
        }
        if (!bookData.description) {
            err.description = 'Please enter description';
        }
        if (!bookData.department) {
            err.department = 'Please select department';
        }
        if (!bookData.course) {
            err.course = 'Please select course';
        }

        if (bookData.mediaType === '1') {
            if (!bookData.file) {
                err.file = 'Please select cover';
            }
            if (!bookData.genre || bookData.genre.length === 0) {
                err.genre = 'Please select genre';
            }
            if (!bookData.authors || bookData.authors.length === 0) {
                err.authors = 'Please specify author/s';
            }
            if (!bookData.isbn) {
                err.isbn = 'Please enter ISBN';
            }
            if (bookData.publisher_id === 0 && bookData.publisher === '') {
                err.publisher = 'Please enter publisher';
            }
            if (!bookData.publishedDate) {
                err.publishedDate = 'Please enter publish date';
            }
        }else if(bookData.mediaType==='2'||bookData.mediaType==='3'){
            if (!bookData.file) {
                err.file = 'Please select cover';
            }
            if (!bookData.authors || bookData.authors.length === 0) {
                err.authors = 'Please specify author/s';
            }
            if(!bookData.volume){
                err.volume = 'Please enter volume'
            }
            if(!bookData.issue){
                err.issue = 'Please enter issue'
            }
            if (!bookData.publishedDate) {
                err.publishedDate = 'Please enter publish date';
            }
        }else if(bookData.mediaType==='4'){
            if (!bookData.authors || bookData.authors.length === 0) {
                err.authors = 'Please specify author/s';
            }
            if(!bookData.adviser){
                err.adviser = 'Please specify adviser';

            }
            if (!bookData.publishedDate) {
                err.publishedDate = 'Please enter publish date';
            }
        }

        setError(err);

        return Object.keys(err).length === 0;
    };

    const handleSaveResourceOffline = () => {
        console.log('Save Resource Offline');
        try {
            //pass setPublishers to retrieve/load latest publishers in choices
            saveResourcesOffline(bookData,setPublishers,setAuthorList,setAdviserList)
            alert("Resource saved successfully")
            //reset input field
            setBookData({
                mediaType: 'book',
                authors: [],
                genre: [],
                isCirculation: false,
                publisher_id: 0,
                publisher: '',
            });
            //initialize error
            setError({error:'error'})
            
            console.log(publishers)
            navigate('/catalog')
        } catch (err) {
            console.error(err.message);
            setLoading(false); // Stop loading if there was an error
        }
    };
    

    // Handle resource save
    // const handleSaveResource = async () => {
  
    //     if (formValidation() === true) {
    //         setLoading(true)
    //         try {
    //             // Create a new FormData object
    //             const formData = new FormData();
    
    //             // If the file is a URL string, fetch it as a Blob
    //             if (typeof bookData.file === 'string') {
    //                 const response = await fetch(bookData.file, { mode: 'no-cors' });
    //                 const blob = await response.blob(); // Convert response to Blob
    
    //                 // Set the blob to bookData.file directly
    //                 //It spreads the existing properties of prevData and sets the file property to the newly fetched blob.
    //                 setBookData((prevData) => ({
    //                     ...prevData,
    //                     file: blob,
    //                 }));

    //                 // Use a temporary state to wait for the blob to be set
    //                 //create a new object that includes all properties of bookdata but replaces the file property to blob
    //                 const updatedBookData = {
    //                     ...bookData,
    //                     file: blob,
    //                 };
    
    //                 // Append all data to formData using updatedBookData instead of bookData
    //                 Object.entries(updatedBookData).forEach(([key, value]) => {
    //                     formData.append(key, value);
    //                 });
    //             } else {
    //                 // If it's not a URL, just append the current bookData
    //                 Object.entries(bookData).forEach(([key, value]) => {
    //                     formData.append(key, value);
    //                 });
    //             }

    //             //if online
    //             if(navigator.onLine){
    //                 console.log('save online')
    //                 // Send data to the endpoint
    //                 await axios.post('http://localhost:3001/save', formData);
    //                 console.log('Resource saved successfully');

    //                 //close loading
    //                 setLoading(false)
    //                 // Reset bookData if saved successfully
    //                 setBookData({
    //                     mediaType: 'book',
    //                     authors: [],
    //                     genre: [],
    //                     isCirculation: false,
    //                     publisher_id: 0,
    //                     publisher: ''
    //                 });

    //                 window.location.reload(); // Optionally reload the page
    //             }else{
    //                 console.log('save offline')
    //                 saveResourcesOffline(bookData)
    //                 setLoading(false)
    //                 // Reset bookData if saved successfully
    //                 setBookData({
    //                     mediaType: 'book',
    //                     authors: [],
    //                     genre: [],
    //                     isCirculation: false,
    //                     publisher_id: 0,
    //                     publisher: ''
    //                 });
    //                 //retrieve latest publisher to display todropdown
    //                 getPublishersOffline(setPublishersOffline)
    //             }
    //         } catch (err) {
    //             console.log('Error saving resource:', err.message);
    //         }
    //     } else {
    //         console.log("Please enter complete information");
    //     }
    // };
    
    // Handle toggle buttons
    const handleToggle = (e) => {
        const { name, checked } = e.target;
        setBookData((prevData) => ({
            ...prevData,
            [name]: checked
        }));
    };

    // Fetch publishers from the backend
    // const getPublishers = async () => {
    //     console.log('publishers online')
    //     const pubs = [];
    //     try {
    //         const response = await axios.get('http://localhost:3001/publishers');
    //         console.log(response.data)
    //         response.data.forEach(item => {
    //             pubs.push({
    //                 value: item.pub_id,
    //                 label: item.pub_name
    //             });
    //         });
    //         setPublishers(pubs);
    //     } catch (err) {
    //         console.log(err.message);
    //     }
    // };

    // Fetch publishers from the backend
    // const getAuthors = async () => {
    //     const auth = [];
    //     try {
    //         const response = await axios.get('http://localhost:3001/authors');
    //         response.data.forEach(item => {
    //             auth.push({
    //                 value: `${item.author_fname} ${item.author_lname}`,
    //                 label: `${item.author_fname} ${item.author_lname}`
    //             });
    //         });
    //         setAuthorList(auth);
    //     } catch (err) {
    //         console.log(err.message);
    //     }
    // };

    //Fetch advisers
    // const getAdvisers = async () => {
    //     const adv = [];
    //     try {
    //         const response = await axios.get('http://localhost:3001/advisers');
    //         response.data.forEach(item => {
    //             adv.push({
    //                 value: `${item.adviser_fname} ${item.adviser_lname}`,
    //                 label: `${item.adviser_fname} ${item.adviser_lname}`
    //             });
    //         });
    //         setAdviserList(adv);
    //     } catch (err) {
    //         console.log(err.message);
    //     }
    // };

    // fetch resourceType ( book, journal, newsletter, thesis)
    // const getType = async()=>{
    //     try {
    //         const response = await axios.get('http://localhost:3001/type').then(res=>res.data);
    //         //console.log(response)
    //         setResourceType(response)
    //     } catch (err) {
    //         console.log(err.message);
    //     }
    // };

    // fetch status (available,lost,damaged)
    // const getStatus = async()=>{
    //     try {
    //         const response = await axios.get('http://localhost:3001/status').then(res=>res.data);
    //         //console.log(response)
    //         setResourceStatus(response)
    //     } catch (err) {
    //         console.log(err.message);
    //     }
    // };
    

    console.log(error);
    console.log(bookData);
    console.log(Object.values(error).length);
    
    return (
        <div className='add-item-container'>
            <h1 className='m-0'>Cataloging</h1>

            <div className='add-item-path-button'>
                <Link to='/catalog'>
                    <button className='btn add-item-back-button'>
                        <i className="fa-solid fa-arrow-left"></i>
                        Back
                    </button>
                </Link>
                <div className="add-item-path">
                    <p>Cataloging / <span>Add new Item</span></p>
                </div>
            </div>

            <div className='item-information'>
                <CatalogInfo
                    disabled={disabled}
                    handleChange={handleChange}
                    bookData={bookData}
                    addAuthor={addAuthor}
                    setType={setType}
                    addGenre={addGenre}
                    addAdviser={addAdviser}
                    setBookData={setBookData}
                    handleFileChange={handleFileChange}
                    formValidation={formValidation}
                    error={error}
                    publishers={publishers}
                    deleteAuthor={deleteAuthor}
                    authorList={authorList}
                    resourceType={resourceType}
                    adviserList={adviserList}
                    deleteAdviser={deleteAdviser}
                    resourceStatus={resourceStatus}
                    isDbInitialized={isDbInitialized}
                    genreList={genreList}
                />
            </div>

            <div className="cataloging">
                <Cataloging
                    disabled={disabled}
                    handleChange={handleChange}
                    bookData={bookData}
                    handleToggle={handleToggle}
                    formValidation={formValidation}
                    error={error}
                    isDbInitialized={isDbInitialized}
                />
            </div>

            {disabled?<div className='edit-btn-cont'><button className="btn edit-item">
                    Edit
                </button></div>:<div className="cancel-save">
                <button className="btn add-item-cancel">
                    Cancel
                </button>
                <button className="btn add-item-save" onClick={handleSaveResourceOffline} disabled={Object.values(error).length>=1}>
                    <i className="fa-regular fa-floppy-disk"></i>
                    <span>Save</span>
                </button>
            </div>}
            
            <Loading loading={loading}/>
        </div>
    );
};

export default AddItem;
