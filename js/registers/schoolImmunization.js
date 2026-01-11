// schoolImmunization.js — updated to populate "පාසල" selects from PHI area data (phiAreaMap.js)
// Based on original extracted module; stores schoolId + schoolName for robustness.

(function () {
  const STORAGE_KEY_1 = "form1Data";
  const STORAGE_KEY_2 = "form2Data";

  // Helpers - storage
  function read1() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_1) || "[]"); } catch(e){ return []; } }
  function read2() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY_2) || "[]"); } catch(e){ return []; } }
  function write1(v) { localStorage.setItem(STORAGE_KEY_1, JSON.stringify(v)); }
  function write2(v) { localStorage.setItem(STORAGE_KEY_2, JSON.stringify(v)); }

  // Safe accessor for phi schools API
  function getPhiSchools() {
    try {
      if (window.phiMapAPI && typeof window.phiMapAPI.getSchools === "function") {
        const arr = window.phiMapAPI.getSchools() || [];
        // ensure array of objects {id, name, ...}
        return Array.isArray(arr) ? arr : [];
      }
    } catch (e) { /* ignore */ }
    return [];
  }

  // Build school <option> html from phi data (value = id, data-name holds name)
  function buildSchoolOptionsHtml(includeBlank = true) {
    const schools = getPhiSchools();
    if (!schools.length) return includeBlank ? '<option value="">-- No schools found --</option>' : '';
    const opts = schools.map(s => {
      const id = s.id != null ? String(s.id) : escapeHtml(s.name || "");
      const name = s.name || "(no name)";
      return `<option value="${escapeHtml(id)}" data-name="${escapeHtml(name)}">${escapeHtml(name)}</option>`;
    }).join("");
    return (includeBlank ? '<option value="">-- තෝරන්න --</option>' : '') + opts;
  }

  // small escape helper
  function escapeHtml(s) { return (s+"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  // Main exported open function
  window.openSchoolImmunizationRegister = function (title = "School Immunization Register") {
    const content = document.getElementById("contentArea");
    if (!content) return console.warn("contentArea not found in DOM");

    // Build HTML: note school selects left with placeholder; we'll populate dynamically
    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2>${escapeHtml(title)}</h2>
        <button id="backToRegisters" class="book-btn">Back</button>
      </div>

      <div class="tabs glass" style="padding:12px;">
        <button class="tab-btn active" data-tab="tab1">Student Data</button>
        <button class="tab-btn" data-tab="tab2">Vaccine Data</button>
      </div>

      <div id="tab1" class="tab-content active" style="padding:12px;">
        <form id="form1">
          <label>වර්ෂය:</label>
          <select name="year" id="form1_year">${Array.from({ length: 7 }, (_, i) => 2024 + i).map(y => `<option>${y}</option>`).join("")}</select>

          <label>පාසල:</label>
          <select name="school" id="form1_school">
            ${buildSchoolOptionsHtml(true)}
          </select>

          <label>6 ශ්‍රේණියේ ගැහැණු ළමුන් ගණන:</label><input type="number" name="girls6" min="0" required>
          <label>7 ශ්‍රේණියේ පිරිමි ළමුන් ගණන:</label><input type="number" name="boys7" min="0" required>
          <label>7 ශ්‍රේණියේ ගැහැණු ළමුන් ගණන:</label><input type="number" name="girls7" min="0" required>

          <div style="margin-top:10px;">
            <button type="submit">Save / Update</button>
            <button type="button" id="clear1Btn" style="background:#757575;color:white;">Clear</button>
          </div>
        </form>

        <table id="table1" style="width:100%;margin-top:10px;">
          <thead><tr><th>වර්ෂය</th><th>පාසල</th><th>6 ගැහැණු</th><th>7 පිරිමි</th><th>7 ගැහැණු</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>

      <div id="tab2" class="tab-content" style="padding:12px;display:none;">
        <form id="form2">
          <label>වර්ෂය:</label>
          <select name="year" id="form2_year">${Array.from({ length: 7 }, (_, i) => 2024 + i).map(y => `<option>${y}</option>`).join("")}</select>

          <label>පාසල:</label>
          <select name="school" id="form2_school">
            ${buildSchoolOptionsHtml(true)}
          </select>

          <label>දිනය:</label><input type="date" name="date" required>

          <label>එන්නත් වර්ගය:</label>
          <select name="vaccine" id="vaccineType" required>
            <option value="">-- තෝරන්න --</option>
            <option value="HPV1">HPV1</option><option value="HPV2">HPV2</option><option value="aTd">aTd</option>
          </select>

          <div id="gradeSelector" style="display:none;">
            <label>ශ්‍රේණිය:</label><select name="grade" id="gradeSelect" required></select>
          </div>

          <label>ලබා දුන් ළමුන් ගණන:</label>
          <input type="number" name="count" min="0" required>

          <div style="margin-top:10px;">
            <button type="submit">Save / Update</button>
            <button type="button" id="clear2Btn" style="background:#757575;color:white;">Clear</button>
          </div>
        </form>

        <div style="margin-top:12px;">
          <strong>Filter:</strong>
          <select id="filterYearTable"><option value="">All Years</option>${Array.from({ length: 7 }, (_, i) => 2024 + i).map(y => `<option>${y}</option>`).join("")}</select>

          <select id="filterSchoolTable">
            <option value="">All Schools</option>
            ${buildSchoolOptionsHtml(false)}
          </select>
        </div>

        <table id="table2" style="width:100%;margin-top:10px;">
          <thead><tr><th>දිනය</th><th>වර්ෂය</th><th>පාසල</th><th>එන්නත්</th><th>ශ්‍රේණිය</th><th>ලබා දුන්</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    `;

    // Back button
    const backBtn = document.getElementById("backToRegisters");
    if (backBtn) backBtn.addEventListener("click", () => { if (typeof window.showContent === "function") window.showContent("Registers", null); });

    // Tab switching
    const tabButtons = content.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      tabButtons.forEach(b => {
        const t = document.getElementById(b.dataset.tab);
        if (t) t.classList.remove("active");
      });
      btn.classList.add("active");
      // show the correct content pane
      const allTabs = content.querySelectorAll(".tab-content");
      allTabs.forEach(t => t.style.display = "none");
      const targetId = btn.dataset.tab;
      const target = document.getElementById(targetId);
      if (target) target.style.display = "block";

      // ensure selects up-to-date when switching
      populateSchoolSelects();
      renderTable1();
      renderTable2();
    }));

    // DOM refs & state
    const form1 = document.getElementById("form1");
    const tbody1 = document.querySelector("#table1 tbody");
    const form2 = document.getElementById("form2");
    const tbody2 = document.querySelector("#table2 tbody");
    const filterYearTable = document.getElementById("filterYearTable");
    const filterSchoolTable = document.getElementById("filterSchoolTable");

    let data1 = read1();
    let data2 = read2();
    let selectedIndex1 = null;
    let selectedIndex2 = null;

    // Populate school selects from PHI area data
    function populateSchoolSelects() {
      const schoolHtml = buildSchoolOptionsHtml(true);
      const schoolHtmlNoBlank = buildSchoolOptionsHtml(false);

      const f1 = document.getElementById("form1_school");
      const f2 = document.getElementById("form2_school");
      const ftable = document.getElementById("filterSchoolTable");

      if (f1) {
        // remember previously selected id if any
        const prev = f1.value;
        f1.innerHTML = schoolHtml;
        if (prev) f1.value = prev;
      }
      if (f2) {
        const prev = f2.value;
        f2.innerHTML = schoolHtml;
        if (prev) f2.value = prev;
      }
      if (ftable) {
        const prev = ftable.value;
        // include a blank "All Schools" placeholder + options
        ftable.innerHTML = `<option value="">All Schools</option>` + (schoolHtmlNoBlank || '');
        if (prev) ftable.value = prev;
      }
    }

    // Helper to get selected school's display name from option (fallback to option text)
    function getSelectedSchoolName(selectEl) {
      if (!selectEl) return "";
      const opt = selectEl.options[selectEl.selectedIndex];
      if (!opt) return "";
      // if we stored data-name attribute in option, prefer that
      return opt.dataset && opt.dataset.name ? opt.dataset.name : opt.textContent || "";
    }

    function getSelectedSchoolId(selectEl) {
      if (!selectEl) return "";
      return selectEl.value || "";
    }

    // Form1 submit (Student Data)
    form1.onsubmit = function (e) {
      e.preventDefault();
      const f = e.target;
      const schoolId = getSelectedSchoolId(f.school);
      const schoolName = getSelectedSchoolName(f.school);
      const obj = {
        year: f.year.value,
        schoolId,
        schoolName,
        girls6: Number(f.girls6.value || 0),
        boys7: Number(f.boys7.value || 0),
        girls7: Number(f.girls7.value || 0)
      };
      if (selectedIndex1 !== null) {
        data1[selectedIndex1] = obj;
      } else {
        data1.push(obj);
      }
      write1(data1);
      renderTable1();
      clearForm1();
    };

    function renderTable1() {
      data1 = read1();
      tbody1.innerHTML = data1.map((d, i) =>
        `<tr data-index="${i}"><td>${escapeHtml(d.year||"")}</td><td data-schoolid="${escapeHtml(d.schoolId||"")}">${escapeHtml(d.schoolName||"")}</td><td>${escapeHtml(String(d.girls6||"0"))}</td><td>${escapeHtml(String(d.boys7||"0"))}</td><td>${escapeHtml(String(d.girls7||"0"))}</td></tr>`
      ).join("");

      // row click = edit
      tbody1.querySelectorAll("tr").forEach(row => {
        row.onclick = () => {
          selectedIndex1 = Number(row.dataset.index);
          const d = data1[selectedIndex1];
          form1.year.value = d.year || "";
          // try set school select by id; if id missing, try matching by name
          if (d.schoolId && form1.school.querySelector(`option[value="${d.schoolId}"]`)) form1.school.value = d.schoolId;
          else {
            // fallback: try to find option with matching text
            [...form1.school.options].forEach(opt => { if (opt.textContent.trim() === (d.schoolName||"").trim()) opt.selected = true; });
          }
          form1.girls6.value = d.girls6 || 0;
          form1.boys7.value = d.boys7 || 0;
          form1.girls7.value = d.girls7 || 0;
        };
      });
    }

    function clearForm1() { form1.reset(); selectedIndex1 = null; }

    document.getElementById("clear1Btn").onclick = clearForm1;

    // Form2 (Vaccine) logic
    form2.onsubmit = function (e) {
      e.preventDefault();
      const f = e.target;
      const schoolId = getSelectedSchoolId(f.school);
      const schoolName = getSelectedSchoolName(f.school);
      const obj = {
        year: f.year.value,
        schoolId,
        schoolName,
        date: f.date.value,
        vaccine: f.vaccine.value,
        grade: f.grade ? f.grade.value : "",
        count: Number(f.count.value || 0)
      };
      if (selectedIndex2 !== null) data2[selectedIndex2] = obj;
      else data2.push(obj);
      write2(data2);
      renderTable2();
      clearForm2();
    };

    function renderTable2() {
      data2 = read2();
      const yearF = filterYearTable.value;
      const schoolF = filterSchoolTable.value;
      // filter by school id (value) or year
      const filtered = data2.filter(d =>
        (!yearF || d.year === yearF) && (!schoolF || String(d.schoolId || "") === String(schoolF))
      );
      tbody2.innerHTML = filtered.map((d, i) =>
        `<tr data-index="${i}"><td>${escapeHtml(d.date||"")}</td><td>${escapeHtml(d.year||"")}</td><td>${escapeHtml(d.schoolName||"")}</td><td>${escapeHtml(d.vaccine||"")}</td><td>${escapeHtml(d.grade||"")}</td><td>${escapeHtml(String(d.count||"0"))}</td></tr>`
      ).join("");

      // row click = edit
      tbody2.querySelectorAll("tr").forEach((row, idx) => {
        row.onclick = () => {
          // because filtered list may be subset, find real index in data2 by matching unique fields (date+schoolId+vaccine+grade+count+year)
          const cells = row.querySelectorAll("td");
          const date = cells[0].textContent;
          const year = cells[1].textContent;
          const schoolName = cells[2].textContent;
          const vac = cells[3].textContent;
          const grade = cells[4].textContent;
          const count = Number(cells[5].textContent || 0);

          // find actual index
          const realIndex = data2.findIndex(d => (d.date === date && String(d.schoolName) === schoolName && d.vaccine === vac && String(d.grade) === grade && Number(d.count) === count && d.year === year));
          if (realIndex >= 0) {
            selectedIndex2 = realIndex;
            const d = data2[realIndex];
            form2.year.value = d.year || "";
            // set school select
            if (d.schoolId && form2.school.querySelector(`option[value="${d.schoolId}"]`)) form2.school.value = d.schoolId;
            else { [...form2.school.options].forEach(opt => { if (opt.textContent.trim() === (d.schoolName||"").trim()) opt.selected = true; }); }
            form2.date.value = d.date || "";
            form2.vaccine.value = d.vaccine || "";
            document.getElementById("vaccineType").dispatchEvent(new Event("change"));
            form2.grade.value = d.grade || "";
            form2.count.value = d.count || 0;
          }
        };
      });
    }

    function clearForm2() { form2.reset(); selectedIndex2 = null; document.getElementById("gradeSelector").style.display = "none"; }
    document.getElementById("clear2Btn").onclick = clearForm2;

    // Vaccine -> grade options logic
    const vaccineTypeEl = document.getElementById("vaccineType");
    const gradeSelectEl = document.getElementById("gradeSelect");
    vaccineTypeEl.onchange = function (e) {
      const v = e.target.value;
      const gDiv = document.getElementById("gradeSelector");
      if (!v) { gDiv.style.display = "none"; gradeSelectEl.innerHTML = ""; return; }
      gDiv.style.display = "block";
      gradeSelectEl.innerHTML = v === "aTd"
        ? `<option value="7 පිරිමි">7 පිරිමි</option><option value="7 ගැහැණු">7 ගැහැණු</option>`
        : `<option value="6 ගැහැණු">6 ගැහැණු</option>`;
    };

    // Filters change
    filterYearTable.onchange = renderTable2;
    filterSchoolTable.onchange = renderTable2;

    // Initial populate and render
    populateSchoolSelects();
    renderTable1();
    renderTable2();

    // Also listen for possible changes to PHI area data (someone else added schools) — simple interval check
    // (This is optional but keeps selects fresh if user adds schools via PHI area UI)
    let lastSchoolsSnapshot = JSON.stringify(getPhiSchools().map(s => s.id || s.name));
    setInterval(() => {
      const snap = JSON.stringify(getPhiSchools().map(s => s.id || s.name));
      if (snap !== lastSchoolsSnapshot) {
        lastSchoolsSnapshot = snap;
        populateSchoolSelects();
      }
    }, 2500); // poll every 2.5s (lightweight)

    // small keyboard accessibility: press 's' when focused in content to focus first school select
    content.addEventListener("keydown", (ev) => {
      if (ev.key === "s" && document.activeElement === content) {
        const el = document.getElementById("form1_school");
        if (el) el.focus();
      }
    });
  };

  // automatically expose for other modules (if needed)
  // window.openSchoolImmunizationRegister = window.openSchoolImmunizationRegister; // already set above
})();
