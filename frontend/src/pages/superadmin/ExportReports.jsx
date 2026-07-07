import React, { useState, useEffect, useRef } from "react";
import api from "../../utils/api";
import groupService from "../../services/groupService";
import employeeService from "../../services/employeeService";
import adminService from "../../services/adminService";
import CustomDatePicker from "../../components/common/CustomDatePicker";

// Helper to format date into readable string
const formatReadableDate = (dateStr) => {
  if (!dateStr) return "Select Date";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Select Date";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const ExportReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Date range states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter scopes: 'all', 'group', 'employee', 'admins'
  const [scope, setScope] = useState("all");
  
  // Selection states
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  // Lists for dropdowns
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Fetch groups and users when scope changes
  useEffect(() => {
    if (scope === "group" && groups.length === 0) {
      loadGroups();
    } else if (scope === "employee" && users.length === 0) {
      loadUsers();
    }
  }, [scope]);

  const loadGroups = async () => {
    setLoadingFilters(true);
    try {
      const res = await groupService.getAllGroups();
      if (res.success) {
        setGroups(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load groups for filter:", err);
    } finally {
      setLoadingFilters(false);
    }
  };

  const loadUsers = async () => {
    setLoadingFilters(true);
    try {
      // Fetch both admins and employees
      const [adminsRes, employeesRes] = await Promise.all([
        adminService.getAllAdmins(1, 100, ""),
        employeeService.getAllEmployees(1, 100, "")
      ]);

      const admins = (adminsRes.data || []).map(u => ({ ...u, label: `${u.name} (${u.employee_id}) - Admin` }));
      const employees = (employeesRes.data || []).map(u => ({ ...u, label: `${u.name} (${u.employee_id}) - Employee` }));
      
      setUsers([...admins, ...employees]);
    } catch (err) {
      console.error("Failed to load users for filter:", err);
    } finally {
      setLoadingFilters(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    // Build query params based on selected scope
    const params = new URLSearchParams();
    if (scope === "group") {
      if (!selectedGroupId) {
        setError("Please select a group division to export.");
        setLoading(false);
        return;
      }
      params.append("groupId", selectedGroupId);
    } else if (scope === "employee") {
      if (!selectedUserId) {
        setError("Please select an employee profile to export.");
        setLoading(false);
        return;
      }
      params.append("userId", selectedUserId);
    } else if (scope === "admins") {
      params.append("roleId", "2"); // Role ID for Admins is 2
    }

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString() ? `?${params.toString()}` : "";

    try {
      const res = await api.get(`/reports/export${queryString}`);

      // Verify blob response
      const blob = res instanceof Blob ? res : new Blob([res], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      // Filename labeling
      let label = "All_Daily_Reports";
      if (scope === "group" && selectedGroupId) {
        const grp = groups.find(g => g.id === parseInt(selectedGroupId));
        label = `Group_${grp ? grp.group_name.replace(/\s+/g, "_") : selectedGroupId}`;
      } else if (scope === "employee" && selectedUserId) {
        const usr = users.find(u => u.id === parseInt(selectedUserId));
        label = `Employee_${usr ? usr.name.replace(/\s+/g, "_") : selectedUserId}`;
      } else if (scope === "admins") {
        label = "Admins_Daily_Reports";
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `DIT_${label}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess(true);
    } catch (err) {
      setError("Failed to generate and export reports spreadsheet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto select-none py-2 space-y-6">
      {/* Title block */}
      <div className="text-left">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Export Reports</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Compile and download daily task reports as Microsoft Excel spreadsheet templates.
        </p>
      </div>

      {/* Main Container Card */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-left space-y-6">
        <div className="flex items-center gap-4">
          {/* Document Icon Graphic */}
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 shadow-inner flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Microsoft Excel (.xlsx) Exporter</h3>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Filter by scopes and download report datasets</p>
          </div>
        </div>

        {/* Export Scope Selectors */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-slate-500 pl-0.5">Select Export Scope</span>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "all", label: "All Reports", desc: "Complete system logs" },
              { id: "group", label: "By Group", desc: "Filter by division" },
              { id: "employee", label: "By Staff", desc: "Filter by employee" },
              { id: "admins", label: "Admins Group", desc: "Only Admin accounts" }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setScope(opt.id)}
                className={`p-3 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                  scope === opt.id
                    ? "bg-slate-55 bg-[#1b3b6f] border-[#1b3b6f] text-white"
                    : "bg-slate-50/50 hover:bg-slate-50 border-slate-200/60 text-slate-700"
                }`}
              >
                <span className="text-xs font-bold">{opt.label}</span>
                <span className={`text-[9px] font-semibold mt-0.5 ${scope === opt.id ? "text-blue-200" : "text-slate-400"}`}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Filters Form */}
        {scope === "group" && (
          <div className="flex flex-col space-y-2 animate-fade-in">
            <label className="text-xs font-bold text-slate-500 pl-0.5">Assigned Group Division</label>
            {loadingFilters ? (
              <span className="text-xs text-slate-400 font-bold animate-pulse pl-0.5">Loading divisions list...</span>
            ) : (
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:bg-white focus:border-blue-600 transition-all"
              >
                <option value="">-- Choose Division --</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.group_name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {scope === "employee" && (
          <div className="flex flex-col space-y-2 animate-fade-in">
            <label className="text-xs font-bold text-slate-500 pl-0.5">Select Employee Profile</label>
            {loadingFilters ? (
              <span className="text-xs text-slate-400 font-bold animate-pulse pl-0.5">Loading employee records...</span>
            ) : (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-semibold focus:outline-none focus:bg-white focus:border-blue-600 transition-all"
              >
                <option value="">-- Select Employee --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.label}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Custom Premium Date Range Selectors */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CustomDatePicker
              label="From Date"
              value={startDate}
              onChange={setStartDate}
            />
            <CustomDatePicker
              label="To Date"
              value={endDate}
              onChange={setEndDate}
            />
          </div>
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => { setStartDate(""); setEndDate(""); }}
              className="text-[10px] text-red-500 hover:text-red-750 font-bold pl-0.5 mt-1 cursor-pointer hover:underline text-left block"
            >
              Clear Date Filters
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-xl text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-3.5 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Spreadsheet downloaded successfully!</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full bg-[#1b3b6f] hover:bg-[#12284c] disabled:bg-slate-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-slate-200/50 cursor-pointer text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>Generating sheet scope...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Excel Template</span>
            </>
          )}
        </button>

        {/* Details footer */}
        <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
            <span>FILE TYPE</span>
            <span className="text-slate-600 font-extrabold">XLSX (Microsoft Excel)</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
            <span>TARGET FORMAT</span>
            <span className="text-slate-600 font-extrabold">Auto-Formatted Columns</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
            <span>SECURITY LEVEL</span>
            <span className="text-slate-600 font-extrabold">System Administrator Only</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportReports;
