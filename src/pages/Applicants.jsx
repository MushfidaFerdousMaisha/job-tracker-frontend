import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api'
import ConfirmModal from '../components/ConfirmModal'

const Applicants = () => {
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ isOpen: false, applicationId: null, status: '', name: '' })
  const [expanded, setExpanded] = useState(null)
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

  const openModal = (applicationId, status, name) => {
    setModal({ isOpen: true, applicationId, status, name })
  }

  const confirmUpdate = async () => {
    try {
      await API.put(`/applications/${modal.applicationId}/status`, { status: modal.status })
      setModal({ isOpen: false, applicationId: null, status: '', name: '' })
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

  const getModalColor = (status) => {
    switch(status) {
      case 'shortlisted': return 'bg-green-500 hover:bg-green-600'
      case 'hired': return 'bg-blue-500 hover:bg-blue-600'
      case 'rejected': return 'bg-red-500 hover:bg-red-600'
      default: return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">Job Tracker — Company</h1>
        <button onClick={() => navigate('/company/dashboard')} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Back to Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Applicants <span className="text-gray-400 font-normal text-lg">({applicants.length})</span>
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : applicants.length === 0 ? (
          <p className="text-center text-gray-500">No applicants yet!</p>
        ) : (
          <div className="space-y-4">
            {applicants.map((app) => (
              <div key={app._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">

                {/* Header */}
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      {/* Photo */}
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex-shrink-0">
                        {app.applicant?.photo ? (
                          <img src={app.applicant.photo} alt={app.applicant.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">👤</div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{app.applicant?.name}</h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-gray-500 text-sm">📧 {app.applicant?.email}</span>
                          {app.applicant?.phone && (
                            <span className="text-gray-500 text-sm">📞 {app.applicant.phone}</span>
                          )}
                          {app.applicant?.location && (
                            <span className="text-gray-500 text-sm">📍 {app.applicant.location}</span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs mt-1">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Skills */}
                  {app.applicant?.skills?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {app.applicant.skills.map((skill, i) => (
                        <span key={i} className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">{skill}</span>
                      ))}
                    </div>
                  )}

                  {/* Links row */}
                  <div className="mt-4 flex items-center gap-3 flex-wrap">
                    {app.applicant?.github && (
                      <a href={app.applicant.github} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-gray-600 text-sm hover:text-black font-semibold bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200">
                        🐙 GitHub
                      </a>
                    )}
                    {app.applicant?.resume && (
                      <a href={app.applicant.resume} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-green-600 text-sm hover:text-green-800 font-semibold bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100">
                        📄 View Resume
                      </a>
                    )}
                    <button
                      onClick={() => setExpanded(expanded === app._id ? null : app._id)}
                      className="flex items-center gap-1 text-blue-600 text-sm font-semibold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100"
                    >
                      📝 {expanded === app._id ? 'Hide' : 'View'} Cover Letter
                    </button>
                  </div>

                  {/* Bio */}
                  {app.applicant?.bio && (
                    <p className="mt-3 text-gray-600 text-sm bg-gray-50 rounded-lg p-3">
                      {app.applicant.bio}
                    </p>
                  )}

                  {/* Cover Letter */}
                  {expanded === app._id && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <p className="text-blue-800 text-xs font-bold mb-2">COVER LETTER</p>
                      <p className="text-gray-700 text-sm leading-relaxed">{app.coverLetter}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openModal(app._id, 'shortlisted', app.applicant?.name)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 font-semibold">
                      Shortlist
                    </button>
                    <button onClick={() => openModal(app._id, 'hired', app.applicant?.name)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 font-semibold">
                      Hire
                    </button>
                    <button onClick={() => openModal(app._id, 'rejected', app.applicant?.name)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 font-semibold">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={modal.isOpen}
        title={`Mark as ${modal.status}`}
        message={`Are you sure you want to mark ${modal.name} as "${modal.status}"?`}
        confirmText={modal.status.charAt(0).toUpperCase() + modal.status.slice(1)}
        confirmColor={getModalColor(modal.status)}
        onConfirm={confirmUpdate}
        onCancel={() => setModal({ isOpen: false, applicationId: null, status: '', name: '' })}
      />
    </div>
  )
}

export default Applicants