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
import PatronsPage from './pages/PatronsPage/PatronsPage';
import ReportsPage from './pages/ReportsPage/ReportsPage';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import AddItemPage from './pages/AddItemPage/AddItemPage';
import ViewItem from './components/ViewItem/ViewItem';
import ViewItemPage from './pages/ViewItemPage/ViewItemPage';
import AttendancePage from './pages/AttendancePage/AttendancePage';
import CirculationPage from './pages/CirculationPage/CirculationPage';
import CirculationSelectPatronPage from './pages/CirculationSelectPatronPage/CirculationSelectPatronPage';
import CirculationSelectItemPage from './pages/CirculationSelectItemPage/CirculationSelectItemPage';
import CirculationCheckoutPage from './pages/CirculationCheckoutPage/CirculationCheckoutPage';
import AuditPage from './pages/AuditPage/AuditPage';
import AccountsPage from './pages/AccountsPage/AccountsPage';
  
const App = () => {
  
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/admin-log-in' element={<AdminLogInPage/>}/>
          <Route path='/' element={<DashboardPage/>}/>
          <Route path='/dashboard' element={<DashboardPage/>}/>
          <Route path='/logbook' element={<LogbookPage/>}/>
          <Route path='/circulation' element={<CirculationPage/>}/>
          <Route path='/circulation/patron' element={<CirculationSelectPatronPage/>}/>
          <Route path='/circulation/patron/item/:id' element={<CirculationSelectItemPage/>}/>
          <Route path='/circulation/patron/item/checkout' element={<CirculationCheckoutPage/>}/>
          <Route path='/patrons' element={<PatronsPage/>}/>
          <Route path='/reports' element={<ReportsPage/>}/>
          <Route path='/admin' element={<Admin/>}/>
          <Route path='/catalog' element={<CatalogPage/>}/>
          <Route path='/add-item' element={<AddItemPage/>}/>
          <Route path='/view-item/:id' element={<AddItemPage/>}/>
          <Route path='/attendance' element={<AttendancePage/>}/>
          <Route path='/audit' element={<AuditPage/>}/>
          <Route path='/accounts' element={<AccountsPage/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
