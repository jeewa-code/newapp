
/* =========================================================
   OT Card (Form-35a) – FULL VERSION (FINAL)
   ========================================================= */

console.log("[otReport] loaded", new Date().toISOString());

(function () {

  /* ---------------- helpers ---------------- */
  function esc(s) {
    if (s == null) return "";
    return String(s).replace(/[&<>"']/g, m =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
    );
  }

  function timeToMinutes(t) {
    if (!t || typeof t !== "string") return null;
    const [h, m] = t.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  function minutesToDecimal(mins) {
    return Number((mins / 60).toFixed(2));
  }

  function getInspectorName() {
    return localStorage.getItem("phi_info_inspector") || "";
  }

  /* ---------------- English Number Arrays ---------------- */
  const ENGLISH_UNITS = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const ENGLISH_TENS = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty",
    "Seventy", "Eighty", "Ninety"
  ];

  /* ---------------- Number to Words Conversion ---------------- */
  window.convertToSinhalaWords = function (amount) {
    const rupees = Math.floor(amount);
    const cents = Math.round((amount - rupees) * 100);

    let text = "රුපියල් " + convertSinhalaNumber(rupees);

    if (cents > 0) {
      text += "යි සත " + convertSinhalaNumber(cents) + "ක්";
    } else {
      text += "ක්";
    }

    return text + " පමණි";
  };


  /* ================= Sinhala Number Core ================= */
  function convertSinhalaNumber(num) {
    if (num === 0) return "බිංදුව";

    const unitPrefix = ["", "එක්", "දෙ", "තුන්", "හාර", "පන්", "හය", "හත්", "අට", "නව"];
    const unitNormal = ["", "එක", "දෙක", "තුන", "හතර", "පහ", "හය", "හත", "අට", "නවය"];

    const tensBase = {
      10: "දහය",
      20: "විස්ස",
      30: "තිහ",
      40: "හතළිහ",
      50: "පනහ",
      60: "හැට",
      70: "හැත්තෑව",
      80: "අසූව",
      90: "අනූව"
    };

    const tensJoin = {
      20: "විසි",
      30: "තිස්",
      40: "හතළිස්",
      50: "පනස්",
      60: "හැට",
      70: "හැත්තෑ",
      80: "අසූ",
      90: "අනූ"
    };

    const specials = {
      11: "එකොළොස්",
      12: "දොළොස්",
      13: "දහතුන්",
      14: "දහ හතර",
      15: "පහළොස්",
      16: "දහසය",
      17: "දහහත",
      18: "දහඅට",
      19: "දහනව"
    };

    const hundreds = ["", "එකසිය", "දෙසීය", "තුන්සීය", "හාරසීය",
      "පන්සීය", "හයසීය", "හත්සීය", "අටසීය", "නවසීය"];

    let words = "";

    /* ---- Thousands ---- */
    /* ---- Thousands (final correct Sinhala) ---- */
    if (num >= 1000) {
      const t = Math.floor(num / 1000);

      if (t === 10) {
        // 10,000 → දහ දහස්
        words += "දහ දහස් ";
      }
      else if (t < 10) {
        // 1–9 thousand
        words += unitPrefix[t] + " දහස් ";
      }
      else {
        // 11–99 thousand
        words += convertSinhalaNumber(t) + " දහස් ";
      }

      num %= 1000;
    }


    /* ---- Hundreds ---- */
    if (num >= 100) {
      const h = Math.floor(num / 100);
      words += hundreds[h] + " ";
      num %= 100;
    }

    /* ---- 11–19 ---- */
    if (num >= 11 && num <= 19) {
      return (words + specials[num]).trim();
    }

    /* ---- Exact tens ---- */
    if (tensBase[num]) {
      return (words + tensBase[num]).trim();
    }

    /* ---- Tens + Ones ---- */
    if (num >= 20) {
      const t = Math.floor(num / 10) * 10;
      const o = num % 10;
      return (words + tensJoin[t] + " " + unitNormal[o]).trim();
    }

    /* ---- Ones ---- */
    if (num > 0) {
      words += unitNormal[num];
    }

    return words.trim();
  }



  /* ================= English Number Functions ================= */
  window.convertToEnglishWords = function (amount) {
    if (amount === 0) return "Zero Rupees only";

    let result = "";
    const rupees = Math.floor(amount);
    const cents = Math.round((amount - rupees) * 100);

    // Convert Rupees
    if (rupees > 0) {
      result += convertEnglishNumber(rupees) + " Rupees";
    }

    // Convert Cents
    if (cents > 0) {
      if (result !== "") result += " and ";
      result += convertEnglishNumber(cents) + " Cents";
    }

    return result + " only";
  };

  function convertEnglishNumber(num) {
    if (num < 20) return ENGLISH_UNITS[num];

    if (num < 100) {
      const tens = Math.floor(num / 10);
      const units = num % 10;
      if (units === 0) return ENGLISH_TENS[tens];
      return ENGLISH_TENS[tens] + "-" + ENGLISH_UNITS[units];
    }

    if (num < 1000) {
      const hundreds = Math.floor(num / 100);
      const remainder = num % 100;
      if (remainder === 0) return ENGLISH_UNITS[hundreds] + " Hundred";
      return ENGLISH_UNITS[hundreds] + " Hundred and " + convertEnglishNumber(remainder);
    }

    if (num < 100000) {
      const thousands = Math.floor(num / 1000);
      const remainder = num % 1000;
      if (remainder === 0) return convertEnglishNumber(thousands) + " Thousand";
      return convertEnglishNumber(thousands) + " Thousand " + convertEnglishNumber(remainder);
    }

    if (num < 10000000) {
      const lakhs = Math.floor(num / 100000);
      const remainder = num % 100000;
      if (remainder === 0) return convertEnglishNumber(lakhs) + " Lakh";
      return convertEnglishNumber(lakhs) + " Lakh " + convertEnglishNumber(remainder);
    }

    return num.toString(); // Fallback for larger numbers
  }

  /* ---------------- Sinhala months ---------------- */
  const SINHALA_MONTHS = [
    { v: 1, t: "ජනවාරි" },
    { v: 2, t: "පෙබරවාරි" },
    { v: 3, t: "මාර්තු" },
    { v: 4, t: "අප්‍රේල්" },
    { v: 5, t: "මැයි" },
    { v: 6, t: "ජූනි" },
    { v: 7, t: "ජූලි" },
    { v: 8, t: "අගෝස්තු" },
    { v: 9, t: "සැප්තැම්බර්" },
    { v: 10, t: "ඔක්තෝබර්" },
    { v: 11, t: "නොවැම්බර්" },
    { v: 12, t: "දෙසැම්බර්" }
  ];

  /* ---------------- OT rows generator (date sorted) ---------------- */
  function generateOTRows(year, month) {
    if (!window.getPocketNotes) return { rowsHTML: "", totalHours: 0 };

    const dutyEnd = timeToMinutes("16:30");

    const notes = (window.getPocketNotes() || [])
      .filter(n => {
        if (!n.date) return false;
        const d = new Date(n.date);
        return d.getFullYear() === Number(year) &&
          d.getMonth() + 1 === Number(month);
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // date ASC

    let rows = [];
    let totalHours = 0;

    notes.forEach(n => {
      const arrPM = n.officeArrival?.afternoon;
      const depAM = n.officeDeparture?.morning;
      const arrMin = timeToMinutes(arrPM);

      if (arrMin && arrMin > dutyEnd) {
        const dec = minutesToDecimal(arrMin - dutyEnd);
        totalHours += dec;

        rows.push(`
          <tr>
            <td>${esc(n.date)}</td>
            <td>${esc(depAM || "")}</td>
            <td>${esc(arrPM)}</td>
            <td class="ot-hours" style="text-align:center">${dec}</td>
            <td></td>
            <td style="text-align:center">
              <button onclick="this.closest('tr').remove();recalculateTotals()">✖</button>
            </td>
          </tr>
        `);
      }
    });

    if (!rows.length) {
      return {
        rowsHTML: `<tr><td colspan="6" style="text-align:center">
          මෙම මාසයට අදාළ අතිකාල දත්ත නොමැත
        </td></tr>`,
        totalHours: 0
      };
    }

    return { rowsHTML: rows.join(""), totalHours };
  }

  /* ---------------- totals calculator ---------------- */
  window.recalculateTotals = function () {
    let total = 0;
    document.querySelectorAll(".ot-hours").forEach(td => {
      total += Number(td.textContent) || 0;
    });

    total = Number(total.toFixed(2));
    document.getElementById("totalHours").textContent = total;

    const rate = Number(document.getElementById("otRate").value) || 0;
    const totalAmount = Number((total * rate).toFixed(2));
    document.getElementById("totalAmount").textContent = totalAmount.toFixed(2);

    // Update amount in words based on selected language
    updateAmountInWords(totalAmount);
  };

  /* ---------------- Update amount in words ---------------- */
  function updateAmountInWords(amount) {
    const language = document.getElementById("amountLanguage").value;
    const container = document.getElementById("amountWordsContainer");

    if (language === "none") {
      container.style.display = "none";
      return;
    }

    container.style.display = "block";

    let words = "";

    if (language === "sinhala") {
      words = window.convertToSinhalaWords(amount);
    }
    else if (language === "english") {
      words = window.convertToEnglishWords(amount);
    }

    document.getElementById("amountInWords").textContent = words;
  }

  /* ---------------- main open function ---------------- */
  window.openOTReport = function () {

    const content = document.getElementById("contentArea");
    if (!content) return;

    content.innerHTML = `
<style>
  #contentArea, #contentArea * { color:#000 !important; }
  #contentArea table, #contentArea th, #contentArea td,
  #contentArea input, #contentArea select {
    border-color:#000 !important;
  }
  @media print {
    button { display:none !important; }
  }
</style>

<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
  <h2>OT Card (Form-35a)</h2>
  <button onclick="showContent('Reports', null)" style="background:var(--primary);color:white;padding:8px 16px;border:none;border-radius:8px;cursor:pointer;font-weight:600;">
    <i class="fas fa-arrow-left" style="margin-right:8px;"></i>Reports වෙත ආපසු
  </button>
</div>

<div class="glass" style="padding:14px">

  <div class="ot-report-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">

    <div>
      <label>ඉල්ලුම්කරුගේ නම</label>
      <input id="applicantName" readonly />
    </div>

    <div>
      <label>පදවි නාමය</label>
      <select id="designation">
        <option>PHI</option>
        <option>SPHI</option>
        <option>SPHID</option>
      </select>
    </div>

    <div>
      <label>සේවා ස්ථානය</label>
      <input id="dutyStation" />
    </div>

    <div>
      <label>ගෙවීම් ශාඛාව</label>
      <input id="payingBranch" />
    </div>

    <div>
      <label>මාසික වැටුප (Rs.)</label>
      <input id="monthlySalary" type="number" value="47994" />
    </div>

    <div>
      <label>OT Rate / Hour (Rs.)</label>
      <input id="otRate" type="number" value="271" />
    </div>

    <div>
      <label>වර්ෂය</label>
      <select id="otYear"></select>
    </div>

    <div>
      <label>මාසය</label>
      <select id="otMonth"></select>
    </div>

    <div>
      <label>අතිකාල මුදල පෙන්වීම</label>
      <select id="amountLanguage">
        <option value="sinhala">සිංහල (වචන වලින්)</option>
        <option value="english">English (In Words)</option>
        <option value="none">පෙන්වන්න එපා</option>
      </select>
    </div>
    <!-- PRINT / DOWNLOAD BUTTON (TOP POSITION) -->
<div class="ot-report-controls" style="margin-top:14px;text-align:right">
  <button
    onclick="openOTVoucherPrint()"
    style="
      padding:10px 18px;
      background:#0d6efd;
      color:#fff;
      border:1px solid #0d6efd;
      border-radius:4px;
      font-weight:bold;
      cursor:pointer;
    ">
    Print / Download (Legal OT Voucher)
  </button>
</div>

  </div>

  <hr>

  <h3>7. OVERTIME DETAILS</h3>

  <div class="ot-report-table-wrapper">
  <table border="1" cellpadding="6" cellspacing="0"
         style="width:100%;border-collapse:collapse">
    <thead>
      <tr>
        <th>දිනය</th>
        <th>සිට</th>
        <th>දක්වා</th>
        <th>පැය ගණන</th>
        <th>වැඩ විස්තරය</th>
        <th>ඉවත් කිරීම</th>
      </tr>
    </thead>
    <tbody id="otBody"></tbody>
  </table>
  </div>

  <!-- SUMMARY (SEPARATE) -->
  <div style="margin-top:14px;padding:12px;border:1px solid #000;max-width:420px">
    <div style="display:flex;justify-content:space-between;font-weight:bold">
      <span>මුළු පැය ගණන</span>
      <span id="totalHours">0</span>
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:8px;font-weight:bold">
      <span>මුළු අතිකාල මුදල (Rs.)</span>
      <span id="totalAmount">0.00</span>
    </div>
    <div id="amountWordsContainer" style="margin-top:8px;padding-top:8px;border-top:1px dashed #888;display:none">
      <div id="amountInWords" style="font-style:italic"></div>
    </div>
  </div>

  <!-- SIGNATURE SECTION -->
  <div class="ot-report-signature" style="margin-top:40px">
    <div style="display:flex;justify-content:space-between">
      <div>
        .................................<br>
        අත්සන<br>
        (ඉල්ලුම්කරු)
      </div>
      <div>
        .................................<br>
        අත්සන<br>
        (අනුමත කළ නිලධාරී)
      </div>
    </div>
    <div style="margin-top:20px">
      දිනය : .........................
    </div>
  </div>
    <!-- PRINT & DOWNLOAD BUTTONS -->
<div style="margin-top:30px;text-align:right">
  

  <button
    style="padding:8px 16px;border:1px solid #000;background:#fff;cursor:pointer;margin-left:10px"
    onclick="openOTVoucherPrint()">
    Print / Download 
  </button>
</div>

</div>
    `;

    /* -------- defaults -------- */
    // Helper to get full PHI info
    let phi = {};
    try {
        const stored = JSON.parse(localStorage.getItem("phi_info_v1") || "[]");
        if (stored.length) phi = stored[0];
    } catch(e) {}

    // Name
    document.getElementById("applicantName").value = phi.name || getInspectorName();

    // Duty Station: "MOH Office - [MOH]"
    if (phi.moh) {
        document.getElementById("dutyStation").value = "MOH Office - " + phi.moh;
    }

    // Paying Branch
    const pBranch = document.getElementById("payingBranch");
    if (phi.auth_type === "NIHS") {
        pBranch.value = "Account Branch - NIHS Kalutara";
    } else if (phi.auth_type === "RDHS" && phi.auth_name) {
        pBranch.value = "Account Branch - RDHS " + phi.auth_name;
    }

    // Salary & Rate
    if (phi.salary) document.getElementById("monthlySalary").value = phi.salary;
    if (phi.ot_rate) document.getElementById("otRate").value = phi.ot_rate;

    const ySel = document.getElementById("otYear");
    const mSel = document.getElementById("otMonth");
    const body = document.getElementById("otBody");
    const amountLanguage = document.getElementById("amountLanguage");

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;

    for (let y = curYear - 2; y <= curYear + 2; y++) {
      ySel.innerHTML += `<option value="${y}">${y}</option>`;
    }

    SINHALA_MONTHS.forEach(m => {
      mSel.innerHTML += `<option value="${m.v}">${m.t}</option>`;
    });

    ySel.value = curYear;
    mSel.value = curMonth;

    function refreshOT() {
      const result = generateOTRows(ySel.value, mSel.value);
      body.innerHTML = result.rowsHTML;
      recalculateTotals();
    }

    function toggleAmountWords() {
      const container = document.getElementById("amountWordsContainer");
      if (amountLanguage.value === "none") {
        container.style.display = "none";
      } else {
        container.style.display = "block";
        recalculateTotals();
      }
    }

    ySel.onchange = refreshOT;
    mSel.onchange = refreshOT;
    document.getElementById("otRate").oninput = recalculateTotals;
    amountLanguage.onchange = toggleAmountWords;

    refreshOT(); // auto load current month
    toggleAmountWords(); // initial state
  };

})();
