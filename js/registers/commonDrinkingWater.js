/* js/registers/commonDrinkingWater.js
   Pretty entry-form UI for:
   - Tab1: "පොදු ජල මුලාශ්‍ර" (inputs in 2-column label/input pairs + table below)
   - Tab2: "Data Entry" (2-column label/input pairs)
   - Tab3: "පොදු ජල මුලාශ්‍ර ලේඛණය" (records table + filters)
   Storage keys: commonWaterSources_v1, commonWaterTests_v1
*/

(function(){
  const SOURCES_KEY = "commonWaterSources_v1";
  const TESTS_KEY = "commonWaterTests_v1";

  function loadJSON(key){ try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch(e){ return []; } }
  function saveJSON(key, arr){ localStorage.setItem(key, JSON.stringify(arr)); }
  function escapeHtml(s){ return (s==null) ? "" : (""+s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  const inputStyle = "width:100%;padding:9px 10px;border:1px solid #d0d6db;border-radius:8px;box-sizing:border-box;font-size:14px;";
  const labelStyle = "font-weight:600;color:#223;";

  window.openCommonDrinkingWaterRegister = function(title){
    const content = document.getElementById("contentArea");
    if (!content) return;
    content.innerHTML = `
      <style>
        .cdw-header{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap;}
        .cdw-tabs{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;}

        .cdw-form-grid{display:grid;grid-template-columns:260px 1fr;gap:10px 18px;align-items:center;}
        .cdw-form-grid .cdw-label{text-align:right;padding-right:8px;}
        .cdw-actions{display:flex;gap:8px;margin-top:6px;flex-wrap:wrap;}
        .cdw-actions .cdw-spacer{flex:1;}

        .cdw-filters{display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:10px;align-items:end;margin-bottom:12px;}
        .cdw-filters select,.cdw-filters button{width:100%;}

        .cdw-table-wrap{overflow:auto;}
        .cdw-table{width:100%;border-collapse:collapse;font-size:14px;}
        .cdw-table th,.cdw-table td{white-space:nowrap;}

        @media (max-width: 768px){
          .cdw-form-grid{grid-template-columns:1fr;gap:8px;}
          .cdw-form-grid .cdw-label{text-align:left;padding-right:0;}
          .cdw-actions button{flex:1;min-width:140px;}
          .cdw-table{min-width:760px;}
        }
      </style>

      <div class="cdw-header">
        <h2 style="margin:0;font-size:20px;color:#fff;">${escapeHtml(title || "Common Sources of Drinking-Water Register")}</h2>
        <button onclick="showContent('Registers', null)" style="background:#0b74d1;color:white;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">පසුගියට</button>
      </div>

      <div class="cdw-tabs">
        <button id="tab_source" class="tab active" style="padding:8px 12px;border-radius:8px;border:1px solid #e6eef8;background:#f8fbff;cursor:pointer;">පොදු ජල මුලාශ්‍ර</button>
        <button id="tab_dataentry" class="tab" style="padding:8px 12px;border-radius:8px;border:1px solid #e6eef8;background:#fff;cursor:pointer;">Data Entry</button>
        <button id="tab_records" class="tab" style="padding:8px 12px;border-radius:8px;border:1px solid #e6eef8;background:#fff;cursor:pointer;">පොදු ජල මුලාශ්‍ර ලේඛණය</button>
      </div>

      <div id="tabContent" style="min-height:360px;"></div>
    `;

    document.getElementById("tab_source").addEventListener("click", () => { setActiveTab('source'); renderSourceTab(); });
    document.getElementById("tab_dataentry").addEventListener("click", () => { setActiveTab('dataentry'); renderDataEntryTab(); });
    document.getElementById("tab_records").addEventListener("click", () => { setActiveTab('records'); renderRecordsTab(); });

    // initial
    renderSourceTab();
  };

  function setActiveTab(key){
    const ts = { source:'tab_source', dataentry:'tab_dataentry', records:'tab_records' };
    Object.values(ts).forEach(id => {
      const el = document.getElementById(id);
      if(!el) return;
      el.classList.remove('active');
      el.style.background = '#fff';
    });
    const active = document.getElementById(ts[key]);
    if(active){ active.classList.add('active'); active.style.background = '#f8fbff'; }
  }

  // ---------------- Tab1: Sources (2-column form + table below) ----------------
  function renderSourceTab(){
    const cont = document.getElementById("tabContent");
    const list = loadJSON(SOURCES_KEY);

    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 12px 0;color:#073b6a;">පොදු ජල මුලාශ්‍ර — ඇතුල් කිරීම</h4>

        <div class="cdw-form-grid">
          <label class="cdw-label" style="${labelStyle};">ජල මුලාශ්‍රයේ නම</label>
          <input id="src_name" style="${inputStyle}" placeholder=" " />

          <label class="cdw-label" style="${labelStyle};">ආවරණය වන ගෘහ එකක සංඛ්‍යාව</label>
          <input id="src_house_count" type="number" style="${inputStyle}" placeholder="" />

          <label class="cdw-label" style="${labelStyle};">පිහිටීම / ලිපිනය</label>
          <input id="src_location" style="${inputStyle}" placeholder="" />

          <label class="cdw-label" style="${labelStyle};">නඩත්තුව හා කළමනාකරණ සේවාදායකයා</label>
          <input id="src_responsible_unit" style="${inputStyle}" placeholder="" />

          <label class="cdw-label" style="${labelStyle};">සේවාදායකයාගේ නම</label>
          <input id="src_responsible_name" style="${inputStyle}" placeholder="නම" />

          <label class="cdw-label" style="${labelStyle};">සේවාදායකයාගේ ලිපිනය</label>
          <input id="src_responsible_addr" style="${inputStyle}" placeholder="ලිපිනය" />

          <div></div>
          <div class="cdw-actions">
            <button id="save_source_btn" style="background:#0b74d1;color:#fff;padding:9px 14px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Add / Save</button>
            <button id="clear_source_btn" style="background:#e2e8f0;color:#111;padding:9px 12px;border:none;border-radius:8px;cursor:pointer;">Clear</button>
          </div>
        </div>

        <hr style="margin:16px 0;border:none;border-top:1px solid #eef2f7;" />

        <div class="cdw-table-wrap">
          <h4 style="margin:0 0 10px 0;color:#0b3b5b;">අැතුල් වුනු මුලාශ්‍ර</h4>
          <table class="cdw-table">
            <thead>
              <tr style="text-align:left;color:#2b3b4a;">
                <th style="width:56px;padding:8px 6px 10px 6px;">S/N</th>
                <th style="padding:8px 6px 10px 6px;">ජල මුලාශ්‍රයේ නම</th>
                <th style="padding:8px 6px 10px 6px;">ආවරණ ගෘහ</th>
                <th style="padding:8px 6px 10px 6px;">පිහිටීම</th>
                <th style="padding:8px 6px 10px 6px;width:140px;">Actions</th>
              </tr>
            </thead>
            <tbody id="sources_table_body">
              ${list.length ? list.map((s,i)=>`<tr data-id="${s.id}"><td style="padding:10px 6px;">${i+1}</td><td style="padding:10px 6px;">${escapeHtml(s.name)}</td><td style="padding:10px 6px;">${escapeHtml(s.houseCount)}</td><td style="padding:10px 6px;">${escapeHtml(s.location)}</td><td style="padding:10px 6px;"><button class="edit-source" data-id="${s.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ffd54f;">Edit</button><button class="del-source" data-id="${s.id}" style="padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ef9a9a;">Delete</button></td></tr>`).join("") : `<tr><td colspan="5" style="padding:12px;color:#666;">No records</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // handlers
    let editId = null;
    document.getElementById("save_source_btn").addEventListener("click", () => {
      const name = document.getElementById("src_name").value.trim();
      const houseCount = document.getElementById("src_house_count").value.trim();
      const location = document.getElementById("src_location").value.trim();
      const responsibleUnit = document.getElementById("src_responsible_unit").value.trim();
      const responsibleName = document.getElementById("src_responsible_name").value.trim();
      const responsibleAddr = document.getElementById("src_responsible_addr").value.trim();
      if (!name) { alert("ජල මුලාශ්‍රයේ නම ඇතුල් කරන්න."); return; }
      const arr = loadJSON(SOURCES_KEY);
      if (!editId) {
        arr.unshift({ id: Date.now(), name, houseCount, location, responsibleUnit, responsibleName, responsibleAddr });
      } else {
        const idx = arr.findIndex(x=>x.id===editId);
        if (idx>=0) arr[idx] = { id: editId, name, houseCount, location, responsibleUnit, responsibleName, responsibleAddr };
        else arr.unshift({ id: editId, name, houseCount, location, responsibleUnit, responsibleName, responsibleAddr });
      }
      saveJSON(SOURCES_KEY, arr);
      renderSourceTab();
    });

    document.getElementById("clear_source_btn").addEventListener("click", ()=>{
      editId = null;
      ["src_name","src_house_count","src_location","src_responsible_unit","src_responsible_name","src_responsible_addr"].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=""; });
    });

    // delegate edit/delete
    document.getElementById("sources_table_body").querySelectorAll(".edit-source").forEach(btn=>{
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const arr = loadJSON(SOURCES_KEY);
        const rec = arr.find(x=>x.id===id);
        if (!rec) return;
        editId = id;
        document.getElementById("src_name").value = rec.name || "";
        document.getElementById("src_house_count").value = rec.houseCount || "";
        document.getElementById("src_location").value = rec.location || "";
        document.getElementById("src_responsible_unit").value = rec.responsibleUnit || "";
        document.getElementById("src_responsible_name").value = rec.responsibleName || "";
        document.getElementById("src_responsible_addr").value = rec.responsibleAddr || "";
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    document.getElementById("sources_table_body").querySelectorAll(".del-source").forEach(btn=>{
      btn.addEventListener("click", () => {
        if (!confirm("Delete this record?")) return;
        const id = Number(btn.dataset.id);
        let arr = loadJSON(SOURCES_KEY);
        arr = arr.filter(x=>x.id!==id);
        saveJSON(SOURCES_KEY, arr);
        renderSourceTab();
      });
    });
  }

  // ---------------- Tab2: Data Entry (pretty 2-column form) ----------------
  function renderDataEntryTab(){
    const cont = document.getElementById("tabContent");
    const sources = loadJSON(SOURCES_KEY);
    const sourceOptions = sources.length ? sources.map(s=>`<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("") : `<option value="">-- කිසිදු මුලාශ්‍රයක් නැත --</option>`;

    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 12px 0;color:#073b6a;">පරිශීලක දත්ත ඇතුල් කිරීම (Data Entry)</h4>

        <div class="cdw-form-grid" style="gap:12px 18px;">
          <label class="cdw-label" style="${labelStyle};">ග්‍රාම නිලදාරී කොට්ඨාශය</label>
          <select id="de_gn_select" style="${inputStyle}"><option value="">-- select GN --</option></select>

          <label class="cdw-label" style="${labelStyle};">පොදු ජල මුලාශ්‍රය</label>
          <select id="de_source_select" style="${inputStyle}"><option value="">-- select source --</option>${sourceOptions}</select>

          <label class="cdw-label" style="${labelStyle};">පරීක්ෂා කල දිනය</label>
          <input id="de_test_date" type="date" style="${inputStyle}" />

          <label class="cdw-label" style="${labelStyle};">ශේෂ ක්ලෝරීන් සදහා පරික්ෂා කල ගණන</label>
          <input id="de_chlorine_count" type="number" step="any" style="${inputStyle}" placeholder="" />

          <label class="cdw-label" style="${labelStyle};">Cl ප්‍රතිඵල</label>
          <select id="de_result_chlorine" style="${inputStyle}">
            <option value="">-- select --</option>
            <option value="Satisfied">සතුටුදායක</option>
            <option value="Unsatisfied">අසතුටුදායක</option>
          </select>

          <label class="cdw-label" style="${labelStyle};">බැක්ටීරියානු සාම්පල දිනය</label>
          <input id="de_bacteria_sample_date" type="date" style="${inputStyle}" />

          <label class="cdw-label" style="${labelStyle};">බැක්ටීරියා ප්‍රතිඵල</label>
          <select id="de_result_bacteria" style="${inputStyle}">
            <option value="">-- select --</option>
            <option value="Satisfied">සතුටුදායක</option>
            <option value="Unsatisfied">අසතුටුදායක</option>
          </select>

          <label class="cdw-label" style="${labelStyle};">ගත් ක්‍රියාමාර්ග</label>
          <input id="de_actions_taken" style="${inputStyle}" placeholder="ගත් ක්‍රියාමාර්ග ටික ලියන්න" />

          <label class="cdw-label" style="${labelStyle};">තෛයිමාසික වාර්තාව යැවූ දිනය</label>
          <input id="de_report_sent_date" type="date" style="${inputStyle}" />

          <div></div>
          <div class="cdw-actions">
            <button id="save_de_btn" style="background:#0b74d1;color:#fff;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Add / Save</button>
            <button id="clear_de_btn" style="background:#e2e8f0;color:#111;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">Clear</button>
            <span class="cdw-spacer"></span>
            <button id="goto_records_btn" style="background:#06ad7d;color:#fff;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">View Records</button>
          </div>
        </div>
      </div>
    `;

    // populate GN list if phiMapAPI available
    if (window.phiMapAPI && typeof window.phiMapAPI.getGNs === "function") {
      const gns = window.phiMapAPI.getGNs();
      const gnSelect = document.getElementById("de_gn_select");
      if (gns && gns.length) {
        gnSelect.innerHTML = `<option value="">-- ග්‍රාම නිලදාරී කොට්ඨාශය --</option>` + gns.map(g=>`<option value="${g.id}">${escapeHtml(g.no)} ${escapeHtml(g.name||'')}</option>`).join("");
      }
    }

    // handlers
    patchDataEntrySaveHandler(); // attach save handler supporting editId
    document.getElementById("clear_de_btn").addEventListener("click", () => {
      ["de_gn_select","de_source_select","de_test_date","de_chlorine_count","de_result_chlorine","de_bacteria_sample_date","de_result_bacteria","de_actions_taken","de_report_sent_date"].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=""; });
      const sb = document.getElementById("save_de_btn"); if(sb) delete sb.dataset.editId;
    });
    document.getElementById("goto_records_btn").addEventListener("click", ()=>{ document.getElementById("tab_records").click(); });
  }

  // ---------------- Tab3: Records (table + filters) ----------------
  function renderRecordsTab(){
    const cont = document.getElementById("tabContent");
    const sources = loadJSON(SOURCES_KEY);
    const tests = loadJSON(TESTS_KEY);

    const sourceOptions = sources.length ? sources.map(s=>`<option value="${s.id}">${escapeHtml(s.name)}</option>`).join("") : `<option disabled>No sources</option>`;

    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 10px 0;color:#073b6a;">පොදු ජල මුලාශ්‍ර ලේඛණය</h4>
        <div class="cdw-filters">
          <select id="r_filter_year" style="${inputStyle}"><option value="">All years</option></select>
          <select id="r_filter_source" style="${inputStyle}"><option value="">All sources</option>${sourceOptions}</select>
          <select id="r_filter_result" style="${inputStyle}">
            <option value="">All results</option><option value="Satisfied">සතුටුදායක</option><option value="Unsatisfied">අසතුටුදායක</option>
          </select>
          <button id="r_apply_filter" style="background:#0b74d1;color:#fff;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Apply</button>
          <button id="r_clear_filter" style="background:#e2e8f0;color:#111;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Clear</button>
        </div>

        <div class="cdw-table-wrap">
          <table class="cdw-table">
            <thead>
              <tr style="text-align:left;color:#2b3b4a;">
                <th style="width:56px;padding:8px 6px;">S/N</th>
                <th style="padding:8px 6px;">දිනය</th>
                <th style="padding:8px 6px;">මුලාශ්‍රය</th>
                <th style="padding:8px 6px;">ශ්‍රේණි (Cl)</th>
                <th style="padding:8px 6px;">Cl ප්‍රතිඵල</th>
                <th style="padding:8px 6px;">බැක්ටීරියා ප්‍රතිඵල</th>
                <th style="padding:8px 6px;">ක්‍රියාමාර්ග</th>
                <th style="padding:8px 6px;">Report Sent</th>
                <th style="padding:8px 6px;width:140px;">Actions</th>
              </tr>
            </thead>
            <tbody id="records_table_body">
              ${tests.length ? tests.map((t,i)=>`<tr data-id="${t.id}"><td style="padding:10px 6px;">${i+1}</td><td style="padding:10px 6px;">${escapeHtml(t.testDate)}</td><td style="padding:10px 6px;">${escapeHtml((sources.find(s=>s.id==t.sourceId)||{}).name||t.sourceId)}</td><td style="padding:10px 6px;">${escapeHtml(t.chlorineCount)}</td><td style="padding:10px 6px;">${escapeHtml(t.resultChlorine)}</td><td style="padding:10px 6px;">${escapeHtml(t.resultBacteria)}</td><td style="padding:10px 6px;">${escapeHtml(t.actions)}</td><td style="padding:10px 6px;">${escapeHtml(t.reportSentDate)}</td><td style="padding:10px 6px;"><button class="edit-record" data-id="${t.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ffd54f;">Edit</button><button class="del-record" data-id="${t.id}" style="padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ef9a9a;">Delete</button></td></tr>`).join("") : `<tr><td colspan="9" style="padding:12px;color:#666;">No records</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // populate years
    const years = Array.from(new Set(loadJSON(TESTS_KEY).map(t => (t.testDate ? (new Date(t.testDate)).getFullYear() : null)).filter(Boolean))).sort((a,b)=>b-a);
    const yearSelect = document.getElementById("r_filter_year");
    yearSelect.innerHTML = `<option value="">All years</option>` + years.map(y=>`<option value="${y}">${y}</option>`).join("");

    document.getElementById("r_apply_filter").addEventListener("click", applyRecordsFilter);
    document.getElementById("r_clear_filter").addEventListener("click", () => { document.getElementById("r_filter_year").value=""; document.getElementById("r_filter_source").value=""; document.getElementById("r_filter_result").value=""; renderRecordsTab(); });

    // edit/delete bindings
    document.querySelectorAll(".edit-record").forEach(btn=>{
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const rec = loadJSON(TESTS_KEY).find(x=>x.id===id);
        if (!rec) return alert("Record not found.");
        document.getElementById("tab_dataentry").click();
        setTimeout(()=>{
          if (document.getElementById("de_gn_select")) {
            document.getElementById("de_gn_select").value = rec.gnId || "";
            document.getElementById("de_source_select").value = rec.sourceId || "";
            document.getElementById("de_test_date").value = rec.testDate || "";
            document.getElementById("de_chlorine_count").value = rec.chlorineCount || "";
            document.getElementById("de_result_chlorine").value = rec.resultChlorine || "";
            document.getElementById("de_bacteria_sample_date").value = rec.bacteriaSampleDate || "";
            document.getElementById("de_result_bacteria").value = rec.resultBacteria || "";
            document.getElementById("de_actions_taken").value = rec.actions || "";
            document.getElementById("de_report_sent_date").value = rec.reportSentDate || "";
            const saveBtn = document.getElementById("save_de_btn"); if(saveBtn) saveBtn.dataset.editId = rec.id;
          }
        },80);
      });
    });

    document.querySelectorAll(".del-record").forEach(btn=>{
      btn.addEventListener("click", () => {
        if (!confirm("Delete this record?")) return;
        const id = Number(btn.dataset.id);
        let arr = loadJSON(TESTS_KEY);
        arr = arr.filter(x=>x.id!==id);
        saveJSON(TESTS_KEY, arr);
        renderRecordsTab();
      });
    });

    function applyRecordsFilter(){
      const fy = document.getElementById("r_filter_year").value;
      const fs = document.getElementById("r_filter_source").value;
      const fr = document.getElementById("r_filter_result").value;
      let arr = loadJSON(TESTS_KEY);
      if (fy) arr = arr.filter(t => { try { return new Date(t.testDate).getFullYear()+'' === fy+''; } catch(e){ return false; } });
      if (fs) arr = arr.filter(t => (t.sourceId+'') === (fs+''));
      if (fr) arr = arr.filter(t => (t.resultChlorine+'') === (fr+'') || (t.resultBacteria+'') === (fr+''));
      const tbody = document.getElementById("records_table_body");
      if (!arr.length) { tbody.innerHTML = `<tr><td colspan="9" style="padding:12px;color:#666;">No records</td></tr>`; return; }
      tbody.innerHTML = arr.map((t,i)=>`<tr data-id="${t.id}"><td style="padding:10px 6px;">${i+1}</td><td style="padding:10px 6px;">${escapeHtml(t.testDate)}</td><td style="padding:10px 6px;">${escapeHtml((sources.find(s=>s.id==t.sourceId)||{}).name||t.sourceId)}</td><td style="padding:10px 6px;">${escapeHtml(t.chlorineCount)}</td><td style="padding:10px 6px;">${escapeHtml(t.resultChlorine)}</td><td style="padding:10px 6px;">${escapeHtml(t.resultBacteria)}</td><td style="padding:10px 6px;">${escapeHtml(t.actions)}</td><td style="padding:10px 6px;">${escapeHtml(t.reportSentDate)}</td><td style="padding:10px 6px;"><button class="edit-record" data-id="${t.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ffd54f;">Edit</button><button class="del-record" data-id="${t.id}" style="padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ef9a9a;">Delete</button></td></tr>`).join("");
    }
  }

  // patch save handler (supports edit via dataset.editId)
  function patchDataEntrySaveHandler(){
    const existing = document.getElementById("save_de_btn");
    if (!existing) return;
    const newBtn = existing.cloneNode(true);
    existing.parentNode.replaceChild(newBtn, existing);
    newBtn.addEventListener("click", () => {
      const editId = newBtn.dataset.editId ? Number(newBtn.dataset.editId) : null;
      const gnId = document.getElementById("de_gn_select").value || "";
      const sourceId = document.getElementById("de_source_select").value || "";
      const testDate = document.getElementById("de_test_date").value || "";
      const chlorineCount = document.getElementById("de_chlorine_count").value || "";
      const resultChlorine = document.getElementById("de_result_chlorine").value || "";
      const bacteriaSampleDate = document.getElementById("de_bacteria_sample_date").value || "";
      const resultBacteria = document.getElementById("de_result_bacteria").value || "";
      const actions = document.getElementById("de_actions_taken").value || "";
      const reportSentDate = document.getElementById("de_report_sent_date").value || "";

      if (!sourceId || !testDate) { alert("මුලාශ්‍රය සහ පරීක්ෂා කල දිනය අවශ්‍යයි."); return; }
      const arr = loadJSON(TESTS_KEY);
      if (!editId) {
        arr.unshift({ id: Date.now(), gnId, sourceId, testDate, chlorineCount, resultChlorine, bacteriaSampleDate, resultBacteria, actions, reportSentDate });
      } else {
        const idx = arr.findIndex(x=>x.id===editId);
        if (idx>=0) arr[idx] = { id: editId, gnId, sourceId, testDate, chlorineCount, resultChlorine, bacteriaSampleDate, resultBacteria, actions, reportSentDate };
        else arr.unshift({ id: editId, gnId, sourceId, testDate, chlorineCount, resultChlorine, bacteriaSampleDate, resultBacteria, actions, reportSentDate });
        delete newBtn.dataset.editId;
      }
      saveJSON(TESTS_KEY, arr);
      alert("Record saved.");
      // clear form fields after save
      ["de_gn_select","de_source_select","de_test_date","de_chlorine_count","de_result_chlorine","de_bacteria_sample_date","de_result_bacteria","de_actions_taken","de_report_sent_date"].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=""; });
    });
  }

  // expose API if needed
  window.commonDrinkingWaterAPI = {
    addSource(obj){ const arr = loadJSON(SOURCES_KEY); arr.unshift(obj); saveJSON(SOURCES_KEY, arr); },
    getSources(){ return loadJSON(SOURCES_KEY); },
    getTests(){ return loadJSON(TESTS_KEY); }
  };

})();
