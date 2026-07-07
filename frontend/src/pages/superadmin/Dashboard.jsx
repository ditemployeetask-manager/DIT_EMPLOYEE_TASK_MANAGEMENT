import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import analyticsService from "../../services/analyticsService";
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from "recharts";

const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await analyticsService.getSuperAdminDashboard();
      if (res.success) {
        setStats(res.data);
      } else {
        setError("Failed to fetch dashboard metrics.");
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
        <span className="text-sm font-bold text-slate-500 animate-pulse">Gathering intelligence...</span>
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
    { name: "Pending Review", value: parseInt(stats.pending_reports) || 0, color: "#f59e0b" },
    { name: "Rejected", value: parseInt(stats.rejected_reports) || 0, color: "#ef4444" },
  ];

  const userDemographicsData = [
    { name: "Staff Employees", count: parseInt(stats.total_employees) || 0, fill: "#3b82f6" },
    { name: "Administrators", count: parseInt(stats.total_admins) || 0, fill: "#1b3b6f" },
  ];

  return (
    <div className="space-y-6 select-none animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Here is what's happening across your divisions today.
          </p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm inline-flex items-center gap-2 self-start md:self-auto">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs font-bold text-slate-700">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Staff</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.total_employees}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>

        {/* Total Admins */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Administrators</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.total_admins}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>

        {/* Active Groups */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Divisions</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.total_groups}</h3>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        {/* Today's Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Today's Logs</p>
            <h3 className="text-2xl font-black text-slate-800">{stats.today_reports}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Report Status Distribution */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Report Status Analytics</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Overall Submission Status</p>
            </div>
            <div className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black border border-slate-200">
              {stats.total_reports} Total
            </div>
          </div>
          
          <div className="flex-grow w-full h-[280px]">
            {stats.total_reports > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
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
              <div className="flex items-center justify-center h-full text-xs font-bold text-slate-400 italic">
                No report data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: User Demographics */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">User Demographics</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Role Distribution</p>
            </div>
          </div>
          
          <div className="flex-grow w-full h-[280px]">
            {(stats.total_employees > 0 || stats.total_admins > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userDemographicsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} />
                  <RechartsTooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {userDemographicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs font-bold text-slate-400 italic">
                No user demographic data available yet.
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Frequently Used Administrative Tools</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/superadmin/employees" className="group p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-[#1b3b6f] hover:border-[#1b3b6f] transition-all flex flex-col gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-white group-hover:bg-blue-500/20 text-[#1b3b6f] group-hover:text-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-transparent transition-all shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-slate-700 group-hover:text-white transition-colors">Onboard Employee</span>
              <span className="block text-[10px] font-semibold text-slate-400 group-hover:text-blue-100 mt-0.5 transition-colors">Add new staff profile</span>
            </div>
          </Link>
          
          <Link to="/superadmin/admins" className="group p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-[#1b3b6f] hover:border-[#1b3b6f] transition-all flex flex-col gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-white group-hover:bg-blue-500/20 text-[#1b3b6f] group-hover:text-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-transparent transition-all shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-slate-700 group-hover:text-white transition-colors">Assign Admin</span>
              <span className="block text-[10px] font-semibold text-slate-400 group-hover:text-blue-100 mt-0.5 transition-colors">Delegate permissions</span>
            </div>
          </Link>

          <Link to="/superadmin/send-notification" className="group p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-[#1b3b6f] hover:border-[#1b3b6f] transition-all flex flex-col gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-white group-hover:bg-blue-500/20 text-[#1b3b6f] group-hover:text-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-transparent transition-all shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-slate-700 group-hover:text-white transition-colors">Broadcast Alert</span>
              <span className="block text-[10px] font-semibold text-slate-400 group-hover:text-blue-100 mt-0.5 transition-colors">Send system notices</span>
            </div>
          </Link>

          <Link to="/superadmin/export" className="group p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-[#1b3b6f] hover:border-[#1b3b6f] transition-all flex flex-col gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-white group-hover:bg-blue-500/20 text-[#1b3b6f] group-hover:text-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-transparent transition-all shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-slate-700 group-hover:text-white transition-colors">Export Logs</span>
              <span className="block text-[10px] font-semibold text-slate-400 group-hover:text-blue-100 mt-0.5 transition-colors">Download Excel reports</span>
            </div>
          </Link>
        </div>
      </div>
      
    </div>
  );
};

export default SuperAdminDashboard;
