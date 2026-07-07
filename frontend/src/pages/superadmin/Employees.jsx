import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import employeeService from "../../services/employeeService";
import groupService from "../../services/groupService";

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Credentials reveal modal
  const [credentials, setCredentials] = useState(null); // { employeeId, tempPassword, action: 'created' | 'reset' }

  // Selected Employee
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    groupIds: [],
    status: true,
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [empRes, groupsRes] = await Promise.all([
        employeeService.getAllEmployees(page, limit, search),
        groupService.getAllGroups()
      ]);

      if (empRes.success) {
        setEmployees(empRes.data || []);
        setTotalPages(empRes.totalPages || 1);
        setTotalRecords(empRes.totalRecords || (empRes.data || []).length);
      } else {
        setError("Failed to load employee accounts.");
      }

      if (groupsRes.success) {
        setGroups(groupsRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading employees and departments scopes.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const validateForm = (isEdit = false) => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    else if (formData.name.length < 2) errors.name = "Name must be at least 2 characters";
    
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";
    
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(formData.phone)) errors.phone = "Phone number must be a 10-digit number";
    
    if (!formData.designation.trim()) errors.designation = "Designation is required";
    else if (formData.designation.length < 2) errors.designation = "Designation must be at least 2 characters";
    
    if (formData.groupIds.length === 0) errors.groupIds = "Select at least one department/group";
    
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

  const handleGroupToggle = (groupId) => {
    setFormData(prev => {
      const isChecked = prev.groupIds.includes(groupId);
      const updated = isChecked
        ? prev.groupIds.filter(id => id !== groupId)
        : [...prev.groupIds, groupId];
      return { ...prev, groupIds: updated };
    });
    if (formErrors.groupIds) {
      setFormErrors(prev => ({ ...prev, groupIds: "" }));
    }
  };

  const handleAddOpen = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      designation: "",
      groupIds: [],
      status: true,
    });
    setFormErrors({});
    setIsAddOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    setError("");
    try {
      const res = await employeeService.createEmployee(formData);
      if (res.success) {
        setSuccess("Employee account created successfully!");
        setIsAddOpen(false);
        // Show credentials modal
        setCredentials({
          employeeId: res.data.employeeId || res.data.employee?.employee_id,
          tempPassword: res.data.temporaryPassword,
          action: "created"
        });
        fetchData();
      } else {
        setError(res.message || "Failed to create employee account.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOpen = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      name: emp.name || "",
      email: emp.email || "",
      phone: emp.phone || "",
      designation: emp.designation || "",
      groupIds: emp.groups ? emp.groups.map(g => g.id) : [],
      status: emp.status,
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await employeeService.updateEmployee(selectedEmployee.id, formData);
      if (res.success) {
        setSuccess("Employee profile updated successfully!");
        setIsEditOpen(false);
        fetchData();
      } else {
        setError(res.message || "Failed to update employee profile.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusToggle = async (emp) => {
    try {
      const newStatus = !emp.status;
      const payload = {
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        designation: emp.designation,
        groupIds: emp.groups ? emp.groups.map(g => g.id) : [],
        status: newStatus,
      };
      
      const res = await employeeService.updateEmployee(emp.id, payload);
      if (res.success) {
        setSuccess(`Employee status updated to ${newStatus ? "Active" : "Inactive"}!`);
        setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, status: newStatus } : e));
      } else {
        setError(res.message || "Failed to toggle status.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while toggling status.");
    }
  };

  const handleResetPassword = async (emp) => {
    if (!window.confirm(`Are you sure you want to reset the password for employee ${emp.name}?`)) return;
    
    setError("");
    try {
      const res = await employeeService.resetPassword(emp.id);
      if (res.success) {
        setCredentials({
          employeeId: emp.employee_id,
          tempPassword: res.data.temporaryPassword,
          action: "reset"
        });
        setSuccess("Employee password reset successfully!");
      } else {
        setError("Failed to reset password.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while resetting password.");
    }
  };

  const handleViewDetail = (emp) => {
    navigate(`/superadmin/employees/${emp.id}`);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const activeEmployeesCount = employees.filter(e => e.status).length;

  return (
    <div className="select-none text-left py-2 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Employees Management</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Provision staff profiles, assign department scopes, and monitor employee status.
          </p>
        </div>
        <button
          onClick={handleAddOpen}
          className="bg-[#1b3b6f] hover:bg-[#12284c] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-slate-200/50 cursor-pointer flex items-center gap-2 self-start md:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add New Employee
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-[#1b3b6f] rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Employees</span>
            <h4 className="text-xl font-extrabold text-slate-800 mt-0.5">{totalRecords}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Employees</span>
            <h4 className="text-xl font-extrabold text-slate-800 mt-0.5">{activeEmployeesCount} / {employees.length}</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Groups</span>
            <h4 className="text-xl font-extrabold text-slate-800 mt-0.5">{groups.length}</h4>
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

      {/* Main Table Card */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100 flex items-center">
          <div className="relative w-full max-w-sm">
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search employees by name, ID, or email..."
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600 font-medium"
            />
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-[#1b3b6f]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span className="text-xs font-bold text-slate-500 animate-pulse">Loading employees...</span>
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl mb-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" />
              </svg>
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Employees Found</h4>
            <p className="text-xs text-slate-400 font-semibold mt-1">Try searching for something else or add a new employee profile.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                  <th className="px-6 py-4">ID & Employee</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Designation</th>
                  <th className="px-6 py-4">Assigned Scope</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center flex-shrink-0 border border-slate-200">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-800 text-sm truncate">{emp.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{emp.employee_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-800 truncate">{emp.email}</span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{emp.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[11px]">
                        {emp.designation}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {emp.groups && emp.groups.length > 0 ? (
                          emp.groups.map(g => (
                            <span key={g.id} className="px-1.5 py-0.5 bg-blue-50 text-[#1b3b6f] border border-blue-100 rounded text-[10px] font-bold">
                              {g.group_name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusToggle(emp)}
                        className={`w-10 h-5.5 rounded-full p-0.5 cursor-pointer transition-colors relative flex items-center ${
                          emp.status ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transform transition-transform ${
                          emp.status ? "translate-x-4.5" : "translate-x-0"
                        }`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetail(emp)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditOpen(emp)}
                        className="p-1.5 hover:bg-slate-100 text-blue-600 hover:text-blue-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Account"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleResetPassword(emp)}
                        className="p-1.5 hover:bg-slate-100 text-amber-600 hover:text-amber-800 rounded-lg transition-colors cursor-pointer"
                        title="Reset Password"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="7.5" cy="16.5" r="4.5" />
                          <path d="m21 3-9 9m3-6 3 3m2-2 2 2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && totalPages > 1 && (
          <div className="p-5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 transition-all cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-lg p-7 text-left space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Add New Employee Profile</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1.5 pl-0.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#1b3b6f] font-medium"
                    placeholder="Enter name"
                  />
                  {formErrors.name && <span className="text-[10px] text-red-500 font-bold mt-1 pl-0.5">{formErrors.name}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1.5 pl-0.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#1b3b6f] font-medium"
                    placeholder="email@example.com"
                  />
                  {formErrors.email && <span className="text-[10px] text-red-500 font-bold mt-1 pl-0.5">{formErrors.email}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1.5 pl-0.5">Phone (10-Digit)</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#1b3b6f] font-medium"
                    placeholder="e.g. 9876543210"
                  />
                  {formErrors.phone && <span className="text-[10px] text-red-500 font-bold mt-1 pl-0.5">{formErrors.phone}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1.5 pl-0.5">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#1b3b6f] font-medium"
                    placeholder="e.g. Inspector"
                  />
                  {formErrors.designation && <span className="text-[10px] text-red-500 font-bold mt-1 pl-0.5">{formErrors.designation}</span>}
                </div>
              </div>

              {/* Groups Checkboxes */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 mb-2 pl-0.5">Assign Scope / Groups</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-36 overflow-y-auto space-y-2">
                  {groups.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">No groups available to assign.</span>
                  ) : (
                    groups.map((group) => (
                      <label key={group.id} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.groupIds.includes(group.id)}
                          onChange={() => handleGroupToggle(group.id)}
                          className="rounded border-slate-300 text-[#1b3b6f] focus:ring-[#1b3b6f]"
                        />
                        <span className="font-semibold">{group.group_name}</span>
                      </label>
                    ))
                  )}
                </div>
                {formErrors.groupIds && <span className="text-[10px] text-red-500 font-bold mt-1 pl-0.5">{formErrors.groupIds}</span>}
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
                  {submitting ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-lg p-7 text-left space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Edit Employee Profile</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1.5 pl-0.5">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#1b3b6f] font-medium"
                  />
                  {formErrors.name && <span className="text-[10px] text-red-500 font-bold mt-1 pl-0.5">{formErrors.name}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1.5 pl-0.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#1b3b6f] font-medium"
                  />
                  {formErrors.email && <span className="text-[10px] text-red-500 font-bold mt-1 pl-0.5">{formErrors.email}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1.5 pl-0.5">Phone (10-Digit)</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#1b3b6f] font-medium"
                  />
                  {formErrors.phone && <span className="text-[10px] text-red-500 font-bold mt-1 pl-0.5">{formErrors.phone}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-bold text-slate-500 mb-1.5 pl-0.5">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-[#1b3b6f] font-medium"
                  />
                  {formErrors.designation && <span className="text-[10px] text-red-500 font-bold mt-1 pl-0.5">{formErrors.designation}</span>}
                </div>
              </div>

              {/* Groups Checkboxes */}
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 mb-2 pl-0.5">Assign Scope / Groups</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-36 overflow-y-auto space-y-2">
                  {groups.map((group) => (
                    <label key={group.id} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.groupIds.includes(group.id)}
                        onChange={() => handleGroupToggle(group.id)}
                        className="rounded border-slate-300 text-[#1b3b6f] focus:ring-[#1b3b6f]"
                      />
                      <span className="font-semibold">{group.group_name}</span>
                    </label>
                  ))}
                </div>
                {formErrors.groupIds && <span className="text-[10px] text-red-500 font-bold mt-1 pl-0.5">{formErrors.groupIds}</span>}
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

      {/* Employee Detail Modal */}
      {isDetailOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-md p-7 text-left space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Employee Account Profile</h3>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-[#1b3b6f] text-white text-base font-extrabold flex items-center justify-center flex-shrink-0">
                {selectedEmployee.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="text-sm font-black text-slate-800 truncate">{selectedEmployee.name}</h4>
                <span className="text-[10px] text-slate-400 font-bold">{selectedEmployee.employee_id}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                selectedEmployee.status
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}>
                {selectedEmployee.status ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Profile Details List */}
            <div className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400">DESIGNATION</span>
                <span className="text-slate-800">{selectedEmployee.designation}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400">EMAIL ADDRESS</span>
                <span className="text-slate-800 truncate max-w-[200px]">{selectedEmployee.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400">PHONE NUMBER</span>
                <span className="text-slate-800">{selectedEmployee.phone}</span>
              </div>
              <div className="flex flex-col gap-1.5 border-b border-slate-50 pb-3">
                <span className="text-slate-400">ASSIGNED DEPARTMENTS</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedEmployee.groups && selectedEmployee.groups.length > 0 ? (
                    selectedEmployee.groups.map(g => (
                      <span key={g.id} className="px-2 py-0.5 bg-blue-50 text-[#1b3b6f] border border-blue-100 rounded text-[10px] font-bold">
                        {g.group_name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">None Assigned</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsDetailOpen(false)}
              className="w-full bg-[#1b3b6f] hover:bg-[#12284c] text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer text-center"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* Credentials Reveal Modal (Copyable) */}
      {credentials && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-sm p-7 text-left space-y-5 animate-scale-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-slate-800">
                {credentials.action === "created" ? "Employee Created Successfully!" : "Password Reset Successfully!"}
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                Please copy and share these temporary credentials with the employee immediately.
              </p>
            </div>

            {/* Credentials Fields */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4.5 space-y-3.5 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Employee ID</span>
                  <span className="text-slate-800 font-extrabold mt-0.5">{credentials.employeeId}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(credentials.employeeId)}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold px-2 py-1 bg-white hover:bg-blue-50 border border-slate-200 rounded cursor-pointer transition-all"
                >
                  Copy
                </button>
              </div>

              <div className="flex justify-between items-center border-t border-slate-200/60 pt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Temporary Password</span>
                  <span className="text-slate-850 font-extrabold font-mono text-sm tracking-wide mt-0.5">{credentials.tempPassword}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(credentials.tempPassword)}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold px-2 py-1 bg-white hover:bg-blue-50 border border-slate-200 rounded cursor-pointer transition-all"
                >
                  Copy
                </button>
              </div>
            </div>

            <button
              onClick={() => setCredentials(null)}
              className="w-full bg-[#1b3b6f] hover:bg-[#12284c] text-white py-2.5 rounded-xl font-bold text-xs cursor-pointer text-center"
            >
              Done & Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
