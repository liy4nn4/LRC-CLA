import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import AdminLogInPage from './pages/AdminLogInPage/AdminLogInPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import Admin from './pages/Admin/Admin';
import LogbookPage from './pages/LogbookPage/LogbookPage';
import InventoryPage from'./pages/InventoryPage/InventoryPage'
import PatronsPage from './pages/PatronsPage/PatronsPage';
import ReportsPage from './pages/ReportsPage/ReportsPage';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import AddItemPage from './pages/AddItemPage/AddItemPage';
import ViewItem from './components/ViewItem/ViewItem';
import ViewItemPage from './pages/ViewItemPage/ViewItemPage';


const App = () => {
  
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/admin-log-in' element={<AdminLogInPage/>}/>
          <Route path='/' element={<DashboardPage/>}/>
          <Route path='/logbook' element={<LogbookPage/>}/>
          <Route path='/inventory' element={<InventoryPage/>}/>
          <Route path='/patrons' element={<PatronsPage/>}/>
          <Route path='/reports' element={<ReportsPage/>}/>
          <Route path='/admin' element={<Admin/>}/>
          <Route path='/catalog' element={<CatalogPage/>}/>
          <Route path='/add-item' element={<AddItemPage/>}/>
          {/* <Route path='/view-item/:resourceId' element={<AddItemPage/>}/> */}
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
