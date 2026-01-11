// js/registers/meatInspection.js
// Meat Inspection Register - full implementation (insertion-order preserved)
// Save as: js/registers/meatInspection.js

(function () {
  "use strict";

  const STORAGE_KEY = "meatInspectionRecords_v1";

  // helpers
  function qs(sel, root = document) { return (root || document).querySelector(sel); }
  function qsa(sel, root = document) { return Array.from((root || document).querySelectorAll(sel)); }
  function nowIso() { return new Date().toISOString(); }
  function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
  function loadRecords() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      console.error("meatInspection: load error", e);
      return [];
    }
  }
  function saveRecords(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records || []));
  }

  // Public entry: call window.openMeatInspectionRegister() to render
  window.openMeatInspectionRegister = function () {
    const content = document.getElementById("contentArea") || document.body;
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="margin:0;">Meat Inspection — ගෝඝාතක ලේඛණ</h2>
        <div>
          <button id="mi_back_btn" style="padding:8px 12px;border-radius:8px;border:none;background:#6b6b6b;color:#fff;cursor:pointer;">Back</button>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <button id="mi_tab_entry" class="tab active" style="padding:8px 12px;border-radius:8px;border:none;background:#1b5e20;color:#fff;cursor:pointer;">Data Entry</button>
        <button id="mi_tab_records" class="tab" style="padding:8px 12px;border-radius:8px;border:1px solid #ddd;background:#fff;cursor:pointer;">ලේඛණ</button>
      </div>

      <div id="mi_tab_container" style="padding:18px;background:#fff;color:#000;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.06);"></div>

      <!-- View modal -->
      <div id="mi_view_modal" style="display:none;position:fixed;left:0;top:0;right:0;bottom:0;align-items:center;justify-content:center;background:rgba(0,0,0,0.45);z-index:9999;">
        <div style="background:#fff;padding:18px;border-radius:10px;max-width:900px;width:94%;max-height:85vh;overflow:auto;">
          <div id="mi_view_content"></div>
          <div style="text-align:right;margin-top:12px;">
            <button id="mi_close_view" style="padding:8px 12px;border-radius:6px;border:none;background:#333;color:#fff;cursor:pointer;">Close</button>
          </div>
        </div>
      </div>
    `;

    // basic handlers
    qs("#mi_back_btn").addEventListener("click", () => {
      if (typeof showContent === "function") showContent("Registers", null);
      else location.reload();
    });
    qs("#mi_tab_entry").addEventListener("click", () => {
      setActiveTab("mi_tab_entry");
      renderEntryForm();
    });
    qs("#mi_tab_records").addEventListener("click", () => {
      setActiveTab("mi_tab_records");
      renderRecordsTab();
    });

    // default
    renderEntryForm();
  };

  // set active tab UI
  function setActiveTab(id) {
    ["mi_tab_entry", "mi_tab_records"].forEach(x => {
      const el = qs(`#${x}`);
      if (!el) return;
      if (x === id) {
        el.classList.add("active");
        el.style.background = "#1b5e20"; el.style.color = "#fff"; el.style.border = "none";
      } else {
        el.classList.remove("active");
        el.style.background = "#fff"; el.style.color = "#000"; el.style.border = "1px solid #ddd";
      }
    });
  }

  // Render Entry Form (empty or with record)
  function renderEntryForm(record = null) {
    const container = qs("#mi_tab_container");
    if (!container) return;
    const r = record || {
      id: "",
      licenseHolderName: "",
      purchaseDate: "",
      animalType: "",
      animalAge: "",
      animalSex: "",
      brandMark: "",
      sellerName: "",
      sellerAddress: "",
      bledDate: "",
      bledTime: "",
      scheduledSlaughterDate: "",
      actualSlaughterDate: "",
      inspectionDone: "",
      otherNotes: ""
    };

    container.innerHTML = `
      <form id="mi_form" style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
        <div>
          <label style="font-weight:600;">බලපත්‍ර ලත් ගෝඝාතකයාගේ නම</label><br>
          <input type="text" name="licenseHolderName" value="${escapeHtml(r.licenseHolderName)}" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;">
        </div>
        <div>
          <label style="font-weight:600;">සත්වයා මිලදී ගත් දිනය</label><br>
          <input type="date" name="purchaseDate" value="${escapeHtml(r.purchaseDate)}" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;">
        </div>

        <!-- Animal Details Box -->
        <div style="grid-column:1 / span 2;border:1px solid #999;border-radius:8px;padding:12px;background:#fafafa;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong>සත්වයා පිලිබඳ විස්තර</strong>
          </div>
          <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;">
            <div style="flex:1;min-width:160px;">
              <label style="font-size:13px;">වර්ගය</label><br>
              <input type="text" name="animalType" value="${escapeHtml(r.animalType)}" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;">
            </div>
            <div style="width:120px;">
              <label style="font-size:13px;">වයස</label><br>
              <input type="text" name="animalAge" value="${escapeHtml(r.animalAge)}" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;">
            </div>
            <div style="width:160px;">
              <label style="font-size:13px;">ස්ත්‍රී / පුරුෂ</label><br>
              <select name="animalSex" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;">
                <option value="">Select</option>
                <option value="ස්ත්‍රී" ${r.animalSex === "ස්ත්‍රී" ? "selected" : ""}>ස්ත්‍රී</option>
                <option value="පුරුෂ" ${r.animalSex === "පුරුෂ" ? "selected" : ""}>පුරුෂ</option>
              </select>
            </div>
            <div style="flex:1;min-width:160px;">
              <label style="font-size:13px;">හණ ලකුණ</label><br>
              <input type="text" name="brandMark" value="${escapeHtml(r.brandMark)}" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;">
            </div>
          </div>
        </div>

        <div>
          <label style="font-weight:600;">විකුණුම්කරුගේ නම</label><br>
          <input type="text" name="sellerName" value="${escapeHtml(r.sellerName)}" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;">
        </div>
        <div>
          <label style="font-weight:600;">ලිපිනය</label><br>
          <input type="text" name="sellerAddress" value="${escapeHtml(r.sellerAddress)}" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;">
        </div>

        <!-- Bleeding & Slaughter Details Box -->
        <div style="grid-column:1 / span 2;border:1px solid #999;border-radius:8px;padding:12px;background:#fafafa;">
          <strong>ගාල් / ඝාතනය හා පරීක්ෂණ තොරතුරු</strong>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:10px;align-items:end;">
            <div>
              <label style="font-size:13px;">ගාල් කරන ලද දිනය</label><br>
              <input type="date" name="bledDate" value="${escapeHtml(r.bledDate)}" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;">
            </div>
            <div>
              <label style="font-size:13px;">ගාල් කල වේලාව</label><br>
              <input type="time" name="bledTime" value="${escapeHtml(r.bledTime)}" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;">
            </div>
            <div>
              <label style="font-size:13px;">ඝාතනයට නියම කළ දිනය</label><br>
              <input type="date" name="scheduledSlaughterDate" value="${escapeHtml(r.scheduledSlaughterDate)}" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;">
            </div>
            <div>
              <label style="font-size:13px;">ඝාතනය කළ දිනය</label><br>
              <input type="date" name="actualSlaughterDate" value="${escapeHtml(r.actualSlaughterDate)}" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;">
            </div>
          </div>

          <div style="margin-top:10px;">
            <label style="font-size:13px;">හම පරික්ෂා කලේද</label><br>
            <select name="inspectionDone" style="width:260px;padding:8px;border-radius:6px;border:1px solid #ccc;margin-top:6px;">
              <option value="">-- තෝරන්න --</option>
              <option value="පරික්ෂා කරන ලදී" ${r.inspectionDone === "පරික්ෂා කරන ලදී" ? "selected" : ""}>පරික්ෂා කරන ලදී</option>
              <option value="පරික්ෂා නොකරන ලදී" ${r.inspectionDone === "පරික්ෂා නොකරන ලදී" ? "selected" : ""}>පරික්ෂා නොකරන ලදී</option>
            </select>
          </div>
        </div>

        <div style="grid-column:1 / span 2;">
          <label style="font-weight:600;">වෙනත් කරුණු</label><br>
          <textarea name="otherNotes" rows="3" style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;">${escapeHtml(r.otherNotes)}</textarea>
        </div>

        <div style="grid-column:1 / span 2;text-align:right;">
          <input type="hidden" name="recordId" value="${escapeHtml(r.id)}">
          <button type="button" id="mi_save_btn" style="padding:10px 14px;border-radius:8px;border:none;background:#1b5e20;color:#fff;cursor:pointer;">Save</button>
          <button type="button" id="mi_clear_btn" style="padding:10px 14px;border-radius:8px;border:1px solid #ccc;background:#fff;color:#000;cursor:pointer;margin-left:8px;">Clear</button>
        </div>
      </form>
    `;

    // listeners
    qs("#mi_clear_btn").addEventListener("click", () => renderEntryForm()); // reset
    qs("#mi_save_btn").addEventListener("click", onSaveRecord);
  }

  // Save handler (create or update) - preserves insertion order
  function onSaveRecord() {
    const form = qs("#mi_form");
    if (!form) return;
    const fd = new FormData(form);
    const incomingId = fd.get("recordId") || "";
    const all = loadRecords();

    // If editing existing record: find its index and replace (preserve position)
    if (incomingId) {
      const idx = all.findIndex(x => x.id === incomingId);
      if (idx === -1) {
        alert("Record not found for editing.");
        return;
      }
      // keep original createdAt if present
      const existing = all[idx];
      const updated = {
        id: existing.id,
        licenseHolderName: fd.get("licenseHolderName") || "",
        purchaseDate: fd.get("purchaseDate") || "",
        animalType: fd.get("animalType") || "",
        animalAge: fd.get("animalAge") || "",
        animalSex: fd.get("animalSex") || "",
        brandMark: fd.get("brandMark") || "",
        sellerName: fd.get("sellerName") || "",
        sellerAddress: fd.get("sellerAddress") || "",
        bledDate: fd.get("bledDate") || "",
        bledTime: fd.get("bledTime") || "",
        scheduledSlaughterDate: fd.get("scheduledSlaughterDate") || "",
        actualSlaughterDate: fd.get("actualSlaughterDate") || "",
        inspectionDone: fd.get("inspectionDone") || "",
        otherNotes: fd.get("otherNotes") || "",
        createdAt: existing.createdAt || nowIso()
      };
      all[idx] = updated; // replace in same position
      saveRecords(all);
      // show records tab
      setActiveTab("mi_tab_records");
      renderRecordsTab();
      return;
    }

    // New record: push to end (preserve insertion order)
    const newRec = {
      id: String(Date.now()) + Math.floor(Math.random() * 1000), // unique id
      licenseHolderName: fd.get("licenseHolderName") || "",
      purchaseDate: fd.get("purchaseDate") || "",
      animalType: fd.get("animalType") || "",
      animalAge: fd.get("animalAge") || "",
      animalSex: fd.get("animalSex") || "",
      brandMark: fd.get("brandMark") || "",
      sellerName: fd.get("sellerName") || "",
      sellerAddress: fd.get("sellerAddress") || "",
      bledDate: fd.get("bledDate") || "",
      bledTime: fd.get("bledTime") || "",
      scheduledSlaughterDate: fd.get("scheduledSlaughterDate") || "",
      actualSlaughterDate: fd.get("actualSlaughterDate") || "",
      inspectionDone: fd.get("inspectionDone") || "",
      otherNotes: fd.get("otherNotes") || "",
      createdAt: nowIso()
    };

    // basic validation: license holder name required
    if (!newRec.licenseHolderName.trim()) {
      alert("කරුණාකර බලපත්‍ර ලත් ගෝඝාතකයාගේ නම ඇතුල් කරන්න.");
      return;
    }

    all.push(newRec); // push to end => insertion order preserved
    saveRecords(all);

    // show records
    setActiveTab("mi_tab_records");
    renderRecordsTab();
  }

  // Render Records tab (table + year filter)
  function renderRecordsTab() {
    const container = qs("#mi_tab_container");
    if (!container) return;
    const all = loadRecords();

    // extract years from actualSlaughterDate
    const yearSet = new Set();
    all.forEach(r => {
      if (r.actualSlaughterDate) {
        const d = new Date(r.actualSlaughterDate);
        if (!isNaN(d)) yearSet.add(d.getFullYear());
      }
    });
    const years = Array.from(yearSet).sort((a,b)=>b-a);

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div style="display:flex;gap:10px;align-items:center;">
          <label style="font-weight:600;">Filter by slaughter year:</label>
          <select id="mi_year_filter" style="padding:8px;border-radius:6px;border:1px solid #ccc;">
            <option value="all">සියල්ල</option>
            ${years.map(y => `<option value="${y}">${y}</option>`).join("")}
          </select>
        </div>
        <div style="display:flex;gap:8px;">
          <button id="mi_new_entry_btn" style="padding:8px 12px;border-radius:8px;border:none;background:#1b5e20;color:#fff;cursor:pointer;">New Entry</button>
          <button id="mi_export_csv_btn" style="padding:8px 12px;border-radius:8px;border:1px solid #ccc;background:#fff;cursor:pointer;">Export CSV</button>
        </div>
      </div>

      <div style="overflow:auto;">
        <table id="mi_table" style="width:100%;border-collapse:collapse;">
          <thead style="background:#f7f7f7;">
            <tr>
              <th style="padding:8px;border:1px solid #eee;width:60px;text-align:center;">s/n</th>
              <th style="padding:8px;border:1px solid #eee;">බලපත්‍ර ලත් ගෝඝාතකයා</th>
              <th style="padding:8px;border:1px solid #eee;">සත්ව වර්ගය</th>
              <th style="padding:8px;border:1px solid #eee;">වයස</th>
              <th style="padding:8px;border:1px solid #eee;">ස්ත්‍රී/පුරුෂ</th>
              <th style="padding:8px;border:1px solid #eee;">හණ ලකුණ</th>
              <th style="padding:8px;border:1px solid #eee;">විකුණුම්කරු</th>
              <th style="padding:8px;border:1px solid #eee;">ඝාතනය දිනය</th>
              <th style="padding:8px;border:1px solid #eee;">හම පරීක්ෂා</th>
              <th style="padding:8px;border:1px solid #eee;width:190px;text-align:center;">Action</th>
            </tr>
          </thead>
          <tbody id="mi_table_body">
            <!-- rows go here -->
          </tbody>
        </table>
      </div>
    `;

    // listeners
    qs("#mi_new_entry_btn").addEventListener("click", () => {
      setActiveTab("mi_tab_entry");
      renderEntryForm();
    });

    qs("#mi_year_filter").addEventListener("change", (e) => {
      renderTableRows(e.target.value);
    });

    qs("#mi_export_csv_btn").addEventListener("click", exportCsv);

    // default render
    qs("#mi_year_filter").value = "all";
    renderTableRows("all");
  }

  // Render table rows with optional year filter
  // IMPORTANT: S/N shown is the original insertion-order index + 1
  function renderTableRows(yearFilter = "all") {
    const tbody = qs("#mi_table_body");
    if (!tbody) return;
    const all = loadRecords(); // insertion-order array (oldest first => s/n 1 is first inserted)

    // we must iterate full array in order and include only matching rows
    const rows = [];
    all.forEach((r, idx) => {
      if (yearFilter && yearFilter !== "all") {
        if (!r.actualSlaughterDate) return; // skip
        const d = new Date(r.actualSlaughterDate);
        if (isNaN(d) || d.getFullYear() !== Number(yearFilter)) return;
      }
      // keep original S/N = idx + 1
      rows.push({ rec: r, originalSn: idx + 1 });
    });

    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="padding:14px;text-align:center;color:#666;">No records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(({rec, originalSn}) => {
      const slaughterDate = rec.actualSlaughterDate ? escapeHtml(rec.actualSlaughterDate) : "";
      return `
        <tr data-id="${rec.id}">
          <td style="padding:8px;border:1px solid #eee;text-align:center;">${originalSn}</td>
          <td style="padding:8px;border:1px solid #eee;">${escapeHtml(rec.licenseHolderName)}</td>
          <td style="padding:8px;border:1px solid #eee;">${escapeHtml(rec.animalType)}</td>
          <td style="padding:8px;border:1px solid #eee;text-align:center;">${escapeHtml(rec.animalAge)}</td>
          <td style="padding:8px;border:1px solid #eee;text-align:center;">${escapeHtml(rec.animalSex)}</td>
          <td style="padding:8px;border:1px solid #eee;">${escapeHtml(rec.brandMark)}</td>
          <td style="padding:8px;border:1px solid #eee;">${escapeHtml(rec.sellerName)}</td>
          <td style="padding:8px;border:1px solid #eee;text-align:center;">${slaughterDate}</td>
          <td style="padding:8px;border:1px solid #eee;text-align:center;">${escapeHtml(rec.inspectionDone)}</td>
          <td style="padding:8px;border:1px solid #eee;text-align:center;">
            <button class="mi_view_btn" data-id="${rec.id}" style="padding:6px 8px;border-radius:6px;border:none;background:#0b74d1;color:#fff;margin-right:6px;cursor:pointer;">View</button>
            <button class="mi_edit_btn" data-id="${rec.id}" style="padding:6px 8px;border-radius:6px;border:none;background:#2e7d32;color:#fff;margin-right:6px;cursor:pointer;">Edit</button>
            <button class="mi_delete_btn" data-id="${rec.id}" style="padding:6px 8px;border-radius:6px;border:none;background:#dc3545;color:#fff;cursor:pointer;">Delete</button>
          </td>
        </tr>
      `;
    }).join("");

    // attach event handlers
    qsa(".mi_view_btn").forEach(btn => btn.addEventListener("click", (ev) => {
      const id = ev.currentTarget.getAttribute("data-id");
      openViewModal(id);
    }));
    qsa(".mi_edit_btn").forEach(btn => btn.addEventListener("click", (ev) => {
      const id = ev.currentTarget.getAttribute("data-id");
      const allRecords = loadRecords();
      const rec = allRecords.find(x => x.id === id);
      if (rec) {
        setActiveTab("mi_tab_entry");
        renderEntryForm(rec);
        const cont = qs("#mi_tab_container");
        if (cont) cont.scrollIntoView({ behavior: "smooth" });
      } else {
        alert("Record not found.");
      }
    }));
    qsa(".mi_delete_btn").forEach(btn => btn.addEventListener("click", (ev) => {
      const id = ev.currentTarget.getAttribute("data-id");
      if (!confirm("ඔබට මෙම ලේඛනය මකා දැමීමට අවශ්‍යද?")) return;
      let allRecords = loadRecords();
      // remove the record; this will shift subsequent S/Ns (as they are index-based) — that's expected
      allRecords = allRecords.filter(x => x.id !== id);
      saveRecords(allRecords);
      const yf = qs("#mi_year_filter") ? qs("#mi_year_filter").value : "all";
      renderTableRows(yf);
    }));
  }

  // View modal content
  function openViewModal(id) {
    const rec = loadRecords().find(x => x.id === id);
    if (!rec) return alert("Record not found.");
    const modal = qs("#mi_view_modal");
    const content = qs("#mi_view_content");
    content.innerHTML = `
      <h3 style="margin-top:0;margin-bottom:8px;">Meat Inspection — View Record</h3>
      <table style="width:100%;border-collapse:collapse;">
        <tbody>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;width:220px;">බලපත්‍ර ලත් ගෝඝාතකයාගේ නම</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(rec.licenseHolderName)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">සත්වයා මිලදී ගත් දිනය</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(rec.purchaseDate)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">සත්ව වර්ගය</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(rec.animalType)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">වයස</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(rec.animalAge)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">ස්ත්‍රී/පුරුෂ</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(rec.animalSex)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">හණ ලකුණ</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(rec.brandMark)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">විකුණුම්කරුගේ නම</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(rec.sellerName)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">ලිපිනය</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(rec.sellerAddress)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">ගාල් කරන ලද දිනය</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(rec.bledDate)} ${rec.bledTime ? "– " + escapeHtml(rec.bledTime) : ""}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">ඝාතනයට නියම කළ දිනය</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(rec.scheduledSlaughterDate)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">ඝාතනය කළ දිනය</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(rec.actualSlaughterDate)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">හම පරික්ෂණය</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(rec.inspectionDone)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;">වෙනත් කරුණු</td><td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(rec.otherNotes)}</td></tr>
          <tr><td style="padding:8px;font-weight:600;">Created At</td><td style="padding:8px;">${escapeHtml(rec.createdAt)}</td></tr>
        </tbody>
      </table>
    `;
    modal.style.display = "flex";
    qs("#mi_close_view").onclick = () => { modal.style.display = "none"; };
  }

  // Simple CSV export (in insertion order)
  function exportCsv() {
    const data = loadRecords();
    if (!data || data.length === 0) return alert("No records to export.");
    const header = ["id","licenseHolderName","purchaseDate","animalType","animalAge","animalSex","brandMark","sellerName","sellerAddress","bledDate","bledTime","scheduledSlaughterDate","actualSlaughterDate","inspectionDone","otherNotes","createdAt"];
    const rows = data.map(r => header.map(h => `"${(r[h] || "").toString().replace(/"/g,'""')}"`).join(","));
    const csv = [header.join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meat_inspection_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  // expose some debug helpers
  window._meatInspection = {
    loadRecords,
    saveRecords,
    renderEntryForm,
    renderRecordsTab
  };

  console.log("[meatInspection] module loaded (insertion-order preserved).");
})();
