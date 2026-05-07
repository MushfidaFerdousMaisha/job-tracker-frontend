import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api'

const columns = {
  applied: { title: 'Applied', color: 'bg-yellow-100 border-yellow-300' },
  shortlisted: { title: 'Shortlisted', color: 'bg-blue-100 border-blue-300' },
  hired: { title: 'Hired', color: 'bg-green-100 border-green-300' },
  rejected: { title: 'Rejected', color: 'bg-red-100 border-red-300' }
}

const JobHuntBoard = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
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

  const getColumnApplications = (status) => {
    return applications.filter(app => app.status === status)
  }

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    const newStatus = destination.droppableId

    setApplications(prev =>
      prev.map(app =>
        app._id === draggableId ? { ...app, status: newStatus } : app
      )
    )

    try {
      await API.put(`/applications/${draggableId}/status`, { status: newStatus })
    } catch (error) {
      console.error(error)
      fetchApplications()
    }
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
            onClick={() => navigate('/jobs')}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Browse Jobs
          </button>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          My Job Hunt Board
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Object.entries(columns).map(([status, col]) => (
                <div key={status} className={`rounded-xl border-2 p-4 ${col.color}`}>
                  <h3 className="font-bold text-gray-700 mb-3">
                    {col.title} ({getColumnApplications(status).length})
                  </h3>
                  <Droppable droppableId={status}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="min-h-32 space-y-3"
                      >
                        {getColumnApplications(status).map((app, index) => (
                          <Draggable
                            key={app._id}
                            draggableId={app._id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white p-4 rounded-lg shadow-sm border cursor-grab active:cursor-grabbing"
                              >
                                <h4 className="font-semibold text-gray-800 text-sm">
                                  {app.job?.title}
                                </h4>
                                <p className="text-gray-500 text-xs mt-1">
                                  {app.job?.location}
                                </p>
                                <p className="text-green-600 text-xs font-semibold mt-1">
                                  {app.job?.salary}
                                </p>
                                <p className="text-gray-400 text-xs mt-2">
                                  {new Date(app.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  )
}

export default JobHuntBoard