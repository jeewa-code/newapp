(function () {
  "use strict";

  /* ================= STORAGE ================= */
  const ROLE_KEY = "phi_roles_tree_final";
  const PLACE_KEY = "phi_places_tree_final";
  const HOLIDAY_KEY = "phi_holidays_final";

  let activeEdit = null; // {type,id,subIndex}

  /* ================= HELPERS ================= */
  const $ = id => document.getElementById(id);
  const uid = () => Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  const load = k => JSON.parse(localStorage.getItem(k)||"[]");
  const save = (k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const esc = t => {const d=document.createElement("div"); d.textContent=t; return d.innerHTML;};

  /* ================= MAIN RENDER ================= */
  window.renderPhiKeyMapTab = function(container){
    if(typeof container==="string") container=$(container);

    container.innerHTML = `
      <div class="glass" style="padding:20px">
        <h3 style="color:#0b5ea8;margin-bottom:12px">Key Map</h3>

        <select id="kmSelect" style="padding:8px;margin-bottom:16px">
          <option value="role">රාජකාරිය</option>
          <option value="place">ස්ථානය</option>
          <option value="holiday">නිවාඩු</option>
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
  }

  /* ================= ROLE / PLACE ================= */
  function renderMainSub(type,key,label){
    const data=load(key);

    $("kmBody").innerHTML = `
      <div style="margin-bottom:16px">
        <input id="${type}MainInput" placeholder="${label}"
               style="padding:8px;width:60%">
        <button onclick="addMain('${type}')"
                style="background:#28a745;color:#fff;border:none;padding:8px 14px;border-radius:6px">
          Add
        </button>
      </div>

      <table style="width:100%;background:#fff;border-collapse:collapse">
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
      <input id="holidayInput" placeholder="නිවාඩු නාමය"
             style="padding:8px;width:60%">
      <button onclick="addHoliday()"
              style="background:#28a745;color:#fff;border:none;padding:8px 14px;border-radius:6px">
        Add
      </button>

      <table style="width:100%;margin-top:16px;background:#fff">
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

})();
