import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  _id?: string;
  name: string;
  email: string;
  job: string;
  createdAt?: string;
}
interface Snippet {
  _id?: string;
  title: string;
  description: string;
  language: string;
  userId: string;
  likes?: number;
  views?: number;
  author: {
    name: string;
    email: string;
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showmore, setShowmore] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetch(`${API_URL}/api/users/me`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : "Error loading profile");
        setLoading(false);
      });

    //fetch all snippets of current user
    fetch(`${API_URL}/api/snippets/user/snippets`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then(data => {
        setSnippets(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : "Error loading profile");
        setLoading(false);
      });
  }, [token, API_URL, navigate]);

  // Calculate stats using useMemo to avoid cascading renders
  const stats = useMemo(() => {
    if (snippets.length > 0) {
      const totalLikes = snippets.reduce((sum, snippet) => sum + (snippet.likes || 0), 0);
      const totalViews = snippets.reduce((sum, snippet) => sum + (snippet.views || 0), 0);
      const uniqueLanguages = [...new Set(snippets.map(snippet => snippet.language))].filter(Boolean);

      return {
        totalSnippets: snippets.length,
        totalViews,
        totalLikes,
        languagesUsed: uniqueLanguages
      };
    }
    return null;
  }, [snippets]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleEditSnippet = (snippet: Snippet) => {
    navigate(`/edit-snippet/${snippet._id}`, { state: { snippet } });
    setOpenMenuId(null);
  };

  const handleDeleteSnippet = async (snippetId: string | undefined) => {
    if (!snippetId) return;

    try {
      const response = await fetch(`${API_URL}/api/snippets/${snippetId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to delete snippet");

      setSnippets(snippets.filter(s => s._id !== snippetId));
      setDeleteConfirmId(null);
      setOpenMenuId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting snippet");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-center text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-3 bg-red-100 text-red-700 rounded-lg border border-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Profile
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your account and snippet preferences
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800 transition-all duration-200 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>

        {user && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Main Profile Card */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600"></div>
              <div className="px-8 pb-8">
                <div className="relative flex justify-between items-end -mt-16 mb-6">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=256&bold=true`}
                    alt={user.name}
                    className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg object-cover bg-gray-100"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user.name}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      {user.job || 'Developer'}
                    </p>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Passionate developer sharing useful code snippets and building tools for the community.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {stats?.languagesUsed?.slice(0, 3)?.map(lang => (
                      <span
                        key={lang}
                        className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full border border-blue-100 dark:border-blue-800"
                      >
                        {lang}
                      </span>
                    ))}
                    {stats && stats.languagesUsed.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full border border-gray-200 dark:border-gray-600">
                        +{stats.languagesUsed.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats & Info Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Snippet Stats
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.totalSnippets || 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Snippets</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.totalViews || 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Views</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.languagesUsed.length || 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Languages</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.totalLikes || 0}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Likes</div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  Account Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Occupation</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.job || 'Not specified'}</p>
                    </div>
                  </div>

                  {user.createdAt && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Member Since</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Snippets Section */}
            <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Snippets ({snippets.length})
                </h3>
                {snippets.length > 3 && (
                  <button onClick={() => {
                    setShowmore(true);
                  }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    View All →
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {(showmore ? snippets : snippets.slice(0, 3)).map((snippet) => (
                  <div key={snippet._id} className="group p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all relative">
                    {/* 3-Dot Menu Button */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === (snippet._id || "") ? null : (snippet._id || ""))}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 11-4 0 2 2 0 014 0zM10 12a2 2 0 11-4 0 2 2 0 014 0zM10 18a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === snippet._id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                          <button
                            onClick={() => handleEditSnippet(snippet)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-sm flex items-center gap-2 border-b border-gray-200 dark:border-gray-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(snippet._id || null)}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {deleteConfirmId === snippet._id && (
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-20">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">Delete this snippet?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteSnippet(snippet._id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{snippet.language}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {snippet.title || "Untitled Snippet"}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {snippet.description || "No description provided."}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {snippet.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        {snippet.likes || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {showmore && (
                <div className="mt-4 flex justify-center">
                  <button onClick={() => { setShowmore(false); setOpenMenuId(null); }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    Show Less ↑
                  </button>
                </div>
              )}
              
              {snippets.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No snippets yet. Start creating!</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}