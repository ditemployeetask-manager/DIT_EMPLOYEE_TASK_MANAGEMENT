import React, { useState, useEffect } from "react";
import groupService from "../../services/groupService";

const Group = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await groupService.getAllGroups();
      if (res.success && res.data) {
        setGroups(res.data);
      } else {
        setError("Failed to fetch divisions.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading groups.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (group) => {
    setSelectedGroup(group);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 select-none animate-fade-in pb-8 text-left">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Divisions & Groups</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Browse active administrative divisions, departments, and scopes.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-28 space-y-4">
          <svg className="animate-spin h-9 w-9 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span className="text-xs font-bold text-slate-550 animate-pulse">Syncing divisions...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-650 p-5 rounded-3xl text-xs font-semibold">
          {error}
        </div>
      ) : groups.length === 0 ? (
        <div className="py-24 text-center bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col items-center">
          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-350 shadow-inner">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h4 className="text-sm font-bold text-slate-700">No divisions recorded</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs font-semibold">Contact Super Admin to register a division.</p>
        </div>
      ) : (
        /* Divisions Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div 
              key={group.id}
              onClick={() => handleOpenDetails(group)}
              className="bg-white border border-slate-200 hover:border-slate-350 hover:shadow-md rounded-3xl p-6 transition-all flex flex-col justify-between cursor-pointer relative overflow-hidden group min-h-[160px]"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <span className="text-xs font-black text-slate-800 truncate pr-4">{group.group_name}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                    group.status
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}>
                    {group.status ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-450 line-clamp-2 leading-relaxed mb-4">
                  {group.description || "No division description has been provided yet."}
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                <span className="text-[9px] font-bold text-slate-400">
                  Admins: <span className="text-slate-700 font-extrabold">{group.admins?.length || 0}</span>
                </span>
                <span className="text-[10px] font-black text-blue-650 group-hover:text-blue-750 flex items-center gap-0.5 transition-colors">
                  Details
                  <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Division Details Modal Overlay */}
      {modalOpen && selectedGroup && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-xl relative overflow-hidden animate-scale-in text-left">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">{selectedGroup.group_name}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mt-1 ${
                  selectedGroup.status
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}>
                  {selectedGroup.status ? "Active" : "Inactive"}
                </span>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-650 rounded-lg cursor-pointer transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-xs font-semibold text-slate-500">
              
              {/* Description Block */}
              <div className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1.5">Description</span>
                <p className="text-slate-700 text-xs font-medium leading-relaxed">
                  {selectedGroup.description || "No division description has been provided."}
                </p>
              </div>

              {/* Group Admins Block */}
              <div className="flex flex-col p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-2">Assigned Division Administrators</span>
                {selectedGroup.admins && selectedGroup.admins.length > 0 ? (
                  <div className="space-y-2">
                    {selectedGroup.admins.map((adm) => (
                      <div key={adm.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-150 shadow-sm">
                        <span className="text-slate-800 text-xs font-bold">{adm.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{adm.employee_id}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">No administrators assigned.</span>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Group;
