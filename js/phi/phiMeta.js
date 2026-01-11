/* phiMeta.js
   Tab: PHI ක්ෂේත්‍ර දත්ත (Schools / GN Division / PHM Areas)
   - Storage keys:
       - phi_schools_v2
       - phi_gns_v2
       - phi_phm_v1
   - Exposes: window.renderPhiMetaTab(container)
*/
(function () {
  const SCHOOLS_KEY = "phi_schools_v2";
  const GNS_KEY = "phi_gns_v2";
  const PHM_KEY = "phi_phm_v1";
  function load(k) { try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch (e) { return []; } }
  function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function uid() { return Date.now() + Math.floor(Math.random() * 9999); }
  function esc(s) { if (s == null) return ""; return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
  const input = "width:100%;padding:9px;border:1px solid #d0d6db;border-radius:8px;box-sizing:border-box;font-size:14px;";

  window.renderPhiMetaTab = function (container) {
    if (typeof container === "string") container = document.getElementById(container);
    if (!container) return console.warn("container not found");
    const schools = load(SCHOOLS_KEY);
    const gns = load(GNS_KEY);
    const phms = load(PHM_KEY);

    const gnOptions = gns.length ? gns.map(g => `<option value="${esc(g.id)}">${esc(g.no || g.id)}${g.name ? ' - ' + esc(g.name) : ''}</option>`).join("") : `<option disabled>No GN</option>`;

    container.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;" class="phi-meta-container">
        <h4 style="margin:0 0 10px 0;color:#073b6a;">Schools</h4>
        <div class="phi-meta-form" style="display:grid;grid-template-columns:150px 1fr;gap:8px 12px;align-items:center;">
          <label style="font-weight:600;color:#000;">Name</label><input id="m_school_name" style="${input}" />
          <label style="font-weight:600;color:#000;">Reg No</label><input id="m_school_reg" style="${input}" />
          <label style="font-weight:600;color:#000;">Phone</label><input id="m_school_phone" style="${input}" />
          <div></div>
          <div style="display:flex;gap:8px;"><button id="m_school_save" style="background:#0b74d1;color:#fff;padding:8px 12px;border-radius:8px;">Save</button><button id="m_school_clear" style="padding:8px 12px;border-radius:8px;">Clear</button></div>
        </div>

        <div class="phi-meta-table-wrapper" style="margin-top:10px;overflow:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr><th style="width:48px">#</th><th>Name</th><th>Reg</th><th>Phone</th><th style="width:160px">Actions</th></tr></thead>
            <tbody id="m_schools_body">${schools.length ? schools.map((s, i) => `<tr data-id="${s.id}"><td>${i + 1}</td><td>${esc(s.name)}</td><td>${esc(s.reg)}</td><td>${esc(s.phone || '')}</td><td><button class="m_view_school" data-id="${s.id}" style="margin-right:6px">View</button><button class="m_edit_school" data-id="${s.id}" style="margin-right:6px">Edit</button><button class="m_del_school" data-id="${s.id}">Delete</button></td></tr>`).join("") : `<tr><td colspan="5" style="padding:8px;color:#666;">No schools</td></tr>`}</tbody>
          </table>
        </div>

        <hr style="margin:14px 0;" />

        <h4 style="margin:0 0 10px 0;color:#073b6a;">GN Divisions</h4>
        <div class="phi-meta-form" style="display:grid;grid-template-columns:120px 1fr;gap:8px 12px;align-items:center;">
          <label style="font-weight:600;color:#000;">GN No</label><input id="m_gn_no" style="${input}" />
          <label style="font-weight:600;color:#000;">GN Name</label><input id="m_gn_name" style="${input}" />
          <label style="font-weight:600;color:#000;">Officer</label><input id="m_gn_officer" style="${input}" />
          <label style="font-weight:600;color:#000;">Phone</label><input id="m_gn_phone" style="${input}" />
          <div></div>
          <div style="display:flex;gap:8px;"><button id="m_gn_save" style="background:#0b74d1;color:#fff;padding:8px 12px;border-radius:8px;">Save</button><button id="m_gn_clear" style="padding:8px 12px;border-radius:8px;">Clear</button></div>
        </div>

        <div class="phi-meta-table-wrapper" style="margin-top:10px;overflow:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr><th style="width:48px">#</th><th>GN No</th><th>GN Name</th><th>Officer</th><th>Phone</th><th style="width:160px">Actions</th></tr></thead>
            <tbody id="m_gns_body">${gns.length ? gns.map((g, i) => `<tr data-id="${g.id}"><td>${i + 1}</td><td>${esc(g.no)}</td><td>${esc(g.name)}</td><td>${esc(g.officer || '')}</td><td>${esc(g.phone || '')}</td><td><button class="m_view_gn" data-id="${g.id}" style="margin-right:6px">View</button><button class="m_edit_gn" data-id="${g.id}" style="margin-right:6px">Edit</button><button class="m_del_gn" data-id="${g.id}">Delete</button></td></tr>`).join("") : `<tr><td colspan="6" style="padding:8px;color:#666;">No GN divisions</td></tr>`}</tbody>
          </table>
        </div>

        <hr style="margin:14px 0;" />

        <h4 style="margin:0 0 10px 0;color:#073b6a;">PHM Areas</h4>
        <div class="phi-meta-form phi-meta-phm-form" style="display:grid;grid-template-columns:220px 1fr 1fr;gap:8px 12px;align-items:center;">
          <input id="m_phm_area" placeholder="PHM Area Name" style="${input}" />
          <select id="m_phm_gns" multiple size="4" style="${input}">${gnOptions}</select>
          <div style="display:grid;gap:8px;">
            <input id="m_phm_name" placeholder="PHM Name" style="${input}" />
            <input id="m_phm_phone" placeholder="Phone" style="${input}" />
          </div>
          <div style="grid-column:1 / -1;display:flex;gap:8px;"><button id="m_phm_save" style="background:#0b74d1;color:#fff;padding:8px 12px;border-radius:8px;">Save</button><button id="m_phm_clear" style="padding:8px 12px;border-radius:8px;">Clear</button></div>
        </div>

        <div class="phi-meta-table-wrapper" style="margin-top:10px;overflow:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr><th style="width:48px">#</th><th>PHM Area</th><th>GN Divisions</th><th>PHM Name</th><th>Phone</th><th style="width:160px">Actions</th></tr></thead>
            <tbody id="m_phm_body">${phms.length ? phms.map((p, i) => {
      const labels = (p.gnValues || []).map(v => {
        const g = gns.find(x => String(x.id) === String(v));
        return g ? (g.no ? `${g.no}${g.name ? ' - ' + g.name : ''}` : (g.name || v)) : v;
      }).join(", ");
      return `<tr data-id="${p.id}"><td>${i + 1}</td><td>${esc(p.areaName)}</td><td>${esc(labels)}</td><td>${esc(p.phmName)}</td><td>${esc(p.phone || '')}</td><td><button class="m_view_phm" data-id="${p.id}" style="margin-right:6px">View</button><button class="m_edit_phm" data-id="${p.id}" style="margin-right:6px">Edit</button><button class="m_del_phm" data-id="${p.id}">Delete</button></td></tr>`;
    }).join("") : `<tr><td colspan="6" style="padding:8px;color:#666;">No PHM areas</td></tr>`}</tbody>
          </table>
        </div>
      </div>
    `;

    // handlers for schools
    let schoolEdit = null;
    container.querySelector("#m_school_save").addEventListener("click", () => {
      const name = container.querySelector("#m_school_name").value.trim();
      const reg = container.querySelector("#m_school_reg").value.trim();
      const phone = container.querySelector("#m_school_phone").value.trim();
      if (!name && !reg) { alert("Enter school name or reg."); return; }
      const arr = load(SCHOOLS_KEY);
      if (!schoolEdit) arr.unshift({ id: uid(), name, reg, phone }); else {
        const idx = arr.findIndex(x => x.id === schoolEdit);
        if (idx >= 0) arr[idx] = { id: schoolEdit, name, reg, phone }; else arr.unshift({ id: schoolEdit, name, reg, phone });
      }
      save(SCHOOLS_KEY, arr); renderPhiMetaTab(container);
    });
    container.querySelector("#m_school_clear").addEventListener("click", () => { schoolEdit = null;["#m_school_name", "#m_school_reg", "#m_school_phone"].forEach(s => container.querySelector(s).value = ""); });

    container.querySelectorAll(".m_del_school").forEach(b => b.addEventListener("click", () => {
      if (!confirm("Delete this school?")) return;
      const id = Number(b.dataset.id);
      const arr = load(SCHOOLS_KEY).filter(x => x.id !== id);
      save(SCHOOLS_KEY, arr); renderPhiMetaTab(container);
    }));
    container.querySelectorAll(".m_edit_school").forEach(b => b.addEventListener("click", () => {
      const id = Number(b.dataset.id); const rec = load(SCHOOLS_KEY).find(x => x.id === id); if (!rec) return;
      schoolEdit = id; container.querySelector("#m_school_name").value = rec.name || ""; container.querySelector("#m_school_reg").value = rec.reg || ""; container.querySelector("#m_school_phone").value = rec.phone || "";
    }));
    container.querySelectorAll(".m_view_school").forEach(b => b.addEventListener("click", () => {
      const id = Number(b.dataset.id); const rec = load(SCHOOLS_KEY).find(x => x.id === id); if (!rec) return alert(JSON.stringify(rec, null, 2));
    }));

    // handlers for gns
    let gnEdit = null;
    container.querySelector("#m_gn_save").addEventListener("click", () => {
      const no = container.querySelector("#m_gn_no").value.trim();
      const name = container.querySelector("#m_gn_name").value.trim();
      const officer = container.querySelector("#m_gn_officer").value.trim();
      const phone = container.querySelector("#m_gn_phone").value.trim();
      if (!no && !name) { alert("Enter GN no or name"); return; }
      const arr = load(GNS_KEY);
      if (!gnEdit) arr.unshift({ id: uid(), no, name, officer, phone }); else {
        const idx = arr.findIndex(x => x.id === gnEdit);
        if (idx >= 0) arr[idx] = { id: gnEdit, no, name, officer, phone }; else arr.unshift({ id: gnEdit, no, name, officer, phone });
      }
      save(GNS_KEY, arr); renderPhiMetaTab(container);
    });
    container.querySelector("#m_gn_clear").addEventListener("click", () => { gnEdit = null;["#m_gn_no", "#m_gn_name", "#m_gn_officer", "#m_gn_phone"].forEach(s => container.querySelector(s).value = ""); });

    container.querySelectorAll(".m_del_gn").forEach(b => b.addEventListener("click", () => {
      if (!confirm("Delete this GN?")) return;
      const id = Number(b.dataset.id); const arr = load(GNS_KEY).filter(x => x.id !== id); save(GNS_KEY, arr); renderPhiMetaTab(container);
    }));
    container.querySelectorAll(".m_edit_gn").forEach(b => b.addEventListener("click", () => {
      const id = Number(b.dataset.id); const rec = load(GNS_KEY).find(x => x.id === id); if (!rec) return;
      gnEdit = id; container.querySelector("#m_gn_no").value = rec.no || ""; container.querySelector("#m_gn_name").value = rec.name || ""; container.querySelector("#m_gn_officer").value = rec.officer || ""; container.querySelector("#m_gn_phone").value = rec.phone || "";
    }));
    container.querySelectorAll(".m_view_gn").forEach(b => b.addEventListener("click", () => {
      const id = Number(b.dataset.id); const rec = load(GNS_KEY).find(x => x.id === id); if (!rec) return alert(JSON.stringify(rec, null, 2));
    }));

    // handlers for phm
    let phmEdit = null;
    container.querySelector("#m_phm_save").addEventListener("click", () => {
      const area = container.querySelector("#m_phm_area").value.trim();
      const selected = Array.from(container.querySelector("#m_phm_gns").selectedOptions).map(o => o.value);
      const phmName = container.querySelector("#m_phm_name").value.trim();
      const phone = container.querySelector("#m_phm_phone").value.trim();
      if (!area) { alert("PHM Area name required"); return; }
      const arr = load(PHM_KEY);
      if (!phmEdit) arr.unshift({ id: uid(), areaName: area, gnValues: selected, phmName, phone }); else {
        const idx = arr.findIndex(x => x.id === phmEdit);
        if (idx >= 0) arr[idx] = { id: phmEdit, areaName: area, gnValues: selected, phmName, phone }; else arr.unshift({ id: phmEdit, areaName: area, gnValues: selected, phmName, phone });
      }
      save(PHM_KEY, arr); renderPhiMetaTab(container);
    });
    container.querySelector("#m_phm_clear").addEventListener("click", () => { phmEdit = null;["#m_phm_area", "#m_phm_name", "#m_phm_phone"].forEach(s => container.querySelector(s).value = ""); Array.from(container.querySelector("#m_phm_gns").options).forEach(o => o.selected = false); });

    container.querySelectorAll(".m_del_phm").forEach(b => b.addEventListener("click", () => {
      if (!confirm("Delete this PHM area?")) return;
      const id = Number(b.dataset.id); const arr = load(PHM_KEY).filter(x => x.id !== id); save(PHM_KEY, arr); renderPhiMetaTab(container);
    }));
    container.querySelectorAll(".m_edit_phm").forEach(b => b.addEventListener("click", () => {
      const id = Number(b.dataset.id); const rec = load(PHM_KEY).find(x => x.id === id); if (!rec) return;
      phmEdit = id; container.querySelector("#m_phm_area").value = rec.areaName || ""; container.querySelector("#m_phm_name").value = rec.phmName || ""; container.querySelector("#m_phm_phone").value = rec.phone || "";
      const sel = container.querySelector("#m_phm_gns");
      Array.from(sel.options).forEach(o => o.selected = rec.gnValues && rec.gnValues.includes(o.value));
    }));
    container.querySelectorAll(".m_view_phm").forEach(b => b.addEventListener("click", () => {
      const id = Number(b.dataset.id); const rec = load(PHM_KEY).find(x => x.id === id); if (!rec) return alert(JSON.stringify(rec, null, 2));
    }));

    // ensure keys exist
    if (!localStorage.getItem(SCHOOLS_KEY)) localStorage.setItem(SCHOOLS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(GNS_KEY)) localStorage.setItem(GNS_KEY, JSON.stringify([]));
    if (!localStorage.getItem(PHM_KEY)) localStorage.setItem(PHM_KEY, JSON.stringify([]));
  };

})();
