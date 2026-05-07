import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api'

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const { data } = await API.get('/jobs')
      setJobs(data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const handleApply = async (jobId) => {
    try {
      await API.post(`/applications/${jobId}/apply`)
      alert('Applied successfully!')
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Job Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {user?.name}!</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Dashboard
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse Jobs</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-500">No jobs available yet!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
                <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                <p className="text-gray-500 text-sm mt-1">{job.postedBy?.name}</p>
                <p className="text-gray-600 mt-3 text-sm line-clamp-2">{job.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skillsRequired?.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-green-600 font-semibold text-sm">{job.salary}</span>
                  <span className="text-gray-500 text-sm">{job.location}</span>
                </div>
                <button
                  onClick={() => handleApply(job._id)}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Jobs