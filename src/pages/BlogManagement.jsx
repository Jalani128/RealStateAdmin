import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  Calendar,
  User,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Heading1,
  Heading2,
  Save,
  MoreVertical,
  Globe,
  Lock,
} from "lucide-react";
import apiClient from "../services/apiClient";
import { cn, formatDate } from "../lib/utils";

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const BlogEditor = ({ isOpen, onClose, blog, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    featuredImage: "",
    author: "",
    status: "draft",
    seo: {
      metaTitle: "",
      metaDescription: "",
    },
    tags: [],
  });
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tagInput, setTagInput] = useState("");
  const editorRef = useRef(null);

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || "",
        slug: blog.slug || "",
        content: blog.content || "",
        featuredImage: blog.featuredImage || "",
        author: blog.author || "",
        status: blog.status || "draft",
        seo: blog.seo || { metaTitle: "", metaDescription: "" },
        tags: blog.tags || [],
      });
      setImagePreview(blog.featuredImage || "");
    } else {
      setFormData({
        title: "",
        slug: "",
        content: "",
        featuredImage: "",
        author: "",
        status: "draft",
        seo: { metaTitle: "", metaDescription: "" },
        tags: [],
      });
      setImagePreview("");
    }
    setError("");
  }, [blog, isOpen]);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, featuredImage: reader.result }));
    };
    reader.onerror = () => setError("Failed to read image");
    reader.readAsDataURL(file);
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleEditorInput = () => {
    setFormData((prev) => ({
      ...prev,
      content: editorRef.current?.innerHTML || "",
    }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
      };

      if (blog?._id) {
        await apiClient.put(`/api/blogs/${blog._id}`, payload);
      } else {
        await apiClient.post("/api/blogs", payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save blog post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 overflow-y-auto"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-50"
          >
            <div className="sticky top-0 bg-white border-b border-[#E6D5C3] px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-[#1C1B1A]">
                {blog ? "Edit Blog Post" : "Create Blog Post"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#FAF8F4] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#5A5856]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-md">
                  <div className="w-full h-48 rounded-xl bg-[#FAF8F4] border-2 border-dashed border-[#E6D5C3] flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-12 h-12 text-[#9CA3AF] mx-auto mb-2" />
                        <p className="text-sm text-[#9CA3AF]">Click to upload featured image</p>
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 w-10 h-10 bg-[#2E3192] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1E2163] transition-colors shadow-lg">
                    <ImageIcon className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Enter blog post title..."
                  className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all text-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="blog-post-slug"
                  className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                  Author
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Author name"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                  Content
                </label>
                <div className="border border-[#E6D5C3] rounded-xl overflow-hidden">
                  <div className="flex flex-wrap items-center gap-1 p-2 bg-[#FAF8F4] border-b border-[#E6D5C3]">
                    <button
                      type="button"
                      onClick={() => execCommand("bold")}
                      className="p-2 hover:bg-[#E6D5C3] rounded-lg transition-colors"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4 text-[#5A5856]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand("italic")}
                      className="p-2 hover:bg-[#E6D5C3] rounded-lg transition-colors"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4 text-[#5A5856]" />
                    </button>
                    <div className="w-px h-6 bg-[#E6D5C3] mx-1" />
                    <button
                      type="button"
                      onClick={() => execCommand("formatBlock", "h1")}
                      className="p-2 hover:bg-[#E6D5C3] rounded-lg transition-colors"
                      title="Heading 1"
                    >
                      <Heading1 className="w-4 h-4 text-[#5A5856]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand("formatBlock", "h2")}
                      className="p-2 hover:bg-[#E6D5C3] rounded-lg transition-colors"
                      title="Heading 2"
                    >
                      <Heading2 className="w-4 h-4 text-[#5A5856]" />
                    </button>
                    <div className="w-px h-6 bg-[#E6D5C3] mx-1" />
                    <button
                      type="button"
                      onClick={() => execCommand("insertUnorderedList")}
                      className="p-2 hover:bg-[#E6D5C3] rounded-lg transition-colors"
                      title="Bullet List"
                    >
                      <List className="w-4 h-4 text-[#5A5856]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => execCommand("insertOrderedList")}
                      className="p-2 hover:bg-[#E6D5C3] rounded-lg transition-colors"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-4 h-4 text-[#5A5856]" />
                    </button>
                    <div className="w-px h-6 bg-[#E6D5C3] mx-1" />
                    <button
                      type="button"
                      onClick={() => execCommand("formatBlock", "blockquote")}
                      className="p-2 hover:bg-[#E6D5C3] rounded-lg transition-colors"
                      title="Quote"
                    >
                      <Quote className="w-4 h-4 text-[#5A5856]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt("Enter URL:");
                        if (url) execCommand("createLink", url);
                      }}
                      className="p-2 hover:bg-[#E6D5C3] rounded-lg transition-colors"
                      title="Insert Link"
                    >
                      <LinkIcon className="w-4 h-4 text-[#5A5856]" />
                    </button>
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorInput}
                    dangerouslySetInnerHTML={{ __html: formData.content }}
                    className="min-h-[200px] p-4 bg-white text-[#1C1B1A] focus:outline-none prose prose-sm max-w-none"
                    style={{
                      minHeight: "200px",
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                    placeholder="Write your blog content here..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add a tag and press Enter..."
                    className="flex-1 px-4 py-2 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-[#2E3192] text-white rounded-xl font-medium hover:bg-[#1E2163] transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#2E3192]/10 text-[#2E3192] rounded-full text-sm font-medium"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-[#1E2163]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                  Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === "draft"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-4 h-4 text-[#2E3192]"
                    />
                    <Lock className="w-4 h-4 text-[#9CA3AF]" />
                    <span className="text-sm text-[#5A5856]">Draft</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === "published"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-4 h-4 text-[#2E3192]"
                    />
                    <Globe className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-[#5A5856]">Published</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-[#E6D5C3] pt-6">
                <h3 className="text-base font-semibold text-[#1C1B1A] mb-4">SEO Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.seo.metaTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo: { ...formData.seo, metaTitle: e.target.value },
                        })
                      }
                      placeholder="SEO title (max 60 chars)"
                      maxLength={60}
                      className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all"
                    />
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      {formData.seo.metaTitle.length}/60 characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.seo.metaDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          seo: { ...formData.seo, metaDescription: e.target.value },
                        })
                      }
                      placeholder="SEO description (max 160 chars)"
                      maxLength={160}
                      rows={2}
                      className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all resize-none"
                    />
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      {formData.seo.metaDescription.length}/160 characters
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E6D5C3]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-[#FAF8F4] text-[#5A5856] rounded-xl font-medium hover:bg-[#E6D5C3] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-[#2E3192] text-white rounded-xl font-medium hover:bg-[#1E2163] transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {blog ? "Update" : "Create"} Post
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, blog, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(blog._id);
      onClose();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1C1B1A]">Delete Blog Post</h3>
                <p className="text-sm text-[#5A5856]">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-[#5A5856] mb-6">
              Are you sure you want to delete <strong>"{blog?.title}"</strong>? This will permanently remove the blog post.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#FAF8F4] text-[#5A5856] rounded-xl font-medium hover:bg-[#E6D5C3] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/blogs");
      if (response.data.success) {
        setBlogs(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      showNotification("Failed to load blog posts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/api/blogs/${id}`);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      showNotification("Blog post deleted successfully");
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  const toggleStatus = async (blog) => {
    try {
      const newStatus = blog.status === "published" ? "draft" : "published";
      await apiClient.put(`/api/blogs/${blog._id}`, { status: newStatus });
      setBlogs((prev) =>
        prev.map((b) => (b._id === blog._id ? { ...b, status: newStatus } : b))
      );
      showNotification(`Post ${newStatus === "published" ? "published" : "unpublished"} successfully`);
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to update status", "error");
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || blog.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen pb-12 px-4 bg-[#FAF8F4]">
      <div className="max-w-7xl mx-auto pt-8">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-[#1C1B1A] mb-1">Blog Management</h1>
            <p className="text-[#5A5856] text-sm">Create and manage your blog posts</p>
          </div>
          <button
            onClick={() => {
              setSelectedBlog(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-[#2E3192] text-white rounded-xl font-medium hover:bg-[#1E2163] transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Post
          </button>
        </motion.div>

        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "mb-6 p-4 rounded-xl flex items-center gap-3",
              notification.type === "error"
                ? "bg-red-50 border border-red-200"
                : "bg-green-50 border border-green-200"
            )}
          >
            {notification.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <p className={cn("text-sm font-medium", notification.type === "error" ? "text-red-600" : "text-green-600")}>
              {notification.message}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E6D5C3] shadow-card mb-6"
        >
          <div className="p-6 border-b border-[#E6D5C3] flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all"
              />
            </div>
            <div className="relative min-w-[180px]">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#2E3192] animate-spin mb-4" />
              <p className="text-[#9CA3AF]">Loading blog posts...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <FileText className="w-12 h-12 text-[#E6D5C3] mb-4" />
              <p className="text-[#5A5856] font-medium mb-1">No blog posts found</p>
              <p className="text-[#9CA3AF] text-sm">
                {searchQuery || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first blog post to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAF8F4] border-b border-[#E6D5C3]">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#5A5856] uppercase tracking-wider">
                      Post
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#5A5856] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#5A5856] uppercase tracking-wider">
                      Author
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#5A5856] uppercase tracking-wider">
                      Created
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-[#5A5856] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F1E8]">
                  {filteredBlogs.map((blog, index) => (
                    <motion.tr
                      key={blog._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-[#FAF8F4]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded-lg bg-[#2E3192]/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {blog.featuredImage ? (
                              <img
                                src={blog.featuredImage}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FileText className="w-6 h-6 text-[#2E3192]" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1C1B1A] line-clamp-1 max-w-[250px]">
                              {blog.title}
                            </p>
                            <p className="text-xs text-[#9CA3AF]">/{blog.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(blog)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors",
                            blog.status === "published"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          )}
                        >
                          {blog.status === "published" ? (
                            <Globe className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          {blog.status === "published" ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#5A5856]">{blog.author || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#9CA3AF]">
                          {formatDate(blog.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedBlog(blog);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-[#9CA3AF] hover:text-[#2E3192] hover:bg-[#2E3192]/10 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBlog(blog);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <div className="text-center text-sm text-[#9CA3AF]">
          Showing {filteredBlogs.length} of {blogs.length} blog posts
        </div>
      </div>

      <BlogEditor
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        blog={selectedBlog}
        onSave={() => {
          fetchBlogs();
          showNotification(
            selectedBlog ? "Blog post updated successfully" : "Blog post created successfully"
          );
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        blog={selectedBlog}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default BlogManagement;
