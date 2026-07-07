import React, { useState, useEffect } from "react";
import auditService from "../../services/auditService";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await auditService.getAllAuditLogs();
      if (res.success && res.data) {
        setLogs(res.data);
      } else {
        setError("Failed to retrieve audit log records.");
      }
    } catch (err) {
      setError("An error occurred while loading audit trails.");
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeClass = (action) => {
    if (action.includes("CREATE")) return "bg-green-50 text-green-700 border-green-200/60";
    if (action.includes("UPDATE")) return "bg-blue-50 text-blue-700 border-blue-200/60";
    if (action.includes("DELETE") || action.includes("REJECT")) return "bg-red-50 text-red-700 border-red-200/60";
    return "bg-slate-50 text-slate-700 border-slate-200/60";
  };

  // Filtering logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.employee_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesEntity = entityFilter === "all" || log.entity_type === entityFilter;

    return matchesSearch && matchesAction && matchesEntity;
  });

  // Pagination calculation
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Extract unique actions & entities for filters
  const uniqueActions = ["all", ...new Set(logs.map(l => l.action))];
  const uniqueEntities = ["all", ...new Set(logs.map(l => l.entity_type))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] select-none">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#1b3b6f]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span className="text-xs font-bold text-slate-500 animate-pulse">Retrieving system security audit logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none text-left py-2">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Audit Logs</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Real-time trail of administrative actions, report reviews, and user status events</p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors cursor-pointer text-slate-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H17.5" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl text-xs font-semibold mb-6">
          {error}
        </div>
      )}

      {/* Filter and Search Box */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search user, ID or action description..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600 transition-all font-medium"
            />
          </div>

          {/* Action Filter */}
          <div className="flex flex-col">
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:bg-white focus:border-blue-600 transition-all"
            >
              <option value="all">Filter: All Actions</option>
              {uniqueActions.filter(a => a !== "all").map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>

          {/* Entity Filter */}
          <div className="flex flex-col">
            <select
              value={entityFilter}
              onChange={(e) => { setEntityFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:bg-white focus:border-blue-600 transition-all"
            >
              <option value="all">Filter: All Entities</option>
              {uniqueEntities.filter(e => e !== "all").map(ent => (
                <option key={ent} value={ent}>{ent}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Actor Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Target Entity</th>
                <th className="px-6 py-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {currentLogs.length > 0 ? (
                currentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Timestamp */}
                    <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    {/* Actor */}
                    <td className="px-6 py-4 text-slate-900 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">{log.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{log.employee_id}</span>
                      </div>
                    </td>
                    {/* Role */}
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {log.role_name}
                    </td>
                    {/* Action Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    {/* Entity */}
                    <td className="px-6 py-4 text-xs whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">{log.entity_type}</span>
                        {log.entity_id && (
                          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">ID: {log.entity_id}</span>
                        )}
                      </div>
                    </td>
                    {/* Description */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {log.description}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 text-xs font-semibold">
                    No matching audit log actions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination control */}
        {totalPages > 1 && (
          <div className="bg-slate-50/30 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLogs.length)} of {filteredLogs.length} audit items
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-white transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-white transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
