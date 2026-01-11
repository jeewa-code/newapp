/* ==================================================
   latrineConstruction.js
   Latrine Construction Register module for PHI app
   - Exposes window.openLatrineConstructionRegister(title)
   - Renders entry form (Sinhala labels) and a separate "Records" tab showing saved entries in a full table
   - Saves data to localStorage key: 'latrineConstructionEntries'
   - Supports add / edit / delete / export CSV
   ================================================== */

(function(){
  const STORAGE_KEY = 'latrineConstructionEntries';

  // utility: format date to yyyy-mm-dd (for inputs)
  function formatInputDate(d){
    if(!d) return '';
    const dt = new Date(d);
    if(isNaN(dt)) return '';
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth()+1).padStart(2,'0');
    const dd = String(dt.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // load entries
  function loadEntries(){
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }

  function saveEntries(arr){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  // render the main view with tabs: Form | Records
  window.openLatrineConstructionRegister = function(title){
    const content = document.getElementById('contentArea');
    if(!content) return;

    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h2>${title}</h2>
        <div>
          <button id="backToRegisters" class="btn-small">← පසු</button>
          <button id="exportCSV" class="btn-small">CSV ලෙස निर्यात</button>
        </div>
      </div>

      <div class="glass" style="padding:0;">
        <div style="display:flex;border-bottom:1px solid rgba(0,0,0,0.08);">
          <button id="tabForm" class="tab active" style="flex:0 0 auto;padding:12px 18px;border:0;background:transparent;">Form (පෝරමය)</button>
          <button id="tabRecords" class="tab" style="flex:0 0 auto;padding:12px 18px;border:0;background:transparent;">Records (ලේඛන)</button>
        </div>

        <div id="tabContent" style="padding:18px;"></div>
      </div>
    `;

    document.getElementById('backToRegisters').addEventListener('click', ()=> showContent && showContent('Registers', null));
    document.getElementById('exportCSV').addEventListener('click', exportCSV);

    document.getElementById('tabForm').addEventListener('click', ()=> showTab('form'));
    document.getElementById('tabRecords').addEventListener('click', ()=> showTab('records'));

    // open default tab
    showTab('form');
  };

  function showTab(which){
    const formTabBtn = document.getElementById('tabForm');
    const recordsTabBtn = document.getElementById('tabRecords');
    const container = document.getElementById('tabContent');
    if(!container) return;

    formTabBtn.classList.toggle('active', which==='form');
    recordsTabBtn.classList.toggle('active', which==='records');

    if(which === 'form'){
      container.innerHTML = getFormHTML();
      wireForm();
    } else {
      container.innerHTML = '<div id="recordsWrapper"></div>';
      renderRecordsTable();
    }
  }

  function getFormHTML(){
    return `
      <form id="latrineForm">
        <div style="display:flex;flex-wrap:wrap;gap:12px;">
          <div style="flex:1 1 320px;">
            <label>ගෘහ මුලිකයාගේ නම</label>
            <input type="text" id="ownerName" required />
          </div>

          <div style="flex:1 1 320px;">
            <label>ලිපිනය</label>
            <input type="text" id="address" />
          </div>

          <div style="flex:1 1 200px;">
            <label>වැසිකිලි කට්ටලය නිකුත් කල දිනය</label>
            <input type="date" id="issuedDate" />
          </div>

          <div style="flex:1 1 200px;">
            <label>ඉදිකිරීම් අරම්භ කල දිනය</label>
            <input type="date" id="startDate" />
          </div>

          <div style="flex:1 1 200px;">
            <label>ඉදිකිරීම් අවසන් කල දිනය</label>
            <input type="date" id="endDate" />
          </div>

          <div style="flex:1 1 200px;">
            <label>වර්ගය</label>
            <select id="type">
              <option value="">-- තෝරන්න --</option>
              <option value="පිසින්න">පිසින්න</option>
              <option value="පිහිටුම්">පිහිටුම්</option>
              <option value="සිද්ධ">සිද්ධ</option>
              <option value="වෙනත්">වෙනත්</option>
            </select>
          </div>

          <div style="flex:1 1 320px;">
            <label>මුදල සහ ආධාර කල ආයතනය</label>
            <input type="text" id="amountAndAgency" placeholder="මුදල — ආයතනය" />
          </div>

          <div style="flex:1 1 200px;">
            <label>වවුචරය භාරදුන් දිනය</label>
            <input type="date" id="voucherReceivedDate" />
          </div>

          <div style="flex:1 1 200px;">
            <label>වැසිකිලි කට්ටලය සදහා අඩු කල මුදල</label>
            <input type="number" id="discountedAmount" min="0" step="0.01" />
          </div>

          <div style="flex:1 1 200px;">
            <label>ගෙවිය යුතු ඉතිරි මුදල</label>
            <input type="number" id="remainingAmount" min="0" step="0.01" />
          </div>

          <div style="flex:1 1 200px;">
            <label>මුදල් ගෙවූ දිනය</label>
            <input type="date" id="paymentDate" />
          </div>

          <div style="flex:1 1 200px;">
            <label>ගෙවූ මුදල</label>
            <input type="number" id="paidAmount" min="0" step="0.01" />
          </div>

          <div style="flex:1 1 320px;">
            <label>සනීපාරක්ෂක ලේඛනයෙහි යොමු අංකය</label>
            <input type="text" id="sanitaryRefNo" />
          </div>

          <div style="flex:1 1 100%;">
            <label>වෙනත් කරුණු</label>
            <textarea id="otherNotes" rows="3"></textarea>
          </div>

        </div>

        <div style="margin-top:12px;display:flex;gap:8px;">
          <button type="submit" id="saveBtn" class="btn-main">සුරකින්න</button>
          <button type="button" id="resetBtn" class="btn-secondary">අලුත් කරන්න</button>
          <input type="hidden" id="editingId" />
        </div>
      </form>
    `;
  }

  function wireForm(){
    const form = document.getElementById('latrineForm');
    if(!form) return;
    form.addEventListener('submit', onSubmit);
    document.getElementById('resetBtn').addEventListener('click', () => { form.reset(); document.getElementById('editingId').value=''; });
  }

  function onSubmit(e){
    e.preventDefault();
    const get = id => document.getElementById(id).value.trim();

    const entry = {
      id: document.getElementById('editingId').value || String(Date.now()),
      ownerName: get('ownerName'),
      address: get('address'),
      issuedDate: get('issuedDate'),
      startDate: get('startDate'),
      endDate: get('endDate'),
      type: get('type'),
      amountAndAgency: get('amountAndAgency'),
      voucherReceivedDate: get('voucherReceivedDate'),
      discountedAmount: get('discountedAmount'),
      remainingAmount: get('remainingAmount'),
      paymentDate: get('paymentDate'),
      paidAmount: get('paidAmount'),
      sanitaryRefNo: get('sanitaryRefNo'),
      otherNotes: get('otherNotes')
    };

    if(!entry.ownerName){
      alert('කරුණාකර ගෘහ මුලිකයාගේ නම ඇතුල් කරන්න.');
      return;
    }

    const arr = loadEntries();
    const existingIndex = arr.findIndex(a=>a.id===entry.id);
    if(existingIndex > -1){
      arr[existingIndex] = entry;
    } else {
      arr.unshift(entry); // newest first
    }
    saveEntries(arr);

    // reset form
    const form = document.getElementById('latrineForm');
    form.reset();
    document.getElementById('editingId').value = '';

    // if records tab visible, re-render to show new entry
    if(document.getElementById('tabRecords') && document.getElementById('tabRecords').classList.contains('active')){
      renderRecordsTable();
    }

    alert('දත්ත සුරක්ෂිතකරන ලදි.');
  }

  // render records in a full table inside separate tab
  function renderRecordsTable(){
    const wrapper = document.getElementById('recordsWrapper');
    if(!wrapper) return;
    const arr = loadEntries();

    let html = '';
    html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
               <div><strong>නිතිපතා ලේඛන (${arr.length})</strong></div>
               <div style="display:flex;gap:8px;align-items:center;">
                 <input id="searchInput" placeholder="සෙවීම — නම/ලිපිනය" style="padding:6px;border-radius:4px;border:1px solid #ccc;" />
                 <button id="refreshRecords" class="btn-small">නැවත පිරවීම</button>
               </div>
             </div>`;

    if(arr.length===0){
      html += '<p>වැඩිපුර ඇතුළුකිරීම් නොමැත.</p>';
      wrapper.innerHTML = html;
      addRecordsListeners();
      return;
    }

    html += '<div style="overflow:auto;max-height:420px;border-top:1px solid rgba(0,0,0,0.06);">';
    html += '<table style="width:100%;border-collapse:collapse;min-width:900px;">';
    html += '<thead style="position:sticky;top:0;background:#fff;z-index:2;">';
    html += '<tr>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">ගෘහ මුලිකයා</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">ලිපිනය</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">වැසිකිලි නිකුත් දිනය</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">ඉදිකිරීම් (ආරම්භ → අවසන්)</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">වර්ගය</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">මුදල/ආයතනය</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">ගෙවූ මුදල</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">සනීප. යොමු අංකය</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">ක්‍රියා</th>'+
          '</tr>';
    html += '</thead><tbody>';

    arr.forEach(entry => {
      const dateRange = (s,e) => `${s||'---'} → ${e||'---'}`;
      html += `<tr style="border-top:1px solid rgba(0,0,0,0.04)">`+
                `<td style="padding:8px;">${escapeHtml(entry.ownerName)}</td>`+
                `<td style="padding:8px;">${escapeHtml(entry.address||'')}</td>`+
                `<td style="padding:8px;">${entry.issuedDate||''}</td>`+
                `<td style="padding:8px;">${dateRange(entry.startDate, entry.endDate)}</td>`+
                `<td style="padding:8px;">${escapeHtml(entry.type||'')}</td>`+
                `<td style="padding:8px;">${escapeHtml(entry.amountAndAgency||'')}</td>`+
                `<td style="padding:8px;">${entry.paidAmount || ''}</td>`+
                `<td style="padding:8px;">${escapeHtml(entry.sanitaryRefNo||'')}</td>`+
                `<td style="padding:8px;">`+
                  `<button data-id="${entry.id}" class="btn-small" onclick="window.__latrine_edit('${entry.id}')">සංශෝධනය</button> `+
                  `<button data-id="${entry.id}" class="btn-small" onclick="window.__latrine_delete('${entry.id}')">මකන්න</button>`+
                `</td>`+
              `</tr>`;
    });

    html += '</tbody></table></div>';

    wrapper.innerHTML = html;

    addRecordsListeners();
  }

  function addRecordsListeners(){
    const search = document.getElementById('searchInput');
    if(search){
      search.addEventListener('input', onSearchRecords);
    }
    const refresh = document.getElementById('refreshRecords');
    if(refresh){ refresh.addEventListener('click', renderRecordsTable); }
  }

  function onSearchRecords(e){
    const q = e.target.value.trim().toLowerCase();
    const all = loadEntries();
    const filtered = all.filter(r => (r.ownerName||'').toLowerCase().includes(q) || (r.address||'').toLowerCase().includes(q));

    // render filtered results into recordsWrapper (reuse table header)
    const wrapper = document.getElementById('recordsWrapper');
    if(!wrapper) return;

    let html = '';
    html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
               <div><strong>ලේඛන (${filtered.length})</strong></div>
               <div style="display:flex;gap:8px;align-items:center;">
                 <input id="searchInput" placeholder="සෙවීම — නම/ලිපිනය" style="padding:6px;border-radius:4px;border:1px solid #ccc;" value="${escapeHtml(e.target.value)}" />
                 <button id="refreshRecords" class="btn-small">නැවත පිරවීම</button>
               </div>
             </div>`;

    if(filtered.length===0){
      html += '<p>ගැලපුම් ලේඛන නොමැත.</p>';
      wrapper.innerHTML = html; addRecordsListeners(); return;
    }

    html += '<div style="overflow:auto;max-height:420px;border-top:1px solid rgba(0,0,0,0.06);">';
    html += '<table style="width:100%;border-collapse:collapse;min-width:900px;">';
    html += '<thead style="position:sticky;top:0;background:#fff;z-index:2;">';
    html += '<tr>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">ගෘහ මුලිකයා</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">ලිපිනය</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">වැසිකිලි නිකුත් දිනය</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">ඉදිකිරීම් (ආරම්භ → අවසන්)</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">වර්ගය</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">මුදල/ආයතනය</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">ගෙවූ මුදල</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">සනීප. යොමු අංකය</th>'+
            '<th style="text-align:left;padding:8px;border-bottom:1px solid #eee;">ක්‍රියා</th>'+
          '</tr>';
    html += '</thead><tbody>';

    filtered.forEach(entry => {
      const dateRange = (s,e) => `${s||'---'} → ${e||'---'}`;
      html += `<tr style="border-top:1px solid rgba(0,0,0,0.04)">`+
                `<td style="padding:8px;">${escapeHtml(entry.ownerName)}</td>`+
                `<td style="padding:8px;">${escapeHtml(entry.address||'')}</td>`+
                `<td style="padding:8px;">${entry.issuedDate||''}</td>`+
                `<td style="padding:8px;">${dateRange(entry.startDate, entry.endDate)}</td>`+
                `<td style="padding:8px;">${escapeHtml(entry.type||'')}</td>`+
                `<td style="padding:8px;">${escapeHtml(entry.amountAndAgency||'')}</td>`+
                `<td style="padding:8px;">${entry.paidAmount || ''}</td>`+
                `<td style="padding:8px;">${escapeHtml(entry.sanitaryRefNo||'')}</td>`+
                `<td style="padding:8px;">`+
                  `<button data-id="${entry.id}" class="btn-small" onclick="window.__latrine_edit('${entry.id}')">සංශෝධනය</button> `+
                  `<button data-id="${entry.id}" class="btn-small" onclick="window.__latrine_delete('${entry.id}')">මකන්න</button>`+
                `</td>`+
              `</tr>`;
    });

    html += '</tbody></table></div>';

    wrapper.innerHTML = html;

    addRecordsListeners();
  }

  // small escape to avoid HTML injection in table
  function escapeHtml(s){
    if(s === undefined || s === null) return '';
    return (''+s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  }

  // expose edit/delete helpers on window for inline onclick handlers
  window.__latrine_edit = function(id){
    const arr = loadEntries();
    const item = arr.find(a=>a.id===id);
    if(!item){ alert('Record not found'); return; }

    // ensure the form tab is open
    if(typeof window.openLatrineConstructionRegister === 'function') window.openLatrineConstructionRegister('Latrine Construction Register');

    // small timeout to ensure DOM is ready
    setTimeout(()=>{
      // switch to form tab and populate
      if(document.getElementById('tabForm')) document.getElementById('tabForm').click();
      const set = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };
      set('editingId', item.id);
      set('ownerName', item.ownerName);
      set('address', item.address);
      set('issuedDate', item.issuedDate);
      set('startDate', item.startDate);
      set('endDate', item.endDate);
      set('type', item.type);
      set('amountAndAgency', item.amountAndAgency);
      set('voucherReceivedDate', item.voucherReceivedDate);
      set('discountedAmount', item.discountedAmount);
      set('remainingAmount', item.remainingAmount);
      set('paymentDate', item.paymentDate);
      set('paidAmount', item.paidAmount);
      set('sanitaryRefNo', item.sanitaryRefNo);
      set('otherNotes', item.otherNotes);
    }, 80);
  };

  window.__latrine_delete = function(id){
    if(!confirm('මෙම ඇතුලත් කිරීම මකා දැමීමට ඔබට විශ්වාසද?')) return;
    const arr = loadEntries().filter(a=>a.id!==id);
    saveEntries(arr);
    // re-render records tab if visible
    if(document.getElementById('tabRecords') && document.getElementById('tabRecords').classList.contains('active')){
      renderRecordsTable();
    }
  };

  function exportCSV(){
    const arr = loadEntries();
    if(arr.length===0){ alert('Export කිරීමට දත්ත නැත.'); return; }

    const headers = [
      'id','ownerName','address','issuedDate','startDate','endDate','type','amountAndAgency','voucherReceivedDate','discountedAmount','remainingAmount','paymentDate','paidAmount','sanitaryRefNo','otherNotes'
    ];

    const rows = arr.map(r => headers.map(h => `\"${(r[h]||'').toString().replace(/\"/g,'\"\"')}\"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'latrine_construction_register.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

})();
