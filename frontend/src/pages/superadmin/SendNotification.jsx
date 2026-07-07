import React, { useState, useEffect } from "react";
import notificationService from "../../services/notificationService";
import adminService from "../../services/adminService";
import employeeService from "../../services/employeeService";

const SendNotification = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("all_users"); // all_users, all_admins, all_employees, specific_user
  const [selectedUser, setSelectedUser] = useState("");
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch users when specific_user target is selected
  useEffect(() => {
    if (targetType === "specific_user" && usersList.length === 0) {
      fetchUsers();
    }
  }, [targetType]);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    setError("");
    try {
      // Fetch admins and employees with limit=100 to satisfy backend paginationSchema constraints
      const [adminsRes, employeesRes] = await Promise.all([
        adminService.getAllAdmins(1, 100, ""),
        employeeService.getAllEmployees(1, 100, "")
      ]);

      const admins = (adminsRes.data || []).map(u => ({ ...u, label: `${u.name} (${u.employee_id}) - Admin` }));
      const employees = (employeesRes.data || []).map(u => ({ ...u, label: `${u.name} (${u.employee_id}) - Employee` }));
      
      setUsersList([...admins, ...employees]);
    } catch (err) {
      setError("Failed to load users list. Please try again.");
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !message.trim()) {
      setError("Notification title and message are required.");
      return;
    }

    setLoading(true);

    try {
      if (targetType === "specific_user") {
        if (!selectedUser) {
          setError("Please select a target user.");
          setLoading(false);
          return;
        }
        await notificationService.createNotification({
          userId: parseInt(selectedUser),
          title,
          message
        });
        setSuccess(`Notification sent to selected user!`);
      } else {
        // Broadcast type
        let targets = [];
        if (targetType === "all_admins" || targetType === "all_users") {
          const res = await adminService.getAllAdmins(1, 100, "");
          targets = [...targets, ...(res.data || [])];
        }
        if (targetType === "all_employees" || targetType === "all_users") {
          const res = await employeeService.getAllEmployees(1, 100, "");
          targets = [...targets, ...(res.data || [])];
        }

        if (targets.length === 0) {
          setError("No target users found for this broadcast.");
          setLoading(false);
          return;
        }

        // Send notifications sequentially or in parallel
        await Promise.all(
          targets.map(target =>
            notificationService.createNotification({
              userId: target.id,
              title,
              message
            })
          )
        );

        setSuccess(`Broadcast successful! Sent to ${targets.length} users.`);
      }

      // Reset form
      setTitle("");
      setMessage("");
      setSelectedUser("");
    } catch (err) {
      setError(err.message || "Failed to send notifications.");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on query
  const filteredUsers = usersList.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto select-none py-4">
      {/* Title block */}
      <div className="mb-6 text-left">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Send Notification</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">Broadcast custom notifications or direct alerts to system members</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-left">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3.5 rounded-xl text-xs font-semibold mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-600 p-3.5 rounded-xl text-xs font-semibold mb-6 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-6">
          {/* Target Selection */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-500 mb-2 pl-1">
              Select Audience
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: "all_users", label: "All Users" },
                { value: "all_admins", label: "All Admins" },
                { value: "all_employees", label: "All Employees" },
                { value: "specific_user", label: "Specific User" }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTargetType(opt.value)}
                  className={`p-3 text-xs font-semibold border rounded-xl transition-all cursor-pointer ${
                    targetType === opt.value
                      ? "bg-[#1b3b6f] text-white border-[#1b3b6f] shadow-sm shadow-blue-900/10"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Specific User Autocomplete dropdown */}
          {targetType === "specific_user" && (
            <div className="flex flex-col animate-fade-in">
              <label className="text-xs font-bold text-slate-500 mb-2 pl-1">
                Choose Target User
              </label>
              <div className="relative">
                {fetchingUsers ? (
                  <div className="text-xs text-slate-400 font-semibold p-3 animate-pulse">Loading system users...</div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Type name or Employee ID to filter..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-blue-600"
                    />
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-blue-600 font-normal"
                    >
                      <option value="">-- Select a User --</option>
                      {filteredUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notification Title */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-500 mb-2 pl-1" htmlFor="notifTitle">
              Notification Title
            </label>
            <input
              id="notifTitle"
              type="text"
              placeholder="e.g. System Maintenance Window"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/10 transition-all font-normal"
            />
          </div>

          {/* Notification Message */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2 pl-1">
              <label className="text-xs font-bold text-slate-500" htmlFor="notifMessage">
                Message Content
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">{message.length} characters</span>
            </div>
            <textarea
              id="notifMessage"
              rows="5"
              placeholder="Write the broadcast message details here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/10 transition-all font-normal resize-none"
            />
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1b3b6f] hover:bg-[#12284c] disabled:bg-slate-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-slate-200/50 cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>Broadcasting Notifications...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Broadcast Notification</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendNotification;
