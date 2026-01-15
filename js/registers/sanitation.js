// sanitation.js — updated: PHM/GN selects populated from PHI area data (phiAreaMap.js)
(function () {
  const STORAGE_KEY = "sanitationEntries_v2";

  const originalOpenCard = window.openCard?.bind(window) || function (t) {
    const content = document.getElementById("contentArea");
    content.innerHTML = `<h2>${t}</h2><p>${t} details will appear here.</p>`;
  };

  function formatDate(d) {
    if (!d) return "";
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function loadEntries() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveEntries(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function escapeHtml(s) {
    return (s + "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  }

  function extractYearFromISO(isoDate) {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    if (!isNaN(d)) return String(d.getFullYear());
    const parts = isoDate.split("-");
    if (parts.length >= 1) return parts[0];
    return "";
  }

  // Load GN Divisions and PHM Areas from PHI Profile (localStorage)
  const GNS_KEY = "phi_gns_v2";
  const PHM_KEY = "phi_phm_v1";

  function getPhiGNs() {
    try {
      return JSON.parse(localStorage.getItem(GNS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function getPhiPHMs() {
    try {
      return JSON.parse(localStorage.getItem(PHM_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function openSanitationRegister(title) {
    const content = document.getElementById("contentArea");
    content.innerHTML = `
      <style>
        #entriesWrapper table { min-width: 1800px; }
        
        /* Filter styles */
        .filters-container { 
          background: #f8f9fa; 
          padding: 16px; 
          border-radius: 8px; 
          margin-bottom: 16px;
        }
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }
        .filter-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .filter-field label {
          font-weight: 500;
          font-size: 13px;
          color: #333;
        }
        .filter-field input,
        .filter-field select {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid #d0d6db;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }
        
        @media (max-width: 768px) {
          #entriesWrapper { font-size: 13px; }
          #entriesWrapper th, #entriesWrapper td { padding: 4px !important; white-space: nowrap; }
          #entriesWrapper button { padding: 4px 8px; font-size: 12px; }
          .filters-grid { grid-template-columns: 1fr; }
        }
      </style>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <h2>${title}</h2>
        <button id="backToRegistersBtn" class="book-btn">Back</button>
      </div>

      <div class="glass" style="padding:18px;">
        <div class="tabs" style="margin-bottom:12px;">
          <button class="tab-btn active" data-tab="formTab">Add Entry</button>
          <button class="tab-btn" data-tab="listTab">View Records</button>
        </div>

        <div id="formTab" class="tab-content active">
          <form id="sanitationForm" autocomplete="off">

            <label for="chiefOccupant">Name of Chief Occupant</label>
            <input type="text" id="chiefOccupant" name="chiefOccupant" required>

            <label for="address">Address</label>
            <input type="text" id="address" name="address" required>

            <label for="phmArea">PHM Area</label>
            <select id="phmArea" name="phmArea">
              <option value="">-- Select PHM Area --</option>
            </select>

            <label for="gnDivision">GN Division (GN No)</label>
            <select id="gnDivision" name="gnDivision">
              <option value="">-- Select GN Division (GN No) --</option>
            </select>

            <label for="numInmates">No. of Inmates</label>
            <input type="number" id="numInmates" name="numInmates" min="0">

            <label for="numDisabled">No. of Disabled Persons</label>
            <input type="number" id="numDisabled" name="numDisabled" min="0">

            <label for="numElderly">No. of Elderly Persons (Over 60 years)</label>
            <input type="number" id="numElderly" name="numElderly" min="0">

            <label for="waterSupply">Water Supply</label>
            <select id="waterSupply" name="waterSupply">
              <option value="">-- Select --</option>
              <option value="Pipe Water">නල ජලය (Pipe Water)</option>
              <option value="Public Well">පොදු ළිඳ (Public Well)</option>
              <option value="Private Well">පෞද්ගලික ළිඳ (Private Well)</option>
              <option value="Protected Well">ආරක්‍ෂිත ළිඳ (Protected Well)</option>
              <option value="Tube Well">නල ළිඳ (Tube Well)</option>
              <option value="Rain Water Tank">වැසි ජල ටැංකිය (Rain Water Tank)</option>
              <option value="Other">වෙනත් (Other)</option>
            </select>

            <label for="latrineType">Latrine Type</label>
            <select id="latrineType" name="latrineType">
              <option value="">-- Select --</option>
              <option value="Pit Latrine">Pit Latrine</option>
              <option value="Pour-flush Toilet">Pour-flush Toilet</option>
              <option value="Water Closet (WC)">Water Closet (WC)</option>
              <option value="Community toilet / Shared latrine">Community toilet / Shared latrine</option>
              <option value="None">None</option>
            </select>

            <label for="latrineSanitary">Whether Sanitary</label>
            <select id="latrineSanitary" name="latrineSanitary">
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>

            <label for="latrineImprovementDate">Date of Improvement</label>
            <input type="date" id="latrineImprovementDate" name="latrineImprovementDate">

            <label for="solidWaste">Solid Waste Management</label>
            <select id="solidWaste" name="solidWaste">
              <option value="">-- Select --</option>
              <option value="Burning">Burning</option>
              <option value="Burying">Burying</option>
              <option value="Composting">Composting</option>
              <option value="Removal by Local Authority">Removal by Local Authority</option>
              <option value="Others">Others</option>
            </select>

            <label for="solidSanitary">Whether Method is Sanitary</label>
            <select id="solidSanitary" name="solidSanitary">
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>

            <label for="solidCorrectionDate">Date of Correction</label>
            <input type="date" id="solidCorrectionDate" name="solidCorrectionDate">

            <label for="liquidSanitary">Whether Liquid Waste Management Method Sanitary</label>
            <select id="liquidSanitary" name="liquidSanitary">
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>

            <label for="surveyDate">Date of Survey</label>
            <input type="date" id="surveyDate" name="surveyDate">

            <label for="remarks">Remarks</label>
            <textarea id="remarks" name="remarks"></textarea>

            <div class="button-row" style="margin-top:14px;">
              <button type="submit" id="saveBtn">Save</button>
              <button type="button" id="clearFormBtn">Clear</button>
            </div>
          </form>
        </div>

        <div id="listTab" class="tab-content">
          <!-- FILTERS -->
          <div class="filters-container">
            <div class="filters-grid">
              <div class="filter-field">
                <label>Search Name or Address</label>
                <input type="text" id="searchInput" placeholder="Type to search...">
              </div>

              <div class="filter-field">
                <label>PHM Area</label>
                <select id="filterPhm">
                  <option value="">All PHM Areas</option>
                </select>
              </div>

              <div class="filter-field">
                <label>GN Division</label>
                <select id="filterGn">
                  <option value="">All GN Divisions</option>
                </select>
              </div>

              <div class="filter-field">
                <label>Year</label>
                <select id="filterYear">
                  <option value="">All Years</option>
                </select>
              </div>

              <div class="filter-field">
                <label>Water Supply</label>
                <select id="filterWater">
                  <option value="">All Water Supply</option>
                </select>
              </div>

              <div class="filter-field">
                <label>Latrine Type</label>
                <select id="filterLatrine">
                  <option value="">All Latrine Types</option>
                </select>
              </div>

              <div class="filter-field">
                <label>Solid Waste Method</label>
                <select id="filterSolid">
                  <option value="">All Solid Waste Methods</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Totals row -->
          <div id="totalsRow" style="margin-bottom:8px;display:flex;gap:18px;align-items:center;flex-wrap:wrap;">
            <div style="font-weight:700">Totals:</div>
            <div id="totalInmates">Inmates: 0</div>
            <div id="totalDisabled">Disabled: 0</div>
            <div id="totalElderly">Elderly (60+): 0</div>
          </div>

          <!-- Top scrollbar holder -->
          <div id="topScroll" style="overflow:auto;overflow-y:hidden;height:16px;margin-bottom:4px;">
            <div id="topScrollInner" style="height:1px;width:0;"></div>
          </div>

          <div id="entriesWrapper" style="overflow:auto;"></div>
        </div>
      </div>
    `;

    // --- Wire tabs ---
    content.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        content.querySelectorAll(".tab-btn").forEach((x) => x.classList.remove("active"));
        content.querySelectorAll(".tab-content").forEach((t) => t.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(btn.dataset.tab).classList.add("active");
        if (btn.dataset.tab === "listTab") {
          populateFilters();
          renderTable();
        } else if (btn.dataset.tab === "formTab") {
          populateFormSelects(); // ensure selects are up-to-date when showing form
        }
      });
    });

    document.getElementById("backToRegistersBtn").addEventListener("click", () => {
      if (typeof window.showContent === "function") window.showContent("Registers", null);
    });

    // --- Populate form selects from PHI data ---
    function populateFormSelects() {
      const phmSel = document.getElementById("phmArea");
      const gnSel = document.getElementById("gnDivision");

      // Keep currently selected values if any
      const curPhm = phmSel.value || "";
      const curGn = gnSel.value || "";

      // PHMs: display areaName; value = areaName (string)
      const phms = getPhiPHMs();
      if (phmSel) {
        phmSel.innerHTML = `<option value="">-- Select PHM Area --</option>` +
          phms.map(p => `<option value="${escapeHtml(p.areaName||"")}">${escapeHtml(p.areaName||"")}${p.phmName ? ' — '+escapeHtml(p.phmName) : ''}</option>`).join("");
        if (curPhm) phmSel.value = curPhm;
      }

      // GNs: value should be GN No (g.no) and show "GNNo - GNName"
      const gns = getPhiGNs();
      if (gnSel) {
        gnSel.innerHTML = `<option value="">-- Select GN Division (GN No) --</option>` +
          gns.map(g => `<option value="${escapeHtml(g.no||"")}">${escapeHtml(g.no||"")}${g.name ? ' - '+escapeHtml(g.name) : ''}</option>`).join("");
        if (curGn) gnSel.value = curGn;
      }
    }

    // form submit
    const form = document.getElementById("sanitationForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {};
      [...form.elements].forEach((el) => {
        if (el.name) data[el.name] = el.value || "";
      });
      ["latrineImprovementDate", "solidCorrectionDate", "surveyDate"].forEach((k) => {
        if (data[k]) data[k] = formatDate(data[k]);
      });

      const list = loadEntries();
      const idx = form.getAttribute("data-edit-index");
      if (idx !== null && idx !== "") list[Number(idx)] = data;
      else list.unshift(data);
      saveEntries(list);

      form.reset();
      form.removeAttribute("data-edit-index");
      // repopulate selects (in case new PHM/GN were added elsewhere)
      populateFormSelects();
      document.querySelector('.tab-btn[data-tab="listTab"]').click();
      populateFilters();
      renderTable();
    });

    document.getElementById("clearFormBtn").addEventListener("click", () => {
      form.reset();
      form.removeAttribute("data-edit-index");
    });

    // filters & events
    const searchInput = document.getElementById("searchInput");
    const fPhm = document.getElementById("filterPhm");
    const fGn = document.getElementById("filterGn");
    const fWater = document.getElementById("filterWater");
    const fLatrine = document.getElementById("filterLatrine");
    const fSolid = document.getElementById("filterSolid");
    const fYear = document.getElementById("filterYear");

    [searchInput, fPhm, fGn, fWater, fLatrine, fSolid, fYear].forEach((el) => {
      el.addEventListener("change", () => renderTable());
      el.addEventListener("input", () => renderTable());
    });

    // populate filters from data (merge with PHI area data)
    function populateFilters() {
      const data = loadEntries();
      const unique = (arr) => Array.from(new Set(arr.filter(Boolean))).sort();

      // base lists from entries
      const phmListFromEntries = unique(data.map(d => d.phmArea));
      const gnListFromEntries = unique(data.map(d => d.gnDivision));

      // lists from PHI data
      const phms = getPhiPHMs().map(p => p.areaName).filter(Boolean);
      const gns = getPhiGNs().map(g => g.no).filter(Boolean);

      // merge, preserving PHI data first (so choices show PHI canonical values)
      const phmList = unique(phms.concat(phmListFromEntries));
      const gnList = unique(gns.concat(gnListFromEntries));

      const waterList = unique(data.map(d => d.waterSupply));
      const latrineList = unique(data.map(d => d.latrineType));
      const solidList = unique(data.map(d => d.solidWaste));
      const yearList = unique(data.map(d => extractYearFromISO(d.surveyDate)).filter(Boolean));

      function fill(selectEl, items, defaultLabel) {
        if (!selectEl) return;
        const cur = selectEl.value;
        selectEl.innerHTML = `<option value="">${defaultLabel}</option>` + items.map(i => `<option value="${escapeHtml(i)}">${escapeHtml(i)}</option>`).join("");
        if (cur) selectEl.value = cur;
      }

      fill(fPhm, phmList, "All PHM Areas");
      fill(fGn, gnList, "All GN Divisions");
      fill(fWater, waterList, "All Water Supply");
      fill(fLatrine, latrineList, "All Latrine Types");
      fill(fSolid, solidList, "All Solid Waste Methods");
      fill(fYear, yearList, "All Years");
    }

    function getFilteredEntries() {
      const data = loadEntries();
      const q = (searchInput.value || "").toLowerCase().trim();
      const phm = fPhm.value || "";
      const gn = fGn.value || "";
      const water = fWater.value || "";
      const latrine = fLatrine.value || "";
      const solid = fSolid.value || "";
      const year = fYear.value || "";

      return data.filter((d) => {
        if (q) {
          const hay = ((d.chiefOccupant||"") + " " + (d.address||"")).toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (phm && (d.phmArea || "") !== phm) return false;
        if (gn && (d.gnDivision || "") !== gn) return false;
        if (water && (d.waterSupply || "") !== water) return false;
        if (latrine && (d.latrineType || "") !== latrine) return false;
        if (solid && (d.solidWaste || "") !== solid) return false;
        if (year) {
          const y = extractYearFromISO(d.surveyDate);
          if (y !== year) return false;
        }
        return true;
      });
    }

    // render table with top scrollbar and totals
    function renderTable() {
      const container = document.getElementById("entriesWrapper");
      const entries = getFilteredEntries();

      // update totals
      const totals = { inmates: 0, disabled: 0, elderly: 0 };
      entries.forEach(e => {
        const a = parseInt(e.numInmates) || 0;
        const b = parseInt(e.numDisabled) || 0;
        const c = parseInt(e.numElderly) || 0;
        totals.inmates += a;
        totals.disabled += b;
        totals.elderly += c;
      });
      document.getElementById("totalInmates").textContent = `Inmates: ${totals.inmates}`;
      document.getElementById("totalDisabled").textContent = `Disabled: ${totals.disabled}`;
      document.getElementById("totalElderly").textContent = `Elderly (60+): ${totals.elderly}`;

      if (!entries.length) {
        container.innerHTML = `<div class="glass" style="padding:18px;text-align:center;">No entries found.</div>`;
        const tsi = document.getElementById("topScrollInner");
        if (tsi) tsi.style.width = "0px";
        return;
      }

      const headerCols = [
        "S/N","Name of Chief Occupant","Address","PHM Area","GN Division",
        "No. of Inmates","No. of Disabled","No. of Elderly (60+)","Water Supply",
        "Latrine Type","Latrine Sanitary","Date of Improvement",
        "Solid Waste Management","Solid Sanitary","Date of Correction",
        "Liquid Waste Sanitary","Date of Survey","Remarks","Actions"
      ];

      let html = `<div style="display:inline-block;min-width:100%;"><table style="width:100%;border-collapse:collapse;"><thead><tr>${headerCols.map(h => `<th style="padding:8px;border:1px solid #eee">${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>`;
      entries.forEach((e, idx) => {
        const sn = idx + 1;
        html += `<tr data-index="${idx}">
          <td style="text-align:center;padding:6px;border:1px solid #eee">${sn}</td>
          <td style="padding:6px;border:1px solid #eee">${escapeHtml(e.chiefOccupant||"")}</td>
          <td style="padding:6px;border:1px solid #eee">${escapeHtml(e.address||"")}</td>
          <td style="padding:6px;border:1px solid #eee">${escapeHtml(e.phmArea||"")}</td>
          <td style="padding:6px;border:1px solid #eee">${escapeHtml(e.gnDivision||"")}</td>
          <td style="text-align:center;padding:6px;border:1px solid #eee">${escapeHtml(e.numInmates||"")}</td>
          <td style="text-align:center;padding:6px;border:1px solid #eee">${escapeHtml(e.numDisabled||"")}</td>
          <td style="text-align:center;padding:6px;border:1px solid #eee">${escapeHtml(e.numElderly||"")}</td>
          <td style="padding:6px;border:1px solid #eee">${escapeHtml(e.waterSupply||"")}</td>
          <td style="padding:6px;border:1px solid #eee">${escapeHtml(e.latrineType||"")}</td>
          <td style="padding:6px;border:1px solid #eee">${escapeHtml(e.latrineSanitary||"")}</td>
          <td style="padding:6px;border:1px solid #eee">${escapeHtml(e.latrineImprovementDate||"")}</td>
          <td style="padding:6px;border:1px solid #eee">${escapeHtml(e.solidWaste||"")}</td>
          <td style="padding:6px;border:1px solid #eee">${escapeHtml(e.solidSanitary||"")}</td>
          <td style="padding:6px;border:1px solid #eee">${escapeHtml(e.solidCorrectionDate||"")}</td>
          <td style="padding:6px;border:1px solid #eee">${escapeHtml(e.liquidSanitary||"")}</td>
          <td style="padding:6px;border:1px solid #eee">${escapeHtml(e.surveyDate||"")}</td>
          <td style="padding:6px;border:1px solid #eee">${escapeHtml(e.remarks||"")}</td>
          <td style="padding:6px;border:1px solid #eee">
            <button class="editBtn" data-i="${idx}">Edit</button>
            <button class="delBtn" data-i="${idx}">Delete</button>
          </td>
        </tr>`;
      });
      html += `</tbody></table></div>`;

      container.innerHTML = html;

      // Now wire top scrollbar sizing & sync
      setTimeout(() => {
        const topScroll = document.getElementById("topScroll");
        const topInner = document.getElementById("topScrollInner");
        const wrapper = document.getElementById("entriesWrapper");
        const tableEl = wrapper ? wrapper.querySelector("table") : null;

        if (!topScroll || !topInner || !wrapper) return;

        const scrollWidth = tableEl ? tableEl.scrollWidth : wrapper.scrollWidth;
        topInner.style.width = scrollWidth + "px";

        let syncingFromTop = false;
        let syncingFromBottom = false;

        // Use onscroll assignments so we don't accumulate listeners across re-renders
        topScroll.onscroll = function () {
          if (syncingFromBottom) return;
          syncingFromTop = true;
          wrapper.scrollLeft = topScroll.scrollLeft;
          syncingFromTop = false;
        };

        wrapper.onscroll = function () {
          if (syncingFromTop) return;
          syncingFromBottom = true;
          topScroll.scrollLeft = wrapper.scrollLeft;
          syncingFromBottom = false;
        };

        // Initial sync
        topScroll.scrollLeft = wrapper.scrollLeft;
      }, 0);

      // delete & edit handlers
      container.querySelectorAll(".delBtn").forEach((b) => {
        b.addEventListener("click", async () => {
          const i = Number(b.dataset.i);
          const saved = loadEntries();
          if (i < 0 || i >= saved.length) return;
          if (!await showConfirm("Delete this record?")) return;
          saved.splice(i, 1);
          saveEntries(saved);
          populateFilters();
          renderTable();
        });
      });

      container.querySelectorAll(".editBtn").forEach((b) => {
        b.addEventListener("click", () => {
          const i = Number(b.dataset.i);
          const saved = loadEntries();
          if (i < 0 || i >= saved.length) return;
          const f = document.getElementById("sanitationForm");
          const item = saved[i];
          for (let key in item) if (f[key]) f[key].value = item[key];
          f.setAttribute("data-edit-index", i);
          // ensure form selects are populated before switching tab
          populateFormSelects();
          document.querySelector('.tab-btn[data-tab="formTab"]').click();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });
    }

    // initial populate form selects, filters & table
    populateFormSelects();
    populateFilters();
    renderTable();
  }

  // expose
  window.openCard = function (title) {
    if (title === "Sanitation and Basic Information Register") {
      return openSanitationRegister(title);
    }
    return originalOpenCard(title);
  };
})();
