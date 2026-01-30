// dailySummaryTab.js - UPDATED for A3 Landscape, Fit-to-one-page, Auto-page-break
// Based on original file; converted editable inputs to readonly DIVs and unified row heights via CSS var --row-height
(function () {
    "use strict";

    let monthlyData = JSON.parse(localStorage.getItem('phi_monthly_activities')) || {};

    // add styles to keep table column widths stable and readonly cell height unified
    (function () {
        const s = document.createElement('style');
        s.textContent = `
        :root { 
            --row-height: 12px; 
        }

        .summary-container {
            padding: 20px;
        }

        .summary-header {
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 20px;
            gap: 15px;
        }

        .summary-controls {
            display: flex; 
            gap: 10px; 
            align-items: center;
        }

        .summary-footer-btns {
            margin-top: 20px; 
            display: flex; 
            gap: 10px;
        }

        @media (max-width: 768px) {
            .summary-container {
                padding: 10px;
            }
            .summary-header {
                flex-direction: column;
                align-items: flex-start;
            }
            .summary-controls {
                width: 100%;
                flex-wrap: wrap;
            }
            .summary-controls select, .summary-controls button {
                flex: 1;
                min-width: 120px;
            }
            .signature-section {
                flex-direction: column;
                gap: 20px;
            }
            .summary-footer-btns {
                flex-direction: column;
            }
            .summary-footer-btns button {
                width: 100%;
            }

            /* Adjust sticky column 2 for mobile */
            #activitiesTable th.sticky-col-2,
            #activitiesTable td.sticky-col-2 {
                width: 120px !important;
                min-width: 120px !important;
                max-width: 120px !important;
                font-size: 10px !important;
                background: white !important;
            }
            .sticky-col-2 .readonly-cell {
                font-size: 9px !important;
                white-space: normal !important;
                line-height: 1.1 !important;
                text-align: left !important;
                justify-content: flex-start !important;
                overflow: hidden;
            }
            
            /* Increase row height slightly for mobile if text wraps */
            :root {
                --row-height: 24px;
            }

            .day-col { min-width: 45px !important; }
            .total-col { min-width: 80px !important; }
            
            #activitiesTable {
                min-width: 1700px !important; /* Increased from 1200px to fit all 31 days */
            }
            #activitiesTableTopSpacer {
                width: 1700px !important;
                height: 1px;
            }
            #activitiesTableContainerTop {
                height: 20px !important;
            }
        }

        .day-col { min-width: 75px; }
        .total-col { min-width: 120px; }

        .readonly-cell {
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center !important;
            height: var(--row-height);
            line-height: 1;
            padding: 4px;
            font-size: 11px;
            color: #222;
            background: transparent;
            border-radius: 2px;
        }

        .fixed-layout-table td {
            height: var(--row-height);
            vertical-align: middle;
        }

        /* HEADER ROW (thead row) */
        .table-header-row th {
            height: var(--row-height) !important;
            padding: 4px;
            font-size: 11px;
            margin: 0;
            line-height: var(--row-height);
            font-weight: bold !important;   /* MAKE HEADER TEXT BOLD */
            text-align: center;
        }

        /* MAIN DUTY HEADER ROW (grey row) */
        .main-duty-row td {
            height: var(--row-height) !important;
            padding: 4px;
            font-size: 11px;
            margin: 0;
            line-height: var(--row-height);
            background-color: #e8f5e9 !important; /* Very light green */
            font-weight: bold;
        }

        .sticky-col-1, .sticky-col-2 {
            background-color: #ffffff !important;
        }

        .total-col {
            background-color: #e3f2fd !important; /* Light blue */
        }
        /* Activities column styling */
        .activities-col {
            text-align: left !important;
            font-size: 11px !important;
            font-weight: bold !important;
        }

        .activities-col-0107 {
            text-align: left !important;
            font-size: 12px !important;
            font-weight: bold !important;
            padding-left: 6px !important;
        }
        /* Date Column (Column 3) font-size fix */
        .date-col-label {
            font-size: 11px !important;
        }

        .readonly-cell.left { justify-content: flex-start; padding-left: 8px; text-align: left !important; }
        .readonly-cell.muted { color: #666; }
        #activitiesTableContainerTop { margin-bottom: 6px; }

        /* Sticky Columns for Mobile */
        .sticky-col-1 {
            position: sticky;
            left: 0;
            z-index: 10;
            background: white !important;
            box-shadow: 2px 0 5px rgba(0,0,0,0.1);
        }
        .sticky-col-2 {
            position: sticky;
            left: 50px;
            z-index: 10;
            background: white !important;
            box-shadow: 2px 0 5px rgba(0,0,0,0.1);
        }

        .table-header-row .sticky-col-1,
        .table-header-row .sticky-col-2 {
            background: var(--primary) !important;
            z-index: 11;
        }

        .main-duty-row .sticky-col-1 {
            background: #6c757d !important;
            z-index: 11;
        }

        /* Scroll hint */
        .scroll-hint {
            display: none;
            font-size: 11px;
            color: rgba(255,255,255,0.7);
            margin-bottom: 8px;
            text-align: right;
        }

        @media (max-width: 768px) {
            .scroll-hint {
                display: block;
            }
        }

        /* Basic table layout for on-screen */
        #activitiesTable {
            width: 100%;
            border-collapse: collapse;
            background: white;
            font-size: 12px;
            min-width: 1800px;
            table-layout: fixed;
        }

        #activitiesTableTopSpacer {
            width: 1800px;
            height: 1px;
        }

        #activitiesTableContainerTop {
            height: 12px;
            overflow-x: auto;
            overflow-y: hidden;
        }

        /* Make sure table header repeats on each printed page */
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }

        /* Avoid breaking inside table cells/rows where possible */
        table, tr, td, th {
            page-break-inside: avoid;
            break-inside: avoid;
        }

        /* But allow the table to break between rows across pages */
        tr { page-break-inside: avoid; page-break-after: auto; }

        /* Print-specific stylesheet for A3 Landscape, fit-to-one-page and auto page breaks */
        @media print {

            /* A3 landscape size */
            @page {
                size: A3 landscape;
                margin: 8mm;
            }

            html, body {
                width: 420mm;
                height: 297mm;
                margin: 0;
                padding: 0;
            }

            /* Force header/footer to print color properly on some browsers */
            body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }

            /* Hide UI controls for printing */
            button, select, #activitiesTableContainerTop { display: none !important; }

            /* Make glass container plain white and remove shadows */
            .glass {
                box-shadow: none !important;
                background: white !important;
                padding: 6mm !important;
                margin: 0 !important;
            }

            /* Make overflow visible so table can span pages naturally */
            #activitiesTableContainer, #activitiesTable {
                overflow: visible !important;
                height: auto !important;
                min-width: 0 !important;
            }

            /* Fit-to-one-page width handling:
               We can't *always* guarantee a single-page fit for extremely wide tables,
               but we scale the table down slightly so typical tables will fit width of A3 landscape.
               If you need a stronger fit, tweak the scale (0.9, 0.85, etc). */
            #activitiesTable {
                transform-origin: top left;
                transform: scale(0.88);
                width: 100%;
            }

            /* Since we scaled down the table, reduce line-height a little for compact fit */
            .readonly-cell { padding: 2px; font-size: 10px; text-align: center !important; }

            /* Preserve header/background colors on print */
            .table-header-row th {
                background: #007bff !important;
                color: white !important;
                -webkit-print-color-adjust: exact !important;
            }

            .main-duty-row td {
                background: #6c757d !important;
                color: white !important;
            }

            td[style*="background: #e3f2fd"] {
                background: #e3f2fd !important;
            }

            td[style*="background: #f8f9fa"] {
                background: #f8f9fa !important;
            }

            td[style*="background: #e8f5e8"] {
                background: #e8f5e8 !important;
            }

            /* Ensure header row repeats on all pages */
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }

            /* Allow the table to break across pages between rows */
            tbody { display: table-row-group; }

            /* When a single row is too tall, allow it to break (only if necessary) */
            tr, td, th {
                break-inside: avoid;
                page-break-inside: avoid;
            }

            /* If you want to force page breaks after certain main duties,
               add class 'page-break-after' to the corresponding <tr>. */
            .page-break-after { page-break-after: always; break-after: page; }

            /* Signature section styling */
            .signature-section {
                margin-top: 20mm;
                display: flex;
                justify-content: space-between;
                font-size: 14px;
            }
            .signature-line {
                border-bottom: 1px solid #000;
                width: 200px;
                display: inline-block;
                margin-left: 10px;
            }

          :root {
        --row-height: 10px !important;
    }

    .readonly-cell {
        padding: 1px !important;
        font-size: 9px !important;
        line-height: 10px !important;
        height: var(--row-height) !important;
        text-align: center !important;
        justify-content: center !important;
    }

    .table-header-row th,
    .main-duty-row td,
    td {
        padding: 1px !important;
        height: var(--row-height) !important;
        line-height: var(--row-height) !important;
        vertical-align: middle !important;
    }  



        } /* end @media print */

        `;
        document.head.appendChild(s);
    })();

    window.renderDailySummaryTab = function (container) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        container.innerHTML = `
            <div class="glass summary-container">
                <div class="summary-header">
                    <h3 style="color: var(--primary); margin: 0;">Summary of Activities</h3>
                    <div class="summary-controls">
                        <select id="monthSelect" style="padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                            ${generateMonthOptions(currentMonth)}
                        </select>
                        <select id="yearSelect" style="padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
                            ${generateYearOptions(currentYear)}
                        </select>
                        <button onclick="loadMonthlyData()" 
                                style="background: var(--primary); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
                            Load
                        </button>
                        <button id="printTableBtn" 
                                style="background:#0b63d4;color:white;padding:8px 14px;border:none;
                                    border-radius:6px;cursor:pointer;">
                            Print Table
                        </button>
                    </div>
                </div>

                <div class="scroll-hint"><i class="fa-solid fa-arrows-left-right"></i> Scroll left to see dates</div>
                <!-- Activities Table -->
                <div id="activitiesTableContainerTop" style="overflow-x:auto; overflow-y:hidden;">
                    <div id="activitiesTableTopSpacer"></div>
                </div>
                <div id="activitiesTableContainer" style="overflow-x: auto;">
                    ${renderActivitiesTable(currentYear, currentMonth)}
                </div>

                <!-- Signature Section -->
                <div class="signature-section" style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 14px;">
                    <div>Prepared by: <span class="signature-line"></span></div>
                    <div>Checked by: <span class="signature-line"></span></div>
                    <div>Approved by: <span class="signature-line"></span></div>
                </div>

                <div class="summary-footer-btns">
                    <button onclick="saveMonthlyData()" 
                            style="background: var(--primary); color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                        Save Data
                    </button>
                    <button onclick="clearMonthlyData()" 
                            style="background: var(--danger); color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                        Clear All Data
                    </button>
                </div>
            </div>
        `;

        // hook up print button
        const printBtn = document.getElementById('printTableBtn');
        if (printBtn) {
            printBtn.addEventListener('click', function () {
                printTableOnly();   // Use clean-table print method
            });
        }


        // initialize top scrollbar sync after initial render
        setTimeout(initTableScrollSync, 100);
    };

    function generateMonthOptions(selectedMonth) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months.map((month, index) =>
            `<option value="${index + 1}" ${index + 1 === selectedMonth ? 'selected' : ''}>${month}</option>`
        ).join('');
    }

    function generateYearOptions(selectedYear) {
        let options = '';
        for (let year = selectedYear - 2; year <= selectedYear + 2; year++) {
            options += `<option value="${year}" ${year === selectedYear ? 'selected' : ''}>${year}</option>`;
        }
        return options;
    }

    function renderActivitiesTable(year, month) {
        const dutiesData = window.getDutiesData ? window.getDutiesData() : [];
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {};
        }

        let tableHTML = `
            <table id="activitiesTable" class="fixed-layout-table" style="width: 100%; border-collapse: collapse; background: white; font-size: 12px; table-layout: fixed;">
                <thead>
                    <tr class="table-header-row" style="background: var(--primary); color: white;">
                        <th class="sticky-col-1" style="padding: 8px; border: 1px solid #ddd; text-align: center; width: 50px;"></th>
                        <th class="sticky-col-2" style="padding: 8px; border: 1px solid #ddd; text-align: center; width: 300px;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span>Activities</span>
                                <span style="font-size: 16px;">↓</span>
                            </div>
                        </th>
                        <th class="date-col-label" 
    style="border: 1px solid #ddd; text-align: center; width: 50px;">

                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <span>Date</span>
                                <span style="font-size: 16px;">→</span>
                            </div>
                        </th>
                        ${generateDayHeaders()}
                    </tr>
                </thead>
                <tbody>
        `;

        // Time tracking section
        tableHTML += generateTimeTrackingSection(monthKey);

        // Main activities section
        tableHTML += generateMainActivitiesSection(dutiesData, monthKey);

        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function generateDayHeaders() {
        let headers = '';
        for (let day = 1; day <= 31; day++) {
            headers += `<th class="day-col" style="padding: 8px; border: 1px solid #ddd; text-align: center;">${day.toString().padStart(2, '0')}</th>`;
        }
        headers += `<th class="total-col" style="padding: 8px; border: 1px solid #ddd; text-align: center; background: var(--primary-light);">Total</th>`;
        return headers;
    }

    function generateTimeTrackingSection(monthKey) {
        const timeFields = [
            {
                label: 'Place of work',
                rows: [
                    { period: 'a.m', type: 'text' }, // Row 01 - text display for letters and numbers
                    { period: 'p.m', type: 'text' }
                ]
            },
            {
                label: 'Time of departure from office',
                rows: [
                    { period: 'a.m', type: 'time' },
                    { period: 'p.m', type: 'time' }
                ]
            },
            {
                label: 'Time of arrival in the field',
                rows: [
                    { period: 'a.m', type: 'time' },
                    { period: 'p.m', type: 'time' }
                ]
            },
            {
                label: 'Time of leaving from field',
                rows: [
                    { period: 'a.m', type: 'time' },
                    { period: 'p.m', type: 'time' }
                ]
            },
            {
                label: 'Time of returning to the office',
                rows: [
                    { period: 'a.m', type: 'time' },
                    { period: 'p.m', type: 'time' }
                ]
            },
            {
                label: 'Distance traveled - By vehicle maintained',
                rows: [
                    { period: 'a.m', type: 'distance' },
                    { period: 'p.m', type: 'distance' }
                ]
            }
        ];

        let sectionHTML = '';
        let rowCounter = 1;

        timeFields.forEach((field, fieldIndex) => {
            field.rows.forEach((row, rowIndex) => {
                const isFirstRow = rowIndex === 0;
                const rowspan = field.rows.length;

                sectionHTML += `
                    <tr>
                        ${isFirstRow ?
                        `<td rowspan="${rowspan}" class="sticky-col-1" style="padding: 6px; border: 1px solid #ddd; background: #f8f9fa; font-weight: 500; text-align: center; vertical-align: middle;">
                                ${rowCounter.toString().padStart(2, '0')}
                            </td>
                            <td rowspan="${rowspan}" 
                                    class="activities-col-0107 sticky-col-2"
                                    style="padding: 0; border: 1px solid #ddd; background: #f8f9fa; vertical-align: middle;">
                                    ${field.label}
                                </td>`
                        :
                        ''
                    }
                        <td style="padding: 4px; border: 1px solid #ddd; background: #f8f9fa; text-align: center; width: 80px;">
                            ${row.period}
                        </td>
                        ${generateTimeInputs(monthKey, `time_${fieldIndex}_${rowIndex}`, row.type, fieldIndex, rowIndex)}
                    </tr>
                `;
            });
            rowCounter++;
        });

        // Row 07 - Distance traveled - By public transport or other (single column)
        sectionHTML += `
            <tr>
                <td class="sticky-col-1" style="padding: 6px; border: 1px solid #ddd; background: #f8f9fa; font-weight: 500; text-align: center; vertical-align: middle;">
                    07
                </td>
                <td colspan="2" 
                    class="activities-col-0107 sticky-col-2"
                    style="padding: 6px; border: 1px solid #ddd; background: #f8f9fa;
                        font-weight: 500; font-size: 11px;">
                    Distance traveled - By public transport or other
                </td>

                ${generateTimeInputs(monthKey, 'time_6_0', 'distance')}
            </tr>
        `;

        return sectionHTML;
    }

    function generateMainActivitiesSection(dutiesData, monthKey) {
        let sectionHTML = '';
        let activityCounter = 8; // Starting after time tracking rows

        dutiesData.forEach((duty, dutyIndex) => {
            const totalSubDutyRows = duty.subDuties.length;
            const totalRows = totalSubDutyRows > 0 ? totalSubDutyRows : 1;

            // Main duty header row (non-editable, dark gray) - ensure height matches readonly cells
            sectionHTML += `
                <tr class="main-duty-row">
                    <td rowspan="${totalRows + 1}" class="sticky-col-1" style="padding: 6px; border: 1px solid #ddd; background: #6c757d; color: white; font-weight: bold; text-align: center; vertical-align: middle; height: var(--row-height);">
                        ${activityCounter.toString().padStart(2, '0')}
                    </td>
                    <td colspan="33" style="padding: 8px; border: 1px solid #ddd; background: #6c757d; color: white; font-weight: bold; vertical-align: middle; height: var(--row-height);">
                        ${escapeHtml(duty.mainDuty)}
                    </td>
                </tr>
            `;

            // Sub duties rows - render read-only divs (no inputs)
            if (duty.subDuties.length > 0) {
                duty.subDuties.forEach((subDuty, subIndex) => {
                    sectionHTML += `
                        <tr>
                            <td colspan="2" class="sticky-col-2" style="padding: 6px; border: 1px solid #ddd; background: #e3f2fd; font-weight: 500; vertical-align: middle; text-align: left; height: var(--row-height);">
                                <div class="readonly-cell left">${escapeHtml(subDuty)}</div>
                            </td>
                            ${generateActivityDisplayCells(monthKey, `sub_${duty.id}_${subIndex}`, 'activity')}
                        </tr>
                    `;
                });
            } else {
                // If no sub duties, show at least one row for data display
                sectionHTML += `
                    <tr>
                        <td colspan="2" class="sticky-col-2" style="padding: 6px; border: 1px solid #ddd; background: #e3f2fd; font-weight: 500; vertical-align: middle; text-align: left; height: var(--row-height);">
                            <div class="readonly-cell left">Main Activity</div>
                        </td>
                        ${generateActivityDisplayCells(monthKey, `main_${duty.id}`, 'activity')}
                    </tr>
                `;
            }

            activityCounter++;
        });

        return sectionHTML;
    }

    // TIME fields: render values as readonly DIVs; for rows 02-05 values come from Pocket Note Book (PNB)
    function generateTimeInputs(monthKey, fieldId, type, fieldIndex, rowIndex) {
        let inputs = '';
        let total = 0;

        // Parse fieldIndex from fieldId (fieldId format: "time_fieldIndex_rowIndex")
        const fieldParts = fieldId.split('_');
        const currentFieldIndex = parseInt(fieldParts[1]);
        const currentRowIndex = parseInt(fieldParts[2]);

        for (let day = 1; day <= 31; day++) {
            const dayKey = day.toString().padStart(2, '0');
            const fullKey = `${monthKey}-${dayKey}`;

            let value = '';
            let displayValue = '';

            // Get data from Pocket Note Book for rows 02-06 (fieldIndex 1..5)
            if (currentFieldIndex >= 1 && currentFieldIndex <= 5) {
                const pnbData = getPocketNoteDataForDate(fullKey);
                if (pnbData) {
                    value = getPnbFieldValue(pnbData, currentFieldIndex, currentRowIndex);
                    displayValue = value || '-';
                } else {
                    displayValue = '-';
                }
            } else {
                // For other rows, use existing monthlyData
                value = monthlyData[monthKey][`${fieldId}_${fullKey}`] || '';
                displayValue = value || '-';
            }

            if (type === 'distance' && !isNaN(value) && value !== '') {
                total += parseFloat(value);
            }

            // All rendered as readonly divs (format numeric single-digits to 2 digits)
            let cellHTML = `
                <div class="readonly-cell" title="${escapeHtml(formatTwoDigits(displayValue))}">
                    ${escapeHtml(formatTwoDigits(displayValue))}
                </div>
            `;

            inputs += `
                <td style="padding: 2px; border: 1px solid #ddd; height: var(--row-height);">
                    ${cellHTML}
                </td>
            `;
        }

        // Total column - only for distance fields
        const totalDisplay = type === 'distance' ? total.toFixed(1) : '';
        inputs += `
            <td style="padding: 4px; border: 1px solid #ddd; background: #e8f5e8; text-align: center; font-weight: bold; height: var(--row-height);">
                <div class="readonly-cell">${escapeHtml(totalDisplay)}</div>
            </td>
        `;

        return inputs;
    }

    // Activities (main/sub) display cells: read-only values (numbers aggregated from Pocket Note Book if available, fallback to monthlyData)
    function generateActivityDisplayCells(monthKey, fieldId, type) {
        let cells = '';
        let total = 0;

        // Detect if this is a sub duty field (format: sub_<dutyId>_<subIndex>)
        const isSubDuty = fieldId.startsWith("sub_");
        let dutyId = null;
        let subIndex = null;
        let expectedDutyName = null;

        if (isSubDuty) {
            const parts = fieldId.split("_");
            dutyId = Number(parts[1]);
            subIndex = Number(parts[2]);

            // attempt to get duty name from duties data
            try {
                const duties = (window.getDutiesData && typeof window.getDutiesData === 'function') ? window.getDutiesData() : JSON.parse(localStorage.getItem('phi_duties_data') || '[]');
                const duty = duties.find(d => Number(d.id) === dutyId || d.id === dutyId);
                if (duty && Array.isArray(duty.subDuties) && duty.subDuties[subIndex]) {
                    expectedDutyName = String(duty.subDuties[subIndex]).trim();
                }
            } catch (e) {
                console.error('Error reading duties for summary auto-fill:', e);
            }
        }

        for (let day = 1; day <= 31; day++) {
            const dayKey = day.toString().padStart(2, '0');
            const fullKey = `${monthKey}-${dayKey}`;
            let value = '';

            // If this is a sub duty and we have an expectedDutyName, try to read aggregated value from Pocket Note Book
            if (isSubDuty && expectedDutyName) {
                const pnb = getPocketNoteDataForDate(fullKey);
                if (pnb) {
                    const combined = ((pnb.morningTasks || '') + "\n" + (pnb.afternoonTasks || '')).split("\n").map(l => l.trim()).filter(Boolean);

                    let totalQty = 0;
                    for (const line of combined) {
                        const parts = line.split(" - ");
                        if (parts.length >= 2) {
                            const name = parts.slice(0, parts.length - 1).join(" - ").trim();
                            const qtyStr = parts[parts.length - 1].trim();
                            if (name === expectedDutyName && qtyStr.match(/^\d+$/)) {
                                totalQty += Number(qtyStr);
                            }
                        }
                    }

                    if (totalQty > 0) {
                        value = String(totalQty);
                    }
                }
            }

            // fallback to monthlyData stored values if not filled from PNB
            if (value === '') {
                value = monthlyData[monthKey] ? (monthlyData[monthKey][`${fieldId}_${fullKey}`] || '') : '';
            }

            if (!isNaN(value) && value !== '') total += Number(value);

            const display = (value === '' ? '-' : String(value));
            const formatted = formatTwoDigits(display);
            cells += `
                <td style="padding: 2px; border: 1px solid #ddd; height: var(--row-height);">
                    <div class="readonly-cell" title="${escapeHtml(formatted)}">${escapeHtml(formatted)}</div>
                </td>
            `;
        }

        // Total column
        cells += `
            <td style="padding: 4px; border: 1px solid #ddd; background: #e8f5e8; text-align: center; font-weight: bold; height: var(--row-height);">
                <div class="readonly-cell">${total === 0 ? '-' : String(total)}</div>
            </td>
        `;

        return cells;
    }

    // Helper function to get Pocket Note data for specific date
    // UPDATED: Now uses global window.getPocketNotes() which is synced with Firebase
    function getPocketNoteDataForDate(dateString) {
        try {
            // Use the global accessor if available (from pocketNoteEntry.js)
            if (typeof window.getPocketNotes === 'function') {
                const pocketNotes = window.getPocketNotes();
                return pocketNotes.find(note => note.date === dateString);
            } else {
                // Fallback to localStorage if module not loaded (legacy)
                const pocketNotes = JSON.parse(localStorage.getItem('pocketNotes') || '[]');
                return pocketNotes.find(note => note.date === dateString);
            }
        } catch (error) {
            console.error('Error loading pocket note data:', error);
            return null;
        }
    }

    // Helper function to get specific field value from Pocket Note data (used for time rows 02-05 etc)
    function getPnbFieldValue(pnbData, fieldIndex, rowIndex) {
        const period = rowIndex === 0 ? 'morning' : 'afternoon';

        switch (fieldIndex) {
            case 1: // Time of departure from office
                return pnbData.officeDeparture?.[period] || '';
            case 2: // Time of arrival in the field
                return pnbData.fieldArrival?.[period] || '';
            case 3: // Time of leaving from field
                return pnbData.fieldDeparture?.[period] || '';
            case 4: // Time of returning to the office
                return pnbData.officeArrival?.[period] || '';
            case 5: // Distance traveled - By vehicle maintained
                return pnbData.vehicleDistance?.[period] || '';
            default:
                return '';
        }
    }

    // --- Firebase Sync Logic ---
    function initFirebaseSync() {
        if (window.DirectFirebaseService) {
            console.log('[DailySummary] Initializing Firebase Subscription...');
            window.DirectFirebaseService.subscribe('phi_monthly_activities', (data) => {
                if (data) {
                    console.log('[DailySummary] Received update from Firebase');
                    monthlyData = data;
                    // Re-render current view
                    const year = parseInt(document.getElementById('yearSelect')?.value || new Date().getFullYear());
                    const month = parseInt(document.getElementById('monthSelect')?.value || (new Date().getMonth() + 1));

                    const container = document.getElementById('activitiesTableContainer');
                    if (container) {
                        container.innerHTML = renderActivitiesTable(year, month);
                        initTableScrollSync();
                    }
                } else {
                    // No data in cloud, check if we need to migrate local data
                    const localM = localStorage.getItem('phi_monthly_activities');
                    if (localM) {
                        try {
                            const parsed = JSON.parse(localM);
                            if (Object.keys(parsed).length > 0) {
                                console.log('[DailySummary] Migrating local data to Firebase...');
                                monthlyData = parsed;
                                saveMonthlyData(); // Save to cloud
                            }
                        } catch (e) { console.error(e); }
                    }
                }
            });
        }
    }

    // Initialize Sync
    if (window.DirectFirebaseService) {
        initFirebaseSync();
    } else {
        setTimeout(initFirebaseSync, 1000); // retry if service not ready
    }

    // Keep save/clear helpers (monthlyData still persisted) - no inputs to update in the table anymore
    window.loadMonthlyData = function () {
        const year = parseInt(document.getElementById('yearSelect').value);
        const month = parseInt(document.getElementById('monthSelect').value);
        document.getElementById('activitiesTableContainer').innerHTML = renderActivitiesTable(year, month);
        setTimeout(initTableScrollSync, 50);
    };

    window.saveMonthlyData = async function () {
        if (window.DirectFirebaseService) {
            try {
                await window.DirectFirebaseService.save('phi_monthly_activities', monthlyData);
                showSuccess('Monthly data saved to Cloud successfully!');
            } catch (err) {
                console.error('Error saving monthly data:', err);
                showError('Failed to save to Cloud');
            }
        } else {
            // Fallback
            localStorage.setItem('phi_monthly_activities', JSON.stringify(monthlyData));
            showSuccess('Monthly data saved locally (Offline mode)!');
        }
    };

    window.clearMonthlyData = async function () {
        if (!await showConfirm('Are you sure you want to clear all monthly data?')) return;

        monthlyData = {};
        if (window.DirectFirebaseService) {
            try {
                await window.DirectFirebaseService.save('phi_monthly_activities', {});
                showSuccess('All data cleared from Cloud.');
            } catch (e) { showError('Failed to clear cloud data'); }
        } else {
            localStorage.removeItem('phi_monthly_activities');
        }

        document.getElementById('activitiesTableContainer').innerHTML = renderActivitiesTable(new Date().getFullYear(), new Date().getMonth() + 1);
    };

    // small helpers
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // --- GLOBAL helper for two-digit formatting ---
    // format numbers 1..9 as two digits (01..09). Leave other values untouched.
    function formatTwoDigits(v) {
        if (v === null || v === undefined) return v;
        const s = String(v).trim();
        // keep '-' and time strings and decimals as-is
        if (s === '-' || s.indexOf(':') !== -1 || s.indexOf('.') !== -1) return s;
        // only pad pure integer numbers
        if (/^\d+$/.test(s)) return s.padStart(2, '0');
        return s;
    }

    // Table scroll sync (top fake scrollbar)
    function initTableScrollSync() {
        const container = document.getElementById('activitiesTableContainer');
        const top = document.getElementById('activitiesTableContainerTop');
        if (!container || !top) return;
        top.onscroll = function () { container.scrollLeft = top.scrollLeft; };
        container.onscroll = function () { top.scrollLeft = container.scrollLeft; };
    }

    // Listen for PNB updates
    window.addEventListener('pocketNotesUpdated', () => {
        const container = document.getElementById('activitiesTableContainer');
        if (container) {
            console.log('[DailySummary] PNB updated, refreshing table...');
            const year = parseInt(document.getElementById('yearSelect')?.value || new Date().getFullYear());
            const month = parseInt(document.getElementById('monthSelect')?.value || (new Date().getMonth() + 1));
            container.innerHTML = renderActivitiesTable(year, month);
            initTableScrollSync();
        }
    });

    // expose some helpers for debugging/testing
    window._dailySummaryDebug = {
        monthlyData,
        renderActivitiesTable
    };

})();


