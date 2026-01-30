import { DirectFirebaseService } from '../services/directFirebaseService.js';

// (function () {
//   "use strict";

// Add mobile responsive styles for Key Map
if (false) {
  const styleEl = document.createElement("style");
  styleEl.id = "phiKeyMap-mobile-styles";
  styleEl.innerHTML = `
      /* Key Map Mobile Responsive Styles */
      @media (max-width: 768px) {
        #kmSelect {
          font-size: 14px !important;
          padding: 10px !important;
          max-width: 100% !important;
        }
        
        #h510Btn {
          padding: 10px 14px !important;
          font-size: 14px !important;
          width: auto !important;
        }
        
        /* Table container improvements */
        .glass {
          padding: 10px !important;
        }
        
        /* Better table scrolling on mobile */
        div[style*="overflow-x:auto"] {
          border: 1px solid #e0e0e0 !important;
          border-radius: 8px !important;
          margin-bottom: 10px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
          max-width: 100% !important;
        }
        
        table {
          min-width: 600px !important;
          width: 100% !important;
          table-layout: fixed !important; 
          border-collapse: collapse !important;
        }
        
        table th,
        table td {
          font-size: 11px !important;
          padding: 6px 4px !important;
          vertical-align: top !important;
          word-wrap: break-word !important; 
        }
        
        /* First column (number) */
        table th:first-child,
        table td:first-child {
          width: 40px !important;
          min-width: 40px !important;
          padding: 6px 2px !important;
          text-align: center !important;
        }
        
        /* Main column */
        table th:nth-child(2),
        table td:nth-child(2) {
          min-width: 150px !important;
          width: 30% !important;
        }
        
        /* Sub Name column */
        table th:nth-child(3),
        table td:nth-child(3) {
          min-width: 150px !important;
          width: 30% !important;
        }
        
        /* Sub Code column */
        table th:nth-child(4),
        table td:nth-child(4) {
          min-width: 80px !important;
          width: 15% !important;
        }
        
        table td:nth-child(4) input {
          width: 100% !important;
        }
        
        /* Actions column */
        table th:nth-child(5),
        table td:nth-child(5) {
          min-width: 80px !important;
          width: 15% !important;
          padding: 6px 4px !important;
        }
        
        table td:nth-child(5) button {
          width: 100% !important;
          display: block !important;
        }
        
        /* Input and select fields in tables */
        table input {
          font-size: 11px !important;
          padding: 5px 4px !important;
          min-height: 28px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        table select {
          font-size: 11px !important;
          padding: 5px 4px !important;
          min-height: 28px !important;
          width: 100% !important;
        }
        
        table button {
          padding: 6px 8px !important;
          font-size: 11px !important;
          white-space: nowrap !important;
          min-height: 30px !important;
          width: 100% !important;
          display: block !important;
          box-sizing: border-box !important;
        }
        
        /* Add Sub button specific */
        button[onclick*="addSub"] {
          background: #28a745 !important;
          color: #fff !important;
          border: none !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          font-weight: 600 !important;
        }
        
        /* Dropdown selects in Fixed Dates table */
        .fd-role-cell,
        .fd-place-cell {
          min-width: 140px !important;
        }
        
        /* Improve dropdown visibility in table cells */
        td > div[style*="position:relative"] {
          min-width: 140px !important;
        }
        
        /* Better rowspan handling */
        td[rowspan] {
          vertical-align: top !important;
        }
        
        /* Add button in input row */
        input#roleMainInput,
        input#placeMainInput {
          font-size: 13px !important;
          padding: 8px !important;
        }
        
        /* Top add button */
        button[onclick*="addMain"] {
          font-size: 12px !important;
          padding: 8px 12px !important;
        }
      }
      
      @media (max-width: 480px) {
        table {
          min-width: 380px !important; 
        }
        
        table th,
        table td {
          font-size: 10px !important;
          padding: 4px 2px !important;
        }
        
        table th:first-child,
        table td:first-child {
          width: 30px !important;
          min-width: 30px !important;
        }
        
        /* Main column */
        table th:nth-child(2),
        table td:nth-child(2) {
          min-width: 110px !important;
          width: 30% !important;
        }
        
        /* Sub Name column */
        table th:nth-child(3),
        table td:nth-child(3) {
          min-width: 110px !important;
          width: 30% !important;
        }

        /* Sub Code column */
        table th:nth-child(4),
        table td:nth-child(4) {
          min-width: 60px !important;
          width: 15% !important;
        }
        
        table td:nth-child(4) input {
          width: 100% !important;
        }
        
        /* Actions column */
        table th:nth-child(5),
        table td:nth-child(5) {
          min-width: 70px !important;
          width: 18% !important;
        table td:nth-child(5) button {
          width: 100% !important;
          display: block !important;
        }
        
        table input {
          font-size: 10px !important;
          padding: 4px 3px !important;
          min-height: 26px !important;
        }
        
        table select {
          font-size: 10px !important;
          padding: 4px 3px !important;
          min-height: 26px !important;
        }
        
        table button {
          font-size: 10px !important;
          padding: 5px 4px !important;
          min-height: 28px !important;
          width: 100% !important;
        }
        
        button[onclick*="addSub"] {
          font-size: 9px !important;
          padding: 5px 3px !important;
        }
        
        .fd-role-cell,
        .fd-place-cell {
          min-width: 120px !important;
        }
        
        td > div[style*="position:relative"] {
          min-width: 120px !important;
        }
      }
    `;
  document.head.appendChild(styleEl);
}

// New responsive styles (v2) - Fix scrolling issues
if (!document.getElementById("phiKeyMap-mobile-styles-v2")) {
  const styleEl = document.createElement("style");
  styleEl.id = "phiKeyMap-mobile-styles-v2";
  styleEl.innerHTML = `
      @media (max-width: 768px) {
        #kmSelect {
          font-size: 14px !important;
          padding: 10px !important;
          max-width: 100% !important;
        }
        #h510Btn {
          padding: 10px 14px !important;
          font-size: 14px !important;
          width: auto !important;
        }
        
        /* Better scrolling container */
        div[style*="overflow-x:auto"] {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 10px;
          -webkit-overflow-scrolling: touch;
          display: block; 
          width: 100%;
          overflow-x: auto !important; /* Force auto */
        }

        /* Force scrollbars to be visible on mobile if possible, or just style them */
        div[style*="overflow-x:auto"]::-webkit-scrollbar {
          height: 8px;
          width: 8px;
          display: block; /* Force display */
          background: #f5f5f5;
        }
        
        div[style*="overflow-x:auto"]::-webkit-scrollbar-track {
          background: #f1f1f1; 
        }
        
        div[style*="overflow-x:auto"]::-webkit-scrollbar-thumb {
          background: #ccc; 
          border-radius: 4px;
        }
        
        div[style*="overflow-x:auto"]::-webkit-scrollbar-thumb:hover {
          background: #999; 
        }

        /* Table styles to ensure scrolling works */
        table {
          width: max-content !important; /* This forces the table to be as wide as its content */
          min-width: 100% !important;
          table-layout: auto !important;
        }
        
        table th, table td {
          padding: 8px 6px !important;
          font-size: 13px !important;
          vertical-align: middle !important;
          white-space: nowrap !important;
        }

        /* Make inputs/buttons touch-friendly */
        table input, table select, table button {
          min-height: 36px !important;
          font-size: 14px !important;
          padding: 4px !important;
        }
        
        /* Adjust specific columns if needed, but not rigidly */
        table th:first-child, table td:first-child {
          text-align: center !important;
          width: 40px !important;
        }
      }
    `;
  document.head.appendChild(styleEl);
}

/* ================= STORAGE ================= */
const ROLE_KEY = "phi_roles_tree_final";
const PLACE_KEY = "phi_places_tree_final";
const HOLIDAY_KEY = "phi_holidays_final";
const FIXED_DATES_KEY = "phi_fixed_dates_v1";

// Cache for Firestore Data
let cache = {
  [ROLE_KEY]: [],
  [PLACE_KEY]: [],
  [HOLIDAY_KEY]: [],
  [FIXED_DATES_KEY]: []
};

// Subscriptions
import { auth } from '../firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Subscriptions - Wrapped in Auth Listener
let roleUnsub, placeUnsub, holidayUnsub, fdUnsub;

function refreshActiveViewIfPossible() {
  // Try to re-render the current view if the user is looking at it
  // This is a simple heuristic: if the container exists and has logic attached
  if (document.getElementById('kmSelect')) {
    // Trigger change event to redraw active section
    const evt = new Event('change');
    document.getElementById('kmSelect').dispatchEvent(evt);

    // Also redraw fixed dates if they are visible
    if (document.getElementById('fdTableBody')) {
      if (typeof renderFixedDatesRows === 'function') renderFixedDatesRows();
    }
  }
}

const save = (k, v) => {
  // Update cache immediately for responsiveness
  cache[k] = v;

  // Map key to firebase path
  let path = '';
  if (k === ROLE_KEY) path = 'keymap_roles';
  else if (k === PLACE_KEY) path = 'keymap_places';
  else if (k === HOLIDAY_KEY) path = 'keymap_holidays';
  else if (k === FIXED_DATES_KEY) path = 'keymap_fixed_dates';

  if (path) DirectFirebaseService.save(path, v);
};

// Global Accessors
window.getKeyMapRoles = () => cache[ROLE_KEY] || [];
window.getKeyMapPlaces = () => cache[PLACE_KEY] || [];
window.getKeyMapHolidays = () => cache[HOLIDAY_KEY] || [];
window.getKeyMapFixedDates = () => cache[FIXED_DATES_KEY] || [];

