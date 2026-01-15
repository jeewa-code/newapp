/* =========================================================
   nonCommunicable.js — Tabbed UI with Records tab + actions
   - Save key: nonCommRegister
   - Exposes window.openNonCommunicableRegister()
   ========================================================= */

(function(){
  const STORAGE_KEY = "nonCommRegister";

  function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch(e){ return []; } }
  function save(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
  function uid(){ return Date.now() + Math.floor(Math.random()*999); }
  function esc(s){ return s == null ? "" : String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  const inputStyle = "width:100%;padding:9px 10px;border:1px solid #d6dde3;border-radius:8px;box-sizing:border-box;font-size:14px;";
  const labelStyle = "font-weight:600;color:#183046;";

  window.openNonCommunicableRegister = function(title = "Non-Communicable Diseases and Disabled Persons Register"){
    const content = document.getElementById("contentArea");
    if(!content) return console.warn("contentArea not found");
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="margin:0;font-size:20px;color:#fff;">${esc(title)}</h2>
        <button onclick="showContent('Registers', null)" style="background:#0b74d1;color:white;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">පසුගියට</button>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:14px;">
        <button id="nc_tab_entry" class="tab active" style="padding:8px 12px;border-radius:8px;border:1px solid #e6eef8;background:#f8fbff;cursor:pointer;">දත්ත ඇතුල් කිරීම</button>
        <button id="nc_tab_records" class="tab" style="padding:8px 12px;border-radius:8px;border:1px solid #e6eef8;background:#fff;cursor:pointer;">ලේඛණය</button>
      </div>

      <div id="nc_tabContent"></div>

      <!-- view modal -->
      <div id="nc_view_modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);align-items:center;justify-content:center;z-index:9999;">
        <div style="background:#fff;padding:18px;border-radius:10px;min-width:320px;max-width:760px;box-shadow:0 12px 40px rgba(3,20,40,0.35);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <strong>Record Details</strong>
            <button id="nc_view_close" style="background:#eee;border:none;padding:6px 8px;border-radius:6px;cursor:pointer;">Close</button>
          </div>
          <div id="nc_view_body" style="max-height:60vh;overflow:auto;font-size:14px;color:#112;"></div>
        </div>
      </div>
    `;

    document.getElementById("nc_tab_entry").addEventListener("click", ()=>{ setActive('entry'); renderEntry(); });
    document.getElementById("nc_tab_records").addEventListener("click", ()=>{ setActive('records'); renderRecords(); });

    // initial
    renderEntry();
  };

  function setActive(key){
    const ebtn = document.getElementById("nc_tab_entry");
    const rbtn = document.getElementById("nc_tab_records");
    if(ebtn && rbtn){
      ebtn.classList.remove('active'); rbtn.classList.remove('active');
      ebtn.style.background = '#fff'; rbtn.style.background = '#fff';
      if(key==='entry'){ ebtn.classList.add('active'); ebtn.style.background='#f8fbff'; }
      else { rbtn.classList.add('active'); rbtn.style.background='#f8fbff'; }
    }
  }

  // ---------- Entry tab ----------
  function renderEntry(){
    const cont = document.getElementById("nc_tabContent");
    const data = load();
    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 12px 0;color:#073b6a;">දත්ත ඇතුල් කිරීම</h4>

        <div style="display:grid;grid-template-columns:260px 1fr;gap:12px 18px;align-items:center;">
          <label style="${labelStyle};text-align:right;padding-right:8px;">ගෘහ මුලිකයාගේ නම</label>
          <input id="nc_householderName" style="${inputStyle}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">ලිපිනය</label>
          <input id="nc_address" style="${inputStyle}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">බෝ නොවන / අබාධිත පුද්ගලයාගේ නම</label>
          <input id="nc_patientName" style="${inputStyle}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">වයස</label>
          <input id="nc_age" type="number" min="0" style="${inputStyle}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">ස්ත්‍රී පුරුෂ භාවය</label>
          <select id="nc_sex" style="${inputStyle}">
            <option value="">-- තෝරන්න --</option>
            <option value="ස්ත්‍රී">ස්ත්‍රී</option>
            <option value="පුරුෂ">පුරුෂ</option>
          </select>

          <label style="${labelStyle};text-align:right;padding-right:8px;">රැකියාව</label>
          <input id="nc_occupation" style="${inputStyle}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">බෝනොවන රෝගියා</label>
          <select id="nc_ncdType" style="${inputStyle}">
            <option value="">-- තෝරන්න --</option>
            <option value="හෘද වාහිනී රෝග">හෘද වාහිනී රෝග</option>
            <option value="පිළිකා">පිළිකා</option>
            <option value="දියවැඩියාව">දියවැඩියාව</option>
            <option value="කල්පවතින ස්වසන රෝග">කල්පවතින ස්වසන රෝග</option>
            <option value="වෙනත්">වෙනත්</option>
          </select>

          <label style="${labelStyle};text-align:right;padding-right:8px;">ආබාධිත භාවය</label>
          <input id="nc_disability" style="${inputStyle}" placeholder="ආබාධ විස්තරය" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">ප්‍රතිකාර ගන්නවාද / නැද්ද</label>
          <select id="nc_receivesTreatment" style="${inputStyle}">
            <option value="">-- තෝරන්න --</option>
            <option value="ප්‍රතිකාර ගනී">ප්‍රතිකාර ගනී</option>
            <option value="ප්‍රතිකාර නොගනී">ප්‍රතිකාර නොගනී</option>
          </select>

          <label style="${labelStyle};text-align:right;padding-right:8px;">ප්‍රතිකාර ක්‍රමය</label>
          <select id="nc_treatmentMethod" style="${inputStyle}">
            <option value="">-- තෝරන්න --</option>
            <option value="බටහිර">බටහිර</option>
            <option value="දේශීය">දේශීය</option>
            <option value="වෙනත්">වෙනත්</option>
          </select>

          <label style="${labelStyle};text-align:right;padding-right:8px;">ප්‍රතිකාර ගන්නේ</label>
          <select id="nc_treatmentPlace" style="${inputStyle}">
            <option value="">-- තෝරන්න --</option>
            <option value="රජයේ රෝහල">රජයේ රෝහල</option>
            <option value="පෞද්ගලික රෝහල">පෞද්ගලික රෝහල</option>
            <option value="නිර์දිත නොවී">නිර්දිත නොවී</option>
          </select>

          <label style="${labelStyle};text-align:right;padding-right:8px;">මහජන සෞඛ්‍ය පරීක්ෂක ගත් ක්‍රියා මාර්ගය</label>
          <input id="nc_phiActions" style="${inputStyle}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">වෙනත්</label>
          <textarea id="nc_otherRemarks" rows="4" style="${inputStyle}"></textarea>

          <div></div>
          <div style="display:flex;gap:8px;margin-top:6px;">
            <button id="nc_saveBtn" style="background:#0b74d1;color:white;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">සුරකින්න</button>
            <button id="nc_updateBtn" style="background:#1976d2;color:white;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;display:none;">Update</button>
            <button id="nc_clearBtn" style="background:#e2e8f0;color:#111;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">Clear</button>
            <button id="nc_goto_records" style="margin-left:auto;background:#06ad7d;color:#fff;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">View Records</button>
          </div>
        </div>
      </div>
    `;

    // attach event handlers
    document.getElementById("nc_saveBtn").addEventListener("click", ncSaveHandler);
    document.getElementById("nc_updateBtn").addEventListener("click", ncUpdateHandler);
    document.getElementById("nc_clearBtn").addEventListener("click", ()=>{ document.getElementById("nc_saveBtn").style.display='inline-block'; document.getElementById("nc_updateBtn").style.display='none'; document.querySelectorAll("#nc_tabContent input, #nc_tabContent select, #nc_tabContent textarea").forEach(i=>i.value=""); });
    document.getElementById("nc_goto_records").addEventListener("click", ()=>{ document.getElementById("nc_tab_records").click(); });

    // reset edit marker
    document.getElementById("nc_saveBtn").dataset.editId = "";
  }

  // ---------- Records tab ----------
  function renderRecords(){
    const cont = document.getElementById("nc_tabContent");
    const arr = load();
    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 12px 0;color:#073b6a;">ලේඛණය</h4>

        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;">
          <input id="nc_filter_name" placeholder="Householder / Patient name" style="${inputStyle};width:auto;min-width:200px;" />
          <select id="nc_filter_ncdType" style="${inputStyle};width:auto;">
            <option value="">All disease types</option>
            <option>හෘද වාහිනී රෝග</option><option>පිළිකා</option><option>දියවැඩියාව</option><option>කල්පවතින ස්වසන රෝග</option><option>වෙනත්</option>
          </select>
          <button id="nc_apply_filter" style="background:#0b74d1;color:#fff;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Apply</button>
          <button id="nc_clear_filter" style="background:#e2e8f0;color:#111;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Clear</button>
          <div style="margin-left:auto;font-size:14px;color:#333;">Total: <strong id="nc_total">${arr.length}</strong></div>
        </div>

        <div style="overflow:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;min-width:1000px;">
            <thead>
              <tr style="text-align:left;color:#2b3b4a;">
                <th style="width:56px;padding:8px 6px;">S/N</th>
                <th style="padding:8px 6px;">ගෘහ මුලිකයා</th>
                <th style="padding:8px 6px;">ලිපිනය</th>
                <th style="padding:8px 6px;">රෝගියාගේ නම</th>
                <th style="padding:8px 6px;">වයස</th>
                <th style="padding:8px 6px;">ස්ත්‍රී/පුරුෂ</th>
                <th style="padding:8px 6px;">නො-සංක්‍රමි/වර්ගය</th>
                <th style="padding:8px 6px;">ප්‍රතිකාර ගනී/නොගනී</th>
                <th style="padding:8px 6px;">PHI ක්‍රියා</th>
                <th style="padding:8px 6px;width:180px;">Actions</th>
              </tr>
            </thead>
            <tbody id="nc_records_body">
              ${arr.length ? arr.map((r,i)=>`<tr data-id="${r.id || ''}"><td style="padding:10px 6px;">${i+1}</td><td style="padding:10px 6px;">${esc(r.householderName)}</td><td style="padding:10px 6px;">${esc(r.address)}</td><td style="padding:10px 6px;">${esc(r.patientName)}</td><td style="padding:10px 6px;">${esc(r.age)}</td><td style="padding:10px 6px;">${esc(r.sex)}</td><td style="padding:10px 6px;">${esc(r.ncdType)}</td><td style="padding:10px 6px;">${esc(r.receivesTreatment)}</td><td style="padding:10px 6px;">${esc(r.phiActions)}</td><td style="padding:10px 6px;"><button class="nc_view" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#90caf9;">View</button><button class="nc_edit" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ffd54f;">Edit</button><button class="nc_delete" data-id="${r.id}" style="padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ef9a9a;">Delete</button></td></tr>`).join("") : `<tr><td colspan="10" style="padding:12px;color:#666;">No records</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById("nc_apply_filter").addEventListener("click", applyFilter);
    document.getElementById("nc_clear_filter").addEventListener("click", ()=>{ document.getElementById("nc_filter_name").value=''; document.getElementById("nc_filter_ncdType").value=''; renderRecords(); });

    // attach actions
    document.querySelectorAll(".nc_view").forEach(b=> b.addEventListener("click", onView));
    document.querySelectorAll(".nc_edit").forEach(b=> b.addEventListener("click", onEdit));
    document.querySelectorAll(".nc_delete").forEach(b=> b.addEventListener("click", onDelete));
    document.getElementById("nc_total").textContent = load().length;
  }

  // ---------- Handlers ----------
  function ncSaveHandler(){
    const rec = collectFromForm();
    if(!rec) return;
    const arr = load();
    rec.id = uid();
    arr.unshift(rec);
    save(arr);
    alert("Record saved.");
    // reset
    document.querySelectorAll("#nc_tabContent input, #nc_tabContent select, #nc_tabContent textarea").forEach(i=>i.value="");
    // refresh records if active
    const rbtn = document.getElementById("nc_tab_records");
    if(rbtn && rbtn.classList.contains('active')) renderRecords();
  }

  function ncUpdateHandler(){
    const btn = document.getElementById("nc_updateBtn");
    const editId = btn.dataset.editId;
    if(!editId){ alert("No record selected for update."); return; }
    const rec = collectFromForm();
    if(!rec) return;
    const arr = load();
    const idx = arr.findIndex(x=>String(x.id)===String(editId));
    if(idx<0){ alert("Original record not found."); return; }
    rec.id = arr[idx].id;
    arr[idx] = rec;
    save(arr);
    alert("Record updated.");
    // reset UI
    document.getElementById("nc_saveBtn").style.display='inline-block';
    document.getElementById("nc_updateBtn").style.display='none';
    document.getElementById("nc_updateBtn").dataset.editId = "";
    document.querySelectorAll("#nc_tabContent input, #nc_tabContent select, #nc_tabContent textarea").forEach(i=>i.value="");
    // refresh records if active
    if(document.getElementById("nc_tab_records").classList.contains('active')) renderRecords();
  }

  function collectFromForm(){
    const householderName = document.getElementById("nc_householderName").value.trim();
    const address = document.getElementById("nc_address").value.trim();
    const patientName = document.getElementById("nc_patientName").value.trim();
    const age = document.getElementById("nc_age").value;
    const sex = document.getElementById("nc_sex").value;
    const occupation = document.getElementById("nc_occupation").value.trim();
    const ncdType = document.getElementById("nc_ncdType").value;
    const disability = document.getElementById("nc_disability").value.trim();
    const receivesTreatment = document.getElementById("nc_receivesTreatment").value;
    const treatmentMethod = document.getElementById("nc_treatmentMethod").value;
    const treatmentPlace = document.getElementById("nc_treatmentPlace").value;
    const phiActions = document.getElementById("nc_phiActions").value.trim();
    const otherRemarks = document.getElementById("nc_otherRemarks").value.trim();

    if(!householderName || !address || !patientName || !sex || !receivesTreatment){
      alert("කරුණාකර අවශ්‍ය තොරතුරු සැපයීම: ගෘහ මුලිකයාගේ නම, ලිපිනය, රෝගියාගේ නම, ස්ත්‍රී/පුරුෂ, ප්‍රතිකාර ගනී/නොගනී.");
      return null;
    }

    return { householderName, address, patientName, age: age? Number(age): null, sex, occupation, ncdType, disability, receivesTreatment, treatmentMethod, treatmentPlace, phiActions, otherRemarks, createdAt: new Date().toISOString() };
  }

  // view modal
  function onView(e){
    const id = e.currentTarget.dataset.id;
    const rec = load().find(x=>String(x.id)===String(id));
    if(!rec) return alert("Record not found.");
    const modal = document.getElementById("nc_view_modal");
    const body = document.getElementById("nc_view_body");
    body.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tbody>
          <tr><td style="padding:6px 8px;font-weight:600;width:220px;">ගෘහ මුලිකයාගේ නම</td><td style="padding:6px 8px;">${esc(rec.householderName)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ලිපිනය</td><td style="padding:6px 8px;">${esc(rec.address)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">රෝගියාගේ නම</td><td style="padding:6px 8px;">${esc(rec.patientName)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">වයස</td><td style="padding:6px 8px;">${esc(rec.age)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ස්ත්‍රී/පුරුෂ</td><td style="padding:6px 8px;">${esc(rec.sex)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">රැකියාව</td><td style="padding:6px 8px;">${esc(rec.occupation)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">නො-සංක්‍රමි/වර්ගය</td><td style="padding:6px 8px;">${esc(rec.ncdType)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ආබාධිත භාවය</td><td style="padding:6px 8px;">${esc(rec.disability)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ප්‍රතිකාර ගනී/නොගනී</td><td style="padding:6px 8px;">${esc(rec.receivesTreatment)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ප්‍රතිකාර ක්‍රමය</td><td style="padding:6px 8px;">${esc(rec.treatmentMethod)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">ප්‍රතිකාර ස්ථානය</td><td style="padding:6px 8px;">${esc(rec.treatmentPlace)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">PHI ක්‍රියා</td><td style="padding:6px 8px;">${esc(rec.phiActions)}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">වෙනත්</td><td style="padding:6px 8px;">${esc(rec.otherRemarks).replace(/\n/g,'<br>')}</td></tr>
          <tr><td style="padding:6px 8px;font-weight:600;">Created</td><td style="padding:6px 8px;">${esc(rec.createdAt||'')}</td></tr>
        </tbody>
      </table>
    `;
    modal.style.display = "flex";
    document.getElementById("nc_view_close").onclick = ()=>{ modal.style.display = "none"; };
  }

  // edit handler
  function onEdit(e){
    const id = e.currentTarget.dataset.id;
    const rec = load().find(x=>String(x.id)===String(id));
    if(!rec) return alert("Record not found.");
    // switch to entry tab and populate form
    document.getElementById("nc_tab_entry").click();
    setTimeout(()=>{
      document.getElementById("nc_householderName").value = rec.householderName || "";
      document.getElementById("nc_address").value = rec.address || "";
      document.getElementById("nc_patientName").value = rec.patientName || "";
      document.getElementById("nc_age").value = rec.age ?? "";
      document.getElementById("nc_sex").value = rec.sex || "";
      document.getElementById("nc_occupation").value = rec.occupation || "";
      document.getElementById("nc_ncdType").value = rec.ncdType || "";
      document.getElementById("nc_disability").value = rec.disability || "";
      document.getElementById("nc_receivesTreatment").value = rec.receivesTreatment || "";
      document.getElementById("nc_treatmentMethod").value = rec.treatmentMethod || "";
      document.getElementById("nc_treatmentPlace").value = rec.treatmentPlace || "";
      document.getElementById("nc_phiActions").value = rec.phiActions || "";
      document.getElementById("nc_otherRemarks").value = rec.otherRemarks || "";
      // toggle buttons
      document.getElementById("nc_saveBtn").style.display='none';
      const up = document.getElementById("nc_updateBtn");
      up.style.display='inline-block';
      up.dataset.editId = rec.id;
    },80);
  }

  // delete handler
  async function onDelete(e){
    const id = e.currentTarget.dataset.id;
    if(!await showConfirm("මෙම record එක මකා දමන්නද?")) return;
    let arr = load();
    arr = arr.filter(x=>String(x.id)!==String(id));
    save(arr);
    showSuccess("Record deleted.");
    // refresh records
    if(document.getElementById("nc_tab_records").classList.contains('active')) renderRecords();
  }

  // filter apply
  function applyFilter(){
    const name = document.getElementById("nc_filter_name").value.trim().toLowerCase();
    const ncdType = document.getElementById("nc_filter_ncdType").value;
    let arr = load();
    if(name) arr = arr.filter(r => (r.householderName||'').toLowerCase().includes(name) || (r.patientName||'').toLowerCase().includes(name));
    if(ncdType) arr = arr.filter(r => r.ncdType === ncdType);
    const tbody = document.getElementById("nc_records_body");
    if(!tbody) return;
    tbody.innerHTML = arr.length ? arr.map((r,i)=>`<tr data-id="${r.id}"><td style="padding:10px 6px;">${i+1}</td><td style="padding:10px 6px;">${esc(r.householderName)}</td><td style="padding:10px 6px;">${esc(r.address)}</td><td style="padding:10px 6px;">${esc(r.patientName)}</td><td style="padding:10px 6px;">${esc(r.age)}</td><td style="padding:10px 6px;">${esc(r.sex)}</td><td style="padding:10px 6px;">${esc(r.ncdType)}</td><td style="padding:10px 6px;">${esc(r.receivesTreatment)}</td><td style="padding:10px 6px;">${esc(r.phiActions)}</td><td style="padding:10px 6px;"><button class="nc_view" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#90caf9;">View</button><button class="nc_edit" data-id="${r.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ffd54f;">Edit</button><button class="nc_delete" data-id="${r.id}" style="padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ef9a9a;">Delete</button></td></tr>`).join("") : `<tr><td colspan="10" style="padding:12px;color:#666;">No records</td></tr>`;
    // reattach
    document.querySelectorAll(".nc_view").forEach(b=> b.addEventListener("click", onView));
    document.querySelectorAll(".nc_edit").forEach(b=> b.addEventListener("click", onEdit));
    document.querySelectorAll(".nc_delete").forEach(b=> b.addEventListener("click", onDelete));
    document.getElementById("nc_total").textContent = arr.length;
  }

})();
