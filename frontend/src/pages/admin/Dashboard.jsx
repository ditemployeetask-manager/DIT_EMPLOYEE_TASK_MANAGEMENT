import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import analyticsService from "../../services/analyticsService";
import reportService from "../../services/reportService";
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from "recharts";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, reportsRes] = await Promise.all([
        analyticsService.getAdminDashboard(),
        reportService.getTeamReports(1, 5) // Fetch first page, limit 5 reports
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      } else {
        setError("Failed to fetch dashboard metrics.");
      }

      if (reportsRes.success) {
        setRecentReports(reportsRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading dashboard analytics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <span className="text-sm font-bold text-slate-500 animate-pulse">Syncing administration dashboard...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-xs font-semibold mb-6">
          {error || "Could not load dashboard data."}
        </div>
        <button 
          onClick={fetchDashboardData} 
          className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-700 transition-all"
        >
          Retry Load
        </button>
      </div>
    );
  }

  // Data mapping for Recharts Doughnut
  const totalReportsCount = 
    (parseInt(stats.approved_reports) || 0) + 
    (parseInt(stats.pending_reviews) || 0) + 
    (parseInt(stats.rejected_reports) || 0);

  const reportStatusData = [
    { name: "Approved", value: parseInt(stats.approved_reports) || 0, color: "#10b981" },
    { name: "Pending Review", value: parseInt(stats.pending_reviews) || 0, color: "#f59e0b" },
    { name: "Rejected", value: parseInt(stats.rejected_reports) || 0, color: "#ef4444" },
  ].filter(d => d.value > 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-red-50 text-red-650 border border-red-100 uppercase tracking-wider">
            Rejected
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider animate-pulse">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 select-none animate-fade-in pb-8 text-left">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Here is what's happening in your assigned groups and departments today.
          </p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm inline-flex items-center gap-2 self-start sm:self-auto">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-bold text-slate-700">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Employees */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">My Group Staff</span>
            <h3 className="text-2xl font-black text-slate-850">{stats.total_employees}</h3>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Pending Review</span>
            <h3 className="text-2xl font-black text-slate-850">{stats.pending_reviews}</h3>
          </div>
          <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Today's Submissions */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Today's Filings</span>
            <h3 className="text-2xl font-black text-slate-850">{stats.today_reports}</h3>
          </div>
          <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {/* Approved / Rejected Ratio */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Reviewed Logs</span>
            <h3 className="text-2xl font-black text-slate-850">
              {parseInt(stats.approved_reports) + parseInt(stats.rejected_reports)}
            </h3>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        </div>

      </div>

      {/* Main Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Recharts Doughnut & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Doughnut Chart */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Report status summary</h4>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Assigned Scopes Summary</span>
              </div>
              <span className="text-[10px] font-black text-slate-650 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg">
                {totalReportsCount} Total
              </span>
            </div>

            <div className="w-full h-[220px]">
              {totalReportsCount > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {reportStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#334155' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={32} 
                      iconType="circle"
                      formatter={(value) => <span className="text-[10px] font-bold text-slate-550">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs font-bold text-slate-400 italic">
                  No submissions recorded.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

            <div className="border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Admin Actions</h4>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Quick Dashboard Controls</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Review Submissions", path: "/admin/reports", iconColor: "text-amber-600", bgColor: "bg-amber-50/50 hover:bg-amber-50" },
                { label: "Manage Staff", path: "/admin/employees", iconColor: "text-blue-600", bgColor: "bg-blue-50/50 hover:bg-blue-50" },
                { label: "Assigned Groups", path: "/admin/groups", iconColor: "text-purple-600", bgColor: "bg-purple-50/50 hover:bg-purple-50" },
                { label: "Analytics Logs", path: "/admin/analytics", iconColor: "text-emerald-600", bgColor: "bg-emerald-50/50 hover:bg-emerald-50" },
              ].map(({ label, path, bgColor }) => (
                <Link
                  key={label}
                  to={path}
                  className={`p-3.5 border border-slate-150 rounded-2xl flex flex-col justify-between h-20 transition-all ${bgColor} shadow-sm hover:shadow cursor-pointer`}
                >
                  <span className="text-[11px] font-extrabold text-slate-700 leading-tight">{label}</span>
                  <span className="text-[9px] font-bold text-blue-600 flex items-center gap-0.5 mt-2">
                    Open
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Recent Submissions List */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm relative overflow-hidden space-y-4">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Recent Submissions</h4>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Latest logs awaiting reviews</span>
            </div>
            <Link 
              to="/admin/reports" 
              className="text-[10px] font-black text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1 hover:underline"
            >
              View All
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {recentReports.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-350 shadow-inner">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h5 className="text-xs font-bold text-slate-650">No reports submitted recently</h5>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs font-semibold">Any submitted staff reports will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => navigate(`/admin/reports/${report.id}`)}
                  className="bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-2xl p-4 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs shrink-0 shadow-sm border border-blue-50">
                      {report.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-800 leading-none">{report.name}</span>
                        <span className="text-[9px] text-slate-455 font-bold bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/50">{report.group_name}</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-700 leading-tight mt-1 truncate max-w-[280px]">
                        {report.title || "Daily Status Report"}
                      </p>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                        Filed: {new Date(report.report_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                    {getStatusBadge(report.status)}
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/reports/${report.id}`); }}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-650 border border-slate-200 hover:border-slate-350 rounded-xl text-[10px] font-black transition-all shadow-sm flex items-center gap-1 cursor-pointer ml-auto sm:ml-0"
                    >
                      Review
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
