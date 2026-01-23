import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import StatsSection from './components/StatsSection'
import FeaturesSection from './components/FeaturesSection'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import UserDashboard from './pages/UserDashboard'
import StoreOwnerDashboard from './pages/StoreOwnerDashboard'
import SynapseLanding from './pages/LandingPage'
import Login from './pages/login'
import StoreCreate from './pages/StoreCreate'
import DashboardRedirect from './pages/DashboardRedirect'
import './App.css'

function CogniWaveLanding() {
  return (
    <>
      <Header />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <Testimonials />
      <Footer />
    </>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CogniWaveLanding />} />
        <Route path="/synapstore" element={<SynapseLanding />} />
        <Route path="/home" element={<DashboardRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/store/create" element={<StoreCreate />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/store/dashboard" element={<StoreOwnerDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
