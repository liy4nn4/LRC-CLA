import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'
import HomePage from './pages/HomePage/HomePage'
import AboutUsPage from './pages/AboutUsPage/AboutUsPage'
import ServicesPage from './pages/ServicesPage/ServicesPage'
import SearchPage from './pages/SearchPage/SearchPage'
import ResourcePage from './pages/ResourecPage/ResourcePage'
import DepartmentPage from './pages/DepartmentPage/DepartmentPage'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage/>}/>
          <Route path='/about-us' element={<AboutUsPage/>}/>
          <Route path='/services' element={<ServicesPage/>}/>
          <Route path='/search' element={<SearchPage/>}/>
          <Route path='/resource' element={<ResourcePage/>}/>
          <Route path='/department' element={<DepartmentPage/>}/>
        </Routes>
      </BrowserRouter>
      
      
    </div>
  )
}

export default App
