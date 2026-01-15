(function () {
  "use strict";

  /* ================= STORAGE ================= */
  const ROLE_KEY = "phi_roles_tree_final";
  const PLACE_KEY = "phi_places_tree_final";
  const HOLIDAY_KEY = "phi_holidays_final";
  const FIXED_DATES_KEY = "phi_fixed_dates_v1";

  let activeEdit = null; // {type,id,subIndex}

  /* ================= HELPERS ================= */
  const $ = id => document.getElementById(id);
  const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  const load = k => JSON.parse(localStorage.getItem(k)||"[]");
  const save = (k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const esc = t => {const d=document.createElement("div"); d.textContent=t; return d.innerHTML;};

  /* ================= CASCADING MENU HELPER ================= */
  function createCascadingMenuButton(namePrefix, type, preservedValue, disabled) {
    const btnId = `${namePrefix}-${type}-btn`;
    const menuId = `${namePrefix}-${type}-menu`;
    
    const items = type === 'role' ? load(ROLE_KEY) : load(PLACE_KEY);
    const displayText = preservedValue ? getDisplayNameById(type, preservedValue) : `-- තෝරන්න --`;
    
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "position:relative;flex:1;min-width:0";
    
    const btn = document.createElement("button");
    btn.id = btnId;
    btn.type = "button";
    btn.className = `${namePrefix}-${type}`;
    btn.style.cssText = `width:100%;padding:clamp(8px,2vw,10px) clamp(10px,2.5vw,14px);border:1px solid #ccc;border-radius:6px;background:#e0e0e0;
            font-size:clamp(11px,2.5vw,14px);color:#000;text-align:left;cursor:pointer;min-height:40px;
            display:flex;justify-content:space-between;align-items:center;transition:background 0.2s ease;
            ${disabled ? 'opacity:0.6;cursor:not-allowed;' : ''}`;
    btn.disabled = disabled;
    btn.dataset.value = preservedValue || "";
    
    const textSpan = document.createElement("span");
    textSpan.style.cssText = "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1";
    textSpan.textContent = displayText;
    
    const arrow = document.createElement("span");
    arrow.style.cssText = "margin-left:4px;color:#6b7280;font-size:clamp(10px,2.2vw,12px)";
    arrow.textContent = "▼";
    
    btn.appendChild(textSpan);
    btn.appendChild(arrow);
    
    // Add hover effect
    if (!disabled) {
      btn.addEventListener("mouseenter", () => {
        btn.style.background = "#2196F3";
        btn.style.color = "#fff";
        arrow.style.color = "#fff";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.background = "#e0e0e0";
        btn.style.color = "#000";
        arrow.style.color = "#6b7280";
      });
    }
    
    // Create cascading menu
    const menu = document.createElement("div");
    menu.id = menuId;
    menu.style.cssText = `position:absolute;top:100%;left:0;min-width:220px;max-width:300px;
            background:#f5f5f5;border:1px solid #ccc;border-radius:8px;
            box-shadow:0 10px 30px rgba(0,0,0,0.3);z-index:99999;display:none;
            max-height:400px;margin-top:4px;overflow:visible`;
    
    // Add menu items
    items.forEach(item => {
      const itemDiv = document.createElement("div");
      itemDiv.style.cssText = `padding:clamp(10px,2.5vw,12px) clamp(12px,3vw,14px);cursor:pointer;display:flex;justify-content:space-between;
              align-items:center;border-bottom:1px solid #bfbfbf;transition:background 0.15s ease;position:relative;font-size:clamp(12px,2.8vw,14px);min-height:44px;`;
      itemDiv.dataset.value = item.id;
      
      const mainText = document.createElement("span");
      mainText.style.cssText = "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap";
      mainText.textContent = item.main || item.id;
      itemDiv.appendChild(mainText);
      
      // Check if has sub items
      if (item.sub && item.sub.length > 0) {
        const indicator = document.createElement("span");
        indicator.style.cssText = "margin-left:8px;color:#666;font-size:clamp(12px,2.8vw,14px)";
        indicator.textContent = "▶";
        itemDiv.appendChild(indicator);
        
        // Create submenu
        const submenu = document.createElement("div");
        submenu.style.cssText = `position:absolute;left:100%;top:0;min-width:180px;
                background:#e8e8e8;border:1px solid #ccc;border-radius:8px;
                box-shadow:0 10px 30px rgba(0,0,0,0.3);display:none;
                max-height:400px;overflow-y:auto;z-index:100000`;

        const positionSubmenu = () => {
          submenu.style.display = "block";
          submenu.style.left = "100%";
          submenu.style.right = "auto";
          const rect = submenu.getBoundingClientRect();
          if (rect.right > window.innerWidth && rect.left > 0) {
            submenu.style.left = "auto";
            submenu.style.right = "100%";
          }
        };
        
        item.sub.forEach(subItem => {
          const subDiv = document.createElement("div");
          subDiv.style.cssText = "padding:clamp(10px,2.5vw,12px) clamp(12px,3vw,14px);cursor:pointer;border-bottom:1px solid #e5e7eb;transition:background 0.15s ease;font-size:clamp(11px,2.5vw,14px);min-height:40px;display:flex;align-items:center;";
          const subId = `${item.id}:${typeof subItem === 'object' ? subItem.name : subItem}`;
          subDiv.dataset.value = subId;
          
          const subName = typeof subItem === 'object' ? subItem.name : subItem;
          const subCode = typeof subItem === 'object' && subItem.code ? ` (${subItem.code})` : '';
          subDiv.textContent = subName + subCode;
          
          subDiv.addEventListener("mouseenter", () => {
            subDiv.style.background = "#2196F3";
            subDiv.style.color = "#fff";
          });
          subDiv.addEventListener("mouseleave", () => {
            subDiv.style.background = "transparent";
            subDiv.style.color = "#000";
          });
          subDiv.addEventListener("click", (e) => {
            e.stopPropagation();
            btn.dataset.value = subId;
            textSpan.textContent = subName;
            menu.style.display = "none";
            submenu.style.display = "none";
            btn.dispatchEvent(new Event('change', { bubbles: true }));
          });
          
          submenu.appendChild(subDiv);
        });
        
        itemDiv.appendChild(submenu);
        
        itemDiv.addEventListener("mouseenter", () => {
          itemDiv.style.background = "#2196F3";
          itemDiv.style.color = "#fff";
          const indicators = itemDiv.querySelectorAll('span');
          indicators.forEach(span => { if (span !== mainText) span.style.color = "#fff"; });
          positionSubmenu();
        });
        itemDiv.addEventListener("mouseleave", (e) => {
          setTimeout(() => {
            if (!submenu.matches(':hover')) {
              itemDiv.style.background = "transparent";
              itemDiv.style.color = "#000";
              const indicators = itemDiv.querySelectorAll('span');
              indicators.forEach(span => { if (span !== mainText) span.style.color = "#666"; });
              submenu.style.display = "none";
            }
          }, 100);
        });
        
        submenu.addEventListener("mouseenter", () => {
          submenu.style.display = "block";
          itemDiv.style.background = "#2196F3";
          itemDiv.style.color = "#fff";
          const indicators = itemDiv.querySelectorAll('span');
          indicators.forEach(span => { if (span !== mainText) span.style.color = "#fff"; });
        });
        submenu.addEventListener("mouseleave", () => {
          submenu.style.display = "none";
          itemDiv.style.background = "transparent";
          itemDiv.style.color = "#000";
          const indicators = itemDiv.querySelectorAll('span');
          indicators.forEach(span => { if (span !== mainText) span.style.color = "#666"; });
        });
      } else {
        // No submenu - click to select main item
        itemDiv.addEventListener("mouseenter", () => {
          itemDiv.style.background = "#2196F3";
          itemDiv.style.color = "#fff";
        });
        itemDiv.addEventListener("mouseleave", () => {
          itemDiv.style.background = "transparent";
          itemDiv.style.color = "#000";
        });
      }
      
      // Main item click
      itemDiv.addEventListener("click", (e) => {
        if (!item.sub || item.sub.length === 0) {
          btn.dataset.value = item.id;
          textSpan.textContent = item.main || item.id;
          menu.style.display = "none";
          btn.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      menu.appendChild(itemDiv);
    });
    
    // Toggle menu on button click
    btn.addEventListener("click", (e) => {
      if (disabled) return;
      e.stopPropagation();
      const isVisible = menu.style.display === "block";
      document.querySelectorAll('[id$="-menu"]').forEach(m => m.style.display = "none");
      
      if (!isVisible) {
        menu.style.display = "block";
      } else {
        menu.style.display = "none";
      }
    });
    
    wrapper.appendChild(btn);
    wrapper.appendChild(menu);
    
    return wrapper;
  }

  function getDisplayNameById(type, id) {
    if (!id) return "";
    const arr = type === 'role' ? load(ROLE_KEY) : load(PLACE_KEY);
    if (id.includes(':')) {
      const [mainId, subName] = id.split(':');
      const main = arr.find(x => String(x.id) === String(mainId));
      if (main && main.sub && Array.isArray(main.sub)) {
        const subItem = main.sub.find(s => {
          const sName = typeof s === 'object' ? s.name : s;
          return sName === subName;
        });
        if (subItem) {
          if (typeof subItem === 'object' && subItem.code) {
            return `${subItem.name} (${subItem.code})`;
          }
          return typeof subItem === 'object' ? subItem.name : subItem;
        }
      }
      return subName;
    }
    const r = arr.find(x => String(x.id) === String(id));
    return r ? (r.main || "") : "";
  }

  // Close menus when clicking outside
  document.addEventListener("click", () => {
    document.querySelectorAll('[id$="-menu"]').forEach(m => m.style.display = "none");
  });

  /* ================= MAIN RENDER ================= */
  window.renderPhiKeyMapTab = function(container){
    if(typeof container==="string") container=$(container);

    container.innerHTML = `
      <div class="glass" style="padding:20px;padding:clamp(10px,3vw,20px);">
        <h3 style="color:#0b5ea8;margin-bottom:12px;font-size:clamp(16px,4vw,24px);">Key Map</h3>

        <select id="kmSelect" style="padding:8px;margin-bottom:16px;width:100%;max-width:300px;font-size:14px;">
          <option value="role">රාජකාරිය</option>
          <option value="place">ස්ථානය</option>
          <option value="holiday">නිවාඩු</option>
          <option value="fixedDates">නියත දිනයන්</option>
        </select>

        <div id="kmBody"></div>
      </div>
    `;

    $("kmSelect").addEventListener("change",()=>{activeEdit=null; renderSection();});
    renderSection();
  };

  function renderSection(){
    const v=$("kmSelect").value;
    if(v==="role") renderMainSub("role",ROLE_KEY,"ප්‍රධාන රාජකාරිය");
    if(v==="place") renderMainSub("place",PLACE_KEY,"ප්‍රධාන ස්ථානය");
    if(v==="holiday") renderHoliday();
    if(v==="fixedDates") renderFixedDates();
  }

  /* ================= ROLE / PLACE ================= */
  function renderMainSub(type,key,label){
    const data=load(key);

    $("kmBody").innerHTML = `
      <div style="margin-bottom:16px;display:flex;flex-wrap:wrap;gap:8px;">
        <input id="${type}MainInput" placeholder="${label}"
               style="padding:8px;flex:1;min-width:200px;font-size:14px;">
        <button onclick="addMain('${type}')"
                style="background:#28a745;color:#fff;border:none;padding:8px 14px;border-radius:6px;min-height:40px;white-space:nowrap;">
          Add
        </button>
      </div>

      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
      <table style="width:100%;background:#fff;border-collapse:collapse;min-width:600px;">
        <thead>
          <tr style="background:#0b5ea8;color:#fff">
            <th style="padding:10px;width:60px">No</th>
            <th style="padding:10px;width:25%">Main</th>
            <th style="padding:10px;width:30%">Sub Name</th>
            <th style="padding:10px;width:20%">Sub Code</th>
            <th style="padding:10px">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((r,i)=>`
            <tr style="border-bottom:1px solid #eee">
              <td style="padding:10px;vertical-align:top" rowspan="${Math.max(r.sub.length+1,2)}">${i+1}</td>

              <td style="padding:10px;vertical-align:top" rowspan="${Math.max(r.sub.length+1,2)}">
                ${renderMainCell(type,key,r)}
              </td>

              ${r.sub.length>0 ? `
                <td style="padding:10px">${renderSubName(type,r,0)}</td>
                <td style="padding:10px">${renderSubCode(type,r,0)}</td>
                <td style="padding:10px">${renderSubActions(type,r.id,0)}</td>
              </tr>
              ${r.sub.slice(1).map((s,si)=>`
                <tr style="border-bottom:1px solid #eee">
                  <td style="padding:10px">${renderSubName(type,r,si+1)}</td>
                  <td style="padding:10px">${renderSubCode(type,r,si+1)}</td>
                  <td style="padding:10px">${renderSubActions(type,r.id,si+1)}</td>
                </tr>
              `).join("")}
              ` : `
                <td colspan="3" style="padding:10px">
                  <div style="color:#999;font-style:italic">No sub items</div>
                </td>
              </tr>
              `}
              <tr style="border-bottom:1px solid #eee">
                <td colspan="2" style="padding:10px">
                  <input id="subName_${r.id}" placeholder="Sub name"
                         style="width:100%;padding:6px">
                </td>
                <td style="padding:10px">
                  <input id="subCode_${r.id}" placeholder="Code"
                         style="width:100%;padding:6px">
                </td>
                <td style="padding:10px">
                  <button onclick="addSub('${type}','${r.id}')"
                          style="background:#28a745;color:#fff;border:none;padding:6px 10px;border-radius:4px;width:100%">
                    Add
                  </button>
                </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      </div>
    `;
  }

  function renderMainCell(type,key,r){
    if(activeEdit && activeEdit.type===type && activeEdit.id===r.id && activeEdit.subIndex==null){
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

  function renderSubName(type,r,si){
    const s=r.sub[si];
    if(activeEdit && activeEdit.type===type && activeEdit.id===r.id && activeEdit.subIndex===si){
      return `<input id="editSubName_${r.id}_${si}" value="${esc(s.name||s)}"
                     style="width:100%;padding:5px">`;
    }
    return `<div ondblclick="editSubStart('${type}','${r.id}',${si})"
                 style="cursor:pointer;padding:4px;border-radius:4px"
                 onmouseover="this.style.background='#f8f9fa'"
                 onmouseout="this.style.background='transparent'">
              ${esc(typeof s==='object'?s.name:s)}
            </div>`;
  }

  function renderSubCode(type,r,si){
    const s=r.sub[si];
    if(activeEdit && activeEdit.type===type && activeEdit.id===r.id && activeEdit.subIndex===si){
      return `<input id="editSubCode_${r.id}_${si}" value="${esc(typeof s==='object'?s.code||'':'')}"
                     style="width:100%;padding:5px">`;
    }
    return `<div ondblclick="editSubStart('${type}','${r.id}',${si})"
                 style="cursor:pointer;padding:4px;border-radius:4px;color:#666;font-family:monospace"
                 onmouseover="this.style.background='#f8f9fa'"
                 onmouseout="this.style.background='transparent'">
              ${esc(typeof s==='object'?s.code||'':'')}
            </div>`;
  }

  function renderSubActions(type,id,si){
    if(activeEdit && activeEdit.type===type && activeEdit.id===id && activeEdit.subIndex===si){
      return `
        <div style="display:flex;gap:4px">
          <button onclick="saveSub('${type}','${id}',${si})"
                  style="background:#28a745;color:#fff;border:none;padding:4px 8px;border-radius:4px;flex:1">Save</button>
          <button onclick="cancelEdit()"
                  style="background:#6c757d;color:#fff;border:none;padding:4px 8px;border-radius:4px;flex:1">Cancel</button>
        </div>
      `;
    }
    return `
      <button onclick="deleteSub('${type}','${id}',${si})"
              style="background:#dc3545;color:#fff;border:none;padding:4px 8px;border-radius:4px;width:100%">
        Delete
      </button>
    `;
  }

  /* ================= HOLIDAY ================= */
  function renderHoliday(){
    const d=load(HOLIDAY_KEY);

    $("kmBody").innerHTML=`
      <div style="margin-bottom:16px;display:flex;flex-wrap:wrap;gap:8px;">
      <input id="holidayInput" placeholder="නිවාඩු නාමය"
             style="padding:8px;flex:1;min-width:200px;font-size:14px;">
      <button onclick="addHoliday()"
              style="background:#28a745;color:#fff;border:none;padding:8px 14px;border-radius:6px;min-height:40px;white-space:nowrap;">
        Add
      </button>
      </div>

      <div style="overflow-x:auto;-webkit-overflow-scrolling:touch;">
      <table style="width:100%;margin-top:16px;background:#fff;min-width:400px;">
        <tbody>
          ${d.map((h,i)=>`
            <tr>
              <td style="padding:10px;width:60px">${i+1}</td>
              <td style="padding:10px">
                ${activeEdit && activeEdit.id===h.id ? `
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
  window.editMainStart=(type,id)=>{activeEdit={type,id,subIndex:null}; renderSection();};
  window.editSubStart=(type,id,si)=>{activeEdit={type,id,subIndex:si}; renderSection();};
  window.editHolidayStart=id=>{activeEdit={type:"holiday",id}; renderSection();};
  window.cancelEdit=()=>{activeEdit=null; renderSection();};

  /* ================= CRUD ================= */
  window.addMain=type=>{
    const key=type==="role"?ROLE_KEY:PLACE_KEY;
    const i=$(type+"MainInput");
    if(!i.value.trim())return;
    const d=load(key);
    d.push({id:uid(),main:i.value.trim(),sub:[]});
    save(key,d); renderSection();
  };

  window.saveMain=(type,id)=>{
    const key=type==="role"?ROLE_KEY:PLACE_KEY;
    const d=load(key);
    d.find(x=>x.id===id).main=$(`editMain_${id}`).value.trim();
    save(key,d); activeEdit=null; renderSection();
  };

  window.deleteMain=(type,id)=>{
    if(confirm("Delete main?")){
      const key=type==="role"?ROLE_KEY:PLACE_KEY;
      save(key,load(key).filter(x=>x.id!==id));
      renderSection();
    }
  };

  window.addSub=(type,id)=>{
    const key=type==="role"?ROLE_KEY:PLACE_KEY;
    const iName=$(`subName_${id}`);
    const iCode=$(`subCode_${id}`);
    if(!iName.value.trim())return;
    const d=load(key);
    d.find(x=>x.id===id).sub.push({name:iName.value.trim(),code:iCode.value.trim()});
    save(key,d); renderSection();
  };

  window.saveSub=(type,id,si)=>{
    const key=type==="role"?ROLE_KEY:PLACE_KEY;
    const d=load(key);
    const entry=d.find(x=>x.id===id);
    const name=$(`editSubName_${id}_${si}`).value.trim();
    const code=$(`editSubCode_${id}_${si}`).value.trim();
    entry.sub[si]={name:name,code:code};
    save(key,d); activeEdit=null; renderSection();
  };

  window.deleteSub=(type,id,si)=>{
    const key=type==="role"?ROLE_KEY:PLACE_KEY;
    const d=load(key);
    d.find(x=>x.id===id).sub.splice(si,1);
    save(key,d); renderSection();
  };

  window.addHoliday=()=>{
    const i=$("holidayInput");
    if(!i.value.trim())return;
    const d=load(HOLIDAY_KEY);
    d.push({id:uid(),name:i.value.trim()});
    save(HOLIDAY_KEY,d); renderSection();
  };

  window.saveHoliday=id=>{
    const d=load(HOLIDAY_KEY);
    d.find(x=>x.id===id).name=$(`editHoliday_${id}`).value.trim();
    save(HOLIDAY_KEY,d); activeEdit=null; renderSection();
  };

  window.deleteHoliday=id=>{
    if(confirm("Delete holiday?")){
      save(HOLIDAY_KEY,load(HOLIDAY_KEY).filter(x=>x.id!==id));
      renderSection();
    }
  };

  /* ================= FIXED DATES ================= */
  function renderFixedDates() {
    const roles = load(ROLE_KEY);
    const places = load(PLACE_KEY);
    const fixedDates = load(FIXED_DATES_KEY);

    $("kmBody").innerHTML = `
      <h4 style="margin:0 0 12px 0; color: #0b5ea8;font-size:clamp(14px,3.5vw,18px);">රාජකාරි සදහා නියත දිනයන් ලබා දීම</h4>
      <div style="padding:clamp(8px,2vw,12px);border-radius:8px;overflow:visible;position:relative;">
        <div style="overflow-x:auto;overflow-y:visible;-webkit-overflow-scrolling:touch;">
          <table style="width:100%;border-collapse:collapse;font-size:clamp(11px,2.5vw,13px); text-align: left;overflow:visible;min-width:800px;background:#fff;">
            <thead style="overflow:visible;">
              <tr style="text-align:left; background: #f0f7ff;overflow:visible;">
                <th style="width:40px; padding:clamp(6px,1.5vw,8px);white-space:nowrap;">#</th>
                <th style="padding:clamp(6px,1.5vw,8px); min-width:200px;white-space:nowrap;">රාජකාරියේ නම</th>
                <th style="padding:clamp(6px,1.5vw,8px); min-width:200px;white-space:nowrap;">ස්ථානය</th>
                <th style="padding:clamp(6px,1.5vw,8px);white-space:nowrap;">දවස</th>
                <th style="padding:clamp(6px,1.5vw,8px);white-space:nowrap;">කී වෙනි දිනද ?</th>
                <th style="padding:clamp(6px,1.5vw,8px);white-space:nowrap;">වෙලාව</th>
                <th style="width:140px; padding:clamp(6px,1.5vw,8px);white-space:nowrap;">Actions</th>
              </tr>
            </thead>
            <tbody id="fdTableBody" style="overflow:visible;"></tbody>
          </table>
        </div>
      </div>
    `;

    renderFixedDatesRows();
    attachFixedDatesHandlers();
  }

  function renderFixedDatesRows() {
    const fixedDates = load(FIXED_DATES_KEY);
    const tbody = $("fdTableBody");
    if (!tbody) return;

    // Clear existing content
    tbody.innerHTML = "";

    // Render existing fixed dates
    fixedDates.forEach((fd, i) => {
      const tr = document.createElement("tr");
      tr.dataset.id = fd.id;
      tr.dataset.editMode = "false";
      tr.style.cssText = "position:relative;overflow:visible;";

      // Number column
      const tdNum = document.createElement("td");
      tdNum.style.cssText = "padding:8px";
      tdNum.textContent = i + 1;
      tr.appendChild(tdNum);

      // Role column with cascading menu
      const tdRole = document.createElement("td");
      tdRole.style.cssText = "padding:8px;position:relative;overflow:visible";
      tdRole.className = "fd-role-cell";
      const roleBtn = createCascadingMenuButton(`fd-${fd.id}`, 'role', fd.roleId, true);
      tdRole.appendChild(roleBtn);
      tr.appendChild(tdRole);

      // Place column with cascading menu
      const tdPlace = document.createElement("td");
      tdPlace.style.cssText = "padding:8px;position:relative;overflow:visible";
      tdPlace.className = "fd-place-cell";
      const placeBtn = createCascadingMenuButton(`fd-${fd.id}`, 'place', fd.placeId, true);
      tdPlace.appendChild(placeBtn);
      tr.appendChild(tdPlace);

      // Day column
      const tdDay = document.createElement("td");
      tdDay.style.cssText = "padding:8px";
      const daySelect = document.createElement("select");
      daySelect.className = "fd_day_select";
      daySelect.style.cssText = "width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;";
      daySelect.disabled = true;
      daySelect.innerHTML = `
        <option value="monday" ${fd.day === 'monday' ? 'selected' : ''}>සදුදා</option>
        <option value="tuesday" ${fd.day === 'tuesday' ? 'selected' : ''}>අඟහරුවාදා</option>
        <option value="wednesday" ${fd.day === 'wednesday' ? 'selected' : ''}>බදාදා</option>
        <option value="thursday" ${fd.day === 'thursday' ? 'selected' : ''}>බ්‍රහස්පතින්දා</option>
        <option value="friday" ${fd.day === 'friday' ? 'selected' : ''}>සිකුරාදා</option>
        <option value="saturday" ${fd.day === 'saturday' ? 'selected' : ''}>සෙනසුරාදා</option>
        <option value="sunday" ${fd.day === 'sunday' ? 'selected' : ''}>ඉරිදා</option>
      `;
      tdDay.appendChild(daySelect);
      tr.appendChild(tdDay);

      // Week column
      const tdWeek = document.createElement("td");
      tdWeek.style.cssText = "padding:8px";
      const weekSelect = document.createElement("select");
      weekSelect.className = "fd_week_select";
      weekSelect.style.cssText = "width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;";
      weekSelect.disabled = true;
      weekSelect.innerHTML = `
        <option value="1" ${fd.week === '1' ? 'selected' : ''}>1 වන</option>
        <option value="2" ${fd.week === '2' ? 'selected' : ''}>2 වන</option>
        <option value="3" ${fd.week === '3' ? 'selected' : ''}>3 වන</option>
        <option value="4" ${fd.week === '4' ? 'selected' : ''}>4 වන</option>
        <option value="5" ${fd.week === '5' ? 'selected' : ''}>5 වන</option>
      `;
      tdWeek.appendChild(weekSelect);
      tr.appendChild(tdWeek);

      // Time column
      const tdTime = document.createElement("td");
      tdTime.style.cssText = "padding:8px";
      const timeSelect = document.createElement("select");
      timeSelect.className = "fd_time_select";
      timeSelect.style.cssText = "width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;";
      timeSelect.disabled = true;
      timeSelect.innerHTML = `
        <option value="morning" ${fd.time === 'morning' ? 'selected' : ''}>පෙරවරු</option>
        <option value="afternoon" ${fd.time === 'afternoon' ? 'selected' : ''}>පස්වරු</option>
        <option value="full_day" ${fd.time === 'full_day' ? 'selected' : ''}>දවසම</option>
      `;
      tdTime.appendChild(timeSelect);
      tr.appendChild(tdTime);

      // Actions column
      const tdActions = document.createElement("td");
      tdActions.style.cssText = "padding:8px";
      const editBtn = document.createElement("button");
      editBtn.className = "fd_edit";
      editBtn.dataset.id = fd.id;
      editBtn.textContent = "Edit";
      editBtn.style.cssText = "margin-right:4px; padding:4px 8px; background:#1976d2; color:#fff; border:none; border-radius:4px; cursor:pointer;";
      
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "fd_delete";
      deleteBtn.dataset.id = fd.id;
      deleteBtn.textContent = "Delete";
      deleteBtn.style.cssText = "padding:4px 8px; background:#dc3545; color:#fff; border:none; border-radius:4px; cursor:pointer;";
      
      tdActions.appendChild(editBtn);
      tdActions.appendChild(deleteBtn);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });

    // Add new row
    const newTr = document.createElement("tr");
    newTr.id = "fd_new_row";
    newTr.style.cssText = "background:#f8f9fa;position:relative;overflow:visible;";

    // Number column
    const newTdNum = document.createElement("td");
    newTdNum.style.cssText = "padding:8px; color: #666;";
    newTdNum.textContent = "New";
    newTr.appendChild(newTdNum);

    // Role column with cascading menu
    const newTdRole = document.createElement("td");
    newTdRole.style.cssText = "padding:8px;position:relative;overflow:visible";
    newTdRole.id = "fd_new_role_cell";
    const newRoleBtn = createCascadingMenuButton('fd-new', 'role', '', false);
    newTdRole.appendChild(newRoleBtn);
    newTr.appendChild(newTdRole);

    // Place column with cascading menu
    const newTdPlace = document.createElement("td");
    newTdPlace.style.cssText = "padding:8px;position:relative;overflow:visible";
    newTdPlace.id = "fd_new_place_cell";
    const newPlaceBtn = createCascadingMenuButton('fd-new', 'place', '', false);
    newTdPlace.appendChild(newPlaceBtn);
    newTr.appendChild(newTdPlace);

    // Day column
    const newTdDay = document.createElement("td");
    newTdDay.style.cssText = "padding:8px";
    const newDaySelect = document.createElement("select");
    newDaySelect.id = "fd_new_day";
    newDaySelect.style.cssText = "width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;";
    newDaySelect.innerHTML = `
      <option value="monday">සදුදා</option>
      <option value="tuesday">අඟහරුවාදා</option>
      <option value="wednesday">බදාදා</option>
      <option value="thursday">බ්‍රහස්පතින්දා</option>
      <option value="friday">සිකුරාදා</option>
      <option value="saturday">සෙනසුරාදා</option>
      <option value="sunday">ඉරිදා</option>
    `;
    newTdDay.appendChild(newDaySelect);
    newTr.appendChild(newTdDay);

    // Week column
    const newTdWeek = document.createElement("td");
    newTdWeek.style.cssText = "padding:8px";
    const newWeekSelect = document.createElement("select");
    newWeekSelect.id = "fd_new_week";
    newWeekSelect.style.cssText = "width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;";
    newWeekSelect.innerHTML = `
      <option value="1">1 වන</option>
      <option value="2">2 වන</option>
      <option value="3">3 වන</option>
      <option value="4">4 වන</option>
      <option value="5">5 වන</option>
    `;
    newTdWeek.appendChild(newWeekSelect);
    newTr.appendChild(newTdWeek);

    // Time column
    const newTdTime = document.createElement("td");
    newTdTime.style.cssText = "padding:8px";
    const newTimeSelect = document.createElement("select");
    newTimeSelect.id = "fd_new_time";
    newTimeSelect.style.cssText = "width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;";
    newTimeSelect.innerHTML = `
      <option value="morning">පෙරවරු</option>
      <option value="afternoon">පස්වරු</option>
      <option value="full_day">දවසම</option>
    `;
    newTdTime.appendChild(newTimeSelect);
    newTr.appendChild(newTdTime);

    // Actions column
    const newTdActions = document.createElement("td");
    newTdActions.style.cssText = "padding:8px";
    const addBtn = document.createElement("button");
    addBtn.id = "fd_add";
    addBtn.textContent = "Add";
    addBtn.style.cssText = "padding:4px 12px; background: #28a745; color: white; border: none; border-radius: 4px; width:100%; cursor:pointer;";
    newTdActions.appendChild(addBtn);
    newTr.appendChild(newTdActions);

    tbody.appendChild(newTr);
    
    // Add 5 empty placeholder rows
    for (let i = 0; i < 5; i++) {
      const emptyTr = document.createElement("tr");
      emptyTr.style.cssText = "background:#fff;height:50px;";
      
      for (let j = 0; j < 7; j++) {
        const emptyTd = document.createElement("td");
        emptyTd.style.cssText = "padding:20px 8px;border-bottom:1px solid #eee;";
        emptyTd.innerHTML = "&nbsp;";
        emptyTr.appendChild(emptyTd);
      }
      
      tbody.appendChild(emptyTr);
    }
  }

  function attachFixedDatesHandlers() {
    const addBtn = $("fd_add");
    const editButtons = document.querySelectorAll(".fd_edit");
    const deleteButtons = document.querySelectorAll(".fd_delete");

    // Add new fixed date
    if (addBtn) {
      addBtn.addEventListener("click", function() {
        const roleCell = $("fd_new_role_cell");
        const placeCell = $("fd_new_place_cell");
        const roleBtn = roleCell ? roleCell.querySelector(".fd-new-role") : null;
        const placeBtn = placeCell ? placeCell.querySelector(".fd-new-place") : null;
        
        const roleId = roleBtn ? roleBtn.dataset.value : "";
        const placeId = placeBtn ? placeBtn.dataset.value : "";
        const day = $("fd_new_day").value;
        const week = $("fd_new_week").value;
        const time = $("fd_new_time").value;

        if (!roleId || !placeId || !day || !week || !time) {
          return window.showWarning ? showWarning("සියලු ක්ෂේත්‍ර පුරවන්න\nAll fields are required") : alert("All fields are required");
        }

        const arr = load(FIXED_DATES_KEY);
        arr.push({
          id: uid(),
          roleId: roleId,
          placeId: placeId,
          day: day,
          week: week,
          time: time
        });

        save(FIXED_DATES_KEY, arr);
        renderFixedDatesRows();
        attachFixedDatesHandlers();
        if (window.showSuccess) showSuccess("Fixed date added successfully!");
      });
    }

    // Edit fixed date
    editButtons.forEach(btn => {
      btn.addEventListener("click", function() {
        const id = this.dataset.id;
        const row = this.closest("tr");
        const isEditing = row.dataset.editMode === "true";
        
        if (isEditing) {
          // Save changes
          const roleCell = row.querySelector(".fd-role-cell");
          const placeCell = row.querySelector(".fd-place-cell");
          const roleBtn = roleCell ? roleCell.querySelector(`button.fd-${id}-role`) : null;
          const placeBtn = placeCell ? placeCell.querySelector(`button.fd-${id}-place`) : null;
          
          const roleId = roleBtn ? roleBtn.dataset.value : "";
          const placeId = placeBtn ? placeBtn.dataset.value : "";
          const daySelect = row.querySelector(".fd_day_select");
          const weekSelect = row.querySelector(".fd_week_select");
          const timeSelect = row.querySelector(".fd_time_select");
          
          const day = daySelect ? daySelect.value : "";
          const week = weekSelect ? weekSelect.value : "";
          const time = timeSelect ? timeSelect.value : "";

          if (!roleId || !placeId || !day || !week || !time) {
            return window.showWarning ? showWarning("සියලු ක්ෂේත්‍ර පුරවන්න\nAll fields are required") : alert("All fields are required");
          }

          const arr = load(FIXED_DATES_KEY);
          const idx = arr.findIndex(x => String(x.id) === String(id));
          if (idx >= 0) {
            arr[idx] = {
              id: id,
              roleId: roleId,
              placeId: placeId,
              day: day,
              week: week,
              time: time
            };
            save(FIXED_DATES_KEY, arr);
            renderFixedDatesRows();
            attachFixedDatesHandlers();
            if (window.showSuccess) showSuccess("Fixed date updated!");
          }
        } else {
          // Enable editing mode
          row.dataset.editMode = "true";
          
          // Enable cascading menu buttons
          const roleCell = row.querySelector(".fd-role-cell");
          const placeCell = row.querySelector(".fd-place-cell");
          if (roleCell) {
            const roleBtn = roleCell.querySelector("button");
            if (roleBtn) roleBtn.disabled = false;
          }
          if (placeCell) {
            const placeBtn = placeCell.querySelector("button");
            if (placeBtn) placeBtn.disabled = false;
          }
          
          // Enable other selects
          const daySelect = row.querySelector(".fd_day_select");
          const weekSelect = row.querySelector(".fd_week_select");
          const timeSelect = row.querySelector(".fd_time_select");
          if (daySelect) daySelect.disabled = false;
          if (weekSelect) weekSelect.disabled = false;
          if (timeSelect) timeSelect.disabled = false;
          
          this.textContent = "Save";
          this.style.background = "#28a745";
        }
      });
    });

    // Delete fixed date
    deleteButtons.forEach(btn => {
      btn.addEventListener("click", async function() {
        const id = this.dataset.id;
        const confirmDelete = window.showConfirm 
          ? await showConfirm("මෙම නියත දිනය මකා දමන්නද?\nDelete this fixed date?")
          : confirm("Delete this fixed date?");
          
        if (!confirmDelete) return;
        
        const arr = load(FIXED_DATES_KEY).filter(x => String(x.id) !== String(id));
        save(FIXED_DATES_KEY, arr);
        renderFixedDatesRows();
        attachFixedDatesHandlers();
        if (window.showSuccess) showSuccess("Fixed date deleted!");
      });
    });
  }

})();
