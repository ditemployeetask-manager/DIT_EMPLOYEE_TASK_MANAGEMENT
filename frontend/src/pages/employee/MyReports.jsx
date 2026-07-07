import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import reportService from "../../services/reportService";
import analyticsService from "../../services/analyticsService";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer 
} from "recharts";

const MyReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Filters and Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchReportsAndStats();
  }, [page, limit, statusFilter, startDate, endDate]);

  const fetchReportsAndStats = async () => {
    setLoading(true);
    try {
      const [reportsRes, statsRes] = await Promise.all([
        reportService.getMyReports(page, limit, statusFilter, "", startDate, endDate),
        analyticsService.getEmployeeDashboard()
      ]);

      if (reportsRes.success) {
        setReports(reportsRes.data || []);
        setTotalPages(reportsRes.totalPages || 1);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error("Failed to load reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleExport = async () => {
    try {
      await reportService.exportReports();
    } catch (err) {
      alert("Failed to export reports: " + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-red-50 text-red-600 border border-red-100 uppercase tracking-wider">
            Rejected
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider animate-pulse">
            Pending
          </span>
        );
    }
  };

  // Recharts chart data prep
  const totalCount = stats ? parseInt(stats.total_reports) || 0 : 0;
  const approvedCount = stats ? parseInt(stats.approved_reports) || 0 : 0;
  const pendingCount = stats ? parseInt(stats.pending_reports) || 0 : 0;
  const rejectedCount = stats ? parseInt(stats.rejected_reports) || 0 : 0;

  const chartData = [
    { name: "Approved", value: approvedCount, color: "#10b981" },
    { name: "Pending", value: pendingCount, color: "#f59e0b" },
    { name: "Rejected", value: rejectedCount, color: "#ef4444" },
  ].filter(d => d.value > 0);

  const getPercentage = (count) => {
    if (!totalCount) return "0.0%";
    return `${((count / totalCount) * 100).toFixed(1)}%`;
  };

  // Build a compact plain-text preview without dumping the full report body.
  const getReportPreview = (html, maxLength = 90) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = (doc.body.textContent || "").replace(/\s+/g, " ").trim();
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 select-none text-left py-2 pb-12">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">My Reports</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            View, track and manage all your submitted reports.
          </p>
        </div>
        <button
          onClick={() => navigate("/employee/create-report")}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create New Report
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-0.5">Filters</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div>
            <CustomDatePicker
              label="Start Date"
              value={startDate}
              onChange={(date) => { setStartDate(date); setPage(1); }}
              placeholder="Select start date"
            />
          </div>
          <div>
            <CustomDatePicker
              label="End Date"
              value={endDate}
              onChange={(date) => { setEndDate(date); setPage(1); }}
              placeholder="Select end date"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-bold text-slate-700 pl-0.5">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 hover:bg-white py-2.5 pl-3 pr-8 outline-none shadow-sm cursor-pointer transition-all"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResetFilters}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Reports */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Reports</span>
            <span className="text-xl font-black text-slate-800">{totalCount}</span>
            <span className="block text-[9px] font-bold text-slate-400 mt-0.5">This Month</span>
          </div>
        </div>

        {/* Approved Reports */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Approved</span>
            <span className="text-xl font-black text-slate-800">{approvedCount}</span>
            <span className="block text-[9px] font-bold text-emerald-650 mt-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100/50 inline-block leading-none">
              {getPercentage(approvedCount)}
            </span>
          </div>
        </div>

        {/* Pending Reports */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Pending</span>
            <span className="text-xl font-black text-slate-800">{pendingCount}</span>
            <span className="block text-[9px] font-bold text-amber-650 mt-0.5 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100/50 inline-block leading-none">
              {getPercentage(pendingCount)}
            </span>
          </div>
        </div>

        {/* Rejected Reports */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Rejected</span>
            <span className="text-xl font-black text-slate-800">{rejectedCount}</span>
            <span className="block text-[9px] font-bold text-red-650 mt-0.5 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-100/50 inline-block leading-none">
              {getPercentage(rejectedCount)}
            </span>
          </div>
        </div>

      </div>

      {/* Main Content split column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Reports List Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-base font-black text-slate-800 tracking-tight">Reports List</h3>
            <div className="flex items-center gap-3">
              <select
                value={limit}
                onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                className="text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 py-2 pl-2 pr-7 outline-none shadow-sm cursor-pointer hover:bg-white transition-all"
              >
                <option value="5">View 5</option>
                <option value="10">View 10</option>
                <option value="20">View 20</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 space-y-4">
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span className="text-xs font-bold text-slate-400 animate-pulse">Syncing reports...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-350 shadow-inner">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-slate-700">No submissions found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs font-semibold">Try modifying your filters or create a new report.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-inner bg-slate-50/20">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Report Title</th>
                    <th className="py-3 px-4">Submitted On</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Remarks</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, idx) => (
                    <tr 
                      key={report.id}
                      onClick={() => navigate(`/employee/reports/${report.id}`)}
                      className="border-b border-slate-100 hover:bg-slate-50/50 bg-white transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-4 text-center text-xs font-bold text-slate-400">
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <span className="block text-xs font-extrabold text-slate-800 truncate leading-tight">
                          {report.title || "Daily Status Report"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-slate-650">
                        {new Date(report.report_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="py-4 px-4 max-w-[150px]">
                        <p className="text-[11px] font-semibold text-slate-500 truncate leading-normal">
                          {report.admin_remarks || <span className="text-slate-350">-</span>}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => navigate(`/employee/reports/${report.id}`)}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && reports.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs font-bold text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:border-slate-350 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:border-slate-350 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Insights & Stats Doughnut */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Status Breakdown Doughnut Chart */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest self-start mb-4">Report Status Summary</h4>
            
            {totalCount === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-slate-400 italic">No reports submitted.</div>
            ) : (
              <div className="relative w-full h-44 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center text */}
                <div className="absolute text-center select-none">
                  <span className="block text-2xl font-black text-slate-800 leading-none">{totalCount}</span>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Filed</span>
                </div>
              </div>
            )}

            {/* Custom chart legend list */}
            {totalCount > 0 && (
              <div className="grid grid-cols-3 gap-2 w-full pt-4 border-t border-slate-100 mt-2">
                <div className="text-center">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Approved</span>
                  <span className="block text-xs font-extrabold text-slate-700 mt-0.5">{approvedCount}</span>
                </div>
                <div className="text-center">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Pending</span>
                  <span className="block text-xs font-extrabold text-slate-700 mt-0.5">{pendingCount}</span>
                </div>
                <div className="text-center">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Rejected</span>
                  <span className="block text-xs font-extrabold text-slate-700 mt-0.5">{rejectedCount}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Insights */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-0.5">Quick Insights</h4>
            <div className="space-y-3.5">
              
              <div className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">Average approval time</span>
                </div>
                <span className="text-xs font-black text-slate-800">1.8 Days</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">Reports pending &gt; 3 days</span>
                </div>
                <span className="text-xs font-black text-slate-800">2</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">On-time submission rate</span>
                </div>
                <span className="text-xs font-black text-slate-800">91.7%</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">Reports needing revision</span>
                </div>
                <span className="text-xs font-black text-slate-800">{rejectedCount}</span>
              </div>

            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 text-white space-y-2.5 shadow-md">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h5 className="text-xs font-black uppercase tracking-widest text-blue-100">Quick Tips</h5>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-50 font-medium">
              Submit your reports on time and ensure all observations are documented. Clear reports facilitate faster approval and reduce administrative review loops.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default MyReports;
