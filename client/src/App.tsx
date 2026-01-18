import { useState } from 'react'
import TourBookingForm from './components/TourBookingForm'
import AdminDashboard from './components/AdminDashboard'
import AgentDashboard from './components/agents/AgentDashboard'
import FinancialDashboard from './components/financial/FinancialDashboard'
import LeadManagement from './components/leads/LeadManagement'
import './App.css'

function App() {
  const [view, setView] = useState<'booking' | 'admin' | 'agents' | 'financial' | 'leads'>('booking')

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
        <button
          onClick={() => setView('agents')}
          className={view === 'agents' ? 'active' : ''}
        >
          Agents
        </button>
        <button
          onClick={() => setView('financial')}
          className={view === 'financial' ? 'active' : ''}
        >
          Financial
        </button>
        <button
          onClick={() => setView('leads')}
          className={view === 'leads' ? 'active' : ''}
        >
          Leads
        </button>
      </nav>

      {view === 'booking' && <TourBookingForm />}
      {view === 'admin' && <AdminDashboard />}
      {view === 'agents' && <AgentDashboard />}
      {view === 'financial' && <FinancialDashboard />}
      {view === 'leads' && <LeadManagement />}
    </div>
  )
}

export default App
