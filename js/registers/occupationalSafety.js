/* =========================================================================
   occupationalSafety.js
   Occupational Health & Safety Register
   - Row-level inspection Save updates in-memory and persists to storage
     immediately if editing an existing record.
   - Date required for inspection entries.
   - Labels in black.
   - Records include Nature filter + search.
   - Storage key: occupational_safety_v1
   ========================================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "occupational_safety_v1";

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("load error", e);
      return [];
    }
  }

  function save(arr) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.error("save error", e);
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.floor(Math.random() * 10000).toString(36);
  }

  function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m];
    });
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function sortByDateDesc(arr) {
    return (arr || []).slice().sort((a, b) => {
      const da = a && a.date ? a.date : "";
      const db = b && b.date ? b.date : "";
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db.localeCompare(da);
    });
  }

  // in-memory inspections for the currently open Entry/Edit
  let _currentInspections = [];

  // When editing an existing record, this contains the record id; otherwise empty
  let _editingRecordId = "";

  // Public opener
  window.openOccupationalSafetyRegister = function (title = "Occupational Health & Safety Register") {
    const content = document.getElementById("contentArea");
    if (!content) { console.warn("contentArea not found"); return; }

    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <h2 style="margin:0;">${esc(title)}</h2>
        <button id="ohs_back" style="background:#0b74d1;color:white;padding:8px 12px;border:none;border-radius:8px;cursor:pointer">Back</button>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <button id="ohs_tab_entry" class="tab active" style="padding:8px 12px;border-radius:8px;background:#f8fbff;border:1px solid #ccc;cursor:pointer">Entry</button>
        <button id="ohs_tab_records" class="tab" style="padding:8px 12px;border-radius:8px;background:#fff;border:1px solid #ccc;cursor:pointer">Records</button>
      </div>

      <div id="ohs_tabContent"></div>
    `;

    document.getElementById("ohs_back").addEventListener("click", () => {
      if (typeof showContent === "function") showContent("Registers", null);
    });

    document.getElementById("ohs_tab_entry").addEventListener("click", () => {
      setActiveTab("entry");
      renderEntry();
    });
    document.getElementById("ohs_tab_records").addEventListener("click", () => {
      setActiveTab("records");
      renderRecords();
    });

    setActiveTab("entry");
    renderEntry();
  };

  function setActiveTab(key) {
    const e = document.getElementById("ohs_tab_entry"), r = document.getElementById("ohs_tab_records");
    e.style.background = r.style.background = "#fff";
    if (key === "entry") e.style.background = "#f8fbff"; else r.style.background = "#f8fbff";
  }

  /* ------------------ ENTRY UI ------------------ */
  function renderEntry() {
    const root = document.getElementById("ohs_tabContent");
    if (!root) return;

    // keep existing _currentInspections unless explicitly cleared by user
    root.innerHTML = `
      <div style="background:#fff;padding:16px;border-radius:10px;box-shadow:0 4px 18px rgba(0,0,0,0.06);">
        <h3 style="margin:0 0 12px 0;color:#073b6a;">Occupational Health & Safety — Entry</h3>

        <div id="ohs_form" style="display:grid;grid-template-columns:300px 1fr;gap:12px 18px;">
          ${formLabel("ව්‍යාපාරික ස්ථානයේ අයිතිකරුගේ නම")}<input id="ohs_owner_name" />
          ${formLabel("ලිපිනය")}<input id="ohs_owner_addr" />
          ${formLabel("වෘත්තියේ / සේවයේ / ව්‍යාපාරයේ ස්වභාවය (Nature)")}<input id="ohs_nature" />
          ${formLabel("මුළු සේවක සංඛ්‍යාව (Total)")}<input id="ohs_total" type="number" min="0" value="0" />
          ${formLabel("ස්ත්‍රී (Female)")}<input id="ohs_female" type="number" min="0" value="0" />
          ${formLabel("පුරුෂ (Male)")}<input id="ohs_male" type="number" min="0" value="0" />
          ${formLabel("පළාත් පාලන ආයතන බල ප්‍රදේශය (Admin area)")}<input id="ohs_admin_area" />
          ${formLabel("බලපත්‍ර ලබාගෙන ඇත්ද ? (Has license)")}<select id="ohs_has_license"><option value="">-- තෝරන්න --</option><option value="yes">Yes</option><option value="no">No</option></select>
        </div>

        <div style="display:flex;gap:10px;margin-top:12px;">
          <button id="ohs_save" style="background:#0b74d1;color:#fff;padding:8px 14px;border-radius:6px;border:none;cursor:pointer">Save Record</button>
          <button id="ohs_update" style="background:#1976d2;color:#fff;padding:8px 14px;border-radius:6px;border:none;cursor:pointer;display:none">Update Record</button>
          <button id="ohs_clear" style="background:#e2e8f0;padding:8px 14px;border-radius:6px;border:none;cursor:pointer">Clear Form</button>
          <div style="flex:1"></div>
          <button id="ohs_export" style="background:#fff;border:1px solid #0b74d1;color:#0b74d1;padding:8px 12px;border-radius:6px;cursor:pointer">Export CSV</button>
        </div>

        <hr style="margin:14px 0;" />

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <h4 style="margin:0;color:#073b6a;">පරීක්ෂණ / නිරීක්ෂණ (Inspections)</h4>
          <div style="display:flex;gap:8px;">
            <button id="ohs_add_inspection" style="background:#06ad7d;color:#fff;padding:8px 12px;border:none;border-radius:6px;cursor:pointer">Add Inspection</button>
            <button id="ohs_clear_inspections" style="background:#ef9a9a;color:#111;padding:8px 12px;border:none;border-radius:6px;cursor:pointer">Clear Inspections</button>
          </div>
        </div>

        <div style="overflow:auto;max-height:420px;border:1px solid #edf2f7;border-radius:8px;padding:8px;background:#fff;">
          <div id="insp_top_scroll" style="overflow:auto;height:18px;margin-bottom:6px;display:none;"><div id="insp_top_inner" style="height:1px"></div></div>
          <div id="insp_table_wrap" style="overflow:auto;">
            <table id="insp_table" style="width:100%;border-collapse:collapse;min-width:1200px;">
              <thead style="background:#f7fafc;">
                <tr>
                  <th style="padding:8px;width:140px;">දිනය (Date)</th>
                  <th style="padding:8px;min-width:250px;">පරිසරය (Environment)</th>
                  <th style="padding:8px;min-width:260px;">සුභසාධන (Sanitation)</th>
                  <th style="padding:8px;min-width:220px;">අපද්‍රවය (Waste)</th>
                  <th style="padding:8px;min-width:260px;">ගත් ක්‍රියාමාර්ග (Actions)</th>
                  <th style="padding:8px;width:160px;">Action</th>
                </tr>
              </thead>
              <tbody id="insp_body"><tr><td colspan="6" style="padding:12px;color:#666;text-align:center;">No inspections yet</td></tr></tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // style inputs
    setInputsStyle();

    // wire buttons
    document.getElementById("ohs_add_inspection").addEventListener("click", () => {
      addInspection();
    });
    document.getElementById("os_clear_inspections").addEventListener("click", async () => {
      if (!await showConfirm("Clear all inspections from current editing session? This will not delete saved records.")) return;
      _currentInspections = [];
      renderInspectionsTable();
    });
    document.getElementById("ohs_save").addEventListener("click", onSaveRecord);
    document.getElementById("ohs_update").addEventListener("click", onUpdateRecord);
    document.getElementById("ohs_clear").addEventListener("click", () => {
      // clear form fields only (preserve _currentInspections unless user cleared them explicitly)
      document.getElementById("ohs_owner_name").value = "";
      document.getElementById("ohs_owner_addr").value = "";
      document.getElementById("ohs_nature").value = "";
      document.getElementById("ohs_total").value = 0;
      document.getElementById("ohs_female").value = 0;
      document.getElementById("ohs_male").value = 0;
      document.getElementById("ohs_admin_area").value = "";
      document.getElementById("ohs_has_license").value = "";
      renderInspectionsTable();
    });
    document.getElementById("ohs_export").addEventListener("click", exportAllCsv);

    // top-scroll sync
    setTimeout(() => {
      try {
        const tbl = document.getElementById("insp_table");
        const wrap = document.getElementById("insp_table_wrap");
        const top = document.getElementById("insp_top_scroll");
        const topInner = document.getElementById("insp_top_inner");
        if (tbl && wrap && top && topInner) {
          topInner.style.width = tbl.scrollWidth + "px";
          top.style.display = tbl.scrollWidth > wrap.clientWidth ? "block" : "none";
          top.addEventListener("scroll", () => wrap.scrollLeft = top.scrollLeft);
          wrap.addEventListener("scroll", () => top.scrollLeft = wrap.scrollLeft);
        }
      } catch (e) { /* ignore */ }
    }, 60);

    // initial render (keeps _currentInspections)
    renderInspectionsTable();
  }

  function formLabel(txt) {
    return `<label style="display:block;color:black;font-weight:700;margin-bottom:6px;">${esc(txt)}</label>`;
  }

  function setInputsStyle() {
    const root = document.getElementById("ohs_tabContent");
    if (!root) return;
    root.querySelectorAll("input, select, textarea").forEach(el => {
      el.style.cssText = "width:100%;padding:8px;border:1px solid #d6dde3;border-radius:6px;box-sizing:border-box";
    });
    root.querySelectorAll("textarea").forEach(t => t.style.minHeight = "56px");
  }

  /* ---------------- Inspections handling ---------------- */

  function addInspection() {
    const newIns = {
      id: uid(),
      date: "",
      environment: { lightingAir: "", heat: "", noise: "", temperature: "", radiation: "", ventilation: "" },
      sanitation: { drinkingWater: "", toilets: "", foodRoom: "", firstAid: "", ppe: "", restRoom: "" },
      waste: { solid: "", liquid: "", gas: "" },
      actionsTaken: "",
      otherRemarks: ""
    };
    _currentInspections.unshift(newIns);
    // render and open edit mode for the new inspection
    renderInspectionsTable(newIns.id);
  }

  function renderInspectionsTable(editId = null) {
    const tbody = document.getElementById("insp_body");
    if (!tbody) return;
    _currentInspections = sortByDateDesc(_currentInspections || []);
    if (!_currentInspections.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="padding:12px;color:#666;text-align:center;">No inspections yet</td></tr>`;
      return;
    }

    tbody.innerHTML = _currentInspections.map(ins => {
      if (editId && String(ins.id) === String(editId)) {
        // edit row
        return `
          <tr data-id="${ins.id}">
            <td style="padding:8px;vertical-align:top;">
              <input type="date" data-field="date" value="${esc(ins.date || "")}" style="width:140px;padding:6px;border:1px solid #ccc;border-radius:6px;">
            </td>
            <td style="padding:8px;vertical-align:top;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                <input data-sub="environment.lightingAir" placeholder="ආලෝකය/වාතය" value="${esc(ins.environment.lightingAir || "")}">
                <input data-sub="environment.heat" placeholder="තාපය" value="${esc(ins.environment.heat || "")}">
                <input data-sub="environment.noise" placeholder="ශබ්ධය" value="${esc(ins.environment.noise || "")}">
                <input data-sub="environment.temperature" placeholder="උෂ්ණත්වය" value="${esc(ins.environment.temperature || "")}">
                <input data-sub="environment.radiation" placeholder="විකිරණ" value="${esc(ins.environment.radiation || "")}">
                <input data-sub="environment.ventilation" placeholder="විමෝචනය" value="${esc(ins.environment.ventilation || "")}">
              </div>
            </td>
            <td style="padding:8px;vertical-align:top;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                <input data-sub="sanitation.drinkingWater" placeholder="පානිය ජලය" value="${esc(ins.sanitation.drinkingWater || "")}">
                <input data-sub="sanitation.toilets" placeholder="වැසිකිලි" value="${esc(ins.sanitation.toilets || "")}">
                <input data-sub="sanitation.foodRoom" placeholder="කෑම කාමරය" value="${esc(ins.sanitation.foodRoom || "")}">
                <input data-sub="sanitation.firstAid" placeholder="ප්‍රථමාධාර" value="${esc(ins.sanitation.firstAid || "")}">
                <input data-sub="sanitation.ppe" placeholder="PPE" value="${esc(ins.sanitation.ppe || "")}">
                <input data-sub="sanitation.restRoom" placeholder="විවේක කාමරය" value="${esc(ins.sanitation.restRoom || "")}">
              </div>
            </td>
            <td style="padding:8px;vertical-align:top;">
              <div style="display:grid;gap:6px;">
                <input data-sub="waste.solid" placeholder="ඝණ" value="${esc(ins.waste.solid || "")}">
                <input data-sub="waste.liquid" placeholder="ද්‍රව" value="${esc(ins.waste.liquid || "")}">
                <input data-sub="waste.gas" placeholder="වායු/වාෂ්ප/දුවිලි" value="${esc(ins.waste.gas || "")}">
              </div>
            </td>
            <td style="padding:8px;vertical-align:top;">
              <textarea data-field="actionsTaken" placeholder="ගත් ක්‍රියාමාර්ගය" style="width:100%;padding:6px;border:1px solid #ccc;border-radius:6px;">${esc(ins.actionsTaken || "")}</textarea>
              <input data-field="otherRemarks" placeholder="වෙනත් කරුණු" value="${esc(ins.otherRemarks || "")}" style="width:100%;margin-top:6px;padding:6px;border:1px solid #ccc;border-radius:6px;">
            </td>
            <td style="padding:8px;vertical-align:top;">
              <div style="display:flex;flex-direction:column;gap:6px;">
                <button class="ins_save" data-id="${ins.id}" style="background:#06ad7d;color:#fff;padding:6px;border:none;border-radius:6px;cursor:pointer">Save</button>
                <button class="ins_cancel" data-id="${ins.id}" style="background:#ef9a9a;color:#111;padding:6px;border:none;border-radius:6px;cursor:pointer">Cancel</button>
              </div>
            </td>
          </tr>
        `;
      }

      // read-only row
      return `
        <tr data-id="${ins.id}">
          <td style="padding:8px;vertical-align:top;">${esc(ins.date || "")}</td>
          <td style="padding:8px;vertical-align:top;">
            <div style="font-weight:600;margin-bottom:6px;">Environment</div>
            <div style="font-size:13px;line-height:1.35">
              ආ/වා: ${esc(ins.environment.lightingAir || "")} · තාපය: ${esc(ins.environment.heat || "")} · ශබ්ධය: ${esc(ins.environment.noise || "")}
            </div>
          </td>
          <td style="padding:8px;vertical-align:top;">
            <div style="font-weight:600;margin-bottom:6px;">Sanitation</div>
            <div style="font-size:13px;line-height:1.35">
              ජලය: ${esc(ins.sanitation.drinkingWater || "")} · වැසිකිලි: ${esc(ins.sanitation.toilets || "")}
            </div>
          </td>
          <td style="padding:8px;vertical-align:top;">
            <div style="font-weight:600;margin-bottom:6px;">Waste</div>
            <div style="font-size:13px;line-height:1.35">
              ඝණ: ${esc(ins.waste.solid || "")} · ද්‍රව: ${esc(ins.waste.liquid || "")}
            </div>
          </td>
          <td style="padding:8px;vertical-align:top;">${esc(ins.actionsTaken || "")}</td>
          <td style="padding:8px;vertical-align:top;">
            <div style="display:flex;flex-direction:column;gap:6px;">
              <button class="ins_edit" data-id="${ins.id}" style="background:#ffd54f;border:none;padding:6px;border-radius:6px;cursor:pointer">Edit</button>
              <button class="ins_del" data-id="${ins.id}" style="background:#ef9a9a;border:none;padding:6px;border-radius:6px;cursor:pointer">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    // Attach handlers
    const tbodyEl = document.getElementById("insp_body");
    if (!tbodyEl) return;

    // Edit buttons
    tbodyEl.querySelectorAll(".ins_edit").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        renderInspectionsTable(id);
      });
    });

    // Delete buttons (removes from _currentInspections only)
    tbodyEl.querySelectorAll(".ins_del").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.currentTarget.dataset.id;
        if (!await showConfirm("Delete this inspection from current session? This will remove it from the record when saved.")) return;
        _currentInspections = _currentInspections.filter(x => String(x.id) !== String(id));
        renderInspectionsTable();
        // If currently editing an existing saved record, persist deletion immediately
        if (_editingRecordId) persistInspectionsToRecord(_editingRecordId);
      });
    });

    // Save buttons (row-level) — key: must save to _currentInspections, and if editing record, persist to storage immediately
    tbodyEl.querySelectorAll(".ins_save").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.currentTarget.dataset.id;
        const tr = e.currentTarget.closest("tr");
        if (!tr) return;
        // date required
        const dateEl = tr.querySelector('input[data-field="date"], input[type="date"]');
        const dateVal = dateEl ? dateEl.value : "";
        if (!dateVal) { alert("Inspection date is required!"); return; }

        // collect subfields
        const env = {
          lightingAir: (tr.querySelector('[data-sub="environment.lightingAir"]') || { value: "" }).value.trim(),
          heat: (tr.querySelector('[data-sub="environment.heat"]') || { value: "" }).value.trim(),
          noise: (tr.querySelector('[data-sub="environment.noise"]') || { value: "" }).value.trim(),
          temperature: (tr.querySelector('[data-sub="environment.temperature"]') || { value: "" }).value.trim(),
          radiation: (tr.querySelector('[data-sub="environment.radiation"]') || { value: "" }).value.trim(),
          ventilation: (tr.querySelector('[data-sub="environment.ventilation"]') || { value: "" }).value.trim()
        };
        const san = {
          drinkingWater: (tr.querySelector('[data-sub="sanitation.drinkingWater"]') || { value: "" }).value.trim(),
          toilets: (tr.querySelector('[data-sub="sanitation.toilets"]') || { value: "" }).value.trim(),
          foodRoom: (tr.querySelector('[data-sub="sanitation.foodRoom"]') || { value: "" }).value.trim(),
          firstAid: (tr.querySelector('[data-sub="sanitation.firstAid"]') || { value: "" }).value.trim(),
          ppe: (tr.querySelector('[data-sub="sanitation.ppe"]') || { value: "" }).value.trim(),
          restRoom: (tr.querySelector('[data-sub="sanitation.restRoom"]') || { value: "" }).value.trim()
        };
        const waste = {
          solid: (tr.querySelector('[data-sub="waste.solid"]') || { value: "" }).value.trim(),
          liquid: (tr.querySelector('[data-sub="waste.liquid"]') || { value: "" }).value.trim(),
          gas: (tr.querySelector('[data-sub="waste.gas"]') || { value: "" }).value.trim()
        };
        const actionsTaken = (tr.querySelector('[data-field="actionsTaken"]') || { value: "" }).value.trim();
        const otherRemarks = (tr.querySelector('[data-field="otherRemarks"]') || { value: "" }).value.trim();

        // update _currentInspections without removing others
        const idx = _currentInspections.findIndex(x => String(x.id) === String(id));
        if (idx >= 0) {
          _currentInspections[idx] = {
            id: _currentInspections[idx].id, // keep id type consistent
            date: dateVal,
            environment: env,
            sanitation: san,
            waste: waste,
            actionsTaken,
            otherRemarks
          };
        } else {
          // not found: push as new
          _currentInspections.unshift({
            id,
            date: dateVal,
            environment: env,
            sanitation: san,
            waste: waste,
            actionsTaken,
            otherRemarks
          });
        }

        // sort and re-render
        _currentInspections = sortByDateDesc(_currentInspections);
        renderInspectionsTable();

        // If currently editing an existing saved record, persist inspections immediately
        if (_editingRecordId) {
          persistInspectionsToRecord(_editingRecordId);
        }
      });
    });

    // Cancel buttons
    tbodyEl.querySelectorAll(".ins_cancel").forEach(btn => {
      btn.addEventListener("click", () => {
        renderInspectionsTable(); // simply revert to view mode
      });
    });
  }

  // If editing a saved record (loaded from storage), persist current _currentInspections into that record immediately.
  function persistInspectionsToRecord(recordId) {
    if (!recordId) return;
    const arr = load() || [];
    const idx = arr.findIndex(r => String(r.id) === String(recordId));
    if (idx < 0) return;
    // clone to avoid accidental mutation
    arr[idx].inspections = sortByDateDesc(clone(_currentInspections || []));
    save(arr);
    // if records view is open, refresh it
    const recTab = document.getElementById("ohs_tab_records");
    if (recTab && recTab.style.background === "#f8fbff") {
      renderRecords();
    }
  }

  /* --------------- Record save / update / validation --------------- */

  function collectFormValidation() {
    const owner = document.getElementById("ohs_owner_name").value.trim();
    const addr = document.getElementById("ohs_owner_addr").value.trim();
    const nature = document.getElementById("ohs_nature").value.trim();
    const total = Number(document.getElementById("ohs_total").value || 0);
    const female = Number(document.getElementById("ohs_female").value || 0);
    const male = Number(document.getElementById("ohs_male").value || 0);
    const adminArea = document.getElementById("ohs_admin_area").value.trim();
    const hasLicense = document.getElementById("ohs_has_license").value;

    if (!owner) { alert("Owner name is required."); return null; }
    if ((female + male) > total) { alert("Female + Male cannot exceed Total."); return null; }

    // Ensure for any inspection with content, date is present
    for (const ins of _currentInspections) {
      const hasContent = (ins.actionsTaken && ins.actionsTaken.trim()) ||
        (ins.otherRemarks && ins.otherRemarks.trim()) ||
        (ins.environment && Object.values(ins.environment).some(v => v && String(v).trim())) ||
        (ins.sanitation && Object.values(ins.sanitation).some(v => v && String(v).trim())) ||
        (ins.waste && Object.values(ins.waste).some(v => v && String(v).trim())) ||
        (ins.date && ins.date.trim());
      if (hasContent && (!ins.date || !ins.date.trim())) {
        alert("Each inspection that has content must have a Date. Please edit the inspection and add a date.");
        return null;
      }
    }

    return {
      ownerName: owner,
      ownerAddr: addr,
      nature,
      total, female, male,
      adminArea, hasLicense,
      inspections: sortByDateDesc(clone(_currentInspections || []))
    };
  }

  function onSaveRecord() {
    const rec = collectFormValidation();
    if (!rec) return;
    const arr = load() || [];
    rec.id = uid();
    rec.createdAt = new Date().toISOString();
    arr.unshift(rec);
    save(arr);
    alert("Record saved.");
    // after saving, clear editing state and form (user can continue)
    _currentInspections = [];
    _editingRecordId = "";
    renderEntry();
  }

  function onUpdateRecord() {
    const upBtn = document.getElementById("ohs_update");
    const editId = upBtn.dataset.editId;
    if (!editId) { alert("No record selected to update."); return; }
    const rec = collectFormValidation();
    if (!rec) return;
    const arr = load() || [];
    const idx = arr.findIndex(r => String(r.id) === String(editId));
    if (idx < 0) { alert("Original record not found."); return; }
    rec.id = arr[idx].id;
    rec.createdAt = arr[idx].createdAt || new Date().toISOString();
    arr[idx] = rec;
    save(arr);
    alert("Record updated.");
    // reset
    upBtn.style.display = "none";
    upBtn.dataset.editId = "";
    _editingRecordId = "";
    _currentInspections = [];
    renderRecords();
  }

  /* ---------------- Records list + filters + actions ---------------- */

  function renderRecords() {
    const root = document.getElementById("ohs_tabContent");
    if (!root) return;
    const arr = load() || [];
    const natures = [...new Set((arr || []).map(r => r.nature).filter(Boolean))].sort((a, b) => a.localeCompare(b));

    root.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 4px 18px rgba(0,0,0,0.06);">
        <h3 style="margin:0 0 12px 0;color:#073b6a;">Records</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;">
          <div style="flex:1;min-width:220px;display:flex;gap:8px;align-items:center;">
            <input id="ohs_search" placeholder="Search Owner / Address / Area" style="flex:1;padding:8px;border:1px solid #d6dde3;border-radius:6px;">
            <button id="ohs_filter_btn" style="background:#0b74d1;color:#fff;padding:8px 12px;border-radius:6px;border:none;cursor:pointer">Filter</button>
            <button id="ohs_clear_btn" style="background:#e2e8f0;padding:8px 12px;border-radius:6px;border:none;cursor:pointer">Clear</button>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <label style="color:black;font-weight:600;">Nature</label>
            <select id="ohs_nature_filter" style="padding:8px;border:1px solid #d6dde3;border-radius:6px;">
              <option value="">All Natures</option>
              ${natures.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join("")}
            </select>
          </div>
          <div style="margin-left:auto;">Total: <strong id="ohs_total_count">${arr.length}</strong></div>
        </div>

        <div style="overflow:auto;">
          <div id="rec_top_scroll" style="overflow:auto;height:18px;margin-bottom:6px;display:none;"><div id="rec_top_inner" style="height:1px"></div></div>
          <div id="rec_table_wrap" style="overflow:auto;">
            <table id="rec_table" style="width:100%;border-collapse:collapse;min-width:1100px;font-size:13px;">
              <thead style="background:#f7fafc;">
                <tr style="text-align:left;color:#2b3b4a;">
                  <th style="padding:8px;width:48px;">S/N</th>
                  <th style="padding:8px;">Owner</th>
                  <th style="padding:8px;">Address</th>
                  <th style="padding:8px;">Nature</th>
                  <th style="padding:8px;">Total</th>
                  <th style="padding:8px;">F</th>
                  <th style="padding:8px;">M</th>
                  <th style="padding:8px;">Admin Area</th>
                  <th style="padding:8px;">License</th>
                  <th style="padding:8px;width:220px;">Inspections (latest)</th>
                  <th style="padding:8px;width:180px;">Actions</th>
                </tr>
              </thead>
              <tbody id="rec_body">
                ${renderRecordsRows(arr)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // wire top-scroll sync
    setTimeout(() => {
      try {
        const wrap = document.getElementById("rec_table_wrap");
        const tbl = document.getElementById("rec_table");
        const top = document.getElementById("rec_top_scroll");
        const inner = document.getElementById("rec_top_inner");
        if (wrap && tbl && top && inner) {
          inner.style.width = tbl.scrollWidth + "px";
          top.style.display = tbl.scrollWidth > wrap.clientWidth ? "block" : "none";
          top.addEventListener("scroll", () => wrap.scrollLeft = top.scrollLeft);
          wrap.addEventListener("scroll", () => top.scrollLeft = wrap.scrollLeft);
        }
      } catch (e) { /* ignore */ }
    }, 80);

    document.getElementById("ohs_filter_btn").addEventListener("click", applyRecordFilters);
    document.getElementById("ohs_clear_btn").addEventListener("click", () => {
      document.getElementById("ohs_search").value = "";
      document.getElementById("ohs_nature_filter").value = "";
      applyRecordFilters();
    });

    attachRecordButtons();
  }

  function renderRecordsRows(arr) {
    if (!arr || !arr.length) return `<tr><td colspan="11" style="padding:12px;text-align:center;color:#666;">No records</td></tr>`;
    return arr.map((r, i) => {
      const lastIns = (r.inspections && r.inspections.length) ? sortByDateDesc(r.inspections)[0] : null;
      const snip = lastIns ? `${esc(lastIns.date)} — ${esc((lastIns.actionsTaken || "").slice(0, 80))}` : "No inspections";
      return `
        <tr data-id="${esc(r.id)}">
          <td style="padding:8px;">${i + 1}</td>
          <td style="padding:8px;">${esc(r.ownerName || "")}</td>
          <td style="padding:8px;">${esc(r.ownerAddr || "")}</td>
          <td style="padding:8px;">${esc(r.nature || "")}</td>
          <td style="padding:8px;">${esc(r.total || 0)}</td>
          <td style="padding:8px;">${esc(r.female || 0)}</td>
          <td style="padding:8px;">${esc(r.male || 0)}</td>
          <td style="padding:8px;">${esc(r.adminArea || "")}</td>
          <td style="padding:8px;">${esc(r.hasLicense || "")}</td>
          <td style="padding:8px;">${snip}</td>
          <td style="padding:8px;">
            <button class="rec_view" data-id="${esc(r.id)}" style="margin-right:6px;padding:6px 8px;border-radius:6px;background:#90caf9;border:none;cursor:pointer">View</button>
            <button class="rec_edit" data-id="${esc(r.id)}" style="margin-right:6px;padding:6px 8px;border-radius:6px;background:#ffd54f;border:none;cursor:pointer">Edit</button>
            <button class="rec_del" data-id="${esc(r.id)}" style="padding:6px 8px;border-radius:6px;background:#ef9a9a;border:none;cursor:pointer">Delete</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  function attachRecordButtons() {
    const body = document.getElementById("rec_body");
    if (!body) return;
    body.querySelectorAll(".rec_view").forEach(b => b.addEventListener("click", onViewRecord));
    body.querySelectorAll(".rec_edit").forEach(b => b.addEventListener("click", onEditRecord));
    body.querySelectorAll(".rec_del").forEach(b => b.addEventListener("click", onDeleteRecord));
    const total = document.getElementById("ohs_total_count");
    if (total) total.textContent = (load() || []).length;
  }

  function applyRecordFilters() {
    const q = (document.getElementById("ohs_search").value || "").trim().toLowerCase();
    const nature = (document.getElementById("ohs_nature_filter").value || "").trim();
    const all = load() || [];
    const filtered = all.filter(r => {
      const matchQ = !q || (r.ownerName || "").toLowerCase().includes(q) || (r.ownerAddr || "").toLowerCase().includes(q) || (r.adminArea || "").toLowerCase().includes(q);
      const matchN = !nature || (r.nature === nature);
      return matchQ && matchN;
    });
    const body = document.getElementById("rec_body");
    if (!body) return;
    body.innerHTML = renderRecordsRows(filtered);
    attachRecordButtons();
  }

  /* ---------------- Record actions ---------------- */

  function onViewRecord(e) {
    const id = e.currentTarget.dataset.id;
    const rec = (load() || []).find(x => String(x.id) === String(id));
    if (!rec) { alert("Record not found"); return; }
    showRecordModal(rec);
  }

  function showRecordModal(rec) {
    const modal = document.createElement("div");
    modal.style = "position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;box-sizing:border-box;";
    modal.innerHTML = `
      <div style="background:#fff;border-radius:10px;max-width:960px;width:100%;max-height:90vh;overflow:auto;padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <strong>Record Details</strong>
          <button id="modal_close" style="background:#eee;border:none;padding:6px 8px;border-radius:6px;cursor:pointer">Close</button>
        </div>
        <div>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tbody>
              <tr><td style="padding:6px;font-weight:700;width:220px">Owner</td><td style="padding:6px">${esc(rec.ownerName || "")}</td></tr>
              <tr><td style="padding:6px;font-weight:700">Address</td><td style="padding:6px">${esc(rec.ownerAddr || "")}</td></tr>
              <tr><td style="padding:6px;font-weight:700">Nature</td><td style="padding:6px">${esc(rec.nature || "")}</td></tr>
              <tr><td style="padding:6px;font-weight:700">Total (F/M)</td><td style="padding:6px">${esc(rec.total || 0)} (F:${esc(rec.female || 0)} / M:${esc(rec.male || 0)})</td></tr>
              <tr><td style="padding:6px;font-weight:700">Admin Area</td><td style="padding:6px">${esc(rec.adminArea || "")}</td></tr>
              <tr><td style="padding:6px;font-weight:700">Has License</td><td style="padding:6px">${esc(rec.hasLicense || "")}</td></tr>
            </tbody>
          </table>
          <hr style="margin:12px 0" />
          <div><strong>Inspections (latest first)</strong></div>
          <div style="margin-top:8px;">
            ${(rec.inspections && rec.inspections.length) ? sortByDateDesc(rec.inspections).map(ins => {
      return `<div style="border:1px solid #eef2f6;padding:8px;border-radius:6px;margin-top:8px;">
                <div style="font-weight:700;margin-bottom:6px;">${esc(ins.date || "")}</div>
                <div style="font-size:13px;">
                  <div style="font-weight:600">Environment</div>
                  ආ/වා: ${esc(ins.environment.lightingAir || "")} · තාපය: ${esc(ins.environment.heat || "")} · ශබ්ධය: ${esc(ins.environment.noise || "")}<br>
                  <div style="font-weight:600;margin-top:6px">Sanitation</div>
                  ජලය: ${esc(ins.sanitation.drinkingWater || "")} · වැසිකිලි: ${esc(ins.sanitation.toilets || "")}<br>
                  <div style="font-weight:600;margin-top:6px">Waste</div>
                  ඝණ: ${esc(ins.waste.solid || "")} · ද්‍රව: ${esc(ins.waste.liquid || "")}<br>
                  <div style="font-weight:600;margin-top:6px">Actions</div>
                  ${esc(ins.actionsTaken || "")}
                  <div style="color:#666;margin-top:6px">${esc(ins.otherRemarks || "")}</div>
                </div>
              </div>`;
    }).join("") : `<div style="color:#666;margin-top:8px;">No inspections</div>`}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector("#modal_close").addEventListener("click", () => modal.remove());
  }

  function onEditRecord(e) {
    const id = e.currentTarget.dataset.id;
    const arr = load() || [];
    const rec = arr.find(x => String(x.id) === String(id));
    if (!rec) { alert("Record not found"); return; }

    // switch to entry tab with fields populated
    document.getElementById("ohs_tab_entry").click();
    setTimeout(() => {
      document.getElementById("ohs_owner_name").value = rec.ownerName || "";
      document.getElementById("ohs_owner_addr").value = rec.ownerAddr || "";
      document.getElementById("ohs_nature").value = rec.nature || "";
      document.getElementById("ohs_total").value = rec.total || 0;
      document.getElementById("ohs_female").value = rec.female || 0;
      document.getElementById("ohs_male").value = rec.male || 0;
      document.getElementById("ohs_admin_area").value = rec.adminArea || "";
      document.getElementById("ohs_has_license").value = rec.hasLicense || "";

      // load inspections into current working copy (clone)
      _currentInspections = sortByDateDesc(clone(rec.inspections || []));
      _editingRecordId = rec.id;

      renderInspectionsTable();
      // show Update button
      const up = document.getElementById("ohs_update");
      up.style.display = "inline-block";
      up.dataset.editId = rec.id;
      document.getElementById("ohs_save").style.display = "none";
    }, 80);
  }

  async function onDeleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    if (!await showConfirm("Delete this record? This will remove it permanently.")) return;
    let arr = load() || [];
    arr = arr.filter(x => String(x.id) !== String(id));
    save(arr);
    alert("Record deleted.");
    renderRecords();
  }

  /* ---------------- Export CSV ---------------- */

  function exportAllCsv() {
    const arr = load() || [];
    if (!arr.length) { alert("No records to export."); return; }
    const header = ["RecordID", "Owner", "Address", "Nature", "Total", "Female", "Male", "AdminArea", "HasLicense", "RecordCreatedAt", "InspectionID", "InspectionDate", "Env_LightingAir", "Env_Heat", "Env_Noise", "Env_Temperature", "Env_Radiation", "Env_Ventilation", "San_DrinkingWater", "San_Toilets", "San_FoodRoom", "San_FirstAid", "San_PPE", "San_RestRoom", "Waste_Solid", "Waste_Liquid", "Waste_Gas", "ActionsTaken", "OtherRemarks"];
    const rows = [header.join(",")];
    for (const r of arr) {
      if (r.inspections && r.inspections.length) {
        for (const ins of r.inspections) {
          const row = [
            `"${(r.id || "").toString().replace(/"/g, '""')}"`,
            `"${(r.ownerName || "").toString().replace(/"/g, '""')}"`,
            `"${(r.ownerAddr || "").toString().replace(/"/g, '""')}"`,
            `"${(r.nature || "").toString().replace(/"/g, '""')}"`,
            r.total || 0, r.female || 0, r.male || 0,
            `"${(r.adminArea || "").toString().replace(/"/g, '""')}"`,
            `"${(r.hasLicense || "").toString().replace(/"/g, '""')}"`,
            `"${(r.createdAt || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.id || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.date || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.environment && ins.environment.lightingAir || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.environment && ins.environment.heat || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.environment && ins.environment.noise || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.environment && ins.environment.temperature || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.environment && ins.environment.radiation || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.environment && ins.environment.ventilation || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.sanitation && ins.sanitation.drinkingWater || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.sanitation && ins.sanitation.toilets || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.sanitation && ins.sanitation.foodRoom || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.sanitation && ins.sanitation.firstAid || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.sanitation && ins.sanitation.ppe || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.sanitation && ins.sanitation.restRoom || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.waste && ins.waste.solid || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.waste && ins.waste.liquid || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.waste && ins.waste.gas || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.actionsTaken || "").toString().replace(/"/g, '""')}"`,
            `"${(ins.otherRemarks || "").toString().replace(/"/g, '""')}"`
          ];
          rows.push(row.join(","));
        }
      } else {
        const row = [
          `"${(r.id || "").toString().replace(/"/g, '""')}"`,
          `"${(r.ownerName || "").toString().replace(/"/g, '""')}"`,
          `"${(r.ownerAddr || "").toString().replace(/"/g, '""')}"`,
          `"${(r.nature || "").toString().replace(/"/g, '""')}"`,
          r.total || 0, r.female || 0, r.male || 0,
          `"${(r.adminArea || "").toString().replace(/"/g, '""')}"`,
          `"${(r.hasLicense || "").toString().replace(/"/g, '""')}"`,
          `"${(r.createdAt || "").toString().replace(/"/g, '""')}"`,
          "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
        ];
        rows.push(row.join(","));
      }
    }
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `occupational_safety_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /* ---------------- Helpers & Expose ---------------- */
  window._occupationalSafetyHelpers = {
    load, save, uid, esc, clone, sortByDateDesc,
    state: () => ({ currentInspections: _currentInspections, editingRecordId: _editingRecordId })
  };

  // End of module
})();
