// js/reports/monthlyScheduleList.js
// Renders a year selector and 12 month-cards showing saved status.
// Exposes openMonthlyScheduleList(containerElementOrNull)
// Clicking a month-card opens the editor for that month (via monthlySchedule.openWithMonth)

(function(){
  "use strict";

  const MONTH_NAMES_SIN = ["ජනවාරි","පෙබරවාරි","මාර්තු","අප්‍රේල්","මැයි","ජූනි","ජූලි","අගෝස්තු","සැප්තැම්බර්","ඔක්තෝබර්","නොවැම්බර්","දෙසැම්බර්"];
  const PRIMARY = "#1b5e20";
  const MISSING = "#d32f2f";

  function el(tag, attrs={}, children=[]){
    const e = document.createElement(tag);
    for(const k in attrs){
      if(k === "html") e.innerHTML = attrs[k];
      else if(k === "text") e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    (children||[]).forEach(c => e.appendChild(c));
    return e;
  }

  function getSavedMonthsMap(){
    // use API from monthlySchedule.js if available
    const out = {};
    try{
      if(window.monthlySchedule && typeof window.monthlySchedule.getSavedMonths === "function"){
        const list = window.monthlySchedule.getSavedMonths();
        list.forEach(it => {
          // it.month expected like "2023-05"
          if(it && it.month){
            out[it.month] = true;
          }
        });
      } else {
        // fallback: scan localStorage keys
        for(let i=0;i<localStorage.length;i++){
          const k = localStorage.key(i);
          if(k && k.indexOf("monthlySchedule_exact_template_")===0){
            const m = k.replace("monthlySchedule_exact_template_","");
            out[m] = true;
          }
        }
      }
    }catch(e){ console.error(e); }
    return out;
  }

  function buildCard(monthIndex, year, savedMap){
    const monthNum = String(monthIndex+1).padStart(2,"0");
    const monthKey = `${year}-${monthNum}`;
    const has = !!savedMap[monthKey];
    const card = el("div", { class:"ms-month-card", style:`width:150px;padding:12px;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,0.06);cursor:pointer;border:2px solid ${has?PRIMARY:MISSING};display:flex;flex-direction:column;gap:8px;align-items:center;justify-content:center;background:#fff;`});
    const title = el("div",{ style:"font-weight:700;font-size:14px;text-align:center;white-space:nowrap;", text: MONTH_NAMES_SIN[monthIndex] });
    const badge = el("div", { style:`padding:6px 10px;border-radius:20px;color:#fff;font-weight:700;font-size:12px;background:${has?PRIMARY:MISSING};` , text: has ? "Saved" : "No data" });
    const sub = el("div",{ style:"font-size:12px;color:#444", text: monthKey });
    card.appendChild(title);
    card.appendChild(badge);
    card.appendChild(sub);

        // --- add small remove button (delete card) ---
    const removeBtn = el("button", {
      style: "margin-top:6px;padding:6px 8px;border-radius:6px;border:1px solid #d32f2f;background:#fff;color:#d32f2f;cursor:pointer;font-size:12px",
      text: "Remove"
    });

    removeBtn.addEventListener("click", async function(ev){
      ev.stopPropagation();
      if(!await showConfirm(`Remove saved schedule ${monthKey}? This will also close any open editor for this month.`)) return;
      try {
        // remove from localStorage if present
        const key = `monthlySchedule_exact_template_${monthKey}`;
        if(localStorage.getItem(key)){
          localStorage.removeItem(key);
        }
        // remove card from DOM
        if(card && card.parentNode) card.parentNode.removeChild(card);

        // dispatch removal event so other modules (editor) can close tabs
        window.dispatchEvent(new CustomEvent("monthlyScheduleRemoved", { detail: { month: monthKey } }));

        // also dispatch saved-list refresh event so UI updates
        window.dispatchEvent(new CustomEvent("monthlyScheduleSaved", { detail: { month: null } }));

      } catch(e){
        console.error("Failed to remove month", e);
      }
    });

    card.appendChild(removeBtn);


    card.addEventListener("click", async ()=>{
      // Open editor for this month with saved data
      // Use the module's editor loader and then populate with saved data
      if(window.openMonthlyScheduleEditor && typeof window.openMonthlyScheduleEditor === "function"){
        // Call the module's editor loader
        await window.openMonthlyScheduleEditor();
        
        // Wait a bit for editor to render, then load the saved data
        setTimeout(() => {
          if(window.monthlySchedule && typeof window.monthlySchedule.loadPayloadForMonth === "function"){
            const payload = window.monthlySchedule.loadPayloadForMonth(monthKey);
            if(payload && window.monthlySchedule.populateEditor){
              window.monthlySchedule.populateEditor(payload);
              
              // Also set the month input to this month
              const monthInput = document.querySelector('input[type="month"]');
              if(monthInput) {
                monthInput.value = monthKey;
                // Trigger change event to update the editor
                monthInput.dispatchEvent(new Event('input', { bubbles: true }));
                monthInput.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          }
        }, 300);
      } else {
        showError("Editor not available. Please go back and click the Editor card first.");
      }
    });

    return card;
  }

  function renderInto(container){
    container = container || document.getElementById("contentArea");
    if(!container) return;

    container.innerHTML = "";

    const header = el("div",{ style:"display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;"});
    header.appendChild(el("h3",{ text:"Saved Monthly Schedules" }));
    const controls = el("div",{ style:"display:flex;gap:8px;align-items:center;"});
    const yearInput = el("input",{ type:"number", min:"2000", max:"2099", value: new Date().getFullYear(), style:"padding:8px;border:1px solid #ddd;border-radius:6px;width:110px;" });
    const refreshBtn = el("button",{ style:"padding:8px 10px;border-radius:8px;border:1px solid #e0e0e0;cursor:pointer;background:#fff;", text:"Refresh" });
    controls.appendChild(yearInput);
    controls.appendChild(refreshBtn);
    header.appendChild(controls);
    container.appendChild(header);

    const gridWrap = el("div",{ style:"display:flex;flex-wrap:wrap;gap:12px;"});
    container.appendChild(gridWrap);

    function draw(){
      const year = String(yearInput.value||new Date().getFullYear());
      const savedMap = getSavedMonthsMap();
      gridWrap.innerHTML = "";
      for(let m=0;m<12;m++){
        const c = buildCard(m, year, savedMap);
        gridWrap.appendChild(c);
      }
    }

    refreshBtn.addEventListener("click", draw);
    yearInput.addEventListener("change", draw);

    // listen for monthlyScheduleSaved and refresh automatically
    function onSaved(e){
      draw();
    }
    window.addEventListener("monthlyScheduleSaved", onSaved);

    // initial draw
    draw();
  }

  // expose function used by monthlyScheduleModule
  window.openMonthlyScheduleList = function(containerOrElement){
    // if containerOrElement is an Element, render into it; else render into contentArea
    if(containerOrElement && (containerOrElement.nodeType === 1)){
      renderInto(containerOrElement);
    } else {
      renderInto(document.getElementById("contentArea"));
    }
  };

})();
