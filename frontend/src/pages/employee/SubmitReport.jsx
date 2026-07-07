import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import reportService from "../../services/reportService";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import RichTextEditor from "../../components/common/RichTextEditor";

const SubmitReport = () => {
  const navigate = useNavigate();
  
  // Format today's date
  const getTodayDateString = () => {
    const today = new Date();
    const yearStr = today.getFullYear();
    const monthStr = String(today.getMonth() + 1).padStart(2, "0");
    const dayStr = String(today.getDate()).padStart(2, "0");
    return `${yearStr}-${monthStr}-${dayStr}`;
  };

  // State mapping the database fields
  const [reportDate, setReportDate] = useState(getTodayDateString());
  const [title, setTitle] = useState("Daily Status Report");
  const [workDone, setWorkDone] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");
  const [descCharCount, setDescCharCount] = useState(0);
  const [attachments, setAttachments] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const ALLOWED_EXTENSIONS = [".pdf",".doc",".docx",".xls",".xlsx",".png",".jpg",".jpeg",".txt",".csv"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList);
    const valid = [];
    for (const file of incoming) {
      const ext = "."+file.name.split(".").pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setError(`File type not allowed: ${file.name}`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        setError(`File too large (max 5MB): ${file.name}`);
        continue;
      }
      valid.push(file);
    }
    setAttachments((prev) => {
      const combined = [...prev, ...valid];
      return combined.slice(0, 5); // max 5 files
    });
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formTitle = formData.get("title");
    const formTomorrowPlan = formData.get("tomorrowPlan");
    const reportTitle = String(formTitle || title).trim();
    const nextTomorrowPlan = String(formTomorrowPlan ?? tomorrowPlan).trim();

    if (!reportTitle) {
      setError("Report Title is required.");
      return;
    }
    if (!workDone.trim()) {
      setError("Report Description is required.");
      return;
    }
    if (descCharCount < 5) {
      setError("Report Description must contain at least 5 characters of details.");
      return;
    }
    if (!reportDate) {
      setError("Report Date is required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await reportService.createReport(
        {
          title: reportTitle,
          reportTitle,
          workDone: workDone.trim(),
          tomorrowPlan: nextTomorrowPlan,
          tomorrow_plan: nextTomorrowPlan,
          reportDate,
        },
        attachments
      );

      if (res.success) {
        setSuccess(true);
        setWorkDone("");
        setTomorrowPlan("");
        setTimeout(() => {
          navigate("/employee/reports");
        }, 1500);
      } else {
        setError(res.message || "Failed to submit report.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while submitting your report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12 text-left">
      
      {/* Page Title */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Create Report</h2>
        <p className="text-sm font-medium text-slate-500 mt-2">
          File your daily progress update and schedule objectives for tomorrow.
        </p>
      </div>

      {/* Main Form Card with soft blue border accent */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Report Details</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-xs font-semibold animate-shake">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-2xl text-xs font-semibold">
              Report submitted successfully! Redirecting...
            </div>
          )}

          {/* Title Input & Date Picker in a Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-bold text-slate-800">Report Title <span className="text-red-500">*</span></label>
              <input
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 100))}
                className="w-full text-sm border-slate-200 rounded-2xl focus:ring-blue-500 focus:border-blue-500 text-slate-700 py-3.5 px-4 shadow-sm hover:border-slate-350 transition-all font-medium"
                placeholder="e.g. Daily Status Report, API Completed"
                maxLength={100}
                required
              />
              <p className="text-[10px] text-slate-400 font-semibold pl-0.5">
                Maximum 100 characters.
              </p>
            </div>

            {/* Date Picker using CustomDatePicker */}
            <div className="flex flex-col space-y-2">
              <CustomDatePicker
                label="Report Date"
                value={reportDate}
                onChange={setReportDate}
                maxDate={getTodayDateString()}
              />
              <p className="text-[10px] text-slate-400 font-semibold pl-0.5 mt-0.5">
                Select the day you are filing this report for.
              </p>
            </div>
          </div>

          {/* Summary / Tomorrow Plan (Maps to DB tomorrowPlan) */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Summary / Tomorrow's Plan</label>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                {tomorrowPlan.length} / 300
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium pl-0.5">
              Provide a brief summary of what you plan to accomplish during the next shift.
            </p>
            <div className="relative">
              <textarea
                name="tomorrowPlan"
                value={tomorrowPlan}
                onChange={(e) => setTomorrowPlan(e.target.value.slice(0, 300))}
                className="w-full text-sm border-slate-200 rounded-2xl focus:ring-blue-500 focus:border-blue-500 text-slate-700 py-3.5 px-4 shadow-sm resize-none h-28 hover:border-slate-350 transition-all font-medium"
                placeholder="Write a short summary..."
                maxLength={300}
              />
            </div>
          </div>

          {/* Report Description / Work Completed (Maps to DB workDone) */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Report Description <span className="text-red-500">*</span></label>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                {descCharCount} / 2000
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium pl-0.5">
              Provide complete details of your work, progress, findings or observations.
            </p>
            <div className="relative">
              <RichTextEditor
                value={workDone}
                onChange={setWorkDone}
                placeholder="Write the details of your report..."
                charCount={descCharCount}
                setCharCount={setDescCharCount}
              />
            </div>
          </div>

          {/* File Attachments */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800">Attachments <span className="text-xs font-medium text-slate-400">(optional, max 5 files, 5MB each)</span></label>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                {attachments.length} / 5
              </span>
            </div>

            {/* Drop Zone */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-5 transition-all cursor-pointer ${
                dragOver ? "border-blue-400 bg-blue-50/40" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/20"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              onClick={() => document.getElementById("file-upload-input").click()}
            >
              <input
                id="file-upload-input"
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
                onChange={(e) => addFiles(e.target.files)}
              />
              <div className="flex flex-col items-center gap-2 py-3 select-none">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-500">Drag & drop files here or <span className="text-blue-600 underline">browse</span></p>
                <p className="text-[10px] text-slate-400 font-semibold">PDF, Word, Excel, Images — max 5MB each</p>
              </div>
            </div>

            {/* File List */}
            {attachments.length > 0 && (
              <div className="space-y-2 mt-1">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{file.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions Footer */}

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate("/employee/reports")}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 transform rotate-45 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Submit Report
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SubmitReport;
