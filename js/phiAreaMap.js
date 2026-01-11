/* phiAreaMap.js
   Improved PHI Area — සාමාන්‍ය තොරතුරු UI
   - Uses compact two-column input layout like commonDrinkingWater.js
   - Manages PHI info, Schools, GN divisions, PHM Areas
   - Map upload + symbols retained
   Storage keys:
     - phi_info_v1
     - phi_schools_v2
     - phi_gns_v2
     - phi_phm_v1
     - phiAreaMap (image)
     - phiMapSymbols
*/
(function(){
  // ======= Storage keys & small utilities =======
  const PHI_INFO_KEY = "phi_info_v1";
  const SCHOOLS_KEY = "phi_schools_v2";
  const GNS_KEY = "phi_gns_v2";
  const PHM_KEY = "phi_phm_v1";
  const AREA_MAP_KEY = "phiAreaMap";
  const SYMBOLS_KEY = "phiMapSymbols";

  const UPLOAD_MAX_BYTES = 10 * 1024 * 1024; // 10MB
  const MAX_IMAGE_DIM = 1200;
  const JPEG_QUALITY = 0.78;

  function loadJSON(k){ try { return JSON.parse(localStorage.getItem(k) || "[]"); } catch(e){ return []; } }
  function saveJSON(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){ console.error("saveJSON failed", e); } }
  function uid(){ return Date.now() + Math.floor(Math.random()*9999); }
  function esc(s){ if(s===null||s===undefined) return ""; return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  // shared styles (match commonDrinkingWater)
  const inputStyle = "width:100%;padding:10px;border:1px solid #d0d6db;border-radius:8px;box-sizing:border-box;font-size:14px;";
  const labelStyle = "font-weight:600;color:#223;";

  // ======== Image processing helper (resize & compress) ========
  function processImage(file, cb, onErr){
    if(!file) return cb(null);
    if(!file.type.startsWith("image/")) return onErr && onErr("Not an image.");
    if(file.size > UPLOAD_MAX_BYTES) return onErr && onErr("File too large.");
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        const max = Math.max(w,h);
        if(max > MAX_IMAGE_DIM){
          const ratio = MAX_IMAGE_DIM / max;
          w = Math.round(w*ratio); h = Math.round(h*ratio);
        }
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#fff"; ctx.fillRect(0,0,w,h);
        ctx.drawImage(img,0,0,w,h);
        try { cb(c.toDataURL("image/jpeg", JPEG_QUALITY)); }
        catch(err){ try { cb(c.toDataURL()); } catch(e){ onErr && onErr("Image processing failed."); } }
      };
      img.onerror = ()=> onErr && onErr("Invalid image data.");
      img.src = r.result;
    };
    r.onerror = ()=> onErr && onErr("File read error.");
    r.readAsDataURL(file);
  }

  // ======== Render PHI Info Panel (top) ========
  function renderPHIInfoPanel(container){
    const phiData = loadJSON(PHI_INFO_KEY).slice().sort((a,b)=> (b.date||"") > (a.date||"") ? 1 : -1);
    const active = phiData[0] || null;

    const html = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);margin-bottom:12px;">
        <h3 style="margin:0 0 10px 0;">මහජන සෞඛ්‍ය පරීක්ෂක — සාමාන්‍ය තොරතුරු</h3>

        <div style="display:grid;grid-template-columns:260px 1fr;gap:12px 18px;align-items:start;">
          <div>
            <div id="phi_avatar" style="width:84px;height:84px;border-radius:8px;background:#f1f1f1;display:flex;align-items:center;justify-content:center;overflow:hidden;">
              ${active && active.photo ? `<img src="${active.photo}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="font-weight:700;font-size:28px;color:#666;">P</div>`}
            </div>
            <div style="margin-top:8px;">
              <input id="phi_photo_input" type="file" accept="image/*" style="${inputStyle};padding:6px;" />
              <div style="font-size:12px;color:#666;margin-top:6px;">Max ${Math.round(UPLOAD_MAX_BYTES/1024/1024)}MB — auto resize</div>
            </div>
          </div>

          <div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div>
                <label style="${labelStyle};display:block;margin-bottom:6px;">පරීක්ෂකගේ නම</label>
                <input id="phi_name" style="${inputStyle}" placeholder="Name" value="${esc(active && active.name)}" />
              </div>
              <div>
                <label style="${labelStyle};display:block;margin-bottom:6px;">ක්ෂේත්‍රය</label>
                <input id="phi_area" style="${inputStyle}" placeholder="Area" value="${esc(active && active.area)}" />
              </div>
              <div>
                <label style="${labelStyle};display:block;margin-bottom:6px;">කෙටි යෙදුම</label>
                <input id="phi_short" style="${inputStyle}" placeholder="Short title" value="${esc(active && active.short)}" />
              </div>
              <div>
                <label style="${labelStyle};display:block;margin-bottom:6px;">දුරකථන</label>
                <input id="phi_phone" style="${inputStyle}" placeholder="Phone" value="${esc(active && active.phone)}" />
              </div>
              <div style="grid-column:1 / -1;">
                <label style="${labelStyle};display:block;margin-bottom:6px;">භාරගත් දිනය</label>
                <input id="phi_date" type="date" style="${inputStyle}" value="${esc(active && active.date)}" />
              </div>
            </div>

            <div style="margin-top:12px;display:flex;gap:8px;">
              <button id="phi_save_btn" style="background:#0b74d1;color:#fff;padding:9px 14px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Add / Save</button>
              <button id="phi_cancel_btn" style="display:none;background:#777;color:#fff;padding:9px 14px;border:none;border-radius:8px;cursor:pointer;">Cancel Edit</button>
            </div>
          </div>
        </div>

        <div style="margin-top:12px;overflow:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="text-align:left;color:#2b3b4a;">
                <th style="width:56px;padding:8px 6px;">#</th>
                <th style="padding:8px 6px;">Name</th>
                <th style="padding:8px 6px;">Area</th>
                <th style="padding:8px 6px;">Short</th>
                <th style="padding:8px 6px;">Phone</th>
                <th style="padding:8px 6px;">Date</th>
                <th style="padding:8px 6px;">Photo</th>
                <th style="padding:8px 6px;width:140px;">Actions</th>
              </tr>
            </thead>
            <tbody id="phi_table_body">
              ${phiData.length ? phiData.map((p,i)=>`
                <tr data-id="${p.id}">
                  <td style="padding:8px 6px;">${i+1}</td>
                  <td style="padding:8px 6px;">${esc(p.name)}</td>
                  <td style="padding:8px 6px;">${esc(p.area)}</td>
                  <td style="padding:8px 6px;">${esc(p.short)}</td>
                  <td style="padding:8px 6px;">${esc(p.phone)}</td>
                  <td style="padding:8px 6px;">${esc(p.date)}</td>
                  <td style="padding:8px 6px;">${p.photo ? `<img src="${p.photo}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;">` : '—'}</td>
                  <td style="padding:8px 6px;"><button class="phi_edit" data-id="${p.id}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ffd54f;">Edit</button><button class="phi_del" data-id="${p.id}" style="padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ef9a9a;">Delete</button></td>
                </tr>
              `).join("") : `<tr><td colspan="8" style="padding:12px;color:#666;">No records</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
    container.innerHTML = html;

    // Bind buttons
    let phiEditId = null;
    const saveBtn = container.querySelector("#phi_save_btn");
    const cancelBtn = container.querySelector("#phi_cancel_btn");
    const photoInput = container.querySelector("#phi_photo_input");
    const avatar = container.querySelector("#phi_avatar");

    // preview on file select
    photoInput.addEventListener("change", (e)=>{
      const f = e.target.files && e.target.files[0];
      if(!f) return;
      if(f.size > UPLOAD_MAX_BYTES){ alert("File too large."); photoInput.value=""; return; }
      const r = new FileReader();
      r.onload = () => { avatar.innerHTML = `<img src="${r.result}" style="width:100%;height:100%;object-fit:cover;">`; };
      r.readAsDataURL(f);
    });

    saveBtn.addEventListener("click", ()=>{
      const name = container.querySelector("#phi_name").value.trim();
      const area = container.querySelector("#phi_area").value.trim();
      const short = container.querySelector("#phi_short").value.trim();
      const phone = container.querySelector("#phi_phone").value.trim();
      const date = container.querySelector("#phi_date").value || "";
      if(!name || !area){ alert("නම සහ ක්ෂේත්‍රය අවශ්‍ය වේ."); return; }

      function persist(photoData){
        const arr = loadJSON(PHI_INFO_KEY);
        if(phiEditId === null){
          arr.unshift({ id: uid(), name, area, short, phone, date, photo: photoData || null });
        } else {
          const idx = arr.findIndex(x=>x.id === phiEditId);
          if(idx >= 0) arr[idx] = { id: phiEditId, name, area, short, phone, date, photo: photoData || arr[idx].photo || null };
          else arr.unshift({ id: phiEditId, name, area, short, phone, date, photo: photoData || null });
        }
        saveJSON(PHI_INFO_KEY, arr);
        phiEditId = null;
        cancelBtn.style.display = "none";
        photoInput.value = "";
        renderPHIInfoPanel(container);
      }

      if(photoInput.files && photoInput.files[0]) {
        processImage(photoInput.files[0], (durl)=> persist(durl), (err)=> alert(err || "Image error"));
      } else {
        persist(null);
      }
    });

    cancelBtn.addEventListener("click", ()=>{
      phiEditId = null;
      cancelBtn.style.display = "none";
      container.querySelector("#phi_name").value = "";
      container.querySelector("#phi_area").value = "";
      container.querySelector("#phi_short").value = "";
      container.querySelector("#phi_phone").value = "";
      container.querySelector("#phi_date").value = "";
      photoInput.value = "";
    });

    // table edit/delete delegates
    container.querySelectorAll(".phi_del").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = Number(btn.dataset.id);
        if(!confirm("Delete this PHI record?")) return;
        const arr = loadJSON(PHI_INFO_KEY).filter(x=>x.id !== id);
        saveJSON(PHI_INFO_KEY, arr);
        renderPHIInfoPanel(container);
      });
    });
    container.querySelectorAll(".phi_edit").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = Number(btn.dataset.id);
        const arr = loadJSON(PHI_INFO_KEY);
        const rec = arr.find(x=>x.id === id);
        if(!rec) return;
        phiEditId = id;
        cancelBtn.style.display = "inline-block";
        container.querySelector("#phi_name").value = rec.name || "";
        container.querySelector("#phi_area").value = rec.area || "";
        container.querySelector("#phi_short").value = rec.short || "";
        container.querySelector("#phi_phone").value = rec.phone || "";
        container.querySelector("#phi_date").value = rec.date || "";
        if(rec.photo) avatar.innerHTML = `<img src="${rec.photo}" style="width:100%;height:100%;object-fit:cover;">`;
        container.querySelector("#phi_name").scrollIntoView({behavior:"smooth"});
      });
    });
  } // end renderPHIInfoPanel

  // ======== Meta panel (schools, GN, PHM) styled like Common Drinking-Water ========
  function renderMetaPanel(container){
    const schools = loadJSON(SCHOOLS_KEY);
    const gns = loadJSON(GNS_KEY);
    const phms = loadJSON(PHM_KEY);

    const gnOptionsHtml = gns.length ? gns.map(g=>`<option value="${esc(g.id)}" data-no="${esc(g.no||'')}">${esc(g.no||'')}${g.name? ' - '+esc(g.name):''}</option>`).join("") : `<option disabled>No GN entries</option>`;

    const html = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 10px 0;color:#073b6a;">PHI Area — සාමාන්‍ය තොරතුරු (Meta)</h4>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          <!-- SCHOOLS -->
          <div style="background:#fbfdff;padding:12px;border-radius:8px;">
            <h5 style="margin:0 0 8px 0;">පාසල් (Schools)</h5>
            <div style="display:grid;grid-template-columns:150px 1fr;gap:8px 12px;align-items:center;">
              <label style="${labelStyle};text-align:right;padding-right:6px;">Name</label><input id="school_name" style="${inputStyle}" placeholder="School name" />
              <label style="${labelStyle};text-align:right;padding-right:6px;">Reg No</label><input id="school_reg" style="${inputStyle}" placeholder="Reg no" />
              <label style="${labelStyle};text-align:right;padding-right:6px;">Phone</label><input id="school_phone" style="${inputStyle}" placeholder="Phone" />
              <div></div>
              <div style="display:flex;gap:8px;">
                <button id="school_save" style="background:#0b74d1;color:#fff;padding:8px 12px;border:none;border-radius:8px;">Add / Save</button>
                <button id="school_cancel" style="background:#e2e8f0;padding:8px 12px;border:none;border-radius:8px;">Clear</button>
              </div>
            </div>

            <div style="margin-top:12px;overflow:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead><tr><th style="width:48px">#</th><th>Name</th><th>Reg</th><th>Phone</th><th style="width:120px">Actions</th></tr></thead>
                <tbody id="schools_body">${schools.length ? schools.map((s,i)=>`<tr data-id="${s.id}"><td style="padding:8px">${i+1}</td><td>${esc(s.name)}</td><td>${esc(s.reg)}</td><td>${esc(s.phone||'')}</td><td><button class="edit_school" data-id="${s.id}" style="margin-right:6px;">Edit</button><button class="del_school" data-id="${s.id}">Delete</button></td></tr>`).join("") : `<tr><td colspan="5" style="padding:10px;color:#666;">No schools</td></tr>`}</tbody>
              </table>
            </div>
          </div>

          <!-- GN DIVISIONS -->
          <div style="background:#fbfdff;padding:12px;border-radius:8px;">
            <h5 style="margin:0 0 8px 0;">GN Division</h5>
            <div style="display:grid;grid-template-columns:120px 1fr;gap:8px 12px;align-items:center;">
              <label style="${labelStyle};text-align:right;padding-right:6px;">GN No</label><input id="gn_no" style="${inputStyle}" placeholder="GN No" />
              <label style="${labelStyle};text-align:right;padding-right:6px;">GN Name</label><input id="gn_name" style="${inputStyle}" placeholder="GN name" />
              <label style="${labelStyle};text-align:right;padding-right:6px;">Officer</label><input id="gn_officer" style="${inputStyle}" placeholder="Officer" />
              <label style="${labelStyle};text-align:right;padding-right:6px;">Phone</label><input id="gn_phone" style="${inputStyle}" placeholder="Phone" />
              <div></div>
              <div style="display:flex;gap:8px;">
                <button id="gn_save" style="background:#0b74d1;color:#fff;padding:8px 12px;border:none;border-radius:8px;">Add / Save</button>
                <button id="gn_cancel" style="background:#e2e8f0;padding:8px 12px;border:none;border-radius:8px;">Clear</button>
              </div>
            </div>

            <div style="margin-top:12px;overflow:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead><tr><th style="width:48px">#</th><th>GN No</th><th>GN Name</th><th>Officer</th><th>Phone</th><th style="width:120px">Actions</th></tr></thead>
                <tbody id="gns_body">${gns.length ? gns.map((g,i)=>`<tr data-id="${g.id}"><td style="padding:8px">${i+1}</td><td>${esc(g.no)}</td><td>${esc(g.name)}</td><td>${esc(g.officer||'')}</td><td>${esc(g.phone||'')}</td><td><button class="edit_gn" data-id="${g.id}" style="margin-right:6px;">Edit</button><button class="del_gn" data-id="${g.id}">Delete</button></td></tr>`).join("") : `<tr><td colspan="6" style="padding:10px;color:#666;">No GN divisions</td></tr>`}</tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- PHM AREA -->
        <div style="margin-top:12px;border-top:1px solid #eef2f7;padding-top:12px;">
          <h5 style="margin:4px 0 8px 0;">PHM Areas</h5>
          <div style="display:grid;grid-template-columns:220px 1fr 1fr;gap:8px 12px;align-items:center;">
            <input id="phm_area_name" placeholder="PHM Area Name" style="${inputStyle}" />
            <select id="phm_gns_select" multiple size="4" style="${inputStyle}">${gnOptionsHtml}</select>
            <div style="display:grid;gap:8px;">
              <input id="phm_name" placeholder="PHM Name" style="${inputStyle}" />
              <input id="phm_phone" placeholder="Phone" style="${inputStyle}" />
            </div>
            <div style="grid-column:1 / -1;display:flex;gap:8px;">
              <button id="phm_save" style="background:#0b74d1;color:#fff;padding:8px 12px;border:none;border-radius:8px;">Add / Save PHM</button>
              <button id="phm_cancel" style="background:#e2e8f0;padding:8px 12px;border:none;border-radius:8px;">Clear</button>
            </div>
          </div>

          <div style="margin-top:12px;overflow:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:13px;">
              <thead><tr><th style="width:48px">#</th><th>PHM Area</th><th>GN Divisions</th><th>PHM Name</th><th>Phone</th><th style="width:120px">Actions</th></tr></thead>
              <tbody id="phm_body">${phms.length ? phms.map((p,i)=>{
                const labels = (p.gnValues||[]).map(v => {
                  const g = gns.find(x=> String(x.id) === String(v));
                  return g ? (g.no ? `${g.no}${g.name ? ' - '+g.name : ''}` : (g.name||v)) : v;
                }).join(", ");
                return `<tr data-id="${p.id}"><td style="padding:8px">${i+1}</td><td>${esc(p.areaName)}</td><td>${esc(labels)}</td><td>${esc(p.phmName)}</td><td>${esc(p.phone||'')}</td><td><button class="edit_phm" data-id="${p.id}" style="margin-right:6px;">Edit</button><button class="del_phm" data-id="${p.id}">Delete</button></td></tr>`;
              }).join("") : `<tr><td colspan="6" style="padding:10px;color:#666;">No PHM areas</td></tr>`}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    container.innerHTML = html;

    // ===== Bind schools handlers =====
    let schoolEditId = null;
    const schoolSave = container.querySelector("#school_save");
    const schoolCancel = container.querySelector("#school_cancel");
    schoolSave.addEventListener("click", ()=>{
      const name = container.querySelector("#school_name").value.trim();
      const reg = container.querySelector("#school_reg").value.trim();
      const phone = container.querySelector("#school_phone").value.trim();
      if(!name && !reg && !phone) { alert("Enter at least one field."); return; }
      const arr = loadJSON(SCHOOLS_KEY);
      if(!schoolEditId) arr.unshift({ id: uid(), name, reg, phone });
      else {
        const idx = arr.findIndex(x=>x.id === schoolEditId);
        if(idx >= 0) arr[idx] = { id: schoolEditId, name, reg, phone }; else arr.unshift({ id: schoolEditId, name, reg, phone });
      }
      saveJSON(SCHOOLS_KEY, arr);
      renderMetaPanel(container);
    });
    schoolCancel.addEventListener("click", ()=> {
      schoolEditId = null;
      ["#school_name","#school_reg","#school_phone"].forEach(s => container.querySelector(s).value = "");
    });
    container.querySelectorAll(".del_school").forEach(b => b.addEventListener("click", ()=>{
      if(!confirm("Delete this school?")) return;
      const id = Number(b.dataset.id);
      const arr = loadJSON(SCHOOLS_KEY).filter(x=>x.id !== id);
      saveJSON(SCHOOLS_KEY, arr);
      renderMetaPanel(container);
    }));
    container.querySelectorAll(".edit_school").forEach(b => b.addEventListener("click", ()=>{
      const id = Number(b.dataset.id);
      const arr = loadJSON(SCHOOLS_KEY);
      const rec = arr.find(x=>x.id === id);
      if(!rec) return;
      schoolEditId = id;
      container.querySelector("#school_name").value = rec.name || "";
      container.querySelector("#school_reg").value = rec.reg || "";
      container.querySelector("#school_phone").value = rec.phone || "";
      container.querySelector("#school_name").scrollIntoView({behavior:"smooth"});
    }));

    // ===== Bind GN handlers =====
    let gnEditId = null;
    container.querySelector("#gn_save").addEventListener("click", ()=>{
      const no = container.querySelector("#gn_no").value.trim();
      const name = container.querySelector("#gn_name").value.trim();
      const officer = container.querySelector("#gn_officer").value.trim();
      const phone = container.querySelector("#gn_phone").value.trim();
      if(!no && !name) { alert("Enter GN No or Name."); return; }
      const arr = loadJSON(GNS_KEY);
      if(!gnEditId) arr.unshift({ id: uid(), no, name, officer, phone });
      else {
        const idx = arr.findIndex(x=>x.id === gnEditId);
        if(idx >= 0) arr[idx] = { id: gnEditId, no, name, officer, phone }; else arr.unshift({ id: gnEditId, no, name, officer, phone });
      }
      saveJSON(GNS_KEY, arr);
      renderMetaPanel(container);
    });
    container.querySelector("#gn_cancel").addEventListener("click", ()=>{
      gnEditId = null;
      ["#gn_no","#gn_name","#gn_officer","#gn_phone"].forEach(s => container.querySelector(s).value = "");
    });
    container.querySelectorAll(".del_gn").forEach(b => b.addEventListener("click", ()=>{
      if(!confirm("Delete this GN division?")) return;
      const id = Number(b.dataset.id);
      const arr = loadJSON(GNS_KEY).filter(x=>x.id !== id);
      saveJSON(GNS_KEY, arr);
      renderMetaPanel(container);
    }));
    container.querySelectorAll(".edit_gn").forEach(b => b.addEventListener("click", ()=>{
      const id = Number(b.dataset.id);
      const arr = loadJSON(GNS_KEY);
      const rec = arr.find(x=>x.id === id); if(!rec) return;
      gnEditId = id;
      container.querySelector("#gn_no").value = rec.no || "";
      container.querySelector("#gn_name").value = rec.name || "";
      container.querySelector("#gn_officer").value = rec.officer || "";
      container.querySelector("#gn_phone").value = rec.phone || "";
      container.querySelector("#gn_no").scrollIntoView({behavior:"smooth"});
    }));

    // ===== Bind PHM handlers =====
    let phmEditId = null;
    container.querySelector("#phm_save").addEventListener("click", ()=>{
      const areaName = container.querySelector("#phm_area_name").value.trim();
      const sel = container.querySelector("#phm_gns_select");
      const selected = Array.from(sel.selectedOptions).map(o => o.value);
      const phmName = container.querySelector("#phm_name").value.trim();
      const phone = container.querySelector("#phm_phone").value.trim();
      if(!areaName) { alert("PHM Area Name required."); return; }
      const arr = loadJSON(PHM_KEY);
      if(!phmEditId) arr.unshift({ id: uid(), areaName, gnValues: selected, phmName, phone });
      else {
        const idx = arr.findIndex(x=>x.id === phmEditId);
        if(idx >= 0) arr[idx] = { id: phmEditId, areaName, gnValues: selected, phmName, phone }; else arr.unshift({ id: phmEditId, areaName, gnValues: selected, phmName, phone });
      }
      saveJSON(PHM_KEY, arr);
      renderMetaPanel(container);
    });
    container.querySelector("#phm_cancel").addEventListener("click", ()=>{
      phmEditId = null;
      ["#phm_area_name","#phm_name","#phm_phone"].forEach(s=>container.querySelector(s).value="");
      Array.from(container.querySelector("#phm_gns_select").options).forEach(o=>o.selected=false);
    });
    container.querySelectorAll(".del_phm").forEach(b => b.addEventListener("click", ()=>{
      if(!confirm("Delete this PHM area?")) return;
      const id = Number(b.dataset.id);
      const arr = loadJSON(PHM_KEY).filter(x=>x.id !== id);
      saveJSON(PHM_KEY, arr);
      renderMetaPanel(container);
    }));
    container.querySelectorAll(".edit_phm").forEach(b => b.addEventListener("click", ()=>{
      const id = Number(b.dataset.id);
      const arr = loadJSON(PHM_KEY);
      const rec = arr.find(x=>x.id === id); if(!rec) return;
      phmEditId = id;
      container.querySelector("#phm_area_name").value = rec.areaName || "";
      container.querySelector("#phm_name").value = rec.phmName || "";
      container.querySelector("#phm_phone").value = rec.phone || "";
      const sel = container.querySelector("#phm_gns_select");
      Array.from(sel.options).forEach(o => o.selected = rec.gnValues && rec.gnValues.includes(o.value));
    }));
  } // end renderMetaPanel

  // ======== Map & Symbols UI (kept compact) ========
  function renderMapSection(container){
    const savedMap = localStorage.getItem(AREA_MAP_KEY);
    const symbols = loadJSON(SYMBOLS_KEY) || [];
    container.innerHTML = `
      <div style="margin-top:12px;">
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
          <input type="file" id="map_upload" accept="image/*" />
          <button id="map_upload_btn" style="background:#0b74d1;color:#fff;padding:8px 12px;border:none;border-radius:8px;">Upload & Save Map</button>
          <div style="margin-left:auto;display:flex;gap:8px;">
            <select id="symbol_type" style="${inputStyle};width:160px;padding:8px;"> <option value="school">පාසල</option><option value="hospital">රෝහල</option><option value="other">වෙනත්</option> </select>
            <button id="add_symbol_btn" style="background:#06ad7d;color:#fff;padding:8px 12px;border:none;border-radius:8px;">Add Symbol</button>
            <button id="clear_symbols_btn" style="background:#ef9a9a;color:#222;padding:8px 12px;border:none;border-radius:8px;">Clear Symbols</button>
          </div>
        </div>

        <div id="map_container" style="width:100%;height:420px;border:1px dashed #ccc;border-radius:8px;background:#fafafa;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;">
          <p id="map_nodata" style="color:#666;">Map not uploaded</p>
          <canvas id="map_canvas" style="display:none;width:100%;height:100%;"></canvas>
        </div>
      </div>
    `;

    // basic canvas rendering, symbol adding (kept simple)
    const upload = container.querySelector("#map_upload");
    const uploadBtn = container.querySelector("#map_upload_btn");
    const canvas = container.querySelector("#map_canvas");
    const ctx = canvas.getContext("2d");
    const mapContainer = container.querySelector("#map_container");
    const noData = container.querySelector("#map_nodata");
    let currentImage = null;
    let mapSymbols = symbols.slice();

    function computeRenderDims(imgW,imgH,cw,ch){
      const ia = imgW/imgH, ca = cw/ch;
      let rw,rh;
      if(ca > ia){ rh = ch; rw = rh * ia; } else { rw = cw; rh = rw / ia; }
      return { renderWidth: rw, renderHeight: rh };
    }

    function drawAll(){
      if(!currentImage){ noData.style.display="block"; canvas.style.display="none"; return; }
      noData.style.display="none"; canvas.style.display="block";
      const cw = mapContainer.clientWidth, ch = mapContainer.clientHeight;
      canvas.width = cw; canvas.height = ch;
      ctx.clearRect(0,0,cw,ch);
      const dims = computeRenderDims(currentImage.width, currentImage.height, cw,ch);
      const rw = dims.renderWidth, rh = dims.renderHeight;
      const ox = (cw - rw)/2, oy = (ch - rh)/2;
      ctx.drawImage(currentImage, ox, oy, rw, rh);
      // draw symbols
      mapSymbols.forEach(s=>{
        const x = ox + (s.x * rw / currentImage.width);
        const y = oy + (s.y * rh / currentImage.height);
        ctx.beginPath();
        if(s.type === "school"){ ctx.fillStyle="#1e88e5"; ctx.fillRect(x-8,y-8,16,16); ctx.fillStyle="#fff"; ctx.font="bold 12px Arial"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("S", x, y); }
        else if(s.type === "hospital"){ ctx.fillStyle="#e53935"; ctx.beginPath(); ctx.arc(x,y,10,0,2*Math.PI); ctx.fill(); ctx.fillStyle="#fff"; ctx.fillText("H", x,y); }
        else { ctx.fillStyle="#2e7d32"; ctx.beginPath(); ctx.moveTo(x,y-10); ctx.lineTo(x+10,y+10); ctx.lineTo(x-10,y+10); ctx.closePath(); ctx.fill(); ctx.fillStyle="#fff"; ctx.fillText("O", x,y); }
        ctx.closePath();
      });
    }

    // init if saved
    if(localStorage.getItem(AREA_MAP_KEY)){
      const d = localStorage.getItem(AREA_MAP_KEY);
      currentImage = new Image();
      currentImage.onload = ()=> drawAll();
      currentImage.src = d;
    }

    uploadBtn.addEventListener("click", ()=> upload.click());
    upload.addEventListener("change", (ev)=>{
      const f = ev.target.files && ev.target.files[0];
      if(!f) return;
      if(!f.type.startsWith("image/")) return alert("Please upload image file.");
      if(f.size > UPLOAD_MAX_BYTES) return alert("File too large.");
      processImage(f, (dataUrl)=>{
        localStorage.setItem(AREA_MAP_KEY, dataUrl);
        currentImage = new Image();
        currentImage.onload = ()=> drawAll();
        currentImage.src = dataUrl;
        // reset symbols
        mapSymbols = [];
        saveJSON(SYMBOLS_KEY, mapSymbols);
        alert("Map uploaded.");
      }, (err)=> alert(err || "Image error"));
    });

    // add symbol by clicking canvas (simple mode)
    let addMode = false;
    const addBtn = container.querySelector("#add_symbol_btn");
    const typeSelect = container.querySelector("#symbol_type");
    addBtn.addEventListener("click", ()=> { addMode = !addMode; addBtn.textContent = addMode ? "Click on map to place" : "Add Symbol"; addBtn.style.background = addMode ? "#ffd54f" : "#06ad7d"; });

    canvas.addEventListener("click", (e)=>{
      if(!addMode) return;
      if(!currentImage) return alert("No map loaded.");
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
      // map back to original image coords using computeRenderDims
      const dims = computeRenderDims(currentImage.width, currentImage.height, canvas.width, canvas.height);
      const ox = (canvas.width - dims.renderWidth)/2, oy = (canvas.height - dims.renderHeight)/2;
      const imgX = Math.round((cx - ox) * (currentImage.width / dims.renderWidth));
      const imgY = Math.round((cy - oy) * (currentImage.height / dims.renderHeight));
      if(imgX < 0 || imgY < 0 || imgX > currentImage.width || imgY > currentImage.height) return alert("Click inside image area.");
      const s = { id: uid(), type: typeSelect.value || "other", x: imgX, y: imgY };
      mapSymbols.unshift(s);
      saveJSON(SYMBOLS_KEY, mapSymbols);
      drawAll();
      addMode = false; addBtn.textContent = "Add Symbol"; addBtn.style.background = "#06ad7d";
    });

    // clear symbols
    container.querySelector("#clear_symbols_btn").addEventListener("click", ()=>{
      if(!confirm("Clear all symbols?")) return;
      mapSymbols = []; saveJSON(SYMBOLS_KEY, mapSymbols); drawAll();
    });
  }

  // ======== Main entry: render page in #contentArea ========
  window.openPhiAreaMap = function(){
    const content = document.getElementById("contentArea");
    if(!content) return console.warn("contentArea not found");
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2 style="margin:0;">PHI Area — සාමාන්‍ය තොරතුරු</h2>
        <button onclick="showContent('Registers', null)" style="background:#0b74d1;color:#fff;padding:8px 12px;border-radius:8px;border:none;">Back</button>
      </div>
      <div id="phi_top_panel"></div>
      <div id="phi_meta_panel" style="margin-top:12px;"></div>
      <div id="phi_map_panel" style="margin-top:12px;"></div>
    `;
    renderPHIInfoAndMetaAndMap();
  };

  // helper to render all three sections
  function renderPHIInfoAndMetaAndMap(){
    const top = document.getElementById("phi_top_panel");
    const meta = document.getElementById("phi_meta_panel");
    const map = document.getElementById("phi_map_panel");
    renderPHIInfoPanel(top);
    renderMetaPanel(meta);
    renderMapSection(map);
    // sync header (optional)
    syncHeader();
  }

  // set profile display (small)
  function syncHeader(){
    try {
      const phi = loadJSON(PHI_INFO_KEY).slice().sort((a,b)=> (b.date||"") > (a.date||"") ? 1 : -1)[0];
      const logoEl = document.querySelector(".profile .logo");
      const nameEl = document.querySelector(".profile .profile-text strong");
      const smallEl = document.querySelector(".profile .profile-text small");
      if(!logoEl || !nameEl || !smallEl) return;
      if(phi && phi.photo) { logoEl.style.background = `url('${phi.photo}') center/cover`; logoEl.textContent = ""; }
      else { logoEl.style.background = ""; logoEl.textContent = (phi && phi.name ? phi.name.trim().charAt(0).toUpperCase() : "P"); }
      nameEl.textContent = phi && phi.name ? phi.name : "Public Health Inspector";
      smallEl.textContent = phi && phi.area ? `Public Health Inspector — ${phi.area}` : "Public Health Inspector — Area";
    } catch(e){ /* non-fatal */ }
  }

  // initialize empty storage if not existing
  if(!localStorage.getItem(PHI_INFO_KEY)) saveJSON(PHI_INFO_KEY, []);
  if(!localStorage.getItem(SCHOOLS_KEY)) saveJSON(SCHOOLS_KEY, []);
  if(!localStorage.getItem(GNS_KEY)) saveJSON(GNS_KEY, []);
  if(!localStorage.getItem(PHM_KEY)) saveJSON(PHM_KEY, []);
  if(!localStorage.getItem(SYMBOLS_KEY)) saveJSON(SYMBOLS_KEY, []);

  // expose small helpers (optional)
  window._phi_helpers = { loadJSON, saveJSON, processImage };

})(); // end phiAreaMap.js
