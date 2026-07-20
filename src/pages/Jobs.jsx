import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api'
import ConfirmModal from '../components/ConfirmModal'

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [appliedJobs, setAppliedJobs] = useState(new Set())
  const [applying, setApplying] = useState(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [applyModal, setApplyModal] = useState({ isOpen: false, jobId: null, jobTitle: '' })
  const [coverLetter, setCoverLetter] = useState('')
  const [coverLetterError, setCoverLetterError] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchJobs()
    fetchMyApplications()
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

  const fetchMyApplications = async () => {
    try {
      const { data } = await API.get('/applications/my')
      setAppliedJobs(new Set(data.map(app => app.job?._id)))
    } catch (error) {
      console.error(error)
    }
  }

  const openApplyModal = (jobId, jobTitle) => {
    setCoverLetter('')
    setCoverLetterError('')
    setApplyModal({ isOpen: true, jobId, jobTitle })
  }

  const handleApply = async () => {
    if (!coverLetter.trim()) {
      setCoverLetterError('Cover letter is required')
      return
    }
    if (coverLetter.trim().length < 50) {
      setCoverLetterError('Cover letter must be at least 50 characters')
      return
    }

    setApplying(applyModal.jobId)
    try {
      await API.post(`/applications/${applyModal.jobId}/apply`, { coverLetter })
      setAppliedJobs(prev => new Set([...prev, applyModal.jobId]))
      setApplyModal({ isOpen: false, jobId: null, jobTitle: '' })
      setCoverLetter('')
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong'
      if (msg.includes('resume')) {
        setApplyModal({ isOpen: false, jobId: null, jobTitle: '' })
        alert('Please upload your resume in your profile before applying!')
        navigate('/profile')
      } else {
        setCoverLetterError(msg)
      }
    }
    setApplying(null)
  }

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
          <button onClick={() => navigate('/profile')} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
            My Profile
          </button>
          <button onClick={() => navigate('/dashboard')} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Dashboard
          </button>
          <button onClick={() => setShowLogoutModal(true)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
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
            {jobs.map((job) => {
              const hasApplied = appliedJobs.has(job._id)
              return (
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
                    onClick={() => !hasApplied && openApplyModal(job._id, job.title)}
                    disabled={hasApplied || applying === job._id}
                    className={`mt-4 w-full py-2 rounded-lg transition font-semibold text-sm ${
                      hasApplied ? 'bg-green-100 text-green-600 cursor-default' :
                      applying === job._id ? 'bg-blue-300 text-white cursor-wait' :
                      'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {hasApplied ? '✓ Applied' : applying === job._id ? 'Applying...' : 'Apply Now'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Apply Modal with Cover Letter */}
      {applyModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setApplyModal({ isOpen: false, jobId: null, jobTitle: '' })} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Apply for {applyModal.jobTitle}</h3>
            <p className="text-gray-500 text-sm mb-4">Write a cover letter to introduce yourself to the company.</p>

            <textarea
              value={coverLetter}
              onChange={(e) => { setCoverLetter(e.target.value); setCoverLetterError('') }}
              placeholder="Dear Hiring Manager, I am excited to apply for this position because..."
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-blue-500 text-sm resize-none"
              rows="6"
            />
            <div className="flex justify-between items-center mt-1 mb-4">
              {coverLetterError ? (
                <p className="text-red-500 text-xs">{coverLetterError}</p>
              ) : (
                <p className="text-gray-400 text-xs">Minimum 50 characters</p>
              )}
              <p className="text-gray-400 text-xs">{coverLetter.length} chars</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setApplyModal({ isOpen: false, jobId: null, jobTitle: '' })}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying === applyModal.jobId}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                {applying === applyModal.jobId ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default Jobs