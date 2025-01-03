import React from 'react';
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
import LoginPage from './pages/LoginPage/LoginPage';
import Cookies from 'js-cookie';
import ProtectedRoute from './components/ProtectedRoute'
const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LoginPage />} />
          
          <Route path='/dashboard' element={<ProtectedRoute allowedRoles={['staff', 'admin']}><DashboardPage /></ProtectedRoute>} />
          <Route path='/logbook' element={<ProtectedRoute allowedRoles={['staff', 'admin']}><LogbookPage /></ProtectedRoute>} />
          <Route path='/circulation' element={<ProtectedRoute allowedRoles={['staff', 'admin']}><CirculationPage /></ProtectedRoute>} />
          <Route path='/circulation/patron' element={<ProtectedRoute allowedRoles={['staff', 'admin']}><CirculationSelectPatronPage /></ProtectedRoute>} />
          <Route path='/circulation/patron/item/:id' element={<ProtectedRoute allowedRoles={['staff', 'admin']}><CirculationSelectItemPage /></ProtectedRoute>} />
          <Route path='/circulation/patron/item/checkout' element={<ProtectedRoute allowedRoles={['staff', 'admin']}><CirculationCheckoutPage /></ProtectedRoute>} />
          <Route path='/circulation/patron/item/checkin' element={<ProtectedRoute allowedRoles={['staff', 'admin']}><CirculationCheckoutPage /></ProtectedRoute>} />
          <Route path='/patrons' element={<ProtectedRoute allowedRoles={['staff', 'admin']}><PatronsPage /></ProtectedRoute>} />
          <Route path='/catalog' element={<ProtectedRoute allowedRoles={['staff', 'admin']}><CatalogPage /></ProtectedRoute>} />
          <Route path='/add-item' element={<ProtectedRoute allowedRoles={['admin']}><AddItemPage /></ProtectedRoute>} />
          <Route path='/view-item/:id' element={<ProtectedRoute allowedRoles={['staff', 'admin']}><ViewItemPage /></ProtectedRoute>} />
          <Route path='/attendance' element={<ProtectedRoute allowedRoles={['staff', 'admin']}><AttendancePage /></ProtectedRoute>} />
          
          {/* Restricted routes for staff */}
          <Route path='/audit' element={<ProtectedRoute allowedRoles={['admin']}><AuditPage /></ProtectedRoute>} />
          <Route path='/accounts' element={<ProtectedRoute allowedRoles={['admin']}><AccountsPage /></ProtectedRoute>} />
          <Route path='/reports' element={<ProtectedRoute allowedRoles={['admin']}><ReportsPage /></ProtectedRoute>} />
          
          <Route path='/admin' element={<ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
