import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const ProfileComponent = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const fetchProfileDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authService.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setName(res.data.name || "");
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");
      } else {
        setError("Failed to load profile details.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Phone number must be a valid 10-digit number.");
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await authService.updateProfile({ 
        name: name.trim(),
        email: email.trim(), 
        phone: phone.trim() 
      });
      if (res.success) {
        setSuccess("Profile details updated successfully!");
        setIsEditing(false);
        fetchProfileDetails();
        
        // Update user state in localStorage if self
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          currentUser.name = name.trim();
          currentUser.email = email.trim();
          currentUser.phone = phone.trim();
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      } else {
        setError(res.message || "Failed to update profile.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while updating profile.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const getRoleLabel = (roleId) => {
    if (roleId === 1) return "Super Admin";
    if (roleId === 2) return "Admin";
    return "Employee";
  };

  const getRoleColor = (roleId) => {
    if (roleId === 1) return "bg-red-50 text-red-650 border border-red-150";
    if (roleId === 2) return "bg-indigo-50 text-indigo-650 border border-indigo-150";
    return "bg-blue-50 text-blue-650 border border-blue-150";
  };

  const getBackPath = () => {
    if (user?.role_id === 1) return "/superadmin/dashboard";
    if (user?.role_id === 2) return "/admin/dashboard";
    return "/employee/dashboard";
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center py-32 space-y-4">
      <svg className="animate-spin h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <span className="text-sm font-bold text-slate-500 animate-pulse">Syncing profile...</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left py-2 pb-12 select-none">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">My Profile</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            View, manage, and update your personal credentials.
          </p>
        </div>
        <button
          onClick={() => navigate(getBackPath())}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Dashboard
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column: Avatar & Quick Info Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          
          <div className="w-24 h-24 rounded-full bg-slate-50 border-4 border-slate-100 flex items-center justify-center text-slate-700 font-black text-3xl shadow-inner mt-4">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          
          <h3 className="text-lg font-black text-slate-800 tracking-tight mt-4">{profile?.name}</h3>
          <p className="text-xs text-slate-400 font-bold tracking-wider mt-0.5">{profile?.employee_id}</p>
          
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mt-3 ${getRoleColor(profile?.role_id)}`}>
            {getRoleLabel(profile?.role_id)}
          </span>

          <div className="w-full border-t border-slate-100 my-6"></div>

          {/* Quick Metrics */}
          <div className="w-full space-y-4 text-xs font-semibold text-slate-500">
            <div className="flex justify-between">
              <span>Account Status</span>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${profile?.status ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-650 border border-red-100'}`}>
                {profile?.status ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Joined Date</span>
              <span className="text-slate-850 font-bold">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Details Form & Groups */}
        <div className="lg:col-span-8 space-y-6">

          {/* Profile Details Form Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h4 className="text-base font-black text-slate-800 tracking-tight">Contact Information</h4>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl transition-all cursor-pointer border border-blue-100"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-xs font-semibold mb-6 animate-shake">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-2xl text-xs font-semibold mb-6">
                {success}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-slate-800">Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-semibold border border-slate-200 rounded-2xl text-slate-700 py-3 px-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                    placeholder="Full Name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-bold text-slate-800">Email Address <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-2xl text-slate-700 py-3 px-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <label className="text-xs font-bold text-slate-800">Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full text-xs font-semibold border border-slate-200 rounded-2xl text-slate-700 py-3 px-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                      placeholder="10-digit number"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setError(""); setSuccess(""); }}
                    className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer"
                  >
                    {submitLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-semibold text-slate-500">
                <div className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">Full Name</span>
                  <span className="text-slate-850 font-black text-sm">{profile?.name || '—'}</span>
                </div>
                <div className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">Email Address</span>
                  <span className="text-slate-850 font-black text-sm">{profile?.email || '—'}</span>
                </div>
                <div className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">Phone Number</span>
                  <span className="text-slate-850 font-black text-sm">{profile?.phone || '—'}</span>
                </div>
                <div className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">Designation</span>
                  <span className="text-slate-850 font-black text-sm">{profile?.designation || '—'}</span>
                </div>
                <div className="flex flex-col p-4 bg-slate-50/50 rounded-2xl border border-slate-100 sm:col-span-2">
                  <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">Security Settings</span>
                  <button
                    onClick={() => navigate(user?.role_id === 1 ? "/superadmin/change-password" : user?.role_id === 2 ? "/admin/change-password" : "/employee/change-password")}
                    className="text-left text-blue-600 hover:text-blue-700 font-bold text-xs mt-1 cursor-pointer transition-all hover:underline"
                  >
                    Change Account Password
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Groups / Scopes Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

            <div className="border-b border-slate-100 pb-4 mb-4">
              <h4 className="text-base font-black text-slate-800 tracking-tight">Assigned Work Scopes / Groups</h4>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {profile?.groups && profile.groups.length > 0 ? (
                profile.groups.map((group) => (
                  <span
                    key={group.id}
                    className="px-3.5 py-2 bg-blue-50/60 text-blue-600 border border-blue-100 rounded-2xl text-xs font-bold transition-all shadow-sm hover:bg-blue-50"
                  >
                    {group.group_name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic font-semibold">No assigned scopes.</span>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProfileComponent;
