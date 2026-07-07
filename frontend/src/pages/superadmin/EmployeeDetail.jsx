import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import employeeService from "../../services/employeeService";
import reportService from "../../services/reportService";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  
  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  // Filtration & Pagination
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(""); // Format: "YYYY-MM"
  const [selectedDay, setSelectedDay] = useState("");     // Format: "YYYY-MM-DD"
  const [page, setPage] = useState(1);
  const [limit] = useState(5);

  // Collapsible cards state
  const [expandedReports, setExpandedReports] = useState({});

  useEffect(() => {
    fetchEmployeeAndReports();
  }, [id]);

  useEffect(() => {
    filterReports();
  }, [allReports, statusFilter, selectedMonth, selectedDay]);

  const fetchEmployeeAndReports = async () => {
    setLoading(true);
    setError("");
    try {
      const empRes = await employeeService.getEmployeeById(parseInt(id));
      if (empRes.success && empRes.data) {
        setEmployee(empRes.data);
        
        // Fetch all reports of this employee (up to 100 records)
        const reportsRes = await reportService.getTeamReports(1, 100, empRes.data.employee_id, "", "");
        if (reportsRes.success) {
          setAllReports(reportsRes.data || []);
        }
      } else {
        setError("Employee profile not found.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading profile details.");
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let result = [...allReports];

    // Filter by status
    if (statusFilter) {
      result = result.filter(r => r.status === statusFilter);
    }

    // Filter by month
    if (selectedMonth) {
      result = result.filter(r => r.report_date.startsWith(selectedMonth));
    }

    // Filter by specific day
    if (selectedDay) {
      result = result.filter(r => r.report_date === selectedDay);
    }

    setFilteredReports(result);
    setPage(1); // Reset page to 1 on filter change
  };

  const handleExportIndividualReport = async () => {
    if (!employee) return;
    setExporting(true);
    try {
      const res = await api.get(`/reports/export?userId=${employee.id}`);
      
      const blob = res instanceof Blob ? res : new Blob([res], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `DIT_Employee_${employee.name.replace(/\s+/g, "_")}_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export individual report.");
    } finally {
      setExporting(false);
    }
  };

  // Get distinct months from allReports
  const getAvailableMonths = () => {
    const months = allReports.map(r => r.report_date.substring(0, 7));
    const uniqueMonths = Array.from(new Set(months)).sort().reverse();
    return uniqueMonths;
  };

  // Get distinct days for the selected month
  const getAvailableDays = () => {
    if (!selectedMonth) return [];
    const days = allReports
      .filter(r => r.report_date.startsWith(selectedMonth))
      .map(r => r.report_date);
    const uniqueDays = Array.from(new Set(days)).sort().reverse();
    return uniqueDays;
  };

  // Format month string (e.g. "2026-07" -> "July 2026")
  const formatMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(year, parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Format day string (e.g. "2026-07-03" -> "3 Jul 2026")
  const formatDayLabel = (dayStr) => {
    const date = new Date(dayStr);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  const toggleExpand = (repId) => {
    setExpandedReports(prev => ({
      ...prev,
      [repId]: !prev[repId]
    }));
  };

  const toggleAll = (expand) => {
    const newState = {};
    if (expand) {
      filteredReports.forEach(r => { newState[r.id] = true; });
    }
    setExpandedReports(newState);
  };

  const handleResetFilters = () => {
    setStatusFilter("");
    setSelectedMonth("");
    setSelectedDay("");
    setPage(1);
  };

  // Paginated chunk calculation
  const totalPages = Math.ceil(filteredReports.length / limit) || 1;
  const displayedReports = filteredReports.slice((page - 1) * limit, page * limit);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] select-none">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span className="text-xs font-bold text-slate-500 animate-pulse">Loading employee profile details...</span>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="max-w-3xl mx-auto py-8 select-none text-left space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-650 p-4 rounded-xl text-xs font-semibold">
          {error || "Could not load employee details."}
        </div>
        <button
          onClick={() => navigate(currentUser?.role_id === 2 ? "/admin/employees" : "/superadmin/employees")}
          className="bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs cursor-pointer hover:bg-slate-700 transition-colors"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none text-left py-2 pb-12">
      
      <style>{`
        .rich-text-content {
          white-space: pre-wrap !important;
          display: block !important;
          font-family: inherit;
        }
        .rich-text-content p, .rich-text-content div, .rich-text-content span {
          display: block !important;
          margin-bottom: 0.5rem;
          white-space: pre-wrap !important;
        }
        .rich-text-content ul, .rich-text-content ol {
          margin-left: 1.5rem !important;
          margin-bottom: 1rem !important;
          display: block !important;
        }
        .rich-text-content li {
          display: list-item !important;
          list-style-type: disc !important;
          margin-bottom: 0.25rem;
          white-space: pre-wrap !important;
        }
        .rich-text-content strong, .rich-text-content b {
          font-weight: 800 !important;
        }
        .rich-text-content font[size="1"] { font-size: 10px; }
        .rich-text-content font[size="2"] { font-size: 12px; }
        .rich-text-content font[size="3"] { font-size: 14px; }
        .rich-text-content font[size="4"] { font-size: 16px; }
        .rich-text-content font[size="5"] { font-size: 18px; }
        .rich-text-content font[size="6"] { font-size: 24px; }
        .rich-text-content font[size="7"] { font-size: 32px; }
      `}</style>

      {/* Back Button & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate(currentUser?.role_id === 2 ? "/admin/employees" : "/superadmin/employees")}
          className="flex items-center gap-2 text-xs font-bold text-slate-550 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Directory
        </button>

        <button
          onClick={handleExportIndividualReport}
          disabled={exporting}
          className="px-4 py-2 border border-slate-200 hover:border-slate-350 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60 self-start sm:self-auto"
        >
          {exporting ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export Excel History</span>
            </>
          )}
        </button>
      </div>

      {/* Employee Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-650 flex items-center justify-center font-black text-2xl shadow-inner border border-blue-100/50">
            {employee.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight leading-snug">{employee.name}</h3>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider mt-0.5 block">{employee.employee_id}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-semibold text-slate-500">
          <div>
            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-0.5">Designation</span>
            <span className="text-slate-850 font-bold">{employee.designation || "Staff Member"}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-0.5">Email Address</span>
            <span className="text-slate-850 font-bold">{employee.email}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-0.5">Phone Number</span>
            <span className="text-slate-850 font-bold">{employee.phone}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-0.5">Joined Date</span>
            <span className="text-slate-850 font-bold">
              {employee.created_at ? new Date(employee.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Submitted Reports Section */}
      <div className="space-y-4">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-1">
          <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">
            Submission History Logs ({filteredReports.length})
          </h4>
          
          {/* Quick Collapse Actions */}
          {filteredReports.length > 0 && (
            <div className="flex gap-2">
              <button 
                onClick={() => toggleAll(true)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer"
              >
                Expand All
              </button>
              <button 
                onClick={() => toggleAll(false)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          )}
        </div>

        {/* Search, Filter & Calendar Controls */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          
          {/* Month Dropdown Filter */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Filter by Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => { setSelectedMonth(e.target.value); setSelectedDay(""); }}
              className="text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 hover:bg-white focus:bg-white py-2.5 px-3 outline-none shadow-inner focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-slate-700 w-full cursor-pointer"
            >
              <option value="">All Months</option>
              {getAvailableMonths().map(m => (
                <option key={m} value={m}>{formatMonthLabel(m)}</option>
              ))}
            </select>
          </div>

          {/* Days Dropdown (if month selected) */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Filter by Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              disabled={!selectedMonth}
              className="text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 hover:bg-white focus:bg-white py-2.5 px-3 outline-none shadow-inner focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-slate-700 w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{selectedMonth ? "All Days in Month" : "Select Month First"}</option>
              {getAvailableDays().map(d => (
                <option key={d} value={d}>{formatDayLabel(d)}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-0.5">Filter by Review Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 hover:bg-white focus:bg-white py-2.5 px-3 outline-none shadow-inner focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-slate-700 w-full cursor-pointer"
            >
              <option value="">All Review Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Reset Filters Option */}
          <div className="pt-4 flex justify-start sm:justify-end">
            {(statusFilter || selectedMonth || selectedDay) && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200/50 w-full sm:w-auto"
              >
                Reset Filters
              </button>
            )}
          </div>

        </div>

        {/* Submission Cards */}
        {displayedReports.length === 0 ? (
          <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col items-center">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-350 shadow-inner">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h5 className="text-xs font-bold text-slate-700">No logs found matching criteria</h5>
            <p className="text-[10px] text-slate-400 mt-1 max-w-xs font-semibold">Try modifying your filter settings or selected month.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedReports.map((rep) => {
              const repDate = new Date(rep.report_date);
              const isExpanded = !!expandedReports[rep.id];

              const getStatusBadge = (status) => {
                switch (status) {
                  case "APPROVED":
                    return (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                        Approved
                      </span>
                    );
                  case "REJECTED":
                    return (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black bg-red-50 text-red-650 border border-red-100 uppercase tracking-wider">
                        Rejected
                      </span>
                    );
                  case "PENDING":
                  default:
                    return (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider animate-pulse">
                        Pending
                      </span>
                    );
                }
              };

              return (
                <div 
                  key={rep.id} 
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-50"></div>
                  
                  {/* Collapsible Header Click Area */}
                  <div 
                    onClick={() => toggleExpand(rep.id)}
                    className="flex items-center justify-between gap-4 flex-wrap cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Accordion Chevron Icon */}
                      <svg 
                        className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isExpanded ? "transform rotate-90" : ""}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth="3"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      <div>
                        <span className="text-xs font-black text-slate-800">
                          {repDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="block text-[11px] font-bold text-slate-550 leading-tight mt-0.5 truncate max-w-[280px] sm:max-w-md">
                          {rep.title || "Daily Status Report"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status & Review Dropdown / Buttons */}
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      {getStatusBadge(rep.status)}
                      <button 
                        onClick={() => navigate(currentUser?.role_id === 2 ? `/admin/reports/${rep.id}` : `/superadmin/reports/${rep.id}`)}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-650 border border-slate-250 hover:border-slate-350 rounded-xl text-[10px] font-black transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        Action
                      </button>
                    </div>
                  </div>

                  {/* Expanded Body Details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 mt-4 pt-4 space-y-4 text-xs font-semibold text-slate-500 animate-slide-down">
                      
                      <div className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-2">Work Completed</span>
                        <div className="rich-text-content text-slate-750 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: rep.work_done }} />
                      </div>

                      {rep.tomorrow_plan && (
                        <div className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                          <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-2">Tomorrow's Plan</span>
                          <p className="text-slate-750 font-medium leading-relaxed">{rep.tomorrow_plan}</p>
                        </div>
                      )}

                      {rep.admin_remarks && (
                        <div className="flex flex-col p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                          <span className="font-bold text-amber-700/80 uppercase text-[9px] tracking-wider mb-2">Reviewer Remarks</span>
                          <p className="text-slate-650 font-medium leading-relaxed">{rep.admin_remarks}</p>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-150">
                <span className="text-xs font-bold text-slate-550 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:border-slate-350 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:border-slate-350 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default EmployeeDetail;