function startSubscriptions() {
  if (roleUnsub) return; // already subscribed

  roleUnsub = DirectFirebaseService.subscribe('keymap_roles', d => {
    cache[ROLE_KEY] = d || [];
    refreshActiveViewIfPossible();
    window.dispatchEvent(new CustomEvent('keyMapRolesUpdated', { detail: cache[ROLE_KEY] }));
  });
  placeUnsub = DirectFirebaseService.subscribe('keymap_places', d => {
    cache[PLACE_KEY] = d || [];
    refreshActiveViewIfPossible();
    window.dispatchEvent(new CustomEvent('keyMapPlacesUpdated', { detail: cache[PLACE_KEY] }));
  });
  holidayUnsub = DirectFirebaseService.subscribe('keymap_holidays', d => {
    cache[HOLIDAY_KEY] = d || [];
    refreshActiveViewIfPossible();
  });
  fdUnsub = DirectFirebaseService.subscribe('keymap_fixed_dates', d => {
    cache[FIXED_DATES_KEY] = d || [];
    refreshActiveViewIfPossible();
  });
}

function stopSubscriptions() {
  if (roleUnsub) { roleUnsub(); roleUnsub = null; }
  if (placeUnsub) { placeUnsub(); placeUnsub = null; }
  if (holidayUnsub) { holidayUnsub(); holidayUnsub = null; }
  if (fdUnsub) { fdUnsub(); fdUnsub = null; }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    startSubscriptions();
  } else {
    stopSubscriptions();
    // clear cache optionally
    cache[ROLE_KEY] = [];
    cache[PLACE_KEY] = [];
    cache[HOLIDAY_KEY] = [];
    cache[FIXED_DATES_KEY] = [];
  }
});

let activeEdit = null; // {type,id,subIndex}

/* ================= HELPERS ================= */
const $ = id => document.getElementById(id);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// New Load/Save using Cache/Firebase
const load = k => cache[k] || [];

// (Removed duplicate save function)

const esc = t => { const d = document.createElement("div"); d.textContent = t; return d.innerHTML; };

