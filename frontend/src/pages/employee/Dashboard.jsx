import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import analyticsService from "../../services/analyticsService";
import reportService from "../../services/reportService";
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend 
} from "recharts";

const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const EmployeeDashboard = () => {
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
    try {
      // Fetch both dashboard stats and recent reports concurrently
      const [statsRes, reportsRes] = await Promise.all([
        analyticsService.getEmployeeDashboard(),
        reportService.getMyReports(1, 5) // Fetch first page, max 5 items
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      } else {
        throw new Error("Failed to fetch dashboard metrics.");
      }

      if (reportsRes.success) {
        setRecentReports(reportsRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading analytics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <svg className="animate-spin h-10 w-10 text-[#1b3b6f]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <span className="text-sm font-bold text-slate-500 animate-pulse">Syncing personal metrics...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-xs font-semibold">
        {error || "Could not load dashboard data."}
      </div>
    );
  }

  // Data mapping for charts
  const reportStatusData = [
    { name: "Approved", value: parseInt(stats.approved_reports) || 0, color: "#10b981" },
    { name: "Pending", value: parseInt(stats.pending_reports) || 0, color: "#f59e0b" },
    { name: "Rejected", value: parseInt(stats.rejected_reports) || 0, color: "#ef4444" },
  ];

  const hasChartData = parseInt(stats.total_reports) > 0;
  const hasSubmittedToday = parseInt(stats.today_reports) > 0;

  return (
    <div className="space-y-6 select-none animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Hello, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Track your submissions and performance metrics.
          </p>
        </div>
        <div className="flex gap-3 self-start md:self-auto">
          {!hasSubmittedToday && (
            <Link to="/employee/create-report" className="bg-[#1b3b6f] hover:bg-blue-800 text-white border border-[#1b3b6f] px-4 py-2 rounded-xl shadow-sm inline-flex items-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs font-bold">File Report</span>
            </Link>
          )}
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm inline-flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-bold text-slate-700">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Log Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${hasSubmittedToday ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Today's Status</p>
            <h3 className={`text-lg font-black ${hasSubmittedToday ? 'text-emerald-600' : 'text-amber-600'}`}>
              {hasSubmittedToday ? 'Submitted' : 'Pending Action'}
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${hasSubmittedToday ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              {hasSubmittedToday ? (
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
          </div>
        </div>

        {/* Total Lifetime Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Logs</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.total_reports}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        {/* Approved Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Approved</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.approved_reports}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </div>
        </div>

        {/* Pending Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Awaiting Review</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.pending_reports}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Activity & Actions (Takes up 2/3 space) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          
          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Jump to specific tasks</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/employee/create-report" className="group p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-[#1b3b6f] hover:border-[#1b3b6f] transition-all flex flex-col gap-3 cursor-pointer">
                <div className="w-10 h-10 bg-white group-hover:bg-blue-500/20 text-[#1b3b6f] group-hover:text-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-transparent transition-all shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-slate-700 group-hover:text-white transition-colors">Submit Report</span>
                  <span className="block text-[10px] font-semibold text-slate-400 group-hover:text-blue-100 mt-0.5 transition-colors">File today's daily log</span>
                </div>
              </Link>
              
              <Link to="/employee/reports" className="group p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-[#1b3b6f] hover:border-[#1b3b6f] transition-all flex flex-col gap-3 cursor-pointer">
                <div className="w-10 h-10 bg-white group-hover:bg-blue-500/20 text-[#1b3b6f] group-hover:text-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-transparent transition-all shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-slate-700 group-hover:text-white transition-colors">My Submissions</span>
                  <span className="block text-[10px] font-semibold text-slate-400 group-hover:text-blue-100 mt-0.5 transition-colors">View full history</span>
                </div>
              </Link>

              <Link to="/employee/profile" className="group p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-[#1b3b6f] hover:border-[#1b3b6f] transition-all flex flex-col gap-3 cursor-pointer">
                <div className="w-10 h-10 bg-white group-hover:bg-blue-500/20 text-[#1b3b6f] group-hover:text-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-transparent transition-all shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-slate-700 group-hover:text-white transition-colors">My Profile</span>
                  <span className="block text-[10px] font-semibold text-slate-400 group-hover:text-blue-100 mt-0.5 transition-colors">Manage account details</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Reports Table Mini */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex-grow">
             <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Recent Logs</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Your latest submissions</p>
              </div>
              <Link to="/employee/reports" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                View All &rarr;
              </Link>
            </div>

            {recentReports.length > 0 ? (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        report.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                        report.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        <span className="text-sm font-black tracking-tighter">
                          {new Date(report.report_date).getDate()}
                        </span>
                      </div>
                      <div>
                         <p className="text-xs font-bold text-slate-700 truncate max-w-[200px] sm:max-w-[300px]">
                            {stripHtml(report.work_done)}
                         </p>
                         <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                           {new Date(report.report_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                         </p>
                      </div>
                    </div>
                    <div>
                       <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        report.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        report.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <p className="text-xs font-bold text-slate-400">No reports found.</p>
                <p className="text-[10px] text-slate-400 mt-1">Submit your first daily log to track progress.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Chart (Takes up 1/3 space) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Status Analytics</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Overall Submission Status</p>
            </div>
          </div>
          
          <div className="flex-grow w-full min-h-[250px] flex flex-col items-center justify-center">
            {hasChartData ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={reportStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {reportStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#334155' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-bold text-slate-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <svg className="w-12 h-12 text-slate-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p className="text-xs font-bold text-slate-400 italic">No visual data available.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default EmployeeDashboard;
