import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api'
import ConfirmModal from '../components/ConfirmModal'

const columns = {
  applied: { title: 'Applied', color: 'bg-yellow-100 border-yellow-300', text: 'text-yellow-700' },
  shortlisted: { title: 'Shortlisted', color: 'bg-blue-100 border-blue-300', text: 'text-blue-700' },
  hired: { title: 'Hired', color: 'bg-green-100 border-green-300', text: 'text-green-700' },
  rejected: { title: 'Rejected', color: 'bg-red-100 border-red-300', text: 'text-red-700' }
}

const JobHuntBoard = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const { data } = await API.get('/applications/my')
      setApplications(data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const getColumnApplications = (status) => applications.filter(app => app.status === status)

  const confirmLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Job Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {user?.name}!</span>
          <button onClick={() => navigate('/dashboard')} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Dashboard
          </button>
          <button onClick={() => navigate('/jobs')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
            Browse Jobs
          </button>
          <button onClick={() => setShowLogoutModal(true)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My Job Hunt Board</h2>
        <p className="text-gray-500 text-sm mb-6">Your application statuses are updated by companies in real time!</p>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(columns).map(([status, col]) => (
              <div key={status} className={`rounded-xl border-2 p-4 ${col.color}`}>
                <h3 className={`font-bold mb-3 ${col.text}`}>
                  {col.title} ({getColumnApplications(status).length})
                </h3>
                <div className="space-y-3 min-h-32">
                  {getColumnApplications(status).length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">No applications here</p>
                  ) : (
                    getColumnApplications(status).map((app) => (
                      <div key={app._id} className="bg-white p-4 rounded-lg shadow-sm border">
                        <h4 className="font-semibold text-gray-800 text-sm">{app.job?.title}</h4>
                        <p className="text-gray-500 text-xs mt-1">{app.job?.location}</p>
                        <p className="text-green-600 text-xs font-semibold mt-1">{app.job?.salary}</p>
                        <p className="text-gray-400 text-xs mt-2">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showLogoutModal}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        confirmColor="bg-red-500 hover:bg-red-600"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  )
}

export default JobHuntBoard