import React, { useEffect, useState } from 'react';
import './Accounts.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser, faPen, faUserSlash } from '@fortawesome/free-solid-svg-icons';
import CreateUserModal from '../CreateUserModal/CreateUserModal';
import EditUserModal from '../EditUserModal/EditUserModal';
import DeactivateModal from '../DeactivateModal/DeactivateModal';
import ActivateModal from '../ActivateModal/ActivateModal';
import axios from 'axios';
import Loading from '../Loading/Loading';
import ResourceStatusModal from '../ResourceStatusModal/ResourceStatusModal';
import io from 'socket.io-client';

const socket = io('http://localhost:3001'); // Connect to the Socket.IO server

const Accounts = () => {
  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [openEditUser, setEditUser] = useState(false);
  const [openDeactivate, setOpenDeactivate] = useState(false);
  const [openActivate, setOpenActivate] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState({
    fname: '',
    lname: '',
    uname: '',
    role: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [errorEdit, setErrorEdit] = useState({});
  const [statusModal, setStatusModal] = useState(false);
  const [statusModalContent, setStatusModalContent] = useState({ status: '', message: '' });
  const [toEditAccount, setToEditAccount] = useState({});
  const [selectedUname, setSelectedUname] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [pagination, setPagination] = useState(5); // Items per page
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(0); // Total pages
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    userAccounts();
    
    // Listen for updates from the server (via socket)
    socket.on('userUpdated', () => {
      console.log('User updated, refreshing accounts...');
      userAccounts(); // Call userAccounts to refresh the list
    });

    return () => {
      socket.off('userUpdated'); // Cleanup on component unmount
    };
  }, [currentPage]);

  useEffect(()=>{
    if(keyword==''){
      userAccounts(true)
    }
  },[keyword])

  // Fetch user accounts
  const userAccounts = async (resetPage = false) => {
    if (resetPage) {
      setCurrentPage(1);
    }

    setLoading(true);

    const offset = (currentPage - 1) * pagination;

    try {
      const response = await axios.get('http://localhost:3001/accounts', {
        params: {
          limit: pagination,
          offset,
          keyword
        }
      });

      if (response.data) {
        setAccounts(response.data.results);
        setTotalPages(Math.ceil(response.data.totalUsers / pagination)); // Calculate total pages
      }

      console.log(response);
    } catch (err) {
      console.log('Cannot get accounts. An error occurred: ', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create user account
  const createUserAccount = async () => {
    formValidation();
    if (Object.keys(error).length === 0) {
      setLoading(true);
      try {
        const response = await axios.post('http://localhost:3001/accounts/create', account);
        setLoading(false);

        if (response.data.status === 409) {
          setOpenCreateUser(false);
          setStatusModal(true);
          setStatusModalContent({ status: 'duplicated', message: response.data.message });
        } else if (response.data.status === 201) {
          setOpenCreateUser(false);
          setStatusModal(true);
          setStatusModalContent({ status: 'success', message: response.data.message });
        }
      } catch (err) {
        console.log('Cannot create account. An error occurred: ', err.message);
        setLoading(false); // Ensure loading is reset on error
      }
    }
  };

  // Get account to be edited
  const getToEdit = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3001/account/${id}`);
      setToEditAccount({
        id: response.data[0].staff_id,
        fname: response.data[0].staff_fname,
        lname: response.data[0].staff_lname,
        uname: response.data[0].staff_uname,
        role: response.data[0].role_id,
        password: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.log('Cannot get account to be edited. An error occurred: ', err.message);
    }
  };

  // Edit user account
  const editUserAccount = async (id) => {
    formValidationEdit();
    if (Object.keys(errorEdit).length === 0) {
      setLoading(true);
      try {
        console.log('Editing account with id: ', id);
        const response = await axios.put(`http://localhost:3001/account`, toEditAccount);
        if (response.data.status === 201) {
          setEditUser(false);
          setStatusModal(true);
          setStatusModalContent({ status: 'success', message: response.data.message });
        }
      } catch (err) {
        console.log('Cannot edit account. An error occurred: ', err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Deactivate user
  const deactivateUser = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:3001/account/deactivate/${selectedId}`);
      if (response.data.status === 201) {
        setOpenDeactivate(false);
        setStatusModal(true);
        setStatusModalContent({ status: 'success', message: response.data.message });
      }
    } catch (err) {
      console.log('Cannot deactivate user. An error occurred: ', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Activate user
  const activateUser = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:3001/account/activate/${selectedId}`);
      if (response.data.status === 201) {
        setOpenActivate(false);
        setStatusModal(true);
        setStatusModalContent({ status: 'success', message: response.data.message });
      }
    } catch (err) {
      console.log('Cannot activate user. An error occurred: ', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes for account creation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccount((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle input changes for account editing
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setToEditAccount((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleEdit = (id) => {
    setEditUser(true);
    getToEdit(id);
  };

  const handleDeac = (uname, id) => {
    setOpenDeactivate(true);
    setSelectedUname(uname);
    setSelectedId(id);
  };

  const handleAct = (uname, id) => {
    setOpenActivate(true);
    setSelectedUname(uname);
    setSelectedId(id);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      userAccounts();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      userAccounts();
    }
  };

  const handleSearch = (e) => {
    setKeyword(e.target.value);

  };

  // Form validation for creating user account
  const formValidation = () => {
    const err = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

    if (account.fname === '') err.fname = 'Enter first name';
    if (account.lname === '') err.lname = 'Enter last name';
    if (account.uname === '') err.uname = 'Enter username';
    if (account.role === '') err.role = 'Choose a role';
    if (account.password === '') err.password = 'Enter a password';
    else if (!passwordRegex.test(account.password))
      err.password = 'Password must at least have one character, digit, lowercase, and uppercase letter';
    if (account.confirmPassword === '') err.confirmPassword = 'Confirm your password';
    else if (account.password !== account.confirmPassword) err.confirmPassword = 'Passwords do not match';

    setError(err);
  };

  // Form validation for editing user account
  const formValidationEdit = () => {
    const err = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;

    if (toEditAccount.fname === '') err.fname = 'Enter first name';
    if (toEditAccount.lname === '') err.lname = 'Enter last name';
    if (toEditAccount.uname === '') err.uname = 'Enter username';
    if (toEditAccount.role === '') err.role = 'Choose a role';
    if (toEditAccount.password === '') err.password = 'Enter a password';
    else if (!passwordRegex.test(toEditAccount.password))
      err.password = 'Password must at least have one character, digit, lowercase, and uppercase letter';
    if (toEditAccount.confirmPassword === '') err.confirmPassword = 'Confirm your password';
    else if (toEditAccount.password !== toEditAccount.confirmPassword) err.confirmPassword = 'Passwords do not match';

    setErrorEdit(err);
  };

  return (
    <div className="accounts-container">
      <h1>User accounts</h1>

      {/* Search and add */}
      <div className="search-add">
        {/* Search */}
        <div className="search">
          <input
            type="text"
            placeholder="Search"
            value={keyword}
            onChange={handleSearch}
          />
          <button className="btn" onClick={()=>userAccounts(true)}>
            Search
          </button>
        </div>
        {/* Add */}
        <button className="btn create-btn" onClick={() => setOpenCreateUser(true)}>
          <FontAwesomeIcon icon={faPlus} />
          Create account
        </button>
      </div>

      {/* Accounts Table */}
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {accounts.length > 0
            ? accounts.map((item) => (
                <tr key={item.staff_id}>
                  <td>{item.staff_fname}</td>
                  <td>{item.staff_lname}</td>
                  <td>{item.staff_uname}</td>
                  <td>{item.role_name}</td>
                  <td className="action">
                    {/* Edit user */}
                    <button className="btn edit-btn" onClick={() => handleEdit(item.staff_id)}>
                      <FontAwesomeIcon icon={faPen} />
                      <span>Edit user</span>
                    </button>
                    {/* Deactivate / Activate */}
                    {item.staff_status === 'active' ? (
                      <button className="btn deac-acc-btn" onClick={() => handleDeac(item.staff_uname, item.staff_id)}>
                        <FontAwesomeIcon icon={faUserSlash} />
                        Deactivate user
                      </button>
                    ) : (
                      <button className="btn deac-acc-btn" onClick={() => handleAct(item.staff_uname, item.staff_id)}>
                        <FontAwesomeIcon icon={faUser} />
                        Activate user
                      </button>
                    )}
                  </td>
                </tr>
              ))
            : ''}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        {/* Pages */}
        <div className="pages">
          <p className="m-0">
            Page {currentPage} of {totalPages}
          </p>
        </div>
        {/* Buttons */}
        <div className="buttons">
          <button className="btn prev-btn" onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </button>
          <button className="btn next-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>

      {/* Modals */}
      <CreateUserModal
        open={openCreateUser}
        close={() => {
          setOpenCreateUser(false);
          setAccount({
            fname: '',
            lname: '',
            uname: '',
            role: '',
            password: '',
            confirmPassword: ''
          });
          setError({});
        }}
        handleChange={handleChange}
        createUserAccount={createUserAccount}
        error={error}
        formValidation={formValidation}
      />
      <EditUserModal
        open={openEditUser}
        close={() => setEditUser(false)}
        account={toEditAccount}
        handleEditChange={handleEditChange}
        error={errorEdit}
        editUserAccount={editUserAccount}
      />
      <DeactivateModal open={openDeactivate} close={() => setOpenDeactivate(false)} uname={selectedUname} deactivateUser={deactivateUser} />
      <ActivateModal open={openActivate} close={() => setOpenActivate(false)} uname={selectedUname} activateUser={activateUser} />
      <Loading loading={loading} />
      <ResourceStatusModal open={statusModal} close={() => setStatusModal(false)} content={statusModalContent} path={'/accounts'} />
    </div>
  );
};

export default Accounts;
