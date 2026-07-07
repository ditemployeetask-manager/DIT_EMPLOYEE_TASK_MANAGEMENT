import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import employeeService from "../../services/employeeService";

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchEmployees();
  }, [page, limit]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await employeeService.getAllEmployees(page, limit, search);
      if (res.success && res.data) {
        setEmployees(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalRecords(res.totalRecords || 0);
      } else {
        setError("Failed to fetch employees list.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading employees.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const handleResetSearch = () => {
    setSearch("");
    setPage(1);
    setTimeout(() => {
      fetchEmployees();
    }, 0);
  };

  return (
    <div className="space-y-6 select-none animate-fade-in pb-8 text-left">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Staff Directory</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            View employee profiles, contact credentials, and scopes across divisions.
          </p>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        
        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="md:col-span-8 flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by name, employee code, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs font-semibold border border-slate-200 rounded-2xl bg-slate-50 hover:bg-white focus:bg-white py-3 pl-10 pr-4 outline-none shadow-inner focus:ring-2 focus:ring-blue-150 focus:border-blue-500 transition-all font-medium text-slate-700"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-md cursor-pointer"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={handleResetSearch}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Counter KPI Summary */}
        <div className="md:col-span-4 flex justify-end items-center gap-2 text-right">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Employees</span>
          <span className="text-xl font-black text-slate-800 bg-blue-50/50 border border-blue-100 px-3.5 py-1.5 rounded-2xl shadow-sm leading-none">
            {totalRecords}
          </span>
        </div>

      </div>

      {/* Main Directory Table */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-24 space-y-4">
          <svg className="animate-spin h-9 w-9 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span className="text-xs font-bold text-slate-550 animate-pulse">Syncing staff directory...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-650 p-5 rounded-3xl text-xs font-semibold">
          {error}
        </div>
      ) : employees.length === 0 ? (
        <div className="py-24 text-center bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col items-center">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-350 shadow-inner">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h4 className="text-sm font-bold text-slate-700">No staff members found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs font-semibold">Try modifying your search criteria.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-inner bg-slate-50/20">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Assigned Divisions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => (
                  <tr 
                    key={emp.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 bg-white transition-colors"
                  >
                    <td className="py-4 px-4 text-center text-xs font-bold text-slate-400">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                          {emp.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="block text-xs font-black text-slate-800 leading-tight">{emp.name}</span>
                          <span className="block text-[9px] font-bold text-slate-400 leading-none mt-0.5">{emp.employee_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-slate-650">
                      {emp.designation || "—"}
                    </td>
                    <td className="py-4 px-4">
                      <span className="block text-[11px] font-bold text-slate-700 leading-tight">{emp.email}</span>
                      <span className="block text-[9px] font-semibold text-slate-400 mt-0.5 leading-none">{emp.phone}</span>
                    </td>
                    <td className="py-4 px-4 max-w-[180px]">
                      <div className="flex flex-wrap gap-1">
                        {emp.groups && emp.groups.length > 0 ? (
                          emp.groups.map(g => (
                            <span key={g.id} className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-bold">
                              {g.group_name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">None</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        emp.status
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        {emp.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => navigate(`/admin/employees/${emp.id}`)}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-350 rounded-xl text-[10px] font-black transition-all shadow-sm cursor-pointer"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && employees.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
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
  );
};

export default Employees;
