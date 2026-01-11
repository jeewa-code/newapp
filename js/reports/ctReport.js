/* ======================================================
   ctReport.js
   CT Report – Pocket Note Book (PNB) based
   ====================================================== */

(function () {
  "use strict";

  // -------------------------------
  // Pocket Note data helpers
  // -------------------------------
  function getPocketNotes() {
    return JSON.parse(localStorage.getItem("pocketNotes") || "[]");
  }

  function getCTRowsByMonth(year, month) {
    return getPocketNotes().filter(n => {
      if (!n.date) return false;
      const d = new Date(n.date);
      return d.getFullYear() === year && (d.getMonth() + 1) === month;
    });
  }

  function buildCTTableRows(year, month) {
    const rows = getCTRowsByMonth(year, month);

    return rows.map(n => {
      const vehicleKm =
        (Number(n.distanceMorning) || 0) +
        (Number(n.distanceAfternoon) || 0);

      return {
        date: n.date,
        outTime: n.officeDepartureMorning || "",
        inTime: n.officeArrivalAfternoon || "",
        purpose: [n.morningTasks, n.afternoonTasks].filter(Boolean).join(" / "),
        fullDay: "✔",
        session: "පෙ/ප",
        vehicle: vehicleKm ? vehicleKm.toFixed(1) : "",
        train: "",
        walk: ""
      };
    });
  }

  // -------------------------------
  // Main entry
  // -------------------------------
  window.openCTReport = function () {
    const content = document.getElementById("contentArea");
    if (!content) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const rows = buildCTTableRows(year, month);

    content.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h2>CT Report</h2>
        <button onclick="showContent('Reports', null)"
          style="background:#0b74d1;color:#fff;padding:8px 14px;border:none;border-radius:8px;cursor:pointer;">
          ← Reports
        </button>
      </div>

      <!-- Header details -->
      <div class="glass" style="padding:16px;margin-bottom:18px;">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
          <input placeholder="සේවා ස්ථානය">
          <input placeholder="නිලධාරියාගේ නම">
          <input placeholder="නිල නාමය">

          <input value="${year}" placeholder="වර්ෂය">
          <input value="${month}" placeholder="මාසය">
          <input placeholder="නියමිත මුදල">

          <input placeholder="ඉල්ලන මුදල">
        </div>

        <hr style="margin:14px 0;">

        <div style="display:flex;gap:16px;align-items:center;">
          <label><input type="radio" name="vehicleType" checked> යතුරුපැදිය</label>
          <label><input type="radio" name="vehicleType"> මෝටර් රථය</label>

          <input placeholder="ලියාපදිංචි අංකය">
          <input placeholder="බර / CC">
        </div>
      </div>

      <!-- CT Table -->
      <div class="glass" style="padding:16px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#e8f5e8;">
              <th>දිනය</th>
              <th>පිටත් වුන</th>
              <th>ආපසු පැමිණි</th>
              <th>ගිය ස්ථානය / කරුණ</th>
              <th>දවස්</th>
              <th>වරු</th>
              <th>වාහනයෙන් (km)</th>
              <th>දුම්රියෙන්</th>
              <th>පයින්</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows.length === 0
                ? `<tr><td colspan="9" style="text-align:center;padding:12px;">දත්ත නොමැත</td></tr>`
                : rows.map(r => `
                  <tr>
                    <td>${r.date}</td>
                    <td>${r.outTime}</td>
                    <td>${r.inTime}</td>
                    <td>${r.purpose}</td>
                    <td>${r.fullDay}</td>
                    <td>${r.session}</td>
                    <td>${r.vehicle}</td>
                    <td>${r.train}</td>
                    <td>${r.walk}</td>
                  </tr>
                `).join("")
            }
          </tbody>
        </table>
      </div>
    `;
  };

})();
