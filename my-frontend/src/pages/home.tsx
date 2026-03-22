import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Snippet {
  _id?: string;
  id?: number;
  title: string;
  description: string;
  language: string;
  code: string;
  author: {
    name: string;
    email?: string;
    avatar?: string;
    job?: string;
  };
  likes: number;
  views: number;
  liked: boolean;
  tags: string[];
  createdAt?: string;
}

const SnippetMainPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const [data, setData] = useState<Snippet[]>([]);
  const [changedSnippets, setChangedSnippets] = useState<Set<string | undefined>>(new Set());
  const languages = ['all', 'typescript', 'javascript', 'python', 'rust', 'css', 'go', 'sql'];
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetch(`${API_URL}/api/snippets/all`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch snippets");
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : "Error loading snippets");
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : "Error loading profile");
        setLoading(false);
      });
  }, [token, API_URL, navigate, error]);

  const filteredSnippets = data.filter((snippet) => {
    const title = snippet.title?.toLowerCase() || "";
    const description = snippet.description?.toLowerCase() || "";
    const tags = snippet.tags || [];

    const query = searchQuery.toLowerCase();

    const matchesSearch =
      title.includes(query) ||
      description.includes(query) ||
      tags.some((tag: string) => tag.toLowerCase().includes(query));

    const matchesLanguage =
      selectedLanguage === "all" || snippet.language === selectedLanguage;

    return matchesSearch && matchesLanguage;
  });
  const handleCopy = async (code: string, id: string | number) => {
    try {
      await navigator.clipboard.writeText(code);

      // Increment views when copying
      setData(data.map(snippet => {
        if (snippet._id === id) {
          setChangedSnippets(prev => new Set([...prev, snippet._id]));
          return {
            ...snippet,
            views: (snippet.views || 0) + 1
          };
        }
        return snippet;
      }));

      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleLike = (id: string | number | undefined) => {
    setData(data.map(snippet => {
      if (snippet._id === id) {
        setChangedSnippets(prev => new Set([...prev, snippet._id]));
        return {
          ...snippet,
          liked: !snippet.liked,
          likes: snippet.liked ? snippet.likes - 1 : snippet.likes + 1
        };
      }
      return snippet;
    }));
  };

  // Save changed snippets to DB every 60 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (changedSnippets.size === 0) return;

      const snippetsToSave = data.filter(snippet => changedSnippets.has(snippet._id));

      snippetsToSave.forEach(snippet => {
        fetch(`${API_URL}/api/snippets/${snippet._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            likes: snippet.likes,
            views: snippet.views,
            liked: snippet.liked
          })
        }).catch(err => console.error("Error saving snippet:", err));
      });

      setChangedSnippets(new Set());
    }, 20000); // Every 20 seconds

    return () => clearInterval(saveInterval);
  }, [changedSnippets, data, API_URL, token]);


  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-center text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
              Discover & Share
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Code Snippets
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              A curated collection of reusable code snippets from developers around the world
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search snippets by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-100 dark:bg-gray-700 border-0 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-16 z-40 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap mr-2">
              Filter by:
            </span>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedLanguage === lang
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSnippets.map((snippet) => (
            <article
              key={snippet._id}
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(snippet.author.name)}&background=random&color=fff&size=256&bold=true`}
                      alt={snippet.author.name}
                      className="w-10 h-10 rounded-full ring-2 ring-gray-100 dark:ring-gray-700"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {snippet.author.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {snippet.author.job}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-gray-700 border-2  border-gray-300`}>
                      {snippet.language}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {snippet.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {snippet.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {snippet.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-md border border-gray-200 dark:border-gray-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Code Block */}
              <div className="relative bg-gray-900 mx-6 rounded-xl overflow-hidden group/code">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <button
                    onClick={() => {
                      handleCopy(snippet.code, snippet._id || '')
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all"
                  >
                    {copiedId === snippet._id ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300 leading-relaxed">
                    <code>{snippet.code}</code>
                  </pre>
                </div>

                {/* Fade overlay for long code */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                  <button
                    onClick={() => handleLike(snippet._id)}
                    className={`flex items-center gap-2 transition-all hover:scale-110 ${snippet.liked ? 'text-red-500' : 'hover:text-red-500'}`}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${snippet.liked ? 'fill-current scale-110' : ''}`}
                      fill={snippet.liked ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={snippet.liked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-medium">{snippet.likes}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="font-medium">{snippet.views}</span>
                  </div>
                </div>

                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {snippet.createdAt
                    ? new Date(snippet.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })
                    : 'Unknown'}
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredSnippets.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No snippets found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SnippetMainPage;