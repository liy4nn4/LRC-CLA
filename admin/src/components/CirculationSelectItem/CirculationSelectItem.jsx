import React, { useState, useEffect } from 'react';
import './CirculationSelectItem.css';
import { Link, useNavigate, useParams} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBarcode, faPlus, faTrashCan, faX, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const CirculationSelectItem = () => {
  const navigate = useNavigate();
  const {id} = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const [selectedItems, setSelectedItems] = useState(JSON.parse(localStorage.getItem('selectedItems')) || []);
  
    //const selectedItems = location.state?.selectedItems || [];

  // Fetch suggestions from the database
  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      console.log(query)
      const response = await axios.get(`http://localhost:3001/api/books/search`, {
        params: { query },
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Handle typing in the input fields
  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSuggestions(query);
    if(query === ""){
      setSuggestions("")
    }
  };

  // Add item to the selected list
  const handleAddItem = (item) => {
    // Check if the item is already added
    const exists = selectedItems.find((i) => i.resource_id === item.resource_id);
    if (!exists) {
      setSelectedItems([...selectedItems, item]);
      
    }
    
    setSearchQuery(''); // Clear input field
    setSuggestions([]); // Clear suggestions
  };

  useEffect(() => {
    console.log(selectedItems);
    console.log(id)
  }, [selectedItems]);

  // Remove item from the selected list
  const handleRemoveItem = (id) => {
    setSelectedItems(selectedItems.filter((item) => item.resource_id !== id));
  };

  // Clear all selected items
  const handleClearItems = () => {
    setSelectedItems([]);
  };

  return (
    <div className='circ-select-item-container'>
      <h1>Circulation</h1>

      {/* Path and back */}
      <div className="back-path">
        <button onClick={() => navigate(-1)} className="btn">Back</button>
        <p>Circulation / Select patron / <span>Select item</span></p>
      </div>

      <div className="row add-items">
        {/* Scan or manual */}
        <div className="col scan-manual">
          {/* Scan barcode */}
          <div className="barcode">
            <FontAwesomeIcon icon={faBarcode} className='icon' />
            <p>Scan items in the scanner <br />to be checked out</p>
          </div>
          <p>No barcode available? Input manually instead</p>

          {/* Manual input for ISBN */}
          <div className='circ-info'>
            <label htmlFor="">ISBN / Title</label>
            <input
              type="text"
              placeholder='Enter ISBN or Title'
              value={searchQuery}
              onChange={handleInputChange}
            />
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="suggestions">
              {suggestions.map((item) => (
                <div
                  key={item.resource_id}
                  className="suggestion-item"
                  onClick={() => handleAddItem(item)}
                >
                  <span>{item.resource_title} (ISBN: {item.book_isbn})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items added */}
        <div className="col summary">
          <div>
            {/* Header */}
            <div className="header">
              <h5>Items added (<span>{selectedItems.length}</span>)</h5>
              <button className="btn" onClick={handleClearItems}>
                <FontAwesomeIcon icon={faTrashCan} />
                Clear items
              </button>
            </div>

            {/* Selected items */}
            <div className='inner overflow-y-auto'>
              {selectedItems.map((item) => (
                <div className="item row mt-2 " key={item.resource_id}>
                  {/* Cover */}
                  <div className="col-3 cover">
                    <img src={`data:image/jpeg;base64,${item.cover}` || 'https://via.placeholder.com/100'} alt={item.title} />
                    
                  </div>
                  {/* Item info */}
                  <div className="col-8 info">
                    <p className='ttle'>{item.resource_title}</p>
                    <p className='qnty'>Quantity: <span>1{/* {item.resource_quantity} */}</span></p>
                  </div>
                  {/* Remove item button */}
                  <div className="col-1 remove" onClick={() => handleRemoveItem(item.resource_id)}>
                    <FontAwesomeIcon icon={faX} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Proceed to checkout */}
          <div className='checkout'>
            <Link to='/circulation/patron/item/checkout'>
              <button className="btn checkout-btn" onClick = { () => {localStorage.setItem('selectedItems', JSON.stringify(selectedItems)); localStorage.setItem('id', id)}}>
                Proceed to checkout
                <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CirculationSelectItem;
