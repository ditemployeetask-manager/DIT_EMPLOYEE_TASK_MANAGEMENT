import React, { useState, useEffect, useRef } from "react";

// Helper to format date into readable string
const formatReadableDate = (dateStr) => {
  if (!dateStr) return "Select Date";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Select Date";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const CustomDatePicker = ({ value, onChange, label, placeholder = "Select Date", maxDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const isFutureDate = (cell) => {
    if (!maxDate) return false;
    const cellDate = new Date(cell.year, cell.month, cell.day);
    const limitDate = new Date(maxDate);
    limitDate.setHours(0, 0, 0, 0);
    return cellDate > limitDate;
  };

  // Date parsing
  const initialDate = value ? new Date(value) : new Date();
  const [navYear, setNavYear] = useState(initialDate.getFullYear());
  const [navMonth, setNavMonth] = useState(initialDate.getMonth()); // 0-11

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update nav view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setNavYear(d.getFullYear());
        setNavMonth(d.getMonth());
      }
    }
  }, [value]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear(prev => prev - 1);
    } else {
      setNavMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear(prev => prev + 1);
    } else {
      setNavMonth(prev => prev + 1);
    }
  };

  // Generate calendar days
  const getDaysGrid = () => {
    const firstDayIndex = new Date(navYear, navMonth, 1).getDay(); // Day of week (0-6)
    const totalDays = new Date(navYear, navMonth + 1, 0).getDate(); // Days in current month
    const prevTotalDays = new Date(navYear, navMonth, 0).getDate(); // Days in prev month

    const grid = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      grid.push({
        day: prevTotalDays - i,
        month: navMonth === 0 ? 11 : navMonth - 1,
        year: navMonth === 0 ? navYear - 1 : navYear,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      grid.push({
        day: i,
        month: navMonth,
        year: navYear,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill 42 cells (6 rows * 7 columns)
    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      grid.push({
        day: i,
        month: navMonth === 11 ? 0 : navMonth + 1,
        year: navMonth === 11 ? navYear + 1 : navYear,
        isCurrentMonth: false,
      });
    }

    return grid;
  };

  const handleDaySelect = (cell) => {
    const yearStr = cell.year;
    const monthStr = String(cell.month + 1).padStart(2, "0");
    const dayStr = String(cell.day).padStart(2, "0");
    onChange(`${yearStr}-${monthStr}-${dayStr}`);
    setIsOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    const yearStr = today.getFullYear();
    const monthStr = String(today.getMonth() + 1).padStart(2, "0");
    const dayStr = String(today.getDate()).padStart(2, "0");
    onChange(`${yearStr}-${monthStr}-${dayStr}`);
    setIsOpen(false);
  };

  const daysGrid = getDaysGrid();

  // Check if a cell date is the currently selected date
  const isSelected = (cell) => {
    if (!value) return false;
    const d = new Date(value);
    return (
      d.getFullYear() === cell.year &&
      d.getMonth() === cell.month &&
      d.getDate() === cell.day
    );
  };

  // Check if a cell is today
  const isToday = (cell) => {
    const d = new Date();
    return (
      d.getFullYear() === cell.year &&
      d.getMonth() === cell.month &&
      d.getDate() === cell.day
    );
  };

  return (
    <div className="flex flex-col space-y-1 relative" ref={containerRef}>
      {label && <label className="text-xs font-semibold text-slate-500 pl-0.5">{label}</label>}
      
      {/* Input Field trigger wrapper */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 hover:border-slate-300 rounded-xl pl-9 pr-8 py-2 text-sm text-slate-700 font-medium focus:outline-none flex items-center justify-between cursor-pointer select-none transition-all relative min-w-[160px]"
      >
        <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{value ? formatReadableDate(value) : placeholder}</span>
        
        <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Floating Popover Calendar Card */}
      {isOpen && (
        <div className="absolute top-[38px] right-0 sm:left-0 bg-white border border-slate-200 shadow-xl rounded-2xl p-4 w-72 z-50 text-xs font-semibold space-y-3 animate-scale-in">
          {/* Calendar Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1">
              <select
                value={navMonth}
                onChange={(e) => setNavMonth(parseInt(e.target.value))}
                className="bg-transparent border-none text-slate-805 font-bold text-xs focus:outline-none cursor-pointer pr-1 py-0"
              >
                {monthNames.map((name, idx) => (
                  <option key={idx} value={idx}>{name}</option>
                ))}
              </select>
              <select
                value={navYear}
                onChange={(e) => setNavYear(parseInt(e.target.value))}
                className="bg-transparent border-none text-slate-805 font-bold text-xs focus:outline-none cursor-pointer py-0"
              >
                {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 10 + i).map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-505 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-505 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Weekday Labels Grid */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-[10px] uppercase tracking-wider">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <span key={d}>{d}</span>)}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center font-medium">
            {daysGrid.map((cell, idx) => {
              const selected = isSelected(cell);
              const today = isToday(cell);
              const disabled = isFutureDate(cell);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => !disabled && handleDaySelect(cell)}
                  disabled={disabled}
                  className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all text-xs font-semibold ${
                    disabled
                      ? "opacity-30 cursor-not-allowed text-slate-300"
                      : selected
                      ? "bg-[#1b3b6f] text-white font-bold shadow-sm cursor-pointer"
                      : today
                      ? "bg-blue-50 text-[#1b3b6f] font-bold border border-blue-100 cursor-pointer"
                      : cell.isCurrentMonth
                      ? "hover:bg-slate-100 text-slate-700 cursor-pointer"
                      : "text-slate-350 cursor-pointer"
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer controls */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { onChange(""); setIsOpen(false); }}
              className="text-[10px] text-red-500 hover:text-red-700 font-bold cursor-pointer hover:underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSetToday}
              className="text-[10px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer hover:underline"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
