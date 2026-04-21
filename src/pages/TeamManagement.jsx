import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  User,
  Mail,
  Phone,
  Shield,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Globe,
} from "lucide-react";
import apiClient from "../services/apiClient";
import { cn, formatDate } from "../lib/utils";

const ROLES = ["Agent", "Manager", "Admin", "Team Lead", "Support", "Developer"];

const SOCIAL_FIELDS = [
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, placeholder: "linkedin.com/in/" },
  { key: "twitter", label: "Twitter", icon: Twitter, placeholder: "twitter.com/" },
  { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "instagram.com/" },
  { key: "facebook", label: "Facebook", icon: Facebook, placeholder: "facebook.com/" },
  { key: "website", label: "Website", icon: Globe, placeholder: "yoursite.com" },
];

const TeamMemberModal = ({ isOpen, onClose, member, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    role: "Agent",
    email: "",
    phone: "",
    image: "",
    bio: "",
    socialLinks: {},
  });
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || "",
        role: member.role || "Agent",
        email: member.email || "",
        phone: member.phone || "",
        image: member.image || "",
        bio: member.bio || "",
        socialLinks: member.socialLinks || {},
      });
      setImagePreview(member.image || "");
    } else {
      setFormData({
        name: "",
        role: "Agent",
        email: "",
        phone: "",
        image: "",
        bio: "",
        socialLinks: {},
      });
      setImagePreview("");
    }
    setError("");
  }, [member, isOpen]);

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

    setUploading(true);
    setError("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, image: reader.result }));
      setUploading(false);
    };
    reader.onerror = () => {
      setError("Failed to read image");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (member?._id) {
        await apiClient.put(`/api/team/${member._id}`, formData);
      } else {
        await apiClient.post("/api/team", formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save team member");
    } finally {
      setSaving(false);
    }
  };

  const updateSocialLink = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -50 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl z-[101]"
          >
            <div className="sticky top-0 bg-white border-b border-[#E6D5C3] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1C1B1A]">
                {member ? "Edit Team Member" : "Add Team Member"}
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
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl bg-[#FAF8F4] border-2 border-dashed border-[#E6D5C3] flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-[#9CA3AF]" />
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 w-10 h-10 bg-[#2E3192] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1E2163] transition-colors shadow-lg">
                    {uploading ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="text-xs text-[#9CA3AF] mt-2">Upload profile photo</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                    Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                    Role *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all appearance-none cursor-pointer"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1B1A] mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Brief description about the team member..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1C1B1A] mb-3">
                  Social Links
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SOCIAL_FIELDS.map(({ key, label, icon: Icon, placeholder }) => (
                    <div key={key}>
                      <div className="relative">
                        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                        <input
                          type="url"
                          value={formData.socialLinks[key] || ""}
                          onChange={(e) => updateSocialLink(key, e.target.value)}
                          placeholder={placeholder}
                          className="w-full pl-10 pr-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all"
                        />
                      </div>
                    </div>
                  ))}
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
                      <CheckCircle className="w-4 h-4" />
                      {member ? "Update" : "Add"} Member
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

const DeleteConfirmModal = ({ isOpen, onClose, member, onConfirm }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(member._id);
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
                <h3 className="text-lg font-bold text-[#1C1B1A]">Delete Team Member</h3>
                <p className="text-sm text-[#5A5856]">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-[#5A5856] mb-6">
              Are you sure you want to delete <strong>{member?.name}</strong>? This will permanently remove them from the team.
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

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/team");
      if (response.data.success) {
        setTeamMembers(response.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch team members:", err);
      showNotification("Failed to load team members", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/api/team/${id}`);
      setTeamMembers((prev) => prev.filter((m) => m._id !== id));
      showNotification("Team member deleted successfully");
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "All" || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    const colors = {
      Admin: "bg-purple-100 text-purple-700",
      Manager: "bg-blue-100 text-blue-700",
      "Team Lead": "bg-amber-100 text-amber-700",
      Agent: "bg-green-100 text-green-700",
      Support: "bg-cyan-100 text-cyan-700",
      Developer: "bg-pink-100 text-pink-700",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen pb-12 px-4 bg-[#FAF8F4]">
      <div className="max-w-7xl mx-auto pt-8">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-[#1C1B1A] mb-1">Team Management</h1>
            <p className="text-[#5A5856] text-sm">Manage your team members and their roles</p>
          </div>
          <button
            onClick={() => {
              setSelectedMember(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-[#2E3192] text-white rounded-xl font-medium hover:bg-[#1E2163] transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Member
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
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all"
              />
            </div>
            <div className="relative min-w-[180px]">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF8F4] border border-[#E6D5C3] rounded-xl text-[#1C1B1A] focus:outline-none focus:border-[#2E3192] focus:ring-2 focus:ring-[#2E3192]/20 transition-all appearance-none cursor-pointer"
              >
                <option value="All">All Roles</option>
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#2E3192] animate-spin mb-4" />
              <p className="text-[#9CA3AF]">Loading team members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <User className="w-12 h-12 text-[#E6D5C3] mb-4" />
              <p className="text-[#5A5856] font-medium mb-1">No team members found</p>
              <p className="text-[#9CA3AF] text-sm">
                {searchQuery || filterRole !== "All"
                  ? "Try adjusting your search or filters"
                  : "Add your first team member to get started"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAF8F4] border-b border-[#E6D5C3]">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#5A5856] uppercase tracking-wider">
                      Member
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#5A5856] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#5A5856] uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-[#5A5856] uppercase tracking-wider">
                      Added
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-[#5A5856] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F1E8]">
                  {filteredMembers.map((member, index) => (
                    <motion.tr
                      key={member._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-[#FAF8F4]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#2E3192]/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-[#2E3192]" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1C1B1A]">{member.name}</p>
                            {member.bio && (
                              <p className="text-sm text-[#9CA3AF] truncate max-w-[200px]">
                                {member.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
                            getRoleBadgeColor(member.role)
                          )}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {member.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-[#9CA3AF]" />
                              <span className="text-[#5A5856]">{member.email}</span>
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-[#9CA3AF]" />
                              <span className="text-[#5A5856]">{member.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#9CA3AF]">
                          {formatDate(member.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {member.socialLinks?.linkedin && (
                            <a
                              href={member.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-[#9CA3AF] hover:text-[#2E3192] hover:bg-[#2E3192]/10 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setIsModalOpen(true);
                            }}
                            className="p-2 text-[#9CA3AF] hover:text-[#2E3192] hover:bg-[#2E3192]/10 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMember(member);
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
          Showing {filteredMembers.length} of {teamMembers.length} team members
        </div>
      </div>

      <TeamMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        member={selectedMember}
        onSave={() => {
          fetchTeamMembers();
          showNotification(
            selectedMember ? "Team member updated successfully" : "Team member added successfully"
          );
        }}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        member={selectedMember}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default TeamManagement;
