import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminService from "../../services/adminService";
import employeeService from "../../services/employeeService";
import reportService from "../../services/reportService";
import api from "../../utils/api";

const AdminDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [reports, setReports] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  // Toggled group state
  const [activeGroupId, setActiveGroupId] = useState(null);

  useEffect(() => {
    fetchAdminAndData();
  }, [id]);

  const fetchAdminAndData = async () => {
    setLoading(true);
    setError("");
    try {
      const adminRes = await adminService.getAdminById(parseInt(id));
      if (adminRes.success && adminRes.data) {
        setAdmin(adminRes.data);
        
        // Default to first group
        if (adminRes.data.groups && adminRes.data.groups.length > 0) {
          setActiveGroupId(adminRes.data.groups[0].id);
        }

        // Fetch all employees and team reports
        const [empRes, reportsRes] = await Promise.all([
          employeeService.getAllEmployees(1, 100, ""),
          reportService.getTeamReports(1, 100, "", "", "")
        ]);

        if (empRes.success) {
          setEmployees(empRes.data || []);
        }
        if (reportsRes.success) {
          setReports(reportsRes.data || []);
        }
      } else {
        setError("Admin profile not found.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading admin details.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportGroupReport = async () => {
    if (!activeGroupId) return;
    setExporting(true);
    try {
      const activeGroup = admin.groups.find(g => g.id === activeGroupId);
      const res = await api.get(`/reports/export?groupId=${activeGroupId}`);
      
      const blob = res instanceof Blob ? res : new Blob([res], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `DIT_Group_${activeGroup ? activeGroup.group_name.replace(/\s+/g, "_") : activeGroupId}_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export group report.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] select-none">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#1b3b6f]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <span className="text-xs font-bold text-slate-500 animate-pulse">Loading admin profile details...</span>
        </div>
      </div>
    );
  }

  if (error || !admin) {
    return (
      <div className="max-w-3xl mx-auto py-8 select-none text-left space-y-4">
        <button
          onClick={() => navigate("/superadmin/admins")}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Admins List
        </button>
        <div className="bg-red-55 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-xs font-semibold">
          {error || "Admin not found."}
        </div>
      </div>
    );
  }

  // Filter employees belonging to active group
  const groupEmployees = employees.filter(emp =>
    emp.groups && emp.groups.some(g => g.id === activeGroupId)
  );

  // Filter reports belonging to employees in the active group
  const empIdsInGroup = groupEmployees.map(e => e.employee_id);
  const groupReports = reports.filter(r => empIdsInGroup.includes(r.employee_id));

  const activeGroup = admin.groups ? admin.groups.find(g => g.id === activeGroupId) : null;

  return (
    <div className="max-w-4xl mx-auto select-none text-left py-2 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/superadmin/admins")}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Admins List
      </button>

      {/* Admin Information Header Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#1b3b6f] text-white text-lg font-black flex items-center justify-center border border-slate-200">
            {admin.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 leading-snug">{admin.name}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-[10px] text-slate-400 font-bold tracking-wider">{admin.employee_id}</span>
              <span className="text-[10px] text-slate-350">•</span>
              <span className="text-xs text-slate-500 font-semibold">{admin.designation}</span>
              <span className="text-[10px] text-slate-350">•</span>
              <span className="text-xs text-slate-500 font-semibold">{admin.email}</span>
            </div>
          </div>
        </div>

        {/* Dynamic tabs for multiple groups */}
        {admin.groups && admin.groups.length > 1 && (
          <div className="flex flex-wrap gap-1.5 bg-slate-50 border border-slate-100 p-1 rounded-xl self-start md:self-auto">
            {admin.groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setActiveGroupId(group.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeGroupId === group.id
                    ? "bg-white text-[#1b3b6f] shadow-sm border border-slate-100"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {group.group_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeGroup ? (
        <div className="space-y-6">
          {/* Active Group Info Panel */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Division scope</span>
                <h3 className="text-base font-bold text-slate-800 mt-1">{activeGroup.group_name}</h3>
              </div>

              {/* Group Excel Report Download Button */}
              <button
                onClick={handleExportGroupReport}
                disabled={exporting}
                className="bg-[#1b3b6f] hover:bg-[#12284c] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-slate-200/50 cursor-pointer flex items-center gap-2 self-start sm:self-auto"
              >
                {exporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <span>Generating Excel...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Export Group Excel Report</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Assigned Staff</span>
                <h5 className="text-base font-extrabold text-slate-700 mt-0.5">{groupEmployees.length}</h5>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Total Reports</span>
                <h5 className="text-base font-extrabold text-slate-700 mt-0.5">{groupReports.length}</h5>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase">Pending Review</span>
                <h5 className="text-base font-extrabold text-amber-600 mt-0.5">
                  {groupReports.filter(r => r.status === "PENDING").length}
                </h5>
              </div>
            </div>
          </div>

          {/* Section: Employees under group */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">
              Assigned Group Staff Members
            </h4>

            {groupEmployees.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
                <span className="text-xs text-slate-400 font-bold italic">No employees assigned to this group yet.</span>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Designation</th>
                        <th className="px-6 py-4">Contact Info</th>
                        <th className="px-6 py-4">Submissions</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {groupEmployees.map((emp) => {
                        const empReports = groupReports.filter(r => r.employee_id === emp.employee_id);
                        return (
                          <tr key={emp.id} className="hover:bg-slate-50/30">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-750 font-bold flex items-center justify-center border border-slate-200 flex-shrink-0">
                                  {emp.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-bold text-slate-800 text-sm truncate">{emp.name}</span>
                                  <span className="text-[10px] text-slate-400 font-bold">{emp.employee_id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-slate-50 text-slate-650 border border-slate-200 rounded-lg text-[11px]">
                                {emp.designation}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-slate-850">{emp.email}</span>
                                <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{emp.phone}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-slate-700 font-extrabold">{empReports.length} reports</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => navigate(`/superadmin/employees/${emp.id}`)}
                                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100/70 border border-blue-100 text-[#1b3b6f] rounded-xl text-[10px] font-extrabold transition-all cursor-pointer inline-flex items-center gap-1.5"
                              >
                                View Activity
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
          <span className="text-xs text-slate-400 font-bold italic">No groups/departments assigned to this admin profile.</span>
        </div>
      )}
    </div>
  );
};

export default AdminDetail;
