/* =========================================================
   disasterPreparedness.js
   Disaster Preparedness & Response Register
   - Storage key: disasterRegister_v1
   - Tabs: Entry, Records
   - Row actions: View / Edit / Delete
   - Uses GN list from window.phiMapAPI.getGNs() or localStorage 'phi_gns_v2'
   - Exposes: window.openDisasterPreparednessRegister()
   ========================================================= */

(function(){
  const STORAGE_KEY = "disasterRegister_v1";

  function load(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch(e){ return []; } }
  function save(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
  function uid(){ return Date.now() + Math.floor(Math.random()*9999); }
  function esc(s){ if(s === null || s === undefined) return ""; return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  // try to get GN list (fn returns array of objects with properties like id,no,name)
  function getGNList(){
    try {
      if (window.phiMapAPI && typeof window.phiMapAPI.getGNs === "function") {
        return window.phiMapAPI.getGNs() || [];
      }
    } catch(e){}
    try { return JSON.parse(localStorage.getItem("phi_gns_v2") || "[]"); } catch(e){}
    return [];
  }

  const input = "width:100%;padding:9px 10px;border:1px solid #d6dde3;border-radius:8px;box-sizing:border-box;font-size:14px;";
  const labelStyle = "font-weight:600;color:#183046;";

  window.openDisasterPreparednessRegister = function(title = "Disaster Preparedness and Response Register"){
    const content = document.getElementById("contentArea");
    if(!content) return console.warn("contentArea not found");
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="margin:0;font-size:20px;color:#062238;">${esc(title)}</h2>
        <button onclick="showContent('Registers', null)" style="background:#0b74d1;color:white;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Registers වෙත</button>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:14px;">
        <button id="ds_tab_entry" class="tab active" style="padding:8px 12px;border-radius:8px;border:1px solid #e6eef8;background:#f8fbff;cursor:pointer;">දත්ත ඇතුල් කිරීම</button>
        <button id="ds_tab_records" class="tab" style="padding:8px 12px;border-radius:8px;border:1px solid #e6eef8;background:#fff;cursor:pointer;">ලේඛණය</button>
      </div>

      <div id="ds_tabContent"></div>

      <!-- view modal -->
      <div id="ds_view_modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);align-items:center;justify-content:center;z-index:9999;">
        <div style="background:#fff;padding:18px;border-radius:10px;min-width:320px;max-width:900px;box-shadow:0 12px 40px rgba(3,20,40,0.35);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <strong>Disaster Record Details</strong>
            <button id="ds_view_close" style="background:#eee;border:none;padding:6px 8px;border-radius:6px;cursor:pointer;">Close</button>
          </div>
          <div id="ds_view_body" style="max-height:70vh;overflow:auto;font-size:14px;color:#112;"></div>
        </div>
      </div>
    `;

    document.getElementById("ds_tab_entry").addEventListener("click", ()=>{ setActive('entry'); renderEntry(); });
    document.getElementById("ds_tab_records").addEventListener("click", ()=>{ setActive('records'); renderRecords(); });

    // initial
    renderEntry();
  };

  function setActive(key){
    const e = document.getElementById("ds_tab_entry"), r = document.getElementById("ds_tab_records");
    if(!e || !r) return;
    e.classList.remove('active'); r.classList.remove('active');
    e.style.background = '#fff'; r.style.background = '#fff';
    if(key==='entry'){ e.classList.add('active'); e.style.background='#f8fbff'; }
    else { r.classList.add('active'); r.style.background='#f8fbff'; }
  }

  // ---------- Entry UI ----------
  function renderEntry(){
    const cont = document.getElementById("ds_tabContent");
    const gns = getGNList();
    const gnOptions = gns.length ? gns.map(g => `<option value="${esc(g.no||g.id||g.no)}">${esc(g.no || '')}${g.name ? ' - '+esc(g.name) : ''}</option>`).join("") : `<option value="">(No GN entries)</option>`;

    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 12px 0;color:#073b6a;">දිනය සහ ප්‍රාදේශීය තොරතුරු</h4>

        <div style="display:grid;grid-template-columns:260px 1fr;gap:12px 18px;align-items:start;">
          <label style="${labelStyle};text-align:right;padding-right:8px;">වයාසනය සිදු වූ දිනය</label>
          <input id="ds_eventDate" type="date" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">ස්ථානය</label>
          <input id="ds_location" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">ග්‍රාම නිලදාරී වසම (GN No)</label>
          <select id="ds_gn_no" style="${input}">
            <option value="">-- GN No තෝරන්න --</option>
            ${gnOptions}
          </select>

          <label style="${labelStyle};text-align:right;padding-right:8px;">ප්‍රදේශය / ගම</label>
          <input id="ds_area" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">බලපෑමට ලක් වූ පවුල් ගණන</label>
          <input id="ds_affectedHouseholds" type="number" min="0" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">බලපෑමට ලක් වූ නිවැසියන් ගණන</label>
          <input id="ds_affectedResidents" type="number" min="0" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">බලපෑමට ලක් වූ ළදරුවන් (පිරිමි)</label>
          <input id="ds_childrenMale" type="number" min="0" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">බලපෑමට ලක් වූ ළදරුවන් (ගැහැණු)</label>
          <input id="ds_childrenFemale" type="number" min="0" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">බලපෑමට ලක් වූ කිරි දෙන මවුන් ගණන</label>
          <input id="ds_breastfeedingMothers" type="number" min="0" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">බලපෑමට ලක් වූ ආබාධිත පුද්ගලයන් (පිරිමි)</label>
          <input id="ds_disabledMale" type="number" min="0" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">බලපෑමට ලක් වූ ආබාධිත පුද්ගලයන් (ගැහැණු)</label>
          <input id="ds_disabledFemale" type="number" min="0" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">බලපෑමට ලක් වූ වයෝවෘධ පුද්ගලයන් (පිරිමි)</label>
          <input id="ds_elderlyMale" type="number" min="0" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">බලපෑමට ලක් වූ වයෝවෘධ පුද්ගලයන් (ගැහැණු)</label>
          <input id="ds_elderlyFemale" type="number" min="0" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">අවතැන්වූ සංඛ්‍යාව</label>
          <input id="ds_evacuatedCount" type="number" min="0" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">මියගිය සංඛ්‍යාව</label>
          <input id="ds_deathsCount" type="number" min="0" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">ටුවාල ලත් සංඛ්‍යාව</label>
          <input id="ds_injuredCount" type="number" min="0" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">අවතැන් කඳවුරු සංඛ්‍යාව</label>
          <input id="ds_shelterCount" type="number" min="0" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">අවතැන් කඳවුරු වසා දමන දිනය</label>
          <input id="ds_shelterCloseDate" type="date" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">වෙනත් කරුණු</label>
          <textarea id="ds_other" rows="4" style="${input}"></textarea>

          <div></div>
          <div style="display:flex;gap:8px;margin-top:6px;">
            <button id="ds_save" style="background:#0b74d1;color:#fff;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">සුරකින්න</button>
            <button id="ds_update" style="background:#1976d2;color:#fff;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;display:none;">Update</button>
            <button id="ds_clear" style="background:#e2e8f0;color:#111;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">Clear</button>
            <button id="ds_goto_records" style="margin-left:auto;background:#06ad7d;color:#fff;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">View Records</button>
          </div>
        </div>
      </div>
    `;

    // handlers
    document.getElementById("ds_save").addEventListener("click", dsOnSave);
    document.getElementById("ds_update").addEventListener("click", dsOnUpdate);
    document.getElementById("ds_clear").addEventListener("click", ()=> {
      document.querySelectorAll("#ds_tabContent input, #ds_tabContent select, #ds_tabContent textarea").forEach(i=> i.value="");
      document.getElementById("ds_save").style.display='inline-block';
      document.getElementById("ds_update").style.display='none';
      document.getElementById("ds_update").dataset.editId = "";
    });
    document.getElementById("ds_goto_records").addEventListener("click", ()=> document.getElementById("ds_tab_records").click());
  }

  // ---------- Records UI ----------
  function renderRecords(){
    const cont = document.getElementById("ds_tabContent");
    const arr = load();
    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 12px 0;color:#073b6a;">ලේඛණය</h4>

        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;">
          <input id="ds_filter_gn" placeholder="GN No / Location / Area" style="${input};width:auto;min-width:220px;" />
          <input id="ds_filter_date" type="date" style="${input};width:auto;min-width:160px;" />
          <button id="ds_apply_filter" style="background:#0b74d1;color:#fff;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Apply</button>
          <button id="ds_clear_filter" style="background:#e2e8f0;color:#111;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Clear</button>
          <div style="margin-left:auto;font-size:14px;color:#333;">Total: <strong id="ds_total">${arr.length}</strong></div>
        </div>

        <div style="overflow:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;min-width:1100px;">
            <thead>
              <tr style="text-align:left;color:#2b3b4a;">
                <th style="width:56px;padding:8px 6px;">S/N</th>
                <th style="padding:8px 6px;">දිනය</th>
                <th style="padding:8px 6px;">ස්ථානය</th>
                <th style="padding:8px 6px;">GN No</th>
                <th style="padding:8px 6px;">ප්‍රදේශය/ගම</th>
                <th style="padding:8px 6px;">පවුල්</th>
                <th style="padding:8px 6px;">නිවැසියන්</th>
                <th style="padding:8px 6px;">ළමුන් M / F</th>
                <th style="padding:8px 6px;">කිරි දෙන මව්වරු</th>
                <th style="padding:8px 6px;">අවතැන්</th>
                <th style="padding:8px 6px;">මරණ</th>
                <th style="padding:8px 6px;">ආබාධිත</th>
                <th style="padding:8px 6px;">කඳවුරු</th>
                <th style="padding:8px 6px;width:220px;">Actions</th>
              </tr>
            </thead>
            <tbody id="ds_records_body">
              ${arr.length ? arr.map((r,i)=>`<tr data-id="${r.id}"><td style="padding:10px 6px;">${i+1}</td><td style="padding:10px 6px;">${esc(r.eventDate)}</td><td style="padding:10px 6px;">${esc(r.location)}</td><td style="padding:10px 6px;">${esc(r.gnNo)}</td><td style="padding:10px 6px;">${esc(r.area)}</td><td style="padding:10px 6px;">${esc(r.affectedHouseholds)}</td><td style="padding:10px 6px;">${esc(r.affectedResidents)}</td><td style="padding:10px 6px;">${esc(r.childrenMale)} / ${esc(r.childrenFemale)}</td><td style="padding:10px 6px;">${esc(r.breastfeedingMothers)}</td><td style="padding:10px 6px;">${esc(r.evacuatedCount)}</td><td style="padding:10px 6px;">${esc(r.deathsCount)}</td><td style="padding:10px 6px;">${esc((r.disabledMale||0)+ ' / ' + (r.disabledFemale||0))}</td><td style="padding:10px 6px;">${esc(r.shelterCount)}${r.shelterCloseDate? ' (close:'+esc(r.shelterCloseDate)+')':''}</td><td style="padding:10px 6px;"><button class="ds_view" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#90caf9;">View</button><button class="ds_edit" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ffd54f;">Edit</button><button class="ds_delete" data-id="${r.id}" style="padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ef9a9a;">Delete</button></td></tr>`).join("") : `<tr><td colspan="14" style="padding:12px;color:#666;">No records</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById("ds_apply_filter").addEventListener("click", dsApplyFilter);
    document.getElementById("ds_clear_filter").addEventListener("click", ()=>{ document.getElementById("ds_filter_gn").value=''; document.getElementById("ds_filter_date").value=''; renderRecords(); });

    document.querySelectorAll(".ds_view").forEach(b=> b.addEventListener("click", dsOnView));
    document.querySelectorAll(".ds_edit").forEach(b=> b.addEventListener("click", dsOnEdit));
    document.querySelectorAll(".ds_delete").forEach(b=> b.addEventListener("click", dsOnDelete));
    document.getElementById("ds_total").textContent = load().length;
  }

  // ---------- Handlers ----------
  function dsOnSave(){
    const rec = dsCollectFromForm();
    if(!rec) return;
    const arr = load();
    rec.id = uid();
    rec.createdAt = new Date().toISOString();
    arr.unshift(rec);
    save(arr);
    alert("Record saved.");
    document.querySelectorAll("#ds_tabContent input, #ds_tabContent select, #ds_tabContent textarea").forEach(i=> i.value="");
    if(document.getElementById("ds_tab_records").classList.contains('active')) renderRecords();
  }

  function dsOnUpdate(){
    const btn = document.getElementById("ds_update");
    const editId = btn.dataset.editId;
    if(!editId){ alert("Update කිරීමට record එකක් තෝරන්න."); return; }
    const rec = dsCollectFromForm();
    if(!rec) return;
    const arr = load();
    const idx = arr.findIndex(x=> String(x.id) === String(editId));
    if(idx < 0){ alert("Original record not found."); return; }
    rec.id = arr[idx].id;
    rec.createdAt = arr[idx].createdAt || new Date().toISOString();
    arr[idx] = rec;
    save(arr);
    alert("Record updated.");
    document.getElementById("ds_save").style.display='inline-block';
    document.getElementById("ds_update").style.display='none';
    document.getElementById("ds_update").dataset.editId = "";
    document.querySelectorAll("#ds_tabContent input, #ds_tabContent select, #ds_tabContent textarea").forEach(i=> i.value="");
    if(document.getElementById("ds_tab_records").classList.contains('active')) renderRecords();
  }

  function dsCollectFromForm(){
    const eventDate = document.getElementById("ds_eventDate").value;
    const location = document.getElementById("ds_location").value.trim();
    const gnNo = document.getElementById("ds_gn_no").value;
    const area = document.getElementById("ds_area").value.trim();
    const affectedHouseholds = Number(document.getElementById("ds_affectedHouseholds").value || 0);
    const affectedResidents = Number(document.getElementById("ds_affectedResidents").value || 0);
    const childrenMale = Number(document.getElementById("ds_childrenMale").value || 0);
    const childrenFemale = Number(document.getElementById("ds_childrenFemale").value || 0);
    const breastfeedingMothers = Number(document.getElementById("ds_breastfeedingMothers").value || 0);
    const disabledMale = Number(document.getElementById("ds_disabledMale").value || 0);
    const disabledFemale = Number(document.getElementById("ds_disabledFemale").value || 0);
    const elderlyMale = Number(document.getElementById("ds_elderlyMale").value || 0);
    const elderlyFemale = Number(document.getElementById("ds_elderlyFemale").value || 0);
    const evacuatedCount = Number(document.getElementById("ds_evacuatedCount").value || 0);
    const deathsCount = Number(document.getElementById("ds_deathsCount").value || 0);
    const injuredCount = Number(document.getElementById("ds_injuredCount").value || 0);
    const shelterCount = Number(document.getElementById("ds_shelterCount").value || 0);
    const shelterCloseDate = document.getElementById("ds_shelterCloseDate").value;
    const other = document.getElementById("ds_other").value.trim();

    if(!eventDate){ alert("කරුණාකර ව්‍යසනය සිදු වූ දිනය ඇතුල් කරන්න."); return null; }
    if(!location){ alert("ස්ථානය ඇතුල් කරන්න."); return null; }

    return {
      eventDate, location, gnNo, area,
      affectedHouseholds, affectedResidents,
      childrenMale, childrenFemale, breastfeedingMothers,
      disabledMale, disabledFemale, elderlyMale, elderlyFemale,
      evacuatedCount, deathsCount, injuredCount, shelterCount, shelterCloseDate, other
    };
  }

  function dsOnView(e){
    const id = e.currentTarget.dataset.id;
    const rec = load().find(x=> String(x.id) === String(id));
    if(!rec) return alert("Record not found.");
    const modal = document.getElementById("ds_view_modal");
    const body = document.getElementById("ds_view_body");

    // try to resolve GN label
    let gnLabel = rec.gnNo || "";
    try {
      const gns = getGNList();
      const found = gns.find(g => String(g.no || g.id || g.no) === String(rec.gnNo));
      if(found) gnLabel = (found.no? found.no : '') + (found.name ? ' - ' + found.name : '');
    } catch(e){}

    body.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tbody>
          <tr><td style="padding:6px 8px;font-weight:600;width:240px;">වර්ෂ/දිනය</td><td style="padding:6px 8px;">${esc(rec.eventDate)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ස්ථානය</td><td style="padding:6px 8px;">${esc(rec.location)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">GN No</td><td style="padding:6px 8px;">${esc(gnLabel)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ප්‍රදේශය/ගම</td><td style="padding:6px 8px;">${esc(rec.area)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">බලපෑමට ලක් වූ පවුල් ගණන</td><td style="padding:6px 8px;">${esc(rec.affectedHouseholds)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">බලපෑමට ලක් වූ නිවැසියන් ගණන</td><td style="padding:6px 8px;">${esc(rec.affectedResidents)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ළදරු (පිරිමි / ගැහැණු)</td><td style="padding:6px 8px;">${esc(rec.childrenMale)} / ${esc(rec.childrenFemale)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">කිරි දෙන මවුන්</td><td style="padding:6px 8px;">${esc(rec.breastfeedingMothers)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ආබාධිත පුද්ගලයන් (පිරිමි / ගැහැණු)</td><td style="padding:6px 8px;">${esc(rec.disabledMale)} / ${esc(rec.disabledFemale)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">වයෝවෘධ (පිරිමි / ගැහැණු)</td><td style="padding:6px 8px;">${esc(rec.elderlyMale)} / ${esc(rec.elderlyFemale)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">අවතැන්වූ</td><td style="padding:6px 8px;">${esc(rec.evacuatedCount)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">මියගිය</td><td style="padding:6px 8px;">${esc(rec.deathsCount)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">තුවාල ලත්</td><td style="padding:6px 8px;">${esc(rec.injuredCount)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">අවතැන් කඳවුරු</td><td style="padding:6px 8px;">${esc(rec.shelterCount)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">කඳවුරු වසා දමන දිනය</td><td style="padding:6px 8px;">${esc(rec.shelterCloseDate)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">වෙනත් කරුණු</td><td style="padding:6px 8px;">${esc(rec.other).replace(/\n/g,'<br>')}</td></tr>
        </tbody>
      </table>
    `;
    modal.style.display = "flex";
    document.getElementById("ds_view_close").onclick = ()=> modal.style.display = "none";
  }

  function dsOnEdit(e){
    const id = e.currentTarget.dataset.id;
    const rec = load().find(x=> String(x.id) === String(id));
    if(!rec) return alert("Record not found.");
    document.getElementById("ds_tab_entry").click();
    setTimeout(()=> {
      document.getElementById("ds_eventDate").value = rec.eventDate || "";
      document.getElementById("ds_location").value = rec.location || "";
      document.getElementById("ds_gn_no").value = rec.gnNo || "";
      document.getElementById("ds_area").value = rec.area || "";
      document.getElementById("ds_affectedHouseholds").value = rec.affectedHouseholds ?? "";
      document.getElementById("ds_affectedResidents").value = rec.affectedResidents ?? "";
      document.getElementById("ds_childrenMale").value = rec.childrenMale ?? "";
      document.getElementById("ds_childrenFemale").value = rec.childrenFemale ?? "";
      document.getElementById("ds_breastfeedingMothers").value = rec.breastfeedingMothers ?? "";
      document.getElementById("ds_disabledMale").value = rec.disabledMale ?? "";
      document.getElementById("ds_disabledFemale").value = rec.disabledFemale ?? "";
      document.getElementById("ds_elderlyMale").value = rec.elderlyMale ?? "";
      document.getElementById("ds_elderlyFemale").value = rec.elderlyFemale ?? "";
      document.getElementById("ds_evacuatedCount").value = rec.evacuatedCount ?? "";
      document.getElementById("ds_deathsCount").value = rec.deathsCount ?? "";
      document.getElementById("ds_injuredCount").value = rec.injuredCount ?? "";
      document.getElementById("ds_shelterCount").value = rec.shelterCount ?? "";
      document.getElementById("ds_shelterCloseDate").value = rec.shelterCloseDate || "";
      document.getElementById("ds_other").value = rec.other || "";
      document.getElementById("ds_save").style.display='none';
      const up = document.getElementById("ds_update");
      up.style.display='inline-block';
      up.dataset.editId = rec.id;
    },80);
  }

  function dsOnDelete(e){
    const id = e.currentTarget.dataset.id;
    if(!confirm("මෙම record එක මකා දමන්නද?")) return;
    let arr = load();
    arr = arr.filter(x => String(x.id) !== String(id));
    save(arr);
    alert("Record deleted.");
    if(document.getElementById("ds_tab_records").classList.contains('active')) renderRecords();
  }

  function dsApplyFilter(){
    const q = document.getElementById("ds_filter_gn").value.trim().toLowerCase();
    const date = document.getElementById("ds_filter_date").value;
    let arr = load();
    if(q) arr = arr.filter(r => (r.gnNo||'').toLowerCase().includes(q) || (r.location||'').toLowerCase().includes(q) || (r.area||'').toLowerCase().includes(q));
    if(date) arr = arr.filter(r => r.eventDate === date);
    const tbody = document.getElementById("ds_records_body");
    if(!tbody) return;
    tbody.innerHTML = arr.length ? arr.map((r,i)=>`<tr data-id="${r.id}"><td style="padding:10px 6px;">${i+1}</td><td style="padding:10px 6px;">${esc(r.eventDate)}</td><td style="padding:10px 6px;">${esc(r.location)}</td><td style="padding:10px 6px;">${esc(r.gnNo)}</td><td style="padding:10px 6px;">${esc(r.area)}</td><td style="padding:10px 6px;">${esc(r.affectedHouseholds)}</td><td style="padding:10px 6px;">${esc(r.affectedResidents)}</td><td style="padding:10px 6px;">${esc(r.childrenMale)} / ${esc(r.childrenFemale)}</td><td style="padding:10px 6px;">${esc(r.breastfeedingMothers)}</td><td style="padding:10px 6px;">${esc(r.evacuatedCount)}</td><td style="padding:10px 6px;">${esc(r.deathsCount)}</td><td style="padding:10px 6px;">${esc(r.disabledMale)} / ${esc(r.disabledFemale)}</td><td style="padding:10px 6px;">${esc(r.shelterCount)}</td><td style="padding:10px 6px;"><button class="ds_view" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#90caf9;">View</button><button class="ds_edit" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ffd54f;">Edit</button><button class="ds_delete" data-id="${r.id}" style="padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ef9a9a;">Delete</button></td></tr>`).join("") : `<tr><td colspan="14" style="padding:12px;color:#666;">No records</td></tr>`;
    document.querySelectorAll(".ds_view").forEach(b=> b.addEventListener("click", dsOnView));
    document.querySelectorAll(".ds_edit").forEach(b=> b.addEventListener("click", dsOnEdit));
    document.querySelectorAll(".ds_delete").forEach(b=> b.addEventListener("click", dsOnDelete));
    document.getElementById("ds_total").textContent = arr.length;
  }

})();
