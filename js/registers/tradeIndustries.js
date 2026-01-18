/* js/registers/tradeIndustries.js
   Trade and Industries Register - FINAL
   - Inspections sorted by date (latest first)
   - Other premises: combo box (editable master list)
   - Combo options sorted A-Z
   - Filters placed inside the white box; conditional filter behavior
   - Top scrollbar for wide tables
   - Auto-persist inspections when editing a record
   Storage keys:
     - trade_industries_v1
     - trade_food_types_v1
     - trade_other_types_v1
*/
(function () {
  const STORAGE_KEY = "trade_industries_v1";
  const FOOD_TYPES_KEY = "trade_food_types_v1";
  const OTHER_TYPES_KEY = "trade_other_types_v1";

  const DEFAULT_FOOD_TYPES = [
    "Canteen", "Food Factories", "Food store", "Groceries", "Hotels",
    "Ice Manufacturing Premises", "Restaurant", "Super Markets",
    "Tea, coffee, beverages, ready to serve drinks, ice cream boutique",
    "Ice cream, confectioneries, yoghurt, curd, dessert manufacturing cottage industry",
    "Bakeries", "Catering Establishment"
  ];

  // ---------- helpers ----------
  function load(key) { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { return []; } }
  function save(key, v) { localStorage.setItem(key, JSON.stringify(v)); }
  function uid() { return Date.now() + Math.floor(Math.random() * 9999); }
  function esc(s) { if (s === null || s === undefined) return ""; return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

  // ensure master lists exist
  if (!localStorage.getItem(FOOD_TYPES_KEY)) save(FOOD_TYPES_KEY, DEFAULT_FOOD_TYPES.slice());
  if (!localStorage.getItem(OTHER_TYPES_KEY)) save(OTHER_TYPES_KEY, []);
  if (!localStorage.getItem(STORAGE_KEY)) save(STORAGE_KEY, []);

  // in-memory inspection rows while entering/editing
  let _currentInspections = [];

  // return sorted copy A-Z (case-insensitive)
  function sortedAZ(arr) {
    return (arr || []).slice().sort((a, b) => String(a).localeCompare(String(b), undefined, { sensitivity: 'base' }));
  }

  // sort inspections by date (desc: latest first). Dates are yyyy-mm-dd so lexicographic works.
  function sortInspectionsByDateDesc(arr) {
    return (arr || []).slice().sort((a, b) => {
      const da = a && a.date ? a.date : "";
      const db = b && b.date ? b.date : "";
      if (da === db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return db.localeCompare(da);
    });
  }

  // ---------- public entry point ----------
  window.openTradeRegister = function (title = "Trade and Industries Register") {
    const content = document.getElementById("contentArea");
    if (!content) return console.warn("contentArea not found");
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="margin:0">${esc(title)}</h2>
        <button onclick="showContent('Registers', null)" style="background:#0b74d1;color:white;padding:8px 12px;border:none;border-radius:8px;cursor:pointer">Registers වෙත</button>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <button id="ti_tab_entry" class="tab active" style="padding:8px 12px;border-radius:8px;background:#f8fbff;border:1px solid #e6eef8;cursor:pointer;">දත්ත ඇතුල් කිරීම</button>
        <button id="ti_tab_records" class="tab" style="padding:8px 12px;border-radius:8px;background:#fff;border:1px solid #e6eef8;cursor:pointer;">ලේඛණය</button>
      </div>

      <div id="ti_tabContent"></div>

      <div id="ti_view_modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);align-items:center;justify-content:center;z-index:9999;">
        <div style="background:#fff;padding:16px;border-radius:10px;min-width:320px;max-width:900px;box-shadow:0 12px 40px rgba(3,20,40,0.35);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <strong>Trade / Industry Details</strong>
            <button id="ti_view_close" style="background:#eee;border:none;padding:6px 8px;border-radius:6px;cursor:pointer;">Close</button>
          </div>
          <div id="ti_view_body" style="max-height:70vh;overflow:auto;font-size:14px;color:#112;"></div>
        </div>
      </div>
    `;

    document.getElementById("ti_tab_entry").addEventListener("click", () => { setActive('entry'); renderEntry(); });
    document.getElementById("ti_tab_records").addEventListener("click", () => { setActive('records'); renderRecords(); });

    renderEntry();
  };

  function setActive(key) {
    const e = document.getElementById("ti_tab_entry"), r = document.getElementById("ti_tab_records");
    if (!e || !r) return;
    e.classList.remove('active'); r.classList.remove('active');
    e.style.background = '#fff'; r.style.background = '#fff';
    if (key === 'entry') { e.classList.add('active'); e.style.background = '#f8fbff'; }
    else { r.classList.add('active'); r.style.background = '#f8fbff'; }
  }

  // ---------- Entry UI ----------
  function renderEntry() {
    const cont = document.getElementById("ti_tabContent");
    const foodTypes = sortedAZ(load(FOOD_TYPES_KEY));
    const otherTypes = sortedAZ(load(OTHER_TYPES_KEY));
    _currentInspections = [];
    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 12px 0;color:#073b6a;">Trade & Industries - Data Entry</h4>
        <div style="display:grid;grid-template-columns:260px 1fr;gap:12px 18px;align-items:start;">
          <label style="font-weight:600;color:#183046;text-align:right;padding-right:8px;">ව්‍යාපාරික ස්ථානයේ හිමිකරුගේ නම</label><input id="ti_owner_place_name" style="width:100%;padding:9px;border:1px solid #d6dde3;border-radius:8px;" />
          <label style="font-weight:600;color:#183046;text-align:right;padding-right:8px;">ලිපිනය</label><input id="ti_owner_place_addr" style="width:100%;padding:9px;border:1px solid #d6dde3;border-radius:8px;" />

          <label style="font-weight:600;color:#183046;text-align:right;padding-right:8px;">ව්‍යාපාර හිමිකරුගේ නම</label><input id="ti_business_owner_name" style="width:100%;padding:9px;border:1px solid #d6dde3;border-radius:8px;" />
          <label style="font-weight:600;color:#183046;text-align:right;padding-right:8px;">ලිපිනය</label><input id="ti_business_owner_addr" style="width:100%;padding:9px;border:1px solid #d6dde3;border-radius:8px;" />

          <label style="font-weight:600;color:#183046;text-align:right;padding-right:8px;">ව්‍යාපාරයේ ස්වභාවය</label>
          <select id="ti_business_nature" style="width:100%;padding:9px;border:1px solid #d6dde3;border-radius:8px;">
            <option value="">-- තෝරන්න --</option>
            <option value="food">Food related premises</option>
            <option value="other">Other premises</option>
          </select>

          <!-- Food type (single select) -->
          <label id="ti_food_label" style="font-weight:600;color:#183046;text-align:right;padding-right:8px;display:none;">Food Type</label>
          <div id="ti_food_select_wrap" style="display:none;">
            <div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start;">
              <select id="ti_food_select" style="width:60%;padding:9px;border:1px solid #d6dde3;border-radius:8px;height:40px;">
                <option value="">-- select food type --</option>
                ${foodTypes.map(ft => `<option value="${esc(ft)}">${esc(ft)}</option>`).join("")}
              </select>
              <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
                <input id="ti_new_food" placeholder="Add new food type" style="padding:9px;border:1px solid #d6dde3;border-radius:8px;" />
                <div style="display:flex;gap:8px;">
                  <button id="ti_add_food" style="background:#0b74d1;color:#fff;padding:8px;border-radius:8px;border:none;">Add</button>
                  <button id="ti_remove_food" style="background:#ef9a9a;color:#222;padding:8px;border-radius:8px;border:none;">Remove selected</button>
                </div>
                <div style="font-size:12px;color:#666;">Editable master list (A → Z)</div>
              </div>
            </div>
          </div>

          <!-- Other type as combo box (editable master list) -->
          <label id="ti_other_label" style="font-weight:600;color:#183046;text-align:right;padding-right:8px;display:none;">Other Type (choose)</label>
          <div id="ti_other_select_wrap" style="display:none;">
            <div style="display:flex;gap:8px;margin-bottom:8px;align-items:flex-start;">
              <select id="ti_other_select" style="width:60%;padding:9px;border:1px solid #d6dde3;border-radius:8px;height:40px;">
                <option value="">-- select other type --</option>
                ${otherTypes.map(ot => `<option value="${esc(ot)}">${esc(ot)}</option>`).join("")}
              </select>
              <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
                <input id="ti_new_other" placeholder="Add new other type" style="padding:9px;border:1px solid #d6dde3;border-radius:8px;" />
                <div style="display:flex;gap:8px;">
                  <button id="ti_add_other" style="background:#0b74d1;color:#fff;padding:8px;border-radius:8px;border:none;">Add</button>
                  <button id="ti_remove_other" style="background:#ef9a9a;color:#222;padding:8px;border-radius:8px;border:none;">Remove selected</button>
                </div>
                <div style="font-size:12px;color:#666;">Editable master list (A → Z)</div>
              </div>
            </div>
          </div>

          <label style="font-weight:600;color:#183046;text-align:right;padding-right:8px;">මුළු සේවක සංඛ්‍යාව (Total staff)</label><input id="ti_staff_total" type="number" min="0" value="0" style="width:100%;padding:9px;border:1px solid #d6dde3;border-radius:8px;" />

          <label style="font-weight:600;color:#183046;text-align:right;padding-right:8px;">සේවකයින් - ස්ත්‍රී</label><input id="ti_staff_female" type="number" min="0" value="0" style="width:100%;padding:9px;border:1px solid #d6dde3;border-radius:8px;" />
          <label style="font-weight:600;color:#183046;text-align:right;padding-right:8px;">සේවකයින් - පුරුෂ</label><input id="ti_staff_male" type="number" min="0" value="0" style="width:100%;padding:9px;border:1px solid #d6dde3;border-radius:8px;" />

          <label style="font-weight:600;color:#183046;text-align:right;padding-right:8px;">ව්‍යාපාරය ආරම්භ කළ දිනය</label><input id="ti_start_date" type="date" style="width:100%;padding:9px;border:1px solid #d6dde3;border-radius:8px;" />
          <label style="font-weight:600;color:#183046;text-align:right;padding-right:8px;">පළාත් පාලන ආයතන බල ප්‍රදේශය</label><input id="ti_admin_area" style="width:100%;padding:9px;border:1px solid #d6dde3;border-radius:8px;" />

          <label style="font-weight:600;color:#183046;text-align:right;padding-right:8px;">බලපත්‍ර ලබා ඇතිද ?</label>
          <select id="ti_has_license" style="width:100%;padding:9px;border:1px solid #d6dde3;border-radius:8px;">
            <option value="">-- තෝරන්න --</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>

          <div></div>
          <div style="display:flex;gap:8px;margin-top:6px;">
            <button id="ti_save" style="background:#0b74d1;color:#fff;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">සුරකින්න</button>
            <button id="ti_update" style="background:#1976d2;color:#fff;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;display:none;">Update</button>
            <button id="ti_clear" style="background:#e2e8f0;color:#111;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">Clear</button>
            <button id="ti_view_records" style="margin-left:auto;background:#06ad7d;color:#fff;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">View Records</button>
          </div>
        </div>

        <!-- Inspection table -->
        <div style="margin-top:14px;background:#fff;padding:12px;border-radius:10px;border:1px solid #edf2f7;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h4 style="margin:0;color:#073b6a;">පරීක්ෂණ / නිරීක්ෂණ (Inspections)</h4>
            <div style="display:flex;gap:8px;">
              <button id="ti_add_inspection_btn" style="background:#0b74d1;color:#fff;padding:8px 12px;border:none;border-radius:8px;">Add Inspection</button>
              <button id="ti_clear_inspections_btn" style="background:#ef9a9a;color:#222;padding:8px 12px;border:none;border-radius:8px;">Clear All</button>
            </div>
          </div>

          <div style="overflow:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead>
                <tr style="text-align:left;color:#2b3b4a;">
                  <th style="padding:6px;width:140px;">දිනය (Date)</th>
                  <th style="padding:6px;">නිරීක්ෂිත තත්වයන් (Observed conditions)</th>
                  <th style="padding:6px;">ගත ක්‍රියාමාර්ගය (Actions taken)</th>
                  <th style="padding:6px;">වෙනත් කරුණු (Other remarks)</th>
                  <th style="padding:6px;width:140px;">Action</th>
                </tr>
              </thead>
              <tbody id="ti_inspections_body">
                <tr><td colspan="5" style="padding:10px;color:#666;">No inspections yet. Add one with 'Add Inspection'.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // bind controls
    const nature = document.getElementById("ti_business_nature");
    const foodWrap = document.getElementById("ti_food_select_wrap");
    const foodLabel = document.getElementById("ti_food_label");
    const otherWrap = document.getElementById("ti_other_select_wrap");
    const otherLabel = document.getElementById("ti_other_label");
    const foodSelect = document.getElementById("ti_food_select");
    const newFood = document.getElementById("ti_new_food");
    const addFoodBtn = document.getElementById("ti_add_food");
    const removeFoodBtn = document.getElementById("ti_remove_food");
    const otherSelect = document.getElementById("ti_other_select");
    const newOther = document.getElementById("ti_new_other");
    const addOtherBtn = document.getElementById("ti_add_other");
    const removeOtherBtn = document.getElementById("ti_remove_other");

    function toggleNatureUI() {
      const val = nature.value;
      if (val === "food") {
        foodWrap.style.display = "block"; foodLabel.style.display = "block";
        otherWrap.style.display = "none"; otherLabel.style.display = "none";
      } else if (val === "other") {
        foodWrap.style.display = "none"; foodLabel.style.display = "none";
        otherWrap.style.display = "block"; otherLabel.style.display = "block";
      } else {
        foodWrap.style.display = "none"; foodLabel.style.display = "none";
        otherWrap.style.display = "none"; otherLabel.style.display = "none";
      }
    }
    nature.addEventListener("change", toggleNatureUI);
    toggleNatureUI();

    // food master add/remove
    addFoodBtn.addEventListener("click", () => {
      const v = newFood.value.trim();
      if (!v) return showError("Enter new food type");
      let ft = load(FOOD_TYPES_KEY);
      if (ft.includes(v)) { showWarning("Already exists"); newFood.value = ""; return; }
      ft.push(v); ft = sortedAZ(ft); save(FOOD_TYPES_KEY, ft);
      rebuildSelectOptions(foodSelect, ft);
      newFood.value = "";
    });
    removeFoodBtn.addEventListener("click", async () => {
      const selected = foodSelect.value;
      if (!selected) return alert("Select an item to remove");
      if (!await showConfirm("Remove selected food type from master list? This removes it universally.")) return;
      let ft = load(FOOD_TYPES_KEY); ft = ft.filter(x => x !== selected); save(FOOD_TYPES_KEY, ft);
      rebuildSelectOptions(foodSelect, sortedAZ(ft));
    });

    // other master add/remove
    addOtherBtn.addEventListener("click", () => {
      const v = newOther.value.trim();
      if (!v) return showError("Enter new other type");
      let ot = load(OTHER_TYPES_KEY);
      if (ot.includes(v)) { showWarning("Already exists"); newOther.value = ""; return; }
      ot.push(v); ot = sortedAZ(ot); save(OTHER_TYPES_KEY, ot);
      rebuildSelectOptions(otherSelect, ot);
      newOther.value = "";
    });
    removeOtherBtn.addEventListener("click", async () => {
      const selected = otherSelect.value;
      if (!selected) return showError("Select an item to remove");
      if (!await showConfirm("Remove selected other type from master list?")) return;
      let ot = load(OTHER_TYPES_KEY); ot = ot.filter(x => x !== selected); save(OTHER_TYPES_KEY, ot);
      rebuildSelectOptions(otherSelect, sortedAZ(ot));
    });

    function rebuildSelectOptions(sel, items) {
      sel.innerHTML = `<option value="">-- select --</option>` + (items.map(it => `<option value="${esc(it)}">${esc(it)}</option>`).join(""));
    }

    document.getElementById("ti_clear").addEventListener("click", () => {
      document.getElementById("ti_owner_place_name").value = "";
      document.getElementById("ti_owner_place_addr").value = "";
      document.getElementById("ti_business_owner_name").value = "";
      document.getElementById("ti_business_owner_addr").value = "";
      document.getElementById("ti_business_nature").value = "";
      rebuildSelectOptions(foodSelect, sortedAZ(load(FOOD_TYPES_KEY)));
      rebuildSelectOptions(otherSelect, sortedAZ(load(OTHER_TYPES_KEY)));
      document.getElementById("ti_staff_total").value = 0;
      document.getElementById("ti_staff_female").value = 0;
      document.getElementById("ti_staff_male").value = 0;
      document.getElementById("ti_start_date").value = "";
      document.getElementById("ti_admin_area").value = "";
      document.getElementById("ti_has_license").value = "";
      _currentInspections = [];
      renderInspectionsTable();
      document.getElementById("ti_save").style.display = "inline-block";
      document.getElementById("ti_update").style.display = "none";
      document.getElementById("ti_update").dataset.editId = "";
      toggleNatureUI();
    });

    document.getElementById("ti_view_records").addEventListener("click", () => document.getElementById("ti_tab_records").click());
    document.getElementById("ti_save").addEventListener("click", tiOnSave);
    document.getElementById("ti_update").addEventListener("click", tiOnUpdate);

    document.getElementById("ti_add_inspection_btn").addEventListener("click", () => {
      const newRow = { id: uid(), date: "", observed: "", actions: "", other: "" };
      _currentInspections.unshift(newRow);
      renderInspectionsTable(true, newRow.id);
    });
    document.getElementById("ti_clear_inspections_btn").addEventListener("click", async () => { if (!await showConfirm("Clear all inspections?")) return;
      _currentInspections = [];
      renderInspectionsTable();
      tryPersistIfEditing();
    });

    renderInspectionsTable();
  } // end renderEntry

  // ---------- inspections renderer + handlers ----------
  function renderInspectionsTable(focusEdit = false, editId = null) {
    const tbody = document.getElementById("ti_inspections_body");
    if (!tbody) return;
    _currentInspections = sortInspectionsByDateDesc(_currentInspections);
    if (!_currentInspections || _currentInspections.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="padding:10px;color:#666;">No inspections yet. Add one with 'Add Inspection'.</td></tr>`;
      return;
    }
    tbody.innerHTML = _currentInspections.map((ins) => {
      if (editId && String(editId) === String(ins.id)) {
        return `<tr data-ins-id="${ins.id}">
          <td style="padding:6px"><input type="date" value="${esc(ins.date || "")}" data-field="date" style="width:140px;padding:6px;border:1px solid #ccc;border-radius:6px;" /></td>
          <td style="padding:6px"><input data-field="observed" style="width:100%;padding:6px;border:1px solid #ccc;border-radius:6px;" value="${esc(ins.observed || "")}" /></td>
          <td style="padding:6px"><input data-field="actions" style="width:100%;padding:6px;border:1px solid #ccc;border-radius:6px;" value="${esc(ins.actions || "")}" /></td>
          <td style="padding:6px"><input data-field="other" style="width:100%;padding:6px;border:1px solid #ccc;border-radius:6px;" value="${esc(ins.other || "")}" /></td>
          <td style="padding:6px"><button class="ti_ins_save" data-id="${ins.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;background:#06ad7d;color:#fff;border:none;">Save</button><button class="ti_ins_cancel" data-id="${ins.id}" style="padding:6px 8px;border-radius:6px;background:#ef9a9a;border:none;">Cancel</button></td>
        </tr>`;
      } else {
        return `<tr data-ins-id="${ins.id}">
          <td style="padding:6px">${esc(ins.date)}</td>
          <td style="padding:6px">${esc(ins.observed)}</td>
          <td style="padding:6px">${esc(ins.actions)}</td>
          <td style="padding:6px">${esc(ins.other)}</td>
          <td style="padding:6px"><button class="ti_ins_edit" data-id="${ins.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;background:#ffd54f;border:none;">Edit</button><button class="ti_ins_delete" data-id="${ins.id}" style="padding:6px 8px;border-radius:6px;background:#ef9a9a;border:none;">Delete</button></td>
        </tr>`;
      }
    }).join("");

    // attach handlers
    document.querySelectorAll(".ti_ins_edit").forEach(b => b.addEventListener("click", (ev) => {
      const id = ev.currentTarget.dataset.id;
      renderInspectionsTable(true, id);
    }));
    document.querySelectorAll(".ti_ins_delete").forEach(b => b.addEventListener("click", async (ev) => {
      const id = ev.currentTarget.dataset.id;
      if (!await showConfirm("Delete this inspection?")) return;
      _currentInspections = _currentInspections.filter(x => String(x.id) !== String(id));
      renderInspectionsTable();
      tryPersistIfEditing();
    }));
    document.querySelectorAll(".ti_ins_save").forEach(b => b.addEventListener("click", (ev) => {
      const id = ev.currentTarget.dataset.id;
      const tr = document.querySelector(`tr[data-ins-id="${id}"]`);
      if (!tr) return;
      const date = tr.querySelector('[data-field="date"]').value || "";
      const observed = tr.querySelector('[data-field="observed"]').value.trim();
      const actions = tr.querySelector('[data-field="actions"]').value.trim();
      const other = tr.querySelector('[data-field="other"]').value.trim();
      const idx = _currentInspections.findIndex(x => String(x.id) === String(id));
      if (idx >= 0) _currentInspections[idx] = { id: Number(id), date, observed, actions, other };
      _currentInspections = sortInspectionsByDateDesc(_currentInspections);
      renderInspectionsTable();
      tryPersistIfEditing();
    }));
    document.querySelectorAll(".ti_ins_cancel").forEach(b => b.addEventListener("click", (ev) => {
      renderInspectionsTable();
    }));
    if (focusEdit) {
      setTimeout(() => {
        const el = document.querySelector('tr[data-ins-id="' + editId + '"] input[type="date"]');
        if (el) el.focus();
      }, 50);
    }
  }

  // If a record is currently open for editing, persist it immediately (so inspection saves are reflected)
  function tryPersistIfEditing() {
    const up = document.getElementById("ti_update");
    if (!up) return;
    const editId = up.dataset.editId;
    if (!editId) return;
    const rec = collectFormSilent();
    if (!rec) return;
    rec.inspections = sortInspectionsByDateDesc(_currentInspections);
    const arr = load(STORAGE_KEY);
    const idx = arr.findIndex(x => String(x.id) === String(editId));
    if (idx < 0) return;
    rec.id = arr[idx].id;
    rec.createdAt = arr[idx].createdAt || new Date().toISOString();
    arr[idx] = rec;
    save(STORAGE_KEY, arr);
    if (document.getElementById("ti_tab_records") && document.getElementById("ti_tab_records").classList.contains('active')) renderRecords();
  }

  // collect form silently (no alerts) for inline persisting
  function collectFormSilent() {
    const ownerPlaceName = document.getElementById("ti_owner_place_name").value.trim();
    const ownerPlaceAddr = document.getElementById("ti_owner_place_addr").value.trim();
    const businessOwnerName = document.getElementById("ti_business_owner_name").value.trim();
    const businessOwnerAddr = document.getElementById("ti_business_owner_addr").value.trim();
    const businessNature = document.getElementById("ti_business_nature").value;
    let foodType = null, otherType = null;
    if (businessNature === "food") {
      foodType = document.getElementById("ti_food_select").value || null;
    } else if (businessNature === "other") {
      otherType = document.getElementById("ti_other_select").value || null;
    }
    const staffTotal = Number(document.getElementById("ti_staff_total").value || 0);
    const staffFemale = Number(document.getElementById("ti_staff_female").value || 0);
    const staffMale = Number(document.getElementById("ti_staff_male").value || 0);
    const startDate = document.getElementById("ti_start_date").value || "";
    const adminArea = document.getElementById("ti_admin_area").value.trim();
    const hasLicense = document.getElementById("ti_has_license").value || "";

    if ((staffFemale + staffMale) > staffTotal) return null;
    if (!ownerPlaceName || !businessOwnerName) return null;

    return {
      ownerPlaceName, ownerPlaceAddr, businessOwnerName, businessOwnerAddr,
      businessNature, foodType, otherType,
      staffTotal, staffFemale, staffMale, startDate, adminArea, hasLicense,
      inspections: sortInspectionsByDateDesc(_currentInspections.slice())
    };
  }

  // full Save / Update handlers
  function tiCollectFromForm() {
    const rec = collectFormSilent();
    if (!rec) {
      showError("Validation failed: check required fields and staff totals (Female + Male ≤ Total).");
      return null;
    }
    return rec;
  }

  function tiOnSave() {
    const rec = tiCollectFromForm();
    if (!rec) return;
    const arr = load(STORAGE_KEY);
    rec.id = uid();
    rec.createdAt = new Date().toISOString();
    rec.inspections = sortInspectionsByDateDesc(rec.inspections);
    arr.unshift(rec);
    save(STORAGE_KEY, arr);
    showSuccess("Record saved.");
    document.getElementById("ti_clear").click();
    if (document.getElementById("ti_tab_records") && document.getElementById("ti_tab_records").classList.contains('active')) renderRecords();
  }

  function tiOnUpdate() {
    const btn = document.getElementById("ti_update");
    const editId = btn.dataset.editId;
    if (!editId) return showError("Update සදහා record එකක් තෝරන්න.");
    const rec = tiCollectFromForm();
    if (!rec) return;
    const arr = load(STORAGE_KEY);
    const idx = arr.findIndex(x => String(x.id) === String(editId));
    if (idx < 0) return showError("Original record not found.");
    rec.id = arr[idx].id;
    rec.createdAt = arr[idx].createdAt || new Date().toISOString();
    rec.inspections = sortInspectionsByDateDesc(rec.inspections);
    arr[idx] = rec;
    save(STORAGE_KEY, arr);
    showSuccess("Record updated.");
    document.getElementById("ti_save").style.display = "inline-block";
    document.getElementById("ti_update").style.display = "none";
    document.getElementById("ti_update").dataset.editId = "";
    document.getElementById("ti_clear").click();
    if (document.getElementById("ti_tab_records") && document.getElementById("ti_tab_records").classList.contains('active')) renderRecords();
  }

  // ---------- Records UI (final version; filters inside white box) ----------
  function renderRecords() {
    const cont = document.getElementById("ti_tabContent");
    const arr = load(STORAGE_KEY);
    const foodTypes = sortedAZ(load(FOOD_TYPES_KEY));
    const otherTypes = sortedAZ(load(OTHER_TYPES_KEY));
    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 12px 0;color:#073b6a;">Records</h4>

        <!-- top controls: search + filters (now responsive and inside the white box) -->
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;">
          <div style="flex:1;min-width:220px;max-width:520px;display:flex;gap:8px;align-items:center;">
            <input id="ti_search" placeholder="Search by owner / business / area" style="flex:1;min-width:180px;padding:9px;border:1px solid #d6dde3;border-radius:8px;" />
            <button id="ti_apply" style="background:#0b74d1;color:#fff;padding:8px;border-radius:8px;border:none;">Search</button>
            <button id="ti_clear_search" style="background:#e2e8f0;padding:8px;border-radius:8px;border:none;">Clear</button>
          </div>

          <!-- Filters: placed inside the same white box and responsive -->
          <div id="ti_filters_row" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:#fff;padding:8px;border-radius:8px;border:1px solid #eef3f7;box-sizing:border-box;flex:1;min-width:320px;">
            <div style="display:flex;gap:6px;align-items:center;min-width:120px;">
              <label style="font-weight:600;white-space:nowrap;">Nature</label>
              <select id="ti_filter_nature" style="padding:8px;border-radius:6px;border:1px solid #d6dde3;">
                <option value="">All</option>
                <option value="food">Food</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style="display:flex;gap:6px;align-items:center;min-width:220px;" id="ti_filter_type_wrap">
              <label id="ti_filter_label_dynamic" style="font-weight:600;white-space:nowrap;">Type</label>
              <select id="ti_filter_type" style="padding:8px;border-radius:6px;border:1px solid #d6dde3;min-width:160px;">
                <option value="">All</option>
                ${foodTypes.map(ft => `<option value="${esc(ft)}">${esc(ft)}</option>`).join("")}
              </select>
            </div>

            <div style="display:flex;gap:8px;align-items:center;margin-left:auto;">
              <button id="ti_filter_apply" style="background:#06ad7d;color:#fff;padding:8px;border-radius:6px;border:none;">Apply</button>
              <button id="ti_filter_clear" style="background:#ef9a9a;color:#111;padding:8px;border-radius:6px;border:none;">Clear</button>
            </div>
          </div>

          <div style="margin-left:auto;min-width:80px;text-align:right;">Total: <strong id="ti_total">${arr.length}</strong></div>
        </div>

        <!-- top scrollbar sync -->
        <div id="ti_table_top_scroll" style="overflow:auto;height:16px;margin-bottom:6px;display:none;"><div id="ti_table_top_inner" style="height:1px"></div></div>

        <div id="ti_table_wrap" style="overflow:auto;">
          <table id="ti_main_table" style="width:100%;border-collapse:collapse;font-size:13px;min-width:1200px;">
            <thead>
              <tr style="text-align:left;color:#2b3b4a;">
                <th style="width:48px;padding:6px;">S/N</th>
                <th style="padding:6px;">Owner (Place)</th>
                <th style="padding:6px;">Owner Addr</th>
                <th style="padding:6px;">Business Owner</th>
                <th style="padding:6px;">Business Owner Addr</th>
                <th style="padding:6px;">Nature</th>
                <th style="padding:6px;">Type</th>
                <th style="padding:6px;">Total Staff</th>
                <th style="padding:6px;">F</th>
                <th style="padding:6px;">M</th>
                <th style="padding:6px;">Start Date</th>
                <th style="padding:6px;">Admin Area</th>
                <th style="padding:6px;">License</th>
                <th style="padding:6px;width:160px;">Actions</th>
              </tr>
            </thead>
            <tbody id="ti_records_body">
              ${arr.length ? arr.map((r, i) => rowHtml(r, i)).join("") : `<tr><td colspan="14" style="padding:12px;color:#666;">No records</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // top scrollbar sync
    const wrap = document.getElementById("ti_table_wrap");
    const topScroll = document.getElementById("ti_table_top_scroll");
    const topInner = document.getElementById("ti_table_top_inner");
    const mainTable = document.getElementById("ti_main_table");
    setTimeout(() => {
      try { topInner.style.width = mainTable.scrollWidth + "px"; topScroll.style.display = (mainTable.scrollWidth > wrap.clientWidth) ? "block" : "none"; } catch (e) { }
    }, 80);
    topScroll.addEventListener("scroll", () => { wrap.scrollLeft = topScroll.scrollLeft; });
    wrap.addEventListener("scroll", () => { topScroll.scrollLeft = wrap.scrollLeft; });

    // filters dynamic behavior
    const filterNature = document.getElementById("ti_filter_nature");
    const filterType = document.getElementById("ti_filter_type");
    const filterLabel = document.getElementById("ti_filter_label_dynamic");

    function rebuildFilterTypeOptions() {
      const nat = filterNature.value;
      if (nat === "food") {
        const opts = sortedAZ(load(FOOD_TYPES_KEY));
        filterLabel.textContent = "Food Type";
        filterType.innerHTML = `<option value="">All</option>` + opts.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join("");
        filterType.disabled = false;
      } else if (nat === "other") {
        const opts = sortedAZ(load(OTHER_TYPES_KEY));
        filterLabel.textContent = "Other Type";
        filterType.innerHTML = `<option value="">All</option>` + opts.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join("");
        filterType.disabled = false;
      } else {
        const foods = sortedAZ(load(FOOD_TYPES_KEY));
        const others = sortedAZ(load(OTHER_TYPES_KEY));
        const merged = [...new Set([...foods, ...others])];
        filterLabel.textContent = "Type";
        filterType.innerHTML = `<option value="">All</option>` + merged.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join("");
        filterType.disabled = false;
      }
    }
    filterNature.addEventListener("change", () => { rebuildFilterTypeOptions(); });
    rebuildFilterTypeOptions();

    document.getElementById("ti_apply").addEventListener("click", () => applySearchFilter());
    document.getElementById("ti_clear_search").addEventListener("click", () => { document.getElementById("ti_search").value = ""; applySearchFilter(); });

    document.getElementById("ti_filter_apply").addEventListener("click", () => applySearchFilter());
    document.getElementById("ti_filter_clear").addEventListener("click", () => {
      document.getElementById("ti_search").value = "";
      document.getElementById("ti_filter_nature").value = "";
      rebuildFilterTypeOptions();
      document.getElementById("ti_filter_type").value = "";
      applySearchFilter();
    });

    attachRecordButtons();

    function applySearchFilter() {
      const q = document.getElementById("ti_search").value.trim().toLowerCase();
      const nature = document.getElementById("ti_filter_nature").value;
      const type = document.getElementById("ti_filter_type").value;
      const all = load(STORAGE_KEY);
      const filtered = all.filter(r => {
        if (q) {
          const hit = (r.ownerPlaceName || '').toLowerCase().includes(q) || (r.businessOwnerName || '').toLowerCase().includes(q) || (r.adminArea || '').toLowerCase().includes(q);
          if (!hit) return false;
        }
        if (nature) {
          if (r.businessNature !== nature) return false;
        }
        if (type) {
          if (nature === "food") {
            if ((r.foodType || '') !== type) return false;
          } else if (nature === "other") {
            if ((r.otherType || '') !== type) return false;
          } else {
            const both = ((r.foodType || '') === type) || ((r.otherType || '') === type);
            if (!both) return false;
          }
        }
        return true;
      });
      const tbody = document.getElementById("ti_records_body");
      tbody.innerHTML = filtered.length ? filtered.map((r, i) => rowHtml(r, i)).join("") : `<tr><td colspan="14" style="padding:12px;color:#666;">No records</td></tr>`;
      attachRecordButtons();
      document.getElementById("ti_total").textContent = filtered.length;
      setTimeout(() => { try { topInner.style.width = mainTable.scrollWidth + "px"; topScroll.style.display = (mainTable.scrollWidth > wrap.clientWidth) ? "block" : "none"; } catch (e) { } }, 80);
    }
  }

  function rowHtml(r, i) {
    const typeLabel = r.businessNature === "food" ? (r.foodType || '') : (r.otherType || '');
    return `<tr data-id="${r.id}">
      <td style="padding:8px 6px;">${i + 1}</td>
      <td style="padding:8px 6px;">${esc(r.ownerPlaceName)}</td>
      <td style="padding:8px 6px;">${esc(r.ownerPlaceAddr)}</td>
      <td style="padding:8px 6px;">${esc(r.businessOwnerName)}</td>
      <td style="padding:8px 6px;">${esc(r.businessOwnerAddr)}</td>
      <td style="padding:8px 6px;">${esc(r.businessNature)}</td>
      <td style="padding:8px 6px;">${esc(typeLabel || '')}</td>
      <td style="padding:8px 6px;">${esc(r.staffTotal || 0)}</td>
      <td style="padding:8px 6px;">${esc(r.staffFemale || 0)}</td>
      <td style="padding:8px 6px;">${esc(r.staffMale || 0)}</td>
      <td style="padding:8px 6px;">${esc(r.startDate)}</td>
      <td style="padding:8px 6px;">${esc(r.adminArea)}</td>
      <td style="padding:8px 6px;">${esc(r.hasLicense)}</td>
      <td style="padding:8px 6px;">
        <button class="ti_view" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#90caf9;">View</button>
        <button class="ti_edit" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ffd54f;">Edit</button>
        <button class="ti_delete" data-id="${r.id}" style="padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ef9a9a;">Delete</button>
      </td>
    </tr>`;
  }

  function attachRecordButtons() {
    document.querySelectorAll(".ti_view").forEach(b => { b.removeEventListener("click", tiOnView); b.addEventListener("click", tiOnView); });
    document.querySelectorAll(".ti_edit").forEach(b => { b.removeEventListener("click", tiOnEdit); b.addEventListener("click", tiOnEdit); });
    document.querySelectorAll(".ti_delete").forEach(b => { b.removeEventListener("click", tiOnDelete); b.addEventListener("click", tiOnDelete); });
    const totalEl = document.getElementById("ti_total");
    if (totalEl) totalEl.textContent = load(STORAGE_KEY).length;
  }

  // view / edit / delete handlers
  function tiOnView(e) {
    const id = e.currentTarget.dataset.id;
    const rec = load(STORAGE_KEY).find(x => String(x.id) === String(id));
    if (!rec) return showError("Record not found.");
    rec.inspections = sortInspectionsByDateDesc(rec.inspections || []);
    const modal = document.getElementById("ti_view_modal");
    const body = document.getElementById("ti_view_body");
    body.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tbody>
          <tr><td style="padding:6px 8px;font-weight:600;width:220px;">ව්‍යාපාරික ස්ථානයේ හිමිකරුගේ නම</td><td style="padding:6px 8px;">${esc(rec.ownerPlaceName)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ලිපිනය</td><td style="padding:6px 8px;">${esc(rec.ownerPlaceAddr)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ව්‍යාපාර හිමිකරුගේ නම</td><td style="padding:6px 8px;">${esc(rec.businessOwnerName)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ලිපිනය</td><td style="padding:6px 8px;">${esc(rec.businessOwnerAddr)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ව්‍යාපාරයේ ස්වභාවය</td><td style="padding:6px 8px;">${esc(rec.businessNature)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">Type</td><td style="padding:6px 8px;">${esc(rec.businessNature === 'food' ? rec.foodType : rec.otherType || '')}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">මුළු සේවක සංඛ්‍යාව</td><td style="padding:6px 8px;">${esc(rec.staffTotal || 0)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">සේවකයින් (ස්ත්‍රී)</td><td style="padding:6px 8px;">${esc(rec.staffFemale || 0)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">සේවකයින් (පුරුෂ)</td><td style="padding:6px 8px;">${esc(rec.staffMale || 0)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ව්‍යාපාර ආරම්භ දිනය</td><td style="padding:6px 8px;">${esc(rec.startDate)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">පළාත් පාලන ආයතන බල ප්‍රදේශය</td><td style="padding:6px 8px;">${esc(rec.adminArea)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">බලපත්‍ර ලබා 있는ද</td><td style="padding:6px 8px;">${esc(rec.hasLicense)}</td></tr>
          <tr><td colspan="2" style="padding:8px 8px;font-weight:600;border-top:1px solid #eee;">Inspections (latest first)</td></tr>
          ${rec.inspections && rec.inspections.length ? rec.inspections.map(ins => `<tr><td style="padding:6px 8px;width:160px;">${esc(ins.date)}</td><td style="padding:6px 8px;" colspan="1"><strong>Observed:</strong> ${esc(ins.observed)}<br><strong>Actions:</strong> ${esc(ins.actions)}<br><strong>Other:</strong> ${esc(ins.other)}</td></tr>`).join("") : `<tr><td colspan="2" style="padding:8px;color:#666;">No inspections recorded.</td></tr>`}
        </tbody>
      </table>
    `;
    modal.style.display = "flex";
    document.getElementById("ti_view_close").onclick = () => modal.style.display = "none";
  }

  function tiOnEdit(e) {
    const id = e.currentTarget.dataset.id;
    const rec = load(STORAGE_KEY).find(x => String(x.id) === String(id));
    if (!rec) return showError("Record not found.");
    document.getElementById("ti_tab_entry").click();
    setTimeout(() => {
      document.getElementById("ti_owner_place_name").value = rec.ownerPlaceName || "";
      document.getElementById("ti_owner_place_addr").value = rec.ownerPlaceAddr || "";
      document.getElementById("ti_business_owner_name").value = rec.businessOwnerName || "";
      document.getElementById("ti_business_owner_addr").value = rec.businessOwnerAddr || "";
      document.getElementById("ti_business_nature").value = rec.businessNature || "";
      // populate selects with latest master lists (sorted)
      const foods = sortedAZ(load(FOOD_TYPES_KEY));
      const others = sortedAZ(load(OTHER_TYPES_KEY));
      const foodSel = document.getElementById("ti_food_select");
      const otherSel = document.getElementById("ti_other_select");
      if (foodSel) foodSel.innerHTML = `<option value="">-- select food type --</option>` + foods.map(ft => `<option value="${esc(ft)}">${esc(ft)}</option>`).join("");
      if (otherSel) otherSel.innerHTML = `<option value="">-- select other type --</option>` + others.map(ot => `<option value="${esc(ot)}">${esc(ot)}</option>`).join("");
      if (rec.businessNature === "food") {
        if (document.getElementById("ti_food_select")) document.getElementById("ti_food_select").value = rec.foodType || "";
      } else if (rec.businessNature === "other") {
        if (document.getElementById("ti_other_select")) document.getElementById("ti_other_select").value = rec.otherType || "";
      }
      document.getElementById("ti_staff_total").value = rec.staffTotal || 0;
      document.getElementById("ti_staff_female").value = rec.staffFemale || 0;
      document.getElementById("ti_staff_male").value = rec.staffMale || 0;
      document.getElementById("ti_start_date").value = rec.startDate || "";
      document.getElementById("ti_admin_area").value = rec.adminArea || "";
      document.getElementById("ti_has_license").value = rec.hasLicense || "";
      _currentInspections = sortInspectionsByDateDesc((rec.inspections && rec.inspections.map(x => Object.assign({}, x))) || []);
      const evt = new Event('change'); document.getElementById("ti_business_nature").dispatchEvent(evt);
      renderInspectionsTable();
      document.getElementById("ti_save").style.display = "none";
      const up = document.getElementById("ti_update");
      up.style.display = "inline-block";
      up.dataset.editId = rec.id;
    }, 120);
  }

  async function tiOnDelete(e) {
    const id = e.currentTarget.dataset.id;
    if (!await showConfirm("මෙම record එක මකා දමන්නද?")) return;
    let arr = load(STORAGE_KEY);
    arr = arr.filter(x => String(x.id) !== String(id));
    save(STORAGE_KEY, arr);
    showSuccess("Record deleted.");
    if (document.getElementById("ti_tab_records") && document.getElementById("ti_tab_records").classList.contains('active')) renderRecords();
  }

  // expose small helper for debugging
  window._tradeHelpers = { load, save, sortedAZ, sortInspectionsByDateDesc };

})(); // end tradeIndustries.js
