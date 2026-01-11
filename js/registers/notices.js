/* =========================================================================
   notices.js (Updated)
   Notices & Prosecutions Register
   - Highlight selected tab
   - Show “–” in empty record columns
   ========================================================================= */

(function(){
  "use strict";
  const STORAGE_KEY = "notices_prosecutions_v1";

  const load = ()=> { try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}catch(e){return[];}};
  const save = arr=>{ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); };
  const uid = ()=> Date.now().toString(36)+Math.random().toString(36).substring(2,8);
  const esc = s=> s ? String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])) : "–";
  let _editingId = "";

  window.openNoticesRegister = function(title="Notices and Prosecutions Register"){
    const content=document.getElementById("contentArea");
    if(!content)return;
    content.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2>${esc(title)}</h2>
        <button id="notices_back" style="background:#0b74d1;color:#fff;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Back</button>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <button id="notices_tab_entry" class="tab-btn">Entry Form</button>
        <button id="notices_tab_records" class="tab-btn">Records</button>
      </div>
      <div id="notices_tabContent"></div>
    `;
    styleTabs();
    document.getElementById("notices_back").onclick=()=>{ if(typeof showContent==="function") showContent("Registers",null); };
    document.getElementById("notices_tab_entry").onclick=()=>{setActive("entry");renderEntry();};
    document.getElementById("notices_tab_records").onclick=()=>{setActive("records");renderRecords();};
    setActive("entry");renderEntry();
  };

  function styleTabs(){
    const css=document.createElement("style");
    css.textContent=`
      .tab-btn{padding:8px 12px;border-radius:8px;border:1px solid #ccc;background:#fff;color:#000;cursor:pointer;transition:0.2s;}
      .tab-btn.active{background:#0b74d1;color:#fff;border-color:#0b74d1;}
    `;
    document.head.appendChild(css);
  }
  function setActive(tab){
    const e=document.getElementById("notices_tab_entry"),r=document.getElementById("notices_tab_records");
    e.classList.remove("active");r.classList.remove("active");
    if(tab==="entry")e.classList.add("active");else r.classList.add("active");
  }

  function lbl(t){return `<label style="color:black;font-weight:700;margin-bottom:6px;display:block;">${t}</label>`;}

  function renderEntry(){
    const c=document.getElementById("notices_tabContent");
    c.innerHTML=`
      <div style="background:#fff;padding:16px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <h3 style="margin:0 0 12px;color:#073b6a;">Entry Form</h3>
        <div style="display:grid;grid-template-columns:300px 1fr;gap:10px 16px;">
          ${lbl("වරද කළ ස්ථානය")}<input id="n_place">
          ${lbl("ස්ථානය අයිතිකරුගේ නම")}<input id="n_place_owner">
          ${lbl("ලිපිනය")}<input id="n_place_addr">
          ${lbl("වරදකරුගේ නම")}<input id="n_offender">
          ${lbl("වරදකරු ලිපිනය")}<input id="n_offender_addr">
          ${lbl("වරදෙහි ස්වභාවය")}<input id="n_nature">
          ${lbl("වරද කල දිනය")}<input id="n_offence_date" type="date">
          ${lbl("නිවේදනය නිකුත් කල දිනය")}<input id="n_notice_date" type="date">
          ${lbl("ලබා දුන් කාලය")}<input id="n_time_given">
          ${lbl("නිවැරදි කල දිනය")}<input id="n_rectified_date" type="date">
          ${lbl("නඩු පැවරු දිනය")}<input id="n_court_date" type="date">
          ${lbl("නඩු අංකය")}<input id="n_case_no">
          ${lbl("නඩුව කඳවු දිනය")}<input id="n_filed_date" type="date">
          ${lbl("ප්‍රතිඵලය")}<input id="n_result">
          ${lbl("නැවත කැඳවන දිනය")}<input id="n_resummon_date" type="date">
          ${lbl("ප්‍රතිඵලය (Follow-up)")}<input id="n_followup_result">
          ${lbl("වෙනත් කරුණු")}<textarea id="n_remarks" style="min-height:70px"></textarea>
        </div>
        <div style="margin-top:14px;display:flex;gap:8px;">
          <button id="n_save" style="background:#0b74d1;color:#fff;border:none;border-radius:6px;padding:8px 14px;">Save</button>
          <button id="n_update" style="background:#1976d2;color:#fff;border:none;border-radius:6px;padding:8px 14px;display:none;">Update</button>
          <button id="n_clear" style="background:#e2e8f0;border:none;border-radius:6px;padding:8px 14px;">Clear</button>
        </div>
      </div>
    `;
    c.querySelectorAll("input,textarea").forEach(i=>i.style.cssText="width:100%;padding:6px;border:1px solid #ccc;border-radius:6px;");
    document.getElementById("n_save").onclick=saveRecord;
    document.getElementById("n_update").onclick=updateRecord;
    document.getElementById("n_clear").onclick=clearForm;
  }

  function getForm(){
    const g=id=>document.getElementById(id)?.value.trim()||"";
    return {
      place:g("n_place"),placeOwner:g("n_place_owner"),placeAddr:g("n_place_addr"),
      offender:g("n_offender"),offenderAddr:g("n_offender_addr"),nature:g("n_nature"),
      offenceDate:g("n_offence_date"),noticeDate:g("n_notice_date"),timeGiven:g("n_time_given"),
      rectifiedDate:g("n_rectified_date"),courtDate:g("n_court_date"),caseNo:g("n_case_no"),
      filedDate:g("n_filed_date"),result:g("n_result"),resummonDate:g("n_resummon_date"),
      followupResult:g("n_followup_result"),remarks:g("n_remarks")
    };
  }
  function validate(o){ if(!o.place){alert("වරද කළ ස්ථානය අවශ්‍යයි");return false;} if(!o.nature){alert("වරදේ ස්වභාවය අවශ්‍යයි");return false;} return true;}
  function saveRecord(){
    const o=getForm(); if(!validate(o))return;
    const arr=load(); o.id=uid(); o.createdAt=new Date().toISOString(); arr.push(o); save(arr);
    alert("Record saved."); clearForm(); setActive("records"); renderRecords();
  }
  function updateRecord(){
    if(!_editingId)return;
    const o=getForm(); if(!validate(o))return;
    const arr=load(); const idx=arr.findIndex(r=>r.id===_editingId);
    if(idx<0)return; o.id=_editingId; o.createdAt=arr[idx].createdAt; arr[idx]=o; save(arr);
    alert("Record updated."); _editingId=""; document.getElementById("n_update").style.display="none"; document.getElementById("n_save").style.display="inline-block";
    setActive("records"); renderRecords();
  }
  function clearForm(){document.querySelectorAll("#notices_tabContent input,textarea").forEach(el=>el.value="");_editingId="";document.getElementById("n_update").style.display="none";document.getElementById("n_save").style.display="inline-block";}

  function renderRecords(){
    const c=document.getElementById("notices_tabContent");
    const arr=load();
    c.innerHTML=`
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <h3 style="margin:0 0 10px;color:#073b6a;">Records</h3>
        <div style="overflow:auto;">
          <table style="border-collapse:collapse;width:100%;min-width:1200px;font-size:13px;">
            <thead style="background:#f7fafc;">
              <tr>
                <th style="padding:6px;">S/N</th><th style="padding:6px;">Place</th><th style="padding:6px;">Place Owner</th>
                <th style="padding:6px;">Offender</th><th style="padding:6px;">Nature</th>
                <th style="padding:6px;">Offence Date</th><th style="padding:6px;">Notice Date</th>
                <th style="padding:6px;">Case No</th><th style="padding:6px;">Result</th>
                <th style="padding:6px;">Remarks</th><th style="padding:6px;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${arr.length?arr.map((r,i)=>`
                <tr>
                  <td style="padding:6px;">${i+1}</td>
                  <td style="padding:6px;">${esc(r.place)}</td>
                  <td style="padding:6px;">${esc(r.placeOwner)}</td>
                  <td style="padding:6px;">${esc(r.offender)}</td>
                  <td style="padding:6px;">${esc(r.nature)}</td>
                  <td style="padding:6px;">${esc(r.offenceDate)}</td>
                  <td style="padding:6px;">${esc(r.noticeDate)}</td>
                  <td style="padding:6px;">${esc(r.caseNo)}</td>
                  <td style="padding:6px;">${esc(r.result)}</td>
                  <td style="padding:6px;">${esc(r.remarks)}</td>
                  <td style="padding:6px;">
                    <button class="view" data-id="${r.id}" style="background:#90caf9;border:none;border-radius:6px;padding:4px 8px;margin-right:4px;">View</button>
                    <button class="edit" data-id="${r.id}" style="background:#ffd54f;border:none;border-radius:6px;padding:4px 8px;margin-right:4px;">Edit</button>
                    <button class="del" data-id="${r.id}" style="background:#ef9a9a;border:none;border-radius:6px;padding:4px 8px;">Del</button>
                  </td>
                </tr>`).join(""):`<tr><td colspan="11" style="padding:8px;text-align:center;color:#666;">No records</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
    c.querySelectorAll(".view").forEach(b=>b.onclick=viewRecord);
    c.querySelectorAll(".edit").forEach(b=>b.onclick=editRecord);
    c.querySelectorAll(".del").forEach(b=>b.onclick=delRecord);
  }

  function viewRecord(e){
    const id=e.target.dataset.id, rec=(load()||[]).find(x=>x.id===id); if(!rec)return;
    const m=document.createElement("div");
    m.style="position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:9999;";
    m.innerHTML=`<div style="background:#fff;padding:16px;border-radius:8px;max-width:700px;width:100%;max-height:90vh;overflow:auto;">
      <h3>Record Details</h3>
      ${Object.entries(rec).filter(([k])=>k!=='id'&&k!=='createdAt').map(([k,v])=>`<p><b>${k}</b>: ${esc(v)}</p>`).join("")}
      <button id="closeM" style="background:#0b74d1;color:#fff;border:none;border-radius:6px;padding:6px 10px;">Close</button>
    </div>`;
    document.body.appendChild(m);
    m.querySelector("#closeM").onclick=()=>m.remove();
  }

  function editRecord(e){
    const id=e.target.dataset.id, rec=(load()||[]).find(x=>x.id===id); if(!rec)return;
    document.getElementById("notices_tab_entry").click();
    setTimeout(()=>{
      for(const [k,v] of Object.entries(rec)){
        const el=document.getElementById("n_"+k); if(el)el.value=v||"";
      }
      _editingId=id;
      document.getElementById("n_save").style.display="none";
      document.getElementById("n_update").style.display="inline-block";
    },50);
  }

  function delRecord(e){
    const id=e.target.dataset.id; if(!confirm("Delete record?"))return;
    const arr=load().filter(x=>x.id!==id); save(arr); renderRecords();
  }

})();
