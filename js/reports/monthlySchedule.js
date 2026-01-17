
// js/reports/monthlySchedule.js  (UPDATED: detects phiInfo changes without modifying phiInfo.js)
// - Adds month-aware day locking and Sunday behavior per user request.
// - UPDATED: Auto-fill schedule from fixed dates table with correct week calculation
// - UPDATED: Holiday type selection for non-Sunday days
// - UPDATED: Print/PDF user input in bold blue pen-like color

(function () {
  "use strict";

  // helpers
  function q(sel, ctx = document) { return ctx.querySelector(sel); }
  function el(tag, attrs = {}, children = []) {
    const e = document.createElement(tag);
    for (const k in attrs) {
      if (k === "html") e.innerHTML = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(c => e.appendChild(c));
    return e;
  }
  function escapeHtml(s) { if (s === null || s === undefined) return ""; return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
  function ptToPx(pt) { return Math.round(pt * (96 / 72)); }

  // KeyMap localStorage keys (updated to match new structure)
  const ROLES_KEY = "phi_roles_tree_final";
  const PLACES_KEY = "phi_places_tree_final";
  const FIXED_DATES_KEY = "phi_fixed_dates_v1";
  const HOLIDAY_KEY = "phi_holidays_final";

  function loadKeyRoles() {
    try { return JSON.parse(localStorage.getItem(ROLES_KEY) || "[]"); } catch (e) { return []; }
  }
  function loadKeyPlaces() {
    try { return JSON.parse(localStorage.getItem(PLACES_KEY) || "[]"); } catch (e) { return []; }
  }
  function loadFixedDates() {
    try { return JSON.parse(localStorage.getItem(FIXED_DATES_KEY) || "[]"); } catch (e) { return []; }
  }
  function loadHolidays() {
    try { return JSON.parse(localStorage.getItem(HOLIDAY_KEY) || "[]"); } catch (e) { return []; }
  }
  function getRoleNameById(id) {
    if (!id) return "";
    const arr = loadKeyRoles();
    // Check if it's a sub-item (format: mainId:subName)
    if (id.includes(':')) {
      const [mainId, subName] = id.split(':');
      const main = arr.find(x => String(x.id) === String(mainId));
      if (main && main.sub && Array.isArray(main.sub)) {
        const subItem = main.sub.find(s => {
          const sName = typeof s === 'object' ? s.name : s;
          return sName === subName;
        });
        if (subItem) {
          if (typeof subItem === 'object' && subItem.code) {
            return `${subItem.name} (${subItem.code})`;
          }
          return typeof subItem === 'object' ? subItem.name : subItem;
        }
      }
      return subName; // fallback
    }
    // Main item
    const r = arr.find(x => String(x.id) === String(id));
    return r ? (r.main || "") : "";
  }
  function getPlaceNameById(id) {
    if (!id) return "";
    const arr = loadKeyPlaces();
    // Check if it's a sub-item (format: mainId:subName)
    if (id.includes(':')) {
      const [mainId, subName] = id.split(':');
      const main = arr.find(x => String(x.id) === String(mainId));
      if (main && main.sub && Array.isArray(main.sub)) {
        const subItem = main.sub.find(s => {
          const sName = typeof s === 'object' ? s.name : s;
          return sName === subName;
        });
        if (subItem) {
          if (typeof subItem === 'object' && subItem.code) {
            return `${subItem.name} (${subItem.code})`;
          }
          return typeof subItem === 'object' ? subItem.name : subItem;
        }
      }
      return subName; // fallback
    }
    // Main item
    const r = arr.find(x => String(x.id) === String(id));
    return r ? (r.main || "") : "";
  }
  function getHolidayNameById(id) {
    if (!id) return "";
    const arr = loadHolidays();
    const r = arr.find(x => String(x.id) === String(id));
    return r ? (r.name || "") : "";
  }

  // storage helpers
  function storageKeyForMonth(monthStr) {
    if (!monthStr) monthStr = "unspecified";
    return `monthlySchedule_exact_template_${monthStr}`;
  }

  window.monthlySchedule = window.monthlySchedule || {};

  // global style injection (ensures black text in prints)
  // Add this to the ensureGlobalBlackStyle() function or existing CSS
  const GLOBAL_STYLE_ID = "monthlySchedule_force_black_text_style_v4";
  function ensureGlobalBlackStyle() {
    if (document.getElementById(GLOBAL_STYLE_ID)) return;
    const st = document.createElement("style");
    st.id = GLOBAL_STYLE_ID;
    st.innerHTML = `
    .monthlySchedule-template, .monthlySchedule-template * { color:#000 !important; }
    .monthlySchedule-template ::placeholder { color:#000 !important; opacity:1; }
    .monthlySchedule-template { font-size:11px !important; line-height:1.05 !important; margin:0; padding:8px; background:#fff; box-sizing:border-box; }
    .monthlySchedule-template table th, .monthlySchedule-template table td { padding:4px !important; font-size:10px !important; }
    .monthlySchedule-template textarea { font-size:10px !important; padding:4px !important; min-height:20px !important; }
    .monthlySchedule-template .header-large { font-size:16px !important; }
    .monthlySchedule-template .header-xlarge { font-size:24px !important; }
    .monthlySchedule-template .footer-notes { width:80%;margin-left:100px;box-sizing:border-box; resize:none; font-size:10px; padding:6px; border:1px solid #000; min-height:64px; background:#fff; }
    .ms-locked { color:#444; background:#f5f5f5; padding:6px; border-radius:4px; min-height:28px; display:inline-block; width:100%; box-sizing:border-box; }
    .ms-sunday { color:#b71c1c; font-weight:700; }
    .ms-holiday { color:#b71c1c !important; font-weight:700; background:#ffebee !important; }
    
    /* Fixed column widths for schedule table */
    .monthlySchedule-template table { table-layout: fixed !important; }
    .monthlySchedule-template table col:nth-child(1) { width: 64px !important; } /* Date column */
    .monthlySchedule-template table col:nth-child(2) { width: calc(50% - 32px) !important; } /* Morning column */
    .monthlySchedule-template table col:nth-child(3) { width: calc(50% - 32px) !important; } /* Afternoon column */
    
    /* Scrollable select elements */
    .monthlySchedule-template select {
      max-height: 80px !important;
      overflow-y: auto !important;
      min-width: 0 !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
    
    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
      .monthly-schedule-controls {
        display: grid !important;
        grid-template-columns: 1fr 1fr auto !important;
        grid-template-rows: auto auto !important;
        gap: 6px !important;
        margin-bottom: 8px !important;
        align-items: start !important;
      }
      
      .monthly-schedule-controls button:nth-child(1) {
        grid-column: 1 !important;
        grid-row: 1 !important;
        padding: 10px 8px !important;
        font-size: 12px !important;
      }
      
      .monthly-schedule-controls button:nth-child(2) {
        grid-column: 2 !important;
        grid-row: 1 !important;
        padding: 10px 8px !important;
        font-size: 12px !important;
      }
      
      .language-switch-container {
        grid-column: 3 !important;
        grid-row: 1 !important;
        padding: 2px !important;
        background: #f0f0f0 !important;
        border-radius: 6px !important;
      }
      
      .language-switch-container button {
        padding: 6px 10px !important;
        font-size: 11px !important;
      }
      
      .keymap-btn {
        grid-column: 3 !important;
        grid-row: 2 !important;
        padding: 6px 10px !important;
        font-size: 11px !important;
        white-space: nowrap !important;
      }
      
      .monthly-schedule-meta {
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
      }
      
      .month-input-wrapper,
      .designation-input-wrapper {
        display: flex !important;
        gap: 8px !important;
        align-items: center !important;
        width: 100% !important;
      }
      
      .month-label,
      .designation-label {
        flex-shrink: 0 !important;
      }
      
      .month-input-wrapper input[type="month"],
      .designation-input-wrapper select {
        flex: 1 !important;
        font-size: 13px !important;
        padding: 8px !important;
      }
      
      .monthlySchedule-template {
        padding: 4px !important;
        font-size: 10px !important;
        border-radius: 4px !important;
        overflow-x: auto !important;
        overflow-y: visible !important;
      }
      
      .monthlySchedule-template table {
        overflow: visible !important;
      }
      
      .monthlySchedule-template tbody,
      .monthlySchedule-template tr,
      .monthlySchedule-template td {
        overflow: visible !important;
      }
      
      .monthlySchedule-template header {
        margin-left: 0 !important;
        font-size: 7px !important;
      }
      
      .monthlySchedule-template .header-large {
        font-size: 12px !important;
      }
      
      .monthlySchedule-template .header-xlarge {
        font-size: 18px !important;
      }
      
      .monthlySchedule-template table {
        font-size: 9px !important;
        min-width: 100% !important;
      }
      
      .monthlySchedule-template table th,
      .monthlySchedule-template table td {
        padding: 2px !important;
        font-size: 9px !important;
      }
      
      .monthlySchedule-template table col:nth-child(1) {
        width: 40px !important;
      }
      
      .monthlySchedule-template table col:nth-child(2),
      .monthlySchedule-template table col:nth-child(3) {
        width: calc(50% - 20px) !important;
      }
      
      .monthlySchedule-template textarea,
      .monthlySchedule-template .footer-notes {
        font-size: 9px !important;
        padding: 4px !important;
        width: 100% !important;
        margin-left: 0 !important;
      }
      
      /* Dropdown buttons on mobile */
      .monthlySchedule-template button[class*="tpl-"] {
        font-size: 9px !important;
        padding: 2px 4px !important;
        min-height: 24px !important;
      }
      
      /* Dropdown menus on mobile */
      div[id$="-menu"] {
        font-size: 11px !important;
        max-height: 250px !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
        border: 2px solid #0b5ea8 !important;
      }
      
      .dropdown-main-item,
      .dropdown-sub-item {
        padding: 8px 10px !important;
        font-size: 11px !important;
      }
      
      .sub-items-container {
        max-height: 200px !important;
        overflow-y: auto !important;
        -webkit-overflow-scrolling: touch !important;
      }
    }
    
    @media (max-width: 480px) {
      .monthly-schedule-controls button:nth-child(1),
      .monthly-schedule-controls button:nth-child(2) {
        padding: 8px 6px !important;
        font-size: 11px !important;
      }
      
      .language-switch-container button {
        padding: 5px 8px !important;
        font-size: 10px !important;
      }
      
      .keymap-btn {
        padding: 5px 8px !important;
        font-size: 10px !important;
      }
      
      .month-label strong,
      .designation-label strong {
        font-size: 11px !important;
        padding: 3px 6px !important;
      }
      
      .monthlySchedule-template {
        font-size: 8px !important;
      }
      
      .monthlySchedule-template table th,
      .monthlySchedule-template table td {
        font-size: 8px !important;
        padding: 1px !important;
      }
      
      .monthlySchedule-template table col:nth-child(1) {
        width: 35px !important;
      }
      
      .monthlySchedule-template button[class*="tpl-"] {
        font-size: 8px !important;
        padding: 2px !important;
        min-height: 20px !important;
      }
      
      .monthlySchedule-template .header-large {
        font-size: 10px !important;
      }
      
      .monthlySchedule-template .header-xlarge {
        font-size: 14px !important;
      }
    }
    
    @page { margin:12pt; }
    @media print {
      /* === TABLE HEADER (දිනය, පෙරවරු, පස්වරු) === */
      .monthlySchedule-template table th {
        font-size: 12px !important;
        font-weight: 600 !important;
      }
      
      /* === NORMAL USER INPUT (Role - Place) === */
      .monthlySchedule-template .print-cell-content,
      .monthlySchedule-template .user-input {
        font-size: 12px !important;
        line-height: 1.3 !important;
        font-weight: 700 !important; /* NEW: Bold for user input */
        color: #0b5cff !important; /* Pen-like blue color */
      }
      
      /* === SELECT → PRINT TEXT === */
      .monthlySchedule-template select,
      .monthlySchedule-template td div {
        font-size: 15px !important;
      }
      
      /* === SUNDAY (ඉරිදා දිනයකි) === */
      .monthlySchedule-template .ms-locked {
        font-size: 15px !important;
        font-weight: 600 !important;
      }
      
      /* === HOLIDAY (Select Holiday) === */
      .monthlySchedule-template .ms-holiday {
        font-size: 15px !important;
        font-weight: 700 !important;
      }
      
      /* === TABLE ROWS GENERAL === */
      .monthlySchedule-template table td {
        font-size: 15px !important;
      }
    }
  `;
    document.head.appendChild(st);
  }

  // --- Sinhala month mapping ---
  function getSinhalaMonthName(monthStr) {
    if (!monthStr) return "";
    const m = (monthStr.split("-")[1] || "").padStart(2, "0");
    const map = {
      "01": "ජනවාරි",
      "02": "පෙබරවාරි",
      "03": "මාර්තු",
      "04": "අප්‍රේල්",
      "05": "මැයි",
      "06": "ජූනි",
      "07": "ජුලි",
      "08": "අගෝස්තු",
      "09": "සැප්තැම්බර්",
      "10": "ඔක්තෝබර්",
      "11": "නොවැම්බර්",
      "12": "දෙසැම්බර්"
    };
    return map[m] || "";
  }
  
  // --- English month mapping ---
  function getEnglishMonthName(monthStr) {
    if (!monthStr) return "";
    const m = (monthStr.split("-")[1] || "").padStart(2, "0");
    const map = {
      "01": "January",
      "02": "February",
      "03": "March",
      "04": "April",
      "05": "May",
      "06": "June",
      "07": "July",
      "08": "August",
      "09": "September",
      "10": "October",
      "11": "November",
      "12": "December"
    };
    return map[m] || "";
  }

  // read PHI info from localStorage (phiInfo.js provides these keys)
  function readPhiShortKeys() {
    try {
      return {
        inspector: localStorage.getItem("phi_info_inspector") || "",
        area: localStorage.getItem("phi_info_area") || ""
      };
    } catch (e) { return { inspector: "", area: "" }; }
  }

  // We'll keep last-known values and poll + listen for updates
  let __lastPhiState = readPhiShortKeys();
  let __phiPollTimer = null;

  function startPhiPoller(onChange) {
    stopPhiPoller();
    __phiPollTimer = setInterval(() => {
      const cur = readPhiShortKeys();
      if (cur.inspector !== __lastPhiState.inspector || cur.area !== __lastPhiState.area) {
        __lastPhiState = cur;
        try { onChange(cur); } catch (e) { console.error(e); }
      }
    }, 800);
    // also run immediate
    const cur0 = readPhiShortKeys();
    __lastPhiState = cur0;
    try { onChange(cur0); } catch (e) { /* ignore */ }
  }
  function stopPhiPoller() {
    if (__phiPollTimer) { clearInterval(__phiPollTimer); __phiPollTimer = null; }
  }

  // utility: days in month
  function daysInMonth(year, month) { // month: 1-12
    return new Date(year, month, 0).getDate();
  }

  // format display text for a stored {role,place} or string
  function formatEntryForPrint(val) {
    if (!val) return "";
    if (typeof val === 'object') {
      const roleName = getRoleNameById(val.role) || "";
      const placeName = getPlaceNameById(val.place) || "";
      if (roleName && placeName) return `${roleName} - ${placeName}`;
      if (roleName) return roleName;
      if (placeName) return placeName;
      return "";
    }
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        if (parsed && typeof parsed === 'object') {
          const rn = getRoleNameById(parsed.role) || parsed.role || "";
          const pn = getPlaceNameById(parsed.place) || parsed.place || "";
          if (rn && pn) return `${rn} - ${pn}`;
          if (rn) return rn;
          if (pn) return pn;
          return "";
        }
      } catch (e) { }
      return val;
    }
    return "";
  }

  // NEW: Get fixed dates for a specific day and week - FIXED WEEK CALCULATION
  function getFixedDatesForDay(dayOfWeek, weekNumber, timePeriod) {
    const fixedDates = loadFixedDates();
    return fixedDates.filter(fd =>
      fd.day === dayOfWeek &&
      fd.week === weekNumber.toString() &&
      (!timePeriod || fd.time === timePeriod)
    );
  }


  // CORRECTED: Get week number of month for a specific date - FIXED VERSION
  function getWeekNumberInMonth(date) {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();

    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Get the day of week for current date
    const currentDayOfWeek = date.getDay();

    // Calculate the date of the first occurrence of this weekday in the month
    let firstOccurrenceOfThisWeekday = 1 + ((currentDayOfWeek - firstDayOfWeek + 7) % 7);

    // If the current date is before the first occurrence, it means we're looking at 
    // a day that first appears in the next week (shouldn't happen with proper dates)
    if (dayOfMonth < firstOccurrenceOfThisWeekday) {
      return 1;
    }

    // Calculate which occurrence this is
    let weekNumber = Math.floor((dayOfMonth - firstOccurrenceOfThisWeekday) / 7) + 1;

    return weekNumber;
  }

  // NEW: Auto-fill schedule from fixed dates with CORRECT week calculation and UI update
  function autoFillScheduleFromFixedDates(monthValue) {
    if (!monthValue) return;

    const parts = monthValue.split("-");
    if (parts.length < 2) return;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);

    const tbody = document.querySelector(".monthlySchedule-template tbody");
    if (!tbody) return;

    const scheduleRows = tbody.querySelectorAll("tr");

    // Helper to update the custom button component
    const updateButton = (btn, value, type) => {
      if (!btn) return;
      btn.dataset.value = value || "";
      const textSpan = btn.querySelector("span");
      if (textSpan) {
        if (value) {
          textSpan.textContent = type === 'role' ? getRoleNameById(value) : getPlaceNameById(value);
        } else {
          textSpan.textContent = "-- තෝරන්න --";
        }
      }
      // Dispatch change to trigger style updates (blue background etc)
      btn.dispatchEvent(new Event('change'));
    };

    // Clear existing values first (but preserve holidays)
    scheduleRows.forEach(tr => {
      // Only clear if not a holiday
      if (!tr.classList.contains("ms-holiday-row")) {
        updateButton(tr.querySelector(".tpl-morning-role"), "", "role");
        updateButton(tr.querySelector(".tpl-morning-place"), "", "place");
        updateButton(tr.querySelector(".tpl-afternoon-role"), "", "role");
        updateButton(tr.querySelector(".tpl-afternoon-place"), "", "place");
      }
    });

    // Process each day in the month
    const daysInMonthCount = daysInMonth(year, month);

    for (let day = 1; day <= daysInMonthCount; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
      const weekNumber = getWeekNumberInMonth(date);

      const tr = scheduleRows[day - 1];
      if (!tr) continue;

      // Skip if this is a holiday row
      if (tr.classList.contains("ms-holiday-row")) continue;

      // Get fixed dates for this specific day and week
      const fixedDates = getFixedDatesForDay(dayOfWeek, weekNumber);

      fixedDates.forEach(fd => {
        if (fd.time === 'morning') {
          // පෙරවරු
          if (fd.roleId) updateButton(tr.querySelector(".tpl-morning-role"), fd.roleId, "role");
          if (fd.placeId) updateButton(tr.querySelector(".tpl-morning-place"), fd.placeId, "place");
        } else if (fd.time === 'afternoon') {
          // පස්වරු
          if (fd.roleId) updateButton(tr.querySelector(".tpl-afternoon-role"), fd.roleId, "role");
          if (fd.placeId) updateButton(tr.querySelector(".tpl-afternoon-place"), fd.placeId, "place");
        } else if (fd.time === 'full_day') {
          // දවසම
          if (fd.roleId) {
            updateButton(tr.querySelector(".tpl-morning-role"), fd.roleId, "role");
            updateButton(tr.querySelector(".tpl-afternoon-role"), fd.roleId, "role");
          }
          if (fd.placeId) {
            updateButton(tr.querySelector(".tpl-morning-place"), fd.placeId, "place");
            updateButton(tr.querySelector(".tpl-afternoon-place"), fd.placeId, "place");
          }
        }
      });
    }
  }

  window.openMonthlyScheduleReport = function (title = "මාසික ඉදිරි කාලසටහන (Exact)") {
    ensureGlobalBlackStyle();

    const content = document.getElementById("contentArea");
    if (!content) return showError("contentArea not found");
    content.innerHTML = "";

    // controls - REMOVED the back button
    const ctrl = el("div", {
      class: "monthly-schedule-controls",
      style: "display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap"
    });

    // REMOVED: const backBtn = el("button",{type:"button",style:"padding:8px 12px;border-radius:8px;cursor:pointer;background:#e0e0e0;border:1px solid #bdbdbd"}); backBtn.textContent = "Reports වෙත";

    const pdfBtn = el("button", { type: "button", style: "padding:8px 12px;border-radius:8px;border:1px solid #bdbdbd;cursor:pointer;background:#f3e5f5" }); pdfBtn.textContent = "Download";

    const saveBtn = el("button", { type: "button", style: "padding:8px 12px;border-radius:8px;border:1px solid #2b7;color:#fff;background:#2b7" }); saveBtn.textContent = "Save";

    // meta inputs
    const meta = el("div", {
      class: "monthly-schedule-meta",
      style: "display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap"
    });
    
    // Language switch
    let currentLanguage = "si"; // default to Sinhala
    const languageSwitch = el("div", {
      class: "language-switch-container",
      style: "display:flex;align-items:center;gap:8px;background:#f0f0f0;padding:4px;border-radius:6px;"
    });
    const siBtn = el("button", {
      html: "සිං",
      style: "padding:6px 12px;border:none;border-radius:4px;cursor:pointer;background:#0b5ea8;color:#fff;font-weight:bold"
    });
    const enBtn = el("button", {
      html: "En",
      style: "padding:6px 12px;border:none;border-radius:4px;cursor:pointer;background:#ddd;color:#333"
    });
    languageSwitch.append(siBtn, enBtn);
    
    // Key Map button (will be in controls on mobile)
    const keyMapBtn = el("button", {
      type: "button",
      class: "keymap-btn",
      style: "padding:8px 12px;border-radius:6px;border:1px solid #0b5ea8;background:#e3f2fd;color:#0b5ea8;cursor:pointer;font-weight:600;"
    });
    keyMapBtn.innerHTML = "<i class='fas fa' style='margin-right:6px;'></i>Key Map";
    keyMapBtn.onclick = () => {
      if (window.showContent) {
        // Navigate to PHI Area (PHI Profile)
        window.showContent('phiArea', null);
        
        // Use requestAnimationFrame to ensure DOM is updated, then poll for tab
        requestAnimationFrame(() => {
          let attempts = 0;
          const maxAttempts = 30; // 3 seconds max
          const checkInterval = setInterval(() => {
            attempts++;
            const keyMapTab = document.getElementById('tab_phi_keymap');
            
            if (keyMapTab) {
              clearInterval(checkInterval);
              keyMapTab.click();
            } else if (attempts >= maxAttempts) {
              clearInterval(checkInterval);
            }
          }, 100);
        });
      }
    };
    
    // Append buttons, language switch, and key map to controls
    ctrl.append(pdfBtn, saveBtn, languageSwitch, keyMapBtn);
    
    const monthInput = el("input", { type: "month", style: "padding:8px;border-radius:6px;border:1px solid #ddd;color:#000" });
    
    // Month names mapping
    const sinhalaMonths = ["ජනවාරි", "පෙබරවාරි", "මාර්තු", "අප්‍රේල්", "මැයි", "ජූනි", "ජූලි", "අගෝස්තු", "සැප්තැම්බර්", "ඔක්තෝබර්", "නොවැම්බර්", "දෙසැම්බර්"];
    const englishMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // Designation mapping
    const designationMapping = {
      "si": {
        "මහජන සෞඛ්‍ය පරීක්ෂක": "මහජන සෞඛ්‍ය පරීක්ෂක",
        "පවුල් සෞඛ්‍ය සේවා නිලධාරිනි": "පවුල් සෞඛ්‍ය සේවා නිලධාරිනි",
        "සෞඛ්‍ය වෛද්‍ය නිලධාරී": "සෞඛ්‍ය වෛද්‍ය නිලධාරී",
        "වෛද්‍ය නිලධාරී": "වෛද්‍ය නිලධාරී",
        "Public Health Inspector": "මහජන සෞඛ්‍ය පරීක්ෂක",
        "Public Health Midwife": "පවුල් සෞඛ්‍ය සේවා නිලධාරිනි",
        "Medical Officer of Health": "සෞඛ්‍ය වෛද්‍ය නිලධාරී",
        "Medical Officer": "වෛද්‍ය නිලධාරී"
      },
      "en": {
        "මහජන සෞඛ්‍ය පරීක්ෂක": "Public Health Inspector",
        "පවුල් සෞඛ්‍ය සේවා නිලධාරිනි": "Public Health Midwife",
        "සෞඛ්‍ය වෛද්‍ය නිලධාරී": "Medical Officer of Health",
        "වෛද්‍ය නිලධාරී": "Medical Officer",
        "Public Health Inspector": "Public Health Inspector",
        "Public Health Midwife": "Public Health Midwife",
        "Medical Officer of Health": "Medical Officer of Health",
        "Medical Officer": "Medical Officer"
      }
    };
    
    // Designation selector
    const designationSelect = el("select", { style: "padding:8px;border-radius:6px;border:1px solid #ddd;color:#000;min-width:250px" });
    
    // Function to update designation options based on language
    function updateDesignationOptions() {
      if (currentLanguage === "si") {
        designationSelect.innerHTML = `
          <option value="මහජන සෞඛ්‍ය පරීක්ෂක">මහජන සෞඛ්‍ය පරීක්ෂක</option>
          <option value="පවුල් සෞඛ්‍ය සේවා නිලධාරිනි">පවුල් සෞඛ්‍ය සේවා නිලධාරිනි</option>
          <option value="සෞඛ්‍ය වෛද්‍ය නිලධාරී">සෞඛ්‍ය වෛද්‍ය නිලධාරී</option>
          <option value="වෛද්‍ය නිලධාරී">වෛද්‍ය නිලධාරී</option>
        `;
      } else {
        designationSelect.innerHTML = `
          <option value="Public Health Inspector">Public Health Inspector</option>
          <option value="Public Health Midwife">Public Health Midwife</option>
          <option value="Medical Officer of Health">Medical Officer of Health</option>
          <option value="Medical Officer">Medical Officer</option>
        `;
      }
    }
    
    // Initialize with Sinhala options
    updateDesignationOptions();
    
    // Month label and input wrapper
    const monthLabel = el("div", { 
      class: "month-label",
      html: "<strong style='color:#fff;background:#0b5ea8;padding:4px 8px;border-radius:4px;'>Month</strong>" 
    });
    const monthWrapper = el("div", {
      class: "month-input-wrapper",
      style: "display:flex;gap:8px;align-items:center;"
    });
    monthWrapper.append(monthLabel, monthInput);
    
    // Designation label and input wrapper
    const designationLabel = el("div", { 
      class: "designation-label",
      html: "<strong style='color:#fff;background:#0b5ea8;padding:4px 8px;border-radius:4px;'>තනතුර</strong>" 
    });
    const designationWrapper = el("div", {
      class: "designation-input-wrapper",
      style: "display:flex;gap:8px;align-items:center;"
    });
    designationWrapper.append(designationLabel, designationSelect);
    
    meta.append(
      monthWrapper,
      designationWrapper
    );
    // size mapping: legal content area (for visual sizing)
    const LEGAL_PT = { w: 612, h: 1008 };
    const MARGIN_PT = 12;
    const contentWpt = LEGAL_PT.w - MARGIN_PT * 2;
    const contentHpt = LEGAL_PT.h - MARGIN_PT * 2;
    const contentWpx = ptToPx(contentWpt);
    const contentHpx = ptToPx(contentHpt);

    // wrapper template
    const templateWrap = el("div", {
      class: "monthlySchedule-template monthly-schedule-template-wrapper",
      style: "background:#fff;border-radius:6px;border:1px solid #ddd;box-shadow:0 4px 10px rgba(0,0,0,0.04);color:#000;overflow:visible;width:100%;box-sizing:border-box;"
    });
    // No scaling - use full width
    templateWrap.style.padding = "8px";

    // header HTML with inspector display placeholder (tpl_inspector_display) and tpl_month_display
    const headerHtmlFull = `
      <header style="margin-left:270px;fjustify-content:space-between;align-items:flex-start;font-size:08px;margin-bottom:4px;color:#000">
        <div style="color:#000;display:flex">H 058470-500,000 (2023/04)P ශ්‍රී ලංකා රජයේ මුද්‍රණ දෙපාර්තමේන්තුව</div>
        <div style="text-align:right;color:#000">
          <div style="font-weight:700;font-size:12px;color:#000">සෞඛ්‍ය 510</div>
          <div style="font-size:10px;color:#000">health 510 (F2 S. & T.) 7/61</div>
        </div>
      </header>

      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;color:#000">
        <div>
          <div class="header-large" style="font-size:16px;font-weight:700;letter-spacing:0.5px;color:#000">ඉදිරි කාලසටහන</div>
          <div style="font-size:10px;color:#000">முன்காரியக்கிரமப்படலம்</div>
        </div>
        <div style="font-size:24px;line-height:0.8;color:#000;">}</div>
        <!-- Inspector / PHI / Area display (replaces previous placeholder) -->
        <div id="tpl_inspector_display" style="margin-left:10px;font-size:15px;font-weight:600;color:#104aa3;min-width:260px;">
          <!-- will be filled dynamically: "InspectorName -මහජන සෞඛ්‍ය පරීක්ෂක AREA" -->
        </div>
      </div>
      <hr style="border:none;border-top:1px solid #8b8b8b;margin:6px 0" />

      <div style="display:flex;justify-content:center;align-items:flex-end;gap:12px;margin-bottom:6px;color:#000">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="text-align:center">
            <div style="font-size:11px">මාසය</div>
            <div style="font-size:10px">மாதம்</div>
          </div>
          <div style="font-size:24px;line-height:0.8;color:#000;">}</div>
        </div>
        <div style="min-width:260px;text-align:center">
          <div id="tpl_month_display" style="border-bottom:1px solid #374151;padding:6px 8px;display:inline-block;min-width:180px;color:#104aa3;font-size:15px;font-weight:600"></div>
        </div>
        <div style="font-weight:700; margin-left:8px;color:#000;font-size:12px">20</div>
        <div style="width:36px;border-bottom:1px solid #374151;text-align:center;padding:2px;color:#104aa3;font-size:15px;font-weight:600" id="tpl_year_display"></div>
      </div>

      <div style="display:flex;align-items:flex-start;font-size:11px;margin-bottom:6px;color:#000">
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div style="font-weight:700;color:#000;font-size:11px">සේවා කාලය</br>வேலை நேரம்</div>
          <div style="font-size:24px;line-height:0.8;color:#000;">}</div>
          <div>
            <div style="line-height:1.2;color:#000;font-size:10px">
              <div>පෙ.ව 8 - දවල් 12 ට</br>மு.ப. 8 – மத்தியானம் 12</br>ප.ව. 2 - ප.ව. 5 දක්වා</br>பி.ப. 2 – பி.ப. 5 வரை</div>
            </div>
          </div>
        </div>

        <div class="text-base text-center" style="font-size:11px;margin-left:50px">
          <div>සෙනසුරාදා පෙ.ව. 8 - ප.ව .1 ට</div>
          <div style="color:#444;font-size:10px">சனிக்கிழமை மு.ப. 8 – மி.ப. 1</div>
        </div>
      </div>
    `;
    templateWrap.innerHTML = headerHtmlFull;

    // table with selects for morning/afternoon (we'll use createSelectCell to build cells so we can reconstruct later)
    // In the openMonthlyScheduleReport function, update the table creation:
    const table = el("table", {
      style: "width:100%;border-collapse:collapse;font-family: 'Noto Sans Sinhala', 'Noto Sans', Arial, sans-serif;color:#000;table-layout:fixed"
    });

    // Use fixed column widths
    table.innerHTML = `
  <colgroup>
    <col style="width:64px">
    <col style="width:calc(50% - 32px)">
    <col style="width:calc(50% - 32px)">
  </colgroup>
  <thead>
    <tr>
      <th style="padding:4px;border:1px solid #999;text-align:center;color:#000;font-size:15px;font-weight:600">දිනය</th>
      <th style="padding:4px;border:1px solid #999;color:#000;font-size:15px;font-weight:600">පෙරවරු</th>
      <th style="padding:4px;border:1px solid #999;color:#000;font-size:15px;font-weight:600">පස්වරු</th>
    </tr>
  </thead>`;
    const tbody = el("tbody");

    // Helper function to create cascading menu button (Improved Accordion Style)
    function createCascadingMenuButton(namePrefix, type, preservedValue, disabled) {
      // Generate unique ID to prevent duplicates in the loop
      const uniqueSuffix = Math.random().toString(36).substr(2, 9);
      const btnId = `${namePrefix}-${type}-btn-${uniqueSuffix}`;
      const menuId = `${namePrefix}-${type}-menu-${uniqueSuffix}`;

      const items = type === 'role' ? loadKeyRoles() : loadKeyPlaces();
      const placeholderText = currentLanguage === 'en' ? '-- Select --' : '-- තෝරන්න --';
      const displayText = preservedValue ?
        (type === 'role' ? getRoleNameById(preservedValue) : getPlaceNameById(preservedValue)) :
        placeholderText;

      const wrapper = el("div", {
        style: "position:relative;flex:1;min-width:0;width:100%"
      });

      const btn = el("button", {
        id: btnId,
        type: "button",
        class: `${namePrefix}-${type}`,
        style: `width:100%;padding:4px 8px;border:1px solid #d0d6db;border-radius:4px;
          background:${preservedValue ? '#e3f2fd' : '#fff'};
          color:${preservedValue ? '#000' : '#000'};
          text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;
          font-size:11px;min-height:28px;
          ${disabled ? 'opacity:0.6;cursor:not-allowed;background:#f5f5f5;' : ''}`
      });
      btn.disabled = disabled;
      btn.dataset.value = preservedValue || "";

      const textSpan = el("span", {
        style: "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"
      });
      const placeholderFallback = currentLanguage === 'en' ? '-- Select --' : '-- තෝරන්න --';
      textSpan.textContent = displayText || placeholderFallback;

      const arrow = el("span", { style: "margin-left:4px;color:#666;font-size:10px;transition:transform 0.2s;" });
      arrow.textContent = "▼";

      btn.appendChild(textSpan);
      btn.appendChild(arrow);

      // Apply the correct background color based on whether there's a preserved value
      if (preservedValue && !disabled) {
        btn.style.backgroundColor = 'rgb(104, 216, 216)';
        btn.style.borderColor = '#000000ff';
      }

      // Create dropdown
      const menu = el("div", {
        id: menuId,
        class: "ms-dropdown-menu",
        "data-trigger-id": btnId,
        style: `position:absolute;bottom:100%;left:0;width:100%;background:#eef6fc;
          border:1px solid #d0d6db;border-radius:4px;box-shadow:0 4px 8px rgba(0,0,0,0.15);
          max-height:300px;overflow-y:auto;z-index:9999;display:none;margin-bottom:2px;
          font-family: 'Noto Sans Sinhala', 'Noto Sans', Arial, sans-serif;
          font-size: 12px;`
      });

      let selectedValue = preservedValue || "";

      // Populate dropdown items
      items.forEach(item => {
        const mainText = item.main || item.id;
        const hasSub = item.sub && Array.isArray(item.sub) && item.sub.length > 0;

        const mainDiv = el("div", {
          class: "dropdown-main-item",
          style: `padding:8px 10px;cursor:pointer;border-bottom:1px solid #eee;
            font-weight:${hasSub ? '500' : 'normal'};display:flex;justify-content:space-between;align-items:center;
            transition:background 0.2s;`
        });

        const mainTextSpan = el("span", { text: mainText });
        mainDiv.appendChild(mainTextSpan);

        if (hasSub) {
          const expandIcon = el("span", {
            class: "expand-icon",
            style: "color:#666;font-size:10px;transition:transform 0.2s;",
            text: "▶"
          });
          mainDiv.appendChild(expandIcon);

          // Create sub-items container
          const subContainer = el("div", {
            class: "sub-items-container",
            style: "display:none;background:#eeeeee;"
          });

          item.sub.forEach(subItem => {
            const subName = typeof subItem === 'object' ? subItem.name : subItem;
            const subCode = typeof subItem === 'object' ? subItem.code : "";
            const subText = subCode ? `${subName} (${subCode})` : subName;
            const subValue = `${item.id}:${subName}`;

            const subDiv = el("div", {
              class: "dropdown-sub-item",
              style: `padding:8px 10px 8px 25px;cursor:pointer;border-bottom:1px solid #e0e0e0;
                transition:background 0.2s;`
            });
            subDiv.textContent = subText;

            subDiv.addEventListener("mouseenter", () => subDiv.style.background = "#b3e1ffff");
            subDiv.addEventListener("mouseleave", () => subDiv.style.background = "#eeeeee");
            subDiv.addEventListener("click", (e) => {
              e.stopPropagation();
              btn.dataset.value = subValue;
              textSpan.textContent = subName;
              menu.style.display = "none";
              arrow.style.transform = "rotate(0deg)";

              if (menu.parentElement === document.body) {
                wrapper.appendChild(menu);
              }

              const event = new Event('change', { bubbles: true });
              btn.dispatchEvent(event);
            });

            subContainer.appendChild(subDiv);
          });

          // Main item click handler (toggle sub-items)
          mainDiv.addEventListener("mouseenter", () => mainDiv.style.background = "#a7edffff");
          mainDiv.addEventListener("mouseleave", () => mainDiv.style.background = "#fff");
          mainDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            const isExpanded = subContainer.style.display === "block";

            // Collapse all other sub-containers in this menu
            menu.querySelectorAll(".sub-items-container").forEach(container => {
              container.style.display = "none";
              // Reset icons logic omitted for brevity as traversing manually is tricky without direct reference.
              // Relying on re-render or just simple toggle for now.
              // Actually consistent logic:
              const prev = container.previousElementSibling; // This is mainDiv usually? No, in my Append order below: mainDiv, subContainer.
              if (prev) {
                const icon = prev.querySelector(".expand-icon");
                if (icon) icon.style.transform = "rotate(0deg)";
              }
            });

            if (!isExpanded) {
              subContainer.style.display = "block";
              expandIcon.style.transform = "rotate(90deg)";
            } else {
              subContainer.style.display = "none";
              expandIcon.style.transform = "rotate(0deg)";
            }
          });

          menu.appendChild(mainDiv);
          menu.appendChild(subContainer);
        } else {
          // No sub items
          mainDiv.addEventListener("mouseenter", () => mainDiv.style.background = "#e6f2ff");
          mainDiv.addEventListener("mouseleave", () => mainDiv.style.background = "#fff");
          mainDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            btn.dataset.value = item.id;
            textSpan.textContent = mainText;
            menu.style.display = "none";
            arrow.style.transform = "rotate(0deg)";

            if (menu.parentElement === document.body) {
              wrapper.appendChild(menu);
            }

            const event = new Event('change', { bubbles: true });
            btn.dispatchEvent(event);
          });
          menu.appendChild(mainDiv);
        }
      });

      // Function to position the dropdown menu
      const positionMenu = () => {
        if (menu.style.display !== "block") return;

        const rect = btn.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // On mobile, use smaller threshold and adjust max-height
        const isMobile = viewportWidth <= 768;
        const minSpaceNeeded = isMobile ? 100 : 250;
        
        // Calculate available space more carefully
        const availableBelow = Math.max(0, spaceBelow - 10);
        const availableAbove = Math.max(0, spaceAbove - 10);
        const maxMenuHeight = isMobile 
          ? Math.min(250, Math.max(availableBelow, availableAbove))
          : 300;

        menu.style.position = "fixed";
        menu.style.width = isMobile ? rect.width + "px" : Math.max(rect.width, 220) + "px";
        menu.style.maxHeight = maxMenuHeight + "px";
        menu.style.overflowY = "auto";
        menu.style.left = rect.left + "px";
        menu.style.zIndex = "10000";
        menu.style.margin = "0";

        // Decide direction based on available space
        const openUpward = availableAbove > availableBelow || spaceBelow < minSpaceNeeded;
        
        if (openUpward) {
          // Open upwards
          menu.style.bottom = (viewportHeight - rect.top + 2) + "px";
          menu.style.top = "auto";
          menu.style.maxHeight = Math.min(maxMenuHeight, availableAbove) + "px";
        } else {
          // Open downwards
          menu.style.top = (rect.bottom + 2) + "px";
          menu.style.bottom = "auto";
          menu.style.maxHeight = Math.min(maxMenuHeight, availableBelow) + "px";
        }

        // Adjust horizontal position if goes offscreen
        setTimeout(() => {
          const menuRect = menu.getBoundingClientRect();
          if (menuRect.right > viewportWidth) {
            menu.style.left = Math.max(5, viewportWidth - menuRect.width - 5) + "px";
          }
          if (menuRect.left < 0) {
            menu.style.left = "5px";
            menu.style.width = (viewportWidth - 10) + "px";
          }
        }, 0);
      };

      // Scroll handler to reposition dropdown
      const scrollHandler = () => {
        if (menu.style.display === "block") {
          positionMenu();
        }
      };

      // Display button click handler
      if (!disabled) {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const isOpen = menu.style.display === "block";

          // Close all other menus (checking class)
          document.querySelectorAll('.ms-dropdown-menu').forEach(m => {
            if (m !== menu && m.style.display === "block") {
              m.style.display = "none";
              
              // Reset other buttons' style using data-trigger-id
              if (m.dataset.triggerId) {
                const otherBtn = document.getElementById(m.dataset.triggerId);
                if (otherBtn) {
                   if (otherBtn.dataset.value) {
                     otherBtn.style.backgroundColor = 'rgb(92, 227, 245)';
                     otherBtn.style.borderColor = '#000000ff';
                   } else {
                     otherBtn.style.backgroundColor = '#9e9e9eff';
                     otherBtn.style.borderColor = '#d0d6db';
                   }
                }
              }
            }
          });

          if (isOpen) {
            menu.style.display = "none";
            arrow.style.transform = "rotate(0deg)";
            if (menu.parentElement === document.body) {
              wrapper.appendChild(menu);
            }
            // Remove scroll listener when menu is closed
            window.removeEventListener("scroll", scrollHandler, true);
            window.removeEventListener("resize", scrollHandler);

            // Restore button style
            updateButtonStyle();
          } else {
            // Move to body to avoid overflow clipping
            document.body.appendChild(menu);
            menu.style.display = "block";
            arrow.style.transform = "rotate(180deg)";
            
            // Set button color to GREEN when open
            btn.style.backgroundColor = '#90ee90'; 
            btn.style.borderColor = '#006400';

            // Force reflow before calculating position
            menu.offsetHeight;

            // Position the menu
            positionMenu();

            // Add scroll and resize listeners to reposition menu
            window.addEventListener("scroll", scrollHandler, true);
            window.addEventListener("resize", scrollHandler);
          }
        });

        // Close dropdown when clicking outside
        const closeHandler = (e) => {
          if (!wrapper.contains(e.target) && !menu.contains(e.target)) {
            if (menu.style.display === "block") {
              menu.style.display = "none";
              arrow.style.transform = "rotate(0deg)";
              if (menu.parentElement === document.body) {
                wrapper.appendChild(menu);
              }
              // Remove scroll listeners
              window.removeEventListener("scroll", scrollHandler, true);
              window.removeEventListener("resize", scrollHandler);
              // Collapse sub-items
              menu.querySelectorAll(".sub-items-container").forEach(container => {
                container.style.display = "none";
                const icon = container.previousElementSibling?.querySelector(".expand-icon");
                if (icon) icon.style.transform = "rotate(0deg)";
              });

              // Restore button style
              updateButtonStyle();
            }
          }
        };
        document.addEventListener("click", closeHandler);
      }

      wrapper.appendChild(btn);
      wrapper.appendChild(menu);

      // Helper to update button style
      const updateButtonStyle = () => {
        if (btn.dataset.value) {
          btn.style.backgroundColor = 'rgb(92, 227, 245)'; // Blue background when selected
          btn.style.color = '#000';
          btn.style.borderColor = '#000000ff';
        } else {
          btn.style.backgroundColor = '#9e9e9eff';
          btn.style.color = '#000';
          btn.style.borderColor = '#d0d6db';
        }
      };

      // Add change event listener to update button style
      btn.addEventListener('change', updateButtonStyle);

      return wrapper;
    }

    // Close menus when clicking outside
    document.addEventListener("click", () => {
      document.querySelectorAll('[id$="-menu"]').forEach(m => m.style.display = "none");
    });

    // helper to create select cell (used to create and recreate cells)
    function createSelectCell(namePrefix, preservedRole, preservedPlace, disabled) {
      const wrap = el("div", { style: "min-height:20px;display:flex;gap:6px;align-items:center;color:#000" });

      // Use cascading menu buttons instead of selects
      const roleMenu = createCascadingMenuButton(namePrefix, 'role', preservedRole, disabled);

      const dash = el("div", { style: "width:12px;text-align:center;color:#000" });
      dash.textContent = "-";

      const placeMenu = createCascadingMenuButton(namePrefix, 'place', preservedPlace, disabled);

      wrap.appendChild(roleMenu);
      wrap.appendChild(dash);
      wrap.appendChild(placeMenu);

      // Check if there's already a selection and highlight accordingly
      setTimeout(() => {
        const roleBtn = roleMenu.querySelector('button');
        const placeBtn = placeMenu.querySelector('button');
        const td = wrap.closest('td');
        if (td && ((roleBtn && roleBtn.dataset.value) || (placeBtn && placeBtn.dataset.value))) {
          td.style.backgroundColor = '#ffffffff'; // Light green
        }
      }, 0);

      return wrap;
    }

    // helper to create locked display cell (uneditable)
    function createLockedDisplayCell(displayText) {
      const d = el("div", { class: "ms-locked", style: "min-height:28px;padding:6px;border-radius:4px;display:inline-block;width:100%;box-sizing:border-box", text: displayText || "" });
      return d;
    }

    // NEW: helper to create holiday display cell
    function createHolidayDisplayCell(holidayName) {
      const d = el("div", { class: "ms-holiday", style: "min-height:28px;padding:6px;border-radius:4px;display:inline-block;width:100%;box-sizing:border-box;color:#b71c1c !important;font-weight:700;background:#ffebee", text: holidayName || "" });
      return d;
    }

    // Build rows: use createSelectCell for each morning/afternoon
    for (let d = 1; d <= 31; d++) {
      const tr = el("tr", {});
      const tdDay = el("td", { style: "padding:4px;border:1px solid #ccc;text-align:center;font-weight:700;white-space:nowrap;width:64px;color:#000;font-size:15px" }, []);
      tdDay.textContent = d;

      const tdM = el("td", { style: "padding:4px;border:1px solid #ccc;vertical-align:top;color:#000" }, []);
      tdM.appendChild(createSelectCell("tpl-morning", "", "", false));

      const tdA = el("td", { style: "padding:4px;border:1px solid #ccc;vertical-align:top;color:#000" }, []);
      tdA.appendChild(createSelectCell("tpl-afternoon", "", "", false));

      tr.appendChild(tdDay); tr.appendChild(tdM); tr.appendChild(tdA);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);

    // footer
    const footer = el("div", { style: "margin-top:8px;color:#000;width:100%;" });
    footer.innerHTML = `
      <div style="margin-top:8px;font-size:12px;">
        <div style="display:block;">
          <span style="font-size:11px;display:block;margin-bottom:6px;">වෙනත් කරුණු / குறிப்பு:</span>
          <textarea class="footer-notes" placeholder="" 
          style="border:1px solid #000;
                padding:08px;
                min-height:64px;
                width:80%;
                box-sizing:border-box;
                
                font-size:12px;
                line-height:1.4;">
  To MOH,
        This schedule may be deviate duty requirements. Forwarded for approval via SPHI
          </textarea>
        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px;">
          <div style="display:flex;align-items:center;">
            <span style="font-size:11px">දිනය . திகதி:</span>
            <input type="date" style="margin-left:8px;border:none;border-bottom:1px solid #000;outline:none;width:160px;font-size:15px;">
          </div>

          <div style="display:flex;flex-direction:column;align-items:center;margin-top:8px;">
            <div style="width:160px;text-align:center;"><div style="border-bottom:1px solid #000;height:1px;"></div></div>
            <span style="margin-top:4px;text-align:center;font-size:11px;">අත්සන / கையொப்பம்:</span>
          </div>
        </div>
      </div>
    `;

    // Wrap table in container that allows overflow for dropdowns
    const tableWrapper = el("div", {
      style: "overflow:visible;position:relative"
    });
    tableWrapper.appendChild(table);

    templateWrap.appendChild(tableWrapper);
    templateWrap.appendChild(footer);

    content.appendChild(ctrl);
    content.appendChild(meta);
    content.appendChild(templateWrap);

    // font import (Noto Sinhala)
    if (!document.getElementById("noto-sinhala-font")) {
      const st = document.createElement("style"); st.id = "noto-sinhala-font";
      st.innerHTML = "@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala&display=swap');";
      document.head.appendChild(st);
    }

    // ---------- Functions: inspector display & meta ----------
    
    // Update month display based on language
    function updateMonthDisplay() {
      // Month input stays visible, just language context changes
      // The actual month value display is handled by the browser's month picker
    }
    
    // Function to update only Sunday and holiday rows when language changes
    function updateSundayAndHolidayLanguage() {
      const tbody = templateWrap.querySelector("tbody");
      if (!tbody) return;
      
      const sundayTextSi = "ඉරිදා දිනයකි";
      const sundayTextEn = "Sunday";
      const currentSundayText = currentLanguage === 'en' ? sundayTextEn : sundayTextSi;
      
      const rows = tbody.querySelectorAll("tr");
      rows.forEach((tr, idx) => {
        const day = idx + 1;
        const tdM = tr.children[1];
        const tdA = tr.children[2];
        
        // Update Sunday rows
        if (tr.classList.contains("ms-sunday-row")) {
          const lockedDivM = tdM.querySelector(".ms-locked");
          const lockedDivA = tdA.querySelector(".ms-locked");
          if (lockedDivM) lockedDivM.textContent = currentSundayText;
          if (lockedDivA) lockedDivA.textContent = currentSundayText;
        }
        
        // Update government holiday rows
        if (tr.classList.contains("ms-holiday-row") && !tr.dataset.manualHoliday) {
          // This is a government holiday, get the name in current language
          const monthValue = monthInput.value;
          if (monthValue) {
            const [year, month] = monthValue.split("-");
            const govHolidayName = isGovernmentHoliday(parseInt(year), parseInt(month), day, currentLanguage);
            
            if (govHolidayName) {
              const holidayDivM = tdM.querySelector(".ms-holiday");
              const holidayDivA = tdA.querySelector(".ms-holiday");
              if (holidayDivM) holidayDivM.textContent = govHolidayName;
              if (holidayDivA) holidayDivA.textContent = govHolidayName;
              tr.dataset.holidayName = govHolidayName;
            }
          }
        }
        
        // Update placeholder text in dropdown buttons that haven't been selected
        const buttons = tr.querySelectorAll('button[class*="tpl-"]');
        buttons.forEach(btn => {
          if (!btn.dataset.value) {
            const textSpan = btn.querySelector('span');
            if (textSpan) {
              const placeholderText = currentLanguage === 'en' ? '-- Select --' : '-- තෝරන්න --';
              textSpan.textContent = placeholderText;
            }
          }
        });
      });
    }
    
    // Language switch handlers
    siBtn.addEventListener("click", () => {
      currentLanguage = "si";
      siBtn.style.background = "#0b5ea8";
      siBtn.style.color = "#fff";
      enBtn.style.background = "#ddd";
      enBtn.style.color = "#333";
      
      // Switch designation to Sinhala
      const currentDesignation = designationSelect.value;
      const sinhalaDesignation = designationMapping.si[currentDesignation];
      
      // Update dropdown options first
      updateDesignationOptions();
      
      // Then set the value
      if (sinhalaDesignation) {
        designationSelect.value = sinhalaDesignation;
      }
      
      applyMetaDisplays(); // Update month display
      refreshInspectorDisplay();
      
      // Update only Sunday and holiday rows, not all rows
      updateSundayAndHolidayLanguage();
    });
    
    enBtn.addEventListener("click", () => {
      currentLanguage = "en";
      enBtn.style.background = "#0b5ea8";
      enBtn.style.color = "#fff";
      siBtn.style.background = "#ddd";
      siBtn.style.color = "#333";
      
      // Switch designation to English
      const currentDesignation = designationSelect.value;
      const englishDesignation = designationMapping.en[currentDesignation];
      
      // Update dropdown options first
      updateDesignationOptions();
      
      // Then set the value
      if (englishDesignation) {
        designationSelect.value = englishDesignation;
      }
      
      applyMetaDisplays(); // Update month display
      refreshInspectorDisplay();
      
      // Update only Sunday and holiday rows, not all rows
      updateSundayAndHolidayLanguage();
    });
    
    function refreshInspectorDisplayFromState(state) {
      const elTpl = templateWrap.querySelector("#tpl_inspector_display");
      if (!elTpl) return;
      const inspector = (state && state.inspector) ? state.inspector : "";
      const area = (state && state.area) ? state.area : "";
      const designation = designationSelect.value || "මහජන සෞඛ්‍ය පරීක්ෂක";

      if (inspector && area) {
        elTpl.textContent = `${inspector} - ${designation}  ${area}`;
      } else if (inspector) {
        elTpl.textContent = `${inspector} - ${designation}`;
      } else if (area) {
        elTpl.textContent = `${designation} ${area}`;
      } else {
        elTpl.textContent = designation;
      }
    }

    function refreshInspectorDisplay() {
      const cur = readPhiShortKeys();
      refreshInspectorDisplayFromState(cur);
    }

    function applyMetaDisplays() {
      const tplMonthDisplay = templateWrap.querySelector("#tpl_month_display");
      const tplYearDisplay = templateWrap.querySelector("#tpl_year_display");
      if (tplMonthDisplay) {
        if (monthInput.value) {
          // Use current language to determine month display
          if (currentLanguage === "si") {
            tplMonthDisplay.textContent = getSinhalaMonthName(monthInput.value);
          } else {
            tplMonthDisplay.textContent = getEnglishMonthName(monthInput.value);
          }
          const parts = (monthInput.value || "").split("-");
          tplYearDisplay.textContent = parts[0] ? parts[0].slice(2) : "";
        } else { tplMonthDisplay.textContent = ""; tplYearDisplay.textContent = ""; }
      }
      refreshInspectorDisplay();
    }
    monthInput.addEventListener("input", function () {
      // Remove red highlight when month is selected
      if (monthInput.value) {
        monthInput.style.border = "1px solid #ddd";
        monthInput.style.boxShadow = "none";
      }
      applyMetaDisplays();
      applyMonthConstraints(monthInput.value);
      // NEW: Auto-fill from fixed dates when month changes
      autoFillScheduleFromFixedDates(monthInput.value);
    });
    monthInput.addEventListener("change", function () {
      // Remove red highlight when month is selected
      if (monthInput.value) {
        monthInput.style.border = "1px solid #ddd";
        monthInput.style.boxShadow = "none";
      }
      applyMetaDisplays();
      applyMonthConstraints(monthInput.value);
      // NEW: Auto-fill from fixed dates when month changes
      autoFillScheduleFromFixedDates(monthInput.value);
    });
    
    // Designation change listener
    designationSelect.addEventListener("change", function () {
      refreshInspectorDisplay();
    });

    // populate select options from KeyMap (no longer needed with cascading menus, but keep for compatibility)
    function refreshKeyMapOptions() {
      // Buttons auto-populate from storage, no manual refresh needed
      // This function kept for backward compatibility
    }

    // refresh initial
    refreshKeyMapOptions();
    applyMetaDisplays();

    // START poller + listeners so header updates immediately after phiInfo.js saves
    startPhiPoller(function (state) {
      // state = { inspector, area }
      refreshInspectorDisplayFromState(state);
    });

    // also react to custom event (if any other module dispatches it)
    window.addEventListener("phiInfoUpdated", function (e) {
      const detail = (e && e.detail) ? e.detail : readPhiShortKeys();
      // normalize to {inspector, area}
      const st = { inspector: detail.inspector || detail.name || localStorage.getItem("phi_info_inspector") || "", area: detail.area || localStorage.getItem("phi_info_area") || "" };
      __lastPhiState = st;
      refreshInspectorDisplayFromState(st);
    });

    // react to storage events (other tabs/windows)
    window.addEventListener("storage", function (e) {
      if (!e) return;
      if (e.key === "phi_info_inspector" || e.key === "phi_info_area" || e.key === ROLES_KEY || e.key === PLACES_KEY || e.key === FIXED_DATES_KEY || e.key === HOLIDAY_KEY) {
        const st = readPhiShortKeys();
        __lastPhiState = st;
        refreshInspectorDisplayFromState(st);
        // refresh keymap if needed
        refreshKeyMapOptions();
        // Auto-fill schedule if month is selected
        if (monthInput.value) {
          autoFillScheduleFromFixedDates(monthInput.value);
        }
      }
    });

    // cleanup on page hide/unload
    window.addEventListener("pagehide", function () { stopPhiPoller(); });
    window.addEventListener("beforeunload", function () { stopPhiPoller(); });

    // collect payload
    function collectPayload() {
      const rows = Array.from(tbody.querySelectorAll("tr")).map((tr, i) => {
        // Check if this is a holiday row
        if (tr.classList.contains("ms-holiday-row")) {
          const holidayName = tr.dataset.holidayName || "";
          return {
            day: i + 1,
            morning: { role: "", place: "", holiday: holidayName },
            afternoon: { role: "", place: "", holiday: holidayName },
            isHoliday: true,
            holidayName: holidayName
          };
        }

        // Check if this is a Sunday (locked row with Sunday text)
        const lockedNode = tr.querySelector(".ms-locked");
        const isSundayRow = lockedNode && lockedNode.textContent.trim() === "ඉරිදා දිනයකි";
        
        if (isSundayRow) {
          return {
            day: i + 1,
            morning: "",
            afternoon: "",
            isSunday: true,
            isHoliday: false,
            isInvalidDay: false
          };
        }

        // Check if this is an invalid day (month-locked row)
        const isMonthLocked = tr.dataset.monthLocked === "1";
        if (isMonthLocked) {
          return {
            day: i + 1,
            morning: "",
            afternoon: "",
            isSunday: false,
            isHoliday: false,
            isInvalidDay: true
          };
        }

        // morning
        let morningVal = "";
        const mRoleSel = tr.querySelector(".tpl-morning-role");
        const mPlaceSel = tr.querySelector(".tpl-morning-place");
        if (mRoleSel || mPlaceSel) {
          // Get value from button dataset instead of select value
          const morningRole = (mRoleSel || { dataset: {} }).dataset.value || "";
          const morningPlace = (mPlaceSel || { dataset: {} }).dataset.value || "";
          morningVal = (morningRole || morningPlace) ? { role: morningRole || "", place: morningPlace || "" } : "";
        } else {
          // maybe locked: preserve stored dataset if any
          const mr = tr.dataset.morningRole || "";
          const mp = tr.dataset.morningPlace || "";
          morningVal = (mr || mp) ? { role: mr, place: mp } : "";
        }

        // afternoon
        let afternoonVal = "";
        const aRoleSel = tr.querySelector(".tpl-afternoon-role");
        const aPlaceSel = tr.querySelector(".tpl-afternoon-place");
        if (aRoleSel || aPlaceSel) {
          // Get value from button dataset instead of select value
          const afternoonRole = (aRoleSel || { dataset: {} }).dataset.value || "";
          const afternoonPlace = (aPlaceSel || { dataset: {} }).dataset.value || "";
          afternoonVal = (afternoonRole || afternoonPlace) ? { role: afternoonRole || "", place: afternoonPlace || "" } : "";
        } else {
          const ar = tr.dataset.afternoonRole || "";
          const ap = tr.dataset.afternoonPlace || "";
          afternoonVal = (ar || ap) ? { role: ar, place: ap } : "";
        }

        return { day: i + 1, morning: morningVal, afternoon: afternoonVal, isHoliday: false, isSunday: false, isInvalidDay: false };
      });
      const curPhi = (function () { try { return readPhiShortKeys().inspector || ""; } catch (e) { return ""; } })();
      return {
        // use stored PHI (from localStorage via phiInfo) for payload
        phi: curPhi,
        month: monthInput.value || "",
        footerNotes: (templateWrap.querySelector(".footer-notes") || { value: "" }).value || "",
        entries: rows,
        savedAt: new Date().toISOString()
      };
    }

    // populate editor from payload (local)
    function populateFromPayload_local(p) {
      if (!p) return;

      monthInput.value = p.month || "";
      if (p.entries && Array.isArray(p.entries)) {
        p.entries.forEach(e => {
          const row = tbody.querySelectorAll("tr")[(e.day || 1) - 1];
          if (!row) return;

          // Handle holiday rows
          if (e.isHoliday) {
            const holidayName = (e.morning && e.morning.holiday) || "";
            if (holidayName) {
              markRowAsHoliday(row, holidayName);
            }
            return;
          }

          const mRole = row.querySelector(".tpl-morning-role");
          const mPlace = row.querySelector(".tpl-morning-place");
          const aRole = row.querySelector(".tpl-afternoon-role");
          const aPlace = row.querySelector(".tpl-afternoon-place");

          const setSelect = (selRoleSel, selPlaceSel, value) => {
            if (!value) { if (selRoleSel) selRoleSel.value = ""; if (selPlaceSel) selPlaceSel.value = ""; return; }
            if (typeof value === 'object') { if (selRoleSel) selRoleSel.value = value.role || ""; if (selPlaceSel) selPlaceSel.value = value.place || ""; return; }
            try {
              const parsed = JSON.parse(value);
              if (parsed && typeof parsed === 'object') { if (selRoleSel) selRoleSel.value = parsed.role || ""; if (selPlaceSel) selPlaceSel.value = parsed.place || ""; return; }
            } catch (e) { }
            // fallback: plain text into role select
            if (value && value.length) {
              if (selRoleSel) {
                if (!Array.from(selRoleSel.options).some(o => o.value === value)) {
                  const opt = document.createElement("option"); opt.value = value; opt.text = value + " (free)";
                  selRoleSel.add(opt, selRoleSel.options[1] || null);
                }
                selRoleSel.value = value;
              }
            }
          };

          setSelect(mRole, mPlace, e.morning);
          setSelect(aRole, aPlace, e.afternoon);
        });
      }
      const fn = templateWrap.querySelector(".footer-notes");
      if (fn) fn.value = p.footerNotes || "";
      applyMetaDisplays();
      // enforce month constraints if month present
      applyMonthConstraints(monthInput.value);
      // NEW: Auto-fill from fixed dates when loading saved schedule
      autoFillScheduleFromFixedDates(monthInput.value);
    }

    // NEW: Function to mark a row as holiday
    function markRowAsHoliday(row, holidayName, isManual = false) {
      const tdM = row.children[1];
      const tdA = row.children[2];

      // Store current values in dataset (from button dataset values)
      const mRoleSel = tdM.querySelector(".tpl-morning-role");
      const mPlaceSel = tdM.querySelector(".tpl-morning-place");
      const aRoleSel = tdA.querySelector(".tpl-afternoon-role");
      const aPlaceSel = tdA.querySelector(".tpl-afternoon-place");

      if (mRoleSel) row.dataset.morningRole = mRoleSel.dataset.value || "";
      if (mPlaceSel) row.dataset.morningPlace = mPlaceSel.dataset.value || "";
      if (aRoleSel) row.dataset.afternoonRole = aRoleSel.dataset.value || "";
      if (aPlaceSel) row.dataset.afternoonPlace = aPlaceSel.dataset.value || "";

      // Replace with holiday display
      tdM.innerHTML = "";
      tdA.innerHTML = "";
      tdM.appendChild(createHolidayDisplayCell(holidayName));
      tdA.appendChild(createHolidayDisplayCell(holidayName));

      row.classList.add("ms-holiday-row");
      row.dataset.holidayName = holidayName;
      
      // Mark if manually set by user
      if (isManual) {
        row.dataset.manualHoliday = "1";
      } else {
        delete row.dataset.manualHoliday;
      }
    }

    // NEW: Function to unmark a row as holiday (restore normal selects)
    function unmarkRowAsHoliday(row) {
      const tdM = row.children[1];
      const tdA = row.children[2];

      const preservedMRole = row.dataset.morningRole || "";
      const preservedMPlace = row.dataset.morningPlace || "";
      const preservedARole = row.dataset.afternoonRole || "";
      const preservedAPlace = row.dataset.afternoonPlace || "";

      tdM.innerHTML = "";
      tdA.innerHTML = "";
      tdM.appendChild(createSelectCell("tpl-morning", preservedMRole, preservedMPlace, false));
      tdA.appendChild(createSelectCell("tpl-afternoon", preservedARole, preservedAPlace, false));

      row.classList.remove("ms-holiday-row");
      delete row.dataset.holidayName;
      delete row.dataset.manualHoliday;

      // Refresh options
      refreshKeyMapOptions();
    }

    // expose populate funcs
    window.monthlySchedule.populateEditor = populateFromPayload_local;

    // API: save/load
    window.monthlySchedule.savePayload = function (payload, overwriteIfYes) {
      const month = payload && payload.month ? payload.month : "";
      const key = storageKeyForMonth(month);
      const exists = !!localStorage.getItem(key);
      if (exists && overwriteIfYes !== true) return { ok: false, exists: true };
      localStorage.setItem(key, JSON.stringify(payload));
      return { ok: true, key };
    };

    window.monthlySchedule.getSavedMonths = function () {
      const out = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (k.indexOf("monthlySchedule_exact_template_") === 0) {
          try {
            const p = JSON.parse(localStorage.getItem(k));
            out.push({ key: k, month: p.month || k.replace("monthlySchedule_exact_template_", ""), phi: p.phi || "", savedAt: p.savedAt || null });
          } catch (e) { }
        }
      }
      out.sort((a, b) => (b.savedAt || "").localeCompare(a.savedAt || ""));
      return out;
    };

    window.monthlySchedule.loadPayloadForMonth = function (month) {
      const key = storageKeyForMonth(month);
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      try { return JSON.parse(raw); } catch (e) { return null; }
    };

    // Save behaviour
    saveBtn.onclick = async function () {
      const payload = collectPayload();
      if (!payload.month) {
        if (!await showConfirm("Month not selected. Save without month key? (It will be stored under 'unspecified')")) return;
      }
      const key = storageKeyForMonth(payload.month);
      const exists = !!localStorage.getItem(key);
      if (exists) {
        if (!await showConfirm(`A saved schedule already exists for ${payload.month}. Overwrite?`)) {
          showWarning("Save cancelled.");
          return;
        }
      }
      localStorage.setItem(key, JSON.stringify(payload));
      showSuccess("Saved successfully.");
      window.dispatchEvent(new CustomEvent("monthlyScheduleSaved", { detail: { month: payload.month } }));
    };

    // backBtn.onclick = ()=> window.showContent && window.showContent('Reports', null);

    // ------- Size/Scale control implementation -------
    // No scaling - form fills full width
    function applySizeScale() {
      // Remove any transform
      templateWrap.style.transform = "none";
      templateWrap.style.width = "100%";
    }
    applySizeScale();

    // ---------- Month constraints and Sunday handling ----------
    function applyMonthConstraints(monthValue) {
      // if monthValue empty => clear constraints: make all selects enabled (restore if locked)
      if (!monthValue) {
        // restore all rows that were locked
        const rows = tbody.querySelectorAll("tr");
        rows.forEach((tr, idx) => {
          // if the morning cell is locked (no select), restore createSelectCell with preserved values
          const tdM = tr.children[1];
          const tdA = tr.children[2];

          // morning
          if (!tdM.querySelector("select")) {
            const preservedRole = tr.dataset.morningRole || "";
            const preservedPlace = tr.dataset.morningPlace || "";
            tdM.innerHTML = "";
            tdM.appendChild(createSelectCell("tpl-morning", preservedRole, preservedPlace, false));
          } else {
            // ensure enabled
            const sel = tdM.querySelector("select");
            if (sel) sel.disabled = false;
          }

          // afternoon
          if (!tdA.querySelector("select")) {
            const preservedRole = tr.dataset.afternoonRole || "";
            const preservedPlace = tr.dataset.afternoonPlace || "";
            tdA.innerHTML = "";
            tdA.appendChild(createSelectCell("tpl-afternoon", preservedRole, preservedPlace, false));
          } else {
            const sel = tdA.querySelector("select");
            if (sel) sel.disabled = false;
          }

          // remove sunday markers if exist - we'll recompute when month chosen
          tr.classList.remove("ms-sunday-row");
          if (tr.dataset.sundayLocked) { delete tr.dataset.sundayLocked; }
        });

        return;
      }

      // monthValue like "2025-11"
      const parts = monthValue.split("-");
      if (parts.length < 2) return;
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const last = daysInMonth(y, m);

      // mark Sundays set
      const sundaySet = new Set();
      for (let d = 1; d <= last; d++) {
        const dayOfWeek = new Date(y, m - 1, d).getDay(); // 0 = Sunday
        if (dayOfWeek === 0) sundaySet.add(d);
      }

      // Get government holidays for this month with current language
      const monthHolidays = getGovernmentHolidaysForMonth(monthValue, currentLanguage);

      // iterate rows 1..31
      const rows = tbody.querySelectorAll("tr");
      rows.forEach((tr, idx) => {
        const day = idx + 1;
        const tdM = tr.children[1];
        const tdA = tr.children[2];
        
        // Check if this day is a government holiday
        const govHolidayName = monthHolidays[day];
        
        // Preserve manualHoliday flag before clearing
        const wasManuallyDisabled = tr.dataset.manualHoliday === "1";
        
        // First, clear any existing holiday marking (to prevent carry-over from previous month)
        // Only clear if it's not manually set by user AND not a government holiday for current month
        if (tr.classList.contains("ms-holiday-row") && !tr.dataset.manualHoliday) {
          unmarkRowAsHoliday(tr);
        }
        
        // Restore manualHoliday flag if it was set (user manually disabled government holiday)
        if (wasManuallyDisabled && govHolidayName) {
          tr.dataset.manualHoliday = "1";
        }

        // If day > last => lock and show preserved uneditable
        if (day > last) {
          // preserve current select values (if any)
          const mRoleSel = tdM.querySelector(".tpl-morning-role");
          const mPlaceSel = tdM.querySelector(".tpl-morning-place");
          const aRoleSel = tdA.querySelector(".tpl-afternoon-role");
          const aPlaceSel = tdA.querySelector(".tpl-afternoon-place");

          const mRoleVal = (mRoleSel && mRoleSel.value) ? mRoleSel.value : (tr.dataset.morningRole || "");
          const mPlaceVal = (mPlaceSel && mPlaceSel.value) ? mPlaceSel.value : (tr.dataset.morningPlace || "");
          const aRoleVal = (aRoleSel && aRoleSel.value) ? aRoleSel.value : (tr.dataset.afternoonRole || "");
          const aPlaceVal = (aPlaceSel && aPlaceSel.value) ? aPlaceSel.value : (tr.dataset.afternoonPlace || "");

          // store preserved values in dataset
          if (mRoleVal) tr.dataset.morningRole = mRoleVal; else delete tr.dataset.morningRole;
          if (mPlaceVal) tr.dataset.morningPlace = mPlaceVal; else delete tr.dataset.morningPlace;
          if (aRoleVal) tr.dataset.afternoonRole = aRoleVal; else delete tr.dataset.afternoonPlace;
          if (aPlaceVal) tr.dataset.afternoonPlace = aPlaceVal; else delete tr.dataset.afternoonPlace;

          // show locked display (uneditable) for both morning and afternoon
          tdM.innerHTML = "";
          tdM.appendChild(createLockedDisplayCell(formatEntryForPrint({ role: mRoleVal, place: mPlaceVal }) || ""));
          tdA.innerHTML = "";
          tdA.appendChild(createLockedDisplayCell(formatEntryForPrint({ role: aRoleVal, place: aPlaceVal }) || ""));

          tr.dataset.monthLocked = "1";
          // remove any sunday special mark
          tr.classList.remove("ms-sunday-row");
          delete tr.dataset.sundayLocked;
          return;
        } else {
          // day is within month
          // govHolidayName was already fetched at the start of the loop
          
          if (govHolidayName && tr.dataset.manualHoliday !== "1") {
            // This is a government holiday and not manually disabled
            // Clear any existing selects - will be marked as holiday below
            tdM.innerHTML = "";
            tdA.innerHTML = "";
            delete tr.dataset.monthLocked;
          } else {
            // Normal day or manually disabled government holiday
            // Ensure selects exist and are enabled (unless previously user-locked Sunday)
            // if currently locked because of prior month selection, restore selects with preserved values
            if (!tdM.querySelector("select")) {
              const preservedRole = tr.dataset.morningRole || "";
              const preservedPlace = tr.dataset.morningPlace || "";
              tdM.innerHTML = "";
              tdM.appendChild(createSelectCell("tpl-morning", preservedRole, preservedPlace, false));
            } else {
              // ensure enabled
              const sel = tdM.querySelector("select");
              if (sel) sel.disabled = false;
            }

            if (!tdA.querySelector("select")) {
              const preservedRole = tr.dataset.afternoonRole || "";
              const preservedPlace = tr.dataset.afternoonPlace || "";
              tdA.innerHTML = "";
              tdA.appendChild(createSelectCell("tpl-afternoon", preservedRole, preservedPlace, false));
            } else {
              const sel = tdA.querySelector("select");
              if (sel) sel.disabled = false;
            }
            delete tr.dataset.monthLocked;
          }
        }

        // SUNDAY HANDLING (skip if government holiday)
        if (sundaySet.has(day) && !(govHolidayName && tr.dataset.manualHoliday !== "1")) {
          // helper to render locked Sunday note
          const makeLockedSunday = () => {
            // preserve any selects values first
            const mRoleSel = tdM.querySelector(".tpl-morning-role");
            const mPlaceSel = tdM.querySelector(".tpl-morning-place");
            const aRoleSel = tdA.querySelector(".tpl-afternoon-role");
            const aPlaceSel = tdA.querySelector(".tpl-afternoon-place");

            const mRoleVal = (mRoleSel && mRoleSel.value) ? mRoleSel.value : (tr.dataset.morningRole || "");
            const mPlaceVal = (mPlaceSel && mPlaceSel.value) ? mPlaceSel.value : (tr.dataset.morningPlace || "");
            const aRoleVal = (aRoleSel && aRoleSel.value) ? aRoleSel.value : (tr.dataset.afternoonRole || "");
            const aPlaceVal = (aPlaceSel && aPlaceSel.value) ? aPlaceSel.value : (tr.dataset.afternoonPlace || "");

            if (mRoleVal) tr.dataset.morningRole = mRoleVal; else delete tr.dataset.morningRole;
            if (mPlaceVal) tr.dataset.morningPlace = mPlaceVal; else delete tr.dataset.morningPlace;
            if (aRoleVal) tr.dataset.afternoonRole = aRoleVal; else delete tr.dataset.afternoonRole;
            if (aPlaceVal) tr.dataset.afternoonPlace = aPlaceVal; else delete tr.dataset.afternoonPlace;

            tdM.innerHTML = "";
            tdA.innerHTML = "";
            const sundayDivM = createLockedDisplayCell("ඉරිදා දිනයකි");
            const sundayDivA = createLockedDisplayCell("ඉරිදා දිනයකි");
            tdM.appendChild(sundayDivM);
            tdA.appendChild(sundayDivA);

            tr.classList.add("ms-sunday-row");
            // remove flag so it's treated as default Sunday
            delete tr.dataset.sundayLocked;
          };

          // helper to render duty selects for this Sunday (restores preserved values if present)
          const makeDutySunday = () => {
            const preservedMRole = tr.dataset.morningRole || "";
            const preservedMPlace = tr.dataset.morningPlace || "";
            const preservedARole = tr.dataset.afternoonRole || "";
            const preservedAPlace = tr.dataset.afternoonPlace || "";

            tdM.innerHTML = "";
            tdA.innerHTML = "";
            tdM.appendChild(createSelectCell("tpl-morning", preservedMRole, preservedMPlace, false));
            tdA.appendChild(createSelectCell("tpl-afternoon", preservedARole, preservedAPlace, false));

            tr.classList.remove("ms-sunday-row");
            // mark as converted to duty
            tr.dataset.sundayLocked = "1";

            // refresh options in case keymap changed
            refreshKeyMapOptions();
          };

          // Decide initial state: if dataset.sundayLocked === "1" => duty, else locked default
          if (tr.dataset.sundayLocked === "1") {
            // ensure selects exist (restore if missing) - check for buttons instead of selects
            if (!tdM.querySelector(".tpl-morning-role")) tdM.appendChild(createSelectCell("tpl-morning", tr.dataset.morningRole || "", tr.dataset.morningPlace || "", false));
            if (!tdA.querySelector(".tpl-afternoon-role")) tdA.appendChild(createSelectCell("tpl-afternoon", tr.dataset.afternoonRole || "", tr.dataset.afternoonPlace || "", false));
            tr.classList.remove("ms-sunday-row");
          } else {
            makeLockedSunday();
          }

          // Remove any previous dblclick handler to avoid duplicate bindings
          if (tr._ms_sunday_dbl_handler) {
            tr.removeEventListener("dblclick", tr._ms_sunday_dbl_handler);
            delete tr._ms_sunday_dbl_handler;
          }

          // Attach double-click toggle handler on the entire row (or you can attach to tdM/tdA)
          const dblHandler = function (ev) {
            ev.stopPropagation();
            // If currently shows selects (duty) -> switch back to locked Sunday
            const hasSelects = !!tdM.querySelector("select") || !!tdA.querySelector("select");
            if (hasSelects) {
              // store current select values then make locked
              const curMRole = (tdM.querySelector(".tpl-morning-role") || { value: "" }).value || "";
              const curMPlace = (tdM.querySelector(".tpl-morning-place") || { value: "" }).value || "";
              const curARole = (tdA.querySelector(".tpl-afternoon-role") || { value: "" }).value || "";
              const curAPlace = (tdA.querySelector(".tpl-afternoon-place") || { value: "" }).value || "";

              if (curMRole) tr.dataset.morningRole = curMRole; else delete tr.dataset.morningRole;
              if (curMPlace) tr.dataset.morningPlace = curMPlace; else delete tr.dataset.morningPlace;
              if (curARole) tr.dataset.afternoonRole = curARole; else delete tr.dataset.afternoonRole;
              if (curAPlace) tr.dataset.afternoonPlace = curAPlace; else delete tr.dataset.afternoonPlace;

              // remove the converted flag so it becomes default Sunday again
              delete tr.dataset.sundayLocked;
              makeLockedSunday();
            } else {
              // currently locked => convert to duty selects
              makeDutySunday();
              // focus first select for better UX
              const firstSel = tdM.querySelector("select, textarea, input");
              if (firstSel) try { firstSel.focus(); } catch (e) { }
            }
          };

          tr.addEventListener("dblclick", dblHandler);
          // store reference so we can remove it later if needed
          tr._ms_sunday_dbl_handler = dblHandler;

        } else {
          // NOT SUNDAY - Check for government holidays first
          // holidayName was already fetched at the start of the loop as govHolidayName
          
          if (govHolidayName && tr.dataset.manualHoliday !== "1") {
            // This day is a government holiday and not manually disabled
            // Automatically mark it (not manual)
            markRowAsHoliday(tr, govHolidayName, false);
          }
          
          // Add holiday selection on double click
          // Remove any previous dblclick handler to avoid duplicate bindings
          if (tr._ms_holiday_dbl_handler) {
            tr.removeEventListener("dblclick", tr._ms_holiday_dbl_handler);
            delete tr._ms_holiday_dbl_handler;
          }

          // Attach double-click handler for holiday selection
          const holidayDblHandler = function (ev) {
            ev.stopPropagation();

            // If already a holiday, toggle back to normal day
            if (tr.classList.contains("ms-holiday-row")) {
              // Check if this is a government holiday for this day
              const govHolidayName = monthHolidays[day];
              
              if (govHolidayName) {
                // This is a government holiday - toggle it to normal day
                // Set flag to indicate user manually disabled this government holiday
                tr.dataset.manualHoliday = "1";
                unmarkRowAsHoliday(tr);
                
                // Now restore the select dropdowns since we're converting to normal day
                const preservedMRole = tr.dataset.morningRole || "";
                const preservedMPlace = tr.dataset.morningPlace || "";
                const preservedARole = tr.dataset.afternoonRole || "";
                const preservedAPlace = tr.dataset.afternoonPlace || "";
                
                const tdM = tr.children[1];
                const tdA = tr.children[2];
                
                tdM.innerHTML = "";
                tdA.innerHTML = "";
                tdM.appendChild(createSelectCell("tpl-morning", preservedMRole, preservedMPlace, false));
                tdA.appendChild(createSelectCell("tpl-afternoon", preservedARole, preservedAPlace, false));
                
                refreshKeyMapOptions();
              } else {
                // Manual holiday - just remove it
                unmarkRowAsHoliday(tr);
              }
              return;
            }

            // Not currently a holiday - check if this day has a government holiday
            const govHolidayName = monthHolidays[day];
            if (govHolidayName) {
              // This day has a government holiday - restore it
              // Clear the manual flag to allow it to show
              delete tr.dataset.manualHoliday;
              markRowAsHoliday(tr, govHolidayName, false);
              return;
            }

            // No government holiday - show manual holiday selection dialog
            const holidays = loadHolidays();
            if (holidays.length === 0) {
              showWarning("No holiday types available. Please add holiday types in Key Map first.");
              return;
            }

            const holidayList = holidays.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
            const holidaySelect = `
              <select id="holidaySelect" style="width:100%;padding:8px;margin:10px 0;border:1px solid #ccc;border-radius:4px;">
                <option value="">-- Select Holiday Type --</option>
                ${holidayList}
              </select>
            `;

            const customHolidayInput = `
              <div style="margin:10px 0;">
                <input type="text" id="customHoliday" placeholder="Or enter custom holiday name" style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;">
              </div>
            `;

            const dialog = document.createElement("div");
            dialog.style.cssText = `
              position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
              background:white; padding:20px; border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,0.3);
              z-index:10000; min-width:300px; border:2px solid #b71c1c;
            `;
            dialog.innerHTML = `
              <h3 style="margin:0 0 15px 0;color:#b71c1c;">Select Holiday Type</h3>
              ${holidaySelect}
              ${customHolidayInput}
              <div style="display:flex;gap:10px;margin-top:15px;">
                <button id="confirmHoliday" style="flex:1;padding:8px;background:#b71c1c;color:white;border:none;border-radius:4px;">Set as Holiday</button>
                <button id="cancelHoliday" style="flex:1;padding:8px;background:#666;color:white;border:none;border-radius:4px;">Cancel</button>
              </div>
            `;

            document.body.appendChild(dialog);

            const confirmBtn = dialog.querySelector("#confirmHoliday");
            const cancelBtn = dialog.querySelector("#cancelHoliday");
            const selectEl = dialog.querySelector("#holidaySelect");
            const customInput = dialog.querySelector("#customHoliday");

            const cleanup = () => {
              document.body.removeChild(dialog);
              document.removeEventListener('keydown', handleKeydown);
            };

            const handleKeydown = (e) => {
              if (e.key === 'Escape') cleanup();
            };

            document.addEventListener('keydown', handleKeydown);

            confirmBtn.onclick = () => {
              let holidayName = "";

              if (selectEl.value) {
                const selectedHoliday = holidays.find(h => h.id === selectEl.value);
                holidayName = selectedHoliday ? selectedHoliday.name : "";
              } else if (customInput.value.trim()) {
                holidayName = customInput.value.trim();
              }

              if (holidayName) {
                markRowAsHoliday(tr, holidayName, true); // Mark as manual
                cleanup();
              } else {
                showWarning("Please select a holiday type or enter a custom holiday name.");
              }
            };

            cancelBtn.onclick = cleanup;

            // Auto-focus the select element
            setTimeout(() => selectEl.focus(), 100);
          };

          tr.addEventListener("dblclick", holidayDblHandler);
          tr._ms_holiday_dbl_handler = holidayDblHandler;

          // ensure selects exist and enabled - check for buttons instead of selects
          // But NOT for government holidays (unless manually disabled)
          if (!(govHolidayName && tr.dataset.manualHoliday !== "1")) {
            if (!tdM.querySelector(".tpl-morning-role")) tdM.appendChild(createSelectCell("tpl-morning", tr.dataset.morningRole || "", tr.dataset.morningPlace || "", false));
            if (!tdA.querySelector(".tpl-afternoon-role")) tdA.appendChild(createSelectCell("tpl-afternoon", tr.dataset.afternoonRole || "", tr.dataset.afternoonPlace || "", false));
          }
          tr.classList.remove("ms-sunday-row");
        }
      });
    }

    // PDF helper function
    // UPDATED: downloadPDFForWrapper function - Opens new window similar to otVoucherPrint.js
    function downloadPDFForWrapper(wrapper, monthValue, origTbody, sizeType) {
      if (!monthValue) {
        Swal.fire({ icon: "warning", title: "මාසය තෝරන්න", text: "කරුණාකර මුලින්ම මාසයක් තෝරන්න", confirmButtonColor: "#3085d6" });
        return;
      }

      const payload = collectPayload();
      const phiInfo = readPhiShortKeys();
      const parts = monthValue.split("-");
      const year = parts[0] || "";
      
      // Use current language for month display
      const monthName = currentLanguage === "si" ? getSinhalaMonthName(monthValue) || "" : getEnglishMonthName(monthValue) || "";
      const sundayText = currentLanguage === "si" ? "ඉරිදා දිනයකි" : "Sunday";
      
      const w = window.open("", "_blank");
      if (!w) {
        Swal.fire({ icon: "error", title: "දෝෂයක්", text: "කරුණාකර popup blocker එක අක්‍රිය කරන්න", confirmButtonColor: "#d33" });
        return;
      }

      let tableRowsHTML = "";
      const rows = payload.entries || payload.rows || [];
      rows.forEach((row, idx) => {
        const TABLE_START_TOP = 300;
        const ROW_HEIGHT = 27.5;
        const top = TABLE_START_TOP + (idx * ROW_HEIGHT);
        
        if (row.isSunday) {
          // Show Sunday text in both morning and afternoon columns
          tableRowsHTML += '<div class="field row-morning ms-sunday" style="top:' + top + 'px;left:110px;">' + escapeHtml(sundayText) + '</div>';
          tableRowsHTML += '<div class="field row-afternoon ms-sunday" style="top:' + top + 'px;left:450px;">' + escapeHtml(sundayText) + '</div>';
        } else if (row.isHoliday) {
          // Show holiday text in both morning and afternoon columns
          tableRowsHTML += '<div class="field row-morning ms-holiday" style="top:' + top + 'px;left:110px;">' + escapeHtml(row.holidayName || "නිවාඩු දිනයකි") + '</div>';
          tableRowsHTML += '<div class="field row-afternoon ms-holiday" style="top:' + top + 'px;left:450px;">' + escapeHtml(row.holidayName || "නිවාඩු දිනයකි") + '</div>';
        } else if (row.isInvalidDay) {
          // Show horizontal line for invalid days (days beyond month)
          tableRowsHTML += '<div class="field" style="top:' + (top + 5) + 'px;left:110px;width:320px;height:2px;background:#b71c1c;white-space:normal;"></div>';
          tableRowsHTML += '<div class="field" style="top:' + (top + 5) + 'px;left:450px;width:320px;height:2px;background:#b71c1c;white-space:normal;"></div>';
        } else {
          const mText = formatEntryForPrint(row.morning);
          const aText = formatEntryForPrint(row.afternoon);
          if (mText) tableRowsHTML += '<div class="field row-morning" style="top:' + top + 'px;">' + escapeHtml(mText) + '</div>';
          if (aText) tableRowsHTML += '<div class="field row-afternoon" style="top:' + top + 'px;">' + escapeHtml(aText) + '</div>';
        }
      });

      const designation = designationSelect.value || "මහජන සෞඛ්‍ය පරීක්ෂක";
      const phiHTML = phiInfo.inspector ? escapeHtml(phiInfo.inspector) + " - " + escapeHtml(designation) + " " + (phiInfo.area ? escapeHtml(phiInfo.area) : "") : escapeHtml(designation);
      const footerHTML = payload.footerNotes ? '<div class="field" style="top:1190px;left:100px;width:700px;font-size:12px;white-space:pre-wrap;">' + escapeHtml(payload.footerNotes) + '</div>' : "";

      w.document.write('<!DOCTYPE html><html lang="si"><head><meta charset="UTF-8"><title>මාසික ඉදිරි කාලසටහන - ' + monthName + ' ' + year + '</title>');
      w.document.write('<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;600;700&family=Noto+Sans+Tamil:wght@400;600&display=swap" rel="stylesheet">');
      w.document.write('<style>@page{size:legal portrait;margin:0}html,body{margin:0;padding:0;width:816px;height:1344px}.page{position:relative;width:816px;height:1344px;font-family:"Noto Sans Sinhala","Noto Sans Tamil",Arial,sans-serif}.bg-image{position:absolute;top:0;left:0;width:816px;height:1344px;z-index:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}.field{position:absolute;color:#0b5cff;font-weight:900;font-family:"Times New Roman","Noto Sans Sinhala","Liberation Serif",Georgia,serif;font-style:normal;z-index:1;white-space:nowrap;letter-spacing:0.5px;-webkit-print-color-adjust:exact;print-color-adjust:exact}#phi-name{top:85px;left:250px;font-size:14px;width:500px;letter-spacing:0.5px}#month-field{top:145px;left:365px;font-size:15px;letter-spacing:0.5px}#year-field{top:145px;left:575px;font-size:15px;letter-spacing:0.5px}.row-morning{left:110px;width:310px;font-size:12px;font-weight:900;text-align:center;letter-spacing:0.5px}.row-afternoon{left:450px;width:310px;font-size:12px;font-weight:900;text-align:center;letter-spacing:0.5px}.ms-sunday{color:#b71c1c;font-weight:900;letter-spacing:0.5px}.ms-holiday{color:#b71c1c;font-weight:900;letter-spacing:0.5px}@media print{html,body,.page{width:816px!important;height:1344px!important;overflow:hidden!important}}</style></head><body>');
      w.document.write('<div class="page"><img src="assets/advance program.jpg" class="bg-image" alt="Monthly Schedule Background">');
      w.document.write('<div id="phi-name" class="field">' + phiHTML + '</div>');
      w.document.write('<div id="month-field" class="field">' + escapeHtml(monthName) + '</div>');
      w.document.write('<div id="year-field" class="field">' + (year && year.length >= 2 ? escapeHtml(year.substring(2)) : "") + '</div>');
      w.document.write(tableRowsHTML);
      w.document.write(footerHTML);
      w.document.write('</div><script>window.onload=function(){setTimeout(function(){window.print()},150)}<\/script></body></html>');
      w.document.close();
    }

    // assign print/pdf handlers (always use legal size)
    pdfBtn.onclick = function () { downloadPDFForWrapper(templateWrap, monthInput.value, tbody, "legal"); };

  }; // end openMonthlyScheduleReport

})(); // end module
