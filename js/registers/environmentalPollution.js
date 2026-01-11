/* =========================================================
   environmentalPollution.js
   Environmental Pollution & Public Complaints Register
   - Tabs: Data entry, Records
   - Row actions: View / Edit / Delete
   - Storage key: envPollutionRegister
   - Exposes: window.openEnvironmentalPollutionRegister()
   ========================================================= */

(function(){
  const STORAGE_KEY = "envPollutionRegister";

  function load(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch(e) { return []; } }
  function save(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
  function uid(){ return Date.now() + Math.floor(Math.random()*9999); }
  function esc(s){ if(s===null||s===undefined) return ""; return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  const input = "width:100%;padding:9px 10px;border:1px solid #d6dde3;border-radius:8px;box-sizing:border-box;font-size:14px;";
  const labelStyle = "font-weight:600;color:#183046;";

  window.openEnvironmentalPollutionRegister = function(title = "Environmental Pollution and Public Complaints Register"){
    const content = document.getElementById("contentArea");
    if(!content) return console.warn("contentArea not found");
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="margin:0;font-size:20px;color:#062238;">${esc(title)}</h2>
        <button onclick="showContent('Registers', null)" style="background:#0b74d1;color:white;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Registers වෙත</button>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:14px;">
        <button id="ep_tab_entry" class="tab active" style="padding:8px 12px;border-radius:8px;border:1px solid #e6eef8;background:#f8fbff;cursor:pointer;">පැමිණිල්ල / දත්ත ඇතුල් කිරීම</button>
        <button id="ep_tab_records" class="tab" style="padding:8px 12px;border-radius:8px;border:1px solid #e6eef8;background:#fff;cursor:pointer;">ලේඛණය</button>
      </div>

      <div id="ep_tabContent"></div>

      <!-- View modal -->
      <div id="ep_view_modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);align-items:center;justify-content:center;z-index:9999;">
        <div style="background:#fff;padding:18px;border-radius:10px;min-width:320px;max-width:760px;box-shadow:0 12px 40px rgba(3,20,40,0.35);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <strong>Complaint Details</strong>
            <button id="ep_view_close" style="background:#eee;border:none;padding:6px 8px;border-radius:6px;cursor:pointer;">Close</button>
          </div>
          <div id="ep_view_body" style="max-height:60vh;overflow:auto;font-size:14px;color:#112;"></div>
        </div>
      </div>
    `;

    document.getElementById("ep_tab_entry").addEventListener("click", ()=>{ setActive('entry'); renderEntry(); });
    document.getElementById("ep_tab_records").addEventListener("click", ()=>{ setActive('records'); renderRecords(); });

    renderEntry();
  };

  function setActive(which){
    const e = document.getElementById("ep_tab_entry");
    const r = document.getElementById("ep_tab_records");
    if(!e||!r) return;
    e.classList.remove('active'); r.classList.remove('active');
    e.style.background='#fff'; r.style.background='#fff';
    if(which==='entry'){ e.classList.add('active'); e.style.background='#f8fbff'; }
    else { r.classList.add('active'); r.style.background='#f8fbff'; }
  }

  // ---------- Entry UI ----------
  function renderEntry(){
    const cont = document.getElementById("ep_tabContent");
    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 12px 0;color:#073b6a;">පැමිණිල්ල / දත්ත ඇතුල් කිරීම</h4>
        <div style="display:grid;grid-template-columns:260px 1fr;gap:12px 18px;align-items:start;">
          <label style="${labelStyle};text-align:right;padding-right:8px;">දිනය</label>
          <input id="ep_date" type="date" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">පැමිණිලිකරුගේ නම</label>
          <input id="ep_complainantName" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">පැමිණිලිකරුගේ ලිපිනය</label>
          <input id="ep_complainantAddress" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">පැමිණිල්ලේ / දූෂණයේ ස්වභාවය</label>
          <input id="ep_nature" style="${input}" placeholder="e.g. කල්පවතින දූෂණය, ශබ්ද, වායු දූෂණය" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">පැමිණිල්ල ලැබුණු ආකාරය</label>
          <select id="ep_receivedBy" style="${input}">
            <option value="">-- තෝරන්න --</option>
            <option value="ලිඛිතව">ලිඛිතව</option>
            <option value="වාචිකව">වාචිකව</option>
            <option value="දුරකථන මාර්ගයෙන්">දුරකථන මාර්ගයෙන්</option>
            <option value="වෙනත්">වෙනත්</option>
          </select>

          <label style="${labelStyle};text-align:right;padding-right:8px;">පරික්ෂා කල දිනය</label>
          <input id="ep_inspectionDate" type="date" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">ගත් ක්‍රියාමාර්ගය</label>
          <textarea id="ep_actionsTaken" rows="3" style="${input}"></textarea>

          <label style="${labelStyle};text-align:right;padding-right:8px;">ප්‍රතිඵලය</label>
          <input id="ep_result" style="${input}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">වෙනත් කරුණු</label>
          <textarea id="ep_other" rows="3" style="${input}"></textarea>

          <div></div>
          <div style="display:flex;gap:8px;margin-top:6px;">
            <button id="ep_save" style="background:#0b74d1;color:#fff;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">සුරකින්න</button>
            <button id="ep_update" style="background:#1976d2;color:#fff;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;display:none;">Update</button>
            <button id="ep_clear" style="background:#e2e8f0;color:#111;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">Clear</button>
            <button id="ep_goto_records" style="margin-left:auto;background:#06ad7d;color:#fff;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">View Records</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("ep_save").addEventListener("click", onSave);
    document.getElementById("ep_update").addEventListener("click", onUpdate);
    document.getElementById("ep_clear").addEventListener("click", ()=> {
      document.querySelectorAll("#ep_tabContent input, #ep_tabContent select, #ep_tabContent textarea").forEach(i=> i.value="");
      document.getElementById("ep_save").style.display='inline-block';
      document.getElementById("ep_update").style.display='none';
      document.getElementById("ep_update").dataset.editId = "";
    });
    document.getElementById("ep_goto_records").addEventListener("click", ()=> document.getElementById("ep_tab_records").click());
  }

  // ---------- Records UI ----------
  function renderRecords(){
    const cont = document.getElementById("ep_tabContent");
    const arr = load();
    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 12px 0;color:#073b6a;">ලේඛණය</h4>

        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;">
          <input id="ep_filter_name" placeholder="Complainant / Nature search" style="${input};width:auto;min-width:200px;" />
          <select id="ep_filter_received" style="${input};width:auto;">
            <option value="">All received types</option>
            <option>ලිඛිතව</option><option>වාචිකව</option><option>දුරකථන මාර්ගයෙන්</option><option>වෙනත්</option>
          </select>
          <button id="ep_apply_filter" style="background:#0b74d1;color:#fff;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Apply</button>
          <button id="ep_clear_filter" style="background:#e2e8f0;color:#111;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Clear</button>
          <div style="margin-left:auto;font-size:14px;color:#333;">Total: <strong id="ep_total">${arr.length}</strong></div>
        </div>

        <div style="overflow:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;min-width:1000px;">
            <thead>
              <tr style="text-align:left;color:#2b3b4a;">
                <th style="width:56px;padding:8px 6px;">S/N</th>
                <th style="padding:8px 6px;">දිනය</th>
                <th style="padding:8px 6px;">පැමිණිලිකරුගේ නම</th>
                <th style="padding:8px 6px;">ලිපිනය</th>
                <th style="padding:8px 6px;">පැමිණිල්ලේ ස්වභාවය</th>
                <th style="padding:8px 6px;">ලැබුණු ආකාරය</th>
                <th style="padding:8px 6px;">පරික්ෂා දිනය</th>
                <th style="padding:8px 6px;">ක්‍රියාමාර්ග</th>
                <th style="padding:8px 6px;">ප්‍රතිඵලය</th>
                <th style="padding:8px 6px;width:200px;">Actions</th>
              </tr>
            </thead>
            <tbody id="ep_records_body">
              ${arr.length ? arr.map((r,i)=>`<tr data-id="${r.id}"><td style="padding:10px 6px;">${i+1}</td><td style="padding:10px 6px;">${esc(r.date)}</td><td style="padding:10px 6px;">${esc(r.complainantName)}</td><td style="padding:10px 6px;">${esc(r.complainantAddress)}</td><td style="padding:10px 6px;">${esc(r.nature)}</td><td style="padding:10px 6px;">${esc(r.receivedBy)}</td><td style="padding:10px 6px;">${esc(r.inspectionDate)}</td><td style="padding:10px 6px;">${esc(r.actionsTaken).slice(0,60)}</td><td style="padding:10px 6px;">${esc(r.result)}</td><td style="padding:10px 6px;"><button class="ep_view" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#90caf9;">View</button><button class="ep_edit" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ffd54f;">Edit</button><button class="ep_delete" data-id="${r.id}" style="padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ef9a9a;">Delete</button></td></tr>`).join("") : `<tr><td colspan="10" style="padding:12px;color:#666;">No records</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById("ep_apply_filter").addEventListener("click", epApplyFilter);
    document.getElementById("ep_clear_filter").addEventListener("click", ()=>{ document.getElementById("ep_filter_name").value=''; document.getElementById("ep_filter_received").value=''; renderRecords(); });

    document.querySelectorAll(".ep_view").forEach(b=> b.addEventListener("click", epOnView));
    document.querySelectorAll(".ep_edit").forEach(b=> b.addEventListener("click", epOnEdit));
    document.querySelectorAll(".ep_delete").forEach(b=> b.addEventListener("click", epOnDelete));
    document.getElementById("ep_total").textContent = load().length;
  }

  // ---------- Handlers ----------
  function onSave(){
    const rec = collectFromForm();
    if(!rec) return;
    const arr = load();
    rec.id = uid();
    rec.createdAt = new Date().toISOString();
    arr.unshift(rec);
    save(arr);
    alert("Record saved.");
    // clear form
    document.querySelectorAll("#ep_tabContent input, #ep_tabContent select, #ep_tabContent textarea").forEach(i=> i.value="");
    // refresh records if active
    if(document.getElementById("ep_tab_records").classList.contains('active')) renderRecords();
  }

  function onUpdate(){
    const btn = document.getElementById("ep_update");
    const editId = btn.dataset.editId;
    if(!editId) { alert("Update සඳහා record එකක් තෝරන්න."); return; }
    const rec = collectFromForm();
    if(!rec) return;
    const arr = load();
    const idx = arr.findIndex(x=> String(x.id) === String(editId));
    if(idx<0) { alert("Original record not found."); return; }
    rec.id = arr[idx].id;
    rec.createdAt = arr[idx].createdAt || new Date().toISOString();
    arr[idx] = rec;
    save(arr);
    alert("Record updated.");
    // reset form UI
    document.getElementById("ep_save").style.display='inline-block';
    document.getElementById("ep_update").style.display='none';
    document.getElementById("ep_update").dataset.editId = "";
    document.querySelectorAll("#ep_tabContent input, #ep_tabContent select, #ep_tabContent textarea").forEach(i=> i.value="");
    if(document.getElementById("ep_tab_records").classList.contains('active')) renderRecords();
  }

  function collectFromForm(){
    const date = document.getElementById("ep_date").value;
    const complainantName = document.getElementById("ep_complainantName").value.trim();
    const complainantAddress = document.getElementById("ep_complainantAddress").value.trim();
    const nature = document.getElementById("ep_nature").value.trim();
    const receivedBy = document.getElementById("ep_receivedBy").value;
    const inspectionDate = document.getElementById("ep_inspectionDate").value;
    const actionsTaken = document.getElementById("ep_actionsTaken").value.trim();
    const result = document.getElementById("ep_result").value.trim();
    const other = document.getElementById("ep_other").value.trim();

    if(!date || !complainantName || !complainantAddress){
      alert("කරුණාකර අවම වශයෙන්: දිනය, පැමිණිලිකරුගේ නම, ලිපිනය ඇතුල් කරන්න.");
      return null;
    }

    return { date, complainantName, complainantAddress, nature, receivedBy, inspectionDate, actionsTaken, result, other };
  }

  // view
  function epOnView(e){
    const id = e.currentTarget.dataset.id;
    const rec = load().find(x=> String(x.id) === String(id));
    if(!rec) return alert("Record not found.");
    const modal = document.getElementById("ep_view_modal");
    const body = document.getElementById("ep_view_body");
    body.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tbody>
          <tr><td style="padding:6px 8px;font-weight:600;width:200px;">දිනය</td><td style="padding:6px 8px;">${esc(rec.date)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">පැමිණිලිකරුගේ නම</td><td style="padding:6px 8px;">${esc(rec.complainantName)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">පැමිණිලිකරුගේ ලිපිනය</td><td style="padding:6px 8px;">${esc(rec.complainantAddress)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">පැමිණිල්ලේ / දූෂණයේ ස්වභාවය</td><td style="padding:6px 8px;">${esc(rec.nature)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">පැමිණිල්ල ලැබුණු ආකාරය</td><td style="padding:6px 8px;">${esc(rec.receivedBy)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">පරික්ෂා කල දිනය</td><td style="padding:6px 8px;">${esc(rec.inspectionDate)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ගත් ක්‍රියාමාර්ගය</td><td style="padding:6px 8px;">${esc(rec.actionsTaken).replace(/\n/g,'<br>')}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ප්‍රතිඵලය</td><td style="padding:6px 8px;">${esc(rec.result)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">වෙනත්</td><td style="padding:6px 8px;">${esc(rec.other).replace(/\n/g,'<br>')}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">Created</td><td style="padding:6px 8px;">${esc(rec.createdAt||'')}</td></tr>
        </tbody>
      </table>
    `;
    modal.style.display = "flex";
    document.getElementById("ep_view_close").onclick = ()=> modal.style.display = "none";
  }

  // edit
  function epOnEdit(e){
    const id = e.currentTarget.dataset.id;
    const rec = load().find(x=> String(x.id) === String(id));
    if(!rec) return alert("Record not found.");
    document.getElementById("ep_tab_entry").click();
    setTimeout(()=>{
      document.getElementById("ep_date").value = rec.date || "";
      document.getElementById("ep_complainantName").value = rec.complainantName || "";
      document.getElementById("ep_complainantAddress").value = rec.complainantAddress || "";
      document.getElementById("ep_nature").value = rec.nature || "";
      document.getElementById("ep_receivedBy").value = rec.receivedBy || "";
      document.getElementById("ep_inspectionDate").value = rec.inspectionDate || "";
      document.getElementById("ep_actionsTaken").value = rec.actionsTaken || "";
      document.getElementById("ep_result").value = rec.result || "";
      document.getElementById("ep_other").value = rec.other || "";
      document.getElementById("ep_save").style.display='none';
      const upd = document.getElementById("ep_update");
      upd.style.display='inline-block';
      upd.dataset.editId = rec.id;
    },80);
  }

  // delete
  function epOnDelete(e){
    const id = e.currentTarget.dataset.id;
    if(!confirm("මෙම record එක මකා දමන්නද?")) return;
    let arr = load();
    arr = arr.filter(x=> String(x.id) !== String(id));
    save(arr);
    alert("Record deleted.");
    if(document.getElementById("ep_tab_records").classList.contains('active')) renderRecords();
  }

  // filter apply
  function epApplyFilter(){
    const name = document.getElementById("ep_filter_name").value.trim().toLowerCase();
    const received = document.getElementById("ep_filter_received").value;
    let arr = load();
    if(name) arr = arr.filter(r => (r.complainantName||'').toLowerCase().includes(name) || (r.nature||'').toLowerCase().includes(name));
    if(received) arr = arr.filter(r => r.receivedBy === received);
    const tbody = document.getElementById("ep_records_body");
    if(!tbody) return;
    tbody.innerHTML = arr.length ? arr.map((r,i)=>`<tr data-id="${r.id}"><td style="padding:10px 6px;">${i+1}</td><td style="padding:10px 6px;">${esc(r.date)}</td><td style="padding:10px 6px;">${esc(r.complainantName)}</td><td style="padding:10px 6px;">${esc(r.complainantAddress)}</td><td style="padding:10px 6px;">${esc(r.nature)}</td><td style="padding:10px 6px;">${esc(r.receivedBy)}</td><td style="padding:10px 6px;">${esc(r.inspectionDate)}</td><td style="padding:10px 6px;">${esc(r.actionsTaken).slice(0,60)}</td><td style="padding:10px 6px;">${esc(r.result)}</td><td style="padding:10px 6px;"><button class="ep_view" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#90caf9;">View</button><button class="ep_edit" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ffd54f;">Edit</button><button class="ep_delete" data-id="${r.id}" style="padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ef9a9a;">Delete</button></td></tr>`).join("") : `<tr><td colspan="10" style="padding:12px;color:#666;">No records</td></tr>`;
    document.querySelectorAll(".ep_view").forEach(b=> b.addEventListener("click", epOnView));
    document.querySelectorAll(".ep_edit").forEach(b=> b.addEventListener("click", epOnEdit));
    document.querySelectorAll(".ep_delete").forEach(b=> b.addEventListener("click", epOnDelete));
    document.getElementById("ep_total").textContent = arr.length;
  }

})();
