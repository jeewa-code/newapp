// inwardRegister.js (updated layout for full contentArea form + view tab)
// Ensure this file is included after script.js in PHI.html

(function () {
  const STORAGE_KEY = "inwardRegisterEntries_v1";

  function readEntries() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch (e) { return []; }
  }
  function writeEntries(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
  function escapeHtml(s) { return (s+"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  // Build UI with single full-width entry form in first tab, view records in second tab
  function buildUI() {
    const content = document.getElementById("contentArea");
    if (!content) return console.warn("contentArea not found");

    content.innerHTML = `
      <div class="register-page">
        <div class="register-header">
          <h2>Inward Register</h2>
          <div class="register-header-actions">
            <button id="inward_back" class="btn neutral">Back</button>
            <button id="inward_export" class="btn primary">Export CSV (filtered)</button>
          </div>
        </div>

        <div class="register-tabs">
          <button class="tab-btn active" data-tab="tab-entry">Add / Edit Entry</button>
          <button class="tab-btn" data-tab="tab-view">View Records</button>
        </div>

        <div id="tab-entry" class="tab-content active">
          <div class="glass register-form-panel">
            <form id="inwardForm" class="inward-form-grid" autocomplete="off">
              <div class="form-row form-col-2">
                <label for="ir_date">දිනය <span class="req">*</span></label>
                <input id="ir_date" name="date" type="date" required>
              </div>

              <div class="form-row form-col-2">
                <label for="ir_to">යවන්නේ කවරෙකු වෙතද <span class="req">*</span></label>
                <input id="ir_to" name="to" type="text" placeholder="Organization / Person" required>
              </div>

              <div class="form-row form-col-1">
                <label for="ir_subject">කරුණු</label>
                <textarea id="ir_subject" name="subject" rows="4" placeholder="Short subject / summary"></textarea>
              </div>

              <div class="form-row form-col-2">
                <label for="ir_reply_date">පිළිතුරු ලැබුණි නම් එම දිනය</label>
                <input id="ir_reply_date" name="replyDate" type="date">
              </div>

              <div class="form-row form-col-2">
                <label for="ir_action">කිවයුතු කරුණ (Action Required)</label>
                <input id="ir_action" name="actionRequired" type="text" placeholder="Action required, if any">
              </div>

              <div class="form-row form-col-1">
                <label for="ir_file">ලිපි ගොණුවේ නම</label>
                <input id="ir_file" name="fileName" type="text" placeholder="e.g., Letter_2025_001.pdf">
              </div>

              <div class="form-row form-actions" style="grid-column:1 / -1;">
                <button type="submit" class="btn primary" id="saveBtn">Save</button>
                <button type="button" id="inward_clear" class="btn neutral">Clear</button>
                <button type="button" id="inward_new_blank" class="btn" title="Start new entry">New</button>
              </div>
            </form>
          </div>
        </div>

        <div id="tab-view" class="tab-content" style="display:none;">
          <div class="glass register-list-panel">
            <div class="list-controls">
              <input id="filter_search" placeholder="Search to / subject / file name..." type="search">
              <select id="filter_reply">
                <option value="">All (Reply)</option>
                <option value="withReply">Having Reply Date</option>
                <option value="withoutReply">No Reply Date</option>
              </select>

              <label>From <input id="filter_from" type="date"></label>
              <label>To <input id="filter_to" type="date"></label>

              <select id="filter_action">
                <option value="">All (Action)</option>
                <option value="yes">Has Action</option>
                <option value="no">No Action</option>
              </select>

              <button id="btn_refresh" class="btn">Refresh</button>
              <div style="margin-left:auto;font-weight:700;">Records: <span id="inward_count">0</span></div>
            </div>

            <div class="table-wrap">
              <table id="inward_table" class="inward-table">
                <thead>
                  <tr>
                    <th>දිනය</th>
                    <th>යවන්නේ</th>
                    <th>කරුණු</th>
                    <th>පිළිතුරු දිනය</th>
                    <th>Action Required</th>
                    <th>File Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    `;

    // wire tabs
    content.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        content.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        content.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
        btn.classList.add("active");
        const id = btn.dataset.tab;
        const target = document.getElementById(id);
        if (target) {
          target.style.display = "block";
          // when switching to view tab, refresh table
          if (id === "tab-view") renderTable();
        }
      });
    });

    // back button
    document.getElementById("inward_back").addEventListener("click", () => {
      if (typeof window.showContent === "function") window.showContent("Registers", null);
    });

    // export filtered
    document.getElementById("inward_export").addEventListener("click", () => {
      const rows = getFilteredEntries();
      if (!rows.length) return alert("No records to export.");
      const headers = ["Date","To","Subject","ReplyDate","ActionRequired","FileName"];
      const csvRows = [headers.join(",")].concat(rows.map(r => {
        return [r.date, r.to, r.subject, r.replyDate, r.actionRequired, r.fileName]
          .map(c => `"${(c||"").toString().replace(/"/g,'""')}"`).join(",");
      }));
      const blob = new Blob([csvRows.join("\r\n")], {type:"text/csv"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "inward_register_export.csv";
      a.click();
      URL.revokeObjectURL(url);
    });

    // form handling
    const form = document.getElementById("inwardForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {
        id: form.getAttribute("data-edit-id") || uid(),
        date: form.date.value || "",
        to: form.to.value.trim(),
        subject: form.subject.value.trim(),
        replyDate: form.replyDate.value || "",
        actionRequired: form.actionRequired.value.trim(),
        fileName: form.fileName.value.trim()
      };
      if (!data.date || !data.to) {
        alert("දිනය සහ යවන්නේ කවරෙකු වෙත්ද (Date & To) අවශ්‍ය වේ.");
        return;
      }
      const entries = readEntries();
      const idx = entries.findIndex(x => x.id === data.id);
      if (idx >= 0) entries[idx] = data;
      else entries.unshift(data);
      writeEntries(entries);
      form.reset();
      form.removeAttribute("data-edit-id");
      // after save, switch to view tab and refresh
      document.querySelector('.tab-btn[data-tab="tab-view"]').click();
      renderTable();
    });

    document.getElementById("inward_clear").addEventListener("click", () => {
      form.reset();
      form.removeAttribute("data-edit-id");
    });

    document.getElementById("inward_new_blank").addEventListener("click", () => {
      form.reset();
      form.removeAttribute("data-edit-id");
      form.date.focus();
    });

    // view filter wiring
    ['filter_search','filter_reply','filter_from','filter_to','filter_action'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => { /* no immediate action; use refresh */ });
    });
    document.getElementById("btn_refresh").addEventListener("click", renderTable);

    // initial: focus first field
    setTimeout(() => {
      const d = document.getElementById("ir_date");
      if (d) d.focus();
    }, 150);
  } // end buildUI

  function getFilteredEntries() {
    const all = readEntries();
    const q = (document.getElementById("filter_search") && document.getElementById("filter_search").value || "").toLowerCase().trim();
    const replyFilter = document.getElementById("filter_reply") ? document.getElementById("filter_reply").value : "";
    const from = document.getElementById("filter_from") ? document.getElementById("filter_from").value : "";
    const to = document.getElementById("filter_to") ? document.getElementById("filter_to").value : "";
    const actionFilter = document.getElementById("filter_action") ? document.getElementById("filter_action").value : "";

    return all.filter(e => {
      if (q) {
        const hay = (e.to + " " + e.subject + " " + e.fileName).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (replyFilter === "withReply" && !e.replyDate) return false;
      if (replyFilter === "withoutReply" && e.replyDate) return false;
      if (actionFilter === "yes" && !(e.actionRequired && e.actionRequired.trim())) return false;
      if (actionFilter === "no" && (e.actionRequired && e.actionRequired.trim())) return false;
      if (from) {
        const d = e.date ? e.date : "";
        if (!d || d < from) return false;
      }
      if (to) {
        const d = e.date ? e.date : "";
        if (!d || d > to) return false;
      }
      return true;
    });
  }

  function renderTable() {
    const tbody = document.querySelector("#inward_table tbody");
    if (!tbody) return;
    const rows = getFilteredEntries();
    const countEl = document.getElementById("inward_count");
    if (countEl) countEl.textContent = rows.length;
    if (!rows.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:18px;color:#666">No records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = rows.map(r => {
      return `<tr data-id="${escapeHtml(r.id)}">
        <td>${escapeHtml(r.date)}</td>
        <td>${escapeHtml(r.to)}</td>
        <td>${escapeHtml(r.subject||"")}</td>
        <td>${escapeHtml(r.replyDate||"")}</td>
        <td>${escapeHtml(r.actionRequired||"")}</td>
        <td>${escapeHtml(r.fileName||"")}</td>
        <td class="actions">
          <button class="btn small edit" data-id="${escapeHtml(r.id)}">Edit</button>
          <button class="btn small danger del" data-id="${escapeHtml(r.id)}">Delete</button>
        </td>
      </tr>`;
    }).join("");

    // wire edit & delete
    tbody.querySelectorAll("button.edit").forEach(b => {
      b.addEventListener("click", (ev) => {
        const id = ev.currentTarget.dataset.id;
        const entries = readEntries();
        const item = entries.find(x => x.id === id);
        if (!item) return alert("Record not found.");
        const form = document.getElementById("inwardForm");
        form.setAttribute("data-edit-id", item.id);
        form.date.value = item.date || "";
        form.to.value = item.to || "";
        form.subject.value = item.subject || "";
        form.replyDate.value = item.replyDate || "";
        form.actionRequired.value = item.actionRequired || "";
        form.fileName.value = item.fileName || "";
        // switch to entry tab
        document.querySelector('.tab-btn[data-tab="tab-entry"]').click();
        setTimeout(() => document.getElementById("saveBtn").focus(), 120);
      });
    });

    tbody.querySelectorAll("button.del").forEach(b => {
      b.addEventListener("click", (ev) => {
        const id = ev.currentTarget.dataset.id;
        if (!await showConfirm("Delete this record?")) return;
        const filteredOut = readEntries().filter(x => x.id !== id);
        writeEntries(filteredOut);
        renderTable();
      });
    });
  }

  // Expose
  window.openInwardRegister = function () {
    buildUI();
  };

})();
