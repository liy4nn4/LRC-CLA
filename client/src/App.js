import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'
import ResourcePage from './pages/ResourecPage/ResourcePage'
import DepartmentPage from './pages/DepartmentPage/DepartmentPage'
import Home from './components/Home/Home'
import AboutUs from './components/AboutUs/AboutUs'
import Services from './components/Services/Services'
import Search from './components/Search/Search'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/about-us' element={<AboutUs/>}/>
          <Route path='/services' element={<Services/>}/>
          <Route path='/search' element={<Search/>}/>
          <Route path='/resource/:id' element={<ResourcePage/>}/>
          <Route path='/department' element={<DepartmentPage/>}/>
        </Routes>
      </BrowserRouter>
      
      
    </div>
  )
}

export default App
