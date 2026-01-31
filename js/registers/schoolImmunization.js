// schoolImmunization.js (Module)
// Updated: Summary Tab, Enhanced Bulk Update (Batch/Exp), Remarks Integration

import { db, auth } from '../firebase-config.js';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Helper to safely escape HTML
function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return (s + "").replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

// Helper: Ensure PHI Meta loaded
function ensurePhiMetaLoaded(callback) {
  if (typeof window.getPhiMetaSchools === 'function') {
    if (callback) callback();
    return;
  }
  const s = document.createElement('script');
  s.src = 'js/phi/phiMeta.js?v=' + Date.now();
  s.type = 'module';
  s.onload = () => { if (callback) callback(); };
  try { document.body.appendChild(s); } catch (e) { }
}

function getSchoolsFromSource() {
  if (typeof window.getPhiMetaSchools === 'function') {
    try {
      const schools = window.getPhiMetaSchools();
      if (Array.isArray(schools)) return schools;
    } catch (e) { }
  }
  return [];
}

// State
let studentData = [];
let unsubscribe = null;

window.openSchoolImmunizationRegister = function (title = "School Immunization Register") {
  const content = document.getElementById("contentArea");
  if (!content) return console.warn("contentArea not found");

  ensurePhiMetaLoaded();

  const user = auth.currentUser;
  if (!user) {
    content.innerHTML = `<div style="padding:20px; text-align:center; color:red;">Please log in to view this register.</div>`;
    return;
  }

  setupRealtimeListener(user.uid);
  renderStructure(title, content);
};

// --- Firebase Logic ---
function setupRealtimeListener(userId) {
  if (unsubscribe) unsubscribe();

  const colRef = collection(db, `users/${userId}/schoolImmunizationStudents`);
  const q = query(colRef);

  unsubscribe = onSnapshot(q, (snapshot) => {
    const temp = [];
    snapshot.forEach(doc => {
      temp.push({ id: doc.id, ...doc.data() });
    });
    studentData = temp;

    // Refresh valid parts of UI
    renderRegisterTable();
    renderSummary(); // Auto-refresh summary if open
  }, (error) => {
    console.error("Listener Error:", error);
    if (window.showError) window.showError("Sync error: " + error.message);
  });
}

// Save Full Record
async function saveStudentToFirebase(record) {
  const user = auth.currentUser;
  if (!user) return alert("Not logged in");
  try {
    const ref = doc(db, `users/${user.uid}/schoolImmunizationStudents`, record.id);
    await setDoc(ref, record, { merge: true });
    if (window.showSuccess) window.showSuccess("Saved!", "Database");
  } catch (e) {
    console.error(e);
    alert("Save failed: " + e.message);
  }
}

// Update Single Field (Date input)
async function updateStudentField(id, field, value) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const ref = doc(db, `users/${user.uid}/schoolImmunizationStudents`, id);
    await setDoc(ref, { [field]: value }, { merge: true });
  } catch (e) {
    console.error("Update failed", e);
  }
}

async function deleteStudentFromFirebase(id) {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const ref = doc(db, `users/${user.uid}/schoolImmunizationStudents`, id);
    await deleteDoc(ref);
    if (window.showSuccess) window.showSuccess("Deleted.", "Database");
  } catch (e) {
    console.error(e);
    alert("Delete failed.");
  }
}

