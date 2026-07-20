import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api'
import ConfirmModal from '../components/ConfirmModal'

const Profile = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [formData, setFormData] = useState({
    bio: '', skills: '', github: '', phone: '', location: ''
  })

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      const { data } = await API.get('/users/profile')
      setProfile(data)
      setFormData({
        bio: data.bio || '',
        skills: data.skills?.join(', ') || '',
        github: data.github || '',
        phone: data.phone || '',
        location: data.location || ''
      })
    } catch (error) { console.error(error) }
    setLoading(false)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await API.put('/users/profile', formData)
      setProfile(data)
      setSuccessMsg('Profile saved!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch { alert('Failed to update profile') }
    setSaving(false)
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      const form = new FormData()
      form.append('photo', file)
      const { data } = await API.post('/users/upload-photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfile(data)
      setSuccessMsg('Photo updated!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch { alert('Failed to upload photo') }
    setUploadingPhoto(false)
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingResume(true)
    try {
      const form = new FormData()
      form.append('resume', file)
      const { data } = await API.post('/users/upload-resume', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfile(data)
      setSuccessMsg('Resume uploaded!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch { alert('Failed to upload resume') }
    setUploadingResume(false)
  }

  const confirmLogout = () => { logout(); navigate('/login') }

  const missingFields = [
    !profile?.photo && 'photo',
    !profile?.bio && 'bio',
    !profile?.skills?.length && 'skills',
    !profile?.github && 'GitHub URL',
    !profile?.resume && 'resume'
  ].filter(Boolean)

  const profileComplete = missingFields.length === 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-blue-600">Job Tracker</h1>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-sm">Welcome, {user?.name}!</span>
          <button onClick={() => navigate('/dashboard')} className="text-sm bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 font-medium">
            Dashboard
          </button>
          <button onClick={() => navigate('/jobs')} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
            Browse Jobs
          </button>
          <button onClick={() => setShowLogoutModal(true)} className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
          <p className="text-slate-500 text-sm mt-1">This information is shown to companies when you apply.</p>
        </div>

        {/* Incomplete warning */}
        {!profileComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-amber-800 font-semibold text-sm">⚠️ Complete your profile to unlock job applications</p>
            <p className="text-amber-600 text-xs mt-1">Still missing: {missingFields.join(', ')}</p>
          </div>
        )}

        {loading ? (
          <p className="text-center text-slate-400 py-20">Loading...</p>
        ) : (
          <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Photo + Name header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-8">
              <div className="flex items-end gap-5">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/40">
                    {profile?.photo ? (
                      <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/60 text-4xl font-bold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 cursor-pointer bg-white text-blue-600 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-blue-50 text-sm font-bold border border-slate-200">
                    {uploadingPhoto ? '...' : '✎'}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploadingPhoto} />
                  </label>
                </div>
                <div className="text-white pb-1">
                  <p className="text-xl font-bold">{profile?.name}</p>
                  <p className="text-slate-300 text-sm">{profile?.email}</p>
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="px-6 py-6 space-y-5">

              {/* Contact Info */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">Contact Info</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Phone <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+880 1234 567890"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 text-slate-800 placeholder-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Location <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="Dhaka, Bangladesh"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 text-slate-800 placeholder-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Profile Info */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">Profile Info</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Bio <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell companies about yourself — your experience, goals, and what you're looking for..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 text-slate-800 placeholder-slate-300 resize-none"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Skills <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                      placeholder="React, Node.js, MongoDB, Tailwind CSS..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 text-slate-800 placeholder-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      GitHub URL <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.github}
                      onChange={(e) => setFormData({...formData, github: e.target.value})}
                      placeholder="https://github.com/yourusername"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 text-slate-800 placeholder-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              {/* Resume */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">Resume / CV</p>
                {profile?.resume ? (
                  <div className="flex items-center gap-3">
                    <a href={profile.resume} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition">
                      📄 View Resume
                    </a>
                    <label className="cursor-pointer flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-200 transition">
                      {uploadingResume ? 'Uploading...' : '↑ Replace'}
                      <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" disabled={uploadingResume} />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                    {uploadingResume ? 'Uploading...' : '↑ Upload PDF Resume'}
                    <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" disabled={uploadingResume} />
                  </label>
                )}
              </div>

              <div className="border-t border-slate-100" />

              {/* Save button + success msg */}
              <div className="flex justify-between items-center">
                {successMsg ? (
                  <p className="text-emerald-600 text-sm font-medium">✅ {successMsg}</p>
                ) : (
                  <div />
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>

            </div>
          </form>
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

export default Profile