
/* phiKeyMap.js - UPDATED with Holiday Types (නිවාඩු වර්ග) and Fixed Dates Table
   Tab: Key Map
   - Exposes: window.renderPhiKeyMapTab(container)
   - Stores four lists in localStorage:
       - phi_key_roles_v1   (for රාජකාරි entries)
       - phi_key_places_v1  (for ස්ථානය entries)
       - phi_key_holidays_v1 (for නිවාඩු වර්ග / Holiday Types)
       - phi_fixed_dates_v1 (for රාජකාරි සදහා නියත දිනයන්)
   - UI: selector (රාජකාරිය / ස්ථානය / නිවාඩු වර්ග), form inputs conditional on selection,
         three separate tables (Roles / Places / Holiday Types), and fixed dates table at bottom.
*/

(function () {
  const ROLES_KEY = "phi_key_roles_v1";
  const PLACES_KEY = "phi_key_places_v1";
  const HOLIDAY_KEY = "phi_key_holidays_v1";
  const FIXED_DATES_KEY = "phi_fixed_dates_v1";

  // small helpers
  function load(key) {
    try { return JSON.parse(localStorage.getItem(key) || "[]"); }
    catch (e) { console.warn("load error", e); return []; }
  }
  function save(key, arr) {
    try { localStorage.setItem(key, JSON.stringify(arr)); }
    catch (e) { console.warn("save error", e); }
  }
  function uid() { return Date.now().toString(36) + "-" + Math.floor(Math.random() * 9999).toString(36); }
  function esc(s) { if (s == null) return ""; return String(s).replace(/[&<>\"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[m])); }

  // main renderer
  function renderPhiKeyMapTab(containerOrId) {
    let container = containerOrId;
    if (typeof containerOrId === "string") container = document.getElementById(containerOrId);
    if (!container || !(container instanceof HTMLElement)) {
      console.warn("phiKeyMap: invalid container");
      return;
    }

    const roles = load(ROLES_KEY);
    const places = load(PLACES_KEY);
    const holidays = load(HOLIDAY_KEY);
    const fixedDates = load(FIXED_DATES_KEY);

    container.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;">
        <div class="km_header" style="display:flex;flex-direction:column;gap:10px;margin-bottom:12px;">
          <h3 style="margin:0;color:#0b5ea8;">Key Map (Key / Map)</h3>
          <div style="font-size:13px;color:#666;">Manage Roles (රාජකාරිය), Places (ස්ථානය) and Holiday Types (නිවාඩු වර්ග)</div>
        </div>

        <div class="km_selector" style="display:flex;gap:10px;align-items:center;margin-bottom:12px;flex-wrap:wrap;">
          <label style="font-weight:600;white-space:nowrap;">තෝරන්න:</label>
          <select id="km_choice" style="padding:8px;border-radius:8px;border:1px solid #d0d6db;flex:1;min-width:150px;">
            <option value="role">රාජකාරිය</option>
            <option value="place">ස්ථානය</option>
            <option value="holiday">නිවාඩු වර්ග</option>
          </select>
        </div>

        <div id="km_form_wrap" style="background:#f7fbff;padding:12px;border-radius:8px;margin-bottom:14px;">
          <!-- form injected here -->
        </div>

        <div class="km_tables_grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;align-items:start;">
          <div>
            <h4 style="margin:0 0 8px 0;">රාජකාරි (Roles)</h4>
            <div style="background:#fff;padding:10px;border-radius:8px;overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead><tr style="text-align:left"><th style="width:36px">#</th><th>රාජකාරිය</th><th>කෙටි කේතය</th><th style="width:100px">Actions</th></tr></thead>
                <tbody id="km_roles_body">${roles.length ? roles.map((r, i) => `<tr data-id="${esc(r.id)}"><td style="padding:8px">${i + 1}</td><td style="padding:8px">${esc(r.role)}</td><td style="padding:8px;word-break:break-word;">${esc(r.code)}</td><td style="padding:8px"><button class="km_edit_role km_btn" data-id="${esc(r.id)}" style="margin-right:3px">Edit</button><button class="km_del_role km_btn km_btn_del" data-id="${esc(r.id)}">Del</button></td></tr>`).join("") : `<tr><td colspan="4" style="padding:10px;color:#666;">No roles</td></tr>`}</tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 style="margin:0 0 8px 0;">ස්ථාන (Places)</h4>
            <div style="background:#fff;padding:10px;border-radius:8px;overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead><tr style="text-align:left"><th style="width:36px">#</th><th>රාජකාරි ස්ථානය</th><th>කෙටි කේතය</th><th style="width:100px">Actions</th></tr></thead>
                <tbody id="km_places_body">${places.length ? places.map((p, i) => `<tr data-id="${esc(p.id)}"><td style="padding:8px">${i + 1}</td><td style="padding:8px">${esc(p.place)}</td><td style="padding:8px;word-break:break-word;">${esc(p.code)}</td><td style="padding:8px"><button class="km_edit_place km_btn" data-id="${esc(p.id)}" style="margin-right:3px">Edit</button><button class="km_del_place km_btn km_btn_del" data-id="${esc(p.id)}">Del</button></td></tr>`).join("") : `<tr><td colspan="4" style="padding:10px;color:#666;">No places</td></tr>`}</tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 style="margin:0 0 8px 0;">නිවාඩු වර්ග (Holiday Types)</h4>
            <div style="background:#fff;padding:10px;border-radius:8px;overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <thead><tr style="text-align:left"><th style="width:36px">#</th><th>Holiday Name</th><th style="width:100px">Actions</th></tr></thead>
                <tbody id="km_holiday_body">${holidays.length ? holidays.map((h, i) => `<tr data-id="${esc(h.id)}"><td style="padding:8px">${i + 1}</td><td style="padding:8px">${esc(h.name)}</td><td style="padding:8px"><button class="km_edit_holiday km_btn" data-id="${esc(h.id)}" style="margin-right:3px">Edit</button><button class="km_del_holiday km_btn km_btn_del" data-id="${esc(h.id)}">Del</button></td></tr>`).join("") : `<tr><td colspan="3" style="padding:10px;color:#666;">No holidays</td></tr>`}</tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- New Fixed Dates Table -->
        <div style="margin-top: 24px;">
          <h4 style="margin:0 0 12px 0; color: #0b5ea8; text-align: center;">රාජකාරි සදහා නියත දිනයන් ලබා දීම</h4>
          <div style="background:#fff;padding:12px;border-radius:8px;overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:13px; text-align: left;">
              <thead>
                <tr style="text-align:left; background: #f0f7ff;">
                  <th style="width:40px; padding:8px;">#</th>
                  <th style="padding:8px; min-width:100px;">රාජකාරි</th>
                  <th style="padding:8px; min-width:100px;">ස්ථානය</th>
                  <th style="padding:8px; min-width:80px;">දවස</th>
                  <th style="padding:8px; min-width:70px;">සති</th>
                  <th style="padding:8px; min-width:70px;">වෙල්</th>
                  <th style="width:80px; padding:8px;">Actions</th>
                </tr>
              </thead>
              <tbody id="km_fixed_dates_body">
                ${fixedDates.length ? fixedDates.map((fd, i) => `
                  <tr data-id="${esc(fd.id)}">
                    <td style="padding:8px">${i + 1}</td>
                    <td style="padding:8px; min-width:100px;">
                      <select class="fd_role_select" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;" disabled>
                        ${roles.map(r => `<option value="${esc(r.id)}" ${r.id === fd.roleId ? 'selected' : ''}>${esc(r.role)}</option>`).join('')}
                      </select>
                    </td>
                    <td style="padding:8px; min-width:100px;">
                      <select class="fd_place_select" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;" disabled>
                        ${places.map(p => `<option value="${esc(p.id)}" ${p.id === fd.placeId ? 'selected' : ''}>${esc(p.place)}</option>`).join('')}
                      </select>
                    </td>
                    <td style="padding:8px; min-width:80px;">
                      <select class="fd_day_select" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;" disabled>
                        <option value="monday" ${fd.day === 'monday' ? 'selected' : ''}>සදුදා</option>
                        <option value="tuesday" ${fd.day === 'tuesday' ? 'selected' : ''}>අඟහරුවාදා</option>
                        <option value="wednesday" ${fd.day === 'wednesday' ? 'selected' : ''}>බදාදා</option>
                        <option value="thursday" ${fd.day === 'thursday' ? 'selected' : ''}>බ්‍රහස්පතින්දා</option>
                        <option value="friday" ${fd.day === 'friday' ? 'selected' : ''}>සිකුරාදා</option>
                        <option value="saturday" ${fd.day === 'saturday' ? 'selected' : ''}>සෙනසුරාදා</option>
                        <option value="sunday" ${fd.day === 'sunday' ? 'selected' : ''}>ඉරිදා</option>
                      </select>
                    </td>
                    <td style="padding:8px; min-width:70px;">
                      <select class="fd_week_select" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;" disabled>
                        <option value="1" ${fd.week === '1' ? 'selected' : ''}>1</option>
                        <option value="2" ${fd.week === '2' ? 'selected' : ''}>2</option>
                        <option value="3" ${fd.week === '3' ? 'selected' : ''}>3</option>
                        <option value="4" ${fd.week === '4' ? 'selected' : ''}>4</option>
                        <option value="5" ${fd.week === '5' ? 'selected' : ''}>5</option>
                      </select>
                    </td>
                    <td style="padding:8px; min-width:70px;">
                      <select class="fd_time_select" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;" disabled>
                        <option value="morning" ${fd.time === 'morning' ? 'selected' : ''}>පෙරවරු</option>
                        <option value="afternoon" ${fd.time === 'afternoon' ? 'selected' : ''}>පස්වරු</option>
                        <option value="full_day" ${fd.time === 'full_day' ? 'selected' : ''}>දවසම</option>
                      </select>
                    </td>
                    <td style="padding:8px">
                      <button class="fd_edit km_btn" data-id="${esc(fd.id)}" style="margin-right:2px;">Edit</button>
                      <button class="fd_delete km_btn km_btn_del" data-id="${esc(fd.id)}">Del</button>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="7" style="padding:10px;color:#666; text-align: center;">No fixed dates</td>
                  </tr>
                `}
                
                <!-- Add New Row -->
                <tr id="fd_new_row">
                  <td style="padding:8px; color: #666;">New</td>
                  <td style="padding:8px; min-width:100px;">
                    <select id="fd_new_role" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;">
                      <option value="">-- Select Role --</option>
                      ${roles.map(r => `<option value="${esc(r.id)}">${esc(r.role)}</option>`).join('')}
                    </select>
                  </td>
                  <td style="padding:8px; min-width:100px;">
                    <select id="fd_new_place" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;">
                      <option value="">-- Select Place --</option>
                      ${places.map(p => `<option value="${esc(p.id)}">${esc(p.place)}</option>`).join('')}
                    </select>
                  </td>
                  <td style="padding:8px; min-width:80px;">
                    <select id="fd_new_day" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;">
                      <option value="monday">සදුදා</option>
                      <option value="tuesday">අඟහරුවාදා</option>
                      <option value="wednesday">බදාදා</option>
                      <option value="thursday">බ්‍රහස්පතින්දා</option>
                      <option value="friday">සිකුරාදා</option>
                      <option value="saturday">සෙනසුරාදා</option>
                      <option value="sunday">ඉරිදා</option>
                    </select>
                  </td>
                  <td style="padding:8px; min-width:70px;">
                    <select id="fd_new_week" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;">
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </td>
                  <td style="padding:8px; min-width:70px;">
                    <select id="fd_new_time" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;">
                      <option value="morning">පෙරවරු</option>
                      <option value="afternoon">පස්වරු</option>
                      <option value="full_day">දවසම</option>
                    </select>
                  </td>
                  <td style="padding:8px">
                    <button id="fd_add" style="padding:6px 10px; background: #0b74d1; color: white; border: none; border-radius: 4px; width:100%; cursor:pointer;">Add</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // build initial form for "role" by default
    const formWrap = container.querySelector("#km_form_wrap");
    const choice = container.querySelector("#km_choice");
    let editing = { type: null, id: null };

    function renderFormFor(type) {
      // type: "role" or "place" or "holiday"
      editing = { type: null, id: null };
      if (type === "role") {
        formWrap.innerHTML = `
          <div style="display:grid;grid-template-columns:1fr;gap:10px;">
            <div>
              <label style="font-weight:600;display:block;margin-bottom:6px;">රාජකාරිය</label>
              <input id="km_role_input" placeholder="උදා: තනතුර" style="width:100%;padding:8px;border:1px solid #d0d6db;border-radius:8px;box-sizing:border-box;" />
            </div>
            <div>
              <label style="font-weight:600;display:block;margin-bottom:6px;">කෙටි කේතය</label>
              <input id="km_role_code" placeholder="උදා: R01" style="width:100%;padding:8px;border:1px solid #d0d6db;border-radius:8px;box-sizing:border-box;" />
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button id="km_role_save" style="background:#0b74d1;color:#fff;padding:8px 12px;border-radius:8px;border:none;flex:1;min-width:120px;">Save Role</button>
              <button id="km_role_clear" style="padding:8px 12px;border-radius:8px;flex:1;min-width:120px;">Clear</button>
            </div>
          </div>
        `;
      } else if (type === "place") {
        formWrap.innerHTML = `
          <div style="display:grid;grid-template-columns:1fr;gap:10px;">
            <div>
              <label style="font-weight:600;display:block;margin-bottom:6px;">රාජකාරි ස්ථානය</label>
              <input id="km_place_input" placeholder="උදා: ගරු දිස්ත්‍රික්ක කාර්යාලය" style="width:100%;padding:8px;border:1px solid #d0d6db;border-radius:8px;box-sizing:border-box;" />
            </div>
            <div>
              <label style="font-weight:600;display:block;margin-bottom:6px;">කෙටි කේතය</label>
              <input id="km_place_code" placeholder="පෙ.කේතය" style="width:100%;padding:8px;border:1px solid #d0d6db;border-radius:8px;box-sizing:border-box;" />
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button id="km_place_save" style="background:#0b74d1;color:#fff;padding:8px 12px;border-radius:8px;border:none;flex:1;min-width:120px;">Save Place</button>
              <button id="km_place_clear" style="padding:8px 12px;border-radius:8px;flex:1;min-width:120px;">Clear</button>
            </div>
          </div>
        `;
      } else if (type === "holiday") {
        formWrap.innerHTML = `
          <div style="display:grid;grid-template-columns:1fr;gap:10px;">
            <div>
              <label style="font-weight:600;display:block;margin-bottom:6px;">Holiday Name</label>
              <input id="km_holiday_input" placeholder="e.g. Poya Day" style="width:100%;padding:8px;border:1px solid #d0d6db;border-radius:8px;box-sizing:border-box;" />
            </div>
            <div>
              <label style="font-weight:600;display:block;margin-bottom:6px;">Short Code</label>
              <input id="km_holiday_code" placeholder="e.g. H01" style="width:100%;padding:8px;border:1px solid #d0d6db;border-radius:8px;box-sizing:border-box;" readonly />
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button id="km_holiday_save" style="background:#0b74d1;color:#fff;padding:8px 12px;border-radius:8px;border:none;flex:1;min-width:120px;">Save Holiday</button>
              <button id="km_holiday_clear" style="padding:8px 12px;border-radius:8px;flex:1;min-width:120px;">Clear</button>
            </div>
          </div>
        `;

        attachFormHandlers("holiday");
        return; // form handlers attached, return to avoid double attach below
      }

      attachFormHandlers(type);
    }

    function refreshTables() {
      const roles = load(ROLES_KEY);
      const places = load(PLACES_KEY);
      const holidays = load(HOLIDAY_KEY);
      const fixedDates = load(FIXED_DATES_KEY);

      const rolesBody = container.querySelector("#km_roles_body");
      const placesBody = container.querySelector("#km_places_body");
      const holidayBody = container.querySelector("#km_holiday_body");
      const fixedDatesBody = container.querySelector("#km_fixed_dates_body");

      if (roles.length) {
        rolesBody.innerHTML = roles.map((r, i) => `<tr data-id="${esc(r.id)}"><td style="padding:8px">${i + 1}</td><td style="padding:8px">${esc(r.role)}</td><td style="padding:8px;word-break:break-word;">${esc(r.code)}</td><td style="padding:8px"><button class="km_edit_role km_btn" data-id="${esc(r.id)}" style="margin-right:3px">Edit</button><button class="km_del_role km_btn km_btn_del" data-id="${esc(r.id)}">Del</button></td></tr>`).join("");
      } else rolesBody.innerHTML = `<tr><td colspan="4" style="padding:10px;color:#666;">No roles</td></tr>`;

      if (places.length) {
        placesBody.innerHTML = places.map((p, i) => `<tr data-id="${esc(p.id)}"><td style="padding:8px">${i + 1}</td><td style="padding:8px">${esc(p.place)}</td><td style="padding:8px;word-break:break-word;">${esc(p.code)}</td><td style="padding:8px"><button class="km_edit_place km_btn" data-id="${esc(p.id)}" style="margin-right:3px">Edit</button><button class="km_del_place km_btn km_btn_del" data-id="${esc(p.id)}">Del</button></td></tr>`).join("");
      } else placesBody.innerHTML = `<tr><td colspan="4" style="padding:10px;color:#666;">No places</td></tr>`;

      if (holidays.length) {
        holidayBody.innerHTML = holidays.map((h, i) => `<tr data-id="${esc(h.id)}"><td style="padding:8px">${i + 1}</td><td style="padding:8px">${esc(h.name)}</td><td style="padding:8px"><button class="km_edit_holiday km_btn" data-id="${esc(h.id)}" style="margin-right:3px">Edit</button><button class="km_del_holiday km_btn km_btn_del" data-id="${esc(h.id)}">Del</button></td></tr>`).join("");
      } else holidayBody.innerHTML = `<tr><td colspan="3" style="padding:10px;color:#666;">No holidays</td></tr>`;

      // Refresh Fixed Dates Table
      if (fixedDates.length) {
        const fixedDatesHTML = fixedDates.map((fd, i) => `
          <tr data-id="${esc(fd.id)}">
            <td style="padding:8px">${i + 1}</td>
            <td style="padding:8px; min-width:100px;">
              <select class="fd_role_select" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;" disabled>
                ${roles.map(r => `<option value="${esc(r.id)}" ${r.id === fd.roleId ? 'selected' : ''}>${esc(r.role)}</option>`).join('')}
              </select>
            </td>
            <td style="padding:8px; min-width:100px;">
              <select class="fd_place_select" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;" disabled>
                ${places.map(p => `<option value="${esc(p.id)}" ${p.id === fd.placeId ? 'selected' : ''}>${esc(p.place)}</option>`).join('')}
              </select>
            </td>
            <td style="padding:8px; min-width:80px;">
              <select class="fd_day_select" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;" disabled>
                <option value="monday" ${fd.day === 'monday' ? 'selected' : ''}>සදුදා</option>
                <option value="tuesday" ${fd.day === 'tuesday' ? 'selected' : ''}>අඟහරුවාදා</option>
                <option value="wednesday" ${fd.day === 'wednesday' ? 'selected' : ''}>බදාදා</option>
                <option value="thursday" ${fd.day === 'thursday' ? 'selected' : ''}>බ්‍රහස්පතින්දා</option>
                <option value="friday" ${fd.day === 'friday' ? 'selected' : ''}>සිකුරාදා</option>
                <option value="saturday" ${fd.day === 'saturday' ? 'selected' : ''}>සෙනසුරාදා</option>
                <option value="sunday" ${fd.day === 'sunday' ? 'selected' : ''}>ඉරිදා</option>
              </select>
            </td>
            <td style="padding:8px; min-width:70px;">
              <select class="fd_week_select" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;" disabled>
                <option value="1" ${fd.week === '1' ? 'selected' : ''}>1</option>
                <option value="2" ${fd.week === '2' ? 'selected' : ''}>2</option>
                <option value="3" ${fd.week === '3' ? 'selected' : ''}>3</option>
                <option value="4" ${fd.week === '4' ? 'selected' : ''}>4</option>
                <option value="5" ${fd.week === '5' ? 'selected' : ''}>5</option>
              </select>
            </td>
            <td style="padding:8px; min-width:70px;">
              <select class="fd_time_select" style="width:100%; padding:4px; border:1px solid #d0d6db; border-radius:4px;" disabled>
                <option value="morning" ${fd.time === 'morning' ? 'selected' : ''}>පෙරවරු</option>
                <option value="afternoon" ${fd.time === 'afternoon' ? 'selected' : ''}>පස්වරු</option>
                <option value="full_day" ${fd.time === 'full_day' ? 'selected' : ''}>දවසම</option>
              </select>
            </td>
            <td style="padding:8px">
              <button class="fd_edit km_btn" data-id="${esc(fd.id)}" style="margin-right:2px;">Edit</button>
              <button class="fd_delete km_btn km_btn_del" data-id="${esc(fd.id)}">Del</button>
            </td>
          </tr>
        `).join('');

        fixedDatesBody.innerHTML = fixedDatesHTML + fixedDatesBody.querySelector("#fd_new_row").outerHTML;
      } else {
        fixedDatesBody.innerHTML = `
          <tr>
            <td colspan="7" style="padding:10px;color:#666; text-align: center;">No fixed dates</td>
          </tr>
          ${fixedDatesBody.querySelector("#fd_new_row").outerHTML}
        `;
      }

      // Update new row dropdowns with latest roles and places
      const newRoleSelect = fixedDatesBody.querySelector("#fd_new_role");
      const newPlaceSelect = fixedDatesBody.querySelector("#fd_new_place");

      if (newRoleSelect) {
        newRoleSelect.innerHTML = '<option value="">-- Select Role --</option>' +
          roles.map(r => `<option value="${esc(r.id)}">${esc(r.role)}</option>`).join('');
      }
      if (newPlaceSelect) {
        newPlaceSelect.innerHTML = '<option value="">-- Select Place --</option>' +
          places.map(p => `<option value="${esc(p.id)}">${esc(p.place)}</option>`).join('');
      }

      attachTableActionHandlers();
      attachFixedDatesHandlers();
    }

    function attachFormHandlers(type) {
      if (type === "role") {
        const saveBtn = formWrap.querySelector("#km_role_save");
        const clearBtn = formWrap.querySelector("#km_role_clear");
        const roleInput = formWrap.querySelector("#km_role_input");
        const codeInput = formWrap.querySelector("#km_role_code");

        saveBtn.addEventListener("click", () => {
          const roleVal = roleInput.value.trim();
          const codeVal = codeInput.value.trim();
          if (!roleVal) return alert("රාජකාරිය අකුරු ඇතුලත් කරන්න (Role is required)");
          const arr = load(ROLES_KEY);
          if (editing.type === "role" && editing.id) {
            const idx = arr.findIndex(x => String(x.id) === String(editing.id));
            if (idx >= 0) arr[idx] = { id: editing.id, role: roleVal, code: codeVal };
            else arr.unshift({ id: editing.id, role: roleVal, code: codeVal });
          } else {
            arr.unshift({ id: uid(), role: roleVal, code: codeVal });
          }
          save(ROLES_KEY, arr);
          editing = { type: null, id: null };
          renderFormFor(choice.value);
          refreshTables();
        });

        clearBtn.addEventListener("click", () => {
          editing = { type: null, id: null };
          roleInput.value = "";
          codeInput.value = "";
        });
      } else if (type === "place") {
        const saveBtn = formWrap.querySelector("#km_place_save");
        const clearBtn = formWrap.querySelector("#km_place_clear");
        const placeInput = formWrap.querySelector("#km_place_input");
        const codeInput = formWrap.querySelector("#km_place_code");

        saveBtn.addEventListener("click", () => {
          const placeVal = placeInput.value.trim();
          const codeVal = codeInput.value.trim();
          if (!placeVal) return alert("රාජකාරි ස්ථානය ඇතුලත් කරන්න (Place is required)");
          const arr = load(PLACES_KEY);
          if (editing.type === "place" && editing.id) {
            const idx = arr.findIndex(x => String(x.id) === String(editing.id));
            if (idx >= 0) arr[idx] = { id: editing.id, place: placeVal, code: codeVal };
            else arr.unshift({ id: editing.id, place: placeVal, code: codeVal });
          } else {
            arr.unshift({ id: uid(), place: placeVal, code: codeVal });
          }
          save(PLACES_KEY, arr);
          editing = { type: null, id: null };
          renderFormFor(choice.value);
          refreshTables();
        });

        clearBtn.addEventListener("click", () => {
          editing = { type: null, id: null };
          placeInput.value = "";
          codeInput.value = "";
        });
      } else if (type === "holiday") {
        const saveBtn = formWrap.querySelector("#km_holiday_save");
        const clearBtn = formWrap.querySelector("#km_holiday_clear");
        const nameInput = formWrap.querySelector("#km_holiday_input");
        const codeInput = formWrap.querySelector("#km_holiday_code");

        saveBtn.addEventListener("click", () => {
          const nameVal = nameInput.value.trim();
          const codeVal = codeInput.value.trim();
          if (!nameVal) return alert("Holiday name required");

          const arr = load(HOLIDAY_KEY);

          if (editing.type === "holiday" && editing.id) {
            const idx = arr.findIndex(x => String(x.id) === String(editing.id));
            if (idx >= 0) arr[idx] = { id: editing.id, name: nameVal, code: codeVal };
            else arr.unshift({ id: editing.id, name: nameVal, code: codeVal });
          } else {
            arr.unshift({ id: uid(), name: nameVal, code: codeVal });
          }

          save(HOLIDAY_KEY, arr);
          editing = { type: null, id: null };
          renderFormFor(choice.value);
          refreshTables();
        });

        clearBtn.addEventListener("click", () => {
          editing = { type: null, id: null };
          nameInput.value = "";
          codeInput.value = "";
        });
      }
    }

    function attachTableActionHandlers() {
      // role edit / delete
      const editRoleButtons = container.querySelectorAll(".km_edit_role");
      editRoleButtons.forEach(btn => btn.addEventListener("click", function () {
        const id = this.dataset.id;
        const arr = load(ROLES_KEY);
        const rec = arr.find(x => String(x.id) === String(id));
        if (!rec) return alert("Record not found");
        choice.value = "role"; renderFormFor("role");
        editing = { type: "role", id: rec.id };
        const roleInput = formWrap.querySelector("#km_role_input");
        const codeInput = formWrap.querySelector("#km_role_code");
        roleInput.value = rec.role || "";
        codeInput.value = rec.code || "";
        roleInput.focus();
      }));

      const delRoleButtons = container.querySelectorAll(".km_del_role");
      delRoleButtons.forEach(btn => btn.addEventListener("click", function () {
        const id = this.dataset.id;
        if (!confirm("Delete this role?")) return;
        const arr = load(ROLES_KEY).filter(x => String(x.id) !== String(id));
        save(ROLES_KEY, arr);
        refreshTables();
      }));

      // place edit / delete
      const editPlaceButtons = container.querySelectorAll(".km_edit_place");
      editPlaceButtons.forEach(btn => btn.addEventListener("click", function () {
        const id = this.dataset.id;
        const arr = load(PLACES_KEY);
        const rec = arr.find(x => String(x.id) === String(id));
        if (!rec) return alert("Record not found");
        choice.value = "place"; renderFormFor("place");
        editing = { type: "place", id: rec.id };
        const placeInput = formWrap.querySelector("#km_place_input");
        const codeInput = formWrap.querySelector("#km_place_code");
        placeInput.value = rec.place || "";
        codeInput.value = rec.code || "";
        placeInput.focus();
      }));

      const delPlaceButtons = container.querySelectorAll(".km_del_place");
      delPlaceButtons.forEach(btn => btn.addEventListener("click", function () {
        const id = this.dataset.id;
        if (!confirm("Delete this place?")) return;
        const arr = load(PLACES_KEY).filter(x => String(x.id) !== String(id));
        save(PLACES_KEY, arr);
        refreshTables();
      }));

      // holiday edit / delete
      const editHolidayButtons = container.querySelectorAll(".km_edit_holiday");
      editHolidayButtons.forEach(btn => btn.addEventListener("click", function () {
        const id = this.dataset.id;
        const arr = load(HOLIDAY_KEY);
        const rec = arr.find(x => String(x.id) === String(id));
        if (!rec) return alert("Record not found");
        choice.value = "holiday"; renderFormFor("holiday");
        editing = { type: "holiday", id: rec.id };
        const nameInput = formWrap.querySelector("#km_holiday_input");
        const codeInput = formWrap.querySelector("#km_holiday_code");
        nameInput.value = rec.name || "";
        codeInput.value = rec.code || "";
        nameInput.focus();
      }));

      const delHolidayButtons = container.querySelectorAll(".km_del_holiday");
      delHolidayButtons.forEach(btn => btn.addEventListener("click", function () {
        const id = this.dataset.id;
        if (!confirm("Delete this holiday type?")) return;
        const arr = load(HOLIDAY_KEY).filter(x => String(x.id) !== String(id));
        save(HOLIDAY_KEY, arr);
        refreshTables();
      }));
    }

    function attachFixedDatesHandlers() {
      const addBtn = container.querySelector("#fd_add");
      const editButtons = container.querySelectorAll(".fd_edit");
      const deleteButtons = container.querySelectorAll(".fd_delete");

      // Add new fixed date
      if (addBtn) {
        addBtn.addEventListener("click", function () {
          const roleSelect = container.querySelector("#fd_new_role");
          const placeSelect = container.querySelector("#fd_new_place");
          const daySelect = container.querySelector("#fd_new_day");
          const weekSelect = container.querySelector("#fd_new_week");
          const timeSelect = container.querySelector("#fd_new_time");

          const roleId = roleSelect.value;
          const placeId = placeSelect.value;
          const day = daySelect.value;
          const week = weekSelect.value;
          const time = timeSelect.value;

          if (!roleId || !placeId || !day || !week || !time) {
            return alert("All fields are required");
          }

          const arr = load(FIXED_DATES_KEY);
          arr.unshift({
            id: uid(),
            roleId: roleId,
            placeId: placeId,
            day: day,
            week: week,
            time: time
          });

          save(FIXED_DATES_KEY, arr);
          refreshTables();
        });
      }

      // Edit fixed date
      editButtons.forEach(btn => {
        btn.addEventListener("click", function () {
          const id = this.dataset.id;
          const row = this.closest("tr");
          const roleSelect = row.querySelector(".fd_role_select");
          const placeSelect = row.querySelector(".fd_place_select");
          const daySelect = row.querySelector(".fd_day_select");
          const weekSelect = row.querySelector(".fd_week_select");
          const timeSelect = row.querySelector(".fd_time_select");

          // Enable editing
          const isEditing = roleSelect.disabled === false;

          if (isEditing) {
            // Save changes
            const roleId = roleSelect.value;
            const placeId = placeSelect.value;
            const day = daySelect.value;
            const week = weekSelect.value;
            const time = timeSelect.value;

            if (!roleId || !placeId || !day || !week || !time) {
              return alert("All fields are required");
            }

            const arr = load(FIXED_DATES_KEY);
            const idx = arr.findIndex(x => String(x.id) === String(id));
            if (idx >= 0) {
              arr[idx] = {
                id: id,
                roleId: roleId,
                placeId: placeId,
                day: day,
                week: week,
                time: time
              };
              save(FIXED_DATES_KEY, arr);
              refreshTables();
            }
          } else {
            // Enable editing mode
            roleSelect.disabled = false;
            placeSelect.disabled = false;
            daySelect.disabled = false;
            weekSelect.disabled = false;
            timeSelect.disabled = false;
            this.textContent = "Save";
          }
        });
      });

      // Delete fixed date
      deleteButtons.forEach(btn => {
        btn.addEventListener("click", function () {
          const id = this.dataset.id;
          if (!confirm("Delete this fixed date?")) return;
          const arr = load(FIXED_DATES_KEY).filter(x => String(x.id) !== String(id));
          save(FIXED_DATES_KEY, arr);
          refreshTables();
        });
      });
    }

    // initial render & handlers
    renderFormFor(choice.value);
    refreshTables();

    choice.addEventListener("change", () => {
      renderFormFor(choice.value);
    });
  }

  // expose
  window.renderPhiKeyMapTab = renderPhiKeyMapTab;
})();
