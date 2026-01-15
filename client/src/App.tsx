import { useState } from 'react'
import TourBookingForm from './components/TourBookingForm'
import AdminDashboard from './components/AdminDashboard'
import './App.css'

function App() {
  const [view, setView] = useState<'booking' | 'admin'>('booking')

  return (
    <div className="app">
      <nav className="main-nav">
        <button
          onClick={() => setView('booking')}
          className={view === 'booking' ? 'active' : ''}
        >
          Book a Tour
        </button>
        <button
          onClick={() => setView('admin')}
          className={view === 'admin' ? 'active' : ''}
        >
          Admin Dashboard
        </button>
      </nav>

      {view === 'booking' ? <TourBookingForm /> : <AdminDashboard />}
    </div>
  )
}

export default App
