import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api'

const CompanyDashboard = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', skillsRequired: '', salary: '', location: ''
  })
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const { data } = await API.get('/jobs')
      const myJobs = data.filter(job => job.postedBy?._id === user?._id)
      setJobs(myJobs)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const jobData = {
        ...formData,
        skillsRequired: formData.skillsRequired.split(',').map(s => s.trim())
      }
      await API.post('/jobs', jobData)
      alert('Job posted successfully!')
      setShowForm(false)
      setFormData({ title: '', description: '', skillsRequired: '', salary: '', location: '' })
      fetchJobs()
    } catch (error) {
      alert(error.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Job Tracker — Company</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {user?.name}!</span>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Job Postings</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : '+ Post New Job'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
            <h3 className="text-lg font-bold mb-4">Post a New Job</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Job Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Skills (comma separated: React, Node.js)"
                  value={formData.skillsRequired}
                  onChange={(e) => setFormData({...formData, skillsRequired: e.target.value})}
                  className="border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Salary"
                  value={formData.salary}
                  onChange={(e) => setFormData({...formData, salary: e.target.value})}
                  className="border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="border rounded-lg p-3 focus:outline-none focus:border-blue-500"
                />
                <textarea
                  placeholder="Job Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="border rounded-lg p-3 focus:outline-none focus:border-blue-500 md:col-span-2"
                  rows="3"
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Post Job
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-gray-500">No jobs posted yet!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div key={job._id} className="bg-white p-6 rounded-xl shadow-sm border">
                <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                <p className="text-gray-600 mt-2 text-sm">{job.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.skillsRequired?.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex justify-between">
                  <span className="text-green-600 font-semibold text-sm">{job.salary}</span>
                  <span className="text-gray-500 text-sm">{job.location}</span>
                </div>
                <button
                  onClick={() => navigate(`/company/jobs/${job._id}/applicants`)}
                  className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                >
                  View Applicants
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CompanyDashboard