/* ================= COLLAPSIBLE DROPDOWN SELECT HELPER ================= */
function createDropdownSelect(namePrefix, type, preservedValue, disabled) {
  // Generate unique ID to prevent duplicates
  const uniqueSuffix = Math.random().toString(36).substr(2, 9);
  const btnId = `${namePrefix}-${type}-btn-${uniqueSuffix}`;
  const menuId = `${namePrefix}-${type}-menu-${uniqueSuffix}`;

  const items = type === 'role' ? load(ROLE_KEY) : load(PLACE_KEY);
  const placeholderText = '-- තෝරන්න --';

  // Get display text for preserved value
  let displayText = placeholderText;
  if (preservedValue) {
    if (preservedValue.includes(':')) {
      const [mainId, subName] = preservedValue.split(':');
      const mainItem = items.find(x => String(x.id) === String(mainId));
      if (mainItem && mainItem.sub) {
        const subItem = mainItem.sub.find(s => {
          const sName = typeof s === 'object' ? s.name : s;
          return sName === subName;
        });
        if (subItem) {
          const subCode = typeof subItem === 'object' ? subItem.code : "";
          displayText = subCode ? `${subName} (${subCode})` : subName;
        }
      }
    } else {
      const mainItem = items.find(x => String(x.id) === String(preservedValue));
      if (mainItem) {
        displayText = mainItem.main || mainItem.id;
      }
    }
  }

  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:relative;flex:1;min-width:0;width:100%";
  wrapper.className = `${namePrefix}-${type}-wrapper`; // Add class for easy selection

  const btn = document.createElement("button");
  btn.id = btnId;
  btn.type = "button";
  btn.className = `${namePrefix}-${type}`;
  btn.style.cssText = `width:100%;padding:4px 8px;border:1px solid #d0d6db;border-radius:4px;
      background:${preservedValue ? '#e3f2fd' : '#fff'};
      color:${preservedValue ? '#000' : '#000'};
      text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;
      font-size:11px;min-height:28px;
      ${disabled ? 'opacity:0.6;cursor:not-allowed;background:#f5f5f5;pointer-events:none;' : ''}`;
  btn.disabled = disabled;
  btn.dataset.value = preservedValue || "";

  const textSpan = document.createElement("span");
  textSpan.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
  textSpan.textContent = displayText;

  const arrow = document.createElement("span");
  arrow.style.cssText = "margin-left:4px;color:#666;font-size:10px;transition:transform 0.2s;";
  arrow.textContent = "▼";

  btn.appendChild(textSpan);
  btn.appendChild(arrow);

  // Apply the correct background color based on whether there's a preserved value
  if (preservedValue && !disabled) {
    btn.style.backgroundColor = 'rgb(104, 216, 216)';
    btn.style.borderColor = '#000000ff';
  }

  // Create dropdown menu
  const menu = document.createElement("div");
  menu.id = menuId;
  menu.className = "ms-dropdown-menu";
  menu.dataset.triggerId = btnId;
  menu.style.cssText = `position:absolute;bottom:100%;left:0;width:100%;background:#eef6fc;
      border:1px solid #d0d6db;border-radius:4px;box-shadow:0 4px 8px rgba(0,0,0,0.15);
      max-height:300px;overflow-y:auto;z-index:9999;display:none;margin-bottom:2px;
      font-family: 'Noto Sans Sinhala', 'Noto Sans', Arial, sans-serif;
      font-size: 12px;`;

  let selectedValue = preservedValue || "";

  // Populate dropdown items
  items.forEach(item => {
    const mainText = item.main || item.id;
    const hasSub = item.sub && Array.isArray(item.sub) && item.sub.length > 0;

    const mainDiv = document.createElement("div");
    mainDiv.className = "dropdown-main-item";
    mainDiv.style.cssText = `padding:10px 12px;cursor:pointer;border-bottom:1px solid #e0e0e0;
        font-weight:600;color:#004085;display:flex;justify-content:space-between;align-items:center;
        transition:all 0.2s;background:#ffffff;`;

    const mainTextSpan = document.createElement("span");
    mainTextSpan.textContent = mainText;
    mainDiv.appendChild(mainTextSpan);

    if (hasSub) {
      const expandIcon = document.createElement("span");
      expandIcon.className = "expand-icon";
      expandIcon.style.cssText = "color:#353635;font-size:10px;transition:transform 0.2s;";
      expandIcon.textContent = "▶";
      mainDiv.appendChild(expandIcon);

      // Create sub-items container
      const subContainer = document.createElement("div");
      subContainer.className = "sub-items-container";
      subContainer.style.cssText = "display:none;background:#353635;border-left:4px solid #004085;";

      item.sub.forEach(subItem => {
        const subName = typeof subItem === 'object' ? subItem.name : subItem;
        const subCode = typeof subItem === 'object' ? subItem.code : "";
        const subText = subCode ? `${subName} (${subCode})` : subName;
        const subValue = `${item.id}:${subName}`;

        const subDiv = document.createElement("div");
        subDiv.className = "dropdown-sub-item";
        subDiv.style.cssText = `padding:8px 10px 8px 25px;cursor:pointer;border-bottom:1px solid #a9c5d8;
            transition:background 0.2s;color:#ffffff;font-weight:normal;`;
        subDiv.textContent = subText;

        subDiv.addEventListener("mouseenter", () => subDiv.style.background = "#2d3ed6");
        subDiv.addEventListener("mouseleave", () => subDiv.style.background = "transparent");
        subDiv.addEventListener("click", (e) => {
          e.stopPropagation();
          btn.dataset.value = subValue;
          textSpan.textContent = subText;
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
      mainDiv.addEventListener("mouseenter", () => mainDiv.style.background = "#cce5ff");
      mainDiv.addEventListener("mouseleave", () => mainDiv.style.background = "#ffffff");
      mainDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        const isExpanded = subContainer.style.display === "block";

        // Collapse all other sub-containers in this menu
        menu.querySelectorAll(".sub-items-container").forEach(container => {
          container.style.display = "none";
          const prev = container.previousElementSibling;
          if (prev) {
            const icon = prev.querySelector(".expand-icon");
            if (icon) icon.style.transform = "rotate(0deg)";
          }
        });

        if (!isExpanded) {
          subContainer.style.display = "block";
          expandIcon.style.transform = "rotate(90deg)";
          mainDiv.style.background = "#00c3ff";
        } else {
          subContainer.style.display = "none";
          expandIcon.style.transform = "rotate(0deg)";
          mainDiv.style.background = "#00c3ff";
        }
      });

      menu.appendChild(mainDiv);
      menu.appendChild(subContainer);
    } else {
      // No sub items
      mainDiv.addEventListener("mouseenter", () => mainDiv.style.background = "#cce5ff");
      mainDiv.addEventListener("mouseleave", () => mainDiv.style.background = "#ffffff");
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

    const isMobile = viewportWidth <= 768;

    if (isMobile) {
      menu.style.position = "fixed";
      menu.style.width = "90%";
      menu.style.left = "50%";
      menu.style.top = "50%";
      menu.style.transform = "translate(-50%, -50%)";
      menu.style.maxHeight = "60vh";
      menu.style.overflowY = "auto";
      menu.style.zIndex = "10000";
      menu.style.margin = "0";
      menu.style.bottom = "auto";
      menu.style.boxShadow = "0 0 0 1000px rgba(0,0,0,0.5)";
      return;
    }

    // Desktop Reset
    menu.style.transform = "none";
    menu.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const minSpaceNeeded = 250;

    const availableBelow = Math.max(0, spaceBelow - 10);
    const availableAbove = Math.max(0, spaceAbove - 10);
    const maxMenuHeight = 300;

    menu.style.position = "fixed";
    menu.style.width = Math.max(rect.width, 220) + "px";
    menu.style.maxHeight = maxMenuHeight + "px";
    menu.style.overflowY = "auto";
    menu.style.left = rect.left + "px";
    menu.style.zIndex = "10000";
    menu.style.margin = "0";

    const openUpward = availableAbove > availableBelow || spaceBelow < minSpaceNeeded;

    if (openUpward) {
      menu.style.bottom = (viewportHeight - rect.top + 2) + "px";
      menu.style.top = "auto";
      menu.style.maxHeight = Math.min(maxMenuHeight, availableAbove) + "px";
    } else {
      menu.style.top = (rect.bottom + 2) + "px";
      menu.style.bottom = "auto";
      menu.style.maxHeight = Math.min(maxMenuHeight, availableBelow) + "px";
    }

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

      // Close all other menus
      document.querySelectorAll('.ms-dropdown-menu').forEach(m => {
        if (m !== menu && m.style.display === "block") {
          m.style.display = "none";

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

      // Close all week dropdown menus (for role/place dropdowns)
      document.querySelectorAll('.week-dropdown-menu.active').forEach(m => {
        m.classList.remove('active');
        if (m._cleanup) m._cleanup();
        // Move back to container
        const parentContainer = document.querySelector(`[data-record-id="${m.dataset?.menuFor}"]`);
        if (parentContainer && m.parentElement === document.body) {
          parentContainer.appendChild(m);
        }
      });

      if (isOpen) {
        menu.style.display = "none";
        arrow.style.transform = "rotate(0deg)";
        if (menu.parentElement === document.body) {
          wrapper.appendChild(menu);
        }
        window.removeEventListener("scroll", scrollHandler, true);
        window.removeEventListener("resize", scrollHandler);

        updateButtonStyle();
      } else {
        document.body.appendChild(menu);
        menu.style.display = "block";
        arrow.style.transform = "rotate(180deg)";

        btn.style.backgroundColor = '#90ee90';
        btn.style.borderColor = '#006400';

        menu.offsetHeight;

        positionMenu();

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
          window.removeEventListener("scroll", scrollHandler, true);
          window.removeEventListener("resize", scrollHandler);
          menu.querySelectorAll(".sub-items-container").forEach(container => {
            container.style.display = "none";
            const icon = container.previousElementSibling?.querySelector(".expand-icon");
            if (icon) icon.style.transform = "rotate(0deg)";
          });

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
      btn.style.backgroundColor = 'rgb(92, 227, 245)';
      btn.style.color = '#000';
      btn.style.borderColor = '#000000ff';
    } else {
      btn.style.backgroundColor = '#9e9e9eff';
      btn.style.color = '#000';
      btn.style.borderColor = '#d0d6db';
    }
  };

  btn.addEventListener('change', updateButtonStyle);

  // Add getValue method to wrapper
  wrapper.getValue = () => btn.dataset.value;
  wrapper.setValue = (val) => {
    btn.dataset.value = val;
    if (!val) {
      textSpan.textContent = placeholderText;
      updateButtonStyle();
      return;
    }

    if (val.includes(':')) {
      const [mainId, subName] = val.split(':');
      const mainItem = items.find(x => String(x.id) === String(mainId));
      if (mainItem && mainItem.sub) {
        const subItem = mainItem.sub.find(s => {
          const sName = typeof s === 'object' ? s.name : s;
          return sName === subName;
        });
        if (subItem) {
          const subCode = typeof subItem === 'object' ? subItem.code : "";
          textSpan.textContent = subCode ? `${subName} (${subCode})` : subName;
        }
      }
    } else {
      const mainItem = items.find(x => String(x.id) === String(val));
      if (mainItem) {
        textSpan.textContent = mainItem.main || mainItem.id;
      }
    }
    updateButtonStyle();
  };

  return wrapper;
}

/* ================= DAY/TIME DROPDOWN HELPER ================= */
function createSimpleDropdown(namePrefix, type, preservedValue, disabled) {
  // type: 'day' or 'time'
  const uniqueSuffix = Math.random().toString(36).substr(2, 9);
  const btnId = `${namePrefix}-${type}-btn-${uniqueSuffix}`;
  const menuId = `${namePrefix}-${type}-menu-${uniqueSuffix}`;

  const dayOptions = [
    { value: 'monday', label: 'සදුදා' },
    { value: 'tuesday', label: 'අඟහරුවාදා' },
    { value: 'wednesday', label: 'බදාදා' },
    { value: 'thursday', label: 'බ්‍රහස්පතින්දා' },
    { value: 'friday', label: 'සිකුරාදා' },
    { value: 'saturday', label: 'සෙනසුරාදා' },
    { value: 'sunday', label: 'ඉරිදා' }
  ];

  const timeOptions = [
    { value: 'morning', label: 'පෙරවරු' },
    { value: 'afternoon', label: 'පස්වරු' },
    { value: 'full_day', label: 'දවසම' }
  ];

  const options = type === 'day' ? dayOptions : timeOptions;
  const placeholderText = '-- තෝරන්න --';

  let displayText = placeholderText;
  if (preservedValue) {
    const option = options.find(o => o.value === preservedValue);
    if (option) displayText = option.label;
  }

  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:relative;flex:1;min-width:0;width:100%";

  const btn = document.createElement("button");
  btn.id = btnId;
  btn.type = "button";
  btn.className = `${namePrefix}-${type}`;
  btn.style.cssText = `width:100%;padding:4px 8px;border:1px solid #d0d6db;border-radius:4px;
      background:${preservedValue ? '#e3f2fd' : '#fff'};
      color:#000;
      text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;
      font-size:11px;min-height:28px;
      ${disabled ? 'opacity:0.6;cursor:not-allowed;background:#f5f5f5;pointer-events:none;' : ''}`;
  btn.disabled = disabled;
  btn.dataset.value = preservedValue || "";

  const textSpan = document.createElement("span");
  textSpan.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
  textSpan.textContent = displayText;

  const arrow = document.createElement("span");
  arrow.style.cssText = "margin-left:4px;color:#666;font-size:10px;transition:transform 0.2s;";
  arrow.textContent = "▼";

  btn.appendChild(textSpan);
  btn.appendChild(arrow);

  if (preservedValue && !disabled) {
    btn.style.backgroundColor = 'rgb(104, 216, 216)';
    btn.style.borderColor = '#000000ff';
  }

  // Create dropdown menu
  const menu = document.createElement("div");
  menu.id = menuId;
  menu.className = "ms-dropdown-menu";
  menu.dataset.triggerId = btnId;
  menu.style.cssText = `position:absolute;bottom:100%;left:0;width:100%;background:#eef6fc;
      border:1px solid #d0d6db;border-radius:4px;box-shadow:0 4px 8px rgba(0,0,0,0.15);
      max-height:300px;overflow-y:auto;z-index:9999;display:none;margin-bottom:2px;
      font-family: 'Noto Sans Sinhala', 'Noto Sans', Arial, sans-serif;
      font-size: 12px;`;

  // Populate dropdown items
  options.forEach(option => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "dropdown-simple-item";
    itemDiv.style.cssText = `padding:10px 12px;cursor:pointer;border-bottom:1px solid #e0e0e0;
        font-weight:normal;color:#004085;transition:all 0.2s;background:#ffffff;`;
    itemDiv.textContent = option.label;
    itemDiv.dataset.value = option.value;

    itemDiv.addEventListener("mouseenter", () => itemDiv.style.background = "#cce5ff");
    itemDiv.addEventListener("mouseleave", () => itemDiv.style.background = "#ffffff");
    itemDiv.addEventListener("click", (e) => {
      e.stopPropagation();
      btn.dataset.value = option.value;
      textSpan.textContent = option.label;
      menu.style.display = "none";
      arrow.style.transform = "rotate(0deg)";

      if (menu.parentElement === document.body) {
        wrapper.appendChild(menu);
      }

      const event = new Event('change', { bubbles: true });
      btn.dispatchEvent(event);
    });

    menu.appendChild(itemDiv);
  });

  // Function to position the dropdown menu
  const positionMenu = () => {
    if (menu.style.display !== "block") return;

    const rect = btn.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const isMobile = viewportWidth <= 768;

    if (isMobile) {
      menu.style.position = "fixed";
      menu.style.width = "90%";
      menu.style.left = "50%";
      menu.style.top = "50%";
      menu.style.transform = "translate(-50%, -50%)";
      menu.style.maxHeight = "60vh";
      menu.style.overflowY = "auto";
      menu.style.zIndex = "10000";
      menu.style.margin = "0";
      menu.style.bottom = "auto";
      menu.style.boxShadow = "0 0 0 1000px rgba(0,0,0,0.5)";
      return;
    }

    // Desktop Reset
    menu.style.transform = "none";
    menu.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const minSpaceNeeded = 250;

    const availableBelow = Math.max(0, spaceBelow - 10);
    const availableAbove = Math.max(0, spaceAbove - 10);
    const maxMenuHeight = 300;

    menu.style.position = "fixed";
    menu.style.width = Math.max(rect.width, 220) + "px";
    menu.style.maxHeight = maxMenuHeight + "px";
    menu.style.overflowY = "auto";
    menu.style.left = rect.left + "px";
    menu.style.zIndex = "10000";
    menu.style.margin = "0";

    const openUpward = availableAbove > availableBelow || spaceBelow < minSpaceNeeded;

    if (openUpward) {
      menu.style.bottom = (viewportHeight - rect.top + 2) + "px";
      menu.style.top = "auto";
      menu.style.maxHeight = Math.min(maxMenuHeight, availableAbove) + "px";
    } else {
      menu.style.top = (rect.bottom + 2) + "px";
      menu.style.bottom = "auto";
      menu.style.maxHeight = Math.min(maxMenuHeight, availableBelow) + "px";
    }

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

      // Close all other menus
      document.querySelectorAll('.ms-dropdown-menu').forEach(m => {
        if (m !== menu && m.style.display === "block") {
          m.style.display = "none";

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

      // Close all week dropdown menus (for day/time dropdowns)
      document.querySelectorAll('.week-dropdown-menu.active').forEach(m => {
        m.classList.remove('active');
        if (m._cleanup) m._cleanup();
        // Move back to container
        const parentContainer = document.querySelector(`[data-record-id="${m.dataset?.menuFor}"]`);
        if (parentContainer && m.parentElement === document.body) {
          parentContainer.appendChild(m);
        }
      });

      if (isOpen) {
        menu.style.display = "none";
        arrow.style.transform = "rotate(0deg)";
        if (menu.parentElement === document.body) {
          wrapper.appendChild(menu);
        }
        window.removeEventListener("scroll", scrollHandler, true);
        window.removeEventListener("resize", scrollHandler);

        updateButtonStyle();
      } else {
        document.body.appendChild(menu);
        menu.style.display = "block";
        arrow.style.transform = "rotate(180deg)";

        btn.style.backgroundColor = '#90ee90';
        btn.style.borderColor = '#006400';

        menu.offsetHeight;
        positionMenu();

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
          window.removeEventListener("scroll", scrollHandler, true);
          window.removeEventListener("resize", scrollHandler);

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
      btn.style.backgroundColor = 'rgb(92, 227, 245)';
      btn.style.color = '#000';
      btn.style.borderColor = '#000000ff';
    } else {
      btn.style.backgroundColor = '#9e9e9eff';
      btn.style.color = '#000';
      btn.style.borderColor = '#d0d6db';
    }
  };

  btn.addEventListener('change', updateButtonStyle);

  // Add getValue method to wrapper
  wrapper.getValue = () => btn.dataset.value;
  wrapper.setValue = (val) => {
    btn.dataset.value = val;
    if (!val) {
      textSpan.textContent = placeholderText;
    } else {
      const option = options.find(o => o.value === val);
      if (option) textSpan.textContent = option.label;
    }
    updateButtonStyle();
  };

  return wrapper;
}

/* ================= CASCADING MENU HELPER ================= */
function createCascadingMenuButton(namePrefix, type, preservedValue, disabled) {
  const btnId = `${namePrefix}-${type}-btn`;
  const menuId = `${namePrefix}-${type}-menu`;

  const items = type === 'role' ? load(ROLE_KEY) : load(PLACE_KEY);
  const displayText = preservedValue ? getDisplayNameById(type, preservedValue) : `-- තෝරන්න --`;

  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:relative;flex:1;min-width:0";

  const btn = document.createElement("button");
  btn.id = btnId;
  btn.type = "button";
  btn.className = `${namePrefix}-${type}`;
  btn.style.cssText = `width:100%;padding:clamp(8px,2vw,10px) clamp(10px,2.5vw,14px);border:1px solid #ccc;border-radius:6px;background:#e0e0e0;
            font-size:clamp(11px,2.5vw,14px);color:#000;text-align:left;cursor:pointer;min-height:40px;
            display:flex;justify-content:space-between;align-items:center;transition:background 0.2s ease;
            ${disabled ? 'opacity:0.6;cursor:not-allowed;' : ''}`;
  btn.disabled = disabled;
  btn.dataset.value = preservedValue || "";

  const textSpan = document.createElement("span");
  textSpan.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1";
  textSpan.textContent = displayText;

  const arrow = document.createElement("span");
  arrow.style.cssText = "margin-left:4px;color:#6b7280;font-size:clamp(10px,2.2vw,12px)";
  arrow.textContent = "▼";

  btn.appendChild(textSpan);
  btn.appendChild(arrow);

  // Add hover effect
  if (!disabled) {
    btn.addEventListener("mouseenter", () => {
      btn.style.background = "#2196F3";
      btn.style.color = "#fff";
      arrow.style.color = "#fff";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.background = "#e0e0e0";
      btn.style.color = "#000";
      arrow.style.color = "#6b7280";
    });
  }

  // Create cascading menu
  const menu = document.createElement("div");
  menu.id = menuId;
  menu.style.cssText = `position:absolute;top:100%;left:0;min-width:220px;max-width:300px;
            background:#f5f5f5;border:1px solid #ccc;border-radius:8px;
            box-shadow:0 10px 30px rgba(0,0,0,0.3);z-index:99999;display:none;
            max-height:400px;margin-top:4px;overflow:visible`;

  // Add menu items
  items.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.style.cssText = `padding:clamp(10px,2.5vw,12px) clamp(12px,3vw,14px);cursor:pointer;display:flex;justify-content:space-between;
              align-items:center;border-bottom:1px solid #bfbfbf;transition:background 0.15s ease;position:relative;font-size:clamp(12px,2.8vw,14px);min-height:44px;`;
    itemDiv.dataset.value = item.id;

    const mainText = document.createElement("span");
    mainText.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap";
    mainText.textContent = item.main || item.id;
    itemDiv.appendChild(mainText);

    // Check if has sub items
    if (item.sub && item.sub.length > 0) {
      const indicator = document.createElement("span");
      indicator.style.cssText = "margin-left:8px;color:#666;font-size:clamp(12px,2.8vw,14px)";
      indicator.textContent = "▶";
      itemDiv.appendChild(indicator);

      // Create submenu
      const submenu = document.createElement("div");
      submenu.style.cssText = `position:absolute;left:100%;top:0;min-width:180px;
                background:#e8e8e8;border:1px solid #ccc;border-radius:8px;
                box-shadow:0 10px 30px rgba(0,0,0,0.3);display:none;
                max-height:400px;overflow-y:auto;z-index:100000`;

      const positionSubmenu = () => {
        submenu.style.display = "block";
        submenu.style.left = "100%";
        submenu.style.right = "auto";
        const rect = submenu.getBoundingClientRect();
        if (rect.right > window.innerWidth && rect.left > 0) {
          submenu.style.left = "auto";
          submenu.style.right = "100%";
        }
      };

      item.sub.forEach(subItem => {
        const subDiv = document.createElement("div");
        subDiv.style.cssText = "padding:clamp(10px,2.5vw,12px) clamp(12px,3vw,14px);cursor:pointer;border-bottom:1px solid #e5e7eb;transition:background 0.15s ease;font-size:clamp(11px,2.5vw,14px);min-height:40px;display:flex;align-items:center;";
        const subId = `${item.id}:${typeof subItem === 'object' ? subItem.name : subItem}`;
        subDiv.dataset.value = subId;

        const subName = typeof subItem === 'object' ? subItem.name : subItem;
        const subCode = typeof subItem === 'object' && subItem.code ? ` (${subItem.code})` : '';
        subDiv.textContent = subName + subCode;

        subDiv.addEventListener("mouseenter", () => {
          subDiv.style.background = "#2196F3";
          subDiv.style.color = "#fff";
        });
        subDiv.addEventListener("mouseleave", () => {
          subDiv.style.background = "transparent";
          subDiv.style.color = "#000";
        });
        subDiv.addEventListener("click", (e) => {
          e.stopPropagation();
          btn.dataset.value = subId;
          textSpan.textContent = subName;
          menu.style.display = "none";
          submenu.style.display = "none";
          btn.dispatchEvent(new Event('change', { bubbles: true }));
        });

        submenu.appendChild(subDiv);
      });

      itemDiv.appendChild(submenu);

      itemDiv.addEventListener("mouseenter", () => {
        itemDiv.style.background = "#2196F3";
        itemDiv.style.color = "#fff";
        const indicators = itemDiv.querySelectorAll('span');
        indicators.forEach(span => { if (span !== mainText) span.style.color = "#fff"; });
        positionSubmenu();
      });
      itemDiv.addEventListener("mouseleave", (e) => {
        setTimeout(() => {
          if (!submenu.matches(':hover')) {
            itemDiv.style.background = "transparent";
            itemDiv.style.color = "#000";
            const indicators = itemDiv.querySelectorAll('span');
            indicators.forEach(span => { if (span !== mainText) span.style.color = "#666"; });
            submenu.style.display = "none";
          }
        }, 100);
      });

      submenu.addEventListener("mouseenter", () => {
        submenu.style.display = "block";
        itemDiv.style.background = "#2196F3";
        itemDiv.style.color = "#fff";
        const indicators = itemDiv.querySelectorAll('span');
        indicators.forEach(span => { if (span !== mainText) span.style.color = "#fff"; });
      });
      submenu.addEventListener("mouseleave", () => {
        submenu.style.display = "none";
        itemDiv.style.background = "transparent";
        itemDiv.style.color = "#000";
        const indicators = itemDiv.querySelectorAll('span');
        indicators.forEach(span => { if (span !== mainText) span.style.color = "#666"; });
      });
    } else {
      // No submenu - click to select main item
      itemDiv.addEventListener("mouseenter", () => {
        itemDiv.style.background = "#2196F3";
        itemDiv.style.color = "#fff";
      });
      itemDiv.addEventListener("mouseleave", () => {
        itemDiv.style.background = "transparent";
        itemDiv.style.color = "#000";
      });
    }

    // Main item click
    itemDiv.addEventListener("click", (e) => {
      if (!item.sub || item.sub.length === 0) {
        btn.dataset.value = item.id;
        textSpan.textContent = item.main || item.id;
        menu.style.display = "none";
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
    document.querySelectorAll('[id$="-menu"]').forEach(m => m.style.display = "none");

    if (!isVisible) {
      menu.style.display = "block";
    } else {
      menu.style.display = "none";
    }
  });

  wrapper.appendChild(btn);
  wrapper.appendChild(menu);

  return wrapper;
}

function getDisplayNameById(type, id) {
  if (!id) return "";
  const arr = type === 'role' ? load(ROLE_KEY) : load(PLACE_KEY);
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
    return subName;
  }
  const r = arr.find(x => String(x.id) === String(id));
  return r ? (r.main || "") : "";
}

// Close menus when clicking outside
document.addEventListener("click", () => {
  document.querySelectorAll('[id$="-menu"]').forEach(m => m.style.display = "none");
});

/* ================= MAIN RENDER ================= */
window.renderPhiKeyMapTab = function (container) {
  if (typeof container === "string") container = $(container);

  container.innerHTML = `
      <div class="glass" style="padding:20px;padding:clamp(10px,3vw,20px);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:10px;">
          <h3 style="color:#0b5ea8;margin:0;font-size:clamp(16px,4vw,24px);">Key Map</h3>
          <button id="h510Btn" style="background:#0b5ea8;color:#fff;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-weight:600;">
            H 510
          </button>
        </div>

        <select id="kmSelect" style="padding:8px;margin-bottom:16px;width:100%;max-width:300px;font-size:14px;">
          <option value="role">රාජකාරිය</option>
          <option value="place">ස්ථානය</option>
          <option value="holiday">නිවාඩු</option>
          <option value="fixedDates">නියත දිනයන්</option>
        </select>

        <div id="kmBody"></div>
      </div>
    `;

  // H 510 button click handler - opens Monthly Schedule Editor
  $("h510Btn").addEventListener("click", () => {
    if (window.openReport) {
      window.openReport('මාසික ඉදිරි කාලසටහන');
      // Wait for the module to load, then open editor directly
      setTimeout(() => {
        if (window.openMonthlyScheduleEditor) {
          window.openMonthlyScheduleEditor();
        }
      }, 200);
    }
  });

  $("kmSelect").addEventListener("change", () => { activeEdit = null; renderSection(); });
  renderSection();
};

function renderSection() {
  const v = $("kmSelect").value;
  if (v === "role") renderMainSub("role", ROLE_KEY, "ප්‍රධාන රාජකාරිය");
  if (v === "place") renderMainSub("place", PLACE_KEY, "ප්‍රධාන ස්ථානය");
  if (v === "holiday") renderHoliday();
  if (v === "fixedDates") renderFixedDates();
}

/* ================= ROLE / PLACE ================= */
function renderMainSub(type, key, label) {
  const data = load(key);

  $("kmBody").innerHTML = `
      <div style="margin-bottom:16px;display:flex;flex-wrap:wrap;gap:8px;">
        <input id="${type}MainInput" placeholder="${label}"
               style="padding:8px;flex:1;min-width:200px;font-size:14px;">
        <button onclick="addMain('${type}')"
                style="background:#28a745;color:#fff;border:none;padding:8px 14px;border-radius:6px;min-height:40px;white-space:nowrap;">
          Add
        </button>
      </div>

      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch; background:#fff; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.1); width: 100%; padding-bottom: 5px;">
      <table style="width:100%;background:#fff;border-collapse:collapse;min-width:750px;font-size:clamp(11px, 2.5vw, 14px); white-space: nowrap;">
        <thead>
          <tr style="background:#0b5ea8;color:#fff;text-align:left;">
            <th style="padding:clamp(8px,1.5vw,12px); width:50px; white-space:nowrap;">No</th>
            <th style="padding:clamp(8px,1.5vw,12px); min-width:200px;">Main</th>
            <th style="padding:clamp(8px,1.5vw,12px); min-width:200px;">Sub Name</th>
            <th style="padding:clamp(8px,1.5vw,12px); width:120px; white-space:nowrap;">Sub Code</th>
            <th style="padding:clamp(8px,1.5vw,12px); width:120px; white-space:nowrap;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((r, i) => `
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:clamp(6px,1.5vw,10px);vertical-align:top" rowspan="${Math.max(r.sub.length + 1, 2)}">${i + 1}</td>

              <td style="padding:clamp(6px,1.5vw,10px);vertical-align:top" rowspan="${Math.max(r.sub.length + 1, 2)}">
                ${renderMainCell(type, key, r)}
              </td>

              ${r.sub.length > 0 ? `
                <td style="padding:clamp(6px,1.5vw,10px)">${renderSubName(type, r, 0)}</td>
                <td style="padding:clamp(6px,1.5vw,10px)">${renderSubCode(type, r, 0)}</td>
                <td style="padding:clamp(6px,1.5vw,10px)">${renderSubActions(type, r.id, 0)}</td>
              </tr>
              ${r.sub.slice(1).map((s, si) => `
                <tr style="border-bottom:1px solid #eee">
                  <td style="padding:clamp(6px,1.5vw,10px)">${renderSubName(type, r, si + 1)}</td>
                  <td style="padding:clamp(6px,1.5vw,10px)">${renderSubCode(type, r, si + 1)}</td>
                  <td style="padding:clamp(6px,1.5vw,10px)">${renderSubActions(type, r.id, si + 1)}</td>
                </tr>
              `).join("")}
              ` : `
                <td colspan="3" style="padding:clamp(6px,1.5vw,10px)">
                  <div style="color:#999;font-style:italic">No sub items</div>
                </td>
              </tr>
              `}
              <tr style="border-bottom:1px solid #eee; background-color: #f8f9fa;">
                <td style="padding:clamp(6px,1.5vw,10px)">
                  <input id="subName_${r.id}" placeholder="Sub name"
                         style="width:100%;padding:6px; border:1px solid #ddd; border-radius:4px;">
                </td>
                <td style="padding:clamp(6px,1.5vw,10px)">
                  <input id="subCode_${r.id}" placeholder="Code"
                         style="width:100%;padding:6px; border:1px solid #ddd; border-radius:4px;">
                </td>
                <td style="padding:clamp(6px,1.5vw,10px)">
                  <button onclick="addSub('${type}','${r.id}')"
                          style="background:#28a745;color:#fff;border:none;padding:6px 12px;border-radius:4px;width:100%; cursor:pointer;">
                    Add
                  </button>
                </td>
              </tr>
          `).join("")}
        </tbody>
      </table>
      </div>
    `;
}

function renderMainCell(type, key, r) {
  if (activeEdit && activeEdit.type === type && activeEdit.id === r.id && activeEdit.subIndex == null) {
    return `
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <input id="editMain_${r.id}" value="${esc(r.main)}"
                 style="flex:1;min-width:120px;padding:6px;border:1px solid #ddd;border-radius:4px;">
          <button onclick="saveMain('${type}','${r.id}')"
                  style="background:#28a745;color:#fff;border:none;padding:6px 10px;border-radius:4px;cursor:pointer;">Save</button>
          <button onclick="cancelEdit()"
                  style="background:#6c757d;color:#fff;border:none;padding:6px 10px;border-radius:4px;cursor:pointer;">Cancel</button>
        </div>
      `;
  }

  return `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <span ondblclick="editMainStart('${type}','${r.id}')"
             style="cursor:pointer;padding:4px;border-radius:4px;flex:1;"
             onmouseover="this.style.background='#f8f9fa'"
             onmouseout="this.style.background='transparent'">
          ${esc(r.main)}
        </span>
        <button onclick="deleteMain('${type}','${r.id}')"
                style="background:#dc3545;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:12px;">
          Delete
        </button>
      </div>
    `;
}

function renderSubName(type, r, si) {
  const s = r.sub[si];
  if (activeEdit && activeEdit.type === type && activeEdit.id === r.id && activeEdit.subIndex === si) {
    return `<input id="editSubName_${r.id}_${si}" value="${esc(s.name || s)}"
                     style="width:100%;padding:5px">`;
  }
  return `<div ondblclick="editSubStart('${type}','${r.id}',${si})"
                 style="cursor:pointer;padding:4px;border-radius:4px"
                 onmouseover="this.style.background='#f8f9fa'"
                 onmouseout="this.style.background='transparent'">
              ${esc(typeof s === 'object' ? s.name : s)}
            </div>`;
}

function renderSubCode(type, r, si) {
  const s = r.sub[si];
  if (activeEdit && activeEdit.type === type && activeEdit.id === r.id && activeEdit.subIndex === si) {
    return `<input id="editSubCode_${r.id}_${si}" value="${esc(typeof s === 'object' ? s.code || '' : '')}"
                     style="width:100%;padding:5px">`;
  }
  return `<div ondblclick="editSubStart('${type}','${r.id}',${si})"
                 style="cursor:pointer;padding:4px;border-radius:4px;color:#666;font-family:monospace"
                 onmouseover="this.style.background='#f8f9fa'"
                 onmouseout="this.style.background='transparent'">
              ${esc(typeof s === 'object' ? s.code || '' : '')}
            </div>`;
}

function renderSubActions(type, id, si) {
  if (activeEdit && activeEdit.type === type && activeEdit.id === id && activeEdit.subIndex === si) {
    return `
        <div style="display:flex;gap:4px">
          <button onclick="saveSub('${type}','${id}',${si})"
                  style="background:#28a745;color:#fff;border:none;padding:4px 8px;border-radius:4px;flex:1">Save</button>
          <button onclick="cancelEdit()"
                  style="background:#6c757d;color:#fff;border:none;padding:4px 8px;border-radius:4px;flex:1">Cancel</button>
        </div>
      `;
  }
  return `
      <button onclick="deleteSub('${type}','${id}',${si})"
              style="background:#dc3545;color:#fff;border:none;padding:4px 8px;border-radius:4px;width:100%">
        Delete
      </button>
    `;
}

/* ================= HOLIDAY ================= */
function renderHoliday() {
  const d = load(HOLIDAY_KEY);

  $("kmBody").innerHTML = `
      <div style="margin-bottom:16px;display:flex;flex-wrap:wrap;gap:8px;">
      <input id="holidayInput" placeholder="නිවාඩු නාමය"
             style="padding:8px;flex:1;min-width:200px;font-size:14px;">
      <button onclick="addHoliday()"
              style="background:#28a745;color:#fff;border:none;padding:8px 14px;border-radius:6px;min-height:40px;white-space:nowrap;">
        Add
      </button>
      </div>

      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
      <table style="width:100%;margin-top:16px;background:#fff;min-width:400px;">
        <tbody>
          ${d.map((h, i) => `
            <tr>
              <td style="padding:10px;width:60px">${i + 1}</td>
              <td style="padding:10px">
                ${activeEdit && activeEdit.id === h.id ? `
                  <input id="editHoliday_${h.id}" value="${esc(h.name)}">
                  <button onclick="saveHoliday('${h.id}')">Save</button>
                  <button onclick="cancelEdit()">Cancel</button>
                ` : `
                  <div ondblclick="editHolidayStart('${h.id}')">
                    ${esc(h.name)}
                    <button onclick="deleteHoliday('${h.id}')"
                            style="margin-left:8px;background:#dc3545;color:#fff;border:none;padding:4px 8px">
                      Delete
                    </button>
                  </div>
                `}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      </div>
    `;
}

/* ================= EDIT CONTROL ================= */
window.editMainStart = (type, id) => { activeEdit = { type, id, subIndex: null }; renderSection(); };
window.editSubStart = (type, id, si) => { activeEdit = { type, id, subIndex: si }; renderSection(); };
window.editHolidayStart = id => { activeEdit = { type: "holiday", id }; renderSection(); };
window.cancelEdit = () => { activeEdit = null; renderSection(); };

/* ================= CRUD ================= */
window.addMain = type => {
  const key = type === "role" ? ROLE_KEY : PLACE_KEY;
  const i = $(type + "MainInput");
  if (!i.value.trim()) return;
  const d = load(key);
  d.push({ id: uid(), main: i.value.trim(), sub: [] });
  save(key, d); renderSection();
};

window.saveMain = (type, id) => {
  const key = type === "role" ? ROLE_KEY : PLACE_KEY;
  const d = load(key);
  d.find(x => x.id === id).main = $(`editMain_${id}`).value.trim();
  save(key, d); activeEdit = null; renderSection();
};

window.deleteMain = (type, id) => {
  if (confirm("Delete main?")) {
    const key = type === "role" ? ROLE_KEY : PLACE_KEY;
    save(key, load(key).filter(x => x.id !== id));
    renderSection();
  }
};

window.addSub = (type, id) => {
  const key = type === "role" ? ROLE_KEY : PLACE_KEY;
  const iName = $(`subName_${id}`);
  const iCode = $(`subCode_${id}`);
  if (!iName.value.trim()) return;
  const d = load(key);
  d.find(x => x.id === id).sub.push({ name: iName.value.trim(), code: iCode.value.trim() });
  save(key, d); renderSection();
};

window.saveSub = (type, id, si) => {
  const key = type === "role" ? ROLE_KEY : PLACE_KEY;
  const d = load(key);
  const entry = d.find(x => x.id === id);
  const name = $(`editSubName_${id}_${si}`).value.trim();
  const code = $(`editSubCode_${id}_${si}`).value.trim();
  entry.sub[si] = { name: name, code: code };
  save(key, d); activeEdit = null; renderSection();
};

window.deleteSub = (type, id, si) => {
  const key = type === "role" ? ROLE_KEY : PLACE_KEY;
  const d = load(key);
  d.find(x => x.id === id).sub.splice(si, 1);
  save(key, d); renderSection();
};

window.addHoliday = () => {
  const i = $("holidayInput");
  if (!i.value.trim()) return;
  const d = load(HOLIDAY_KEY);
  d.push({ id: uid(), name: i.value.trim() });
  save(HOLIDAY_KEY, d); renderSection();
};

window.saveHoliday = id => {
  const d = load(HOLIDAY_KEY);
  d.find(x => x.id === id).name = $(`editHoliday_${id}`).value.trim();
  save(HOLIDAY_KEY, d); activeEdit = null; renderSection();
};

window.deleteHoliday = id => {
  if (confirm("Delete holiday?")) {
    save(HOLIDAY_KEY, load(HOLIDAY_KEY).filter(x => x.id !== id));
    renderSection();
  }
};

/* ================= WEEK MULTI-SELECT HELPER ================= */
function createWeekMultiSelect(recordId, selectedWeeks = [], disabled = false) {
  console.log(`Creating week multi-select for ${recordId}, selectedWeeks:`, selectedWeeks, `disabled:`, disabled);

  const container = document.createElement('div');
  container.className = 'week-multi-select';
  container.dataset.recordId = recordId;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'week-select-button';
  button.disabled = disabled;

  function updateButtonText() {
    const selected = getSelectedWeeks(recordId);
    console.log(`updateButtonText for ${recordId}, selected:`, selected);
    if (selected.length === 0) {
      button.textContent = 'සතිය තෝරන්න';
    } else if (selected.length === 5) {
      button.textContent = 'සියලු සති';
    } else {
      button.textContent = selected.map(w => `${w} වන`).join(', ');
    }
    console.log(`Button text set to: ${button.textContent}`);
  }

  const menu = document.createElement('div');
  menu.className = 'week-dropdown-menu';

  const weekOptions = [
    { value: '1', label: '1 වන සතිය' },
    { value: '2', label: '2 වන සතිය' },
    { value: '3', label: '3 වන සතිය' },
    { value: '4', label: '4 වන සතිය' },
    { value: '5', label: '5 වන සතිය' }
  ];

  weekOptions.forEach(opt => {
    const item = document.createElement('div');
    item.className = 'week-checkbox-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = opt.value;
    checkbox.checked = selectedWeeks.includes(opt.value);
    checkbox.dataset.recordId = recordId;
    checkbox.className = `week-checkbox-${recordId}`;

    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      updateButtonText();
    });

    const label = document.createElement('label');
    label.textContent = opt.label;
    label.style.cursor = 'pointer';
    label.style.userSelect = 'none';

    label.addEventListener('click', (e) => {
      e.stopPropagation();
      checkbox.checked = !checkbox.checked;
      updateButtonText();
    });

    item.appendChild(checkbox);
    item.appendChild(label);
    menu.appendChild(item);
  });

  // Position menu function
  const positionMenu = () => {
    if (!menu.classList.contains('active')) return;

    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const isMobile = viewportWidth <= 768;

    if (isMobile) {
      // Mobile: centered modal (handled by CSS)
      return;
    }

    // Desktop positioning
    menu.style.position = 'fixed';
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const minSpaceNeeded = 250;

    menu.style.width = Math.max(rect.width, 220) + "px";
    menu.style.left = rect.left + "px";
    menu.style.right = "auto";

    const openUpward = spaceAbove > spaceBelow || spaceBelow < minSpaceNeeded;

    if (openUpward) {
      menu.style.bottom = (viewportHeight - rect.top + 2) + "px";
      menu.style.top = "auto";
      menu.style.maxHeight = Math.min(300, spaceAbove - 10) + "px";
    } else {
      menu.style.top = (rect.bottom + 2) + "px";
      menu.style.bottom = "auto";
      menu.style.maxHeight = Math.min(300, spaceBelow - 10) + "px";
    }

    // Adjust if menu goes off screen horizontally
    setTimeout(() => {
      const menuRect = menu.getBoundingClientRect();
      if (menuRect.right > viewportWidth) {
        menu.style.left = Math.max(5, viewportWidth - menuRect.width - 5) + "px";
      }
      if (menuRect.left < 0) {
        menu.style.left = "5px";
      }
    }, 0);
  };

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!button.disabled) {
      const wasActive = menu.classList.contains('active');

      // Close all other week menus
      document.querySelectorAll('.week-dropdown-menu.active').forEach(m => {
        if (m !== menu) {
          m.classList.remove('active');
          // Move back to container
          const parentContainer = document.querySelector(`[data-record-id="${m.dataset?.menuFor}"]`);
          if (parentContainer && m.parentElement === document.body) {
            parentContainer.appendChild(m);
          }
        }
      });

      // Close all ms-dropdown-menu (role, place, day, time)
      document.querySelectorAll('.ms-dropdown-menu').forEach(m => {
        if (m.style.display === "block") {
          m.style.display = "none";

          // Reset button style
          if (m.dataset.triggerId) {
            const otherBtn = document.getElementById(m.dataset.triggerId);
            if (otherBtn) {
              const arrow = otherBtn.querySelector('span:last-child');
              if (arrow) arrow.style.transform = "rotate(0deg)";

              if (otherBtn.dataset.value) {
                otherBtn.style.backgroundColor = 'rgb(92, 227, 245)';
                otherBtn.style.borderColor = '#000000ff';
              } else {
                otherBtn.style.backgroundColor = '#9e9e9eff';
                otherBtn.style.borderColor = '#d0d6db';
              }
            }
          }

          // Move back to wrapper
          const wrapperParent = m.parentElement;
          if (wrapperParent === document.body) {
            // Find the wrapper by triggerId
            if (m.dataset.triggerId) {
              const btn = document.getElementById(m.dataset.triggerId);
              if (btn && btn.parentElement) {
                btn.parentElement.appendChild(m);
              }
            }
          }
        }
      });

      if (wasActive) {
        menu.classList.remove('active');
        if (menu._cleanup) menu._cleanup();
        // Move back to container
        if (menu.parentElement === document.body) {
          container.appendChild(menu);
        }
      } else {
        // Move to body to avoid container overflow
        if (menu.parentElement !== document.body) {
          document.body.appendChild(menu);
          menu.dataset.menuFor = recordId;
        }

        menu.classList.add('active');

        // Position after display and paint
        requestAnimationFrame(() => {
          positionMenu();
        });

        // Add scroll/resize handlers
        const scrollHandler = () => {
          requestAnimationFrame(() => positionMenu());
        };
        window.addEventListener('scroll', scrollHandler, true);
        window.addEventListener('resize', scrollHandler);

        menu._cleanup = () => {
          window.removeEventListener('scroll', scrollHandler, true);
          window.removeEventListener('resize', scrollHandler);
        };
      }
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && !menu.contains(e.target)) {
      if (menu.classList.contains('active')) {
        menu.classList.remove('active');
        if (menu._cleanup) menu._cleanup();
        // Move back to container
        if (menu.parentElement === document.body) {
          container.appendChild(menu);
        }
      }
    }
  });

  container.appendChild(button);
  container.appendChild(menu);

  // Initial button text update - use selectedWeeks parameter directly
  if (selectedWeeks.length === 0) {
    button.textContent = 'සතිය තෝරන්න';
  } else if (selectedWeeks.length === 5) {
    button.textContent = 'සියලු සති';
  } else {
    button.textContent = selectedWeeks.map(w => `${w} වන`).join(', ');
  }
  console.log(`Initial button text set to: ${button.textContent} for recordId: ${recordId}`);

  return container;
}

function getSelectedWeeks(recordId) {
  const checkboxes = document.querySelectorAll(`.week-checkbox-${recordId}:checked`);
  return Array.from(checkboxes).map(cb => cb.value);
}

/* ================= FIXED DATES ================= */
function renderFixedDates() {
  const roles = load(ROLE_KEY);
  const places = load(PLACE_KEY);
  const fixedDates = load(FIXED_DATES_KEY);

  $("kmBody").innerHTML = `
      <style>
        .week-multi-select {
          position: relative;
          display: inline-block;
          width: 100%;
        }
        .week-select-button {
          width: 100%;
          padding: 6px 30px 6px 8px;
          border: 1px solid #d0d6db;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          text-align: left;
          font-size: 13px;
          position: relative;
        }
        .week-select-button:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }
        .week-select-button::after {
          content: '▼';
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 10px;
        }
        .week-dropdown-menu {
          position: fixed;
          background: white;
          border: 1px solid #d0d6db;
          border-radius: 4px;
          z-index: 10000;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          display: none;
          max-height: 300px;
          overflow-y: auto;
        }
        .week-dropdown-menu.active {
          display: block;
        }
        @media (max-width: 768px) {
          .week-dropdown-menu.active {
            position: fixed !important;
            width: 90% !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            max-height: 60vh !important;
            box-shadow: 0 0 0 1000px rgba(0,0,0,0.5) !important;
          }
        }
        .week-checkbox-item {
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .week-checkbox-item:hover {
          background: #f0f7ff;
        }
        .week-checkbox-item input[type="checkbox"] {
          cursor: pointer;
        }
      </style>
      <h4 style="margin:0 0 12px 0; color: #0b5ea8;font-size:clamp(14px,3.5vw,18px);">රාජකාරි සදහා නියත දිනයන් ලබා දීම</h4>
      <div style="background:#fff;padding:clamp(8px,2vw,12px);border-radius:8px;overflow:visible;position:relative;">
        <div style="overflow-x:auto;overflow-y:visible;-webkit-overflow-scrolling:touch;width:100%;padding-bottom:5px;">
          <table style="width:100%;border-collapse:collapse;font-size:clamp(11px,2.5vw,13px); text-align: left;overflow:visible;min-width:900px; white-space:nowrap;">
            <thead style="overflow:visible;">
              <tr style="text-align:left; background: #f0f7ff;overflow:visible;">
                <th style="width:40px; padding:clamp(6px,1.5vw,8px);white-space:nowrap;">#</th>
                <th style="padding:clamp(6px,1.5vw,8px); min-width:200px;white-space:nowrap;">රාජකාරියේ නම</th>
                <th style="padding:clamp(6px,1.5vw,8px); min-width:200px;white-space:nowrap;">ස්ථානය</th>
                <th style="padding:clamp(6px,1.5vw,8px);white-space:nowrap;min-width:100px;">දවස</th>
                <th style="padding:clamp(6px,1.5vw,8px);white-space:nowrap;min-width:100px;">සතිය</th>
                <th style="padding:clamp(6px,1.5vw,8px);white-space:nowrap;min-width:100px;">වෙලාව</th>
                <th style="width:140px; padding:clamp(6px,1.5vw,8px);white-space:nowrap;">Actions</th>
              </tr>
            </thead>
            <tbody id="fdTableBody" style="overflow:visible;"></tbody>
          </table>
        </div>
      </div>
    `;

  renderFixedDatesRows();
  attachFixedDatesHandlers();
}

function renderFixedDatesRows() {
  const fixedDates = load(FIXED_DATES_KEY);
  const tbody = $("fdTableBody");
  if (!tbody) return;

  // Clear existing content
  tbody.innerHTML = "";

  // Render existing fixed dates
  fixedDates.forEach((fd, i) => {
    const tr = document.createElement("tr");
    tr.dataset.id = fd.id;
    tr.dataset.editMode = "false";
    tr.style.cssText = "position:relative;overflow:visible;";

    // Number column
    const tdNum = document.createElement("td");
    tdNum.style.cssText = "padding:8px";
    tdNum.textContent = i + 1;
    tr.appendChild(tdNum);

    // Role column with dropdown select
    const tdRole = document.createElement("td");
    tdRole.style.cssText = "padding:8px;";
    tdRole.className = "fd-role-cell";
    const roleSelect = createDropdownSelect(`fd-${fd.id}`, 'role', fd.roleId, true);
    tdRole.appendChild(roleSelect);
    tr.appendChild(tdRole);

    // Place column with dropdown select
    const tdPlace = document.createElement("td");
    tdPlace.style.cssText = "padding:8px;";
    tdPlace.className = "fd-place-cell";
    const placeSelect = createDropdownSelect(`fd-${fd.id}`, 'place', fd.placeId, true);
    tdPlace.appendChild(placeSelect);
    tr.appendChild(tdPlace);

    // Day column
    const tdDay = document.createElement("td");
    tdDay.style.cssText = "padding:8px";
    tdDay.className = "fd-day-cell";
    const dayDropdown = createSimpleDropdown(`fd-${fd.id}`, 'day', fd.day, true);
    tdDay.appendChild(dayDropdown);
    tr.appendChild(tdDay);

    // Week column with multi-select
    const tdWeek = document.createElement("td");
    tdWeek.style.cssText = "padding:8px";
    const weekMultiSelect = createWeekMultiSelect(fd.id, fd.weeks || [fd.week], true);
    tdWeek.appendChild(weekMultiSelect);
    tr.appendChild(tdWeek);

    // Time column
    const tdTime = document.createElement("td");
    tdTime.style.cssText = "padding:8px";
    tdTime.className = "fd-time-cell";
    const timeDropdown = createSimpleDropdown(`fd-${fd.id}`, 'time', fd.time, true);
    tdTime.appendChild(timeDropdown);
    tr.appendChild(tdTime);

    // Actions column
    const tdActions = document.createElement("td");
    tdActions.style.cssText = "padding:8px";
    const editBtn = document.createElement("button");
    editBtn.className = "fd_edit";
    editBtn.dataset.id = fd.id;
    editBtn.textContent = "Edit";
    editBtn.style.cssText = "margin-right:4px; padding:4px 8px; background:#1976d2; color:#fff; border:none; border-radius:4px; cursor:pointer;";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "fd_delete";
    deleteBtn.dataset.id = fd.id;
    deleteBtn.textContent = "Delete";
    deleteBtn.style.cssText = "padding:4px 8px; background:#dc3545; color:#fff; border:none; border-radius:4px; cursor:pointer;";

    tdActions.appendChild(editBtn);
    tdActions.appendChild(deleteBtn);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });

  // Add new row
  const newTr = document.createElement("tr");
  newTr.id = "fd_new_row";
  newTr.style.cssText = "background:#f8f9fa;position:relative;overflow:visible;";

  // Number column
  const newTdNum = document.createElement("td");
  newTdNum.style.cssText = "padding:8px; color: #666;";
  newTdNum.textContent = "New";
  newTr.appendChild(newTdNum);

  // Role column with dropdown select
  const newTdRole = document.createElement("td");
  newTdRole.style.cssText = "padding:8px;";
  newTdRole.id = "fd_new_role_cell";
  const newRoleSelect = createDropdownSelect('fd-new', 'role', '', false);
  newTdRole.appendChild(newRoleSelect);
  newTr.appendChild(newTdRole);

  // Place column with dropdown select
  const newTdPlace = document.createElement("td");
  newTdPlace.style.cssText = "padding:8px;";
  newTdPlace.id = "fd_new_place_cell";
  const newPlaceSelect = createDropdownSelect('fd-new', 'place', '', false);
  newTdPlace.appendChild(newPlaceSelect);
  newTr.appendChild(newTdPlace);

  // Day column
  const newTdDay = document.createElement("td");
  newTdDay.style.cssText = "padding:8px";
  newTdDay.id = "fd_new_day_cell";
  const newDayDropdown = createSimpleDropdown('fd-new', 'day', '', false);
  newTdDay.appendChild(newDayDropdown);
  newTr.appendChild(newTdDay);

  // Week column with multi-select
  const newTdWeek = document.createElement("td");
  newTdWeek.style.cssText = "padding:8px";
  const newWeekMultiSelect = createWeekMultiSelect('new', [], false);
  newTdWeek.appendChild(newWeekMultiSelect);
  newTr.appendChild(newTdWeek);

  // Time column
  const newTdTime = document.createElement("td");
  newTdTime.style.cssText = "padding:8px";
  newTdTime.id = "fd_new_time_cell";
  const newTimeDropdown = createSimpleDropdown('fd-new', 'time', '', false);
  newTdTime.appendChild(newTimeDropdown);
  newTr.appendChild(newTdTime);

  // Actions column
  const newTdActions = document.createElement("td");
  newTdActions.style.cssText = "padding:8px";
  const addBtn = document.createElement("button");
  addBtn.id = "fd_add";
  addBtn.textContent = "Add";
  addBtn.style.cssText = "padding:4px 12px; background: #28a745; color: white; border: none; border-radius: 4px; width:100%; cursor:pointer;";
  newTdActions.appendChild(addBtn);
  newTr.appendChild(newTdActions);

  tbody.appendChild(newTr);
}

function attachFixedDatesHandlers() {
  const addBtn = $("fd_add");
  const editButtons = document.querySelectorAll(".fd_edit");
  const deleteButtons = document.querySelectorAll(".fd_delete");

  // Add new fixed date
  if (addBtn) {
    addBtn.addEventListener("click", function () {
      console.log("=== Add Fixed Date Button Clicked ===");

      const roleCell = $("fd_new_role_cell");
      const placeCell = $("fd_new_place_cell");
      const dayCell = $("fd_new_day_cell");
      const timeCell = $("fd_new_time_cell");

      console.log("Cells found:", {
        roleCell: !!roleCell,
        placeCell: !!placeCell,
        dayCell: !!dayCell,
        timeCell: !!timeCell
      });

      const roleWrapper = roleCell ? roleCell.querySelector(".fd-new-role-wrapper") : null;
      const placeWrapper = placeCell ? placeCell.querySelector(".fd-new-place-wrapper") : null;
      const dayWrapper = dayCell ? dayCell.querySelector("div") : null;
      const timeWrapper = timeCell ? timeCell.querySelector("div") : null;

      console.log("Wrappers found:", {
        roleWrapper: !!roleWrapper,
        placeWrapper: !!placeWrapper,
        dayWrapper: !!dayWrapper,
        timeWrapper: !!timeWrapper
      });

      const roleId = roleWrapper ? roleWrapper.getValue() : "";
      const placeId = placeWrapper ? placeWrapper.getValue() : "";
      const day = dayWrapper ? dayWrapper.getValue() : "";
      const weeks = getSelectedWeeks('new');
      const time = timeWrapper ? timeWrapper.getValue() : "";

      console.log("Values extracted:", {
        roleId: roleId,
        placeId: placeId,
        day: day,
        weeks: weeks,
        time: time
      });

      // Validate: at least one of role OR place must be selected
      if (!roleId && !placeId) {
        console.log("Validation failed: No role or place selected");
        return window.showWarning ? showWarning("රාජකාරිය හෝ ස්ථානය අවම වශයෙන් එකක් තෝරන්න\nSelect at least role OR place") : alert("Select at least role OR place");
      }

      // Validate: day, week, and time are mandatory
      if (!day || weeks.length === 0 || !time) {
        return window.showWarning ? showWarning("දවස, සතිය සහ වෙලාව අනිවාර්‍යයි\nDay, week, and time are mandatory") : alert("Day, week, and time are mandatory");
      }

      const arr = load(FIXED_DATES_KEY);

      // Create single entry with multiple weeks
      arr.push({
        id: uid(),
        roleId: roleId,
        placeId: placeId,
        day: day,
        weeks: weeks,
        time: time
      });

      save(FIXED_DATES_KEY, arr);
      renderFixedDatesRows();
      attachFixedDatesHandlers();
      if (window.showSuccess) showSuccess("Fixed date added successfully!");
    });
  }

  // Edit fixed date
  editButtons.forEach(btn => {
    btn.addEventListener("click", function () {
      const id = this.dataset.id;
      const row = this.closest("tr");
      const isEditing = row.dataset.editMode === "true";

      if (isEditing) {
        // Save changes
        const roleCell = row.querySelector(".fd-role-cell");
        const placeCell = row.querySelector(".fd-place-cell");
        const dayCell = row.querySelector(".fd-day-cell");
        const timeCell = row.querySelector(".fd-time-cell");

        const roleWrapper = roleCell ? roleCell.querySelector(`.fd-${id}-role-wrapper`) : null;
        const placeWrapper = placeCell ? placeCell.querySelector(`.fd-${id}-place-wrapper`) : null;
        const dayWrapper = dayCell ? dayCell.querySelector("div") : null;
        const timeWrapper = timeCell ? timeCell.querySelector("div") : null;

        const roleId = roleWrapper ? roleWrapper.getValue() : "";
        const placeId = placeWrapper ? placeWrapper.getValue() : "";
        const day = dayWrapper ? dayWrapper.getValue() : "";
        const weeks = getSelectedWeeks(id);
        const time = timeWrapper ? timeWrapper.getValue() : "";

        // Validate: at least one of role OR place must be selected
        if (!roleId && !placeId) {
          return window.showWarning ? showWarning("රාජකාරිය හෝ ස්ථානය අවම වශයෙන් එකක් තෝරන්න\nSelect at least role OR place") : alert("Select at least role OR place");
        }

        // Validate: day, week, and time are mandatory
        if (!day || weeks.length === 0 || !time) {
          return window.showWarning ? showWarning("දවස, සතිය සහ වෙලාව අනිවාර්‍යයි\nDay, week, and time are mandatory") : alert("Day, week, and time are mandatory");
        }

        const arr = load(FIXED_DATES_KEY);
        const idx = arr.findIndex(x => String(x.id) === String(id));
        if (idx >= 0) {
          arr[idx] = {
            id: id,
            roleId: roleId,
            placeId: placeId,
            day: day,
            weeks: weeks,
            time: time
          };
          save(FIXED_DATES_KEY, arr);
          renderFixedDatesRows();
          attachFixedDatesHandlers();
          if (window.showSuccess) showSuccess("Fixed date updated!");
        }
      } else {
        // Enable editing mode
        row.dataset.editMode = "true";

        // Enable custom dropdowns for role and place
        const roleCell = row.querySelector(".fd-role-cell");
        const placeCell = row.querySelector(".fd-place-cell");
        const dayCell = row.querySelector(".fd-day-cell");
        const timeCell = row.querySelector(".fd-time-cell");

        if (roleCell) {
          const roleBtn = roleCell.querySelector("button");
          if (roleBtn) {
            roleBtn.disabled = false;
            roleBtn.style.opacity = "1";
            roleBtn.style.cursor = "pointer";
            roleBtn.style.background = "#fff";
          }
        }
        if (placeCell) {
          const placeBtn = placeCell.querySelector("button");
          if (placeBtn) {
            placeBtn.disabled = false;
            placeBtn.style.opacity = "1";
            placeBtn.style.cursor = "pointer";
            placeBtn.style.background = "#fff";
          }
        }
        if (dayCell) {
          const dayBtn = dayCell.querySelector("button");
          if (dayBtn) {
            dayBtn.disabled = false;
            dayBtn.style.opacity = "1";
            dayBtn.style.cursor = "pointer";
            dayBtn.style.background = "#fff";
          }
        }
        if (timeCell) {
          const timeBtn = timeCell.querySelector("button");
          if (timeBtn) {
            timeBtn.disabled = false;
            timeBtn.style.opacity = "1";
            timeBtn.style.cursor = "pointer";
            timeBtn.style.background = "#fff";
          }
        }

        // Enable week select
        const weekButton = row.querySelector('.week-select-button');
        if (weekButton) weekButton.disabled = false;

        this.textContent = "Save";
        this.style.background = "#28a745";
      }
    });
  });

  // Delete fixed date
  deleteButtons.forEach(btn => {
    btn.addEventListener("click", async function () {
      const id = this.dataset.id;
      const confirmDelete = window.showConfirm
        ? await showConfirm("මෙම නියත දිනය මකා දමන්නද?\nDelete this fixed date?")
        : confirm("Delete this fixed date?");

      if (!confirmDelete) return;

      const arr = load(FIXED_DATES_KEY).filter(x => String(x.id) !== String(id));
      save(FIXED_DATES_KEY, arr);
      renderFixedDatesRows();
      attachFixedDatesHandlers();
      if (window.showSuccess) showSuccess("Fixed date deleted!");
    });
  });
}


