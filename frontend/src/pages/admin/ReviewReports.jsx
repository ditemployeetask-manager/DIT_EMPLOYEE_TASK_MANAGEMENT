import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import reportService from "../../services/reportService";
import CustomDatePicker from "../../components/common/CustomDatePicker";

const ReviewReports = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchTeamReports();
  }, [page, statusFilter, dateFilter]);

  const fetchTeamReports = async () => {
    setLoading(true);
    try {
      const res = await reportService.getTeamReports(
        page,
        8,
        search,
        statusFilter,
        dateFilter
      );
      if (res.success && res.data) {
        setReports(res.data);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching team reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTeamReports();
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setDateFilter("");
    setPage(1);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">
            Rejected
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">
            Pending Review
          </span>
        );
    }
  };

  // Strip html parser for work done preview
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-none text-left py-2">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Team Submissions</h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          Review and manage status reports submitted by group employees.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:max-w-md">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search by employee name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white pl-9 pr-4 py-2.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button 
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Right side controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Status selection */}
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

          {/* Custom Date Filter */}
          <div className="w-40">
            <CustomDatePicker
              value={dateFilter}
              onChange={(d) => { setDateFilter(d); setPage(1); }}
              placeholder="Filter by Date"
            />
          </div>

          {(search || statusFilter || dateFilter) && (
            <button 
              onClick={clearFilters}
              className="px-4 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
            >
              Clear
            </button>
          )}

        </div>
      </div>

      {/* Reports Listing Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-4">
            <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span className="text-xs font-bold text-slate-500 animate-pulse">Loading team reports...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-24 bg-white border border-slate-200 rounded-3xl shadow-sm text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
               <svg className="w-8 h-8 text-slate-350" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
            </div>
            <h3 className="text-base font-bold text-slate-700">No submissions found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs font-semibold">
              No matching task reports were submitted by team members.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <div 
                key={report.id}
                onClick={() => navigate(`/admin/reports/${report.id}`)}
                className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-slate-350 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-600 transition-all"></div>
                
                {/* Header row: employee + date info */}
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      {report.name?.charAt(0)}
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-bold text-slate-800 leading-tight">{report.name}</span>
                      <span className="block text-[9px] font-bold text-slate-400 leading-none mt-0.5">{report.employee_id}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-700">
                      {new Date(report.report_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="block text-[9px] font-bold text-slate-400 mt-0.5 leading-none">{report.group_name}</span>
                  </div>
                </div>

                {/* Body details preview */}
                <div className="space-y-3 flex-grow text-left">
                  <div>
                    <span className="text-xs font-extrabold text-slate-850 block mb-1">
                      {report.title || "Daily Status Report"}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Work Done</h5>
                    <p className="text-xs font-semibold text-slate-600 line-clamp-2 leading-relaxed">
                      {stripHtml(report.work_done)}
                    </p>
                  </div>
                  {report.tomorrow_plan && (
                    <div>
                      <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Next Plan</h5>
                      <p className="text-xs font-semibold text-slate-500 line-clamp-1 leading-relaxed">
                        {report.tomorrow_plan}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer status and link */}
                <div className="flex items-center justify-between gap-4 mt-5 pt-3 border-t border-slate-100">
                  {getStatusBadge(report.status)}
                  <span className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors leading-none">
                    Review Details
                    <svg className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

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
  );
};

export default ReviewReports;
