/* =========================================================
   environmentalPollution.js
   Environmental Pollution & Public Complaints Register
   - Firebase Realtime Sync
   - Updated Fields & Logic
   ========================================================= */

(function () {
  const COLLECTION_NAME = "envPollutionRegister";

  // Use dataService for Firebase operations
  async function loadData() {
    try {
      if (window.dataService && window.dataService.getCollection) {
        return await window.dataService.getCollection(COLLECTION_NAME);
      } else {
        console.error("dataService not found");
        return [];
      }
    } catch (e) { console.error(e); return []; }
  }

  async function saveData(data) {
    if (window.dataService && window.dataService.addToCollection) {
      return await window.dataService.addToCollection(COLLECTION_NAME, data);
    }
  }

  async function updateData(id, data) {
    if (window.dataService && window.dataService.updateInCollection) {
      return await window.dataService.updateInCollection(COLLECTION_NAME, id, data);
    }
  }

  async function deleteData(id) {
    if (window.dataService && window.dataService.deleteFromCollection) {
      return await window.dataService.deleteFromCollection(COLLECTION_NAME, id);
    }
  }

  function esc(s) { if (s === null || s === undefined) return ""; return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

  const inputStyle = "width:100%;padding:9px 10px;border:1px solid #d6dde3;border-radius:8px;box-sizing:border-box;font-size:14px;";
  const labelStyle = "font-weight:600;color:#183046;";

  // Nature Options (from Monthly Report)
  const natureOptions = [
    "Pig farms - ඌරු ගොවිපලවල්",
    "Poultry farms - කුකුළු ගොවිපලවල්",
    "Cattle farms - ගව ගොවිපලවල්",
    "Goat farms - එළු ගොවිපලවල්",
    "Other animal farms - වෙනත් සත්ව ගොවිපලවල්",
    "Prawn farms - ඉස්සන් ගොවිපලවල්",
    "Toilets - වැසිකිළි",
    "Wells - ළිං",
    "Waste water - අප ජලය",
    "Vector breeding sites - රෝග වාහකයන් බෝවන ස්ථාන",
    "Health Institutions - සෞඛ්‍ය ආයතන",
    "Veterinary institutions - පශු වෛද්‍ය ආයතන",
    "Air pollution - වායු දූෂණය",
    "Other complains on public nuisance - මහජන කරදර පිළිබඳ වෙනත් පැමිණිලි"
  ];

  window.openEnvironmentalPollutionRegister = function (title = "Environmental Pollution and Public Complaints Register") {
    const content = document.getElementById("contentArea");
    if (!content) return console.warn("contentArea not found");
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

    document.getElementById("ep_tab_entry").addEventListener("click", () => { setActive('entry'); renderEntry(); });
    document.getElementById("ep_tab_records").addEventListener("click", () => { setActive('records'); renderRecords(); });

    renderEntry();
  };

  function setActive(which) {
    const e = document.getElementById("ep_tab_entry");
    const r = document.getElementById("ep_tab_records");
    if (!e || !r) return;
    e.classList.remove('active'); r.classList.remove('active');
    e.style.background = '#fff'; r.style.background = '#fff';
    if (which === 'entry') { e.classList.add('active'); e.style.background = '#f8fbff'; }
    else { r.classList.add('active'); r.style.background = '#f8fbff'; }
  }

  // ---------- Entry UI ----------
  function renderEntry() {
    const cont = document.getElementById("ep_tabContent");
    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 12px 0;color:#073b6a;">පැමිණිල්ල / දත්ත ඇතුල් කිරීම</h4>
        <div style="display:grid;grid-template-columns:260px 1fr;gap:12px 18px;align-items:start;">
          
          <label style="${labelStyle};text-align:right;padding-right:8px;">පැමිණිල්ල ලැබුණු දිනය</label>
          <input id="ep_date" type="date" style="${inputStyle}" />

          <!-- Detected by PHI Checkbox -->
          <div style="text-align:right;padding-right:8px;"></div>
          <div style="display:flex;align-items:center;gap:8px;">
              <input type="checkbox" id="ep_detectedByPhi" style="width:16px;height:16px;">
              <label for="ep_detectedByPhi" style="font-weight:600;color:#d32f2f;">මහජන සෞඛ්‍ය පරීක්ෂක විසින් අනාවරණය කරගත් ගැටළු</label>
          </div>

          <label class="ep-complainant-field" style="${labelStyle};text-align:right;padding-right:8px;">පැමිණිලිකරුගේ නම</label>
          <input class="ep-complainant-field" id="ep_complainantName" style="${inputStyle}" />

          <label class="ep-complainant-field" style="${labelStyle};text-align:right;padding-right:8px;">පැමිණිලිකරුගේ ලිපිනය</label>
          <input class="ep-complainant-field" id="ep_complainantAddress" style="${inputStyle}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">පැමිණිල්ලේ / දූෂණයේ ස්වභාවය</label>
          <select id="ep_nature" style="${inputStyle}">
            <option value="">-- තෝරන්න --</option>
            ${natureOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
          </select>

          <label style="${labelStyle};text-align:right;padding-right:8px;">පැමිණිල්ල ලැබුණු ආකාරය</label>
          <select id="ep_receivedBy" style="${inputStyle}">
            <option value="">-- තෝරන්න --</option>
            <option value="ලිඛිතව">ලිඛිතව</option>
            <option value="වාචිකව">වාචිකව</option>
            <option value="දුරකථන මාර්ගයෙන්">දුරකථන මාර්ගයෙන්</option>
            <option value="වෙනත්">වෙනත්</option>
          </select>

          <label style="${labelStyle};text-align:right;padding-right:8px;">විමර්ශනය කළ දිනය</label>
          <input id="ep_inspectionDate" type="date" style="${inputStyle}" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">ගත් ක්‍රියාමාර්ගය</label>
          <select id="ep_actionsTaken" style="${inputStyle}">
             <option value="">-- තෝරන්න --</option>
             <option value="Settled">Settled - විසඳන ලදී</option>
             <option value="Referred">Referred - යොමුකරන ලදී</option>
             <option value="Notice Issued">Notice Issued - නිවේදන නිකුත් කරන ලදී</option>
             <option value="Prosecuted">Prosecuted - නඩු පවරන ලදී</option>
          </select>

          <label style="${labelStyle};text-align:right;padding-right:8px;">ප්‍රතිඵලය</label>
          <div id="ep_result_container" style="width:100%;">
             <!-- Dynamic Content -->
             <select id="ep_result" style="${inputStyle}" disabled>
                <option value="">-- පළමුව ක්‍රියාමාර්ගය තෝරන්න --</option>
             </select>
          </div>

          <!-- Referral Detail (Hidden by default) -->
          <label id="ep_referral_label" style="${labelStyle};text-align:right;padding-right:8px;display:none;">යොමුකරන ලද ආයතනය</label>
          <div id="ep_referral_container" style="display:none;">
            <select id="ep_referral_select" style="${inputStyle};margin-bottom:5px;">
                <option value="">-- ආයතනය තෝරන්න --</option>
                <option value="Pradeshiya Sabha">ප්‍රාදේශීය සභාව</option>
                <option value="Police">පොලිසිය</option>
                <option value="CEA">මධ්‍යම පරිසර අධිකාරිය (CEA)</option>
                <option value="Other">වෙනත්</option>
            </select>
            <input id="ep_referral_other" placeholder="වෙනත් ආයතනයක් නම් මෙහි සටහන් කරන්න" style="${inputStyle};display:none;" />
          </div>

          <!-- Fine Amount (Hidden by default) -->
          <label id="ep_fine_label" style="${labelStyle};text-align:right;padding-right:8px;display:none;">දඩ මුදල (රු.)</label>
          <input id="ep_fineAmount" type="number" style="${inputStyle};display:none;" placeholder="0.00" />

          <label style="${labelStyle};text-align:right;padding-right:8px;">වෙනත් කරුණු</label>
          <textarea id="ep_other" rows="3" style="${inputStyle}"></textarea>

          <div></div>
          <div style="display:flex;gap:8px;margin-top:6px;">
            <button id="ep_save" style="background:#0b74d1;color:#fff;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">සුරකින්න / Save</button>
            <button id="ep_update" style="background:#1976d2;color:#fff;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;display:none;">Update</button>
            <button id="ep_clear" style="background:#e2e8f0;color:#111;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">Clear</button>
            <button id="ep_goto_records" style="margin-left:auto;background:#06ad7d;color:#fff;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;">View Records</button>
          </div>
        </div>
      </div>
    `;

    // Logic Hookups
    setupLogic();

    document.getElementById("ep_save").addEventListener("click", onSave);
    document.getElementById("ep_update").addEventListener("click", onUpdate);
    document.getElementById("ep_clear").addEventListener("click", clearForm);
    document.getElementById("ep_goto_records").addEventListener("click", () => document.getElementById("ep_tab_records").click());
  }

  function setupLogic() {
    // 1. Detected By PHI Checkbox
    const chk = document.getElementById("ep_detectedByPhi");
    const compFields = document.querySelectorAll(".ep-complainant-field");

    chk.addEventListener("change", () => {
      if (chk.checked) {
        compFields.forEach(el => el.style.visibility = "hidden");
        document.getElementById("ep_complainantName").value = "";
        document.getElementById("ep_complainantAddress").value = "";
      } else {
        compFields.forEach(el => el.style.visibility = "visible");
      }
    });

    // 2. Action Taken -> Result Logic
    const actionSel = document.getElementById("ep_actionsTaken");
    const resultSel = document.getElementById("ep_result");
    const refLabel = document.getElementById("ep_referral_label");
    const refContainer = document.getElementById("ep_referral_container");
    const fineLabel = document.getElementById("ep_fine_label");
    const fineInp = document.getElementById("ep_fineAmount");

    // Helper to reset dynamic fields
    const resetDynamic = () => {
      refLabel.style.display = "none";
      refContainer.style.display = "none";
      fineLabel.style.display = "none";
      fineInp.style.display = "none";
      resultSel.disabled = false;
      resultSel.style.display = "block";
      resultSel.innerHTML = "";
    };

    actionSel.addEventListener("change", () => {
      const val = actionSel.value;
      resetDynamic();

      if (val === "Settled") {
        // Auto-select Settled
        resultSel.innerHTML = `<option value="Settled">Settled - විසඳන ලදී</option>`;
        resultSel.value = "Settled";
      } else if (val === "Referred") {
        // Hide Result, Show Referral input
        resultSel.style.display = "none";
        // But we might want to store the referral destination as the "Result"
        refLabel.style.display = "block";
        refContainer.style.display = "block";
      } else if (val === "Notice Issued") {
        // Allow Prosecuted or Settled
        resultSel.innerHTML = `
                  <option value="">-- Select next step --</option>
                  <option value="Prosecuted">Prosecuted - නඩු පවරන ලදී</option>
                  <option value="Settled">Settled after notice - නිවේදනයෙන් පසු විසඳන ලදී</option>
              `;
      } else if (val === "Prosecuted") {
        // Allow Convicted / Acquitted
        setupProsecutedResult();
      } else {
        resultSel.innerHTML = `<option value="">-- Select Action First --</option>`;
        resultSel.disabled = true;
      }
    });

    // Referral Other logic
    const refSel = document.getElementById("ep_referral_select");
    const refOther = document.getElementById("ep_referral_other");
    refSel.addEventListener("change", () => {
      if (refSel.value === "Other") {
        refOther.style.display = "block";
      } else {
        refOther.style.display = "none";
      }
    });

    // Result Change Logic (specifically for Notice Issued -> Prosecuted transition or direct Prosecuted)
    resultSel.addEventListener("change", () => {
      if (resultSel.value === "Prosecuted") {
        // If they chose "Prosecuted" under Notice Issued, now we need to show Convicted/Acquitted?
        // The request says: "If Notice Issued -> Select Prosecuted / Settled".
        // "If Prosecuted -> Convicted / Acquitted".
        // So if they change Result to "Prosecuted", we should probably change the UI to reflect valid prosecuted outcomes.
        // Or maybe just skip straight to Convicted/Acquitted?
        // Let's assume layout implies nested choice.
        // Simpler: If they select "Prosecuted" from the Result dropdown (in Notice Issued context), 
        // we can swap the options to Convicted/Acquitted?
        // Or better: Just switch the Action Taken dropdown to "Prosecuted" automatically?
        // Let's keep it simple. If "Prosecuted" is detected in Result, show Fine? No, need Conviction first.

        // Let's re-render options if they pick Prosecuted logic.
        setupProsecutedResult();
      } else if (resultSel.value === "Convicted") {
        fineLabel.style.display = "block";
        fineInp.style.display = "block";
      } else {
        fineLabel.style.display = "none";
        fineInp.style.display = "none";
      }
    });

    function setupProsecutedResult() {
      resultSel.innerHTML = `
                  <option value="">-- Select Verdict --</option>
                  <option value="Convicted">Convicted - වරදකරු</option>
                  <option value="Acquitted">Acquitted - නිවැරදිකරු / නිදහස්</option>
              `;
      // If it was Notice Issued -> Prosecuted, we effectively moved states.
    }
  }

  function clearForm() {
    document.querySelectorAll("#ep_tabContent input, #ep_tabContent select, #ep_tabContent textarea").forEach(i => i.value = "");
    document.getElementById("ep_detectedByPhi").checked = false;
    document.querySelectorAll(".ep-complainant-field").forEach(el => el.style.visibility = "visible");

    // Reset dynamic logic
    const actionSel = document.getElementById("ep_actionsTaken");
    if (actionSel) {
      actionSel.value = "";
      actionSel.dispatchEvent(new Event('change'));
    }

    document.getElementById("ep_save").style.display = 'inline-block';
    document.getElementById("ep_update").style.display = 'none';
    document.getElementById("ep_update").dataset.editId = "";
  }

  // ---------- Records UI ----------
  async function renderRecords() {
    const cont = document.getElementById("ep_tabContent");
    cont.innerHTML = `<div style="padding:20px;text-align:center;">Loading...</div>`;

    const arr = await loadData();

    // Check if user switched tabs while loading
    if (!document.getElementById("ep_tab_records").classList.contains('active')) return;

    cont.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;box-shadow:0 6px 18px rgba(12,40,60,0.06);">
        <h4 style="margin:0 0 12px 0;color:#073b6a;">ලේඛණය (Total: <span id="ep_total">${arr.length}</span>)</h4>

        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;">
          <input id="ep_filter_name" placeholder="Search..." style="${inputStyle};width:auto;min-width:200px;" />
          <select id="ep_filter_nature" style="${inputStyle};width:auto;">
             <option value="">All Natures</option>
             ${natureOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
          </select>
          <button id="ep_apply_filter" style="background:#0b74d1;color:#fff;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Filter</button>
          <button id="ep_clear_filter" style="background:#e2e8f0;color:#111;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">Clear</button>
        </div>

        <div style="overflow:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;min-width:1200px;">
            <thead>
              <tr style="text-align:left;color:#2b3b4a;background:#f4f6f8;border-bottom:2px solid #ddd;">
                <th style="padding:10px;">S/N</th>
                <th style="padding:10px;">දිනය</th>
                <th style="padding:10px;">පැමිණිලිකරු</th>
                <th style="padding:10px;">ස්වභාවය</th>
                <th style="padding:10px;">පරික්ෂා දිනය</th>
                <th style="padding:10px;">ක්‍රියාමාර්ග</th>
                <th style="padding:10px;">ප්‍රතිඵලය / Referral</th>
                <th style="padding:10px;">දඩ (Rs.)</th>
                <th style="padding:10px;width:180px;">Actions</th>
              </tr>
            </thead>
            <tbody id="ep_records_body">
              ${renderRows(arr)}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById("ep_apply_filter").addEventListener("click", () => epApplyFilter(arr));
    document.getElementById("ep_clear_filter").addEventListener("click", () => {
      document.getElementById("ep_filter_name").value = '';
      document.getElementById("ep_filter_nature").value = '';
      document.getElementById("ep_records_body").innerHTML = renderRows(arr);
      document.getElementById("ep_total").textContent = arr.length;
      attachRowEvents(arr);
    });

    attachRowEvents(arr);
  }

  function renderRows(arr) {
    if (!arr.length) return `<tr><td colspan="9" style="padding:12px;color:#666;text-align:center;">No records found.</td></tr>`;
    return arr.map((r, i) => `
        <tr>
             <td style="padding:10px;border-bottom:1px solid #eee;">${i + 1}</td>
             <td style="padding:10px;border-bottom:1px solid #eee;">${esc(r.date)}</td>
             <td style="padding:10px;border-bottom:1px solid #eee;">
                ${r.detectedByPhi ? '<span style="color:#d32f2f;font-weight:bold;">[Detected by PHI]</span>' : esc(r.complainantName)}<br>
                <small style="color:#666;">${r.detectedByPhi ? '' : esc(r.complainantAddress)}</small>
             </td>
             <td style="padding:10px;border-bottom:1px solid #eee;">${esc(r.nature).split(" - ")[0]}</td>
             <td style="padding:10px;border-bottom:1px solid #eee;">${esc(r.inspectionDate)}</td>
             <td style="padding:10px;border-bottom:1px solid #eee;">${esc(r.actionsTaken)}</td>
             <td style="padding:10px;border-bottom:1px solid #eee;">${esc(r.result)}</td>
             <td style="padding:10px;border-bottom:1px solid #eee;">${r.fineAmount ? 'Rs. ' + esc(r.fineAmount) : '-'}</td>
             <td style="padding:10px;border-bottom:1px solid #eee;">
                <button class="ep_view" data-id="${r.id}" style="padding:4px 8px;border-radius:4px;border:none;cursor:pointer;background:#e3f2fd;color:#0d47a1;">View</button>
                <button class="ep_edit" data-id="${r.id}" style="padding:4px 8px;border-radius:4px;border:none;cursor:pointer;background:#fff3e0;color:#e65100;">Edit</button>
                <button class="ep_delete" data-id="${r.id}" style="padding:4px 8px;border-radius:4px;border:none;cursor:pointer;background:#ffebee;color:#c62828;">Del</button>
             </td>
        </tr>
     `).join("");
  }

  function attachRowEvents(fullData) {
    // Find updated listeners
    document.querySelectorAll(".ep_view").forEach(b => b.addEventListener("click", (e) => epOnView(e, fullData)));
    document.querySelectorAll(".ep_edit").forEach(b => b.addEventListener("click", (e) => epOnEdit(e, fullData)));
    document.querySelectorAll(".ep_delete").forEach(b => b.addEventListener("click", (e) => epOnDelete(e, fullData)));
  }

  function epApplyFilter(fullData) {
    const name = document.getElementById("ep_filter_name").value.trim().toLowerCase();
    const nature = document.getElementById("ep_filter_nature").value;

    let filtered = fullData.filter(r => {
      let match = true;
      if (name) {
        const txt = (r.complainantName + " " + r.complainantAddress + " " + r.other).toLowerCase();
        if (!txt.includes(name)) match = false;
      }
      if (nature && r.nature !== nature) match = false;
      return match;
    });

    document.getElementById("ep_records_body").innerHTML = renderRows(filtered);
    document.getElementById("ep_total").textContent = filtered.length;
    attachRowEvents(fullData); // Pass fullData again for safety, though id lookup works
  }

  // ---------- Handlers ----------
  async function onSave() {
    const rec = collectFromForm();
    if (!rec) return;

    const btn = document.getElementById("ep_save");
    btn.textContent = "Saving...";
    btn.disabled = true;

    try {
      await saveData(rec); // Firebase add
      alert("Record saved successfully!");
      clearForm();
      // If needed, we could auto-switch to records
    } catch (err) {
      console.error(err);
      alert("Error saving record: " + err.message);
    } finally {
      btn.textContent = "සුරකින්න / Save";
      btn.disabled = false;
    }
  }

  async function onUpdate() {
    const btn = document.getElementById("ep_update");
    const editId = btn.dataset.editId;
    if (!editId) return;

    const rec = collectFromForm();
    if (!rec) return;

    btn.textContent = "Updating...";
    btn.disabled = true;

    try {
      await updateData(editId, rec); // Firebase update
      alert("Record updated successfully!");
      clearForm();
    } catch (err) {
      console.error(err);
      alert("Error updating record: " + err.message);
    } finally {
      btn.textContent = "Update";
      btn.disabled = false;
    }
  }

  function collectFromForm() {
    const date = document.getElementById("ep_date").value;
    const detectedByPhi = document.getElementById("ep_detectedByPhi").checked;
    const complainantName = detectedByPhi ? "" : document.getElementById("ep_complainantName").value.trim();
    const complainantAddress = detectedByPhi ? "" : document.getElementById("ep_complainantAddress").value.trim();

    const nature = document.getElementById("ep_nature").value;
    const receivedBy = document.getElementById("ep_receivedBy").value;
    const inspectionDate = document.getElementById("ep_inspectionDate").value;
    const actionsTaken = document.getElementById("ep_actionsTaken").value;
    const other = document.getElementById("ep_other").value.trim();

    // Complex result logic
    let result = "";
    let fineAmount = "";

    if (actionsTaken === "Referred") {
      const refType = document.getElementById("ep_referral_select").value;
      if (refType === "Other") result = "Referred to: " + document.getElementById("ep_referral_other").value.trim();
      else result = "Referred to: " + refType;
    } else {
      result = document.getElementById("ep_result").value;
    }

    if (result === "Convicted") {
      fineAmount = document.getElementById("ep_fineAmount").value;
    }

    if (!date) {
      alert("දිනය ඇතුලත් කිරීම අනිවාර්ය වේ. (Date is required)");
      return null;
    }

    if (!detectedByPhi && (!complainantName || !complainantAddress)) {
      alert("පැමිණිලිකරුගේ විස්තර හෝ 'Detected by PHI' තෝරන්න.");
      return null;
    }

    return {
      date,
      detectedByPhi,
      complainantName,
      complainantAddress,
      nature,
      receivedBy,
      inspectionDate,
      actionsTaken,
      result,
      fineAmount,
      other,
      updatedAt: new Date().toISOString()
    };
  }

  // view
  function epOnView(e, fullData) {
    const id = e.currentTarget.dataset.id;
    const rec = fullData.find(x => String(x.id) === String(id));
    if (!rec) return;

    const modal = document.getElementById("ep_view_modal");
    const body = document.getElementById("ep_view_body");
    body.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tbody>
          <tr><td style="padding:8px;font-weight:600;width:40%;">දිනය</td><td style="padding:8px;">${esc(rec.date)}</td></tr>
          
          ${rec.detectedByPhi ?
        `<tr><td style="padding:8px;font-weight:600;color:#d32f2f;">Detected By PHI</td><td style="padding:8px;">Yes</td></tr>`
        :
        `<tr><td style="padding:8px;font-weight:600;">පැමිණිලිකරු</td><td style="padding:8px;">${esc(rec.complainantName)}<br>${esc(rec.complainantAddress)}</td></tr>`
      }

          <tr><td style="padding:8px;font-weight:600;">ස්වභාවය</td><td style="padding:8px;">${esc(rec.nature)}</td></tr>
          <tr><td style="padding:8px;font-weight:600;">ලැබුණු ආකාරය</td><td style="padding:8px;">${esc(rec.receivedBy)}</td></tr>
          <tr><td style="padding:8px;font-weight:600;">පරික්ෂා කල දිනය</td><td style="padding:8px;">${esc(rec.inspectionDate)}</td></tr>
          <tr><td style="padding:8px;font-weight:600;">ගත් ක්‍රියාමාර්ගය</td><td style="padding:8px;">${esc(rec.actionsTaken)}</td></tr>
          <tr><td style="padding:8px;font-weight:600;">ප්‍රතිඵලය / යොමුකිරීම</td><td style="padding:8px;">${esc(rec.result)}</td></tr>
          ${rec.fineAmount ? `<tr><td style="padding:8px;font-weight:600;">දඩ මුදල</td><td style="padding:8px;">Rs. ${esc(rec.fineAmount)}</td></tr>` : ''}
          <tr><td style="padding:8px;font-weight:600;">වෙනත්</td><td style="padding:8px;">${esc(rec.other).replace(/\n/g, '<br>')}</td></tr>
        </tbody>
      </table>
    `;
    modal.style.display = "flex";
    document.getElementById("ep_view_close").onclick = () => modal.style.display = "none";
  }

  // edit
  function epOnEdit(e, fullData) {
    const id = e.currentTarget.dataset.id;
    const rec = fullData.find(x => String(x.id) === String(id));
    if (!rec) return;

    document.getElementById("ep_tab_entry").click();

    // Slight delay to ensure tab renders
    setTimeout(() => {
      document.getElementById("ep_date").value = rec.date || "";
      document.getElementById("ep_detectedByPhi").checked = !!rec.detectedByPhi;
      // Trigger checkbox change event to update visibility
      document.getElementById("ep_detectedByPhi").dispatchEvent(new Event('change'));

      document.getElementById("ep_complainantName").value = rec.complainantName || "";
      document.getElementById("ep_complainantAddress").value = rec.complainantAddress || "";
      document.getElementById("ep_nature").value = rec.nature || "";
      document.getElementById("ep_receivedBy").value = rec.receivedBy || "";
      document.getElementById("ep_inspectionDate").value = rec.inspectionDate || "";

      const actSel = document.getElementById("ep_actionsTaken");
      actSel.value = rec.actionsTaken || "";
      // Trigger change to set up result logic
      actSel.dispatchEvent(new Event('change'));

      // Restore specific logic values
      if (rec.actionsTaken === "Referred") {
        // Parse result string "Referred to: Police"
        const ref = (rec.result || "").replace("Referred to: ", "");
        const refSel = document.getElementById("ep_referral_select");
        if (["Pradeshiya Sabha", "Police", "CEA"].includes(ref)) {
          refSel.value = ref;
        } else {
          refSel.value = "Other";
          refSel.dispatchEvent(new Event('change'));
          document.getElementById("ep_referral_other").value = ref;
        }
      } else {
        // Restore Result dropdown
        const resSel = document.getElementById("ep_result");
        // If prosecuted or similar complex states
        if (["Convicted", "Acquitted"].includes(rec.result)) {
          // We need to force logic to show these options.
          // Usually triggered by Notice Issued -> Prosecuted OR Actions -> Prosecuted.
          // If Action was Notice Issued, but result is Convicted, we need to mock the intermediate state?
          // Or simplier: just force the options into the dropdown.
          resSel.innerHTML = `
                  <option value="Convicted">Convicted - වරදකරු</option>
                  <option value="Acquitted">Acquitted - නිවැරදිකරු / නිදහස්</option>
             `;
          resSel.disabled = false;
        }
        resSel.value = rec.result || "";
        resSel.dispatchEvent(new Event('change'));

        if (rec.fineAmount) {
          document.getElementById("ep_fineAmount").value = rec.fineAmount;
        }
      }

      document.getElementById("ep_other").value = rec.other || "";

      document.getElementById("ep_save").style.display = 'none';
      const upd = document.getElementById("ep_update");
      upd.style.display = 'inline-block';
      upd.dataset.editId = rec.id;
    }, 50);
  }

  // delete
  async function epOnDelete(e, fullData) {
    const id = e.currentTarget.dataset.id;
    if (!confirm("Are you sure you want to delete this record? This cannot be undone.")) return;

    try {
      await deleteData(id);
      alert("Record deleted.");
      // Refresh
      renderRecords();
    } catch (err) {
      console.error(err);
      alert("Error deleting: " + err.message);
    }
  }

})();
