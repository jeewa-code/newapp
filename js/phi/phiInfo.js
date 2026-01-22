// phiInfo.js - Updated version with photo saving fix

(function () {
  const PHI_INFO_KEY = "phi_info_v1";
  const SHORT_KEY_INSPECTOR = "phi_info_inspector";
  const SHORT_KEY_AREA = "phi_info_area";
  const SHORT_KEY_PHOTO = "phi_info_photo";
  const MAX_FILE_BYTES = 10 * 1024 * 1024;

  const PROVINCES = [
    "Western", "Central", "Southern", "Northern", "Eastern",
    "North Western", "North Central", "Uva", "Sabaragamuwa"
  ];

  const RDHS_MAP = {
    "Western": ["Colombo", "Gampaha", "Kalutara"],
    "Central": ["Kandy", "Matale", "Nuwara Eliya"],
    "Southern": ["Galle", "Matara", "Hambantota"],
    "Northern": ["Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu"],
    "Eastern": ["Batticaloa", "Ampara", "Trincomalee", "Kalmunai"],
    "North Western": ["Kurunegala", "Puttalam"],
    "North Central": ["Anuradhapura", "Polonnaruwa"],
    "Uva": ["Badulla", "Monaragala"],
    "Sabaragamuwa": ["Ratnapura", "Kegalle"]
  };

  const MOH_MAP = {
    "Colombo": ["Colombo Municipal Council", "Dehiwala", "Ratmalana", "Moratuwa", "Kotte", "Battaramulla", "Nugegoda", "Maharagama", "Homagama", "Padukka", "Hanwella", "Kolonnawa", "Kaduwela", "Piliyandala", "Kahathuduwa"],
    "Gampaha": ["Gampaha", "Negombo", "Wattala", "Ja-Ela", "Kelaniya", "Mahara", "Biyagama", "Dompe", "Attanagalla", "Mirigama", "Minuwangoda", "Katana", "Divulapitiya", "Seeduwa"],
    "Kalutara": ["Wadduwa", "Panadura", "Bandaragama", "Horana", "Bulathsinhala", "Madurawala", "Millaniya", "Ingiriya", "Matugama", "Dodangoda", "Walallawita", "Agalawatta", "Palindanuwara"],
    "Kandy": ["Kandy Municipal Council", "Gangawatakorale", "Yatinuwara", "Udunuwara", "Doluwa", "Pathadumbara", "Panvila", "Udadumbara", "Kundasale", "Pujapitiya", "Hatharaliyadda", "Akurana", "Harispattuwa", "Galagedara", "Gampola", "Udapalatha", "Ganga Ihala Korale", "Pasbage Korale", "Medadumbara", "Minipe"],
    "Matale": ["Matale", "Yatawatta", "Rattota", "Ukuwela", "Ambanganga Korale", "Laggala-Pallegama", "Wilgamuwa", "Naula", "Pallepola", "Galewela", "Dambulla"],
    "Nuwara Eliya": ["Nuwara Eliya", "Ragala", "Walapane", "Hanguranketha", "Kothmale", "Hatton", "Ambagamuwa", "Maskeliya", "Lindula", "Talawakelle"],
    "Galle": ["Galle Municipal Council", "Akmeemana", "Ambalangoda", "Balapitiya", "Bope-Poddala", "Elpitiya", "Gonapinuwala", "Habaraduwa", "Hikkaduwa", "Imaduwa", "Karandeniya", "Nagoda", "Neluwa", "Niyagama", "Rathgama", "Thawalama", "Welivitiya-Divithura", "Yakkalamulla", "Baddegama"],
    "Matara": ["Matara Municipal Council", "Akuressa", "Athuraliya", "Devinuwara", "Dickwella", "Hakmana", "Kamburupitiya", "Kirinda Puhulwella", "Kotapola", "Malimbada", "Mulatiyana", "Pasgoda", "Pitabeddara", "Thihagoda", "Weligama", "Welipitiya"],
    "Hambantota": ["Hambantota", "Ambalantota", "Angunukolapelessa", "Beliatta", "Katuwana", "Lunugamvehera", "Okewela", "Sooriyawewa", "Tangalle", "Thissamaharama", "Walasmulla", "Weeraketiya"],
    "Jaffna": ["Jaffna Municipal Council", "Nallur", "Chankanai", "Sandilipay", "Tellippalai", "Uduvil", "Kopay", "Karaveddy", "Point Pedro", "Chavakachcheri", "Karainagar", "Kayts", "Velanai", "Delft"],
    "Kilinochchi": ["Karachchi", "Kandavalai", "Poonakary", "Pachchilaipallai"],
    "Mannar": ["Mannar", "Mantai West", "Nanaddan", "Musali", "Madhu"],
    "Vavuniya": ["Vavuniya", "Vavuniya North", "Vavuniya South", "Vengalacheddikulam"],
    "Mullaitivu": ["Maritimepattu", "Puthukudiyiruppu", "Oddusuddan", "Thunukkai", "Manthai East", "Welioya"],
    "Batticaloa": ["Batticaloa", "Kattankudy", "Eravur", "Koralai Pattu (Valaichchenai)", "Manmunai North", "Porativu Pattu"],
    "Ampara": ["Ampara", "Dehiattakandiya", "Damana", "Uhana", "Maha Oya", "Padiyatalawa", "Lahugala"],
    "Trincomalee": ["Trincomalee", "Uppuveli", "Kuchchaveli", "Thampalakamam", "Kantale", "Kinniya", "Muttur", "Seruvila", "Gomarankadawala", "Morawewa", "Padavi Sri Pura"],
    "Kalmunai": ["Kalmunai North", "Kalmunai South", "Sainthamaruthu", "Karaitivu", "Nintavur", "Addalaichenai", "Akkaraipattu", "Alayadivembu", "Thirukkovil", "Pottuvil", "Sammanthurai", "Irakkamam", "Navithanveli"],
    "Kurunegala": ["Kurunegala Municipal Council", "Kurunegala", "Mawathagama", "Polgahawela", "Alawwa", "Narammala", "Wariyapola", "Nikaweratiya", "Mahawa", "Galgamuwa", "Yapahuwa", "Bingiriya", "Panduwasnuwara", "Kuliyapitiya", "Pannala", "Ridigama", "Ibbagamuwa"],
    "Puttalam": ["Puttalam", "Kalpitiya", "Mundel", "Mahakumbukkadawala", "Anamaduwa", "Pallama", "Wanathavilluwa", "Karuwalagaswewa", "Nawagattegama", "Chilaw", "Arachchikattuwa", "Madampe", "Mahawewa", "Nattandiya", "Wennappuwa", "Dankotuwa"],
    "Anuradhapura": ["Anuradhapura Municipal Council", "Nuwaragam Palatha Central", "Nuwaragam Palatha East", "Medawachchiya", "Rambewa", "Kebithigollewa", "Padaviya", "Horowpothana", "Kahatagasdigiliya", "Mihintale", "Nachchaduwa", "Nochchiyagama", "Rajanganaya", "Tambuttegama", "Thalawa", "Thirappane", "Galenbindunuwewa", "Palagala", "Ipalogama", "Kekirawa", "Palugaswewa"],
    "Polonnaruwa": ["Polonnaruwa", "Tamankaduwa", "Dimbulagala", "Hingurakgoda", "Medirigiriya", "Welikanda", "Lankapura", "Elahera"],
    "Badulla": ["Badulla", "Hali-Ela", "Uva Paranagama", "Welimada", "Bandarawela", "Ella", "Haputale", "Haldummulla", "Mahiyanganaya", "Rideemaliyadda", "Passara", "Soranathota", "Kandaketiya", "Meegahakiula", "Lunugala"],
    "Monaragala": ["Monaragala", "Siyambalanduwa", "Buttala", "Wellawaya", "Katharagama", "Thanamalwila", "Badalkumbura", "Bibile", "Madulla", "Medagama", "Sevanagala"],
    "Ratnapura": ["Ratnapura", "Kuruwita", "Eheliyagoda", "Pelmadulla", "Nivithigala", "Elapatha", "Ayagama", "Imbulpe", "Balangoda", "Opanayake", "Weligepola", "Embilipitiya", "Godakawela", "Kahawatta", "Rakwana", "Kolonna", "Kaltota"],
    "Kegalle": ["Kegalle", "Galigamuwa", "Warakapola", "Ruwanwella", "Yatiyanthota", "Deraniyagala", "Dehiowita", "Mawanella", "Aranayaka", "Rambukkana", "Bulathkohupitiya"]
  };

  // --- storage helpers ---
  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(PHI_INFO_KEY) || "[]");
    } catch (e) {
      console.warn("phiInfo: load error", e);
      return [];
    }
  }

  function saveAll(v) {
    try {
      localStorage.setItem(PHI_INFO_KEY, JSON.stringify(v));
      // After saving full list, also update short keys to reflect the latest
      try {
        const latest = (v && v.length) ? v[0] : null;
        if (latest && latest.name) localStorage.setItem(SHORT_KEY_INSPECTOR, latest.name);
        else localStorage.removeItem(SHORT_KEY_INSPECTOR);
        if (latest && latest.area) localStorage.setItem(SHORT_KEY_AREA, latest.area);
        else localStorage.removeItem(SHORT_KEY_AREA);

        // Save photo to standalone key
        if (latest && latest.photo) localStorage.setItem(SHORT_KEY_PHOTO, latest.photo);
        else localStorage.removeItem(SHORT_KEY_PHOTO);

        // dispatch event so other modules can react immediately
        window.dispatchEvent(new CustomEvent("phiInfoUpdated", {
          detail: {
            inspector: latest ? latest.name : "",
            area: latest ? latest.area : "",
            photo: latest ? latest.photo : ""
          }
        }));
      } catch (e) {
        console.warn("phiInfo: short key update failed", e);
      }
    } catch (e) {
      console.warn("phiInfo: save error", e);
    }
  }

  function uid() {
    return Date.now().toString(36) + Math.floor(Math.random() * 9999).toString(36);
  }

  function esc(s) {
    if (s == null) return "";
    return String(s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  // --- small ui util ---
  const baseInputStyle = "width:100%;padding:10px;border:1px solid #d0d6db;border-radius:8px;box-sizing:border-box;font-size:14px;";

  // --- Header update helper ---
  function updateHeaderInfo(latest) {
    try {
      const logoDiv = document.querySelector(".header .logo");
      const nameEl = document.querySelector(".header .profile-text strong");
      const areaEl = document.querySelector(".header .profile-text small");
      if (!logoDiv || !nameEl || !areaEl) return;

      // Photo or initial
      if (latest && latest.photo) {
        logoDiv.innerHTML = `<img src="${latest.photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
      } else {
        const initial = latest && latest.name ? latest.name.charAt(0).toUpperCase() : 'P';
        logoDiv.textContent = initial;
      }

      // Update text lines
      nameEl.textContent = latest && latest.name ? latest.name : 'PHI Name';

      // Role-based designation
      const roleDesignations = {
        'PHI': 'Public Health Inspector',
        'PHM': 'Public Health Midwife',
        'MOH': 'Medical Officer of Health',
        'SPHI': 'Supervising Public Health Inspector',
        'SPHM': 'Supervising Public Health Midwife',
        'AMOH': 'Additional Medical Officer of Health',
        'PHNS': 'Public Health Nursing Service'
      };

      const userRole = latest && latest.role ? latest.role : 'PHI';
      const designation = roleDesignations[userRole] || 'Public Health Inspector';

      areaEl.textContent = latest && latest.area ? `${designation} — ${latest.area}` : `${designation} — Area`;
    } catch (e) {
      console.warn("updateHeaderInfo failed", e);
    }
  }

  // --- Image compression function ---
  function compressImage(file, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set maximum dimensions
        let width = img.width;
        let height = img.height;
        const maxWidth = 800;
        const maxHeight = 800;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG
        const compressedDataURL = canvas.toDataURL('image/jpeg', 0.7);
        callback(compressedDataURL);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // --- main render function ---
  function renderPhiInfo(containerOrId) {
    let container = containerOrId;
    if (typeof containerOrId === "string") container = document.getElementById(containerOrId);
    if (!container || !(container instanceof HTMLElement)) {
      console.warn("phiInfo.render: container not found or invalid. Provide element or id.");
      return;
    }

    const all = loadAll().slice().sort((a, b) => {
      const da = a.date || "";
      const db = b.date || "";
      return da === db ? 0 : da > db ? -1 : 1;
    });
    const latest = all.length ? all[0] : null;

    // html
    container.innerHTML = `
      <div style="background:#fff;padding:14px;border-radius:10px;" class="phi-info-container">
        <div style="margin-bottom:10px;">
          <h3 style="margin:0 0 6px 0;color:#000;">Personal details</h3>
          <div style="color:#333;font-size:13px;">(latest saved displayed in page header)</div>
        </div>

        <div class="phi-info-grid" style="display:grid;grid-template-columns:260px 1fr;gap:12px 18px;align-items:start;">
          <div>
            <div id="phi_avatar_preview" style="width:84px;height:84px;border-radius:8px;background:#f1f1f1;display:flex;align-items:center;justify-content:center;overflow:hidden;">
              ${latest && latest.photo ?
        `<img src="${latest.photo}" style="width:100%;height:100%;object-fit:cover;">` :
        `<div style="font-weight:700;font-size:28px;color:#666;">P</div>`
      }
            </div>
            <input id="phi_photo_input" type="file" accept="image/*" style="${baseInputStyle};margin-top:8px;padding:6px;" />
            <div style="font-size:12px;color:#666;margin-top:6px;">Max ${Math.round(MAX_FILE_BYTES / 1024 / 1024)}MB — auto resize</div>
          </div>

          <div>
            <div class="phi-info-form-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              
              
              <!-- 1. Inspector Name with initials -->
              <div>
                <label for="phi_name" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">Name with initials</label>
                <input id="phi_name" style="${baseInputStyle}" value="${latest ? esc(latest.name) : ''}" />
              </div>

              <!-- 1.1 Role -->
              <div>
                <label for="phi_role" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">Role (කාර්යභාරය)</label>
                <input id="phi_role" style="${baseInputStyle};background:#f5f5f5;cursor:not-allowed;" value="${latest ? esc(latest.role || '') : ''}" placeholder="e.g. PHI, MOH, SPHI" disabled readonly />
              </div>

              <!-- 1.2 Province -->
              <div>
                <label for="phi_province" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">පළාත</label>
                <select id="phi_province" style="${baseInputStyle}">
                  ${PROVINCES.map(p => `<option value="${p}">${p}</option>`).join("")}
                </select>
              </div>

              <!-- 1.2 Authority Type -->
              <div>
                <label for="phi_auth_type" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">ආයතන වර්ගය</label>
                <select id="phi_auth_type" style="${baseInputStyle}">
                  <option value="RDHS">RDHS</option>
                  <option value="NIHS">NIHS</option>
                  <option value="Local">පළාත් පාලන</option>
                </select>
              </div>

              <!-- 1.3 Authority Detail -->
              <div>
                <label style="font-weight:600;display:block;margin-bottom:6px;color:#000;">ආයතනය / කාර්යාලය</label>
                
                <div id="container_rdhs">
                   <select id="phi_rdhs_select" style="${baseInputStyle}"></select>
                </div>

                <div id="container_nihs" style="display:none;">
                   <input value="NIHS Kalutara" disabled style="${baseInputStyle};background:#f5f5f5;color:#666;" />
                </div>

                <div id="container_local" style="display:none;">
                   <input id="phi_local_input" placeholder="පළාත් පාලන ආයතනයේ නම" style="${baseInputStyle}" />
                </div>
              </div>

               <!-- 2. MOH Office -->
              <div>
                <label style="font-weight:600;display:block;margin-bottom:6px;color:#000;">සෞඛ්‍ය වෛද්‍ය නිලධාරි කාර්යාලය</label>
                
                <div id="container_moh_select" style="display:none;">
                   <select id="phi_moh_select" style="${baseInputStyle}"></select>
                </div>

                <div id="container_moh_input">
                   <input id="phi_moh_input" style="${baseInputStyle}" value="${latest ? esc(latest.moh) : ''}" />
                </div>
              </div>

               <!-- 3. Area -->
              <div>
                <label for="phi_area" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">ක්ෂේත්‍රය</label>
                <input id="phi_area" style="${baseInputStyle}" value="${latest ? esc(latest.area) : ''}" />
              </div>

               <!-- 4. Basic Salary -->
              <div>
                <label for="phi_salary" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">මුලික වැටුප</label>
                <input id="phi_salary" type="number" step="0.01" style="${baseInputStyle}" value="${latest ? esc(latest.salary) : ''}" />
              </div>

              <!-- 5. OT Rate -->
              <div>
                <label for="phi_ot_rate" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">OT Rate</label>
                <input id="phi_ot_rate" type="number" step="0.01" style="${baseInputStyle}" value="${latest ? esc(latest.ot_rate) : ''}" />
              </div>

              <!-- 5.1 OT Limit -->
              <div>
                <label for="phi_ot_limit" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">OT Limit (hours)</label>
                <input id="phi_ot_limit" type="number" step="0.01" style="${baseInputStyle}" value="${latest ? esc(latest.ot_limit) : ''}" />
              </div>

              <!-- 6. Vehicle Type -->
              <div>
                <label for="phi_vehicle_type" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">වාහන වර්ගය</label>
                <select id="phi_vehicle_type" style="${baseInputStyle}">
                  <option value="motor_bicycle" ${latest && latest.vehicle_type === 'motor_bicycle' ? 'selected' : ''}>මෝටර් බයිසිකල්</option>
                  <option value="motor_car" ${latest && latest.vehicle_type === 'motor_car' ? 'selected' : ''}>මෝටර් රථ</option>
                </select>
              </div>

              <!-- 7. Registered Number -->
              <div>
                <label for="phi_vehicle_reg" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">Registered Number</label>
                <input id="phi_vehicle_reg" style="${baseInputStyle}" value="${latest ? esc(latest.vehicle_reg) : ''}" />
              </div>

               <!-- 8. Phone Number -->
              <div>
                <label for="phi_phone" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">දුරකථන අංකය</label>
                <input id="phi_phone" style="${baseInputStyle}" value="${latest ? esc(latest.phone) : ''}" />
              </div>

               <!-- 9. Date -->
              <div>
                <label for="phi_date" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">වැඩ භාරගත් දිනය</label>
                <input id="phi_date" type="date" style="${baseInputStyle}" value="${latest ? esc(latest.date) : ''}" />
              </div>

               <!-- 10. Short Code -->
              <div>
                <label for="phi_short" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">ක්ෂේත්‍ර කෙටි යෙදුම</label>
                <input id="phi_short" style="${baseInputStyle}" value="${latest ? esc(latest.short) : ''}" />
              </div>

            </div>
            <div style="margin-top:12px;display:flex;gap:8px;">
              <button id="phi_save" style="background:#0b74d1;color:#fff;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Save</button>
              <button id="phi_clear" style="background:#e2e8f0;padding:10px 14px;border:none;border-radius:8px;">Clear</button>
            </div>
          </div>
        </div>

        <div class="phi-info-table-wrapper" style="margin-top:12px;overflow:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap;">
            <thead>
                <tr style="text-align:left;background:#f5f5f5;border-bottom:1px solid #ddd;">
                    <th style="padding:8px;">#</th>
                    <th style="padding:8px;">Inspector Name</th>
                    <th style="padding:8px;">Role</th>
                    <th style="padding:8px;">Province</th>
                    <th style="padding:8px;">Auth Type</th>
                    <th style="padding:8px;">Auth Name</th>
                    <th style="padding:8px;">MOH Office</th>
                    <th style="padding:8px;">Area</th>
                    <th style="padding:8px;">Salary</th>
                    <th style="padding:8px;">OT Rate</th>
                    <th style="padding:8px;">OT Limit</th>
                    <th style="padding:8px;">Vehicle</th>
                    <th style="padding:8px;">Reg No</th>
                    <th style="padding:8px;">Phone</th>
                    <th style="padding:8px;">Date</th>
                    <th style="padding:8px;">Short</th>
                    <th style="padding:8px;">Photo</th>
                    <th style="padding:8px;">Actions</th>
                </tr>
            </thead>
            <tbody id="phi_info_body">
              ${all.length ? all.map((p, i) => `
                <tr data-id="${esc(p.id)}" style="border-bottom:1px solid #eee;">
                    <td style="padding:8px;vertical-align:middle">${i + 1}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.name)}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.role || '')}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.province)}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.auth_type)}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.auth_name)}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.moh)}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.area)}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.salary)}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.ot_rate)}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.ot_limit)}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.vehicle_type)}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.vehicle_reg)}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.phone)}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.date)}</td>
                    <td style="padding:8px;vertical-align:middle">${esc(p.short)}</td>
                    <td style="padding:8px;vertical-align:middle">
                        ${p.photo ? `<img src="${p.photo}" style="width:36px;height:36px;border-radius:4px;object-fit:cover;">` : '—'}
                    </td>
                    <td style="padding:8px;vertical-align:middle">
                        <button class="phi_edit" data-id="${esc(p.id)}" style="margin-right:4px;padding:4px 8px;border-radius:4px;border:1px solid #ccc;background:#f0f0f0;cursor:pointer">Edit</button>
                        <button class="phi_del" data-id="${esc(p.id)}" style="padding:4px 8px;border-radius:4px;border:1px solid #ffdddd;background:#fff0f0;cursor:pointer;color:#d00;">Del</button>
                    </td>
                </tr>`).join("") :
        `<tr><td colspan="18" style="padding:10px;text-align:center;color:#666;">No records</td></tr>`
      }
            </tbody>
          </table>
        </div>
      </div>
    `;

    // --- element refs and handlers ---
    const photoInput = container.querySelector("#phi_photo_input");
    const preview = container.querySelector("#phi_avatar_preview");

    // New Refs
    const provSelect = container.querySelector("#phi_province");
    const authTypeSelect = container.querySelector("#phi_auth_type");
    const rdhsContainer = container.querySelector("#container_rdhs");
    const rdhsSelect = container.querySelector("#phi_rdhs_select");
    const nihsContainer = container.querySelector("#container_nihs");
    const localContainer = container.querySelector("#container_local");
    const localInput = container.querySelector("#phi_local_input");

    // NEW REFS for MOH
    const mohSelectContainer = container.querySelector("#container_moh_select");
    const mohInputContainer = container.querySelector("#container_moh_input");
    const mohSelect = container.querySelector("#phi_moh_select");
    const mohInput = container.querySelector("#phi_moh_input");

    let editId = null;
    let currentPhotoData = latest ? latest.photo : null;
    const NIHS_MOH_LIST = ["කලුතර", "බේරුවල", "පයාගය"];

    // --- Dynamic Logic ---
    function updateAuthOptions() {
      const prov = provSelect.value;
      const current = authTypeSelect.value;

      let html = '<option value="RDHS">RDHS</option>';
      if (prov === "Western") {
        html += '<option value="NIHS">NIHS</option>';
      }
      html += '<option value="Local">පළාත් පාලන</option>';

      authTypeSelect.innerHTML = html;

      // Restore selection if valid
      if (current === "NIHS" && prov !== "Western") {
        authTypeSelect.value = "RDHS";
      } else {
        const exists = Array.from(authTypeSelect.options).some(o => o.value === current);
        authTypeSelect.value = exists ? current : "RDHS";
      }
    }

    function populateRdhs(prov) {
      const list = RDHS_MAP[prov] || [];
      rdhsSelect.innerHTML = list.map(x => `<option value="${x}">${x}</option>`).join("");
    }

    function populateMoh(source, explicitList = null) {
      if (explicitList) {
        mohSelect.innerHTML = explicitList.map(x => `<option value="${x}">${x}</option>`).join("");
        return;
      }
      const list = MOH_MAP[source] || [];
      mohSelect.innerHTML = list.map(x => `<option value="${x}">${x}</option>`).join("");
    }

    function updateAuthUI() {
      const type = authTypeSelect.value;
      rdhsContainer.style.display = "none";
      nihsContainer.style.display = "none";
      localContainer.style.display = "none";

      if (type === "RDHS") {
        rdhsContainer.style.display = "block";
        if (rdhsSelect.options.length === 0) populateRdhs(provSelect.value);

        mohSelectContainer.style.display = "block";
        mohInputContainer.style.display = "none";

        // Populate MOH logic for RDHS
        // Only repopulate if list is empty or context changed?
        // Safer to just repopulate based on current RDHS selection
        populateMoh(rdhsSelect.value);

      } else if (type === "NIHS") {
        nihsContainer.style.display = "block";

        // Logic for NIHS: Show MOH Dropdown with Specific List
        mohSelectContainer.style.display = "block";
        mohInputContainer.style.display = "none";

        populateMoh(null, NIHS_MOH_LIST);

      } else if (type === "Local") {
        localContainer.style.display = "block";
        mohSelectContainer.style.display = "none";
        mohInputContainer.style.display = "block";
      }
    }

    // Init state based on latest or default
    if (latest) {
      if (latest.province) provSelect.value = latest.province;
      updateAuthOptions(); // ensure NIHS option availability based on prov

      populateRdhs(provSelect.value);

      if (latest.auth_type) {
        // Check if auth_type is valid (e.g. NIHS but prov changed?)
        // updateAuthOptions already handles validation/fallback
        const hasOpt = Array.from(authTypeSelect.options).some(o => o.value === latest.auth_type);
        if (hasOpt) authTypeSelect.value = latest.auth_type;
      }

      if (latest.auth_type === 'RDHS' || !latest.auth_type) {
        if (latest.auth_name) rdhsSelect.value = latest.auth_name;
      } else if (latest.auth_type === 'Local' && latest.auth_name) {
        localInput.value = latest.auth_name;
      }

      // Run UI update to show correct fields and populate MOH defaults
      updateAuthUI();

      // Restore MOH Value
      if (authTypeSelect.value === 'RDHS' || authTypeSelect.value === 'NIHS') {
        if (latest.moh) mohSelect.value = latest.moh;
      } else {
        if (latest.moh) mohInput.value = latest.moh;
      }

    } else {
      // Defaults
      provSelect.value = "Western";
      updateAuthOptions();
      updateAuthUI();
    }

    // Event Listeners
    provSelect.addEventListener("change", () => {
      updateAuthOptions();
      populateRdhs(provSelect.value);
      updateAuthUI();
    });

    rdhsSelect.addEventListener("change", () => {
      populateMoh(rdhsSelect.value);
    });

    authTypeSelect.addEventListener("change", updateAuthUI);


    photoInput.addEventListener("change", function (e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) return alert("Please select an image file.");
      if (file.size > MAX_FILE_BYTES) return alert("File too large.");

      // Compress and preview image
      compressImage(file, function (compressedDataURL) {
        currentPhotoData = compressedDataURL;
        preview.innerHTML = `<img src="${compressedDataURL}" style="width:100%;height:100%;object-fit:cover;">`;
      });
    });

    function refresh() {
      renderPhiInfo(container);
    }

    container.querySelector("#phi_save").addEventListener("click", function () {
      const name = container.querySelector("#phi_name").value.trim();
      const role = container.querySelector("#phi_role").value.trim();

      // Determine MOH based on Auth Type
      let moh = "";
      const atype = authTypeSelect.value;
      if (atype === "RDHS" || atype === "NIHS") {
        moh = mohSelect.value;
      } else {
        moh = mohInput.value.trim();
      }

      const area = container.querySelector("#phi_area").value.trim();
      const salary = container.querySelector("#phi_salary").value.trim();
      const ot_rate = container.querySelector("#phi_ot_rate").value.trim();
      const ot_limit = container.querySelector("#phi_ot_limit").value.trim();
      const vehicle_type = container.querySelector("#phi_vehicle_type").value;
      const vehicle_reg = container.querySelector("#phi_vehicle_reg").value.trim();
      const phone = container.querySelector("#phi_phone").value.trim();
      const date = container.querySelector("#phi_date").value || "";
      const short = container.querySelector("#phi_short").value.trim();

      // New fields
      const province = provSelect.value;
      const auth_type = authTypeSelect.value;
      let auth_name = "";

      if (auth_type === "RDHS") auth_name = rdhsSelect.value;
      else if (auth_type === "NIHS") auth_name = "Kalutara"; // Fixed
      else if (auth_type === "Local") auth_name = localInput.value.trim();

      if (!name || !moh || !area) {
        if (window.showWarning) {
          showWarning("පරීක්ෂකගේ නම, සෞඛ්‍ය වෛද්‍ය නිලධාරි කාර්යාලය සහ  ක්ෂේත්‍රය ඇතුළත් කිරීම අනිවාර්ය වේ!\nPlease enter Inspector Name, MOH Office and Area!");
        } else {
          alert("පරීක්ෂකගේ නම, සෞඛ්‍ය වෛද්‍ය නිලධාරි කාර්යාලය සහ  ක්ෂේත්‍රය ඇතුළත් කිරීම අනිවාර්ය වේ!\nPlease enter Inspector Name, MOH Office and Area!");
        }
        return;
      }

      function persist() {
        const arr = loadAll();
        const newObj = {
          name,
          role,
          province,
          auth_type,
          auth_name,
          moh,
          area,
          salary,
          ot_rate,
          ot_limit,
          vehicle_type,
          vehicle_reg,
          phone,
          date,
          short,
          photo: currentPhotoData
        };

        if (editId == null) {
          // New record
          newObj.id = uid();
          arr.unshift(newObj);
        } else {
          // Edit existing record
          const idx = arr.findIndex(x => String(x.id) === String(editId));
          if (idx >= 0) {
            newObj.id = editId;
            // Preserve photo if not changed
            if (currentPhotoData === null) newObj.photo = arr[idx].photo;
            arr[idx] = newObj;
          } else {
            newObj.id = editId;
            arr.unshift(newObj);
          }
        }

        saveAll(arr);
        updateHeaderInfo(arr[0] || null);
        refresh();
      }

      persist();
    });

    container.querySelector("#phi_clear").addEventListener("click", function () {
      editId = null;
      currentPhotoData = null;
      // Removed #phi_moh, Added #phi_moh_input
      ["#phi_name", "#phi_moh_input", "#phi_area", "#phi_salary", "#phi_ot_rate", "#phi_ot_limit", "#phi_vehicle_reg", "#phi_phone", "#phi_date", "#phi_short", "#phi_local_input"].forEach(s => {
        const el = container.querySelector(s);
        if (el) el.value = "";
      });
      container.querySelector("#phi_vehicle_type").value = "motor_bicycle";
      photoInput.value = "";
      preview.innerHTML = `<div style="font-weight:700;font-size:28px;color:#666;">P</div>`;

      // Reset new fields default
      provSelect.value = "Western";
      populateRdhs("Western");
      authTypeSelect.value = "RDHS";
      updateAuthUI();
      // Reset MOH list
      populateMoh(rdhsSelect.value);
    });

    // actions: edit / delete
    container.querySelectorAll(".phi_del").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = this.dataset.id;
        if (!confirm("Delete this record?")) return;
        const arr = loadAll().filter(x => String(x.id) !== String(id));
        saveAll(arr);
        updateHeaderInfo(arr[0] || null);

        // If all records are deleted, redirect to complete_profile.html
        if (arr.length === 0) {
          if (window.showWarning) {
            showWarning("Profile data deleted. Please complete your profile again.");
          }
          setTimeout(() => {
            window.location.href = 'complete_profile.html';
          }, 1500);
        } else {
          refresh();
        }
      });
    });

    container.querySelectorAll(".phi_edit").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = this.dataset.id;
        const rec = loadAll().find(x => String(x.id) === String(id));
        if (!rec) return alert("Record not found.");

        editId = id;
        currentPhotoData = rec.photo || null;

        container.querySelector("#phi_name").value = rec.name || "";
        container.querySelector("#phi_role").value = rec.role || "";

        // Populate new fields
        provSelect.value = rec.province || "Western";
        populateRdhs(provSelect.value); // refresh RDHS list for this prov

        authTypeSelect.value = rec.auth_type || "RDHS";
        updateAuthUI(); // Show correct box

        // Set value for specific types
        if (rec.auth_type === 'RDHS' || !rec.auth_type) {
          rdhsSelect.value = rec.auth_name || "";
          // Ensure MOH list is populated for the selected RDHS
          populateMoh(rdhsSelect.value);
          if (rec.moh) mohSelect.value = rec.moh;

        } else if (rec.auth_type === 'NIHS') {
          // NIHS uses dropdown now
          if (rec.moh) mohSelect.value = rec.moh;

        } else if (rec.auth_type === 'Local') {
          localInput.value = rec.auth_name || "";
          if (rec.moh) mohInput.value = rec.moh;
        } else {
          // Fallback
          if (rec.moh) mohInput.value = rec.moh;
        }

        container.querySelector("#phi_area").value = rec.area || "";
        container.querySelector("#phi_salary").value = rec.salary || "";
        container.querySelector("#phi_ot_rate").value = rec.ot_rate || "";
        container.querySelector("#phi_ot_limit").value = rec.ot_limit || "";
        container.querySelector("#phi_vehicle_type").value = rec.vehicle_type || "motor_bicycle";
        container.querySelector("#phi_vehicle_reg").value = rec.vehicle_reg || "";
        container.querySelector("#phi_phone").value = rec.phone || "";
        container.querySelector("#phi_date").value = rec.date || "";
        container.querySelector("#phi_short").value = rec.short || "";

        if (rec.photo) {
          preview.innerHTML = `<img src="${rec.photo}" style="width:100%;height:100%;object-fit:cover;">`;
        } else {
          preview.innerHTML = `<div style="font-weight:700;font-size:28px;color:#666;">P</div>`;
        }

        preview.scrollIntoView({ behavior: "smooth" });
      });
    });
  }

  // export / attach to window for compatibility
  window.renderPhiInfo = renderPhiInfo;
  window.renderPhiInfoTab = renderPhiInfo; // alias
  window.PHIInfo = window.PHIInfo || {};
  window.PHIInfo.render = renderPhiInfo;

  // ensure key exists
  if (!localStorage.getItem(PHI_INFO_KEY)) localStorage.setItem(PHI_INFO_KEY, JSON.stringify([]));

  // on initial load, update header from stored data
  document.addEventListener("DOMContentLoaded", function () {
    try {
      const all = loadAll();
      if (all && all.length) {
        updateHeaderInfo(all[0]);
        try {
          localStorage.setItem(SHORT_KEY_INSPECTOR, all[0].name || "");
          localStorage.setItem(SHORT_KEY_AREA, all[0].area || "");
          if (all[0].photo) localStorage.setItem(SHORT_KEY_PHOTO, all[0].photo);
          else localStorage.removeItem(SHORT_KEY_PHOTO);

          window.dispatchEvent(new CustomEvent("phiInfoUpdated", {
            detail: {
              inspector: all[0].name || "",
              area: all[0].area || "",
              photo: all[0].photo || ""
            }
          }));
        } catch (e) { }
      } else {
        try {
          localStorage.removeItem(SHORT_KEY_INSPECTOR);
          localStorage.removeItem(SHORT_KEY_AREA);
          localStorage.removeItem(SHORT_KEY_PHOTO);
          window.dispatchEvent(new CustomEvent("phiInfoUpdated", {
            detail: { inspector: "", area: "", photo: "" }
          }));
        } catch (e) { }
      }
    } catch (e) { }
  });

})();