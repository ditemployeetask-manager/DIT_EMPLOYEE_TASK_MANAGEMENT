import React, { useState, useEffect } from "react";
import groupService from "../../services/groupService";

const Group = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search & Modals
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Form Field State
  const [formData, setFormData] = useState({
    groupName: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await groupService.getAllGroups();
      if (res.success) {
        setGroups(res.data || []);
      } else {
        setError("Failed to fetch groups.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading groups.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.groupName.trim()) {
      errors.groupName = "Group name is required.";
    } else if (formData.groupName.length < 2) {
      errors.groupName = "Group name must be at least 2 characters.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddOpen = () => {
    setFormData({ groupName: "", description: "" });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await groupService.createGroup(formData);
      if (res.success) {
        setSuccess("Group created successfully!");
        setIsAddOpen(false);
        fetchGroups();
      } else {
        setError(res.message || "Failed to create group.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOpen = (group) => {
    setSelectedGroup(group);
    setFormData({
      groupName: group.group_name || "",
      description: group.description || "",
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await groupService.updateGroup(selectedGroup.id, formData);
      if (res.success) {
        setSuccess("Group details updated successfully!");
        setIsEditOpen(false);
        fetchGroups();
      } else {
        setError(res.message || "Failed to update group.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (group) => {
    try {
      const newStatus = !group.status;
      const res = await groupService.updateGroupStatus(group.id, newStatus);
      if (res.success) {
        setSuccess(`Group status changed to ${newStatus ? "Active" : "Inactive"}.`);
        setGroups(prev => prev.map(g => g.id === group.id ? { ...g, status: newStatus } : g));
      } else {
        setError(res.message || "Failed to update group status.");
      }
    } catch (err) {
      setError(err.message || "An error occurred.");
    }
  };

  // Local Search Filtering
  const filteredGroups = groups.filter(g =>
    (g.group_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (g.description || "").toLowerCase().includes(search.toLowerCase()) ||
    (g.admins || []).some(admin => (admin.name || "").toLowerCase().includes(search.toLowerCase()))
  );

  const totalGroups = groups.length;
  const activeGroups = groups.filter(g => g.status).length;
  const inactiveGroups = totalGroups - activeGroups;

  return (
    <div className="select-none text-left py-2 space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Groups & Departments</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Create and manage structural units, task forces, and department divisions.
          </p>
        </div>
        <button
          onClick={handleAddOpen}
          className="bg-[#1b3b6f] hover:bg-[#12284c] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-slate-200/50 cursor-pointer flex items-center gap-2 self-start md:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New Group
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-[#1b3b6f] rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Divisions</span>
            <h4 className="text-xl font-extrabold text-slate-800 mt-0.5">{totalGroups}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Divisions</span>
            <h4 className="text-xl font-extrabold text-slate-800 mt-0.5">{activeGroups}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-50 text-slate-500 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inactive Divisions</span>
            <h4 className="text-xl font-extrabold text-slate-800 mt-0.5">{inactiveGroups}</h4>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* Table & Filtering */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100 flex items-center">
          <div className="relative w-full max-w-sm">
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search groups by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600 font-medium"
            />
          </div>
        </div>

        {/* Loading / Empty States */}
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-[#1b3b6f]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span className="text-xs font-bold text-slate-500 animate-pulse">Loading groups...</span>
            </div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl mb-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Groups Found</h4>
            <p className="text-xs text-slate-400 font-semibold mt-1">Add a new group or try another search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                  <th className="px-6 py-4">Group Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Assigned Admins</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-slate-50/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200 flex-shrink-0">
                          {group.group_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800 text-sm truncate">{group.group_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-500 font-medium leading-relaxed max-w-sm truncate" title={group.description}>
                        {group.description || <span className="italic text-slate-400">No description provided</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                        {group.admins && group.admins.length > 0 ? (
                          group.admins.map((admin) => (
                            <span
                              key={admin.id}
                              className="px-2 py-0.5 bg-blue-50 text-[#1b3b6f] border border-blue-100 rounded text-[10px] font-bold"
                              title={`${admin.name} (${admin.employee_id})`}
                            >
                              {admin.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic font-medium">No admins assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusToggle(group)}
                        className={`w-10 h-5.5 rounded-full p-0.5 cursor-pointer transition-colors relative flex items-center ${
                          group.status ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform ${
                          group.status ? "translate-x-4.5" : "translate-x-0"
                        }`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEditOpen(group)}
                        className="p-1.5 hover:bg-slate-100 text-blue-600 hover:text-blue-800 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Edit Division"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-[10px] font-bold">Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Group Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-md p-7 text-left space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Create Organizational Group</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 mb-1.5 pl-0.5">Group / Department Name</label>
                <input
                  type="text"
                  name="groupName"
                  value={formData.groupName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#1b3b6f] font-medium"
                  placeholder="e.g. Finance Division"
                />
                {formErrors.groupName && <span className="text-[10px] text-red-500 font-bold mt-1 pl-0.5">{formErrors.groupName}</span>}
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 mb-1.5 pl-0.5">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#1b3b6f] font-medium resize-none"
                  placeholder="Provide scope and functional responsibilities of this division..."
                />
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-xs cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#1b3b6f] hover:bg-[#12284c] text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  {submitting ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-md p-7 text-left space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Edit Organizational Group</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 mb-1.5 pl-0.5">Group / Department Name</label>
                <input
                  type="text"
                  name="groupName"
                  value={formData.groupName}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#1b3b6f] font-medium"
                />
                {formErrors.groupName && <span className="text-[10px] text-red-500 font-bold mt-1 pl-0.5">{formErrors.groupName}</span>}
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 mb-1.5 pl-0.5">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#1b3b6f] font-medium resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-xs cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#1b3b6f] hover:bg-[#12284c] text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer text-center flex items-center justify-center gap-2"
                >
                  {submitting ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Group;
