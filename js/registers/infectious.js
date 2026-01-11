/* =======================================================
   infectious.js — Tab-fix version (other behavior preserved)
   - Fixes tab switching so all three tabs reliably open.
   - Keeps previous features: termination date shown under termination,
     patientId shown under disease select, house thumbnail, top scrollbar, etc.
   ======================================================= */

(() => {
  const DISEASE_STORAGE_KEY = "infectiousDiseases";
  const PATIENT_STORAGE_KEY = "infectiousPatients";

  const defaultDiseases = [
    { name: "Chickenpox", code: "CP", group: "B" },
    { name: "Dengue Fever / Dengue Haemorrhagic Fever", code: "DF", group: "B" },
    { name: "Diphtheria", code: "DP", group: "B" },
    { name: "Dysentery", code: "Dys", group: "B" },
    { name: "Encephalitis", code: "Enc", group: "B" },
    { name: "Enteric Fever", code: "EF", group: "B" },
    { name: "Food Poisoning", code: "FP", group: "B" },
    { name: "Human Rabies", code: "Rab", group: "B" },
    { name: "Leptospirosis", code: "Lep", group: "B" },
    { name: "Leprosy", code: "Lps", group: "B" },
    { name: "Leishmaniasis", code: "Les", group: "B" },
    { name: "Malaria", code: "Mal", group: "B" },
    { name: "Measles", code: "Mes", group: "B" },
    { name: "Meningitis", code: "Men", group: "B" },
    { name: "Mumps", code: "Mum", group: "B" },
    { name: "Rubella / Congenital Rubella Syndrome", code: "Rub", group: "B" },
    { name: "Simple continued fever of over 7 days", code: "scf", group: "B" },
    { name: "Tetanus / Neonatal Tetanus", code: "Tet", group: "B" },
    { name: "Typhus Fever", code: "Typ", group: "B" },
    { name: "Viral Hepatitis", code: "VH", group: "B" },
    { name: "Whooping Cough (Pertussis)", code: "Wh", group: "B" },
    { name: "Tuberculosis", code: "TB", group: "B" },
    { name: "Cholera", code: "Cho", group: "A" },
    { name: "Plague", code: "Pla", group: "A" },
    { name: "Yellow Fever", code: "YF", group: "A" },
  ];

  // load/merge disease definitions
  let diseases = JSON.parse(localStorage.getItem(DISEASE_STORAGE_KEY) || "[]");
  try {
    const existingCodes = new Set(diseases.map(d => d.code));
    const missing = defaultDiseases.filter(d => !existingCodes.has(d.code));
    if (missing.length) {
      diseases = [...diseases, ...missing];
      localStorage.setItem(DISEASE_STORAGE_KEY, JSON.stringify(diseases));
    }
  } catch (e) {
    diseases = defaultDiseases.slice();
    localStorage.setItem(DISEASE_STORAGE_KEY, JSON.stringify(diseases));
  }

  // load patients
  let infectiousPatients = JSON.parse(localStorage.getItem(PATIENT_STORAGE_KEY) || "[]");

  let selectedPatientIndex = null;
  let selectedDiseaseIndex = null;

  // small helpers
  function pxPercent(value, total) {
    if (!value || !total) return "";
    return Math.round((value / total) * 100) + "%";
  }

  // reserved-space helpers (no layout shift)
  function reserveShow(el) {
    if (!el) return;
    el.classList.remove("reserve-hidden");
    el.classList.add("reserve-visible");
  }
  function reserveHide(el) {
    if (!el) return;
    el.classList.remove("reserve-visible");
    el.classList.add("reserve-hidden");
  }

  // Build UI (same structure as before)
  window.openInfectious = function (title = "Infectious Diseases Register") {
    const content = document.getElementById("contentArea");
    content.innerHTML = `
      <style>
        .reserve-hidden { opacity:0; pointer-events:none; min-height:46px; transition:opacity .12s ease; }
        .reserve-visible { opacity:1; pointer-events:auto; min-height:46px; transition:opacity .12s ease; }
        .scroll-top { overflow:auto; transform: rotateX(180deg); -webkit-overflow-scrolling: touch; }
        .scroll-top > table { transform: rotateX(180deg); width:100%; border-collapse: collapse; }
        table#patientEntryTable th, table#patientEntryTable td, table#patientLogTable th, table#patientLogTable td {
          padding:6px 8px; border:1px solid #eee; font-size:13px; vertical-align:top;
        }
        .house-thumb { width:100px; height:100px; border:1px solid #ccc; display:inline-block; background:#fafafa; object-fit:cover; border-radius:4px; }
        .thumb-wrap { display:flex; gap:8px; align-items:center; }
      </style>

      <h2>${title}</h2>
      <div class="tabs glass">
        <button class="tab-btn active" data-tab="tab1-patients" type="button">රෝගී දත්ත ඇතුළත් කිරීම</button>
        <button class="tab-btn" data-tab="tab2-definitions" type="button">නව බෝවන රෝග එකතු කිරීම</button>
        <button class="tab-btn" data-tab="tab3-log" type="button">බෝවන රෝග ලේඛණය</button>
      </div>

      <div class="tab-content active" id="tab1-patients">
        <!-- form (same as earlier) -->
        <form id="patientForm">
          <label>I.D. Card ලැබුණු දිනය:</label>
          <input type="date" name="dateOfReceipt" required>

          <label>GN Division:</label>
          <input type="text" name="droDivision" required>

          <label>Address:</label>
          <input type="text" name="locality" required>

          <label>Name:</label>
          <input type="text" name="patientName" required>

          <label>Age:</label>
          <input type="number" name="age" min="0" required>

          <label>Sex:</label>
          <select name="sex" required>
            <option value="">-- Select --</option>
            <option value="පිරිමි">පිරිමි</option>
            <option value="ගැහැණු">ගැහැණු</option>
          </select>

          <label>ජාතිය:</label>
          <input type="text" name="race" list="races" required>
          <datalist id="races"><option value="සිංහල"></option><option value="දෙමළ"></option><option value="මුස්ලිම්"></option><option value="වෙනත්"></option></datalist>

          <label>රැකියාව:</label>
          <input type="text" name="occupation" required>

          <label>ආගම:</label>
          <input type="text" name="religion" list="religions" required>
          <datalist id="religions"><option value="බුද්ධාගම"></option><option value="හින්දු"></option><option value="ඉස්ලාම්"></option><option value="ක්‍රිස්තියානි"></option><option value="වෙනත්"></option></datalist>

          <label>දැනුම් දුන් දිනය (Date of notification):</label>
          <input type="date" name="dateOfNotification" required>

          <label>දැනුම් දුන්නේ කව්ද (By whom Notified):</label>
          <input list="notifiers" name="byWhomNotified" placeholder="Select or type">
          <datalist id="notifiers">
            <option value="TH Kalutara"></option>
            <option value="Nadsys"></option>
            <option value="Chest Clinic"></option>
            <option value="STD Clinic"></option>
          </datalist>

          <label>පරික්ෂා කලේ කව්ද:</label>
          <select name="examinedBy">
            <option value="PHI Nehinna" selected>PHI Nehinna</option>
            <option value="Other area PHI">Other area PHI</option>
            <option value="SPHI">SPHI</option>
            <option value="MOH">MOH</option>
          </select>

          <label>රසායනික පරීක්ෂණයේ ප්‍රතිඵල:</label>
          <input type="text" name="labResults" placeholder="Enter results">

          <label>Isolation:</label>
          <select name="isolation">
            <option value="">-- Select --</option>
            <option value="Home">Home</option>
            <option value="Hospital">Hospital</option>
          </select>

          <label>Termination (Death / Recovery):</label>
          <select name="terminationStatus" id="terminationStatus">
            <option value="">-- Select --</option>
            <option value="Death">Death</option>
            <option value="Recovery">Recovery</option>
          </select>

          <div id="terminationDateContainer" class="reserve-hidden">
            <label>Termination Date:</label>
            <input type="date" name="terminationDate" id="terminationDate">
          </div>

          <label>Source of Infection:</label>
          <input type="text" name="sourceOfInfection" placeholder="Enter source (if known)">

          <label>Remarks:</label>
          <textarea name="remarks" rows="3" placeholder="Any remarks..."></textarea>

          <label>රෝගියාගේ නිවාස පිහිටි ස්ථානය (House location):</label>
          <div class="thumb-wrap">
            <div>
              <button type="button" id="markHouseBtn" style="background:#1b5e20;color:white;padding:8px 10px;border-radius:6px;border:none;cursor:pointer;">Map මත ලකුණු කරන්න</button>
              <div style="margin-top:6px; font-size:13px; color:#444;" id="houseCoordReadout">(No location)</div>
            </div>
            <div id="houseThumbHolder">
              <img id="houseThumb" class="house-thumb" alt="House preview" src="" style="display:none;">
            </div>
          </div>

          <input type="hidden" name="houseX" id="houseX">
          <input type="hidden" name="houseY" id="houseY">
          <input type="hidden" name="houseImgWidth" id="houseImgWidth">
          <input type="hidden" name="houseImgHeight" id="houseImgHeight">

          <label>රෝගය:</label>
          <select name="natureOfDisease" id="diseaseSelect" required>
            <option value="">-- තෝරන්න --</option>
            ${diseases.map(d => `<option value="${d.name}">${d.name}</option>`).join("")}
          </select>

          <div id="patientIdContainer" class="reserve-hidden">
            <label>ලේඛණ ගත අංකය:</label>
            <input type="text" name="patientId" id="patientId" readonly>
          </div>

          <label>රෝගය වැළඳුණු දිනය:</label>
          <input type="date" name="dateOfOnset" required>

          <label>Date of Discharge:</label>
          <input type="date" name="dateOfDischarge">

          <div style="margin-top:10px;">
            <button type="submit" id="addUpdatePatientBtn">ඇතුළත් කරන්න / Update කරන්න</button>
            <button type="button" id="deletePatientBtn" style="background:#b71c1c;color:white;">Delete</button>
            <button type="button" id="clearPatientBtn" style="background:#757575;color:white;">Clear</button>
          </div>
        </form>

        <div class="scroll-top" id="entryScrollWrap" style="margin-top:12px;">
          <table id="patientEntryTable">
            <thead>
              <tr>
                <th>#</th><th>Patient ID</th><th>Date of Receipt</th><th>GN Division</th><th>Address</th><th>Name</th>
                <th>Age</th><th>Sex</th><th>Race</th><th>Occupation</th><th>Religion</th><th>Date of Notification</th>
                <th>By Whom Notified</th><th>Examined By</th><th>Lab Results</th><th>Isolation</th>
                <th>Termination Status</th><th>Termination Date</th><th>Source of Infection</th><th>Remarks</th>
                <th>House % X</th><th>House % Y</th><th>Disease</th><th>Date of Onset</th><th>Date of Discharge</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>

      <!-- Tab 2 -->
      <div class="tab-content" id="tab2-definitions">
        <form id="diseaseDefinitionForm">
          <label>රෝගයේ නම:</label>
          <input type="text" name="name" required>
          <label>රෝගයේ හදුනාගැනීමේ කේතය:</label>
          <input type="text" name="code" required>
          <label>Group:</label>
          <select name="group" id="groupSelect" required>
            <option value="">-- තෝරන්න / Type කරන්න --</option>
            <option value="A">A</option>
            <option value="B">B</option>
          </select>
          <div style="margin-top:10px;">
            <button type="submit" id="addUpdateDiseaseBtn">Add / Update</button>
            <button type="button" id="deleteDiseaseBtn" style="background:#b71c1c;color:white;">Delete</button>
            <button type="button" id="clearDiseaseBtn" style="background:#757575;color:white;">Clear</button>
          </div>
        </form>
        <table id="diseaseDefinitionTable" style="width:100%; margin-top:12px;">
          <thead><tr><th>No</th><th>Name</th><th>Code</th><th>Group</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>

      <!-- Tab 3 -->
      <div class="tab-content" id="tab3-log">
        <h3>බෝවන රෝග ලේඛණය</h3>
        <div class="filters glass" style="padding:15px; margin-bottom:15px; display:flex; flex-wrap:wrap; gap:10px;">
          <label>වර්ෂය:</label>
          <select id="filterYear" style="flex:1;"><option value="">සියලු වසර</option>${Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => `<option>${y}</option>`).join("")}</select>
          <label>රෝගය:</label>
          <select id="filterDisease" style="flex:1;"><option value="">සියලු රෝග</option>${diseases.map(d => `<option value="${d.name}">${d.name}</option>`).join("")}</select>
          <label>age (min):</label><input type="number" id="filterAgeMin" min="0" style="flex:0.5;">
          <label>age (max):</label><input type="number" id="filterAgeMax" min="0" style="flex:0.5;">
          <label>D.R.O. Division:</label><input type="text" id="filterDroDivision" placeholder="Enter Division" style="flex:1;">
          <label>Sex:</label>
          <select id="filterSex" style="flex:1;"><option value="">All</option><option value="පිරිමි">පිරිමි</option><option value="ගැහැණු">ගැහැණු</option></select>
          <button id="applyFiltersBtn" style="background:var(--accent); color:white; padding:8px 12px; border-radius:8px; border:none; cursor:pointer;">Apply</button>
          <button id="clearFiltersBtn" style="background:#757575; color:white; padding:8px 12px; border-radius:8px; border:none; cursor:pointer;">Clear</button>
        </div>

        <div class="scroll-top" id="logScrollWrap" style="overflow:auto;">
          <table id="patientLogTable" style="min-width:1200px; border-collapse: collapse; width:100%; margin-top:12px;">
            <thead>
              <tr>
                <th>#</th><th>Patient ID</th><th>Date of Receipt</th><th>GN Division</th><th>Address</th><th>Name</th>
                <th>Age</th><th>Sex</th><th>Race</th><th>Occupation</th><th>Religion</th><th>Date of Notification</th>
                <th>By Whom Notified</th><th>Examined By</th><th>Lab Results</th><th>Isolation</th>
                <th>Termination Status</th><th>Termination Date</th><th>Source of Infection</th><th>Remarks</th>
                <th>House % X</th><th>House % Y</th><th>Disease</th><th>Date of Onset</th><th>Date of Discharge</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    `; // end innerHTML

    // ---------- element refs ----------
    const tabButtons = content.querySelectorAll(".tab-btn");
    const tabContents = content.querySelectorAll(".tab-content");

    // get frequently used refs after DOM creation
    const patientForm = document.getElementById("patientForm");
    const patientEntryTbody = document.querySelector("#patientEntryTable tbody");
    const diseaseSelect = document.getElementById("diseaseSelect");
    const patientIdContainer = document.getElementById("patientIdContainer");
    const patientIdInput = document.getElementById("patientId");
    const deletePatientBtn = document.getElementById("deletePatientBtn");
    const clearPatientBtn = document.getElementById("clearPatientBtn");

    const markHouseBtn = document.getElementById("markHouseBtn");
    const houseCoordReadout = document.getElementById("houseCoordReadout");
    const houseXInput = document.getElementById("houseX");
    const houseYInput = document.getElementById("houseY");
    const houseImgWInput = document.getElementById("houseImgWidth");
    const houseImgHInput = document.getElementById("houseImgHeight");
    const houseThumbEl = document.getElementById("houseThumb");

    const terminationStatusSelect = document.getElementById("terminationStatus");
    const terminationDateContainer = document.getElementById("terminationDateContainer");
    const terminationDateInput = document.getElementById("terminationDate");

    const diseaseDefinitionForm = document.getElementById("diseaseDefinitionForm");
    const diseaseDefinitionTbody = document.querySelector("#diseaseDefinitionTable tbody");
    const groupSelect = document.getElementById("groupSelect");
    const deleteDiseaseBtn = document.getElementById("deleteDiseaseBtn");
    const clearDiseaseBtn = document.getElementById("clearDiseaseBtn");

    const patientLogTbody = document.querySelector("#patientLogTable tbody");
    const filterYear = document.getElementById("filterYear");
    const filterDisease = document.getElementById("filterDisease");
    const filterAgeMin = document.getElementById("filterAgeMin");
    const filterAgeMax = document.getElementById("filterAgeMax");
    const filterDroDivision = document.getElementById("filterDroDivision");
    const filterSex = document.getElementById("filterSex");
    const applyFiltersBtn = document.getElementById("applyFiltersBtn");
    const clearFiltersBtn = document.getElementById("clearFiltersBtn");

    // initialize reserve-hidden on containers
    if (patientIdContainer && !patientIdContainer.classList.contains("reserve-hidden")) {
      patientIdContainer.classList.add("reserve-hidden");
    }
    if (terminationDateContainer && !terminationDateContainer.classList.contains("reserve-hidden")) {
      terminationDateContainer.classList.add("reserve-hidden");
    }

    // ---------- ID generation helper ----------
    function generatePatientId(diseaseName, dateOfReceipt, currentPatientIndex = null) {
      if (!diseaseName || !dateOfReceipt) return "";
      const selectedDisease = diseases.find(d => d.name === diseaseName);
      if (!selectedDisease) return "";
      const diseaseCode = selectedDisease.code || selectedDisease.name.slice(0,3).toUpperCase();
      const year = new Date(dateOfReceipt).getFullYear();
      const patientsInYearForDisease = infectiousPatients.filter((p, index) => {
        const pYear = p.dateOfReceipt ? new Date(p.dateOfReceipt).getFullYear() : null;
        return pYear === year && p.natureOfDisease === diseaseName && index !== currentPatientIndex;
      });
      const diseaseCountForYear = patientsInYearForDisease.length + 1;
      const allPatientsInCurrentYear = infectiousPatients.filter((p, index) => {
          const pYear = p.dateOfReceipt ? new Date(p.dateOfReceipt).getFullYear() : null;
          return pYear === year && index !== currentPatientIndex;
      });
      const overallPatientCountForYear = allPatientsInCurrentYear.length + 1;
      return `${diseaseCode}/${String(diseaseCountForYear).padStart(2, '0')}/ID/${String(overallPatientCountForYear).padStart(2, '0')}/${year}`;
    }

    function updatePatientIdField() {
      const diseaseName = diseaseSelect.value;
      const dateOfReceipt = patientForm.dateOfReceipt.value;
      if (diseaseName && dateOfReceipt) {
        reserveShow(patientIdContainer);
        if (selectedPatientIndex === null || patientIdInput.readOnly) {
          patientIdInput.value = generatePatientId(diseaseName, dateOfReceipt, selectedPatientIndex);
        }
      } else {
        reserveHide(patientIdContainer);
        patientIdInput.value = "";
      }
    }
    diseaseSelect.addEventListener('change', updatePatientIdField);
    patientForm.addEventListener('change', (e) => {
      if (e.target && e.target.name === 'dateOfReceipt') updatePatientIdField();
    });

    patientIdInput.addEventListener('click', () => { patientIdInput.readOnly = false; patientIdInput.focus(); });
    patientIdInput.addEventListener('blur', () => { patientIdInput.readOnly = true; });

    // termination select behavior
    terminationStatusSelect.addEventListener('change', () => {
      const v = terminationStatusSelect.value;
      if (v === "Death" || v === "Recovery") {
        reserveShow(terminationDateContainer);
        terminationDateInput.required = true;
      } else {
        reserveHide(terminationDateContainer);
        terminationDateInput.required = false;
        terminationDateInput.value = "";
      }
    });

    // ---------- disease definitions ----------
    function renderDiseaseDefinitionTable() {
      diseaseDefinitionTbody.innerHTML = diseases.map((d, i) => `<tr data-index="${i}"><td>${i+1}</td><td>${d.name}</td><td>${d.code}</td><td>${d.group}</td></tr>`).join("");
      diseaseDefinitionTbody.querySelectorAll("tr").forEach(row => {
        row.onclick = () => {
          selectedDiseaseIndex = +row.dataset.index;
          const dd = diseases[selectedDiseaseIndex];
          diseaseDefinitionForm.name.value = dd.name;
          diseaseDefinitionForm.code.value = dd.code;
          groupSelect.value = dd.group;
        };
      });
    }

    diseaseDefinitionForm.onsubmit = (e) => {
      e.preventDefault();
      const d = { name: diseaseDefinitionForm.name.value.trim(), code: diseaseDefinitionForm.code.value.trim(), group: diseaseDefinitionForm.group.value.trim() };
      if (selectedDiseaseIndex !== null) diseases[selectedDiseaseIndex] = d;
      else diseases.push(d);
      localStorage.setItem(DISEASE_STORAGE_KEY, JSON.stringify(diseases));
      updateDiseaseSelectOptions();
      renderDiseaseDefinitionTable();
      diseaseDefinitionForm.reset();
      selectedDiseaseIndex = null;
    };

    deleteDiseaseBtn.onclick = () => {
      if (selectedDiseaseIndex !== null && confirm("Delete this disease definition?")) {
        diseases.splice(selectedDiseaseIndex,1);
        localStorage.setItem(DISEASE_STORAGE_KEY, JSON.stringify(diseases));
        updateDiseaseSelectOptions();
        renderDiseaseDefinitionTable();
        selectedDiseaseIndex = null;
      }
    };
    clearDiseaseBtn.onclick = () => { diseaseDefinitionForm.reset(); selectedDiseaseIndex = null; };

    function updateDiseaseSelectOptions() {
      diseaseSelect.innerHTML = `<option value="">-- තෝරන්න --</option>` + diseases.map(d => `<option value="${d.name}">${d.name}</option>`).join("");
      const fd = document.getElementById("filterDisease");
      if (fd) fd.innerHTML = `<option value="">සියලු රෝග</option>` + diseases.map(d => `<option value="${d.name}">${d.name}</option>`).join("");
    }
    updateDiseaseSelectOptions();

    // ---------- render entry & log tables ----------
    function renderPatientEntryTable() {
      patientEntryTbody.innerHTML = infectiousPatients.map((p, idx) => {
        const px = (p.houseX && p.houseImgWidth) ? pxPercent(p.houseX, p.houseImgWidth) : (p.houseX ? 'n/a' : '');
        const py = (p.houseY && p.houseImgHeight) ? pxPercent(p.houseY, p.houseImgHeight) : (p.houseY ? 'n/a' : '');
        return `<tr data-index="${idx}" style="cursor:pointer;">
          <td>${idx+1}</td>
          <td>${p.patientId || ''}</td>
          <td>${p.dateOfReceipt || ''}</td>
          <td>${p.droDivision || ''}</td>
          <td>${p.locality || ''}</td>
          <td>${p.patientName || ''}</td>
          <td>${p.age ?? ''}</td>
          <td>${p.sex || ''}</td>
          <td>${p.race || ''}</td>
          <td>${p.occupation || ''}</td>
          <td>${p.religion || ''}</td>
          <td>${p.dateOfNotification || ''}</td>
          <td>${p.byWhomNotified || ''}</td>
          <td>${p.examinedBy || ''}</td>
          <td>${p.labResults || ''}</td>
          <td>${p.isolation || ''}</td>
          <td>${p.terminationStatus || ''}</td>
          <td>${p.terminationDate || ''}</td>
          <td>${p.sourceOfInfection || ''}</td>
          <td>${(p.remarks || '').replace(/\n/g,'<br>')}</td>
          <td>${px}</td>
          <td>${py}</td>
          <td>${p.natureOfDisease || ''}</td>
          <td>${p.dateOfOnset || ''}</td>
          <td>${p.dateOfDischarge || ''}</td>
        </tr>`;
      }).join("");

      patientEntryTbody.querySelectorAll("tr").forEach(row => {
        row.onclick = () => {
          selectedPatientIndex = +row.dataset.index;
          const p = infectiousPatients[selectedPatientIndex];
          try {
            patientForm.dateOfReceipt.value = p.dateOfReceipt || "";
            patientForm.droDivision.value = p.droDivision || "";
            patientForm.locality.value = p.locality || "";
            patientForm.patientName.value = p.patientName || "";
            patientForm.age.value = p.age ?? "";
            patientForm.sex.value = p.sex || "";
            patientForm.race.value = p.race || "";
            patientForm.occupation.value = p.occupation || "";
            patientForm.religion.value = p.religion || "";
            patientForm.dateOfNotification.value = p.dateOfNotification || "";
            patientForm.byWhomNotified.value = p.byWhomNotified || "";
            patientForm.examinedBy.value = p.examinedBy || "PHI Nehinna";
            patientForm.labResults.value = p.labResults || "";
            patientForm.isolation.value = p.isolation || "";
            patientForm.terminationStatus.value = p.terminationStatus || "";
            if (p.terminationStatus === "Death" || p.terminationStatus === "Recovery") {
              reserveShow(terminationDateContainer);
              terminationDateInput.required = true;
              patientForm.terminationDate.value = p.terminationDate || "";
            } else {
              reserveHide(terminationDateContainer);
              terminationDateInput.required = false;
              patientForm.terminationDate.value = "";
            }
            patientForm.sourceOfInfection.value = p.sourceOfInfection || "";
            patientForm.remarks.value = p.remarks || "";
            patientForm.natureOfDisease.value = p.natureOfDisease || "";
            patientForm.dateOfOnset.value = p.dateOfOnset || "";
            patientForm.dateOfDischarge.value = p.dateOfDischarge || "";

            if (p.patientId) {
              reserveShow(patientIdContainer);
              patientIdInput.value = p.patientId;
              patientIdInput.readOnly = true;
            } else {
              reserveHide(patientIdContainer);
              patientIdInput.value = "";
            }

            if (p.houseX && p.houseY) {
              houseXInput.value = p.houseX;
              houseYInput.value = p.houseY;
              houseImgWInput.value = p.houseImgWidth || "";
              houseImgHInput.value = p.houseImgHeight || "";
              houseCoordReadout.textContent = `House: ${p.houseImgWidth ? pxPercent(p.houseX, p.houseImgWidth) : '?'} , ${p.houseImgHeight ? pxPercent(p.houseY, p.houseImgHeight) : '?'}`;
              // try to show thumbnail if possible:
              buildHouseThumbnailFromMap(p).catch(()=>{});
            } else {
              houseCoordReadout.textContent = "(No location)";
              houseXInput.value = "";
              houseYInput.value = "";
              houseImgWInput.value = "";
              houseImgHInput.value = "";
              hideHouseThumb();
            }

            updatePatientIdField();
          } catch (err) {
            console.error("Populate form error:", err);
          }
        };
      });
    }

    function renderPatientLogTable() {
      const tbody = patientLogTbody;
      let rows = infectiousPatients.slice();
      const year = filterYear.value;
      const disease = filterDisease.value;
      const minA = parseInt(filterAgeMin.value);
      const maxA = parseInt(filterAgeMax.value);
      const dro = (filterDroDivision.value || "").toLowerCase();
      const sex = filterSex.value;
      rows = rows.filter(p => {
        const pYear = p.dateOfReceipt ? new Date(p.dateOfReceipt).getFullYear().toString() : "";
        return (!year || pYear === year) &&
               (!disease || p.natureOfDisease === disease) &&
               (isNaN(minA) || (p.age !== null && p.age >= minA)) &&
               (isNaN(maxA) || (p.age !== null && p.age <= maxA)) &&
               (!dro || (p.droDivision || "").toLowerCase().includes(dro)) &&
               (!sex || p.sex === sex);
      });
      rows.sort((a,b) => new Date(a.dateOfReceipt) - new Date(b.dateOfReceipt));
      tbody.innerHTML = rows.map((p,i) => {
        const px = (p.houseX && p.houseImgWidth) ? pxPercent(p.houseX, p.houseImgWidth) : (p.houseX ? 'n/a' : '');
        const py = (p.houseY && p.houseImgHeight) ? pxPercent(p.houseY, p.houseImgHeight) : (p.houseY ? 'n/a' : '');
        return `<tr>
          <td>${i+1}</td>
          <td>${p.patientId || ''}</td>
          <td>${p.dateOfReceipt || ''}</td>
          <td>${p.droDivision || ''}</td>
          <td>${p.locality || ''}</td>
          <td>${p.patientName || ''}</td>
          <td>${p.age ?? ''}</td>
          <td>${p.sex || ''}</td>
          <td>${p.race || ''}</td>
          <td>${p.occupation || ''}</td>
          <td>${p.religion || ''}</td>
          <td>${p.dateOfNotification || ''}</td>
          <td>${p.byWhomNotified || ''}</td>
          <td>${p.examinedBy || ''}</td>
          <td>${p.labResults || ''}</td>
          <td>${p.isolation || ''}</td>
          <td>${p.terminationStatus || ''}</td>
          <td>${p.terminationDate || ''}</td>
          <td>${p.sourceOfInfection || ''}</td>
          <td>${(p.remarks || '').replace(/\n/g,'<br>')}</td>
          <td>${px}</td>
          <td>${py}</td>
          <td>${p.natureOfDisease || ''}</td>
          <td>${p.dateOfOnset || ''}</td>
          <td>${p.dateOfDischarge || ''}</td>
        </tr>`;
      }).join("");
    }

    // ---------- thumbnail helpers (same as earlier) ----------
    async function buildHouseThumbnailFromMap(recordOrPayload) {
      const x = recordOrPayload.houseX ?? recordOrPayload.x;
      const y = recordOrPayload.houseY ?? recordOrPayload.y;
      const w = recordOrPayload.houseImgWidth ?? recordOrPayload.imgWidth;
      const h = recordOrPayload.houseImgHeight ?? recordOrPayload.imgHeight;
      if (!x || !y || !w || !h) { showHouseThumbPlaceholder(x,y); return; }

      try {
        if (window.phiMapAPI && typeof window.phiMapAPI.getMapImageDataURL === "function") {
          const dataUrl = await window.phiMapAPI.getMapImageDataURL();
          if (!dataUrl) { showHouseThumbPlaceholder(x,y); return; }
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const thumbSize = 100;
            canvas.width = thumbSize; canvas.height = thumbSize;
            const ctx = canvas.getContext("2d");
            const sx = Math.max(0, Math.min(x - thumbSize/2, img.width - thumbSize));
            const sy = Math.max(0, Math.min(y - thumbSize/2, img.height - thumbSize));
            ctx.drawImage(img, sx, sy, thumbSize, thumbSize, 0, 0, thumbSize, thumbSize);
            const relX = x - sx; const relY = y - sy;
            ctx.beginPath(); ctx.fillStyle = "rgba(255,0,0,0.9)"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
            ctx.arc(relX, relY, 6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            houseThumbEl.src = canvas.toDataURL("image/png"); houseThumbEl.style.display = "inline-block";
          };
          img.onerror = () => showHouseThumbPlaceholder(x,y);
          img.src = dataUrl;
          return;
        } else {
          showHouseThumbPlaceholder(x,y);
        }
      } catch (err) {
        console.warn("Thumbnail build failed:", err);
        showHouseThumbPlaceholder(x,y);
      }
    }

    function showHouseThumbPlaceholder(x, y) {
      const canvas = document.createElement("canvas");
      canvas.width = 100; canvas.height = 100;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#f8f8f8"; ctx.fillRect(0,0,100,100);
      ctx.fillStyle = "#666"; ctx.font = "10px sans-serif"; ctx.fillText("No map image",8,48);
      const coordText = (x && y) ? `x:${Math.round(x)},y:${Math.round(y)}` : "no coords";
      ctx.fillText(coordText,8,64);
      houseThumbEl.src = canvas.toDataURL("image/png");
      houseThumbEl.style.display = "inline-block";
    }
    function hideHouseThumb(){ houseThumbEl.style.display = "none"; houseThumbEl.src = ""; }

    // ---------- map selection ----------
    markHouseBtn.addEventListener('click', () => {
      const snapshot = {};
      try { new FormData(patientForm).forEach((v,k)=> snapshot[k]=v); } catch(e){console.warn(e);}

      if (!window.phiMapAPI || typeof window.phiMapAPI.enablePointSelection !== "function") {
        if (typeof window.openPhiAreaMap === "function") window.openPhiAreaMap();
        alert("PHI Map module not ready. Open PHI Area Map and upload the map first.");
        return;
      }
      if (typeof window.openPhiAreaMap === "function") window.openPhiAreaMap();

      setTimeout(() => {
        try {
          window.phiMapAPI.enablePointSelection(async (payload) => {
            if (!payload || typeof payload.x === "undefined") { alert("No point selected on map."); return; }
            if (window.phiMapAPI && typeof window.phiMapAPI.addSymbolAt === "function") {
              try { window.phiMapAPI.addSymbolAt(payload.x, payload.y, "house"); } catch(e){console.warn(e);}
            }
            setTimeout(() => {
              if (typeof openInfectious === "function") openInfectious("Infectious Diseases Register");
              setTimeout(async () => {
                const f = document.getElementById("patientForm");
                if (!f) { alert("Could not restore Infectious form."); return; }
                try { Object.entries(snapshot).forEach(([k,v])=> { const el = f.elements.namedItem(k); if(el) el.value = v; }); } catch(e){console.warn(e);}
                const hx = document.getElementById("houseX"), hy = document.getElementById("houseY"), hw = document.getElementById("houseImgWidth"), hh = document.getElementById("houseImgHeight"), ro = document.getElementById("houseCoordReadout");
                if (hx && hy && ro) {
                  hx.value = Math.round(payload.x); hy.value = Math.round(payload.y);
                  if (payload.imgWidth) hw.value = payload.imgWidth; if (payload.imgHeight) hh.value = payload.imgHeight;
                  const pxVal = payload.imgWidth ? Math.round((payload.x/payload.imgWidth)*100) + '%' : Math.round((payload.normalizedX||0)*100) + '%';
                  const pyVal = payload.imgHeight ? Math.round((payload.y/payload.imgHeight)*100) + '%' : Math.round((payload.normalizedY||0)*100) + '%';
                  ro.textContent = `House: (${pxVal}, ${pyVal})`;
                  await buildHouseThumbnailFromMap(payload);
                }
                // ensure tab1 visible
                document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
                document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
                const tab1Btn = Array.from(document.querySelectorAll(".tab-btn")).find(b => b.dataset.tab === "tab1-patients");
                if (tab1Btn) { tab1Btn.classList.add("active"); document.getElementById("tab1-patients").classList.add("active"); }
                renderPatientEntryTable(); renderPatientLogTable();
              }, 140);
            }, 120);
          });
        } catch (err) {
          console.error("enablePointSelection error:", err);
          alert("Could not enable map selection. Ensure PHI Map module is loaded and map saved.");
        }
      }, 220);
    });

    // ---------- form submit / delete / clear ----------
    patientForm.onsubmit = (e) => {
      e.preventDefault();
      const termStatus = terminationStatusSelect.value;
      if ((termStatus === "Death" || termStatus === "Recovery") && !terminationDateInput.value) {
        alert("Please pick the termination date when Termination is set to Death or Recovery.");
        return;
      }
      updatePatientIdField();
      const rec = {
        patientId: patientIdInput.value.trim(),
        dateOfReceipt: patientForm.dateOfReceipt.value,
        droDivision: patientForm.droDivision.value,
        locality: patientForm.locality.value,
        patientName: patientForm.patientName.value,
        age: patientForm.age.value ? Number(patientForm.age.value) : null,
        sex: patientForm.sex.value,
        race: patientForm.race.value,
        occupation: patientForm.occupation.value,
        religion: patientForm.religion.value,
        dateOfNotification: patientForm.dateOfNotification.value,
        byWhomNotified: patientForm.byWhomNotified.value,
        examinedBy: patientForm.examinedBy.value,
        labResults: patientForm.labResults.value,
        isolation: patientForm.isolation.value,
        terminationStatus: patientForm.terminationStatus.value,
        terminationDate: patientForm.terminationDate ? patientForm.terminationDate.value : "",
        sourceOfInfection: patientForm.sourceOfInfection.value,
        remarks: patientForm.remarks.value,
        houseX: houseXInput.value ? Number(houseXInput.value) : null,
        houseY: houseYInput.value ? Number(houseYInput.value) : null,
        houseImgWidth: houseImgWInput.value ? Number(houseImgWInput.value) : null,
        houseImgHeight: houseImgHInput.value ? Number(houseImgHInput.value) : null,
        natureOfDisease: patientForm.natureOfDisease.value,
        dateOfOnset: patientForm.dateOfOnset.value,
        dateOfDischarge: patientForm.dateOfDischarge.value
      };
      const isDup = infectiousPatients.some((p, i) => p.patientId === rec.patientId && i !== selectedPatientIndex);
      if (isDup) { alert("Patient ID already exists. Choose another."); return; }
      if (selectedPatientIndex !== null) infectiousPatients[selectedPatientIndex] = rec;
      else infectiousPatients.push(rec);
      localStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify(infectiousPatients));
      renderPatientEntryTable(); renderPatientLogTable();
      patientForm.reset(); reserveHide(patientIdContainer); patientIdInput.value = ""; houseCoordReadout.textContent = "(No location)"; hideHouseThumb();
      selectedPatientIndex = null; reserveHide(terminationDateContainer); terminationDateInput.required = false; terminationDateInput.value = "";
      alert("Record saved.");
    };

    deletePatientBtn.onclick = () => {
      if (selectedPatientIndex !== null) {
        if (confirm("Delete this record?")) {
          infectiousPatients.splice(selectedPatientIndex,1);
          localStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify(infectiousPatients));
          renderPatientEntryTable(); renderPatientLogTable();
          patientForm.reset(); selectedPatientIndex = null; houseCoordReadout.textContent = "(No location)"; hideHouseThumb();
          reserveHide(patientIdContainer); reserveHide(terminationDateContainer);
        }
      } else alert("Select a record first.");
    };
    clearPatientBtn.onclick = () => {
      if (confirm("Clear form?")) {
        patientForm.reset(); selectedPatientIndex = null; reserveHide(patientIdContainer); patientIdInput.value = ""; houseCoordReadout.textContent = "(No location)"; hideHouseThumb(); reserveHide(terminationDateContainer); terminationDateInput.required = false; terminationDateInput.value = "";
      }
    };

    // ---------- filters ----------
    applyFiltersBtn.onclick = renderPatientLogTable;
    clearFiltersBtn.onclick = () => {
      filterYear.value = ""; filterDisease.value = ""; filterAgeMin.value = ""; filterAgeMax.value = ""; filterDroDivision.value = ""; filterSex.value = ""; renderPatientLogTable();
    };
    [filterYear, filterDisease, filterAgeMin, filterAgeMax, filterDroDivision, filterSex].forEach(el => { if (el) el.addEventListener('change', renderPatientLogTable); });

    // ---------- TAB SWITCHING (robust) ----------
    // Use a handler that toggles active classes and attempts to call renderers if available.
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        // toggle active classes
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetEl = document.getElementById(target);
        if (targetEl) targetEl.classList.add('active');
        // call renderers if defined (safe guard)
        try { if (target === 'tab1-patients' && typeof renderPatientEntryTable === 'function') renderPatientEntryTable(); } catch(e){}
        try { if (target === 'tab2-definitions' && typeof renderDiseaseDefinitionTable === 'function') renderDiseaseDefinitionTable(); } catch(e){}
        try { if (target === 'tab3-log' && typeof renderPatientLogTable === 'function') renderPatientLogTable(); } catch(e){}
      });
    });

    // initial render
    renderPatientEntryTable(); renderDiseaseDefinitionTable(); renderPatientLogTable();
  }; // end openInfectious

})(); // end module
