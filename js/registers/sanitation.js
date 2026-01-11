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

  // Safe accessors to PHI area data (phiAreaMap.js exposes phiMapAPI)
  function getPhiGNs() {
    try {
      if (window.phiMapAPI && typeof window.phiMapAPI.getGNs === "function") {
        return window.phiMapAPI.getGNs() || [];
      }
    } catch (e) { /* ignore */ }
    return [];
  }
  function getPhiPHMs() {
    try {
      if (window.phiMapAPI && typeof window.phiMapAPI.getPHMs === "function") {
        return window.phiMapAPI.getPHMs() || [];
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  function openSanitationRegister(title) {
    const content = document.getElementById("contentArea");
    content.innerHTML = `
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
          <!-- FILTERS row -->
          <div style="display:flex;gap:12px;align-items:center;margin-bottom:8px;flex-wrap:wrap;">
            <input type="text" id="searchInput" placeholder="Search Name or Address..." style="flex:1;min-width:200px;padding:8px;border-radius:8px;border:1px solid #ccc;">

            <select id="filterPhm" style="min-width:170px;padding:8px;border-radius:8px;border:1px solid #ccc;">
              <option value="">All PHM Areas</option>
            </select>

            <select id="filterGn" style="min-width:170px;padding:8px;border-radius:8px;border:1px solid #ccc;">
              <option value="">All GN Divisions</option>
            </select>

            <select id="filterWater" style="min-width:170px;padding:8px;border-radius:8px;border:1px solid #ccc;">
              <option value="">All Water Supply</option>
            </select>

            <select id="filterLatrine" style="min-width:170px;padding:8px;border-radius:8px;border:1px solid #ccc;">
              <option value="">All Latrine Types</option>
            </select>

            <select id="filterSolid" style="min-width:170px;padding:8px;border-radius:8px;border:1px solid #ccc;">
              <option value="">All Solid Waste Methods</option>
            </select>

            <select id="filterYear" style="min-width:140px;padding:8px;border-radius:8px;border:1px solid #ccc;">
              <option value="">All Years</option>
            </select>

            <button id="exportBtn" class="book-btn" style="margin-left:auto">Export CSV</button>
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

    document.getElementById("exportBtn").addEventListener("click", () => {
      const visible = getFilteredEntries();
      if (!visible.length) return alert("No records to export.");
      const headers = ["S/N","chiefOccupant","address","phmArea","gnDivision","numInmates","numDisabled","numElderly","waterSupply","latrineType","latrineSanitary","latrineImprovementDate","solidWaste","solidSanitary","solidCorrectionDate","liquidSanitary","surveyDate","remarks"];
      const rows = visible.map((r, i) => [i+1, r.chiefOccupant||"", r.address||"", r.phmArea||"", r.gnDivision||"", r.numInmates||"", r.numDisabled||"", r.numElderly||"", r.waterSupply||"", r.latrineType||"", r.latrineSanitary||"", r.latrineImprovementDate||"", r.solidWaste||"", r.solidSanitary||"", r.solidCorrectionDate||"", r.liquidSanitary||"", r.surveyDate||"", r.remarks||""]);
      const csv = [headers.join(",")].concat(rows.map(r => r.map(c => `"${(c||"").toString().replace(/"/g,'""')}"`).join(","))).join("\r\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sanitation_register_export.csv";
      a.click();
      URL.revokeObjectURL(url);
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

      let html = `<div style="min-width:100%;"><table style="width:100%;border-collapse:collapse;"><thead><tr>${headerCols.map(h => `<th style="padding:8px;border:1px solid #eee">${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>`;
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
        const tableEl = container.querySelector("table");
        if (!tableEl || !topScroll || !topInner) return;
        const scrollWidth = tableEl.scrollWidth;
        topInner.style.width = scrollWidth + "px";

        topScroll.onscroll = function () {
          container.scrollLeft = topScroll.scrollLeft;
        };
        container.onscroll = function () {
          topScroll.scrollLeft = container.scrollLeft;
        };
        topScroll.scrollLeft = container.scrollLeft;
      }, 0);

      // delete & edit handlers
      container.querySelectorAll(".delBtn").forEach((b) => {
        b.addEventListener("click", () => {
          const i = Number(b.dataset.i);
          const saved = loadEntries();
          if (i < 0 || i >= saved.length) return;
          if (!confirm("Delete this record?")) return;
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