// --- UI Construction ---
function renderStructure(title, content) {
  const currentSystemYear = new Date().getFullYear();

  const styleId = "si_styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
            .si-date-input::-webkit-calendar-picker-indicator { opacity: 0; position: absolute; right: 0; top: 0; width: 100%; height: 100%; cursor: pointer; }
            .si-date-input { position: relative; }
            .si-row-left { background-color: #ffebee !important; color: #b71c1c; }
            .si-status-tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-left: 5px; }
            .status-left { background: #ffcdd2; color: #c62828; border: 1px solid #ef9a9a; }
            .si-modal { display:none; position:fixed; z-index:9999; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); align-items:center; justify-content:center; }
            .si-modal-content { background:white; padding:20px; border-radius:8px; width:400px; max-width:90%; box-shadow:0 10px 25px rgba(0,0,0,0.2); }
            .si-filter-group { display: flex; flex-direction: column; margin-right:10px; }
            .si-filter-group label { font-size: 11px; font-weight: bold; margin-bottom: 2px; }
            .si-summary-table th, .si-summary-table td { padding: 8px; border: 1px solid #ddd; text-align: center; }
            .si-summary-table th { background: #006064; color: white; }
            .si-remarks-editable { min-width: 200px; padding: 6px 8px; font-size: 11px; white-space: pre-wrap; line-height: 1.6; cursor: text; border-radius: 4px; }
            .si-remarks-editable:hover { background: rgba(0,0,0,0.02); }
            .si-remarks-editable:focus { background: white; outline: 1px solid #2196f3; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        `;
    document.head.appendChild(style);
  }

  content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2>${escapeHtml(title)} <span style="font-size:12px; color:green;">(Live)</span></h2>
        <button id="si_backToRegisters" class="book-btn">Back</button>
      </div>

      <!-- Transfer Modal -->
      <div id="si_transferModal" class="si-modal">
         <div class="si-modal-content">
             <h3>Transfer Student</h3>
             <p style="font-size:13px; color:#666; margin-bottom:15px;">Move student to another school.</p>
             <label style="display:block; margin-bottom:5px;">To School:</label>
             <select id="si_transfer_school" style="width:100%; padding:8px; margin-bottom:12px;"></select>
             <label style="display:block; margin-bottom:5px;">Transfer Year:</label>
             <select id="si_transfer_year" style="width:100%; padding:8px; margin-bottom:15px;">
                 ${buildYearOptions(currentSystemYear)}
             </select>
             <div style="text-align:right;">
                 <button id="si_btn_cancelTransfer" style="padding:8px 15px; margin-right:8px;">Cancel</button>
                 <button id="si_btn_confirmTransfer" style="padding:8px 15px; background:var(--primary); color:white; border:none;">Transfer</button>
             </div>
         </div>
      </div>

      <div class="tabs" style="padding:12px; margin-bottom:15px; background:rgba(255,255,255,0.2); border-radius:10px;">
        <button class="tab-btn active" data-tab="si_tab_entry">Data Entry</button>
        <button class="tab-btn" data-tab="si_tab_view">View Register</button>
        <button class="tab-btn" data-tab="si_tab_summary">Summary of Immunization</button>
      </div>

      <!-- Tab 1: Data Entry -->
      <div id="si_tab_entry" class="tab-content" style="padding:12px; display:block !important;">
        <form id="si_studentForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div style="grid-column: 1 / -1; background: #e3f2fd; padding:10px; border-radius:5px; font-size:0.9em;">
             <strong>Tip:</strong> New students or transfers in should be entered here.
          </div>
          <div style="grid-column: 1 / -1;">
            <label>School | පාසල:</label>
            <select name="school" id="si_input_school" style="width:100%; padding:8px;" required></select>
          </div>
          <div>
             <label>Registration Year | ලියාපදිංචි වර්ෂය:</label>
             <select name="year" id="si_input_year" style="width:100%; padding:8px;">${buildYearOptions(currentSystemYear, currentSystemYear)}</select>
          </div>
          <div style="display:flex; gap:10px;">
             <div style="flex:1;">
               <label>Grade | ශ්‍රේණිය:</label>
               <select name="gradeNo" id="si_input_gradeNo" style="width:100%; padding:8px;" required>${buildGradeOptions()}</select>
             </div>
             <div style="flex:1;">
               <label>Class/Div:</label>
               <input type="text" name="gradeDiv" id="si_input_gradeDiv" placeholder="A, B, C..." style="width:100%; padding:8px;">
             </div>
          </div>
          <div style="grid-column: 1 / -1;">
            <label>Student Name | සිසුවාගේ නම:</label>
            <input type="text" name="name" required style="width:100%; padding:8px;">
          </div>
          <div>
            <label>Sex | ස්ත්‍රී/පුරුෂ පක්ෂය:</label>
            <select name="sex" id="si_input_sex" required style="width:100%; padding:8px;">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
             <label>Status:</label>
             <select name="status" id="si_input_status" style="width:100%; padding:8px;">
                 <option value="Active">Active Student</option>
                 <option value="Left">Left / Transferred Out</option>
             </select>
          </div>
          <div id="si_div_leftYear" style="display:none;">
              <label>Year Left | පාසලෙන් ඉවත් වූ වර්ෂය:</label>
              <input type="number" name="leftYear" id="si_input_leftYear" placeholder="e.g. 2026" style="width:100%; padding:8px;">
          </div>
          <div style="display:none;"><input type="hidden" name="age" id="si_input_age"></div>

          <!-- Pev Vaccination Section -->
          <div style="grid-column: 1 / -1; margin-top:15px; border-top:1px solid #eee; padding-top:10px;">
              <strong style="display:block; margin-bottom:10px; color:#555;">Previous Vaccination History (For Transfers)</strong>
              <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
                  <!-- HPV 1 -->
                  <div style="background:#f9f9f9; padding:8px; border-radius:4px;">
                      <label style="font-size:12px; font-weight:bold;">HPV-1</label>
                      <input type="date" name="hpv1_date" id="si_input_hpv1_date" style="width:100%; padding:5px; margin-bottom:5px; font-size:12px;">
                      <div style="display:flex; align-items:center;">
                          <input type="checkbox" id="si_chk_hpv1_comp" style="margin-right:5px;"> 
                          <label for="si_chk_hpv1_comp" style="font-size:11px; cursor:pointer;">Mark Completed</label>
                      </div>
                  </div>
                  <!-- HPV 2 -->
                  <div style="background:#f9f9f9; padding:8px; border-radius:4px;">
                      <label style="font-size:12px; font-weight:bold;">HPV-2</label>
                      <input type="date" name="hpv2_date" id="si_input_hpv2_date" style="width:100%; padding:5px; margin-bottom:5px; font-size:12px;">
                      <div style="display:flex; align-items:center;">
                          <input type="checkbox" id="si_chk_hpv2_comp" style="margin-right:5px;">
                          <label for="si_chk_hpv2_comp" style="font-size:11px; cursor:pointer;">Mark Completed</label>
                      </div>
                  </div>
                  <!-- aTd -->
                  <div style="background:#f9f9f9; padding:8px; border-radius:4px;">
                      <label style="font-size:12px; font-weight:bold;">aTd</label>
                      <input type="date" name="atd_date" id="si_input_atd_date" style="width:100%; padding:5px; margin-bottom:5px; font-size:12px;">
                      <div style="display:flex; align-items:center;">
                          <input type="checkbox" id="si_chk_atd_comp" style="margin-right:5px;">
                          <label for="si_chk_atd_comp" style="font-size:11px; cursor:pointer;">Mark Completed</label>
                      </div>
                  </div>
              </div>
          </div>

          <div style="grid-column: 1 / -1; margin-top:20px;">
            <button type="submit" style="background:var(--primary); color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer;">Save Student</button>
            <button type="button" id="si_clearFormBtn" style="background:#757575; color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer; margin-left: 10px;">Clear Form</button>
          </div>
        </form>
      </div>

      <!-- Tab 2: View Register -->
      <div id="si_tab_view" class="tab-content" style="padding:12px; display:none !important;">
        <div style="margin-bottom:15px; background:#f9f9f9; padding:10px; border-radius:8px; border:1px solid #ddd;">
            <div style="display:flex; flex-wrap:wrap; gap:15px; align-items:center;">
               <div class="si-filter-group">
                   <label>School:</label>
                   <select id="si_filterSchool" style="padding:5px; min-width:150px;"></select>
               </div>
               <div class="si-filter-group">
                   <label>View Year:</label>
                   <select id="si_filterYear" style="padding:5px; min-width:100px;">${buildYearOptions(currentSystemYear, currentSystemYear)}</select>
               </div>
               <div class="si-filter-group">
                   <label>Grade:</label>
                   <select id="si_filterGrade" style="padding:5px; min-width:100px;">
                      <option value="">All Grades</option>
                      ${buildGradeOptions()}
                   </select>
               </div>
               <div style="flex:1;"></div>
               <div style="display:flex; gap:10px;">
                   <div style="text-align:center; padding:5px 10px; background:white; border:1px solid #ccc; border-radius:5px;">
                      <div style="font-size:14px; font-weight:bold; color:#e91e63;" id="si_val_hpv1">0</div>
                      <div style="font-size:9px; text-transform:uppercase;">HPV-1</div>
                   </div>
                   <div style="text-align:center; padding:5px 10px; background:white; border:1px solid #ccc; border-radius:5px;">
                      <div style="font-size:14px; font-weight:bold; color:#e91e63;" id="si_val_hpv2">0</div>
                      <div style="font-size:9px; text-transform:uppercase;">HPV-2</div>
                   </div>
                   <div style="text-align:center; padding:5px 10px; background:white; border:1px solid #ccc; border-radius:5px;">
                      <div style="font-size:14px; font-weight:bold; color:#2196f3;" id="si_val_atd">0</div>
                      <div style="font-size:9px; text-transform:uppercase;">aTd</div>
                   </div>
                   <div style="text-align:center; padding:5px 10px; background:white; border:1px solid #ccc; border-radius:5px;">
                      <div style="font-size:14px; font-weight:bold; color:teal;" id="si_val_onRoll">0</div>
                      <div style="font-size:9px; text-transform:uppercase;">Total</div>
                   </div>
               </div>
            </div>
        </div>

        <div style="margin-bottom:10px; background:rgba(0,0,0,0.02); padding:10px; border-radius:8px; border:1px solid rgba(0,0,0,0.05);">
             <strong style="font-size:13px; color:#333; display:block; margin-bottom:8px;">Bulk Update & Batch Info:</strong>
             <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:end;">
                <div>
                   <label style="font-size:11px; display:block;">Vaccine Type</label>
                   <select id="si_bulkField" style="padding:5px; border-radius:4px; font-size:12px;">
                        <option value="hpv1">HPV-1</option>
                        <option value="hpv2">HPV-2</option>
                        <option value="atd">aTd</option>
                   </select>
                </div>
                <div>
                    <label style="font-size:11px; display:block;">Date Given</label>
                    <input type="date" id="si_bulkDate" style="padding:5px; border-radius:4px; font-size:12px;">
                </div>
                <div>
                    <label style="font-size:11px; display:block;">Batch No</label>
                    <input type="text" id="si_bulkBatch" placeholder="Batch No" style="padding:5px; width:100px; border-radius:4px; font-size:12px; border:1px solid #ccc;">
                </div>
                <div>
                    <label style="font-size:11px; display:block;">Exp Date</label>
                    <input type="month" id="si_bulkExp" style="padding:5px; border-radius:4px; font-size:12px; border:1px solid #ccc;">
                </div>
                <button id="si_applyBulkBtn" style="padding:6px 15px; background:var(--primary); color:white; border:none; border-radius:4px; font-size:12px; cursor:pointer; margin-bottom:1px;">Apply Update</button>
            </div>
        </div>

        <div style="overflow-x:auto;">
          <table id="si_registerTable" class="report-table" style="width:100%; border-collapse:collapse; min-width:800px;">
            <thead>
              <tr>
                <th rowspan="2" style="border:1px solid #999; padding:5px; background:#d0dbe2; width:30px; text-align:center;"><input type="checkbox" id="si_checkAll" style="cursor:pointer;"></th>
                <th rowspan="2" style="border:1px solid #999; padding:5px; background:#d0dbe2;">No</th>
                <th rowspan="2" style="border:1px solid #999; padding:5px; background:#d0dbe2;">Student Name</th>
                <th rowspan="2" style="border:1px solid #999; padding:5px; background:#d0dbe2;">Age</th>
                <th rowspan="2" style="border:1px solid #999; padding:5px; background:#d0dbe2;">Sex</th>
                <th colspan="3" style="border:1px solid #999; padding:5px; background:#d0dbe2; text-align:center;">Vaccination Dates</th>
                <th rowspan="2" style="border:1px solid #999; padding:5px; background:#d0dbe2;">Remarks</th>
                <th rowspan="2" style="border:1px solid #999; padding:5px; background:#d0dbe2; width:70px;">Action</th>
              </tr>
              <tr>
                <th style="border:1px solid #999; padding:5px; background:#eef;">HPV-1</th>
                <th style="border:1px solid #999; padding:5px; background:#eef;">HPV-2</th>
                <th style="border:1px solid #999; padding:5px; background:#eef;">aTd</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>

      <!-- Tab 3: Summary -->
      <div id="si_tab_summary" class="tab-content" style="padding:12px; display:none !important;">
         <div style="margin-bottom:15px; background:#e0f2f1; padding:10px; border-radius:8px; border:1px solid #b2dfdb;">
            <h3 style="margin-top:0; color:#00695c;">Summary of Immunization</h3>
            <div style="display:flex; flex-wrap:wrap; gap:15px; align-items:center;">
               <div class="si-filter-group">
                   <label>School:</label>
                   <select id="si_sum_school" style="padding:5px; min-width:150px;"></select>
               </div>
               <div class="si-filter-group">
                   <label>Vaccination Year:</label>
                   <select id="si_sum_year" style="padding:5px;">${buildYearOptions(currentSystemYear, currentSystemYear)}</select>
               </div>
               <div class="si-filter-group">
                   <label>Quarter:</label>
                   <select id="si_sum_quarter" style="padding:5px;">
                      <option value="All">All Year</option>
                      <option value="1">1st Quarter (Jan-Mar)</option>
                      <option value="2">2nd Quarter (Apr-Jun)</option>
                      <option value="3">3rd Quarter (Jul-Sep)</option>
                      <option value="4">4th Quarter (Oct-Dec)</option>
                   </select>
               </div>
               <!-- <button id="si_btn_genSummary" style="padding:5px 15px; background:#00796b; color:white; border:none; border-radius:4px; cursor:pointer;">Generate</button> -->
            </div>
         </div>
         
         <div id="si_summary_result">
            <table class="si-summary-table" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Grade</th>
                        <th>Vaccine</th>
                        <th>Batch No</th>
                        <th>Exp Date</th>
                        <th>Quantity (No of Students)</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
         </div>
      </div>
    `;

  bindEvents();
  refreshSchoolSelects();
  switchTab('si_tab_entry');
}

// --- Helpers ---
function buildYearOptions(current, selected) {
  let html = '';
  for (let y = current - 5; y <= current + 5; y++) {
    html += `<option value="${y}" ${y === selected ? 'selected' : ''}>${y}</option>`;
  }
  return html;
}
function buildGradeOptions() {
  let html = '<option value="">Select</option>';
  [6, 7, 8, 9, 10, 11, 12, 13].forEach(g => { html += `<option value="${g}">${g}</option>`; });
  return html;
}
function buildSchoolOptions(includeBlank) {
  let schools = getSchoolsFromSource();
  let html = includeBlank ? '<option value="">-- Select School --</option>' : '';
  if (schools.length === 0 && includeBlank) return html + '<option value="" disabled>No schools found</option>';
  schools.forEach(s => {
    html += `<option value="${escapeHtml(s.name)}">${escapeHtml(s.name)}</option>`;
  });
  return html;
}

// --- Logic ---
let editingId = null;

function bindEvents() {
  document.querySelectorAll(".tab-btn").forEach(btn => btn.onclick = (e) => {
    e.preventDefault();
    switchTab(btn.dataset.tab);
  });

  document.getElementById("si_backToRegisters").onclick = () => {
    if (unsubscribe) unsubscribe();
    if (typeof window.showContent === "function") window.showContent("Registers", null);
  };

  const form = document.getElementById("si_studentForm");
  const statusSelect = document.getElementById("si_input_status");
  if (statusSelect) statusSelect.onchange = () => {
    document.getElementById("si_div_leftYear").style.display = statusSelect.value === 'Left' ? 'block' : 'none';
  };

  document.getElementById("si_input_gradeNo").onchange = function () {
    const g = parseInt(this.value) || 0;
    if (g > 0) document.getElementById("si_input_age").value = g + 5;
  };

  document.getElementById("si_filterSchool").onchange = renderRegisterTable;
  document.getElementById("si_filterYear").onchange = renderRegisterTable;
  document.getElementById("si_filterGrade").onchange = renderRegisterTable;

  // Summary Filters
  document.getElementById("si_sum_school").onchange = renderSummary;
  document.getElementById("si_sum_year").onchange = renderSummary;
  document.getElementById("si_sum_quarter").onchange = renderSummary;

  form.onsubmit = async (e) => {
    e.preventDefault();
    const f = e.target;

    let existing = {};
    if (editingId) existing = studentData.find(s => s.id === editingId) || {};

    // Capture Vaccine Values from Previous History Section
    // Logic: If Date is entered, set as 'Completed' and move Date to Remarks.
    // IF Checkbox is checked, set as 'Completed'.
    // This ensures they are excluded from 'Total' stats (which need valid dates) 
    // but the info is preserved.

    let currentRemarks = existing.remarks || "";

    const processTransferVac = (type) => {
      const dateInp = document.getElementById(`si_input_${type}_date`);
      const chk = document.getElementById(`si_chk_${type}_comp`);

      if (chk.checked) return "Completed";
      if (dateInp.value) {
        // Date Entered -> Move to Remarks, return 'Completed'
        const label = type.toUpperCase().replace('ATD', 'aTd').replace('HPV', 'HPV-');
        const note = `${label} Date: ${dateInp.value} (Transfer)`;

        // Avoid duplicate remarks if editing
        if (!currentRemarks.includes(note)) {
          currentRemarks = currentRemarks ? (currentRemarks + " | " + note) : note;
        }
        return "Completed";
      }

      // If neither, preserve existing or empty
      // Note: If editing, loadForEdit sets inputs. 
      // If user cleared inputs, return empty.
      // But loadForEdit puts existing val into inputs? 
      // See loadForEdit... yes, it populates inputs.
      // So if user specifically CLEARED the date input, we should return "".
      // But wait, if original was "2024-01-01" (normal), loadForEdit puts it in input.
      // If we save now, it becomes "Completed" + Remark? 
      // -> YES, if we are using this form, we are treating it as a "Data Entry / Update" context.
      // But we don't want to convert ALL existing valid dates to Completed+Remark if we just hit Save on an edit.
      // The "Previous Vaccination" section is meant for TRANSFERS.
      // If we are editing a normal student, we might be using this form too.

      // Refined Logic:
      // Ideally, we only apply "Date->Remark" conversion if it's a NEW entry or specifically Transfer?
      // But the user constraint is "Transfer... show as completed".
      // If it's already a valid date in system, maybe leave it alone?
      // But the form inputs are used for both. 

      // Let's assume this specific "Date -> Completed + Remark" logic applies primarily when the user provides a NEW date 
      // in this specific form context which is labeled "Previous Vaccination History".

      // To be safe: If the user enters a date in these inputs, we treat it as "History".
      // Normal daily data entry happens via Bulk Update or Register Table mainly? 
      // No, Register Table is the main way to add "Current" vaccinations for existing students.
      // This "Data Entry" tab is for "New Students or Transfers". 
      // So ANY vaccine data entered here IS effectively "Previous History".
      // So converting to Completed + Remark is correct behavior for this Tab.

      return "Completed";
    };

    // We need to implement getVaccineValue logic inline with Remark updates
    const getVal = (t) => {
      const dateInp = document.getElementById(`si_input_${t}_date`);
      const chk = document.getElementById(`si_chk_${t}_comp`);

      if (chk.checked) return "Completed";
      if (dateInp.value) {
        // CRITICAL FIX: If the date matches what is ALREADY in the database, 
        // do NOT convert it to "Completed". Allow it to remain a valid Date.
        if (existing && existing[t] === dateInp.value) {
          return dateInp.value;
        }

        // Only if it is a NEW value (or changed), treat is as Transfer History (Completed + Remark)
        const label = t.toUpperCase().replace('ATD', 'aTd').replace('HPV', 'HPV-'); // HPV1 -> HPV-1
        const note = `${label}: ${dateInp.value} (Transfer)`;
        if (!currentRemarks.includes(note)) { // Simple check to avoid spam
          currentRemarks = currentRemarks ? (currentRemarks + " | " + note) : note;
        }
        return "Completed";
      }
      return "";
    };

    const record = {
      id: editingId || Date.now().toString(),
      schoolName: f.school.value,
      year: parseInt(f.year.value),
      gradeNo: parseInt(f.gradeNo.value),
      gradeDiv: f.gradeDiv.value.trim().toUpperCase(),
      name: f.name.value,
      age: f.age.value,
      sex: f.sex.value,
      status: f.status.value,
      leftYear: f.leftYear.value ? parseInt(f.leftYear.value) : null,
      hpv1: getVal('hpv1'),
      hpv2: getVal('hpv2'),
      atd: getVal('atd'),
      // Preserve hidden Batch info
      hpv1_batch: existing.hpv1_batch || "", hpv1_exp: existing.hpv1_exp || "",
      hpv2_batch: existing.hpv2_batch || "", hpv2_exp: existing.hpv2_exp || "",
      atd_batch: existing.atd_batch || "", atd_exp: existing.atd_exp || "",
      remarks: currentRemarks
    };

    if (window.showToast) window.showToast("Saving...");
    await saveStudentToFirebase(record);

    f.name.value = "";
    f.name.focus();
    editingId = null;
    form.querySelector("button[type='submit']").textContent = "Save Student";

    // Clear vaccine inputs
    ['hpv1', 'hpv2', 'atd'].forEach(t => {
      document.getElementById(`si_input_${t}_date`).value = '';
      document.getElementById(`si_chk_${t}_comp`).checked = false;
    });
  };

  // Helper to get value from Form OR preserve Existing
  function getVaccineValue(type, existing) {
    // If user interacting with form inputs, use them.
    // But wait, if editing existing student, the form inputs might be empty if we didn't populate them!
    // loadForEdit populates them.

    const dateInp = document.getElementById(`si_input_${type}_date`);
    const chk = document.getElementById(`si_chk_${type}_comp`);

    if (chk.checked) return "Completed";
    if (dateInp.value) return dateInp.value;

    // If neither set in form, keep existing? 
    // If editingId is set, "existing" has the DB data.
    // If the user CLEARED the form inputs, they probably want to clear it?
    // Actually standard behavior: form state reflects desire.
    // If editing, loadForEdit must populate these.
    return "";
  }

  // Listeners for Checkbox vs Date mutual exclusion
  ['hpv1', 'hpv2', 'atd'].forEach(t => {
    const dateInp = document.getElementById(`si_input_${t}_date`);
    const chk = document.getElementById(`si_chk_${t}_comp`);

    dateInp.addEventListener('change', () => { if (dateInp.value) chk.checked = false; });
    chk.addEventListener('change', () => { if (chk.checked) dateInp.value = ''; });
  });

  document.getElementById("si_clearFormBtn").onclick = () => {
    form.reset();
    editingId = null;
    form.querySelector("button[type='submit']").textContent = "Save Student";
    document.getElementById("si_input_year").value = new Date().getFullYear();
    if (statusSelect) { statusSelect.value = "Active"; statusSelect.onchange(); }

    // Clear vacs
    ['hpv1', 'hpv2', 'atd'].forEach(t => {
      document.getElementById(`si_input_${t}_date`).value = '';
      document.getElementById(`si_chk_${t}_comp`).checked = false;
    });
  };

  // Modal
  document.getElementById("si_btn_cancelTransfer").onclick = () => document.getElementById("si_transferModal").style.display = "none";
  document.getElementById("si_btn_confirmTransfer").onclick = executeTransfer;

  // Bulk With Batch
  document.getElementById("si_applyBulkBtn").onclick = async () => {
    const dateVal = document.getElementById("si_bulkDate").value;
    const fieldVal = document.getElementById("si_bulkField").value;
    const batchVal = document.getElementById("si_bulkBatch").value.trim();
    const expVal = document.getElementById("si_bulkExp").value;

    if (!dateVal) return alert("Pick date");
    const checked = document.querySelectorAll(".si-check-row:checked");
    if (checked.length === 0) return alert("Select students");

    const user = auth.currentUser;
    if (!user) return;

    const promises = [];
    checked.forEach(cb => {
      const s = studentData.find(x => x.id === cb.value);
      if (s) {
        if (fieldVal.startsWith('hpv') && s.sex === 'Male') return;

        const ref = doc(db, `users/${user.uid}/schoolImmunizationStudents`, s.id);

        // Updates
        const updates = {};
        updates[fieldVal] = dateVal;

        // Add Batch/Exp to hidden fields
        if (batchVal) updates[fieldVal + '_batch'] = batchVal;
        if (expVal) updates[fieldVal + '_exp'] = expVal;

        // Update Remarks if Batch/Exp present. Format: "HPV-1: Batch No: batch , Exp.date: exp"
        if (batchVal || expVal) {
          const labels = { hpv1: "HPV-1", hpv2: "HPV-2", atd: "aTd" };
          const label = labels[fieldVal] || fieldVal.toUpperCase();

          let details = [];
          if (batchVal) details.push(`Batch No: ${batchVal}`);
          if (expVal) details.push(`Exp.date: ${expVal}`);

          let info = `${label}: ${details.join(" , ")}`;

          let rem = s.remarks || "";

          // Smart Replace
          const safeLabel = label.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          // Regex matches "Label: content" until it sees a newline, a " | " separator, or end of string
          const regex = new RegExp(`${safeLabel}:.*?(?=(?:\\n| \\| |$))`, "g");

          if (regex.test(rem)) {
            rem = rem.replace(regex, info);
          } else {
            rem = rem ? (rem + "\n" + info) : info; // Use newline separator
          }

          updates['remarks'] = rem;
        }

        promises.push(setDoc(ref, updates, { merge: true }));
      }
    });
    await Promise.all(promises);
    if (window.showSuccess) window.showSuccess(`Updated ${promises.length} records`);
  };

  document.getElementById("si_checkAll").onclick = (e) => {
    document.querySelectorAll(".si-check-row").forEach(cb => cb.checked = e.target.checked);
  };

  window.addEventListener("phiMetaSchoolsUpdated", refreshSchoolSelects);
}

function switchTab(id) {
  ["si_tab_entry", "si_tab_view", "si_tab_summary"].forEach(tid => {
    const el = document.getElementById(tid);
    if (el) el.style.setProperty('display', tid === id ? 'block' : 'none', 'important');
  });
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === id));
  if (id === "si_tab_view") renderRegisterTable();
  else if (id === "si_tab_summary") renderSummary();
  else refreshSchoolSelects();
}

function refreshSchoolSelects() {
  const input = document.getElementById("si_input_school");
  const filter = document.getElementById("si_filterSchool");
  const trans = document.getElementById("si_transfer_school");
  const sumSchool = document.getElementById("si_sum_school");

  if (input) input.innerHTML = buildSchoolOptions(true);
  if (filter) filter.innerHTML = `<option value="">All Schools</option>` + buildSchoolOptions(false);
  if (trans) trans.innerHTML = buildSchoolOptions(true);
  if (sumSchool) sumSchool.innerHTML = `<option value="">All Schools</option>` + buildSchoolOptions(false);
}

// --- Summary Logic ---
function renderSummary() {
  const tbody = document.querySelector(".si-summary-table tbody");
  if (!tbody) return;

  const fSchool = document.getElementById("si_sum_school").value;
  const fYear = parseInt(document.getElementById("si_sum_year").value); // Vaccination Year
  const fQuarter = document.getElementById("si_sum_quarter").value;

  // Define Date Range
  let startStr = `${fYear}-01-01`;
  let endStr = `${fYear}-12-31`;

  if (fQuarter !== "All") {
    if (fQuarter === "1") { endStr = `${fYear}-03-31`; }
    else if (fQuarter === "2") { startStr = `${fYear}-04-01`; endStr = `${fYear}-06-30`; }
    else if (fQuarter === "3") { startStr = `${fYear}-07-01`; endStr = `${fYear}-09-30`; }
    else if (fQuarter === "4") { startStr = `${fYear}-10-01`; }
  }

  const startDate = new Date(startStr);
  const endDate = new Date(endStr);

  // Accumulator: Key -> Count
  // Key: School | Grade | Vaccine | Batch | Exp
  const stats = {};

  studentData.forEach(s => {
    if (fSchool && s.schoolName !== fSchool) return;

    // Calc Grade at Vaccination Year
    // If s.year is RegYear, s.gradeNo is RegGrade
    // GradeInVacYear = s.gradeNo + (VacYear - s.year)
    const vacGrade = s.gradeNo + (fYear - s.year);
    // Only consider if reasonably valid?

    ['hpv1', 'hpv2', 'atd'].forEach(vType => {
      const dStr = s[vType];
      if (!dStr) return;
      const d = new Date(dStr);

      if (d >= startDate && d <= endDate) {
        // Determine Batch/Exp
        // We prefer the hidden fields s.hpv1_batch, but if missing, mark as Unknown or parse remarks?
        // Stick to hidden fields for reliability
        const batch = s[vType + '_batch'] || "Unknown";
        const exp = s[vType + '_exp'] || "-";

        const key = `${dStr}||${vacGrade}||${vType.toUpperCase()}||${batch}||${exp}`;

        if (!stats[key]) stats[key] = 0;
        stats[key]++;
      }
    });
  });

  // Render
  const rows = Object.keys(stats).sort().map(k => {
    const [dateVal, grade, vac, batch, exp] = k.split('||');
    const count = stats[k];
    return `<tr>
            <td>${dateVal}</td>
            <td>${grade}</td>
            <td>${vac}</td>
            <td>${escapeHtml(batch)}</td>
            <td>${escapeHtml(exp)}</td>
            <td style="font-weight:bold;">${count}</td>
        </tr>`;
  }).join("");

  if (!rows) tbody.innerHTML = `<tr><td colspan="6" style="padding:15px; color:#777;">No immunizations found for the selected period.</td></tr>`;
  else tbody.innerHTML = rows;
}

// --- Register Table ---
function renderRegisterTable() {
  const tbody = document.querySelector("#si_registerTable tbody");
  if (!tbody) return;

  const fSchool = document.getElementById("si_filterSchool").value;
  const fYear = parseInt(document.getElementById("si_filterYear").value);
  const fGrade = document.getElementById("si_filterGrade").value;

  let activeCount = 0;
  let tHpv1 = 0;
  let tHpv2 = 0;
  let tAtd = 0;

  const filtered = studentData.filter(s => {
    if (fSchool && s.schoolName !== fSchool) return false;
    if (s.year > fYear) return false;

    const projGrade = s.gradeNo + (fYear - s.year);
    s.projectedAge = projGrade + 5;
    if (fGrade && projGrade !== parseInt(fGrade)) return false;

    s.isLeft = (s.status === 'Left' && s.leftYear && fYear >= s.leftYear);
    const isActive = !s.isLeft;

    if (isActive) activeCount++;

    // Calculate Targets for View Context
    // HPV-1 Target (Gr 6, Catchup 7)
    if (s.sex === 'Female' && (projGrade === 6 || projGrade === 7)) {
      let include = false;
      if (isActive) {
        // Include unless Completed via Transfer
        if (s.hpv1 !== 'Completed') include = true;
      } else {
        // Left: Include (if present during this year)
        // Logic: isLeft true means they left THIS year or later. So they were present.
        // If they left BEFORE this year, they are excluded by filter above?
        // "fYear >= s.leftYear" checks if Left happened in past/present.
        // Wait, "isLeft" definition: (s.status === 'Left' && s.leftYear && fYear >= s.leftYear)
        // This means "Is currently Left Status in reference to fYear".
        // If leftYear (2025) > fYear (2024), they are ACTIVE in 2024.
        // If leftYear (2023) <= fYear (2024), they are LEFT in 2024.
        // So isActive handles the "Were they here?" logic mainly.
        // But specific request: If Left, HPV1 Target STAYS (Include). HPV2 REMOVE (Exclude).
        include = true; // For Left students
      }

      // Catchup Rule: If Gr 7, Only include if not done? 
      if (projGrade === 7 && s.hpv1) include = false; // Simple catchup rule (if done, not target)

      if (include) tHpv1++;
    }

    // HPV-2 Target (Gr 6, Catchup 7)
    if (s.sex === 'Female' && (projGrade === 6 || projGrade === 7)) {
      let includeHpv2 = false;
      if (isActive) {
        if (s.hpv2 !== 'Completed') includeHpv2 = true;
      }

      // Catchup Rule for Gr 7
      if (projGrade === 7) {
        // Include if NOT done (s.hpv2 is falsy). 
        // If they have a date or 'Completed', exclude.
        if (s.hpv2) includeHpv2 = false;
      }

      if (includeHpv2) tHpv2++;
    }

    // aTd Target (Gr 7)
    if (projGrade === 7) {
      if (isActive) {
        if (s.atd !== 'Completed') tAtd++;
      }
      // If Left, Exclude (do nothing)
    }

    return true;
  });

  document.getElementById("si_val_onRoll").textContent = activeCount;
  document.getElementById("si_val_hpv1").textContent = tHpv1;
  document.getElementById("si_val_hpv2").textContent = tHpv2;
  document.getElementById("si_val_atd").textContent = tAtd;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:10px; color:#999;">No records found for this year filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((s, i) => {
    const isMale = s.sex === 'Male';
    const rowClass = s.isLeft ? 'si-row-left' : '';
    const statusHtml = s.isLeft ? `<span class="si-status-tag status-left">Left ${s.leftYear}</span>` : '';

    return `
        <tr class="${rowClass}">
            <td style="border:1px solid #ccc; padding:5px; text-align:center;"><input type="checkbox" class="si-check-row" value="${s.id}"></td>
            <td style="border:1px solid #ccc; padding:5px; text-align:center;">${i + 1}</td>
            <td style="border:1px solid #ccc; padding:5px;">${escapeHtml(s.name)} ${statusHtml}</td>
            <td style="border:1px solid #ccc; padding:5px; text-align:center;">${s.projectedAge}</td>
            <td style="border:1px solid #ccc; padding:5px; text-align:center;">${s.sex}</td>
            <td style="border:1px solid #ccc; padding:5px; text-align:center;">
                ${isMale ? '-' : renderVaccineCell(s, 'hpv1')}
            </td>
            <td style="border:1px solid #ccc; padding:5px; text-align:center;">
                ${isMale ? '-' : renderVaccineCell(s, 'hpv2')}
            </td>
            <td style="border:1px solid #ccc; padding:5px; text-align:center;">
                ${renderVaccineCell(s, 'atd')}
            </td>
            <td style="border:1px solid #ccc; padding:2px;">
                <div class="si-remarks-editable" contenteditable="true" data-id="${s.id}" data-field="remarks">${escapeHtml(s.remarks).replace(/\n/g, "<br>").replace(/ \| /g, "<br>")}</div>
            </td>
            <td style="border:1px solid #ccc; padding:5px; text-align:center;">
                <button class="edit-btn" data-id="${s.id}" style="color:blue;border:none;background:none;cursor:pointer;"><i class="fas fa-edit"></i></button>
                <button class="trans-btn" data-id="${s.id}" style="color:orange;border:none;background:none;cursor:pointer;"><i class="fas fa-exchange-alt"></i></button>
                <button class="del-btn" data-id="${s.id}" style="color:red;border:none;background:none;cursor:pointer;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>`;
  }).join("");

  // Attach Listeners
  tbody.querySelectorAll(".si-date-input").forEach(inp => {
    inp.onchange = (e) => updateStudentField(inp.dataset.id, inp.dataset.field, inp.value);
  });
  tbody.querySelectorAll(".si-remarks-editable").forEach(el => {
    el.onblur = (e) => updateStudentField(el.dataset.id, el.dataset.field, el.innerText);
  });
  tbody.querySelectorAll(".edit-btn").forEach(b => b.onclick = () => loadForEdit(b.dataset.id));
  tbody.querySelectorAll(".trans-btn").forEach(b => b.onclick = () => promptTransfer(b.dataset.id));
  tbody.querySelectorAll(".del-btn").forEach(b => b.onclick = () => {
    if (confirm("Are you sure?")) deleteStudentFromFirebase(b.dataset.id);
  });
}

