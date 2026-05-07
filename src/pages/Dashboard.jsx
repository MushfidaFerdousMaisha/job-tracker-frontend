import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const stats = {
    total: applications.length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    hired: applications.filter(a => a.status === 'hired').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Job Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {user?.name}!</span>
          <button
            onClick={() => navigate('/jobs')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Browse Jobs
          </button>
          <button
            onClick={() => navigate('/jobhuntboard')}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
          >
            Job Hunt Board
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Dashboard</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-sm text-gray-500">Total Applied</h3>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-sm text-gray-500">Shortlisted</h3>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.shortlisted}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-sm text-gray-500">Hired</h3>
            <p className="text-3xl font-bold text-purple-600 mt-1">{stats.hired}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-sm text-gray-500">Rejected</h3>
            <p className="text-3xl font-bold text-red-600 mt-1">{stats.rejected}</p>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-4">My Applications</h3>
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : applications.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No applications yet!</p>
            <button
              onClick={() => navigate('/jobs')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-800">{app.job?.title}</h4>
                  <p className="text-gray-500 text-sm">{app.job?.location} • {app.job?.salary}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Applied: {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  app.status === 'shortlisted' ? 'bg-green-100 text-green-600' :
                  app.status === 'hired' ? 'bg-purple-100 text-purple-600' :
                  app.status === 'rejected' ? 'bg-red-100 text-red-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard