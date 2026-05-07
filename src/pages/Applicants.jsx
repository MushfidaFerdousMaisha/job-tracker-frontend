import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api'

const Applicants = () => {
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const { jobId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchApplicants()
  }, [])

  const fetchApplicants = async () => {
    try {
      const { data } = await API.get(`/applications/${jobId}/applicants`)
      setApplicants(data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const updateStatus = async (applicationId, status, applicantName) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark ${applicantName} as "${status}"?`
    )
    if (!confirmed) return

    try {
      await API.put(`/applications/${applicationId}/status`, { status })
      fetchApplicants()
    } catch (error) {
      alert('Something went wrong')
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'shortlisted': return 'bg-green-100 text-green-600'
      case 'hired': return 'bg-blue-100 text-blue-600'
      case 'rejected': return 'bg-red-100 text-red-600'
      default: return 'bg-yellow-100 text-yellow-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Job Tracker — Company</h1>
        <button
          onClick={() => navigate('/company/dashboard')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Applicants</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : applicants.length === 0 ? (
          <p className="text-center text-gray-500">No applicants yet!</p>
        ) : (
          <div className="space-y-4">
            {applicants.map((app) => (
              <div key={app._id} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {app.applicant?.name}
                    </h3>
                    <p className="text-gray-500 text-sm">{app.applicant?.email}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => updateStatus(app._id, 'shortlisted', app.applicant?.name)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600"
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => updateStatus(app._id, 'hired', app.applicant?.name)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                  >
                    Hire
                  </button>
                  <button
                    onClick={() => updateStatus(app._id, 'rejected', app.applicant?.name)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Applicants