function loadForEdit(id) {
  const s = studentData.find(x => x.id === id);
  if (!s) return;
  editingId = s.id;
  const form = document.getElementById("si_studentForm");
  switchTab("si_tab_entry");
  document.getElementById("si_input_school").value = s.schoolName;
  form.year.value = s.year;
  form.gradeNo.value = s.gradeNo;
  form.gradeDiv.value = s.gradeDiv;
  form.name.value = s.name;
  form.sex.value = s.sex;
  form.status.value = s.status || "Active";
  form.status.onchange();
  form.leftYear.value = s.leftYear || "";
  form.querySelector("button[type='submit']").textContent = "Update Student";

  // Populate Vaccine Fields in Form
  ['hpv1', 'hpv2', 'atd'].forEach(t => {
    const val = s[t];
    const dateInp = document.getElementById(`si_input_${t}_date`);
    const chk = document.getElementById(`si_chk_${t}_comp`);

    if (val === 'Completed') {
      chk.checked = true;
      dateInp.value = '';
    } else if (val) {
      chk.checked = false;
      dateInp.value = val;
    } else {
      chk.checked = false;
      dateInp.value = '';
    }
  });
}

function renderVaccineCell(s, field) {
  // If student is Left, do not allow editing
  if (s.isLeft) {
    // If there is a value (e.g. they got it before leaving), show it. If not, show blank.
    const val = s[field];
    if (val === 'Completed') return `<span style="font-size:10px; color:green; font-weight:bold;">Completed</span>`;
    if (val) return `<span style="font-size:11px; color:#555;">${val}</span>`;
    return `<span style="color:#aaa;">-</span>`;
  }

  const val = s[field];
  if (val === 'Completed') {
    // Render simple text/badge. Double click (or fallback) could clear it?
    // Let's add an 'x' to clear small
    return `
            <div style="display:flex; justify-content:center; align-items:center;">
                <span style="background:#4caf50; color:white; font-size:10px; padding:2px 6px; border-radius:10px;">Completed</span>
                <button onclick="updateStudentField('${s.id}', '${field}', '')" style="margin-left:5px; border:none; background:transparent; color:#999; cursor:pointer; font-size:10px;" title="Clear">✖</button>
            </div>
        `;
  }
  // Else render date input
  return `<input type="date" class="si-date-input" data-id="${s.id}" data-field="${field}" value="${val || ''}" style="border:none;background:transparent;width:110px;">`;
}

