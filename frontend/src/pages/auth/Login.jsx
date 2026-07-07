import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import emblemLogo from "../../assets/logos/emblem_of_india.svg";
import ujjayantaPalace from "../../assets/images/ujjayanta_palace.jpg";

const Login = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Find where they came from (in case they got redirected from a protected route)
  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!employeeId || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await login(employeeId, password);
      if (res.success) {
        if (from) {
          navigate(from, { replace: true });
        } else {
          const roleId = res.user.role_id;
          if (roleId === 1) navigate("/superadmin/dashboard", { replace: true });
          else if (roleId === 2) navigate("/admin/dashboard", { replace: true });
          else if (roleId === 3) navigate("/employee/dashboard", { replace: true });
          else navigate("/login", { replace: true });
        }
      } else {
        setError(res.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* LEFT COLUMN: BRANDING WITH INTEGRATED PALACE PHOTO AT THE BOTTOM (DESKTOP ONLY) */}
      {/* Background color changed to a light-medium steel blue (#8ca0ba) to bridge the value difference with the photo sky and avoid sudden contrast breaks */}
      <div className="hidden md:flex flex-col w-1/2 relative overflow-hidden min-h-screen border-r border-slate-200 bg-[#8ca0ba]">
        {/* Palace Image occupying the bottom 60% of the screen, pushing the building down */}
        {/* Using a larger 50% mask fade to ensure an extremely gradual, smooth transition */}
        <div 
          className="absolute bottom-0 inset-x-0 h-[60%] w-full"
          style={{
            maskImage: "linear-gradient(to bottom, transparent 0%, black 50%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 50%)"
          }}
        >
          <img 
            src={ujjayantaPalace} 
            alt="Ujjayanta Palace Background" 
            className="w-full h-full object-cover object-top"
          />
        </div>
        
        {/* Subtle white/light gradient overlay at the very top for extra text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none"></div>

        {/* Foreground Content overlayed on the photo */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12 lg:p-16">
          {/* Top Text Branding on top of the smoothly blended sky background */}
          <div>
            {/* National Emblem Logo (Original colored form from mockup) */}
            <img src={emblemLogo} alt="Emblem of India" className="h-16 w-auto mb-6 object-contain" />
            
            {/* Text colors matched to the steel-blue sky background (#8ca0ba) using harmonious navy/slate tones */}
            <h1 className="text-3xl lg:text-4xl font-bold text-[#18273c] tracking-tight leading-none uppercase">
              DIT EMPLOYEE
            </h1>
            <h2 className="text-base lg:text-lg font-semibold text-[#1d3d75] mt-1.5 uppercase tracking-wide">
              Task Management System
            </h2>
            
            {/* Flag Color Indicator */}
            <div className="flex w-24 h-1 rounded-full overflow-hidden my-4">
              <div className="bg-[#FF9933] w-1/3"></div>
              <div className="bg-slate-100/80 w-1/3"></div>
              <div className="bg-[#128807] w-1/3"></div>
            </div>
            
            <p className="text-[#2d3e52] text-sm leading-relaxed font-semibold max-w-xs">
              A secure and efficient platform for employee task management and reporting.
            </p>
          </div>

          {/* Floating Badges Card overlaying the palace building at the bottom (Centered, compact max-width to lessen distance) */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] max-w-[420px] bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl py-3 px-5 flex items-center justify-between shadow-xl shadow-slate-900/10">
            {/* Secure Authentication */}
            <div className="flex items-center gap-2">
              <svg className="w-7 h-7 text-blue-850 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-slate-800 leading-tight">Secure</span>
                <span className="text-[9px] font-medium text-slate-500 leading-tight">Authentication</span>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="h-6 border-r border-slate-200"></div>

            {/* Role Based Access */}
            <div className="flex items-center gap-2">
              <svg className="w-7 h-7 text-blue-855 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 116 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-slate-800 leading-tight">Role Based</span>
                <span className="text-[9px] font-medium text-slate-500 leading-tight">Access</span>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="h-6 border-r border-slate-200"></div>

            {/* Smart Dashboards */}
            <div className="flex items-center gap-2">
              <svg className="w-7 h-7 text-blue-855 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-slate-800 leading-tight">Smart</span>
                <span className="text-[9px] font-medium text-slate-500 leading-tight">Dashboards</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LOGIN FORM CARD */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-6 md:p-12 lg:p-16 bg-slate-50 min-h-screen">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex flex-col items-center mb-8 text-center">
          <img src={emblemLogo} alt="Emblem of India" className="h-14 w-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight uppercase leading-none">
            DIT EMPLOYEE
          </h1>
          <h2 className="text-md font-semibold text-blue-700 mt-1 uppercase tracking-wide">
            Task Management System
          </h2>
          <div className="flex w-20 h-1 rounded-full overflow-hidden my-3 mx-auto">
            <div className="bg-[#FF9933] w-1/3"></div>
            <div className="bg-slate-200 w-1/3"></div>
            <div className="bg-[#128807] w-1/3"></div>
          </div>
        </div>

        {/* Login Card (Matches proportions, rounded corners, and sizes of mockup) */}
        <div className="bg-white p-10 md:p-12 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100/80 max-w-[460px] w-full">
          <div className="flex flex-col items-center mb-8">
            {/* emblem in circle */}
            <div className="h-20 w-20 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center p-3.5 shadow-sm mb-4">
              <img src={emblemLogo} alt="Emblem logo" className="h-full w-auto object-contain" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 tracking-tight mb-1">
              Welcome Back!
            </h2>
            
            {/* Mockup horizontal line with centered text */}
            <div className="flex items-center w-full mt-4">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="px-3 text-slate-400 text-xs font-normal">
                Please sign in to continue
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 p-3 rounded-lg text-xs mb-4 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee ID with inline icon and shorter, centered vertical divider line (h-6) */}
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="h-6 border-r border-slate-200 ml-3"></div>
              </div>
              <input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Employee ID"
                disabled={loading}
                className="w-full bg-white border border-slate-200 rounded-lg pl-16 pr-4 py-3.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/10 transition-all font-normal"
              />
            </div>

            {/* Password with inline icon, shorter, centered vertical divider line (h-6), and show/hide toggle */}
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="h-6 border-r border-slate-200 ml-3"></div>
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={loading}
                className="w-full bg-white border border-slate-200 rounded-lg pl-16 pr-12 py-3.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/10 transition-all font-normal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1 select-none">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-350 text-blue-900 focus:ring-blue-900 h-4 w-4"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => alert("Please contact your administrator to reset your password.")}
                className="text-blue-855 hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1b3b6f] hover:bg-[#12284c] disabled:bg-slate-400 text-white font-semibold py-3.5 rounded-xl transition-all mt-4 flex items-center justify-center gap-2 shadow-md shadow-slate-200/50 cursor-pointer text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>{loading ? "Signing In..." : "Sign In"}</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-[10px] sm:text-xs text-slate-400 font-normal">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29(9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure • Reliable • Transparent</span>
          </div>
          <p>© 2026 Directorate of Information Technology, Government of Tripura</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
