
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
    const r = arr.find(x => String(x.id) === String(id));
    if (!r) return "";
    // Check if it's a main item or sub-item (format: mainId:subName)
    if (id.includes(':')) {
      const [mainId, subName] = id.split(':');
      const main = arr.find(x => String(x.id) === String(mainId));
      return main ? subName : "";
    }
    return r.main || "";
  }
  function getPlaceNameById(id) {
    if (!id) return "";
    const arr = loadKeyPlaces();
    const r = arr.find(x => String(x.id) === String(id));
    if (!r) return "";
    // Check if it's a main item or sub-item (format: mainId:subName)
    if (id.includes(':')) {
      const [mainId, subName] = id.split(':');
      const main = arr.find(x => String(x.id) === String(mainId));
      return main ? subName : "";
    }
    return r.main || "";
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
    
    @page { margin:12pt; }
    @media print {
      /* === TABLE HEADER (දිනය, පෙරවරු, පස්වරු) === */
      .monthlySchedule-template table th {
        font-size: 15px !important;
        font-weight: 600 !important;
      }
      
      /* === NORMAL USER INPUT (Role - Place) === */
      .monthlySchedule-template .print-cell-content,
      .monthlySchedule-template .user-input {
        font-size: 15px !important;
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

  // NEW: Auto-fill schedule from fixed dates with CORRECT week calculation
  // NEW: Auto-fill schedule from fixed dates with CORRECT week calculation
  function autoFillScheduleFromFixedDates(monthValue) {
    if (!monthValue) return;

    const parts = monthValue.split("-");
    if (parts.length < 2) return;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);

    const tbody = document.querySelector(".monthlySchedule-template tbody");
    if (!tbody) return;

    const scheduleRows = tbody.querySelectorAll("tr");

    // Clear existing values first (but preserve holidays)
    scheduleRows.forEach(tr => {
      // Only clear if not a holiday
      if (!tr.classList.contains("ms-holiday-row")) {
        const morningRole = tr.querySelector(".tpl-morning-role");
        const morningPlace = tr.querySelector(".tpl-morning-place");
        const afternoonRole = tr.querySelector(".tpl-afternoon-role");
        const afternoonPlace = tr.querySelector(".tpl-afternoon-place");

        if (morningRole) morningRole.value = "";
        if (morningPlace) morningPlace.value = "";
        if (afternoonRole) afternoonRole.value = "";
        if (afternoonPlace) afternoonPlace.value = "";
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

      const morningRole = tr.querySelector(".tpl-morning-role");
      const morningPlace = tr.querySelector(".tpl-morning-place");
      const afternoonRole = tr.querySelector(".tpl-afternoon-role");
      const afternoonPlace = tr.querySelector(".tpl-afternoon-place");

      // Get fixed dates for this specific day and week
      const fixedDates = getFixedDatesForDay(dayOfWeek, weekNumber);

      fixedDates.forEach(fd => {
        const roleName = getRoleNameById(fd.roleId);
        const placeName = getPlaceNameById(fd.placeId);

        if (fd.time === 'morning') {
          // පෙරවරු - set both role and place in morning column
          if (morningRole && roleName) morningRole.value = fd.roleId;
          if (morningPlace && placeName) morningPlace.value = fd.placeId;
        } else if (fd.time === 'afternoon') {
          // පස්වරු - set both role and place in afternoon column
          if (afternoonRole && roleName) afternoonRole.value = fd.roleId;
          if (afternoonPlace && placeName) afternoonPlace.value = fd.placeId;
        } else if (fd.time === 'full_day') {
          // දවසම - set both role and place in BOTH morning and afternoon columns
          if (morningRole && roleName) morningRole.value = fd.roleId;
          if (morningPlace && placeName) morningPlace.value = fd.placeId;
          if (afternoonRole && roleName) afternoonRole.value = fd.roleId;
          if (afternoonPlace && placeName) afternoonPlace.value = fd.placeId;
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

    const printBtn = el("button", { type: "button", style: "padding:8px 12px;border-radius:8px;border:1px solid #bdbdbd;cursor:pointer;background:#e8e8e8" }); printBtn.textContent = "Print";
    const pdfBtn = el("button", { type: "button", style: "padding:8px 12px;border-radius:8px;border:1px solid #bdbdbd;cursor:pointer;background:#f3e5f5" }); pdfBtn.textContent = "Download PDF";

    // Size selector - UPDATED: A4 option changed to 100% scale
    const sizeSel = el("select", {
      style: "padding:8px;border-radius:6px;border:1px solid #bbb;"
    });
    sizeSel.innerHTML = `
      <option value="legal">Legal (8.5×14)</option>
      <option value="a4">A4 (100% Scale)</option>  <!-- Changed from 83% to 100% -->
    `;

    const saveBtn = el("button", { type: "button", style: "padding:8px 12px;border-radius:8px;border:1px solid #2b7;color:#fff;background:#2b7" }); saveBtn.textContent = "Save";

    // Append only the remaining buttons (removed backBtn)
    ctrl.append(printBtn, pdfBtn, sizeSel, saveBtn);

    // meta inputs
    const meta = el("div", {
      class: "monthly-schedule-meta",
      style: "display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap"
    });
    const monthInput = el("input", { type: "month", style: "padding:8px;border-radius:6px;border:1px solid #ddd;color:#000" });
    meta.append(el("div", { html: "<strong style='color:#fff;background:#0b5ea8;padding:4px 8px;border-radius:4px;'>Month</strong>" }), monthInput);
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
      style: "background:#fff;border-radius:6px;border:1px solid #ddd;box-shadow:0 4px 10px rgba(0,0,0,0.04);color:#000;overflow:visible;"
    });
    // we'll set scale via applySizeScale()
    templateWrap.style.transformOrigin = "top left";
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

    // Helper function to create cascading menu button
    function createCascadingMenuButton(namePrefix, type, preservedValue, disabled) {
      const btnId = `${namePrefix}-${type}-btn`;
      const menuId = `${namePrefix}-${type}-menu`;
      
      const items = type === 'role' ? loadKeyRoles() : loadKeyPlaces();
      const displayText = preservedValue ? 
        (type === 'role' ? getRoleNameById(preservedValue) : getPlaceNameById(preservedValue)) : 
        `-- තෝරන්න --`;
      
      const wrapper = el("div", {
        style: "position:relative;flex:1;min-width:0"
      });
      
      const btn = el("button", {
        id: btnId,
        type: "button",
        class: `${namePrefix}-${type}`,
        style: `width:100%;padding:8px 14px;border:1px solid #ccc;border-radius:6px;background:#fff;
                font-size:11px;color:#000;text-align:left;cursor:pointer;
                display:flex;justify-content:space-between;align-items:center;
                ${disabled ? 'opacity:0.6;cursor:not-allowed;' : ''}`
      });
      btn.disabled = disabled;
      btn.dataset.value = preservedValue || "";
      
      const textSpan = el("span", {
        style: "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1"
      });
      textSpan.textContent = displayText;
      
      const arrow = el("span", { style: "margin-left:4px;color:#6b7280;font-size:10px" });
      arrow.textContent = "▼";
      
      btn.appendChild(textSpan);
      btn.appendChild(arrow);
      
      // Create cascading menu
      const menu = el("div", {
        id: menuId,
        style: `position:absolute;top:100%;left:0;min-width:220px;max-width:300px;
                background:#fff;border:1px solid #e5e7eb;border-radius:8px;
                box-shadow:0 10px 30px rgba(0,0,0,0.1);z-index:1000;display:none;
                max-height:400px;margin-top:4px;overflow:visible`
      });
      
      // Add menu items
      items.forEach(item => {
        const itemDiv = el("div", {
          style: `padding:8px 14px;cursor:pointer;display:flex;justify-content:space-between;
                  align-items:center;border-bottom:1px solid #e5e7eb;transition:background 0.15s ease;position:relative`
        });
        itemDiv.dataset.value = item.id;
        
        // Check if this is an afternoon place menu
        const isAfternoonPlace = namePrefix.includes('afternoon') && type === 'place';
        
        // Check if has sub items
        if (item.sub && item.sub.length > 0) {
          const indicator = el("span", {
            style: isAfternoonPlace ? "margin-right:8px;color:#666;font-size:14px" : "margin-left:8px;color:#666;font-size:14px"
          });
          indicator.textContent = isAfternoonPlace ? "◀" : "▶";
          
          if (isAfternoonPlace) {
            itemDiv.appendChild(indicator);
          }
        }
        
        const mainText = el("span", {
          style: "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
        });
        mainText.textContent = item.main || item.id;
        itemDiv.appendChild(mainText);
        
        // Check if has sub items
        if (item.sub && item.sub.length > 0) {
          if (!isAfternoonPlace) {
            const indicator = itemDiv.querySelector("span");
            if (!indicator || indicator === mainText) {
              const newIndicator = el("span", {
                style: "margin-left:8px;color:#666;font-size:14px"
              });
              newIndicator.textContent = "▶";
              itemDiv.appendChild(newIndicator);
            }
          }
          
          // Create submenu
          const submenu = el("div", {
            style: `position:absolute;left:100%;top:0;min-width:180px;
                    background:#fff;border:1px solid #e5e7eb;border-radius:8px;
                    box-shadow:0 10px 30px rgba(0,0,0,0.1);display:none;
                    max-height:400px;overflow-y:auto;z-index:10002`
          });

          const positionSubmenu = () => {
            submenu.style.display = "block";
            // Check if this is an afternoon place menu (tpl-afternoon-place)
            const isAfternoonPlace = namePrefix.includes('afternoon') && type === 'place';
            
            if (isAfternoonPlace) {
              // Always show on left for afternoon place
              submenu.style.left = "auto";
              submenu.style.right = "100%";
            } else {
              // Default: show on right, flip to left if needed
              submenu.style.left = "100%";
              submenu.style.right = "auto";
              const rect = submenu.getBoundingClientRect();
              if (rect.right > window.innerWidth && rect.left > 0) {
                submenu.style.left = "auto";
                submenu.style.right = "100%";
              }
            }
          };
          
          item.sub.forEach(subItem => {
            const subDiv = el("div", {
              style: "padding:8px 14px;cursor:pointer;border-bottom:1px solid #e5e7eb;transition:background 0.15s ease"
            });
            const subId = `${item.id}:${typeof subItem === 'object' ? subItem.name : subItem}`;
            subDiv.dataset.value = subId;
            
            const subName = typeof subItem === 'object' ? subItem.name : subItem;
            const subCode = typeof subItem === 'object' && subItem.code ? ` (${subItem.code})` : '';
            subDiv.textContent = subName + subCode;
            
            subDiv.addEventListener("mouseenter", () => {
              subDiv.style.background = "#f3f4f6";
            });
            subDiv.addEventListener("mouseleave", () => {
              subDiv.style.background = "#fff";
            });
            subDiv.addEventListener("click", (e) => {
              e.stopPropagation();
              btn.dataset.value = subId;
              textSpan.textContent = subName;
              menu.style.display = "none";
              submenu.style.display = "none";
              // Trigger change event
              btn.dispatchEvent(new Event('change', { bubbles: true }));
            });
            
            submenu.appendChild(subDiv);
          });
          
          itemDiv.appendChild(submenu);
          
          itemDiv.addEventListener("mouseenter", () => {
            itemDiv.style.background = "#f3f4f6";
            positionSubmenu();
          });
          itemDiv.addEventListener("mouseleave", (e) => {
            // Delay hiding to allow moving to submenu
            setTimeout(() => {
              if (!submenu.matches(':hover')) {
                itemDiv.style.background = "#fff";
                submenu.style.display = "none";
              }
            }, 100);
          });
          
          // Keep submenu open when hovering over it
          submenu.addEventListener("mouseenter", () => {
            submenu.style.display = "block";
            itemDiv.style.background = "#f3f4f6";
          });
          submenu.addEventListener("mouseleave", () => {
            submenu.style.display = "none";
            itemDiv.style.background = "#fff";
          });
        } else {
          // No submenu - click to select main item
          itemDiv.addEventListener("mouseenter", () => {
            itemDiv.style.background = "#f3f4f6";
          });
          itemDiv.addEventListener("mouseleave", () => {
            itemDiv.style.background = "#fff";
          });
        }
        
        // Main item click
        itemDiv.addEventListener("click", (e) => {
          if (!item.sub || item.sub.length === 0) {
            btn.dataset.value = item.id;
            textSpan.textContent = item.main || item.id;
            menu.style.display = "none";
            // Trigger change event
            btn.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        
        menu.appendChild(itemDiv);
      });
      
      // Toggle menu on button click
      btn.addEventListener("click", (e) => {
        if (disabled) return;
        e.stopPropagation();
        const isVisible = menu.style.display === "block";
        // Close all other menus
        document.querySelectorAll('[id$="-menu"]').forEach(m => m.style.display = "none");
        
        if (!isVisible) {
          // Check available space
          const btnRect = btn.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const spaceBelow = viewportHeight - btnRect.bottom;
          const spaceAbove = btnRect.top;
          
          // If not enough space below (estimate 300px for menu), show above
          if (spaceBelow < 300 && spaceAbove > spaceBelow) {
            menu.style.top = "auto";
            menu.style.bottom = "100%";
            menu.style.marginTop = "0";
            menu.style.marginBottom = "4px";
          } else {
            menu.style.top = "100%";
            menu.style.bottom = "auto";
            menu.style.marginTop = "4px";
            menu.style.marginBottom = "0";
          }
          menu.style.display = "block";
        } else {
          menu.style.display = "none";
        }
      });
      
      wrapper.appendChild(btn);
      wrapper.appendChild(menu);
      
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
    function refreshInspectorDisplayFromState(state) {
      const elTpl = templateWrap.querySelector("#tpl_inspector_display");
      if (!elTpl) return;
      const inspector = (state && state.inspector) ? state.inspector : "";
      const area = (state && state.area) ? state.area : "";

      if (inspector && area) {
        elTpl.textContent = `${inspector} - මහජන සෞඛ්‍ය පරීක්ෂක  ${area}`;
      } else if (inspector) {
        elTpl.textContent = `${inspector} - මහජන සෞඛ්‍ය පරීක්ෂක`;
      } else if (area) {
        elTpl.textContent = `මහජන සෞඛ්‍ය පරීක්ෂක ${area}`;
      } else {
        elTpl.textContent = "";
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
          tplMonthDisplay.textContent = getSinhalaMonthName(monthInput.value);
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
            isHoliday: true
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

        return { day: i + 1, morning: morningVal, afternoon: afternoonVal, isHoliday: false };
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
    function markRowAsHoliday(row, holidayName) {
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
    // UPDATED: A4 scale changed from 0.83 to 1.0 (100%)
    function applySizeScale() {
      let scale = 1.0;

      if (sizeSel.value === "a4") {
        scale = 1.0;   // Changed from 0.83 to 1.0 - 100% scale
      } else {
        scale = 0.88;   // Legal default (visual)
      }

      templateWrap.style.transform = `scale(${scale})`;
      templateWrap.style.transformOrigin = "top left";
      templateWrap.style.width = (contentWpx / scale) + "px";
      templateWrap.style.minHeight = (contentHpx / scale) + "px";
    }
    sizeSel.addEventListener("change", applySizeScale);
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

      // iterate rows 1..31
      const rows = tbody.querySelectorAll("tr");
      rows.forEach((tr, idx) => {
        const day = idx + 1;
        const tdM = tr.children[1];
        const tdA = tr.children[2];

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
          // day is within month => ensure selects exist and are enabled (unless previously user-locked Sunday)
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

        // SUNDAY HANDLING
        if (sundaySet.has(day)) {
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
          // NOT SUNDAY - Add holiday selection on double click
          // Remove any previous dblclick handler to avoid duplicate bindings
          if (tr._ms_holiday_dbl_handler) {
            tr.removeEventListener("dblclick", tr._ms_holiday_dbl_handler);
            delete tr._ms_holiday_dbl_handler;
          }

          // Attach double-click handler for holiday selection
          const holidayDblHandler = function (ev) {
            ev.stopPropagation();

            // If already a holiday, remove holiday status
            if (tr.classList.contains("ms-holiday-row")) {
              unmarkRowAsHoliday(tr);
              return;
            }

            // Show holiday selection dialog
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
                markRowAsHoliday(tr, holidayName);
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
          if (!tdM.querySelector(".tpl-morning-role")) tdM.appendChild(createSelectCell("tpl-morning", tr.dataset.morningRole || "", tr.dataset.morningPlace || "", false));
          if (!tdA.querySelector(".tpl-afternoon-role")) tdA.appendChild(createSelectCell("tpl-afternoon", tr.dataset.afternoonRole || "", tr.dataset.afternoonPlace || "", false));
          tr.classList.remove("ms-sunday-row");
        }
      });
    }

    // Printing / PDF helpers (modified to accept sizeType)
    // --- updatePrintableCloneAndOpen and downloadPDFForWrapper are kept mostly same as earlier, but accept sizeType param.
    // js/reports/monthlySchedule.js - UPDATED: Fixed row heights for print/PDF

    // ... existing code above ...

    function updatePrintableCloneAndOpen(wrapper, monthValue, origTbody, sizeType) {
      const printable = wrapper.cloneNode(true);
      // ensure header month/year
      const tplMonth = printable.querySelector("#tpl_month_display");
      const tplYear = printable.querySelector("#tpl_year_display");
      if (tplMonth) tplMonth.textContent = getSinhalaMonthName(monthValue) || "";
      if (tplYear) {
        const p = (monthValue || "").split("-");
        tplYear.textContent = p[0] ? p[0].slice(2) : "";
      }

      const printableRows = printable.querySelectorAll("tbody tr");
      const origRows = origTbody.querySelectorAll("tr");

      printableRows.forEach((tr, i) => {
        const orig = origRows[i];
        if (!orig) return;

        // detect locked node(s)
        const origLockedNode = orig.querySelector(".ms-locked");
        const lockedText = origLockedNode && typeof origLockedNode.textContent === "string"
          ? origLockedNode.textContent.trim()
          : "";

        // is this the special default Sunday locked note?
        const isDefaultSunday = lockedText === "ඉරිදා දිනයකි";

        // Check if this is a holiday row
        const isHolidayRow = orig.classList.contains("ms-holiday-row");
        const holidayName = orig.dataset.holidayName || "";

        // determine whether this row is a "locked row" (uneditable) that should print as a single red rule.
        // We treat as locked row if:
        //  - it has a .ms-locked element (but not the default Sunday text), OR
        //  - dataset.monthLocked === "1" on the original row (older code sets this for days beyond month)
        const isLockedRow = (!isDefaultSunday && (origLockedNode !== null || orig.dataset && orig.dataset.monthLocked === "1"));

        // extract selections/datasets for normal rendering
        const origMorning = (function () {
          const mRole = (orig.querySelector(".tpl-morning-role") || { value: "" }).value || orig.dataset.morningRole || "";
          const mPlace = (orig.querySelector(".tpl-morning-place") || { value: "" }).value || orig.dataset.morningPlace || "";
          return (mRole || mPlace) ? { role: mRole, place: mPlace } : "";
        })();
        const origAfternoon = (function () {
          const aRole = (orig.querySelector(".tpl-afternoon-role") || { value: "" }).value || orig.dataset.afternoonRole || "";
          const aPlace = (orig.querySelector(".tpl-afternoon-place") || { value: "" }).value || orig.dataset.afternoonPlace || "";
          return (aRole || aPlace) ? { role: aRole, place: aPlace } : "";
        })();

        const morningText = escapeHtml(formatEntryForPrint(origMorning));
        const afternoonText = escapeHtml(formatEntryForPrint(origAfternoon));

        const tds = tr.querySelectorAll("td");
        if (tds && tds.length >= 3) {

          // always render the date (leftmost cell) as the numeric day from the original clone's first cell
          // Try to preserve the original date number text if present
          const originalDateText = (orig.querySelectorAll("td")[0] && orig.querySelectorAll("td")[0].textContent) ? orig.querySelectorAll("td")[0].textContent.trim() : (i + 1).toString();
          tds[0].innerHTML = `<div style="font-weight:700;color:#000;text-align:center;display:flex;align-items:center;justify-content:center;height:100%;">${escapeHtml(originalDateText)}</div>`;

          if (isHolidayRow && holidayName) {
            // Holiday row -> centered RED text across both columns
            const holidayHtml = `<div class="print-cell-content ms-holiday">${escapeHtml(holidayName)}</div>`;

            tds[1].innerHTML = holidayHtml;
            tds[2].innerHTML = holidayHtml;

          } else if (isDefaultSunday) {
            // Default Sunday -> centered RED text across both columns
            const sundayHtml = `<div class="print-cell-content ms-locked">ඉරිදා දිනයකි</div>`;

            tds[1].innerHTML = sundayHtml;
            tds[2].innerHTML = sundayHtml;

          } else if (isLockedRow) {
            // Locked row (non-Sunday) -> show a single red horizontal rule across the whole row
            const lineHtml = `<div class="print-cell-content" style="display:flex;align-items:center;justify-content:center;height:100%;"><div style="width:80%;height:2px;background:#b71c1c;border-radius:1px"></div></div>`;

            tds[1].innerHTML = lineHtml;
            tds[2].innerHTML = lineHtml;

          } else {
            // Normal (editable / user data) day -> render morning/afternoon values in bold blue (as before)
            tds[1].innerHTML = `<div class="print-cell-content user-input" style="font-weight:700 !important;color:#0b5cff !important;">${morningText}</div>`;
            tds[2].innerHTML = `<div class="print-cell-content user-input" style="font-weight:700 !important;color:#0b5cff !important;">${afternoonText}</div>`;
          }

        } else {
          // fallback: if structure differs (e.g., textareas), handle similarly for their parents
          const mta = tr.querySelector("textarea.tpl-morning");
          const ata = tr.querySelector("textarea.tpl-afternoon");

          if (isHolidayRow && holidayName) {
            const holidayHtml = `<div class="print-cell-content ms-holiday">${escapeHtml(holidayName)}</div>`;
            if (mta) mta.parentElement.innerHTML = holidayHtml;
            if (ata) ata.parentElement.innerHTML = holidayHtml;
          } else if (isDefaultSunday) {
            const sundayHtml = `<div class="print-cell-content ms-locked">ඉරිදා දිනයකි</div>`;
            if (mta) mta.parentElement.innerHTML = sundayHtml;
            if (ata) ata.parentElement.innerHTML = sundayHtml;
          } else if (isLockedRow) {
            const lineHtml = `<div class="print-cell-content" style="display:flex;align-items:center;justify-content:center;height:100%;"><div style="width:80%;height:2px;background:#b71c1c;border-radius:1px"></div></div>`;
            if (mta) mta.parentElement.innerHTML = lineHtml;
            if (ata) ata.parentElement.innerHTML = lineHtml;
          } else {
            if (mta) mta.parentElement.innerHTML = `<div class="print-cell-content user-input" style="font-weight:700 !important;color:#0b5cff !important;">${morningText}</div>`;
            if (ata) ata.parentElement.innerHTML = `<div class="print-cell-content user-input" style="font-weight:700 !important;color:#0b5cff !important;">${afternoonText}</div>`;
          }
        }
      });
      // copy footer content but ensure it won't be clipped or pushed off by scaling
      const origFooter = wrapper.querySelector(".footer-notes");
      if (origFooter) {
        const cloneFooter = printable.querySelector(".footer-notes");
        if (cloneFooter) {
          const v = origFooter.value || "";
          const parent = cloneFooter.parentElement || cloneFooter;
          parent.innerHTML = `
                  <span style="font-size:11px;display:block;margin-bottom:6px;">
                      වෙනත් කරුණු / குறிப்பு:
                  </span>
                  <div class="user-input" style="
                      white-space:pre-wrap;
                      word-break:break-word;
                      color:#0b5cff;
                      font-size:12px;
                      font-weight:700; /* NEW: Added bold */
                      padding:0;
                      margin-top:4px;
                      line-height:1.4;
                  ">
                      ${escapeHtml(v)}
                  </div>
              `;
        }
      }

      // Replace any remaining form controls (inputs/selects/textareas) inside printable
      (function replaceControlsWithText(root) {
        const controls = root.querySelectorAll("input, select, textarea");
        controls.forEach(ctrl => {
          // skip if already replaced
          if (ctrl.classList && ctrl.classList.contains("replaced-for-print")) return;
          const val = (ctrl.tagName.toLowerCase() === "select")
            ? (ctrl.options && ctrl.selectedIndex >= 0 ? (ctrl.options[ctrl.selectedIndex].text || ctrl.value) : ctrl.value)
            : (ctrl.value || "");
          const div = document.createElement("div");
          div.className = "user-input replaced-for-print print-cell-content";
          div.style.whiteSpace = "pre-wrap";
          div.style.wordBreak = "break-word";
          div.style.color = "#0b5cff"; // Pen-like blue color
          div.style.fontWeight = "700"; // NEW: Added bold
          div.style.fontSize = "15px";
          div.style.padding = "0";
          div.innerHTML = escapeHtml(val);
          ctrl.parentNode && ctrl.parentNode.replaceChild(div, ctrl);
        });
      })(printable);

      // remove any transform/scale on clone so it prints in full
      printable.style.transform = "none";
      printable.style.width = "100%";
      printable.style.minHeight = "auto";
      printable.style.boxSizing = "border-box";

      // prepare page CSS based on sizeType
      let pageCSS = "";
      if (sizeType === "a4") {
        pageCSS = "@page { size: A4 portrait; margin: 10mm; }";
      } else {
        pageCSS = "@page { size: Legal portrait; margin: 12pt; }";
      }

      // open new window and inject safe CSS that prevents clipping and enforces blue for user-input
      const w = window.open("", "_blank", "width=1000,height=800");
      w.document.write(`<html><head><title>Print - Monthly Schedule</title>
    <meta charset="utf-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala&display=swap');
      body{font-family:"Noto Sans Sinhala","Noto Sans",Arial,Helvetica,sans-serif;margin:0;padding:12px;color:#000}
      table{width:100%;border-collapse:collapse;table-layout:fixed}
      
      /* Table headers - consistent font size */
      th,td{
        padding:4px;
        border:1px solid #929292ff;
        vertical-align:middle;
        text-align:center;
        color:#000;
        font-size:15px !important; /* Uniform font size */
        height:25px;
        line-height:1.2;
      }
      
      th{
        background:#f6f6f6;
        font-size:15px !important;
        font-weight:600 !important;
      }
      
      tr { 
        height:25px;
        page-break-inside: avoid;
        break-inside: avoid;
        -webkit-column-break-inside: avoid;
      }
      
      .monthlySchedule-template { 
        transform:none !important; 
        width:100% !important; 
        min-height:auto !important; 
        margin:0; 
        padding:8px; 
        box-sizing:border-box; 
        overflow:visible !important; 
      }
      
      /* ensure user input text shows in bold blue with consistent font size */
      .monthlySchedule-template .user-input { 
        color:#0b5cff !important; 
        font-size:15px !important;
        font-weight:700 !important; /* NEW: Bold for user input */
      }
      
      /* Cell content styling for consistent height and centering */
      .print-cell-content {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        font-size: 15px !important; /* Consistent font size */
        line-height: 1.1;
        word-wrap: break-word;
        overflow: hidden;
        text-align: center;
        padding: 2px;
      }
      
      /* Sunday styling - consistent font size */
      .ms-holiday, .ms-locked {
        color: #b71c1c !important;
        font-weight: 700;
        background: #ffebee !important;
        font-size: 15px !important; /* Same font size as table headers */
      }
      
      .ms-locked {
        background: transparent !important;
      }
      
      /* make footer avoid page-breaks and ensure it prints fully */
      .monthlySchedule-template .user-input[style] { 
        page-break-inside: avoid; 
        -webkit-column-break-inside: avoid; 
        break-inside: avoid; 
      }
      
      table tbody tr { 
        page-break-inside: avoid; 
        break-inside: avoid; 
        -webkit-column-break-inside: avoid; 
      }
      
      ${pageCSS}
      
      @media print { 
        body{padding:6mm;} 
        th,td{
          height:25px !important;
          font-size:15px !important; /* Ensure font size in print */
        }
        tr{height:25px !important;}
        
        /* Force all text in table to same font size */
        table * {
          font-size:15px !important;
        }
        
        /* User input in bold blue for print */
        .print-cell-content.user-input {
          font-weight:700 !important;
          color:#0b5cff !important;
          font-size:15px !important;
        }
        
        .print-cell-content, .user-input, .ms-locked, .ms-holiday {
          font-size:15px !important;
        }
      }
    </style></head><body></body></html>`);
      w.document.body.appendChild(printable);

      // give the browser a moment
      setTimeout(() => {
        try { w.focus(); w.print(); } catch (e) { console.error(e); }
      }, 350);
    }

    // UPDATED: downloadPDFForWrapper function to download PDF directly based on selected format
    function downloadPDFForWrapper(wrapper, monthValue, origTbody, sizeType) {
      // Create a printable version
      const printableWrapper = wrapper.cloneNode(true);
      const tplMonth = printableWrapper.querySelector("#tpl_month_display");
      const tplYear = printableWrapper.querySelector("#tpl_year_display");
      if (tplMonth) tplMonth.textContent = getSinhalaMonthName(monthValue) || "";
      if (tplYear) {
        const p = (monthValue || "").split("-");
        tplYear.textContent = p[0] ? p[0].slice(2) : "";
      }

      const printableRows = printableWrapper.querySelectorAll("tbody tr");
      const origRows = origTbody.querySelectorAll("tr");

      printableRows.forEach((tr, i) => {
        const orig = origRows[i];
        if (!orig) return;

        // Check if this is a holiday row
        const isHolidayRow = orig.classList.contains("ms-holiday-row");
        const holidayName = orig.dataset.holidayName || "";

        // detect locked node(s)
        const origLockedNode = orig.querySelector(".ms-locked");
        const lockedText = origLockedNode && typeof origLockedNode.textContent === "string"
          ? origLockedNode.textContent.trim()
          : "";

        // is this the special default Sunday locked note?
        const isDefaultSunday = lockedText === "ඉරිදා දිනයකි";

        // determine whether this row is a "locked row" (uneditable) that should print as a single red rule.
        const isLockedRow = (!isDefaultSunday && (origLockedNode !== null || orig.dataset && orig.dataset.monthLocked === "1"));

        // extract selections/datasets for normal rendering
        const origMorning = (function () {
          const mRole = (orig.querySelector(".tpl-morning-role") || { value: "" }).value || orig.dataset.morningRole || "";
          const mPlace = (orig.querySelector(".tpl-morning-place") || { value: "" }).value || orig.dataset.morningPlace || "";
          return (mRole || mPlace) ? { role: mRole, place: mPlace } : "";
        })();
        const origAfternoon = (function () {
          const aRole = (orig.querySelector(".tpl-afternoon-role") || { value: "" }).value || orig.dataset.afternoonRole || "";
          const aPlace = (orig.querySelector(".tpl-afternoon-place") || { value: "" }).value || orig.dataset.afternoonPlace || "";
          return (aRole || aPlace) ? { role: aRole, place: aPlace } : "";
        })();

        const morningText = escapeHtml(formatEntryForPrint(origMorning));
        const afternoonText = escapeHtml(formatEntryForPrint(origAfternoon));

        const tds = tr.querySelectorAll("td");
        if (tds && tds.length >= 3) {

          // always render the date (leftmost cell) as the numeric day from the original clone's first cell
          const originalDateText = (orig.querySelectorAll("td")[0] && orig.querySelectorAll("td")[0].textContent) ? orig.querySelectorAll("td")[0].textContent.trim() : (i + 1).toString();
          tds[0].innerHTML = `<div style="font-weight:700;color:#000;text-align:center;display:flex;align-items:center;justify-content:center;height:100%;">${escapeHtml(originalDateText)}</div>`;

          if (isHolidayRow && holidayName) {
            // Holiday row -> centered RED text across both columns
            const holidayHtml = `<div class="print-cell-content ms-holiday">${escapeHtml(holidayName)}</div>`;

            tds[1].innerHTML = holidayHtml;
            tds[2].innerHTML = holidayHtml;

          } else if (isDefaultSunday) {
            // Default Sunday -> centered RED text across both columns
            const sundayHtml = `<div class="print-cell-content ms-locked">ඉරිදා දිනයකි</div>`;

            tds[1].innerHTML = sundayHtml;
            tds[2].innerHTML = sundayHtml;

          } else if (isLockedRow) {
            // Locked row (non-Sunday) -> show a single red horizontal rule across the whole row
            const lineHtml = `<div class="print-cell-content" style="display:flex;align-items:center;justify-content:center;height:100%;"><div style="width:80%;height:2px;background:#b71c1c;border-radius:1px"></div></div>`;

            tds[1].innerHTML = lineHtml;
            tds[2].innerHTML = lineHtml;

          } else {
            // Normal (editable / user data) day -> render morning/afternoon values in bold blue
            tds[1].innerHTML = `<div class="print-cell-content user-input" style="font-weight:700 !important;color:#0b5cff !important;">${morningText}</div>`;
            tds[2].innerHTML = `<div class="print-cell-content user-input" style="font-weight:700 !important;color:#0b5cff !important;">${afternoonText}</div>`;
          }
        }
      });

      const origFooter = wrapper.querySelector(".footer-notes");
      if (origFooter) {
        const cloneFooter = printableWrapper.querySelector(".footer-notes");
        if (cloneFooter) {
          const v = origFooter.value || "";
          const parent = cloneFooter.parentElement || cloneFooter;
          parent.innerHTML = `
            <span style="font-size:11px;display:block;margin-bottom:6px;">
                වෙනත් කරුණු / குறிப்பு:
            </span>
            <div class="user-input" style="
                white-space:pre-wrap;
                word-break:break-word;
                color:#0b5cff;
                font-size:12px;
                font-weight:700; /* NEW: Added bold */
                padding:0;
                margin-top:4px;
                line-height:1.4;
            ">
                ${escapeHtml(v)}
            </div>
          `;
        }
      }

      // Replace any remaining form controls inside printableWrapper
      (function replaceControlsWithText(root) {
        const controls = root.querySelectorAll("input, select, textarea");
        controls.forEach(ctrl => {
          if (ctrl.classList && ctrl.classList.contains("replaced-for-print")) return;
          const val = (ctrl.tagName.toLowerCase() === "select")
            ? (ctrl.options && ctrl.selectedIndex >= 0 ? (ctrl.options[ctrl.selectedIndex].text || ctrl.value) : ctrl.value)
            : (ctrl.value || "");
          const div = document.createElement("div");
          div.className = "user-input replaced-for-print print-cell-content";
          div.style.whiteSpace = "pre-wrap";
          div.style.wordBreak = "break-word";
          div.style.color = "#0b5cff"; // Pen-like blue color
          div.style.fontWeight = "700"; // NEW: Added bold
          div.style.fontSize = "15px";
          div.style.padding = "0";
          div.innerHTML = escapeHtml(val);
          ctrl.parentNode && ctrl.parentNode.replaceChild(div, ctrl);
        });
      })(printableWrapper);

      printableWrapper.style.transform = "none";
      printableWrapper.style.width = "100%";
      printableWrapper.style.minHeight = "auto";
      printableWrapper.style.boxSizing = "border-box";

      // Set page size based on selected format
      const pageSize = sizeType === "a4" ? "a4" : "legal";
      const margin = sizeType === "a4" ? "10mm" : "12pt";

      // Create filename based on month and format
      const fileName = `monthly_schedule_${monthValue || 'unspecified'}_${pageSize}.pdf`;

      // Use html2pdf to generate and download PDF
      const opt = {
        margin: [10, 10],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          // Ensure font rendering
          onclone: function (clonedDoc) {
            // Apply consistent font sizes to cloned document
            const allCells = clonedDoc.querySelectorAll('th, td, .print-cell-content, .user-input, .ms-locked, .ms-holiday');
            allCells.forEach(cell => {
              cell.style.fontSize = '15px';
              // Apply bold to user input cells
              if (cell.classList.contains('user-input')) {
                cell.style.fontWeight = '700';
                cell.style.color = '#0b5cff';
              }
            });
          }
        },
        jsPDF: { unit: 'mm', format: pageSize, orientation: 'portrait' }
      };

      // Check if html2pdf is available
      if (typeof html2pdf !== 'undefined') {
        html2pdf().set(opt).from(printableWrapper).save();
      } else {
        // Fallback: open in new window for printing if html2pdf not available
        showWarning("PDF download functionality requires html2pdf library. Opening print preview instead.");
        updatePrintableCloneAndOpen(wrapper, monthValue, origTbody, sizeType);
      }
    }

    // ... existing code below ...

    // assign print/pdf handlers
    printBtn.onclick = function () { updatePrintableCloneAndOpen(templateWrap, monthInput.value, tbody, sizeSel.value); };
    pdfBtn.onclick = function () { downloadPDFForWrapper(templateWrap, monthInput.value, tbody, sizeSel.value); };

  }; // end openMonthlyScheduleReport

})(); // end module
