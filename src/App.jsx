import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import CompanyDashboard from './pages/CompanyDashboard'
import Applicants from './pages/Applicants'
import JobHuntBoard from './pages/JobHuntBoard'


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/jobs/:jobId/applicants" element={<Applicants />} />
          <Route path="/jobhuntboard" element={<JobHuntBoard />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App