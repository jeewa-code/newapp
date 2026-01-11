// printSections.js
// v1.1 — full, updated printable sections manager for dailySummaryTab.js
// Dependencies: works standalone; will reuse window.renderActivitiesTable(year,month) and localStorage keys:
//  - 'phi_monthly_activities' (monthly saved numeric values)
//  - 'pocketNotes' (pocket note book data used by dailySummaryTab.js)
//  - 'print_photos' (optional, JSON array of data-URLs or image URLs for appendix)
//  - 'print_notes' (optional free-text for Supervisor Remarks)
// Usage:
//   <script src="dailySummaryTab.js"></script>
//   <script src="printSections.js"></script>
//   // optional: register extra sections or override defaults
//   PrintSections.print({ year:2025, month:11, orientation:'landscape', title:'PHI Monthly Report' });

(function(){
  "use strict";
  if (window.PrintSections) return;

  const DEFAULTS = {
    pageSize: 'A4',
    orientation: 'landscape',
    fontSize: '11px',
    margin: '12mm',
    headerRepeat: true,
    title: 'Print Document'
  };

  const sections = {}; // { id: { title, render } }

  /* ---------- Sanitizers & helpers ---------- */
  function escHtml(s){
    if (s === null || s === undefined) return '';
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }
  function safeHtml(s){
    // allow basic html but escape script tags
    if (s === null || s === undefined) return '';
    return String(s).replace(/<\s*script/gi, '&lt;script');
  }

  function readMonthlyData(){
    try {
      return JSON.parse(localStorage.getItem('phi_monthly_activities') || '{}');
    } catch(e){ return {}; }
  }
  function readPocketNotes(){
    try { return JSON.parse(localStorage.getItem('pocketNotes') || '[]'); }
    catch(e){ return []; }
  }

  /* ---------- Registration API ---------- */
  function register(id, opts){
    if (!id || typeof id !== 'string') throw new Error('section id required');
    if (!opts || typeof opts.render !== 'function') throw new Error('opts.render (function) required');
    sections[id] = { title: opts.title || id, render: opts.render };
  }
  function unregister(id){ delete sections[id]; }
  function getOrderedSectionIds(){ return Object.keys(sections); }

  /* ---------- Print CSS & Header ---------- */
  function buildStyles(cfg){
    const orientation = cfg.orientation === 'portrait' ? 'portrait' : 'landscape';
    return `
      <style>
        @page { size: ${cfg.pageSize} ${orientation}; margin: ${cfg.margin}; }
        html,body{ height:100%; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial; font-size:${cfg.fontSize}; color:#222; -webkit-print-color-adjust:exact; }
        .print-container{ width:100%; box-sizing:border-box; padding:8px; }
        .print-header{ padding-bottom:8px; margin-bottom:10px; border-bottom:1px solid #ddd; }
        .print-title{ font-size: calc(${cfg.fontSize} * 1.1); font-weight:700; }
        .print-meta{ font-size:10px; color:#555; }
        .section{ page-break-inside: avoid; page-break-after: always; margin:10px 0; }
        .section:last-child{ page-break-after:auto; }
        .section-title{ font-weight:600; margin:6px 0; background:#f1f3f5; padding:6px 8px; border-radius:4px; border:1px solid #e2e6ea; }
        table{ border-collapse:collapse; width:100%; }
        table th, table td{ border:1px solid #ddd; padding:4px; vertical-align:middle; font-size:${cfg.fontSize}; }
        thead{ display: table-header-group; }
        tfoot{ display: table-footer-group; }
        .compact-row{ height:12px; line-height:12px; font-size:${cfg.fontSize}; }
        .table-wrap{ overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .photos-grid{ display:flex; gap:8px; flex-wrap:wrap; }
        .photos-grid img{ max-width:32%; height:auto; border:1px solid #ccc; border-radius:4px; }
        .signature-line{ margin-top:30px; }
        .sig-box{ border-top:1px solid #333; width:40%; padding-top:6px; text-align:left; }
      </style>
    `;
  }

  function buildHeaderHtml(cfg, ctx){
    const now = new Date();
    const printedOn = now.toLocaleString();
    const meta = [
      cfg.title ? escHtml(cfg.title) : '',
      `Month: ${ctx.month.toString().padStart(2,'0')}/${ctx.year}`,
      `Printed: ${escHtml(printedOn)}`
    ].filter(Boolean).join(' · ');
    return `
      <div class="print-header">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div class="print-title">${escHtml(cfg.title || 'Print Document')}</div>
            <div class="print-meta">${escHtml(meta)}</div>
          </div>
          <div style="text-align:right;"><div class="print-meta">Page <span class="page-number"></span></div></div>
        </div>
      </div>
    `;
  }

  /* ---------- Built-in sections ---------- */

  // 1) Monthly Activities Table (reuse renderer if available)
  register('monthly_activities', {
    title: 'Monthly Activities Table',
    render: (ctx) => {
      // If dailySummaryTab provides renderActivitiesTable, use it (it returns full table HTML string)
      if (window.renderActivitiesTable && typeof window.renderActivitiesTable === 'function') {
        // wrap in table-wrap to allow horizontal scrolling if needed
        return `<div class="table-wrap">${window.renderActivitiesTable(ctx.year, ctx.month)}</div>`;
      }
      // fallback: produce a friendly message
      return `<div>No activities renderer available. Include dailySummaryTab.js</div>`;
    }
  });

  // 2) Attendance Summary — aggregate totals per day or simple summary from monthlyData
  register('attendance_summary', {
    title: 'Attendance / Summary Totals',
    render: (ctx) => {
      const monthly = readMonthlyData();
      const monthKey = `${ctx.year}-${String(ctx.month).padStart(2,'0')}`;
      const monthData = monthly[monthKey] || {};
      // Heuristic: look for keys that match activity totals (ending with Total or numeric)
      // We'll build a small table with available totals (fallback if empty)
      const rows = [];
      for (const key in monthData) {
        if (!Object.prototype.hasOwnProperty.call(monthData,key)) continue;
        // show only scalar numeric/string values that look like totals (avoid per-day keys)
        if (/_Total$/.test(key) || /_summary$/.test(key) || key.includes('total') || key.includes('Total')) {
          rows.push({ k:key, v: monthData[key] });
        }
      }
      // if none found, show simple count of stored keys
      if (rows.length === 0) {
        const totalKeys = Object.keys(monthData).length;
        return `<div style="padding:8px;">No explicit totals found in monthly data. Stored items: ${totalKeys}.</div>`;
      }
      let table = '<table><thead><tr><th>Key</th><th>Value</th></tr></thead><tbody>';
      rows.forEach(r => {
        table += `<tr><td>${escHtml(r.k)}</td><td>${escHtml(String(r.v))}</td></tr>`;
      });
      table += '</tbody></table>';
      return table;
    }
  });

  // 3) Supervisor Remarks — read from localStorage 'print_notes' or pocketNotes summary
  register('supervisor_remarks', {
    title: 'Supervisor Remarks',
    render: (ctx) => {
      const notes = localStorage.getItem('print_notes') || '';
      if (notes && notes.trim()) {
        return `<div style="white-space:pre-wrap;padding:8px;">${escHtml(notes)}</div>`;
      }
      // else attempt to extract some remarks from pocketNotes (if present)
      const pnb = readPocketNotes();
      if (Array.isArray(pnb) && pnb.length > 0) {
        // Just show last 3 pocket notes summaries (date + short text)
        const items = pnb.slice(-3).reverse().map(n => {
          const d = escHtml(n.date || '');
          const txt = escHtml((n.notes || n.summary || n.morningTasks || '').toString().substring(0,400));
          return `<div style="margin-bottom:6px;"><strong>${d}</strong><div style="white-space:pre-wrap;">${txt}</div></div>`;
        }).join('');
        return items;
      }
      return `<div style="padding:8px;color:#666;">No supervisor remarks available. Use localStorage key 'print_notes' or enter remarks in app.</div>`;
    }
  });

  // 4) Signatures block
  register('signatures', {
    title: 'Signatures',
    render: (ctx) => {
      return `
        <div style="padding:8px;">
          <div style="display:flex; gap:40px; flex-wrap:wrap;">
            <div class="sig-box signature-line">Prepared by: ______________________</div>
            <div class="sig-box signature-line">Checked by: _______________________</div>
            <div class="sig-box signature-line">Approved by: ______________________</div>
          </div>
        </div>
      `;
    }
  });

  // 5) Appendix — photos (optional)
  register('appendix_photos', {
    title: 'Appendix — Photos',
    render: (ctx) => {
      try {
        const photosJson = localStorage.getItem('print_photos') || '[]';
        const arr = JSON.parse(photosJson);
        if (!Array.isArray(arr) || arr.length === 0) {
          return `<div style="padding:8px;color:#666;">No photos found in localStorage key 'print_photos'. Add data-URL strings or image URLs in that key.</div>`;
        }
        // render images grid (limit to avoid huge prints)
        const limited = arr.slice(0,20);
        let html = `<div class="photos-grid" style="padding:8px;">`;
        limited.forEach((src, i) => {
          const safeSrc = escHtml(src);
          html += `<div><img src="${safeSrc}" alt="photo-${i+1}" /></div>`;
        });
        html += `</div>`;
        return html;
      } catch(e){
        return `<div style="padding:8px;color:#c00;">Error reading photos: ${escHtml(String(e.message || e))}</div>`;
      }
    }
  });

  /* ---------- Main generation / open / print ---------- */

  function buildSectionsHtml(cfg, ctx){
    const ids = getOrderedSectionIds();
    let content = '';
    for (const id of ids) {
      const sec = sections[id];
      try {
        const rendered = sec.render(ctx);
        // rendered may be string or promise (support sync only here)
        const safe = typeof rendered === 'string' ? safeHtml(rendered) : safeHtml(String(rendered));
        // We keep tables intact — safeHtml only neutralizes <script>
        content += `
          <section class="section" id="print-section-${escHtml(id)}">
            <div class="section-title">${escHtml(sec.title)}</div>
            <div class="section-body table-wrap">
              ${safe}
            </div>
          </section>
        `;
      } catch(err){
        content += `
          <section class="section">
            <div class="section-title">${escHtml(sec.title)}</div>
            <div style="padding:8px;color:#c00;">Error rendering section: ${escHtml(String(err.message || err))}</div>
          </section>
        `;
      }
    }
    if (ids.length === 0) {
      content = `<div class="section"><div class="section-title">No sections registered</div><div style="padding:8px;">Use PrintSections.register(...) to add printable sections.</div></div>`;
    }
    return content;
  }

  async function generatePrintHtml(opts){
    const cfg = Object.assign({}, DEFAULTS, opts || {});
    const ctx = { year: cfg.year || (new Date()).getFullYear(), month: cfg.month || (new Date()).getMonth()+1 };
    let html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
    html += buildStyles(cfg);
    html += '</head><body>';
    html += `<div class="print-container">`;
    html += buildHeaderHtml(cfg, ctx);
    html += buildSectionsHtml(cfg, ctx);
    html += `</div>`;
    html += `<script>
      (function(){
        // page-number placeholder: left blank — browsers control exact pages.
        document.querySelectorAll('.page-number').forEach(el => el.textContent = '');
        if (${cfg.autoPrint ? 'true' : 'false'}) {
          setTimeout(function(){ try{ window.print(); } catch(e){} }, 300);
        }
      })();
    </script>`;
    html += '</body></html>';
    return html;
  }

    // REPLACE existing openPrintWindow + print with this improved version
  async function openPrintWindow(opts){
    const html = await generatePrintHtml(opts);
    // try normal popup first
    try {
      const w = window.open('', '_blank', 'noopener');
      if (w) {
        w.document.open();
        w.document.write(html);
        w.document.close();
        if (opts && opts.autoPrint) {
          setTimeout(()=>{ try{ w.print(); } catch(e){} }, 500);
        }
        return w;
      }
      // if window.open returned null, treat as blocked and fallthrough to iframe method
    } catch (err) {
      // fall through to iframe fallback
    }

    // --- IFRAME FALLBACK (works in-place without opening a new tab; initiated by user click so print not blocked) ---
    return new Promise((resolve, reject) => {
      try {
        // remove any old fallback iframe
        const existing = document.getElementById('__printSections_iframe_fallback');
        if (existing) existing.remove();

        const iframe = document.createElement('iframe');
        iframe.id = '__printSections_iframe_fallback';
        // keep it hidden but added to document so same-origin printing allowed
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();

        // Wait for content to render before calling print
        const tryPrint = () => {
          try {
            // focus the iframe window then call print
            iframe.contentWindow.focus();
            // Some browsers require a slight delay
            setTimeout(() => {
              try {
                iframe.contentWindow.print();
                // cleanup after a short delay to let print dialog open
                setTimeout(() => {
                  try { iframe.remove(); } catch(e){}
                }, 1000);
                resolve(iframe.contentWindow);
              } catch (printErr) {
                // fallback: open the generated HTML in the same tab as a last resort
                try {
                  const blob = new Blob([html], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  window.location.href = url; // navigates current tab — user can then print manually
                  resolve(null);
                } catch(navigateErr) {
                  reject(printErr);
                }
              }
            }, 250);
          } catch(e) {
            reject(e);
          }
        };

        // Wait until iframe's document.readyState is 'complete' or a small timeout
        const waitUntilReady = (attempts = 0) => {
          try {
            const rs = iframeDoc.readyState;
            if (rs === 'complete' || attempts > 20) {
              tryPrint();
            } else {
              setTimeout(() => waitUntilReady(attempts + 1), 100);
            }
          } catch(e) {
            // If accessing readyState fails (rare), try printing anyway after delay
            setTimeout(tryPrint, 300);
          }
        };
        waitUntilReady();
      } catch(e) {
        reject(e);
      }
    });
  }

  async function print(opts){
    const cfg = Object.assign({}, DEFAULTS, opts || {});
    cfg.autoPrint = true;
    return openPrintWindow(cfg);
  }


  /* ---------- Expose API ---------- */
  window.PrintSections = {
    register,
    unregister,
    generatePrintHtml, // async -> html string
    openPrintWindow,   // async -> window reference
    print,             // async -> window reference (autoPrint)
    _sections: sections,
    _defaults: DEFAULTS
  };

  // Expose convenience: allow overriding order by array
  // Example: PrintSections.setOrder(['monthly_activities','attendance_summary','supervisor_remarks',...])
  window.PrintSections.setOrder = function(arr){
    if (!Array.isArray(arr)) return;
    const newSections = {};
    arr.forEach(id => {
      if (sections[id]) newSections[id] = sections[id];
    });
    // append remaining sections not listed
    Object.keys(sections).forEach(id => { if (!newSections[id]) newSections[id] = sections[id]; });
    // mutate sections content
    Object.keys(sections).forEach(k => delete sections[k]);
    Object.keys(newSections).forEach(k => sections[k] = newSections[k]);
  };

})();
