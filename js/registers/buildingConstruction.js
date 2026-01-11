/* =========================================================
   buildingConstruction.js (UPDATED)
   - Building Construction Register
   - Records table shows ALL input fields (including certificate parts)
   - Storage key: buildingConstructionRegister_v1
   - Exposes: window.openBuildingConstructionRegister()
   ========================================================= */

(function(){
  const STORAGE_KEY = "buildingConstructionRegister_v1";

  function load(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch(e){ return []; } }
  function save(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
  function uid(){ return Date.now() + Math.floor(Math.random()*9999); }
  function esc(s){ if(s===null||s===undefined) return ""; return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  const input = "width:100%;padding:9px 10px;border:1px solid #d6dde3;border-radius:8px;box-sizing:border-box;font-size:14px;";
  const labelStyle = "font-weight:600;color:#183046;";

  window.openBuildingConstructionRegister = function(title = "Building Construction Register"){
    const content = document.getElementById("contentArea");
    if(!content) return console.warn("contentArea not found");
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="margin:0;font-size:20px;color:#062238;">${esc(title)}</h2>
        <button onclick="showContent('Registers', null)" style="background:#0b74d1;color:white;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Registers වෙත</button>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:14px;">
        <button id="bc_tab_entry" class="tab active" style="padding:8px 12px;border-radius:8px;border:1px solid #e6eef8;background:#f8fbff;cursor:pointer;">දත්ත ඇතුල් කිරීම</button>
        <button id="bc_tab_records" class="tab" style="padding:8px 12px;border-radius:8px;border:1px solid #e6eef8;background:#fff;cursor:pointer;">ලේඛණය</button>
      </div>

      <div id="bc_tabContent"></div>

      <!-- view modal -->
      <div id="bc_view_modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);align-items:center;justify-content:center;z-index:9999;">
        <div style="background:#fff;padding:16px;border-radius:10px;min-width:320px;max-width:980px;box-shadow:0 12px 40px rgba(3,20,40,0.35);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <strong>Building Application Details</strong>
            <button id="bc_view_close" style="background:#eee;border:none;padding:6px 8px;border-radius:6px;cursor:pointer;">Close</button>
          </div>
          <div id="bc_view_body" style="max-height:70vh;overflow:auto;font-size:14px;color:#112;"></div>
        </div>
      </div>
    `;

    document.getElementById("bc_tab_entry").addEventListener("click", ()=>{ setActive('entry'); renderEntry(); });
    document.getElementById("bc_tab_records").addEventListener("click", ()=>{ setActive('records'); renderRecords(); });

    renderEntry();
  };

  function setActive(key){
    const e = document.getElementById("bc_tab_entry"), r = document.getElementById("bc_tab_records");
    if(!e || !r) return;
    e.classList.remove('active'); r.classList.remove('active');
    e.style.background = '#fff'; r.style.background = '#fff';
    if(key==='entry'){ e.classList.add('active'); e.style.background='#f8fbff'; }
    else { r.classList.add('active'); r.style.background='#f8fbff'; }
  }

  // ---------- Entry UI ----------
  function renderEntry(){
    const cont = document.getElementById("bc_tabContent");
    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 12px 0;color:#073b6a;">Building Construction - Data Entry</h4>

        <div style="display:grid;grid-template-columns:260px 1fr;gap:12px 18px;align-items:start;">
          <label style="${labelStyle};text-align:right;padding-right:8px;">පළාත් පාලන ආයතන යොමු අංකය</label>
          <input id="bc_refNumber" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">අයදුම්කරුගේ නම</label>
          <input id="bc_applicantName" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">ලිපිනය</label>
          <input id="bc_address" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">ස්ථානය</label>
          <input id="bc_location" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">ගොඩනැගිල්ල භාවිතා කරන්නේ (purpose)</label>
          <input id="bc_purpose" style="${input}" placeholder="e.g. නේවාසික/කාර්මික/ව්යාපාරික" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">අයදුම්පතෙහි ස්වභාවය</label>
          <input id="bc_applicationNature" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">තාවකාලික / ස්ථිර</label>
          <select id="bc_tempOrPermanent" style="${input}">
            <option value="">-- තෝරන්න --</option>
            <option value="තාවකාලික">තාවකාලික</option>
            <option value="ස්ථිර">ස්ථිර</option>
          </select>

          <label style="${labelStyle};text-align:right;padding-right:8px;">කුවිතාන්සියේ දිනය</label>
          <input id="bc_kuvitanceDate" type="date" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">වාර්තාවෙහි දිනය</label>
          <input id="bc_reportDate" type="date" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">නිර්දේශ</label>
          <input id="bc_recommendation" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">බලපත්‍රයේ දිනය</label>
          <input id="bc_licenseDate" type="date" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">යෝග්‍යතා සහතිකය නිකුත් කිරීම</label>
          <div style="display:block;padding:8px 0;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;">
              <div>
                <label style="font-weight:600;color:#183046;">අයදුම් කළ දිනය</label>
                <input id="bc_cert_appliedDate" type="date" style="${input}" />
              </div>
              <div>
                <label style="font-weight:600;color:#183046;">කුවිතාන්සියේ දිනය</label>
                <input id="bc_cert_kuvitanceDate" type="date" style="${input}" />
              </div>
              <div>
                <label style="font-weight:600;color:#183046;">වාර්තාවේ දිනය</label>
                <input id="bc_cert_reportDate" type="date" style="${input}" />
              </div>
              <div>
                <label style="font-weight:600;color:#183046;">නිර්දේශය</label>
                <input id="bc_cert_recommendation" style="${input}" />
              </div>
              <div style="grid-column:1 / -1;">
                <label style="font-weight:600;color:#183046;">නිකුත් කල දිනය</label>
                <input id="bc_cert_issuedDate" type="date" style="${input}" />
              </div>
            </div>
          </div>

          <label style="${labelStyle};text-align:right;padding-right:8px;">වෙනත් කරුණු</label>
          <textarea id="bc_other" rows="4" style="${input}"></textarea>

          <div></div>
          <div style="display:flex;gap:8px;margin-top:6px;">
            <button id="bc_save" style="background:#0b74d1;color:#fff;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">සුරකින්න</button>
            <button id="bc_update" style="background:#1976d2;color:#fff;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;display:none;">Update</button>
            <button id="bc_clear" style="background:#e2e8f0;color:#111;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">Clear</button>
            <button id="bc_goto_records" style="margin-left:auto;background:#06ad7d;color:#fff;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">View Records</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("bc_save").addEventListener("click", bcOnSave);
    document.getElementById("bc_update").addEventListener("click", bcOnUpdate);
    document.getElementById("bc_clear").addEventListener("click", ()=> {
      document.querySelectorAll("#bc_tabContent input, #bc_tabContent select, #bc_tabContent textarea").forEach(i=> i.value="");
      document.getElementById("bc_save").style.display='inline-block';
      document.getElementById("bc_update").style.display='none';
      document.getElementById("bc_update").dataset.editId = "";
    });
    document.getElementById("bc_goto_records").addEventListener("click", ()=> document.getElementById("bc_tab_records").click());
  }

  // ---------- Records UI (all inputs shown as columns) ----------
  function renderRecords(){
    const cont = document.getElementById("bc_tabContent");
    const arr = load();
    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 12px 0;color:#073b6a;">ලේඛණය (සියලු Input ක් Columns ලෙස)</h4>

        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;">
          <input id="bc_filter_text" placeholder="Ref / Applicant / Location search" style="${input};width:auto;min-width:220px;" />
          <input id="bc_filter_date" type="date" style="${input};width:auto;min-width:160px;" />
          <button id="bc_apply_filter" style="background:#0b74d1;color:#fff;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Apply</button>
          <button id="bc_clear_filter" style="background:#e2e8f0;color:#111;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Clear</button>
          <div style="margin-left:auto;font-size:14px;color:#333;">Total: <strong id="bc_total">${arr.length}</strong></div>
        </div>

        <div style="overflow:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;min-width:1400px;">
            <thead>
              <tr style="text-align:left;color:#2b3b4a;">
                <th style="width:48px;padding:6px;">S/N</th>
                <th style="padding:6px;">Ref No</th>
                <th style="padding:6px;">Applicant Name</th>
                <th style="padding:6px;">Address</th>
                <th style="padding:6px;">Location</th>
                <th style="padding:6px;">Purpose</th>
                <th style="padding:6px;">Application Nature</th>
                <th style="padding:6px;">Temp/Perm</th>
                <th style="padding:6px;">Kuvitance Date</th>
                <th style="padding:6px;">Report Date</th>
                <th style="padding:6px;">Recommendation</th>
                <th style="padding:6px;">License Date</th>
                <th style="padding:6px;">Cert Applied</th>
                <th style="padding:6px;">Cert Kuvitance</th>
                <th style="padding:6px;">Cert Report</th>
                <th style="padding:6px;">Cert Recommendation</th>
                <th style="padding:6px;">Cert Issued</th>
                <th style="padding:6px;">Other</th>
                <th style="padding:6px;width:200px;">Actions</th>
              </tr>
            </thead>
            <tbody id="bc_records_body">
              ${arr.length ? arr.map((r,i)=>`<tr data-id="${r.id}"><td style="padding:8px 6px;">${i+1}</td><td style="padding:8px 6px;">${esc(r.refNumber)}</td><td style="padding:8px 6px;">${esc(r.applicantName)}</td><td style="padding:8px 6px;">${esc(r.address)}</td><td style="padding:8px 6px;">${esc(r.location)}</td><td style="padding:8px 6px;">${esc(r.purpose)}</td><td style="padding:8px 6px;">${esc(r.applicationNature)}</td><td style="padding:8px 6px;">${esc(r.tempOrPermanent)}</td><td style="padding:8px 6px;">${esc(r.kuvitanceDate)}</td><td style="padding:8px 6px;">${esc(r.reportDate)}</td><td style="padding:8px 6px;">${esc(r.recommendation)}</td><td style="padding:8px 6px;">${esc(r.licenseDate)}</td><td style="padding:8px 6px;">${esc((r.certificate && r.certificate.appliedDate) || '')}</td><td style="padding:8px 6px;">${esc((r.certificate && r.certificate.kuvitanceDate) || '')}</td><td style="padding:8px 6px;">${esc((r.certificate && r.certificate.reportDate) || '')}</td><td style="padding:8px 6px;">${esc((r.certificate && r.certificate.recommendation) || '')}</td><td style="padding:8px 6px;">${esc((r.certificate && r.certificate.issuedDate) || '')}</td><td style="padding:8px 6px;">${esc(r.other).replace(/\n/g,'<br>')}</td><td style="padding:8px 6px;"><button class="bc_view" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#90caf9;">View</button><button class="bc_edit" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ffd54f;">Edit</button><button class="bc_delete" data-id="${r.id}" style="padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ef9a9a;">Delete</button></td></tr>`).join("") : `<tr><td colspan="19" style="padding:12px;color:#666;">No records</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById("bc_apply_filter").addEventListener("click", bcApplyFilter);
    document.getElementById("bc_clear_filter").addEventListener("click", ()=>{ document.getElementById("bc_filter_text").value=''; document.getElementById("bc_filter_date").value=''; renderRecords(); });

    document.querySelectorAll(".bc_view").forEach(b=> b.addEventListener("click", bcOnView));
    document.querySelectorAll(".bc_edit").forEach(b=> b.addEventListener("click", bcOnEdit));
    document.querySelectorAll(".bc_delete").forEach(b=> b.addEventListener("click", bcOnDelete));
    document.getElementById("bc_total").textContent = load().length;
  }

  // ---------- Handlers ----------
  function bcOnSave(){
    const rec = bcCollectFromForm();
    if(!rec) return;
    const arr = load();
    rec.id = uid();
    rec.createdAt = new Date().toISOString();
    arr.unshift(rec);
    save(arr);
    alert("Record saved.");
    document.querySelectorAll("#bc_tabContent input, #bc_tabContent select, #bc_tabContent textarea").forEach(i=> i.value="");
    if(document.getElementById("bc_tab_records").classList.contains('active')) renderRecords();
  }

  function bcOnUpdate(){
    const btn = document.getElementById("bc_update");
    const editId = btn.dataset.editId;
    if(!editId){ alert("Update සඳහා record එකක් තෝරන්න."); return; }
    const rec = bcCollectFromForm();
    if(!rec) return;
    const arr = load();
    const idx = arr.findIndex(x=> String(x.id) === String(editId));
    if(idx < 0){ alert("Original record not found."); return; }
    rec.id = arr[idx].id;
    rec.createdAt = arr[idx].createdAt || new Date().toISOString();
    arr[idx] = rec;
    save(arr);
    alert("Record updated.");
    document.getElementById("bc_save").style.display='inline-block';
    document.getElementById("bc_update").style.display='none';
    document.getElementById("bc_update").dataset.editId = "";
    document.querySelectorAll("#bc_tabContent input, #bc_tabContent select, #bc_tabContent textarea").forEach(i=> i.value="");
    if(document.getElementById("bc_tab_records").classList.contains('active')) renderRecords();
  }

  function bcCollectFromForm(){
    const refNumber = document.getElementById("bc_refNumber").value.trim();
    const applicantName = document.getElementById("bc_applicantName").value.trim();
    const address = document.getElementById("bc_address").value.trim();
    const location = document.getElementById("bc_location").value.trim();
    const purpose = document.getElementById("bc_purpose").value.trim();
    const applicationNature = document.getElementById("bc_applicationNature").value.trim();
    const tempOrPermanent = document.getElementById("bc_tempOrPermanent").value;
    const kuvitanceDate = document.getElementById("bc_kuvitanceDate").value;
    const reportDate = document.getElementById("bc_reportDate").value;
    const recommendation = document.getElementById("bc_recommendation").value.trim();
    const licenseDate = document.getElementById("bc_licenseDate").value;

    // certificate nested object
    const certAppliedDate = document.getElementById("bc_cert_appliedDate").value;
    const certKuvitanceDate = document.getElementById("bc_cert_kuvitanceDate").value;
    const certReportDate = document.getElementById("bc_cert_reportDate").value;
    const certRecommendation = document.getElementById("bc_cert_recommendation").value.trim();
    const certIssuedDate = document.getElementById("bc_cert_issuedDate").value;

    const other = document.getElementById("bc_other").value.trim();

    // minimal validation
    if(!applicantName || !address || !location){
      alert("කරුණාකර අවම වශයෙන්: අයදුම්කරුගේ නම, ලිපිනය සහ ස්ථානය ඇතුල් කරන්න.");
      return null;
    }

    const certificate = {
      appliedDate: certAppliedDate || "",
      kuvitanceDate: certKuvitanceDate || "",
      reportDate: certReportDate || "",
      recommendation: certRecommendation || "",
      issuedDate: certIssuedDate || ""
    };

    return {
      refNumber, applicantName, address, location, purpose, applicationNature, tempOrPermanent,
      kuvitanceDate, reportDate, recommendation, licenseDate, certificate, other
    };
  }

  // view
  function bcOnView(e){
    const id = e.currentTarget.dataset.id;
    const rec = load().find(x=> String(x.id) === String(id));
    if(!rec) return alert("Record not found.");
    const modal = document.getElementById("bc_view_modal");
    const body = document.getElementById("bc_view_body");
    const c = rec.certificate || {};
    body.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tbody>
          <tr><td style="padding:6px 8px;font-weight:600;width:220px;">පළාත් පාලන යොමු අංකය</td><td style="padding:6px 8px;">${esc(rec.refNumber)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">අයදුම්කරුගේ නම</td><td style="padding:6px 8px;">${esc(rec.applicantName)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ලිපිනය</td><td style="padding:6px 8px;">${esc(rec.address)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ස්ථානය</td><td style="padding:6px 8px;">${esc(rec.location)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">භාවිතය</td><td style="padding:6px 8px;">${esc(rec.purpose)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">අයදුම් ස්වභාවය</td><td style="padding:6px 8px;">${esc(rec.applicationNature)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">තාවකාලික/ස්ථිර</td><td style="padding:6px 8px;">${esc(rec.tempOrPermanent)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">කුවිතාන්සියේ දිනය</td><td style="padding:6px 8px;">${esc(rec.kuvitanceDate)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">වාර්තාවේ දිනය</td><td style="padding:6px 8px;">${esc(rec.reportDate)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">නිර්දේශ</td><td style="padding:6px 8px;">${esc(rec.recommendation)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">බලපත්‍ර දිනය</td><td style="padding:6px 8px;">${esc(rec.licenseDate)}</td></tr>

          <tr><td style="padding:6px 8px;font-weight:600;">--- යෝග්‍යතා සහතිකය ---</td><td></td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">අයදුම් කළ දිනය</td><td style="padding:6px 8px;">${esc(c.appliedDate)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">කුවිතාන්සියේ දිනය</td><td style="padding:6px 8px;">${esc(c.kuvitanceDate)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">වාර්තාවේ දිනය</td><td style="padding:6px 8px;">${esc(c.reportDate)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">නිර්දේශය</td><td style="padding:6px 8px;">${esc(c.recommendation)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">නිකුත් කල දිනය</td><td style="padding:6px 8px;">${esc(c.issuedDate)}</td></tr>

          <tr><td style="padding:6px 8px;font-weight:600;">වෙනත් කරුණු</td><td style="padding:6px 8px;">${esc(rec.other).replace(/\n/g,'<br>')}</td></tr>
        </tbody>
      </table>
    `;
    modal.style.display = "flex";
    document.getElementById("bc_view_close").onclick = ()=> modal.style.display = "none";
  }

  // edit
  function bcOnEdit(e){
    const id = e.currentTarget.dataset.id;
    const rec = load().find(x=> String(x.id) === String(id));
    if(!rec) return alert("Record not found.");
    document.getElementById("bc_tab_entry").click();
    setTimeout(()=> {
      document.getElementById("bc_refNumber").value = rec.refNumber || "";
      document.getElementById("bc_applicantName").value = rec.applicantName || "";
      document.getElementById("bc_address").value = rec.address || "";
      document.getElementById("bc_location").value = rec.location || "";
      document.getElementById("bc_purpose").value = rec.purpose || "";
      document.getElementById("bc_applicationNature").value = rec.applicationNature || "";
      document.getElementById("bc_tempOrPermanent").value = rec.tempOrPermanent || "";
      document.getElementById("bc_kuvitanceDate").value = rec.kuvitanceDate || "";
      document.getElementById("bc_reportDate").value = rec.reportDate || "";
      document.getElementById("bc_recommendation").value = rec.recommendation || "";
      document.getElementById("bc_licenseDate").value = rec.licenseDate || "";
      const c = rec.certificate || {};
      document.getElementById("bc_cert_appliedDate").value = c.appliedDate || "";
      document.getElementById("bc_cert_kuvitanceDate").value = c.kuvitanceDate || "";
      document.getElementById("bc_cert_reportDate").value = c.reportDate || "";
      document.getElementById("bc_cert_recommendation").value = c.recommendation || "";
      document.getElementById("bc_cert_issuedDate").value = c.issuedDate || "";
      document.getElementById("bc_other").value = rec.other || "";
      document.getElementById("bc_save").style.display='none';
      const up = document.getElementById("bc_update");
      up.style.display='inline-block';
      up.dataset.editId = rec.id;
    },80);
  }

  // delete
  function bcOnDelete(e){
    const id = e.currentTarget.dataset.id;
    if(!confirm("මෙම record එක මකා දමන්නද?")) return;
    let arr = load();
    arr = arr.filter(x => String(x.id) !== String(id));
    save(arr);
    alert("Record deleted.");
    if(document.getElementById("bc_tab_records").classList.contains('active')) renderRecords();
  }

  function bcApplyFilter(){
    const q = document.getElementById("bc_filter_text").value.trim().toLowerCase();
    const date = document.getElementById("bc_filter_date").value;
    let arr = load();
    if(q) arr = arr.filter(r => (r.refNumber||'').toLowerCase().includes(q) || (r.applicantName||'').toLowerCase().includes(q) || (r.location||'').toLowerCase().includes(q));
    if(date) arr = arr.filter(r => r.reportDate === date || r.kuvitanceDate === date || (r.certificate && (r.certificate.appliedDate === date || r.certificate.reportDate === date)));
    const tbody = document.getElementById("bc_records_body");
    if(!tbody) return;
    tbody.innerHTML = arr.length ? arr.map((r,i)=>`<tr data-id="${r.id}"><td style="padding:8px 6px;">${i+1}</td><td style="padding:8px 6px;">${esc(r.refNumber)}</td><td style="padding:8px 6px;">${esc(r.applicantName)}</td><td style="padding:8px 6px;">${esc(r.address)}</td><td style="padding:8px 6px;">${esc(r.location)}</td><td style="padding:8px 6px;">${esc(r.purpose)}</td><td style="padding:8px 6px;">${esc(r.applicationNature)}</td><td style="padding:8px 6px;">${esc(r.tempOrPermanent)}</td><td style="padding:8px 6px;">${esc(r.kuvitanceDate)}</td><td style="padding:8px 6px;">${esc(r.reportDate)}</td><td style="padding:8px 6px;">${esc(r.recommendation)}</td><td style="padding:8px 6px;">${esc(r.licenseDate)}</td><td style="padding:8px 6px;">${esc((r.certificate && r.certificate.appliedDate) || '')}</td><td style="padding:8px 6px;">${esc((r.certificate && r.certificate.kuvitanceDate) || '')}</td><td style="padding:8px 6px;">${esc((r.certificate && r.certificate.reportDate) || '')}</td><td style="padding:8px 6px;">${esc((r.certificate && r.certificate.recommendation) || '')}</td><td style="padding:8px 6px;">${esc((r.certificate && r.certificate.issuedDate) || '')}</td><td style="padding:8px 6px;">${esc(r.other).replace(/\n/g,'<br>')}</td><td style="padding:8px 6px;"><button class="bc_view" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#90caf9;">View</button><button class="bc_edit" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ffd54f;">Edit</button><button class="bc_delete" data-id="${r.id}" style="padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ef9a9a;">Delete</button></td></tr>`).join("") : `<tr><td colspan="19" style="padding:12px;color:#666;">No records</td></tr>`;
    document.querySelectorAll(".bc_view").forEach(b=> b.addEventListener("click", bcOnView));
    document.querySelectorAll(".bc_edit").forEach(b=> b.addEventListener("click", bcOnEdit));
    document.querySelectorAll(".bc_delete").forEach(b=> b.addEventListener("click", bcOnDelete));
    document.getElementById("bc_total").textContent = arr.length;
  }

  // wire save/update to existing buttons
  // (they are created on renderEntry, so ensure listeners exist)
  const observer = new MutationObserver(()=> {
    const saveBtn = document.getElementById("bc_save");
    if(saveBtn && !saveBtn._wired){ saveBtn.addEventListener("click", bcOnSave); saveBtn._wired = true; }
    const upBtn = document.getElementById("bc_update");
    if(upBtn && !upBtn._wired){ upBtn.addEventListener("click", bcOnUpdate); upBtn._wired = true; }
  });
  observer.observe(document.body, { childList:true, subtree:true });

})();
