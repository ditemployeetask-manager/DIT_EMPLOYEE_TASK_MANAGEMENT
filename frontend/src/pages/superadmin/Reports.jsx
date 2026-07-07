import React, { useState, useEffect } from "react";
import analyticsService from "../../services/analyticsService";

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await analyticsService.getSuperAdminDashboard();
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError("Failed to load reports metrics.");
      }
    } catch (err) {
      setError("An error occurred while loading analytics stats.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] select-none">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-900" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span className="text-xs font-bold text-slate-500 animate-pulse">Loading system statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center select-none">
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-2xl text-sm font-semibold mb-4">
          {error}
        </div>
        <button
          onClick={fetchStats}
          className="bg-[#1b3b6f] hover:bg-[#12284c] text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer text-xs"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  // Calculate percentages for report statuses
  const total = stats?.total_reports || 0;
  const approvedPct = total > 0 ? Math.round((stats.approved_reports / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((stats.pending_reports / total) * 100) : 0;
  const rejectedPct = total > 0 ? Math.round((stats.rejected_reports / total) * 100) : 0;

  return (
    <div className="space-y-6 select-none text-left py-2">
      {/* Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reports & Analytics</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Real-time overview of users, groups, and daily status reports</p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-slate-500 focus:outline-none"
          title="Refresh Data"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H17.5" />
          </svg>
        </button>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Employees</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{stats?.total_employees || 0}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-900 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>

        {/* Total Admins */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Admins</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{stats?.total_admins || 0}</h3>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-900 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        {/* Total Groups */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Groups & Depts</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{stats?.total_groups || 0}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        {/* Total Reports */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reports Logged</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{stats?.total_reports || 0}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-900 rounded-xl">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Charts & Ratios row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report Ratio Analysis Panel */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Status Ratios</h4>
            <span className="text-[11px] text-slate-400 font-semibold">Percentage breakdown of overall daily status reports</span>
          </div>

          <div className="space-y-4 my-6">
            {/* Approved Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span> Approved
                </span>
                <span className="text-slate-800">{stats?.approved_reports || 0} ({approvedPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${approvedPct}%` }}></div>
              </div>
            </div>

            {/* Pending Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span> Pending Review
                </span>
                <span className="text-slate-800">{stats?.pending_reports || 0} ({pendingPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${pendingPct}%` }}></div>
              </div>
            </div>

            {/* Rejected Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span> Rejected / Rework
                </span>
                <span className="text-slate-800">{stats?.rejected_reports || 0} ({rejectedPct}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${rejectedPct}%` }}></div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-between text-[11px] text-slate-500 font-semibold">
            <span>Total submissions processed:</span>
            <span className="font-bold text-slate-800">{total} reports</span>
          </div>
        </div>

        {/* Today's Submission Overview Panel */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-1">Today's Activity Tracker</h4>
            <span className="text-[11px] text-slate-400 font-semibold">Submission frequency and real-time report statistics for today</span>
          </div>

          {/* Centered Big Value Callout */}
          <div className="my-auto py-6 flex flex-col items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl font-black text-[#1b3b6f] shadow-inner">
              {stats?.today_reports || 0}
            </div>
            <span className="text-xs font-bold text-slate-700 mt-3">Reports Received Today</span>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Auto-updates as employees submit their daily status forms</p>
          </div>

          <div className="border-t border-slate-100 pt-4 flex justify-between text-[11px] text-slate-500 font-semibold">
            <span>Current Date:</span>
            <span className="font-bold text-slate-800">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