/* ====== PRINT-TABLE-ONLY PLUGIN (appended) ======
   Adds two printing methods:
   1) CSS-only (via injected @media print) which hides everything except the table container.
   2) New-window print: opens a clean window with the table HTML and prints it (recommended).
   Usage: call printTableOnly() or click the Print button (a button with id 'printButton' will be created if missing).
   This block is idempotent — if already present it won't be added twice.
==================================================*/
(function () {
    if (window.__print_table_only_plugin_installed) return;
    window.__print_table_only_plugin_installed = true;

    // CONFIG: id of your table container (change if your DOM uses another id)
    var TABLE_CONTAINER_ID = 'activitiesTableContainer';
    var PRINT_BUTTON_ID = 'printButton';

    // 1) Inject minimal print CSS to hide other elements in CSS-only mode
    var css = document.createElement('style');
    css.type = 'text/css';
    css.id = 'print-table-only-styles';
    css.appendChild(document.createTextNode(
        `@media print {
  /* hide everything first */
  body * { visibility: hidden !important; }

  /* show only the table container */
  #${TABLE_CONTAINER_ID}, #${TABLE_CONTAINER_ID} * {
    visibility: visible !important;
  }

  /* position the container at top-left and use full width */
  #${TABLE_CONTAINER_ID} {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
  }

  /* force table to use full width and keep headers across pages */
  #${TABLE_CONTAINER_ID} table {
    width: 100% !important;
    min-width: 0 !important;
    border-collapse: collapse;
  }
  #${TABLE_CONTAINER_ID} thead { display: table-header-group; }
  #${TABLE_CONTAINER_ID} tfoot { display: table-footer-group; }

  /* hide app chrome that might still be visible */
  header, footer, nav, .no-print, .app-toolbar, .controls { display: none !important; }
}

/* optional: make printed table look better when using the new-window print version */
@page {
  size: A3 landscape;
  margin: 8mm;
}
`));
    // Only add once
    if (!document.getElementById(css.id)) document.head.appendChild(css);

    // 2) New-window print function (recommended)
    function printTableOnly() {
        var container = document.getElementById(TABLE_CONTAINER_ID);
        if (!container) {
            showError('Print failed: table container with id "' + TABLE_CONTAINER_ID + '" not found.');
            return;
        }

        // Clone the element to avoid modifying original
        var cloned = container.cloneNode(true);

        // Remove elements inside cloned container that should not be printed
        var noPrintEls = cloned.querySelectorAll('.no-print');
        noPrintEls.forEach(function (el) { el.parentNode.removeChild(el); });

        var tableHtml = cloned.innerHTML;

        var printWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes');
        if (!printWindow) {
            showWarning('Could not open print window. Please allow popups for this site or use the browser print dialog.');
            return;
        }

        var doc = printWindow.document;
        doc.open();
        doc.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Print - Activities Table</title>
  <style>
    html,body{margin:0;padding:8mm; background:white; color:#000; font-family: Arial, sans-serif;}
    table { border-collapse: collapse; width:100%; }
    th, td { border:1px solid #ffffffff; padding:6px; font-size:10pt; text-align: center; }
    th { background: #747070ff; font-weight:600; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    @page { size: A3 landscape; margin: 8mm; }
    /* keep long text readable */
    td { word-break: break-word; white-space: normal; }
    .readonly-cell { display:flex; align-items:center; justify-content:center; text-align:center; }
  </style>
</head>
<body>
  <h2 style="margin:6px 0 12px 0;">Summary of Activities</h2>
  <div id="print-root">
    ${tableHtml}
  </div>

  <div style="margin-top:18mm; display:flex; justify-content:space-between; font-size:12pt;">
    <div>Prepared by: ______________________</div>
    <div>Checked by: ______________________</div>
    <div>Approved by: ______________________</div>
  </div>

  <script>
    // Wait a tiny bit for fonts/images then trigger print
    window.onload = function(){ setTimeout(function(){ window.print(); }, 200); };
  </script>
</body>
</html>`);
        doc.close();
        printWindow.focus();
    }

    // 3) Attach to existing print button if available, else create one
    function attachPrintButton() {
        var existing = document.getElementById(PRINT_BUTTON_ID);
        if (existing) {
            existing.addEventListener('click', printTableOnly);
            return;
        }

        // Create a small floating button in bottom-right corner (non-intrusive)
        var btn = document.createElement('button');
        btn.id = PRINT_BUTTON_ID;
        btn.type = 'button';
        btn.title = 'Print table (opens print preview)';
        btn.innerText = 'Print Table';
        btn.style.position = 'fixed';
        btn.style.right = '12px';
        btn.style.bottom = '12px';
        btn.style.zIndex = '2147483647';
        btn.style.padding = '8px 12px';
        btn.style.borderRadius = '6px';
        btn.style.border = 'none';
        btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
        btn.style.cursor = 'pointer';
        btn.className = 'no-print';

        // Minimal styling hook for dark mode
        btn.style.background = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? '#ffffff' : '#0b63d4';
        btn.style.color = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? '#000' : '#fff';

        btn.addEventListener('click', printTableOnly);


    }

    // Try to attach after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachPrintButton);
    } else {
        attachPrintButton();
    }

    // Expose function for manual calls
    window.printTableOnly = printTableOnly;

})();
