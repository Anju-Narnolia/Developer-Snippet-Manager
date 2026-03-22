import { useState, useRef } from "react";

const AddSnippetPage = () => {
    const [currentTag, setCurrentTag] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        language: string;
        code: string;
        tags: string[];
    }>({
        title: "",
        description: "",
        language: "javascript",
        code: "",
        tags: [],
    });

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const languages = [
        { value: "javascript", label: "JavaScript", color: "bg-yellow-400" },
        { value: "typescript", label: "TypeScript", color: "bg-blue-500" },
        { value: "python", label: "Python", color: "bg-green-500" },
        { value: "rust", label: "Rust", color: "bg-orange-500" },
        { value: "css", label: "CSS", color: "bg-sky-400" },
        { value: "html", label: "HTML", color: "bg-orange-600" },
        { value: "go", label: "Go", color: "bg-cyan-500" },
        { value: "sql", label: "SQL", color: "bg-purple-500" },
        { value: "bash", label: "Bash", color: "bg-gray-600" },
        { value: "json", label: "JSON", color: "bg-gray-500" },
    ];

    const popularTags = [
        "react",
        "hooks",
        "api",
        "algorithm",
        "utility",
        "component",
        "database",
        "async",
        "performance",
        "security",
    ];

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLanguageSelect = (lang: string) => {
        setFormData((prev) => ({ ...prev, language: lang }));
    };

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && currentTag.trim()) {
            e.preventDefault();

            const tag = currentTag.trim().toLowerCase();

            if (!formData.tags.includes(tag)) {
                setFormData((prev) => ({
                    ...prev,
                    tags: [...prev.tags, tag],
                }));
            }

            setCurrentTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
        }));
    };

    const addPopularTag = (tag: string) => {
        if (!formData.tags.includes(tag)) {
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, tag],
            }));
        }
    };

    // ✅ FIXED TYPE
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        // Get user data from localStorage, fallback to anonymous
        let authorName = "anonymous";
        let authorEmail = "anonymous@example.com";
        let userJob = "developer";

        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                authorName = user.name || "anonymous";
                authorEmail = user.email || "anonymous@example.com";
                userJob = user.job || "developer";
            } catch (parseErr) {
                console.error("Could not parse user data, using anonymous", parseErr);
            }
        } else {
            console.error("No user data in localStorage, using anonymous");
        }

        const snippetPayload = {
            title: formData.title,
            description: formData.description,
            language: formData.language,
            code: formData.code,
            tags: formData.tags,
            author: {
                name: authorName,
                email: authorEmail,
                job: userJob,
            },
        };
        try {
            const res = await fetch(`${API_URL}/api/snippets/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token || ""}`
                },
                body: JSON.stringify(snippetPayload)
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to submit snippet");
            } else {
                setSuccess("Snippet created successfully!");
                // Reset form
                setFormData({
                    title: "",
                    description: "",
                    language: "javascript",
                    code: "",
                    tags: [],
                });
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "An error occurred";
            console.error("Submit error:", errorMsg);
            setError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const insertTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Tab") {
            e.preventDefault();

            const target = e.target as HTMLTextAreaElement;

            const start = target.selectionStart;
            const end = target.selectionEnd;
            const value = target.value;

            setFormData((prev) => ({
                ...prev,
                code: value.substring(0, start) + "  " + value.substring(end),
            }));

            setTimeout(() => {
                target.selectionStart = target.selectionEnd = start + 2;
            }, 0);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Form Section */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Create New Snippet
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Share your code with the community. Fill in the details below.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 font-medium">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-700 font-medium">{success}</p>
                            </div>
                        )}
                        {/* Title Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., React useDebounce Hook"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        {/* Description Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Briefly describe what this snippet does and when to use it..."
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-400 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                required
                            />
                        </div>

                        {/* Language Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                                Programming Language <span className="text-red-500">*</span>
                            </label>
                            <div className="grid md:grid-cols-5 grid-cols-4 gap-3">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.value}
                                        type="button"
                                        onClick={() => handleLanguageSelect(lang.value)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${formData.language === lang.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/20'
                                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                    >
                                        <span className={`w-3 h-3 rounded-full ${lang.color}`}></span>
                                        <span className={`font-medium ${formData.language === lang.value
                                            ? 'text-blue-700 dark:text-blue-400'
                                            : 'text-gray-700 dark:text-gray-300'
                                            }`}>
                                            {lang.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Code Editor */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                                    Code <span className="text-red-500">*</span>
                                </label>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Press Tab to indent
                                </span>
                            </div>
                            <div className="relative">
                                <div className="absolute top-0 left-0 right-0 h-10 bg-gray-800 rounded-t-xl flex items-center px-4 gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <span className="ml-4 text-xs text-gray-400 font-mono">
                                        {formData.language}.{formData.language === 'react' ? 'jsx' : formData.language}
                                    </span>
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    onKeyDown={insertTab}
                                    rows={12}
                                    placeholder="// Paste your code here..."
                                    className="w-full pt-12 pb-4 px-4 bg-gray-900 border border-gray-700 rounded-xl text-gray-100 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    spellCheck="false"
                                    required
                                />
                            </div>
                        </div>

                        {/* Tags Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-200 dark:border-blue-800"
                                    >
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Type a tag and press Enter..."
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />

                            {/* Popular Tags */}
                            <div className="mt-3">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Popular tags:</p>
                                <div className="flex flex-wrap gap-2">
                                    {popularTags.map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => addPopularTag(tag)}
                                            disabled={formData.tags.includes(tag)}
                                            className={`px-3 py-1 text-xs rounded-full border transition-all ${formData.tags.includes(tag)
                                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400'
                                                }`}
                                        >
                                            + {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.title || !formData.description || !formData.code}
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/25 disabled:opacity-90 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        Publish Snippet
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddSnippetPage;