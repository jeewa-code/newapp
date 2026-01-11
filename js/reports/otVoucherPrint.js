/* =========================================================
   OT Voucher – Form 35 (Legal Size, Pixel Perfect)
   Sinhala + Tamil + English
   Background image: assets/OT.jpg
   Background graphics option OFF/ON → image ALWAYS prints
   ========================================================= */

window.openOTVoucherPrint = function () {

  /* ---------- Collect OT rows from screen ---------- */
  const rows = [];
  let totalHours = 0;

  document.querySelectorAll("#otBody tr").forEach(tr => {
    const td = tr.querySelectorAll("td");
    if (td.length >= 5) {
      const hours = parseFloat(td[3].innerText) || 0;
      totalHours += hours;

      rows.push({
        date: td[0].innerText.trim(),
        from: td[1].innerText.trim(),
        to: td[2].innerText.trim(),
        hours: hours.toFixed(2),
        work: td[4].innerText.trim()
      });
    }
  });

  totalHours = Number(totalHours.toFixed(2));

  const otRate = parseFloat(document.getElementById("otRate").value) || 0;
  const totalAmountValue = Number((totalHours * otRate).toFixed(2));

  const totalAmount =
    totalAmountValue % 1 === 0
      ? "Rs " + totalAmountValue + "/="
      : "Rs " + totalAmountValue.toFixed(2) + "/=";

  /* ---------- Amount in words ---------- */
  const amountLanguage = document.getElementById("amountLanguage").value;
  let amountInWords = "";

  if (amountLanguage === "sinhala") {
    amountInWords = window.convertToSinhalaWords(totalAmountValue);
  } else if (amountLanguage === "english") {
    amountInWords = window.convertToEnglishWords(totalAmountValue);
  }

  const data = {
    claimantName: document.getElementById("applicantName").value,
    placeOfWork: document.getElementById("dutyStation").value,
    salary: document.getElementById("monthlySalary").value + "/=",
    designation: document.getElementById("designation").value,
    payUnit: document.getElementById("payingBranch").value,
    otRate: otRate + "/=",
    rows,
    totalHours,
    totalAmount,
    amountInWords,
    showAmountInWords: amountLanguage !== "none"
  };

  const w = window.open("", "_blank");

  w.document.write(`
<!DOCTYPE html>
<html lang="si">
<head>
<meta charset="UTF-8">
<title>OT Voucher – Form 35</title>

<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;600&family=Noto+Sans+Tamil:wght@400;600&display=swap" rel="stylesheet">

<style>
@page {
  size: legal portrait;
  margin: 0;
}

html, body {
  margin: 0;
  padding: 0;
  width: 816px;
  height: 1344px;
}

.page {
  position: relative;
  width: 816px;
  height: 1344px;
  font-family: "Noto Sans Sinhala","Noto Sans Tamil", Arial, sans-serif;
}

/* --- BACKGROUND IMAGE (ALWAYS PRINTS) --- */
.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 816px;
  height: 1344px;
  z-index: 0;

  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* --- WRITTEN FIELDS --- */
.field {
  position: absolute;
  font-size: 15px;
  line-height: 1.2;
  white-space: nowrap;
  z-index: 1;

  color: #0b4edb;
  font-family: "Comic Sans MS","Segoe Script","Bradley Hand",cursive;
  font-style: italic;
  font-weight: 500;

  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* HEADER */
#f1 { top: 102px; left: 250px; width: 430px; }
#f2 { top: 150px; left: 220px; width: 430px; }
#f3 { top: 190px; left: 250px; width: 200px; }
#f4 { top: 110px; left: 600px; width: 160px; }
#f5 { top: 145px; left: 560px; width: 160px; }
#f6 { top: 185px; left: 620px; width: 160px; }

/* TABLE */
.col-date  { left: 45px;  width: 95px; }
.col-from  { left: 135px; width: 80px; }
.col-to    { left: 185px; width: 80px; }
.col-hours { left: 220px; width: 70px; text-align:center; }
.col-work  { left: 300px; width: 350px; }

/* TOTALS */
#totalHours  { top: 1200px; left: 215px; width: 100px; text-align:center; }
#totalAmount { top: 1245px; left: 290px; width: 150px; text-align:center; }

/* AMOUNT IN WORDS */
#amountInWords {
  position: absolute;
  top: 1225px;
  left: 320px;
  width: 700px;
  z-index: 1;

  font-size: 14px;
  color: #0b4edb;
  font-family: "Comic Sans MS","Segoe Script","Bradley Hand",cursive;
  font-style: italic;

  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

@media print {
  html, body, .page {
    width: 816px !important;
    height: 1344px !important;
    overflow: hidden !important;
  }
}
</style>
</head>

<body>

<div class="page">

  <!-- BACKGROUND IMAGE -->
  <img src="assets/OT.jpg" class="bg-image" alt="OT Voucher Background">

  <!-- HEADER -->
  <div id="f1" class="field">${data.claimantName}</div>
  <div id="f2" class="field">${data.placeOfWork}</div>
  <div id="f3" class="field">${data.salary}</div>
  <div id="f4" class="field">${data.designation}</div>
  <div id="f5" class="field">${data.payUnit}</div>
  <div id="f6" class="field">${data.otRate}</div>

  <!-- TABLE ROWS -->
  ${
    data.rows.map((r, i) => {
      const TABLE_START_TOP = 570;
      const ROW_GAP_1_19 = 23;
      const ROW_GAP_20_PLUS = 22;

      const top =
        i < 19
          ? TABLE_START_TOP + (i * ROW_GAP_1_19)
          : TABLE_START_TOP + (19 * ROW_GAP_1_19) + ((i - 19) * ROW_GAP_20_PLUS);

      return `
        <div class="field col-date"  style="top:${top}px">${r.date}</div>
        <div class="field col-from"  style="top:${top}px">${r.from}</div>
        <div class="field col-to"    style="top:${top}px">${r.to}</div>
        <div class="field col-hours" style="top:${top}px">${r.hours}</div>
        <div class="field col-work"  style="top:${top}px">${r.work}</div>
      `;
    }).join("")
  }

  <!-- TOTALS -->
  <div id="totalHours" class="field">${data.totalHours}</div>
  <div id="totalAmount" class="field">${data.totalAmount}</div>

  ${
    data.showAmountInWords
      ? `<div id="amountInWords">${data.amountInWords}</div>`
      : ""
  }

</div>

<script>
window.onload = function () {
  setTimeout(function () {
    window.print();
  }, 150);
};
</script>

</body>
</html>
`);

  w.document.close();
};