let transferId = null;
function promptTransfer(id) {
  transferId = id;
  document.getElementById("si_transferModal").style.display = "flex";
  // Set default year to current year
  document.getElementById("si_transfer_year").value = new Date().getFullYear();
}
async function executeTransfer() {
  if (!transferId) return;
  const school = document.getElementById("si_transfer_school").value;
  const year = parseInt(document.getElementById("si_transfer_year").value);
  if (!school) return alert("Select School");

  const s = studentData.find(x => x.id === transferId);
  if (!s) return;

  // Mark old as Left
  await saveStudentToFirebase({ id: s.id, status: 'Left', leftYear: year });

  // Create new
  let newRemarks = `Transferred from ${s.schoolName} (${s.year})`;
  if (s.remarks) newRemarks += " | " + s.remarks;

  // Helper to process vaccine transfer
  const processVacTransfer = (val, type) => {
    if (!val) return "";
    if (val === "Completed") return "Completed";

    // If it's a date "YYYY-MM-DD"
    // We convert it to "Completed" and add to remarks
    const label = type.toUpperCase().replace('ATD', 'aTd').replace('HPV', 'HPV-');
    const note = `${label} Date: ${val} (Transfer)`;

    if (!newRemarks.includes(note)) {
      newRemarks += " | " + note;
    }
    return "Completed";
  };

  const newRec = {
    id: Date.now().toString(),
    schoolName: school, year: year, gradeNo: s.gradeNo + (year - s.year),
    gradeDiv: s.gradeDiv, name: s.name, age: s.age, sex: s.sex,
    status: "Active", leftYear: null,
    hpv1: processVacTransfer(s.hpv1, 'hpv1'),
    hpv2: processVacTransfer(s.hpv2, 'hpv2'),
    atd: processVacTransfer(s.atd, 'atd'),
    hpv1_batch: s.hpv1_batch || "", hpv1_exp: s.hpv1_exp || "",
    hpv2_batch: s.hpv2_batch || "", hpv2_exp: s.hpv2_exp || "",
    atd_batch: s.atd_batch || "", atd_exp: s.atd_exp || "",
    remarks: newRemarks
  };
  await saveStudentToFirebase(newRec);
  document.getElementById("si_transferModal").style.display = "none";
}

