import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom'
import DepartmentPage from './pages/DepartmentPage/DepartmentPage'
import Home from './components/Home/Home'
import AboutUs from './components/AboutUs/AboutUs'
import Services from './components/Services/Services'
import Search from './components/Search/Search'
import ResourceModal from './components/ResourceModal/ResourceModal'
import TermsConditions from './components/TermsConditions/TermsConditions'

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/about-us' element={<AboutUs/>}/>
          <Route path='/services' element={<Services/>}/>
          <Route path='/search' element={<Search/>}/>
          <Route path='/resource' element={<ResourceModal/>}/>
          <Route path='/department' element={<DepartmentPage/>}/>
          <Route path='/terms-conditions' element={<TermsConditions/>}/>
        </Routes>
      </BrowserRouter>
      
      
    </div>
  )
}

export default App
