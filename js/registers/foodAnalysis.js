/* js/registers/foodAnalysis.js
   Food Analysis Register module - Filters + S/N
   - Adds S/N column
   - Adds filters: Year, Type, Report Nature
   - Keeps top horizontal scroller, action buttons working
   - No Created At column, no Clear All button
*/

(function () {
  "use strict";

  const STORAGE_KEY = "foodAnalysisEntries";

  function getEntries() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries || []));
  }

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
      else if (k === "dataset" && typeof v === "object") Object.entries(v).forEach(([dk, dv]) => node.dataset[dk] = dv);
      else if (k === "checked") node.checked = !!v;
      else try { node.setAttribute(k, v); } catch (e) {}
    }
    children.flat().forEach(c => {
      if (c === null || c === undefined) return;
      if (typeof c === "string" || typeof c === "number") node.appendChild(document.createTextNode(c));
      else node.appendChild(c);
    });
    return node;
  }

  function field(labelText, control) {
    const wrap = el("div", { style: "margin-bottom:8px;" });
    wrap.appendChild(el("label", { style: "display:block;font-weight:600;margin-bottom:6px;color:#222;" }, labelText));
    wrap.appendChild(control);
    return wrap;
  }

  function safe(v) { return v === undefined || v === null ? "" : v; }

  // --- Utilities for filter options ---
  function extractYears(entries) {
    const years = new Set();
    entries.forEach(e => {
      if (e.date) {
        const y = (new Date(e.date)).getFullYear();
        if (!isNaN(y)) years.add(y);
      }
    });
    return Array.from(years).sort((a,b)=>b-a);
  }

  function uniqueValues(entries, key) {
    const s = new Set();
    entries.forEach(e => { if (e[key]) s.add(e[key]); });
    return Array.from(s).sort();
  }

  // --- Main render UI ---
  function renderUI(title) {
    const content = document.getElementById("contentArea") || document.body;
    content.innerHTML = "";

    // header & back
    const header = el("div", { style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;" },
      el("h2", {}, title || "Food Analysis Register"),
      el("div", {},
        el("button", {
          style: "background:var(--primary);color:#fff;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;"
        , onclick: () => { if (typeof window.showContent === "function") window.showContent("Registers", null); }
        }, "Back")
      )
    );
    content.appendChild(header);

    // tabs
    const tabs = el("div", { style: "display:flex;gap:8px;margin-bottom:12px;" },
      el("button", { id: "fa_tab_entry", class: "tab active", style: "padding:8px 12px;border-radius:8px;border:1px solid #ddd;cursor:pointer;" }, "Entry Form"),
      el("button", { id: "fa_tab_view", class: "tab", style: "padding:8px 12px;border-radius:8px;border:1px solid #ddd;cursor:pointer;" }, "View Records")
    );
    content.appendChild(tabs);

    // form container
    const formWrap = el("div", { id: "fa_form_wrap", style: "background:#fff;padding:14px;border-radius:8px;box-shadow:0 1px 4px rgba(0,0,0,0.06);" });

    // form
    const form = el("form", { id: "fa_form" });
    const grid = el("div", { style: "display:grid;grid-template-columns:repeat(2,1fr);gap:12px;" });

    grid.appendChild(field("දිනය -", el("input", { type: "date", id: "fa_date", style: "width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;" })));

    const radioWrap = el("div", { style: "display:flex;gap:8px;align-items:center;margin-top:6px;" },
      el("label", {}, el("input", { type: "radio", name: "fa_sample_status", value: "සාම්පල්", checked: true }), " සාම්පල්"),
      el("label", {}, el("input", { type: "radio", name: "fa_sample_status", value: "අත්අඩංගු" }), " අත්අඩංගු")
    );
    grid.appendChild(field("සාම්පල් / අත්අඩංගු -", radioWrap));

    const typeSel = el("select", { id: "fa_type", style: "width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;" },
      el("option", { value: "විධිමත් රසායනවේදී" }, "විධිමත් රසායනවේදී"),
      el("option", { value: "අවිධිමත් රසායනවේදී" }, "අවිධිමත් රසායනවේදී"),
      el("option", { value: "විධිමත් බැක්ටීරියානුවේදී" }, "විධිමත් බැක්ටීරියානුවේදී"),
      el("option", { value: "අවිධිමත් බැක්ටීරියානුවේදී" }, "අවිධිමත් බැක්ටීරියานุ වැේදී")
    );
    grid.appendChild(field("වර්ගය -", typeSel));

    // nature without placeholder
    grid.appendChild(field("ද්‍රව්‍යයේ ස්වභාවය -", el("input", { id: "fa_nature", type: "text", style: "width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;" })));

    const sampleCountSel = el("select", { id: "fa_sample_count", style: "width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;" },
      el("option", { value: "1" }, "1"),
      el("option", { value: "2" }, "2"),
      el("option", { value: "3" }, "3")
    );
    grid.appendChild(field("ලබාගත් සාම්පල් ගණන -", sampleCountSel));

    grid.appendChild(field("ලබා ගත්තේ කාගෙන්ද -", el("input", { id: "fa_from_whom", type: "text", style: "width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;" })));
    grid.appendChild(field("ස්ථානය -", el("input", { id: "fa_location", type: "text", style: "width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;" })));
    grid.appendChild(field("ව්‍යාපාර හිමිකරුගේ නම -", el("input", { id: "fa_owner", type: "text", style: "width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;" })));

    grid.appendChild(field("රසපරීක්‍ෂක වෙත යැවූ දිනය -", el("input", { id: "fa_sent_date", type: "date", style: "width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;" })));
    grid.appendChild(field("රසපරීක්‍ෂක වාර්තාවේ යොමු අංකය -", el("input", { id: "fa_ref_no", type: "text", style: "width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;" })));
    grid.appendChild(field("රසපරීක්‍ෂක වාර්තාව ලැබුණු දිනය -", el("input", { id: "fa_received_date", type: "date", style: "width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;" })));
    grid.appendChild(field("වාර්තාවේ ස්වභාවය -", el("input", { id: "fa_report_nature", type: "text", style: "width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;" })));

    grid.appendChild(field("ගත ක්‍රියාමාර්ග -", el("textarea", { id: "fa_actions", rows: 2, style: "width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;" })));
    grid.appendChild(field("වෙනත් කරුණු -", el("textarea", { id: "fa_remarks", rows: 2, style: "width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;" })));
    grid.appendChild(field("නඩුවේ තීන්දුව -", el("input", { id: "fa_case_decision", type: "text", style: "width:100%;padding:8px;border:1px solid #ccc;border-radius:6px;" })));

    form.appendChild(grid);

    const btnRow = el("div", { style: "display:flex;gap:10px;margin-top:12px;" },
      el("button", { type: "submit", style: "background:var(--primary);color:#fff;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;" }, "Save"),
      el("button", { type: "button", id: "fa_reset", style: "background:#ccc;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;" }, "Reset"),
      el("button", { type: "button", id: "fa_view_btn", style: "margin-left:auto;background:var(--accent);color:#fff;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;" }, "View Records")
    );
    form.appendChild(btnRow);

    formWrap.appendChild(form);
    content.appendChild(formWrap);

    // --- View area: filters + top scroller + table wrapper
    const viewWrap = el("div", { id: "fa_view_wrap", style: "display:none;margin-top:12px;" });
    content.appendChild(viewWrap);

    const tabEntry = document.getElementById("fa_tab_entry");
    const tabView = document.getElementById("fa_tab_view");
    tabEntry.addEventListener("click", () => { tabEntry.classList.add("active"); tabView.classList.remove("active"); formWrap.style.display = ""; viewWrap.style.display = "none"; });
    tabView.addEventListener("click", () => { tabEntry.classList.remove("active"); tabView.classList.add("active"); formWrap.style.display = "none"; viewWrap.style.display = ""; renderTable(); });

    document.getElementById("fa_view_btn").addEventListener("click", () => tabView.click());
    document.getElementById("fa_reset").addEventListener("click", () => { form.reset(); const r = form.querySelector('input[name="fa_sample_status"][value="සාම්පල්"]'); if (r) r.checked = true; });

    // form submit
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const entry = {
        id: form.dataset.editId || "fa_" + Date.now(),
        date: safe(document.getElementById("fa_date").value),
        sample_status: safe((form.querySelector('input[name="fa_sample_status"]:checked') || {}).value),
        type: safe(document.getElementById("fa_type").value),
        nature: safe(document.getElementById("fa_nature").value),
        sample_count: safe(document.getElementById("fa_sample_count").value),
        from_whom: safe(document.getElementById("fa_from_whom").value),
        location: safe(document.getElementById("fa_location").value),
        owner: safe(document.getElementById("fa_owner").value),
        sent_date: safe(document.getElementById("fa_sent_date").value),
        ref_no: safe(document.getElementById("fa_ref_no").value),
        received_date: safe(document.getElementById("fa_received_date").value),
        report_nature: safe(document.getElementById("fa_report_nature").value),
        actions_taken: safe(document.getElementById("fa_actions").value),
        remarks: safe(document.getElementById("fa_remarks").value),
        case_decision: safe(document.getElementById("fa_case_decision").value)
      };

      const entries = getEntries();
      const idx = entries.findIndex(it => it.id === entry.id);
      if (idx >= 0) entries[idx] = entry; else entries.unshift(entry);
      saveEntries(entries);

      delete form.dataset.editId;
      form.reset();
      const r = form.querySelector('input[name="fa_sample_status"][value="සාම්පල්"]');
      if (r) r.checked = true;

      tabView.click();
    });
  }

  // Render table with filters and S/N
  function renderTable() {
    const viewWrap = document.getElementById("fa_view_wrap");
    if (!viewWrap) return;
    viewWrap.innerHTML = "";

    const entries = getEntries();

    // FILTER BAR (Year, Type, Report Nature)
    const filterBar = el("div", { style: "display:flex;gap:10px;align-items:center;margin-bottom:8px;flex-wrap:wrap;" });

    // Year select (options from entries)
    const yearSel = el("select", { id: "fa_filter_year", style: "padding:8px;border:1px solid #ccc;border-radius:6px;" },
      el("option", { value: "" }, "All Years")
    );
    extractYears(entries).forEach(y => yearSel.appendChild(el("option", { value: y }, y)));

    // Type select (options fixed + dynamic)
    const typeSel = el("select", { id: "fa_filter_type", style: "padding:8px;border:1px solid #ccc;border-radius:6px;" },
      el("option", { value: "" }, "All Types")
    );
    // include static options + any additional from entries
    const staticTypes = ["විධිමත් රසායනවේදී", "අවිධිමත් රසායනවේදී", "විධිමත් බැක්ටීරියානුවේදී", "අවිධිමත් බැක්ටීරියානුවේදී"];
    staticTypes.forEach(t => typeSel.appendChild(el("option", { value: t }, t)));
    uniqueValues(entries, "type").forEach(t => { if (!staticTypes.includes(t)) typeSel.appendChild(el("option", { value: t }, t)); });

    // Report nature select
    const reportSel = el("select", { id: "fa_filter_report", style: "padding:8px;border:1px solid #ccc;border-radius:6px;" },
      el("option", { value: "" }, "All Report Natures")
    );
    uniqueValues(entries, "report_nature").forEach(r => reportSel.appendChild(el("option", { value: r }, r)));

    const applyBtn = el("button", { type: "button", style: "background:var(--primary);color:#fff;padding:8px 12px;border:none;border-radius:6px;cursor:pointer;" }, "Apply");
    const resetBtn = el("button", { type: "button", style: "background:#ccc;color:#000;padding:8px 12px;border:none;border-radius:6px;cursor:pointer;" }, "Reset");

    filterBar.appendChild(el("div", {}, el("strong", {}, "Filters: "), " ")); // label
    filterBar.appendChild(yearSel);
    filterBar.appendChild(typeSel);
    filterBar.appendChild(reportSel);
    filterBar.appendChild(applyBtn);
    filterBar.appendChild(resetBtn);

    viewWrap.appendChild(filterBar);

    // top scroller
    const topScroller = el("div", { id: "fa_table_top_scroller", style: "overflow-x:auto;overflow-y:hidden;height:18px;margin-bottom:6px;" },
      el("div", { id: "fa_top_inner", style: "height:1px;width:1px;" })
    );
    viewWrap.appendChild(topScroller);

    // table wrapper
    const tableWrapper = el("div", { id: "fa_table_wrapper", style: "overflow-y:auto;overflow-x:hidden;max-height:420px;border-radius:6px;border:1px solid #eaeaea;background:#fff;" });
    viewWrap.appendChild(tableWrapper);

    // Build table (wider width to allow horizontal scroll)
    const table = el("table", { id: "fa_table", style: "width:1400px;border-collapse:collapse;" });
    const thead = el("thead", {},
      el("tr", {},
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;width:60px;" }, "S/N"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;" }, "දිනය"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;" }, "සාම්පල්/අත්අඩංගු"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;" }, "වර්ගය"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;" }, "ද්‍රව්‍ය ස්වභාවය"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;width:90px;" }, "සාම්පල් ගණන"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;" }, "ලබා ගත්තේ"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;" }, "ස්ථානය"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;" }, "ව්‍යාපාර හිමිකරු"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;" }, "යැවූ දිනය"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;" }, "Ref No"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;" }, "ලැබුන දිනය"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;" }, "වාර්තාවේ ස්වභාවය"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;" }, "ගත් ක්‍රියාමාර්ග"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;" }, "වෙනත් කරුණු"),
        el("th", { style: "padding:8px;border-bottom:1px solid #eee;text-align:left;white-space:nowrap;width:160px;" }, "Actions")
      )
    );
    table.appendChild(thead);

    const tbody = el("tbody", {});
    // Filtering function
    function applyFiltersToEntries() {
      const y = document.getElementById("fa_filter_year").value;
      const t = document.getElementById("fa_filter_type").value;
      const r = document.getElementById("fa_filter_report").value;

      return entries.filter(entry => {
        // year filter
        if (y) {
          const yr = entry.date ? (new Date(entry.date)).getFullYear().toString() : "";
          if (yr !== y) return false;
        }
        if (t) {
          if ((entry.type || "") !== t) return false;
        }
        if (r) {
          if ((entry.report_nature || "") !== r) return false;
        }
        return true;
      });
    }

    function populateTableRows(filtered) {
      tbody.innerHTML = "";
      // S/N: 1..n for visible rows
      filtered.forEach((entry, index) => {
        const tr = el("tr", {},
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;white-space:nowrap;text-align:right;padding-right:12px;" }, (index + 1).toString()),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;white-space:nowrap;" }, safe(entry.date)),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;white-space:nowrap;" }, safe(entry.sample_status)),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;white-space:nowrap;" }, safe(entry.type)),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;" }, safe(entry.nature)),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;white-space:nowrap;text-align:center;" }, safe(entry.sample_count)),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;" }, safe(entry.from_whom)),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;" }, safe(entry.location)),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;" }, safe(entry.owner)),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;white-space:nowrap;" }, safe(entry.sent_date)),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;white-space:nowrap;" }, safe(entry.ref_no)),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;white-space:nowrap;" }, safe(entry.received_date)),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;" }, safe(entry.report_nature)),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;" }, safe(entry.actions_taken)),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;" }, safe(entry.remarks)),
          el("td", { style: "padding:8px;border-bottom:1px solid #f1f1f1;vertical-align:top;" },
            el("button", { type: "button", style: "margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#f0f0f0;", onclick: () => viewEntry(entry.id) }, "View"),
            el("button", { type: "button", style: "margin-right:6px;padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ffd54f;", onclick: () => editEntry(entry.id) }, "Edit"),
            el("button", { type: "button", style: "padding:6px 8px;border-radius:6px;border:none;cursor:pointer;background:#ef9a9a;", onclick: () => { if (!confirm('Delete this record?')) return; deleteEntry(entry.id); refreshAfterDelete(); } }, "Delete")
          )
        );
        tbody.appendChild(tr);
      });
    }

    // initial populate
    const filteredInitial = applyFiltersToEntries();
    populateTableRows(filteredInitial);

    table.appendChild(tbody);
    tableWrapper.appendChild(table);

    // sync top scroller
    setTimeout(() => {
      const topInner = document.getElementById("fa_top_inner");
      const tbl = document.getElementById("fa_table");
      const tableWrapperEl = document.getElementById("fa_table_wrapper");
      const topScrollerEl = document.getElementById("fa_table_top_scroller");
      if (!tbl || !topInner || !tableWrapperEl || !topScrollerEl) return;

      topInner.style.width = tbl.scrollWidth + "px";

      topScrollerEl.addEventListener("scroll", function () {
        tableWrapperEl.scrollLeft = topScrollerEl.scrollLeft;
      });
      tableWrapperEl.addEventListener("scroll", function () {
        topScrollerEl.scrollLeft = tableWrapperEl.scrollLeft;
      });
      window.addEventListener("resize", () => { topInner.style.width = tbl.scrollWidth + "px"; });
    }, 40);

    // Filter apply/reset handlers
    applyBtn.addEventListener("click", () => {
      const filtered = applyFiltersToEntries();
      populateTableRows(filtered);
      // reset top scroller left
      const topScrollerEl = document.getElementById("fa_table_top_scroller");
      const tableWrapperEl = document.getElementById("fa_table_wrapper");
      if (topScrollerEl) topScrollerEl.scrollLeft = 0;
      if (tableWrapperEl) tableWrapperEl.scrollLeft = 0;
    });

    resetBtn.addEventListener("click", () => {
      document.getElementById("fa_filter_year").value = "";
      document.getElementById("fa_filter_type").value = "";
      document.getElementById("fa_filter_report").value = "";
      const filtered = applyFiltersToEntries();
      populateTableRows(filtered);
    });

    // helper to refresh after delete (recompute filter dropdowns and rows)
    function refreshAfterDelete() {
      // rebuild table area (call renderTable again)
      renderTable();
    }
  }

  // view single entry modal
  function viewEntry(id) {
    const entries = getEntries();
    const entry = entries.find(e => e.id === id);
    if (!entry) return alert("Record not found.");
    const modal = el("div", { style: "position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:9999;" },
      el("div", { style: "width:92%;max-width:900px;background:#fff;border-radius:8px;padding:18px;max-height:90vh;overflow:auto;" },
        el("div", { style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;" },
          el("h3", {}, "Record Details"),
          el("button", { onclick: () => document.body.removeChild(modal), style: "background:#ddd;border:none;padding:6px 10px;border-radius:8px;cursor:pointer;" }, "Close")
        ),
        el("div", { style: "display:grid;grid-template-columns:repeat(2,1fr);gap:8px;" },
          fieldView("දිනය", entry.date),
          fieldView("සාම්පල්/අත්අඩංගු", entry.sample_status),
          fieldView("වර්ගය", entry.type),
          fieldView("ද්‍රව්‍යයේ ස්වභාවය", entry.nature),
          fieldView("ලබාගත් සාම්පල් ගණන", entry.sample_count),
          fieldView("ලබා ගත්තේ කාගෙන්ද", entry.from_whom),
          fieldView("ස්ථානය", entry.location),
          fieldView("ව්‍යාපාර හිමිකරුගේ නම", entry.owner),
          fieldView("රසපරීක්‍ෂක වෙත යැවූ දිනය", entry.sent_date),
          fieldView("රසපරීක්‍ෂක වාර්තාවේ යොමු අංකය", entry.ref_no),
          fieldView("රසපරීක්‍ෂක වාර්තාව ලැබුණු දිනය", entry.received_date),
          fieldView("වාර්තාවේ ස්වභාවය", entry.report_nature),
          fieldView("ගත ක්‍රියාමාර්ග", entry.actions_taken),
          fieldView("වෙනත් කරුණු", entry.remarks),
          fieldView("නඩුවේ තීන්දුව", entry.case_decision)
        )
      )
    );
    document.body.appendChild(modal);
  }

  function fieldView(label, value) {
    return el("div", { style: "padding:8px;border-radius:6px;background:#fafafa;border:1px solid #eee;" },
      el("strong", {}, label + ":"), el("div", { style: "margin-top:6px;color:#333;" }, safe(value))
    );
  }

  // edit entry
  function editEntry(id) {
    const entries = getEntries();
    const entry = entries.find(e => e.id === id);
    if (!entry) return alert("Record not found.");

    renderUI("Food Analysis Register");
    setTimeout(() => {
      const form = document.getElementById("fa_form");
      if (!form) return;
      form.dataset.editId = entry.id;
      document.getElementById("fa_date").value = entry.date || "";
      const r = form.querySelector(`input[name="fa_sample_status"][value="${entry.sample_status}"]`);
      if (r) r.checked = true;
      document.getElementById("fa_type").value = entry.type || "";
      document.getElementById("fa_nature").value = entry.nature || "";
      document.getElementById("fa_sample_count").value = entry.sample_count || "1";
      document.getElementById("fa_from_whom").value = entry.from_whom || "";
      document.getElementById("fa_location").value = entry.location || "";
      document.getElementById("fa_owner").value = entry.owner || "";
      document.getElementById("fa_sent_date").value = entry.sent_date || "";
      document.getElementById("fa_ref_no").value = entry.ref_no || "";
      document.getElementById("fa_received_date").value = entry.received_date || "";
      document.getElementById("fa_report_nature").value = entry.report_nature || "";
      document.getElementById("fa_actions").value = entry.actions_taken || "";
      document.getElementById("fa_remarks").value = entry.remarks || "";
      document.getElementById("fa_case_decision").value = entry.case_decision || "";
      document.getElementById("fa_tab_entry").click();
    }, 60);
  }

  function deleteEntry(id) {
    let entries = getEntries();
    entries = entries.filter(e => e.id !== id);
    saveEntries(entries);
  }

  // Expose
  window.openFoodAnalysisRegister = function (title) {
    try {
      renderUI(title || "Food Analysis Register");
    } catch (err) {
      console.error("openFoodAnalysisRegister error:", err);
      const content = document.getElementById("contentArea") || document.body;
      content.innerHTML = `<h2>${title}</h2><div class="glass" style="padding:18px;color:crimson;"><strong>Error loading Food Analysis module:</strong><pre>${err.message}</pre></div>`;
    }
  };

})();
