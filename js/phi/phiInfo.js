// phiInfo.js - Updated version with photo saving fix

(function () {
  const PHI_INFO_KEY = "phi_info_v1";
  const SHORT_KEY_INSPECTOR = "phi_info_inspector";
  const SHORT_KEY_AREA = "phi_info_area";
  const SHORT_KEY_PHOTO = "phi_info_photo";
  const MAX_FILE_BYTES = 10 * 1024 * 1024;

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
      areaEl.textContent = latest && latest.area ? `Public Health Inspector — ${latest.area}` : 'Public Health Inspector — Area';
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
          <h3 style="margin:0 0 6px 0;color:#000;">මහජන සෞඛ්‍ය පරීක්ෂක — සාමාන්‍ය තොරතුරු</h3>
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
              <div>
                <label for="phi_name" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">පරීක්ෂකගේ නම</label>
                <input id="phi_name" style="${baseInputStyle}" value="${latest ? esc(latest.name) : ''}" />
              </div>
              <div>
                <label for="phi_area" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">ක්ෂේත්‍රය</label>
                <input id="phi_area" style="${baseInputStyle}" value="${latest ? esc(latest.area) : ''}" />
              </div>
              <div>
                <label for="phi_short" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">කෙටි යෙදුම</label>
                <input id="phi_short" style="${baseInputStyle}" value="${latest ? esc(latest.short) : ''}" />
              </div>
              <div>
                <label for="phi_phone" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">දුරකථන</label>
                <input id="phi_phone" style="${baseInputStyle}" value="${latest ? esc(latest.phone) : ''}" />
              </div>
              <div style="grid-column:1 / -1;">
                <label for="phi_date" style="font-weight:600;display:block;margin-bottom:6px;color:#000;">භාරගත් දිනය</label>
                <input id="phi_date" type="date" style="${baseInputStyle}" value="${latest ? esc(latest.date) : ''}" />
              </div>
            </div>
            <div style="margin-top:12px;display:flex;gap:8px;">
              <button id="phi_save" style="background:#0b74d1;color:#fff;padding:10px 14px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">Save</button>
              <button id="phi_clear" style="background:#e2e8f0;padding:10px 14px;border:none;border-radius:8px;">Clear</button>
            </div>
          </div>
        </div>

        <div class="phi-info-table-wrapper" style="margin-top:12px;overflow:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="text-align:left"><th style="width:48px;padding:8px">#</th><th style="padding:8px">Name</th><th style="padding:8px">Area</th><th style="padding:8px">Short</th><th style="padding:8px">Phone</th><th style="padding:8px">Date</th><th style="padding:8px">Photo</th><th style="width:140px;padding:8px">Actions</th></tr></thead>
            <tbody id="phi_info_body">
              ${all.length ? all.map((p, i) => `<tr data-id="${esc(p.id)}"><td style="padding:8px;vertical-align:middle">${i + 1}</td><td style="padding:8px;vertical-align:middle">${esc(p.name)}</td><td style="padding:8px;vertical-align:middle">${esc(p.area)}</td><td style="padding:8px;vertical-align:middle">${esc(p.short)}</td><td style="padding:8px;vertical-align:middle">${esc(p.phone)}</td><td style="padding:8px;vertical-align:middle">${esc(p.date)}</td><td style="padding:8px;vertical-align:middle">${p.photo ? `<img src="${p.photo}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;">` : '—'}</td><td style="padding:8px;vertical-align:middle"><button class="phi_edit" data-id="${esc(p.id)}" style="margin-right:6px;padding:6px 8px;border-radius:6px;border:1px solid #ccc;background:#fff;cursor:pointer">Edit</button><button class="phi_del" data-id="${esc(p.id)}" style="padding:6px 8px;border-radius:6px;border:1px solid #ccc;background:#fff;cursor:pointer">Delete</button></td></tr>`).join("") : `<tr><td colspan="8" style="padding:10px;color:#666;">No records</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // --- element refs and handlers ---
    const photoInput = container.querySelector("#phi_photo_input");
    const preview = container.querySelector("#phi_avatar_preview");
    let editId = null;
    let currentPhotoData = latest ? latest.photo : null;

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
      const area = container.querySelector("#phi_area").value.trim();
      const short = container.querySelector("#phi_short").value.trim();
      const phone = container.querySelector("#phi_phone").value.trim();
      const date = container.querySelector("#phi_date").value || "";

      if (!name || !area) {
        alert("Name and Area are required.");
        return;
      }

      function persist() {
        const arr = loadAll();
        if (editId == null) {
          // New record
          arr.unshift({
            id: uid(),
            name,
            area,
            short,
            phone,
            date,
            photo: currentPhotoData
          });
        } else {
          // Edit existing record
          const idx = arr.findIndex(x => String(x.id) === String(editId));
          if (idx >= 0) {
            arr[idx] = {
              id: editId,
              name,
              area,
              short,
              phone,
              date,
              photo: currentPhotoData !== null ? currentPhotoData : arr[idx].photo
            };
          } else {
            arr.unshift({
              id: editId,
              name,
              area,
              short,
              phone,
              date,
              photo: currentPhotoData
            });
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
      ["#phi_name", "#phi_area", "#phi_short", "#phi_phone", "#phi_date"].forEach(s => {
        const el = container.querySelector(s);
        if (el) el.value = "";
      });
      photoInput.value = "";
      preview.innerHTML = `<div style="font-weight:700;font-size:28px;color:#666;">P</div>`;
    });

    // actions: edit / delete
    container.querySelectorAll(".phi_del").forEach(btn => {
      btn.addEventListener("click", function () {
        const id = this.dataset.id;
        if (!confirm("Delete this record?")) return;
        const arr = loadAll().filter(x => String(x.id) !== String(id));
        saveAll(arr);
        updateHeaderInfo(arr[0] || null);
        refresh();
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
        container.querySelector("#phi_area").value = rec.area || "";
        container.querySelector("#phi_short").value = rec.short || "";
        container.querySelector("#phi_phone").value = rec.phone || "";
        container.querySelector("#phi_date").value = rec.date || "";

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