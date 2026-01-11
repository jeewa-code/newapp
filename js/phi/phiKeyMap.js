(function () {
  "use strict";

  /* ================= STORAGE ================= */
  const ROLE_KEY = "phi_roles_tree_final";
  const PLACE_KEY = "phi_places_tree_final";
  const HOLIDAY_KEY = "phi_holidays_final";

  let activeEdit = null; // {type,id,subIndex}

  /* ================= HELPERS ================= */
  const $ = id => document.getElementById(id);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const load = k => JSON.parse(localStorage.getItem(k) || "[]");
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const esc = t => { const d = document.createElement("div"); d.textContent = t; return d.innerHTML; };

  /* ================= MAIN RENDER ================= */
  window.renderPhiKeyMapTab = function (container) {
    if (typeof container === "string") container = $(container);

    container.innerHTML = `
      <div class="glass phi-keymap-container" style="padding:20px">
        <h3 style="color:#0b5ea8;margin-bottom:12px">Key Map</h3>

        <select id="kmSelect" class="phi-keymap-select" style="padding:8px;margin-bottom:16px">
          <option value="role">රාජකාරිය</option>
          <option value="place">ස්ථානය</option>
          <option value="holiday">නිවාඩු</option>
        </select>

        <div id="kmBody"></div>
      </div>
    `;

    $("kmSelect").addEventListener("change", () => { activeEdit = null; renderSection(); });
    renderSection();
  };

  function renderSection() {
    const v = $("kmSelect").value;
    if (v === "role") renderMainSub("role", ROLE_KEY, "ප්‍රධාන රාජකාරිය");
    if (v === "place") renderMainSub("place", PLACE_KEY, "ප්‍රධාන ස්ථානය");
    if (v === "holiday") renderHoliday();
  }

  /* ================= ROLE / PLACE ================= */
  function renderMainSub(type, key, label) {
    const data = load(key);

    $("kmBody").innerHTML = `
      <div class="phi-keymap-input-group" style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;">
        <input id="${type}MainInput" placeholder="${label}"
               style="padding:8px;flex:1;min-width:200px;">
        <button onclick="addMain('${type}')"
                style="background:#28a745;color:#fff;border:none;padding:8px 14px;border-radius:6px">
          Add
        </button>
      </div>

      <div class="phi-keymap-table-wrapper" style="overflow-x:auto;">
        <table style="width:100%;background:#fff;border-collapse:collapse;min-width:500px;">
        <thead>
          <tr style="background:#0b5ea8;color:#fff">
            <th style="padding:10px;width:60px">No</th>
            <th style="padding:10px;width:30%">Main</th>
            <th style="padding:10px">Sub</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((r, i) => `
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:10px">${i + 1}</td>

              <td style="padding:10px;vertical-align:top">
                ${renderMainCell(type, key, r)}
              </td>

              <td style="padding:10px">
                ${r.sub.map((s, si) => renderSubCell(type, key, r, si)).join("")}

                <div style="display:flex;gap:6px;margin-top:8px">
                  <input id="sub_${r.id}" placeholder="Add sub"
                         style="flex:1;padding:6px">
                  <button onclick="addSub('${type}','${r.id}')"
                          style="background:#28a745;color:#fff;border:none;padding:6px 10px;border-radius:4px">
                    Add
                  </button>
                </div>
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
        <div style="display:flex;gap:6px">
          <input id="editMain_${r.id}" value="${esc(r.main)}"
                 style="flex:1;padding:6px">
          <button onclick="saveMain('${type}','${r.id}')"
                  style="background:#28a745;color:#fff;border:none;padding:6px 10px">Save</button>
          <button onclick="cancelEdit()"
                  style="background:#6c757d;color:#fff;border:none;padding:6px 10px">Cancel</button>
        </div>
      `;
    }

    return `
      <div ondblclick="editMainStart('${type}','${r.id}')"
           style="cursor:pointer;padding:6px;border-radius:4px"
           onmouseover="this.style.background='#f8f9fa'"
           onmouseout="this.style.background='transparent'">
        ${esc(r.main)}
        <button onclick="deleteMain('${type}','${r.id}')"
                style="margin-left:8px;background:#dc3545;color:#fff;border:none;padding:4px 8px;border-radius:4px">
          Delete
        </button>
      </div>
    `;
  }

  function renderSubCell(type, key, r, si) {
    if (activeEdit && activeEdit.type === type && activeEdit.id === r.id && activeEdit.subIndex === si) {
      return `
        <div style="display:flex;gap:6px;margin-bottom:6px">
          <input id="editSub_${r.id}_${si}" value="${esc(r.sub[si])}"
                 style="flex:1;padding:5px">
          <button onclick="saveSub('${type}','${r.id}',${si})"
                  style="background:#28a745;color:#fff;border:none;padding:4px 8px">Save</button>
          <button onclick="cancelEdit()"
                  style="background:#6c757d;color:#fff;border:none;padding:4px 8px">Cancel</button>
        </div>
      `;
    }

    return `
      <div ondblclick="editSubStart('${type}','${r.id}',${si})"
           style="display:flex;align-items:center;gap:6px;
                  background:#f8f9fa;padding:6px;border-radius:4px;margin-bottom:6px">
        <span style="flex:1">${esc(r.sub[si])}</span>
        <button onclick="deleteSub('${type}','${r.id}',${si})"
                style="background:#dc3545;color:#fff;border:none;padding:4px 8px;border-radius:4px">
          Delete
        </button>
      </div>
    `;
  }

  /* ================= HOLIDAY ================= */
  function renderHoliday() {
    const d = load(HOLIDAY_KEY);

    $("kmBody").innerHTML = `
      <div class="phi-keymap-input-group" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
        <input id="holidayInput" placeholder="නිවාඩු නාමය"
               style="padding:8px;flex:1;min-width:200px;">
        <button onclick="addHoliday()"
                style="background:#28a745;color:#fff;border:none;padding:8px 14px;border-radius:6px">
          Add
        </button>
      </div>

      <div class="phi-keymap-table-wrapper" style="overflow-x:auto;">
        <table style="width:100%;background:#fff;min-width:400px;">
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
    const i = $(`sub_${id}`);
    if (!i.value.trim()) return;
    const d = load(key);
    d.find(x => x.id === id).sub.push(i.value.trim());
    save(key, d); renderSection();
  };

  window.saveSub = (type, id, si) => {
    const key = type === "role" ? ROLE_KEY : PLACE_KEY;
    const d = load(key);
    d.find(x => x.id === id).sub[si] = $(`editSub_${id}_${si}`).value.trim();
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

})();
