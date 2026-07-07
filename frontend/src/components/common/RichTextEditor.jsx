import React, { useState, useEffect, useRef } from "react";

const RichTextEditor = ({ value, onChange, placeholder, maxChar = 2000, charCount, setCharCount }) => {
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);

  // States to keep track of active formats under cursor selection
  const [activeStyles, setActiveStyles] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    formatBlock: "div",
    fontName: "Arial",
    fontSize: "3",
  });

  const [isInTable, setIsInTable] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // Custom Undo/Redo history stack to capture table mutations reliably
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);
  const typingTimeoutRef = useRef(null);

  // Initialize history on mount or first content load
  useEffect(() => {
    if (history.length === 0) {
      const initialHtml = value || "";
      setHistory([initialHtml]);
      setHistoryIndex(0);
    }
  }, [value]);

  useEffect(() => {
    if (!editorRef.current) return;

    const nextHtml = value || "";
    if (editorRef.current.innerHTML !== nextHtml) {
      editorRef.current.innerHTML = nextHtml;
      setCharCount(editorRef.current.innerText.trim().length);
    }
  }, [value, setCharCount]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const saveToHistory = (newHtml) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    const nextHistory = history.slice(0, historyIndex + 1);
    if (nextHistory[nextHistory.length - 1] === newHtml) return;
    const updatedHistory = [...nextHistory, newHtml];
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevHtml = history[prevIndex];
      isUndoRedoAction.current = true;
      setHistoryIndex(prevIndex);

      if (editorRef.current) {
        editorRef.current.innerHTML = prevHtml;
        const text = editorRef.current.innerText;
        onChange(prevHtml);
        setCharCount(text.trim().length);
      }
      updateActiveStates();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextHtml = history[nextIndex];
      isUndoRedoAction.current = true;
      setHistoryIndex(nextIndex);

      if (editorRef.current) {
        editorRef.current.innerHTML = nextHtml;
        const text = editorRef.current.innerText;
        onChange(nextHtml);
        setCharCount(text.trim().length);
      }
      updateActiveStates();
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault();
      handleRedo();
    }
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
  };

  const checkSelectionInTable = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    let node = selection.getRangeAt(0).startContainer;
    while (node && node !== editorRef.current) {
      if (node.nodeName === "TABLE") {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  };

  const updateActiveStates = () => {
    if (typeof document !== "undefined") {
      setActiveStyles({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        formatBlock: document.queryCommandValue("formatBlock") || "div",
        fontName: document.queryCommandValue("fontName") || "Arial",
        fontSize: document.queryCommandValue("fontSize") || "3",
      });

      setIsInTable(checkSelectionInTable());
      saveSelection();
    }
  };

  const handleCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    handleInput(true); // Save history instantly on format action
    updateActiveStates();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleInput = (immediate = false) => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.innerText;
      let cleanedHtml = html;
      if (editorRef.current.innerHTML === "<br>" || editorRef.current.innerHTML === "<div><br></div>") {
        cleanedHtml = "";
        onChange("");
        setCharCount(0);
      } else {
        onChange(html);
        setCharCount(text.trim().length);
      }

      if (immediate) {
        saveToHistory(cleanedHtml);
      } else {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          saveToHistory(cleanedHtml);
        }, 500);
      }
    }
  };

  const handleSaveLink = () => {
    if (linkUrl.trim()) {
      const formattedUrl = linkUrl.trim().startsWith("http://") || linkUrl.trim().startsWith("https://")
        ? linkUrl.trim()
        : `https://${linkUrl.trim()}`;
      
      restoreSelection();

      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.collapsed) {
          // Insert a new linked text node if no text is selected
          const linkNode = document.createElement("a");
          linkNode.href = formattedUrl;
          linkNode.target = "_blank";
          linkNode.className = "text-blue-600 underline font-medium hover:text-blue-800 transition-colors";
          linkNode.innerText = linkUrl.trim();
          range.insertNode(linkNode);
          
          range.setStartAfter(linkNode);
          range.setEndAfter(linkNode);
          selection.removeAllRanges();
          selection.addRange(range);
          
          handleInput(true);
        } else {
          handleCommand("createLink", formattedUrl);
        }
      } else {
        handleCommand("createLink", formattedUrl);
      }
    }
    setLinkUrl("");
    setShowLinkInput(false);
  };

  // Insert default 3x3 table with scroll wrapper and no alert prompts
  const handleInsertDefaultTable = () => {
    const tableHTML = `
      <div class="table-wrapper" contenteditable="false">
        <table class="border-collapse border border-slate-300 w-full text-sm" style="min-width: 800px; width: 100%;" contenteditable="true">
          <thead>
            <tr class="bg-slate-50">
              <th class="border border-slate-200 p-2.5 font-bold text-slate-700">Header 1</th>
              <th class="border border-slate-200 p-2.5 font-bold text-slate-700">Header 2</th>
              <th class="border border-slate-200 p-2.5 font-bold text-slate-700">Header 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-slate-200 p-2.5 text-slate-650 font-medium">Cell</td>
              <td class="border border-slate-200 p-2.5 text-slate-650 font-medium">Cell</td>
              <td class="border border-slate-200 p-2.5 text-slate-650 font-medium">Cell</td>
            </tr>
            <tr>
              <td class="border border-slate-200 p-2.5 text-slate-650 font-medium">Cell</td>
              <td class="border border-slate-200 p-2.5 text-slate-650 font-medium">Cell</td>
              <td class="border border-slate-200 p-2.5 text-slate-650 font-medium">Cell</td>
            </tr>
          </tbody>
        </table>
      </div>&nbsp;
    `;
    handleCommand("insertHTML", tableHTML);
  };

  // Helper to retrieve the closest table cell containing the selection
  const getSelectedCell = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;
    let cell = selection.getRangeAt(0).startContainer;
    while (cell && cell !== editorRef.current) {
      if (cell.nodeName === "TD" || cell.nodeName === "TH") {
        return cell;
      }
      cell = cell.parentNode;
    }
    return null;
  };

  // Dynamic row/column actions (Excel-like behavior)
  const handleAddRow = () => {
    const cell = getSelectedCell();
    if (!cell) return;
    const row = cell.parentNode;
    const tbody = row.parentNode;
    const colsCount = row.cells.length;
    
    const newRow = document.createElement("tr");
    for (let i = 0; i < colsCount; i++) {
      const newCell = document.createElement(cell.nodeName === "TH" ? "th" : "td");
      newCell.className = "border border-slate-200 p-2.5 text-slate-650 font-medium";
      newCell.innerHTML = "Cell";
      newRow.appendChild(newCell);
    }
    
    tbody.insertBefore(newRow, row.nextSibling);
    handleInput(true); // Save instantly
  };

  const handleAddColumn = () => {
    const cell = getSelectedCell();
    if (!cell) return;
    const colIndex = cell.cellIndex;
    const row = cell.parentNode;
    const tbody = row.parentNode;
    const table = tbody.parentNode;

    Array.from(table.rows).forEach((r) => {
      const isHeader = r.parentNode.nodeName === "THEAD";
      const newCell = document.createElement(isHeader ? "th" : "td");
      newCell.className = "border border-slate-200 p-2.5 text-slate-650 font-medium";
      newCell.innerHTML = isHeader ? "Header" : "Cell";
      r.insertBefore(newCell, r.cells[colIndex + 1] || null);
    });
    handleInput(true); // Save instantly
  };

  const handleDeleteRow = () => {
    const cell = getSelectedCell();
    if (!cell) return;
    const row = cell.parentNode;
    row.parentNode.removeChild(row);
    handleInput(true); // Save instantly
    setIsInTable(false);
  };

  const handleDeleteColumn = () => {
    const cell = getSelectedCell();
    if (!cell) return;
    const colIndex = cell.cellIndex;
    const row = cell.parentNode;
    const tbody = row.parentNode;
    const table = tbody.parentNode;

    Array.from(table.rows).forEach((r) => {
      if (r.cells[colIndex]) {
        r.removeChild(r.cells[colIndex]);
      }
    });
    handleInput(true); // Save instantly
    setIsInTable(false);
  };

  const handleDeleteTable = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    let node = selection.getRangeAt(0).startContainer;
    while (node && node !== editorRef.current) {
      if (node.nodeName === "TABLE") {
        const parentWrapper = node.closest(".table-wrapper");
        if (parentWrapper) {
          parentWrapper.parentNode.removeChild(parentWrapper);
        } else {
          node.parentNode.removeChild(node);
        }
        handleInput(true); // Save instantly
        setIsInTable(false);
        return;
      }
      node = node.parentNode;
    }
  };

  const activeBtnClass = "p-1 bg-blue-100/70 border border-blue-200 text-blue-600 rounded-lg transition-all w-8 h-8 flex items-center justify-center outline-none cursor-pointer shadow-sm";
  const inactiveBtnClass = "p-1 hover:bg-slate-200 border border-transparent text-slate-600 hover:text-slate-900 transition-all rounded-lg w-8 h-8 flex items-center justify-center outline-none cursor-pointer";

  // Check if undo/redo should be active
  const isUndoActive = historyIndex > 0;
  const isRedoActive = historyIndex < history.length - 1;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md focus-within:shadow-md focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all bg-white">
      {/* List styles fixing Tailwind overrides */}
      <style>{`
        .rich-text-content ul {
          list-style-type: disc !important;
          padding-left: 24px !important;
          margin-top: 8px !important;
          margin-bottom: 8px !important;
        }
        .rich-text-content ol {
          list-style-type: decimal !important;
          padding-left: 24px !important;
          margin-top: 8px !important;
          margin-bottom: 8px !important;
        }
        .rich-text-content font[size="1"] { font-size: 10px; }
        .rich-text-content font[size="2"] { font-size: 12px; }
        .rich-text-content font[size="3"] { font-size: 14px; }
        .rich-text-content font[size="4"] { font-size: 16px; }
        .rich-text-content font[size="5"] { font-size: 18px; }
        .rich-text-content font[size="6"] { font-size: 24px; }
        .rich-text-content font[size="7"] { font-size: 32px; }
        .rich-text-content .table-wrapper {
          overflow-x: auto !important;
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 12px !important;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
          background-color: #ffffff !important;
          max-width: 100% !important;
        }
        .rich-text-content .table-wrapper::-webkit-scrollbar {
          height: 6px !important;
        }
        .rich-text-content .table-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9 !important;
        }
        .rich-text-content .table-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1 !important;
          border-radius: 4px !important;
        }
        .rich-text-content .table-wrapper::-webkit-scrollbar-thumb:hover {
          background: #94a3b8 !important;
        }
      `}</style>

      {/* Editor Toolbar with active/inactive formatting commands */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border-b border-slate-200 select-none">
        
        {/* Curved Undo / Redo */}
        <button 
          type="button" 
          onClick={handleUndo}
          disabled={!isUndoActive}
          className={inactiveBtnClass}
          style={{ opacity: isUndoActive ? 1 : 0.4, cursor: isUndoActive ? 'pointer' : 'not-allowed' }}
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button 
          type="button" 
          onClick={handleRedo}
          disabled={!isRedoActive}
          className={inactiveBtnClass}
          style={{ opacity: isRedoActive ? 1 : 0.4, cursor: isRedoActive ? 'pointer' : 'not-allowed' }}
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        {/* Font Family Dropdown */}
        <div className="relative">
          <select 
            onChange={(e) => handleCommand("fontName", e.target.value)}
            value={activeStyles.fontName}
            className="text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-600 py-1 pl-2 pr-7 focus:ring-0 cursor-pointer outline-none shadow-sm hover:border-slate-300 transition-all"
          >
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Courier New">Courier New</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>

        {/* Font Size Dropdown */}
        <div className="relative">
          <select 
            onChange={(e) => handleCommand("fontSize", e.target.value)}
            value={activeStyles.fontSize}
            className="text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-600 py-1 pl-2 pr-7 focus:ring-0 cursor-pointer outline-none shadow-sm hover:border-slate-300 transition-all"
          >
            <option value="2">Small</option>
            <option value="3">Normal</option>
            <option value="4">Medium</option>
            <option value="5">Large</option>
            <option value="6">Extra Large</option>
          </select>
        </div>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        {/* Heading Dropdown */}
        <div className="relative">
          <select 
            onChange={(e) => handleCommand("formatBlock", e.target.value)}
            value={activeStyles.formatBlock.toLowerCase()}
            className="text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-600 py-1 pl-2 pr-7 focus:ring-0 cursor-pointer outline-none shadow-sm hover:border-slate-300 transition-all"
          >
            <option value="div">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </div>
        
        <div className="w-px h-5 bg-slate-200 mx-1"></div>
        
        {/* Style Toggles */}
        <button 
          type="button" 
          onClick={() => handleCommand("bold")}
          className={activeStyles.bold ? activeBtnClass : inactiveBtnClass}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button 
          type="button" 
          onClick={() => handleCommand("italic")}
          className={activeStyles.italic ? activeBtnClass : inactiveBtnClass}
          title="Italic"
        >
          <span className="italic font-serif">I</span>
        </button>
        <button 
          type="button" 
          onClick={() => handleCommand("underline")}
          className={activeStyles.underline ? activeBtnClass : inactiveBtnClass}
          title="Underline"
        >
          <span className="underline">U</span>
        </button>
        <button 
          type="button" 
          onClick={() => handleCommand("strikeThrough")}
          className={activeStyles.strikeThrough ? activeBtnClass : inactiveBtnClass}
          title="Strikethrough"
        >
          <span className="line-through">S</span>
        </button>
        
        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        {/* Text Alignment */}
        <button 
          type="button" 
          onClick={() => handleCommand("justifyLeft")}
          className={activeStyles.justifyLeft ? activeBtnClass : inactiveBtnClass}
          title="Align Left"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16" />
          </svg>
        </button>
        <button 
          type="button" 
          onClick={() => handleCommand("justifyCenter")}
          className={activeStyles.justifyCenter ? activeBtnClass : inactiveBtnClass}
          title="Align Center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10M4 18h16" />
          </svg>
        </button>
        <button 
          type="button" 
          onClick={() => handleCommand("justifyRight")}
          className={activeStyles.justifyRight ? activeBtnClass : inactiveBtnClass}
          title="Align Right"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M10 12h10M4 18h16" />
          </svg>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>
        
        {/* Lists */}
        <button 
          type="button" 
          onClick={() => handleCommand("insertUnorderedList")}
          className={activeStyles.insertUnorderedList ? activeBtnClass : inactiveBtnClass}
          title="Bulleted List"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16M4 6h.01M4 12h.01M4 18h.01" />
          </svg>
        </button>
        <button 
          type="button" 
          onClick={() => handleCommand("insertOrderedList")}
          className={activeStyles.insertOrderedList ? activeBtnClass : inactiveBtnClass}
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 6h14M7 12h14M7 18h14M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>
        
        {/* Insert Options (Link & Table) */}
        {showLinkInput ? (
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm animate-scale-in">
            <input 
              type="text" 
              placeholder="https://example.com" 
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="text-xs border-none bg-transparent py-1 px-2 focus:ring-0 outline-none w-44 font-medium"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSaveLink();
                } else if (e.key === "Escape") {
                  setShowLinkInput(false);
                  setLinkUrl("");
                }
              }}
            />
            <button 
              type="button" 
              onClick={handleSaveLink}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold shadow-sm cursor-pointer transition-all"
            >
              Apply
            </button>
            <button 
              type="button" 
              onClick={() => { setShowLinkInput(false); setLinkUrl(""); }}
              className="p-1 hover:bg-slate-200 text-slate-500 rounded cursor-pointer transition-all w-6 h-6 flex items-center justify-center"
              title="Cancel"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button 
            type="button" 
            onClick={() => setShowLinkInput(true)}
            className={inactiveBtnClass}
            title="Link"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
        )}

        {/* Standard insert table (3x3 default with NO prompt alerts) */}
        <button 
          type="button" 
          onClick={handleInsertDefaultTable}
          className={inactiveBtnClass}
          title="Insert 3x3 Table"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        {/* Clear Styling */}
        <button 
          type="button" 
          onClick={() => handleCommand("removeFormat")}
          className={inactiveBtnClass}
          title="Clear Format"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7L5 21m14 0L5 7" />
          </svg>
        </button>

        {/* Color picker */}
        <select 
          onChange={(e) => handleCommand("foreColor", e.target.value)}
          className="text-xs font-semibold border border-slate-200 rounded-lg bg-white text-slate-600 py-1 pl-2 pr-7 focus:ring-0 cursor-pointer outline-none shadow-sm hover:border-slate-300 transition-all ml-1"
          defaultValue="#334155"
        >
          <option value="#334155">Default Dark</option>
          <option value="#2563eb">Blue Accent</option>
          <option value="#16a34a">Green Accent</option>
          <option value="#dc2626">Red Warning</option>
        </select>
      </div>

      {/* Dynamic Excel-style Table Operations Sub-Toolbar (Displays only when cursor is in a table) */}
      {isInTable && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-blue-50/50 border-b border-slate-200 select-none animate-fade-in">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider px-2">Table Tools:</span>
          
          <button 
            type="button" 
            onClick={handleAddRow}
            className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1 cursor-pointer transition-all"
            title="Add Row Below"
          >
            <span>+ Row</span>
          </button>
          
          <button 
            type="button" 
            onClick={handleAddColumn}
            className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1 cursor-pointer transition-all"
            title="Add Column Right"
          >
            <span>+ Col</span>
          </button>

          <div className="w-px h-4 bg-slate-200 mx-1"></div>

          <button 
            type="button" 
            onClick={handleDeleteRow}
            className="px-2 py-1 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded text-[10px] font-bold text-red-600 shadow-sm flex items-center gap-1 cursor-pointer transition-all"
            title="Delete Current Row"
          >
            <span>- Row</span>
          </button>

          <button 
            type="button" 
            onClick={handleDeleteColumn}
            className="px-2 py-1 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded text-[10px] font-bold text-red-600 shadow-sm flex items-center gap-1 cursor-pointer transition-all"
            title="Delete Current Column"
          >
            <span>- Col</span>
          </button>

          <button 
            type="button" 
            onClick={handleDeleteTable}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold shadow-sm flex items-center gap-1 cursor-pointer transition-all"
            title="Delete Entire Table"
          >
            <span>Delete Table</span>
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div className="relative min-h-[220px] p-5 text-sm text-slate-700 outline-none">
        <div 
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyUp={updateActiveStates}
          onMouseUp={updateActiveStates}
          onKeyDown={handleKeyDown}
          className="rich-text-content w-full h-full outline-none focus:outline-none min-h-[200px] text-slate-700 font-medium leading-relaxed prose prose-slate max-w-none"
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        />
        {!value && (
          <span className="absolute top-5 left-5 text-slate-400 pointer-events-none select-none font-medium text-sm">
            {placeholder}
          </span>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
