import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import reportService from "../../services/reportService";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import RichTextEditor from "../../components/common/RichTextEditor";

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

const getFileIcon = (filename = "") => {
  const ext = filename.split(".").pop().toLowerCase();
  if (["pdf"].includes(ext))
    return { color: "text-red-500", bg: "bg-red-50", border: "border-red-100" };
  if (["xls", "xlsx", "csv"].includes(ext))
    return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" };
  if (["doc", "docx"].includes(ext))
    return { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" };
  if (["png", "jpg", "jpeg"].includes(ext))
    return { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" };
  return { color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-100" };
};

const formatBytes = (bytes = 0) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const getPlainTextFromHtml = (html = "") => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const extractTomorrowPlan = (workDone = "") => {
  const text = getPlainTextFromHtml(workDone).replace(/\r/g, "");
  const match = text.match(/plan\s+for\s+tomorrow\s*:?\s*([\s\S]*?)(?:\n\s*(?:attachments?|remarks?|status)\s*:|$)/i);
  return match ? match[1].trim() : "";
};

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleId = user?.role_id;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editWorkDone, setEditWorkDone] = useState("");
  const [editTomorrowPlan, setEditTomorrowPlan] = useState("");
  const [descCharCount, setDescCharCount] = useState(0);
  const [editAttachments, setEditAttachments] = useState([]); // kept from db
  const [newFiles, setNewFiles] = useState([]); // newly added files
  const [dragOver, setDragOver] = useState(false);

  // Review
  const [adminRemarks, setAdminRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const fetchReportDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reportService.getReportById(id);
      if (res.success && res.data) {
        const tomorrowPlan =
          String(res.data.tomorrow_plan || res.data.tomorrowPlan || "").trim() ||
          extractTomorrowPlan(res.data.work_done);
        const d = {
          ...res.data,
          title: res.data.title || res.data.reportTitle || "Daily Status Report",
          tomorrow_plan: tomorrowPlan,
        };
        setReport(d);
        setEditDate(d.report_date?.split("T")[0] || "");
        setEditTitle(d.title || "Daily Status Report");
        setEditWorkDone(d.work_done || "");
        setEditTomorrowPlan(d.tomorrow_plan || "");
        setAdminRemarks(d.admin_remarks || "");
        setEditAttachments(Array.isArray(d.attachments) ? d.attachments : []);
      } else {
        setError("Report not found.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load report details.");
    } finally {
      setLoading(false);
    }
  };

  const getTodayDateString = () => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
  };

  const ALLOWED_EXT = [".pdf",".doc",".docx",".xls",".xlsx",".png",".jpg",".jpeg",".txt",".csv"];
  const addFiles = (fileList) => {
    const incoming = Array.from(fileList);
    const valid = [];
    for (const file of incoming) {
      const ext = "."+file.name.split(".").pop().toLowerCase();
      if (!ALLOWED_EXT.includes(ext)) continue;
      if (file.size > 5*1024*1024) continue;
      valid.push(file);
    }
    setNewFiles((prev) => [...prev, ...valid].slice(0, 5));
  };

  const handleEditSave = async () => {
    if (!editTitle.trim()) { alert("Report Title is required."); return; }
    if (!editWorkDone.trim()) { alert("Work done is required."); return; }
    setActionLoading(true);
    try {
      const res = await reportService.updateReport(
        id,
        { title: editTitle.trim(), workDone: editWorkDone.trim(), tomorrowPlan: editTomorrowPlan.trim(), reportDate: editDate },
        newFiles,
        editAttachments
      );
      if (res.success) { setIsEditing(false); setNewFiles([]); fetchReportDetails(); }
      else alert(res.message || "Failed to save.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update report.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    setActionLoading(true);
    try {
      const res = await reportService.deleteReport(id);
      if (res.success) navigate("/employee/reports");
      else alert(res.message || "Failed to delete.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete report.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async (status) => {
    setActionLoading(true);
    try {
      const res = await reportService.reviewReport(id, status, adminRemarks.trim());
      if (res.success) fetchReportDetails();
      else alert(res.message || "Failed to submit review.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to review report.");
    } finally {
      setActionLoading(false);
    }
  };

  const getBackPath = () => {
    if (roleId === 1) return "/superadmin/dashboard";
    if (roleId === 2) return "/admin/reports";
    return "/employee/reports";
  };

  const getStatusBadge = (status) => {
    const map = {
      APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
      REJECTED: "bg-red-50 text-red-600 border-red-100",
      PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wide ${map[status] || map.PENDING}`}>
        {status === "APPROVED" && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
        )}
        {status}
      </span>
    );
  };

  const getStatusDotColor = (status) => {
    if (status === "APPROVED") return "bg-emerald-500";
    if (status === "REJECTED") return "bg-red-500";
    return "bg-amber-500";
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center py-32 space-y-4">
      <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <span className="text-sm font-bold text-slate-500 animate-pulse">Loading report...</span>
    </div>
  );

  if (error) return (
    <div className="max-w-3xl mx-auto py-12 text-center">
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-xs font-semibold mb-6">{error}</div>
      <button onClick={() => navigate(getBackPath())} className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer">Go Back</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-5 text-left py-2 pb-12 select-none">
      <style>{`
        .rich-text-content {
          white-space: pre-wrap !important;
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }
        .rich-text-content p,
        .rich-text-content div:not(.table-wrapper),
        .rich-text-content span,
        .rich-text-content li {
          white-space: pre-wrap !important;
        }
        .rich-text-content p,
        .rich-text-content div:not(.table-wrapper) {
          margin: 0.5rem 0 !important;
          display: block !important;
        }
        .rich-text-content h1 { font-size: 2rem !important; font-weight: 800 !important; line-height: 1.2 !important; margin: 1rem 0 0.5rem !important; }
        .rich-text-content h2 { font-size: 1.5rem !important; font-weight: 800 !important; line-height: 1.25 !important; margin: 0.875rem 0 0.5rem !important; }
        .rich-text-content h3 { font-size: 1.25rem !important; font-weight: 800 !important; line-height: 1.3 !important; margin: 0.75rem 0 0.5rem !important; }
        .rich-text-content ul { list-style-type: disc !important; padding-left: 24px !important; margin: 8px 0 !important; }
        .rich-text-content ol { list-style-type: decimal !important; padding-left: 24px !important; margin: 8px 0 !important; }
        .rich-text-content li { margin: 0.25rem 0 !important; }
        .rich-text-content font[size="1"] { font-size: 10px; }
        .rich-text-content font[size="2"] { font-size: 12px; }
        .rich-text-content font[size="3"] { font-size: 14px; }
        .rich-text-content font[size="4"] { font-size: 16px; }
        .rich-text-content font[size="5"] { font-size: 18px; }
        .rich-text-content font[size="6"] { font-size: 24px; }
        .rich-text-content font[size="7"] { font-size: 32px; }
        .rich-text-content table {
          border-collapse: collapse !important;
          width: 100% !important;
          min-width: 800px !important;
        }
        .rich-text-content th,
        .rich-text-content td {
          border: 1px solid #e2e8f0 !important;
          padding: 0.625rem !important;
          vertical-align: top !important;
        }
        .rich-text-content th {
          background: #f8fafc !important;
          font-weight: 800 !important;
        }
        .rich-text-content .table-wrapper { overflow-x: auto !important; max-width: 100% !important; margin: 1rem 0 !important; border: 1px solid #e2e8f0 !important; border-radius: 12px !important; box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important; }
      `}</style>

      {/* Breadcrumb & back */}
      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
        <button
          onClick={() => navigate(getBackPath())}
          className="hover:text-blue-600 transition-colors cursor-pointer"
        >
          My Reports
        </button>
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-600">Report Details</span>
      </div>

      {/* Title Header Block */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="flex items-center gap-4 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-slate-800 tracking-tight">
                {report.title || "Daily Status Report"}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                Daily
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5">
              Submitted on{" "}
              {new Date(report.report_date).toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              ,{" "}
              {new Date(
                report.created_at || report.report_date,
              ).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Current Status
            </span>
            {getStatusBadge(report.status)}
          </div>
          {roleId === 3 && report.status !== "APPROVED" && !isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        /* Full-width Edit Mode */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-800">Edit Report</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-bold text-slate-800">
                Report Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value.slice(0, 100))}
                className="w-full text-sm border border-slate-200 rounded-2xl text-slate-700 py-3 px-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-200 font-medium"
                maxLength={100}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <CustomDatePicker
                label="Report Date"
                value={editDate}
                onChange={setEditDate}
                maxDate={getTodayDateString()}
              />
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-bold text-slate-800">
              Plan for Tomorrow
            </label>
            <textarea
              value={editTomorrowPlan}
              onChange={(e) =>
                setEditTomorrowPlan(e.target.value.slice(0, 300))
              }
              className="w-full text-sm border border-slate-200 rounded-2xl text-slate-700 py-3 px-4 shadow-sm resize-none h-24 outline-none focus:ring-2 focus:ring-blue-200 font-medium"
              maxLength={300}
            />
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">
                Work Done <span className="text-red-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                {descCharCount}/2000
              </span>
            </div>
            <RichTextEditor
              value={editWorkDone}
              onChange={setEditWorkDone}
              placeholder="Write report details..."
              charCount={descCharCount}
              setCharCount={setDescCharCount}
            />
          </div>

          {/* Existing attachments */}
          {editAttachments.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Existing Attachments
              </label>
              {editAttachments.map((att, i) => {
                const icon = getFileIcon(att.originalName || att.filename);
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg ${icon.bg} border ${icon.border} flex items-center justify-center shrink-0`}
                      >
                        <svg
                          className={`w-3.5 h-3.5 ${icon.color}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          {att.originalName || att.filename}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {formatBytes(att.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditAttachments((p) => p.filter((_, j) => j !== i))
                      }
                      className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* New file upload */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Add More Files
            </label>
            <div
              className={`border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer ${dragOver ? "border-blue-400 bg-blue-50/30" : "border-slate-200 bg-slate-50 hover:border-blue-300"}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
                onChange={(e) => addFiles(e.target.files)}
              />
              <p className="text-xs font-bold text-slate-500 text-center">
                Drag & drop or{" "}
                <span className="text-blue-600 underline">browse</span>
              </p>
            </div>
            {newFiles.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm"
              >
                <p className="text-xs font-bold text-slate-700">
                  {file.name}{" "}
                  <span className="text-slate-400 font-semibold">
                    · {formatBytes(file.size)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setNewFiles((p) => p.filter((_, j) => j !== i))
                  }
                  className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEditSave}
              disabled={actionLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              {actionLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      ) : (
        /* Two-column view matching mockup */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Content */}
          <div className="lg:col-span-8 space-y-5">
            {/* Work Summary */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                  Work Summary / Work Done
                </h4>
              </div>
              <div
                className="rich-text-content text-sm text-slate-650 leading-relaxed font-medium whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: report.work_done }}
              />
            </div>

            {/* Tomorrow's Plan */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                  Tomorrow's Plan
                </h4>
              </div>
              <p className="text-sm text-slate-650 leading-relaxed font-medium whitespace-pre-wrap">
                {report.tomorrow_plan || (
                  <span className="italic text-slate-400">
                    No plan provided.
                  </span>
                )}
              </p>
            </div>

            {/* Attachments */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </div>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                  Attachments
                </h4>
                <span className="text-[10px] font-black text-slate-400 ml-auto">
                  {(report.attachments || []).length} files attached
                </span>
              </div>

              {!report.attachments || report.attachments.length === 0 ? (
                <p className="text-xs italic text-slate-400 font-semibold">
                  No attachments uploaded.
                </p>
              ) : (
                <div className="space-y-2">
                  {report.attachments.map((att, i) => {
                    const icon = getFileIcon(att.originalName || att.filename);
                    const fileUrl = `${BACKEND_URL}${att.url}`;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl ${icon.bg} border ${icon.border} flex items-center justify-center shrink-0`}
                          >
                            <svg
                              className={`w-4 h-4 ${icon.color}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">
                              {att.originalName || att.filename}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold">
                              {formatBytes(att.size)}
                            </p>
                          </div>
                        </div>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={att.originalName || att.filename}
                          className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all shadow-sm"
                          title="Download file"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer: Report Type & Date */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Report Type
                </span>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[11px] font-black">
                  Daily
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Reporting Date
                </span>
                <span className="text-xs font-black text-slate-800">
                  {new Date(report.report_date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Back button */}
            <button
              onClick={() => navigate(getBackPath())}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl shadow-sm hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to {roleId === 2 ? "Review Reports" : "My Reports"}
            </button>
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            {/* Report Information */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-1">
                <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                  Report Information
                </h4>
              </div>
              {[
                {
                  label: "Report ID",
                  value: `RPT-${String(report.id).padStart(4, "0")}`,
                },
                {
                  label: "Submitted By",
                  value: `${report.employee_name} (${report.employee_code})`,
                },
                { label: "Designation", value: report.designation || "—" },
                { label: "Group", value: report.group_name || "—" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-3"
                >
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">
                    {label}
                  </span>
                  <span className="text-[11px] font-black text-slate-700 text-right leading-tight">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Status Timeline */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-5 h-5 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                  Status Timeline
                </h4>
              </div>
              <div className="relative space-y-4">
                <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-100"></div>

                {/* Submitted */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-white shadow shrink-0 mt-0.5 z-10"></div>
                  <div>
                    <span className="block text-[11px] font-black text-slate-800">
                      Submitted
                    </span>
                    <span className="block text-[10px] text-slate-400 font-semibold">
                      Report submitted successfully
                    </span>
                    <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                      {new Date(report.report_date).toLocaleDateString(
                        "en-US",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}
                    </span>
                  </div>
                </div>

                {/* Reviewed */}
                {report.reviewed_at && (
                  <div className="flex items-start gap-3 relative">
                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 border-2 border-white shadow shrink-0 mt-0.5 z-10"></div>
                    <div>
                      <span className="block text-[11px] font-black text-slate-800">
                        Reviewed
                      </span>
                      <span className="block text-[10px] text-slate-400 font-semibold">
                        Report reviewed by admin
                      </span>
                      <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                        {new Date(report.reviewed_at).toLocaleDateString(
                          "en-US",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Final status */}
                {(report.status === "APPROVED" ||
                  report.status === "REJECTED") && (
                  <div className="flex items-start gap-3 relative">
                    <div
                      className={`w-4.5 h-4.5 rounded-full ${getStatusDotColor(report.status)} border-2 border-white shadow shrink-0 mt-0.5 z-10`}
                    ></div>
                    <div>
                      <span className="block text-[11px] font-black text-slate-800">
                        {report.status === "APPROVED" ? "Approved" : "Rejected"}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-semibold">
                        Report {report.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Pending placeholder */}
                {report.status === "PENDING" && (
                  <div className="flex items-start gap-3 relative">
                    <div className="w-4.5 h-4.5 rounded-full bg-amber-400 border-2 border-white shadow shrink-0 mt-0.5 z-10 animate-pulse"></div>
                    <div>
                      <span className="block text-[11px] font-black text-slate-800">
                        Awaiting Review
                      </span>
                      <span className="block text-[10px] text-slate-400 font-semibold">
                        Pending admin review
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Remarks display */}
            {(report.admin_remarks || report.status !== "PENDING") && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="w-5 h-5 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                    Remarks
                  </h4>
                </div>
                <p className="text-xs font-semibold text-slate-650 leading-relaxed">
                  {report.admin_remarks || (
                    <span className="italic text-slate-400 font-bold">
                      No remarks entered.
                    </span>
                  )}
                </p>
                {report.reviewer_name && (
                  <p className="text-[10px] text-slate-400 font-bold border-t border-slate-50 pt-2">
                    — Reviewed by {report.reviewer_name} ({report.reviewer_code}
                    )<br />
                    {report.reviewed_at &&
                      new Date(report.reviewed_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                  </p>
                )}
              </div>
            )}

            {/* Admin Review Actions */}
            {(roleId === 1 || roleId === 2) && report.status === "PENDING" && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-0.5">
                  Actions Panel
                </h4>
                <div className="flex flex-col space-y-2">
                  <label className="text-[10px] font-bold text-slate-700 pl-0.5">
                    Review Remarks
                  </label>
                  <textarea
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    placeholder="Enter review comments..."
                    className="w-full text-xs font-semibold border border-slate-200 rounded-2xl text-slate-700 py-3.5 px-4 shadow-sm h-28 resize-none hover:border-slate-350 transition-all outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleReview("REJECTED")}
                    disabled={actionLoading}
                    className="py-2.5 bg-white border border-red-200 hover:border-red-300 hover:bg-red-50/50 text-red-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>{" "}
                    Reject
                  </button>
                  <button
                    onClick={() => handleReview("APPROVED")}
                    disabled={actionLoading}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>{" "}
                    Approve
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
