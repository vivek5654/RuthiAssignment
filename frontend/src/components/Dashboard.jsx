import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { issueAPI, userAPI } from '../utils/api.js';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [developers, setDevelopers] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    priority: 'Medium',
  });
  const [commentTexts, setCommentTexts] = useState({});

  useEffect(() => {
    loadIssues();
  }, []);

  useEffect(() => {
    if (user?.role === 'Admin') {
      userAPI.getDevelopers()
        .then((res) => setDevelopers(res.data))
        .catch(() => setDevelopers([]));
    }
  }, [user]);

  const loadIssues = async () => {
    try {
      const response = await issueAPI.getIssues();
      setIssues(response.data);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (e) => {
    e.preventDefault();
    try {
      await issueAPI.createIssue(newIssue);
      setNewIssue({ title: '', description: '', priority: 'Medium' });
      setShowCreateForm(false);
      loadIssues();
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      await issueAPI.updateIssue(issueId, { status: newStatus });
      loadIssues();
    } catch (error) {
      console.error('Error updating issue:', error);
    }
  };

  // Assign issue to a developer
  const assignIssue = async (issueId, developerId) => {
    if (!developerId) return;
    try {
      await issueAPI.assignIssue(issueId, developerId);
      loadIssues();
    } catch (error) {
      console.error('Error assigning issue:', error);
    }
  };

  // Comment functions
  const handleChangeComment = (text, issueId) => {
    setCommentTexts((prev) => ({ ...prev, [issueId]: text }));
  };

  const handleComment = async (issueId) => {
    if (!commentTexts[issueId] || !commentTexts[issueId].trim()) return;
    try {
      await issueAPI.addComment(issueId, { text: commentTexts[issueId].trim() });
      setCommentTexts((prev) => ({ ...prev, [issueId]: '' }));
      loadIssues();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-xl text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Issue Tracker</h1>
              <p className="text-gray-600">
                Welcome, {user?.name} ({user?.role})
              </p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition shadow-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Create Issue Button */}
        {(user?.role === 'User' || user?.role === 'Admin') && (
          <div className="mb-6">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-md"
            >
              {showCreateForm ? 'Cancel' : 'Create New Issue'}
            </button>
          </div>
        )}

        {/* Create Issue Form */}
        {showCreateForm && (
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Create New Issue</h2>
            <form onSubmit={createIssue} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Issue title"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  value={newIssue.title}
                  onChange={(e) =>
                    setNewIssue({ ...newIssue, title: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Issue description"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  value={newIssue.description}
                  onChange={(e) =>
                    setNewIssue({ ...newIssue, description: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  value={newIssue.priority}
                  onChange={(e) =>
                    setNewIssue({ ...newIssue, priority: e.target.value })
                  }
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-md font-medium"
              >
                Create Issue
              </button>
            </form>
          </div>
        )}

        {/* Issues List */}
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.role === 'Admin'
                ? 'All Issues'
                : user?.role === 'Developer'
                ? 'My Assigned Issues'
                : 'All Issues'}
            </h2>
          </div>

          {issues.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No issues found.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {issues.map((issue) => (
                <div key={issue._id} className="p-6 hover:bg-green-50/50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {issue.title}
                      </h3>
                      <p className="text-gray-600 mt-2">{issue.description}</p>
                      <div className="mt-4 flex items-center space-x-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            issue.status === 'Open'
                              ? 'bg-green-100 text-green-800'
                              : issue.status === 'In-Progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : issue.status === 'Closed'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {issue.status}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            issue.priority === 'High'
                              ? 'bg-red-100 text-red-800'
                              : issue.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {issue.priority}
                        </span>
                        {issue.assignee && (
                          <span className="text-gray-500">
                            Assigned to:{' '}
                            {issue.assignee.name}
                          </span>
                        )}
                      </div>
                      {/* --------- Admin Assign Section --------- */}
                      {user?.role === 'Admin' && (
                        <div className="flex items-center mt-4 space-x-2">
                          <select
                            value={issue.assignee?._id || issue.assignee || ""}
                            onChange={e => assignIssue(issue._id, e.target.value)}
                            className="border rounded px-2 py-1"
                          >
                            <option value="">Assign to developer...</option>
                            {developers.map(dev => (
                              <option value={dev._id} key={dev._id}>{dev.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {/* --------- Comments Section --------- */}
                      <div className="mt-6">
                        {issue.comments && issue.comments.length > 0 && (
                          <div className="mb-3">
                            <div className="font-semibold text-sm text-green-600 mb-2">Comments:</div>
                            {issue.comments.map((c, idx) => (
                              <div
                                key={idx}
                                className="mb-2 p-2 rounded bg-green-50 text-gray-800 border border-green-100 text-xs"
                              >
                                <span className="font-medium">
                                  {c.user?.name || 'User'}:
                                </span> {c.text}
                                <span className="ml-2 text-gray-400 text-[11px]">
                                  {new Date(c.createdAt).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Comment input form */}
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            className="border border-green-300 px-3 py-1 rounded-lg text-sm focus:outline-none flex-1"
                            value={commentTexts[issue._id] || ''}
                            onChange={e => handleChangeComment(e.target.value, issue._id)}
                            placeholder="Write a comment..."
                          />
                          <button
                            className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 text-xs"
                            onClick={() => handleComment(issue._id)}
                            disabled={!commentTexts[issue._id] || !commentTexts[issue._id].trim()}
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                      {/* ------------------------------------ */}
                    </div>

                    <div className="ml-4 flex space-x-2">
                      {(user?.role === 'Developer' || user?.role === 'Admin') && (
                        <div className="space-x-2">
                          {issue.status !== 'Closed' && (
                            <>
                              <button
                                onClick={() =>
                                  updateIssueStatus(issue._id, 'In-Progress')
                                }
                                className="text-sm bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition shadow-sm"
                              >
                                In Progress
                              </button>
                              <button
                                onClick={() =>
                                  updateIssueStatus(issue._id, 'Closed')
                                }
                                className="text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
                              >
                                Close
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
