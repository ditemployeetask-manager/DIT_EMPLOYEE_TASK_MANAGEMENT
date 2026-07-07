import React, { useState, useEffect } from "react";
import analyticsService from "../../services/analyticsService";
import reportService from "../../services/reportService";

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Export states
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState("");
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await analyticsService.getAdminDashboard();
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError("Failed to load analytics metrics.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading analytics statistics.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    setExportSuccess("");
    setExportError("");
    try {
      await reportService.exportReports();
      setExportSuccess("Division reports exported successfully! Check your downloads.");
    } catch (err) {
      console.error(err);
      setExportError(err.message || "Failed to export reports.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-28 space-y-4">
        <svg className="animate-spin h-9 w-9 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <span className="text-xs font-bold text-slate-550 animate-pulse">Loading analytics data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center select-none animate-fade-in">
        <div className="bg-red-50 border border-red-200 text-red-650 p-5 rounded-3xl text-xs font-semibold mb-6">
          {error}
        </div>
        <button 
          onClick={fetchStats} 
          className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-700 transition-all"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  // Calculate ratios
  const approved = parseInt(stats.approved_reports) || 0;
  const pending = parseInt(stats.pending_reviews) || 0;
  const rejected = parseInt(stats.rejected_reports) || 0;
  const total = approved + pending + rejected;

  const approvedPct = total > 0 ? Math.round((approved / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
  const rejectedPct = total > 0 ? Math.round((rejected / total) * 100) : 0;

  return (
    <div className="space-y-6 select-none animate-fade-in pb-8 text-left">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Reports & Analytics</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Real-time status analysis of division staff submissions and reviews.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-slate-500 focus:outline-none"
          title="Refresh Data"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H17.5" />
          </svg>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Assigned Staff", value: stats.total_employees, bg: "bg-blue-50 text-blue-600 border-blue-100", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
          { label: "Pending Reviews", value: stats.pending_reviews, bg: "bg-amber-50 text-amber-600 border-amber-100", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "Today's Filings", value: stats.today_reports, bg: "bg-purple-50 text-purple-600 border-purple-100", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
          { label: "Total Submissions", value: total, bg: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
        ].map(({ label, value, bg, icon }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
              <h3 className="text-2xl font-black text-slate-850 mt-1">{value}</h3>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${bg}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts & Ratios row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Ratios progress bars block */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[300px]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          <div className="border-b border-slate-100 pb-3 mb-6">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Status ratios</h4>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Percentage distribution of submitted reports</span>
          </div>

          <div className="space-y-5 my-2">
            
            {/* Approved Ratio */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                <span>Approved Reports</span>
                <span className="text-emerald-600 font-black">{approved} ({approvedPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${approvedPct}%` }}></div>
              </div>
            </div>

            {/* Pending Ratio */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                <span>Pending Review</span>
                <span className="text-amber-600 font-black">{pending} ({pendingPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${pendingPct}%` }}></div>
              </div>
            </div>

            {/* Rejected Ratio */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                <span>Rejected Reports</span>
                <span className="text-red-600 font-black">{rejected} ({rejectedPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${rejectedPct}%` }}></div>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-50 mt-6 text-[10px] font-semibold text-slate-400">
            * Stats updated in real-time. Calculated across total logged staff reports.
          </div>
        </div>

        {/* Excel Export Block */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden min-h-[300px]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          <div>
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Export analytics</h4>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Download full division records</span>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
              Export all submitted daily logs, administrator review statuses, employee information, and remarks into an Excel spreadsheet format.
            </p>

            {exportSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-3.5 rounded-2xl text-[11px] font-semibold mb-4">
                {exportSuccess}
              </div>
            )}

            {exportError && (
              <div className="bg-red-50 border border-red-200 text-red-650 p-3.5 rounded-2xl text-[11px] font-semibold mb-4">
                {exportError}
              </div>
            )}
          </div>

          <button
            onClick={handleExportData}
            disabled={exporting}
            className="w-full py-3 bg-[#1b3b6f] hover:bg-[#12284c] text-white text-xs font-black rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shrink-0"
          >
            {exporting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export Division Excel</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};

export default Analytics;
