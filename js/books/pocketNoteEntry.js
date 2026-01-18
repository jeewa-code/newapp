// pocketNoteEntry.js - UPDATED to show removable sub-duty chips between dropdown and textarea
// Based on original: :contentReference[oaicite:2]{index=2}

// Global function to get pocket notes from localStorage
window.getPocketNotes = function () {
    return JSON.parse(localStorage.getItem('pocketNotes') || '[]');
};

window.savePocketNote = function (data) {
    const notes = window.getPocketNotes();
    const existingIndex = notes.findIndex(note => note.date === data.date);

    if (existingIndex >= 0) {
        notes[existingIndex] = data;
    } else {
        notes.push(data);
    }

    localStorage.setItem('pocketNotes', JSON.stringify(notes));
};

window.openPocketNoteEntry = function (showInTab = false) {
    const container = showInTab ? document.getElementById("pnbTabContainer") : document.getElementById("contentArea");
    if (!container) return;

    container.innerHTML = `
        <style>
            /* Improved time input styling */
            .time-input-wrapper {
                position: relative;
                width: 100%;
            }
            .time-input-wrapper::after {
                content: "⏰";
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                color: #1b5e20;
                font-size: 14px;
                pointer-events: none;
            }
            .time-input {
                width: 100%;
                padding: 8px 30px 8px 8px;
                border: 1px solid #ccc;
                border-radius: 4px;
                background: white;
                cursor: pointer;
                font-family: inherit;
            }
            .time-input:focus {
                outline: none;
                border-color: #1b5e20;
                box-shadow: 0 0 0 2px rgba(27, 94, 32, 0.1);
            }
            
            /* Default time styling */
            .default-time {
                color: #1565c0 !important;
                font-weight: bold;
            }
            .saved-time {
                color: #000000 !important;
                font-weight: normal;
            }
            
            /* Quick buttons single row layout */
            .quick-buttons-row {
                display: flex;
                gap: 2px;
                margin-top: 5px;
                flex-wrap: nowrap;
                overflow-x: auto;
            }
            .quick-time-btn {
                font-size: 10px;
                padding: 4px 3px;
                border: 1px solid #1b5e20;
                background: #e8f5e8;
                color: #1b5e20;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                min-width: 40px;
                white-space: nowrap;
                flex-shrink: 0;
            }
            .quick-time-btn:hover {
                background: #c8e6c9;
                transform: translateY(-1px);
            }
            .quick-time-btn.active {
                background: #1b5e20;
                color: white;
                font-weight: bold;
            }
            
            /* Improved select styling */
            .service-select {
                width: 100%;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 4px;
                background: white;
                cursor: pointer;
                font-family: inherit;
            }
            .service-select:focus {
                outline: none;
                border-color: #1b5e20;
                box-shadow: 0 0 0 2px rgba(27, 94, 32, 0.1);
            }
            
            /* Day type selector styling */
            .day-type-selector {
                background: #f8f9fa;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
            }
            .day-type-row {
                display: flex;
                align-items: center;
                gap: 15px;
                flex-wrap: wrap;
            }
            .day-type-label {
                font-weight: bold;
                color: #1b5e20;
                display: block;
                margin-bottom: 8px;
            }
            .day-type-combo {
                flex: 1;
                min-width: 250px;
                padding: 10px;
                border: 2px solid #1b5e20;
                border-radius: 6px;
                background: white;
                font-size: 14px;
                font-weight: 500;
            }
            .holiday-work-checkbox {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                color: #856404;
                font-weight: 500;
            }
            .holiday-work-checkbox input {
                width: 16px;
                height: 16px;
            }
            
            /* Mobile responsive for day type selector */
            @media (max-width: 768px) {
                .day-type-selector {
                    padding: 12px;
                    margin-bottom: 12px;
                }
                .day-type-label {
                    font-size: 13px;
                    margin-bottom: 6px;
                }
                .day-type-combo {
                    min-width: 100%;
                    width: 100%;
                    padding: 10px;
                    font-size: 13px;
                }
                .holiday-work-checkbox {
                    width: 100%;
                    padding: 8px;
                    font-size: 12px;
                }
            }
            
            /* Mobile responsive table */
            @media (max-width: 768px) {
                .pnb-responsive-table {
                    display: block;
                    width: 100%;
                    overflow-x: visible;
                }
                .pnb-responsive-table thead {
                    display: none;
                }
                .pnb-responsive-table tbody {
                    display: block;
                    width: 100%;
                }
                .pnb-responsive-table tr {
                    display: block;
                    margin-bottom: 15px;
                    border: 2px solid #1b5e20;
                    border-radius: 8px;
                    background: white;
                    overflow: visible;
                }
                .pnb-responsive-table td {
                    display: block;
                    width: 100% !important;
                    border: none !important;
                    padding: 10px !important;
                    text-align: left;
                    position: relative;
                    box-sizing: border-box;
                }
                .pnb-label-cell {
                    background: #e8f5e8;
                    font-weight: bold;
                    font-size: 14px;
                    color: #1b5e20;
                    border-bottom: 2px solid #1b5e20 !important;
                }
                .pnb-data-cell::before {
                    content: attr(data-label);
                    font-weight: bold;
                    color: #fff;
                    background: #1b5e20;
                    display: block;
                    margin-bottom: 8px;
                    font-size: 11px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    text-align: center;
                }
                .pnb-data-cell {
                    background: #f8f9fa;
                    min-height: 50px;
                }
                .pnb-data-cell:not(:last-child) {
                    border-bottom: 1px solid #dee2e6 !important;
                }
                
                /* Ensure inputs and selects are fully visible */
                .pnb-data-cell input,
                .pnb-data-cell select,
                .pnb-data-cell textarea {
                    width: 100%;
                    box-sizing: border-box;
                }
                
                /* Quick time buttons responsive */
                .quick-buttons-row {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
            }
            
            /* Table disabled state - only date remains editable */
            .table-disabled {
                opacity: 0.6;
            }
            .table-disabled input:not(#pnbDate),
            .table-disabled select,
            .table-disabled textarea,
            .table-disabled .quick-time-btn {
                pointer-events: none;
            }
            .table-enabled {
                opacity: 1;
            }
            .table-enabled input,
            .table-enabled select,
            .table-enabled textarea,
            .table-enabled .quick-time-btn {
                pointer-events: all;
            }
            
            /* Compact button styling */
            .compact-btn {
                padding: 8px 16px;
                font-size: 14px;
                margin: 0 5px;
                min-width: 100px;
            }
            
            /* Date picker styling */
            .date-picker-container {
                position: relative;
                display: inline-block;
                width: 100%; /* ensure container takes width on mobile */
            }
            .date-navigation {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            .date-nav-btn {
                background: #1b5e20;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .date-nav-btn:hover {
                background: #155724;
            }
            .date-nav-btn:disabled {
                background: #6c757d;
                cursor: not-allowed;
            }
            .current-date-display {
                font-weight: bold;
                font-size: 16px;
                color: #1b5e20;
                min-width: 200px;
                text-align: center;
            }

            /* Date picker full row layout */
            .date-picker-full-row {
                display: flex;
                align-items: center;
                gap: 15px;
                flex-wrap: nowrap;
            }
            .date-picker-label {
                white-space: nowrap;
                flex-shrink: 0;
            }

            /* Mobile adjustment for date nav - Two row layout */
            @media (max-width: 768px) {
                .date-picker-full-row {
                    flex-wrap: wrap;
                    gap: 10px;
                    padding: 5px 0;
                }
                
                /* First row: Label and Calendar button */
                .date-picker-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: #1b5e20;
                    line-height: 1.2;
                    flex: 1;
                    order: 1;
                }
                .calendar-toggle-btn {
                    padding: 8px 12px;
                    font-size: 13px;
                    height: 32px;
                    border-radius: 6px;
                    order: 2;
                }
                .calendar-toggle-btn span {
                    display: inline;
                }
                
                /* Second row: Date navigation */
                .date-navigation {
                    width: 100%;
                    gap: 8px;
                    order: 3;
                    justify-content: center;
                }
                .date-nav-btn {
                    width: 36px;
                    height: 36px;
                    min-width: 36px;
                    min-height: 36px;
                    max-width: 36px;
                    max-height: 36px;
                    padding: 0;
                    border-radius: 6px;
                    flex-shrink: 0;
                    font-size: 14px;
                }
                .current-date-display {
                    min-width: auto;
                    max-width: none;
                    font-size: 13px;
                    flex: 0 1 auto;
                    font-weight: 600;
                    line-height: 1.3;
                    text-align: center;
                }
            }
            
            /* Calendar toggle button */
            .calendar-toggle-btn {
                background: #1b5e20;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 14px;
            }
            .calendar-toggle-btn:hover {
                background: #155724;
            }
            
            /* Mini calendar styling */
            .mini-calendar {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 2px;
                margin-top: 10px;
                background: #f8f9fa;
                padding: 10px;
                border-radius: 8px;
                border: 1px solid #dee2e6;
            }
            .calendar-day {
                text-align: center;
                padding: 5px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
            }
            .calendar-day:hover {
                transform: scale(1.1);
                z-index: 1;
            }
            .calendar-day-header {
                text-align: center;
                padding: 5px;
                font-weight: bold;
                font-size: 11px;
                color: #1b5e20;
                background: #e8f5e8;
            }
            .day-has-data {
                font-weight: bold;
            }
            .current-day {
                border: 2px solid #1b5e20 !important;
                transform: scale(1.1);
            }

            /* NEW: Simple Duty Dropdown Styling */
            .duty-dropdown-container {
                margin-bottom: 10px;
            }
            
            .duty-select-wrapper {
                display: flex;
                gap: 8px;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .duty-main-select {
                flex: 1;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 6px;
                background: white;
                font-size: 14px;
            }
            
            .duty-sub-select {
                flex: 1;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 6px;
                background: white;
                font-size: 14px;
            }
            
            .add-duty-btn {
                background: #1b5e20;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
            }
            
            .add-duty-btn:hover {
                background: #155724;
            }
            
            .add-duty-btn:disabled {
                background: #6c757d;
                cursor: not-allowed;
            }

            /* Chips (sub-duty pills) */
            .chips-container {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin: 6px 0;
            }
            .duty-chip {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 6px 8px;
                border-radius: 16px;
                font-size: 13px;
            }
            .duty-chip .remove-chip-btn {
                background: transparent;
                border: none;
                cursor: pointer;
            }
            
            /* Mobile responsive - prevent horizontal overflow */
            @media (max-width: 768px) {
                body, html {
                    overflow-x: hidden;
                }
                
                /* Main container */
                #contentArea,
                #pnbTabContainer {
                    padding: 10px !important;
                    margin: 0 !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                    overflow-x: hidden !important;
                }
                
                /* Form container */
                #pocketNoteForm {
                    width: 100%;
                    max-width: 100%;
                    overflow-x: hidden;
                    box-sizing: border-box;
                }
                
                /* All direct child divs */
                #pocketNoteForm > div,
                .day-type-selector,
                .date-picker-full-row {
                    max-width: 100%;
                    box-sizing: border-box;
                }
            }

        </style>

         <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 100%; box-sizing: border-box; overflow-x: hidden;">
            
            <!-- Date Picker Section -->
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #dee2e6;">
                <div id="dataStatusIndicator" style="text-align: center; font-weight: bold; margin-bottom: 15px; display: none;"></div>
                
                <!-- Full row with label, date navigation, and calendar button -->
                <div class="date-picker-full-row">
                    <label class="day-type-label date-picker-label">දිනය තෝරන්න:</label>
                    
                    <div class="date-navigation">
                        <button id="prevDate" class="date-nav-btn">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <div id="currentDateDisplay" class="current-date-display">
                            ${formatDisplayDateWithDay(new Date().toISOString().split('T')[0])}
                        </div>
                        <button id="nextDate" class="date-nav-btn">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    
                    <button type="button" id="calendarToggleBtn" class="calendar-toggle-btn">
                        <i class="fas fa-calendar-alt"></i>
                        <span></span>
                    </button>
                </div>
                
                <!-- Mini Calendar (initially hidden) -->
                <div id="miniCalendarContainer" style="display: none; margin-top: 10px;">
                    <div id="miniCalendar" class="mini-calendar">
                        ${renderMiniCalendar(new Date())}
                    </div>
                </div>
                
                <!-- Hidden date input for form submission -->
                <input type="hidden" id="pnbDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
            
            <!-- Day Type Selector -->
            <div class="day-type-selector">
                <label class="day-type-label">දිනයේ තත්වය:</label>
                <div class="day-type-row">
                    <select id="dayType" class="day-type-combo">
                        <option value="working">රාජකාරි දිනයකි</option>
                        <option value="government_holiday">රජයේ නිවාඩු දිනයකි</option>
                        <option id="sundayOption" value="sunday_holiday">ඉරිදා විවේක දිනයකි</option>
                        <option value="casual_leave">අනියම් නිවාඩු ලබා ගන්න ලදී</option>
                        <option value="sick_leave">අසනීප නිවාඩු ලබා ගන්න ලදී</option>
                    </select>
                    
                    <div id="holidayWorkCheckbox" class="holiday-work-checkbox" style="display: none;">
                        <input type="checkbox" id="workOnHoliday">
                        <label for="workOnHoliday">නිවාඩු දින රාජකාරි</label>
                    </div>
                </div>
            </div>
            
            <form id="pocketNoteForm">
                <table id="mainTable" class="table-enabled pnb-responsive-table" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background: #e8f5e8;">
                            <th style="padding: 10px; border: 1px solid #ddd; width: 30%;">#</th>
                            <th style="padding: 10px; border: 1px solid #ddd; width: 35%;">පෙරවරු</th>
                            <th style="padding: 10px; border: 1px solid #ddd; width: 35%;">පස්වරු</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                    <tr>
                        <td class="pnb-label-cell" style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">සේවා ස්ථානය</td>
                        <td class="pnb-data-cell" data-label="පෙරවරු" style="padding: 5px; border: 1px solid #ddd;">
                            <select class="service-select service-location-morning">
                                <option value="">තෝරන්න</option>
                                <option value="office">කාර්යාලය</option>
                                <option value="field">ක්ෂේත්‍රය</option>
                                <option value="meeting">සාකච්ඡා</option>
                                <option value="inspection">පරීක්ෂණ</option>
                                <option value="training">පුහුණුව</option>
                                <option value="other">වෙනත්</option>
                            </select>
                        </td>
                        <td class="pnb-data-cell" data-label="පස්වරු" style="padding: 5px; border: 1px solid #ddd;">
                            <select class="service-select service-location-afternoon">
                                <option value="">තෝරන්න</option>
                                <option value="office">කාර්යාලය</option>
                                <option value="field">ක්ෂේත්‍රය</option>
                                <option value="meeting">සාකච්ඡා</option>
                                <option value="inspection">පරීක්ෂණ</option>
                                <option value="training">පුහුණුව</option>
                                <option value="other">වෙනත්</option>
                            </select>
                        </td>
                    </tr>
                    
                    <!-- Office Departure -->
                    <tr>
                        <td class="pnb-label-cell" style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">කාර්යාලයෙන් පිටත්වීම</td>
                        <td class="pnb-data-cell" data-label="පෙරවරු" style="padding: 5px; border: 1px solid #ddd;">
                            <div>
                                <div class="time-input-wrapper">
                                    <input type="time" class="time-input default-time" data-field="officeDepartureMorning">
                                </div>
                                <div class="quick-buttons-row">
                                    ${createQuickTimeButtons('officeDepartureMorning', ['05:30', '06:00', '06:30', '07:00', '07:30', '08:00'])}
                                </div>
                            </div>
                        </td>
                        <td class="pnb-data-cell" data-label="පස්වරු" style="padding: 5px; border: 1px solid #ddd;">
                            <div>
                                <div class="time-input-wrapper">
                                    <input type="time" class="time-input default-time" data-field="officeDepartureAfternoon">
                                </div>
                                <div class="quick-buttons-row">
                                    ${createQuickTimeButtons('officeDepartureAfternoon', ['12:30', '13:00', '13:30', '14:00', '14:30', '15:00'])}
                                </div>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Field Arrival -->
                    <tr>
                        <td class="pnb-label-cell" style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">ක්ෂේත්‍රයට ලගා වීම</td>
                        <td class="pnb-data-cell" data-label="පෙරවරු" style="padding: 5px; border: 1px solid #ddd;">
                            <div>
                                <div class="time-input-wrapper">
                                    <input type="time" class="time-input default-time" data-field="fieldArrivalMorning">
                                </div>
                                <div class="quick-buttons-row">
                                    ${createQuickTimeButtons('fieldArrivalMorning', ['06:30', '07:00', '07:30', '08:00', '08:30', '09:00'])}
                                </div>
                            </div>
                        </td>
                        <td class="pnb-data-cell" data-label="පස්වරු" style="padding: 5px; border: 1px solid #ddd;">
                            <div>
                                <div class="time-input-wrapper">
                                    <input type="time" class="time-input default-time" data-field="fieldArrivalAfternoon">
                                </div>
                                <div class="quick-buttons-row">
                                    ${createQuickTimeButtons('fieldArrivalAfternoon', ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30'])}
                                </div>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Field Departure -->
                    <tr>
                        <td class="pnb-label-cell" style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">ක්ෂේත්‍රයෙන් පිටත්වීම</td>
                        <td class="pnb-data-cell" data-label="පෙරවරු" style="padding: 5px; border: 1px solid #ddd;">
                            <div>
                                <div class="time-input-wrapper">
                                    <input type="time" class="time-input default-time" data-field="fieldDepartureMorning">
                                </div>
                                <div class="quick-buttons-row">
                                    ${createQuickTimeButtons('fieldDepartureMorning', ['11:30', '12:00', '12:30', '13:00', '13:30', '14:00'])}
                                </div>
                            </div>
                        </td>
                        <td class="pnb-data-cell" data-label="පස්වරු" style="padding: 5px; border: 1px solid #ddd;">
                            <div>
                                <div class="time-input-wrapper">
                                    <input type="time" class="time-input default-time" data-field="fieldDepartureAfternoon">
                                </div>
                                <div class="quick-buttons-row">
                                    ${createQuickTimeButtons('fieldDepartureAfternoon', ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30'])}
                                </div>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Office Arrival -->
                    <tr>
                        <td class="pnb-label-cell" style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">කාර්යාලයට ලගා වීම</td>
                        <td class="pnb-data-cell" data-label="පෙරවරු" style="padding: 5px; border: 1px solid #ddd;">
                            <div>
                                <div class="time-input-wrapper">
                                    <input type="time" class="time-input default-time" data-field="officeArrivalMorning">
                                </div>
                                <div class="quick-buttons-row">
                                    ${createQuickTimeButtons('officeArrivalMorning', ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'])}
                                </div>
                            </div>
                        </td>
                        <td class="pnb-data-cell" data-label="පස්වරු" style="padding: 5px; border: 1px solid #ddd;">
                            <div>
                                <div class="time-input-wrapper">
                                    <input type="time" class="time-input default-time" data-field="officeArrivalAfternoon">
                                </div>
                                <div class="quick-buttons-row">
                                    ${createQuickTimeButtons('officeArrivalAfternoon', ['16:30', '17:00', '17:30', '18:00', '18:30', '19:00'])}
                                </div>
                            </div>
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="pnb-label-cell" style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">යතුරුපැදියෙන් ගමන් කල දුර (km)</td>
                        <td class="pnb-data-cell" data-label="පෙරවරු" style="padding: 5px; border: 1px solid #ddd;">
                            <input type="number" step="0.1" min="0" class="distance-morning default-time" 
                                   style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        </td>
                        <td class="pnb-data-cell" data-label="පස්වරු" style="padding: 5px; border: 1px solid #ddd;">
                            <input type="number" step="0.1" min="0" class="distance-afternoon default-time" 
                                   style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="pnb-label-cell" style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">පොදු ප්‍රවාහනයෙන් ගමන් කල දුර (km)</td>
                        <td class="pnb-data-cell" data-label="පෙරවරු" style="padding: 5px; border: 1px solid #ddd;">
                            <input type="number" step="0.1" min="0" class="public-transport-morning default-time" 
                                   style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        </td>
                        <td class="pnb-data-cell" data-label="පස්වරු" style="padding: 5px; border: 1px solid #ddd;">
                            <input type="number" step="0.1" min="0" class="public-transport-afternoon default-time" 
                                   style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                        </td>
                    </tr>
                    </tbody>
                </table>
                
                <!-- Morning Tasks with NEW Simple Duty Dropdown -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: bold; margin-bottom: 8px; color: #1b5e20;">
                        පෙරවරුවේ කල රාජකාරි:
                    </label>
                    
                    <div class="duty-dropdown-container pnb-duty-wrapper">
                        <div class="duty-select-wrapper">
                            <select id="morningMainDuty" class="duty-main-select">
                                <option value="">ප්‍රධාන රාජකාරිය තෝරන්න</option>
                            </select>
                            <select id="morningSubDuty" class="duty-sub-select" disabled>
                                <option value="">උප රාජකාරිය තෝරන්න</option>
                            </select>
                            <!-- NEW: Quantity Selector -->
                            <input id="morningDutyCount" 
                                   type="number" 
                                   min="1" max="99"
                                   placeholder="Count"
                                   style="width:70px; padding:8px; border:1px solid #ccc; border-radius:6px;"
                                   disabled>

                            <button type="button" id="addMorningDuty" class="add-duty-btn" disabled>
                                එකතු කරන්න
                            </button>
                        </div>
                    </div>

                    <div id="morningChips" class="chips-container" style="margin-bottom:8px;"></div>
                    
                    <textarea id="morningTasks" rows="4" 
                              style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; resize: vertical;"></textarea>
                </div>
                
                <!-- Afternoon Tasks with NEW Simple Duty Dropdown -->
                <div style="margin-bottom: 20px;">
                    <label style="display: block; font-weight: bold; margin-bottom: 8px; color: #1b5e20;">
                        පස්වරුවේ කල රාජකාරි:
                    </label>
                    
                    <div class="duty-dropdown-container pnb-duty-wrapper">
                        <div class="duty-select-wrapper">
                            <select id="afternoonMainDuty" class="duty-main-select">
                                <option value="">ප්‍රධාන රාජකාරිය තෝරන්න</option>
                            </select>
                            <select id="afternoonSubDuty" class="duty-sub-select" disabled>
                                <option value="">උප රාජකාරිය තෝරන්න</option>
                            </select>
                            <!-- NEW: Quantity Selector -->
                            <input id="afternoonDutyCount" 
                                   type="number" 
                                   min="1" max="99"
                                   placeholder="Count"
                                   style="width:70px; padding:8px; border:1px solid #ccc; border-radius:6px;"
                                   disabled>

                            <button type="button" id="addAfternoonDuty" class="add-duty-btn" disabled>
                                එකතු කරන්න
                            </button>
                        </div>
                    </div>

                    <div id="afternoonChips" class="chips-container" style="margin-bottom:8px;"></div>
                    
                    <textarea id="afternoonTasks" rows="4" 
                              style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; resize: vertical;"></textarea>
                </div>
                
                <div style="text-align: center;">
                    <button type="submit" id="pnbSubmitBtn" class="compact-btn"
                            style="background: #1b5e20; color: white; border: none; border-radius: 6px; 
                                   font-weight: bold; cursor: pointer; transition: background 0.3s ease;">
                        <i class="fas fa-save" style="margin-right: 8px;"></i>Save Note
                    </button>
                    <button type="button" onclick="clearForm()" class="compact-btn"
                            style="background: #6c757d; color: white; border: none; border-radius: 6px; 
                                   font-weight: bold; cursor: pointer; transition: background 0.3s ease;">
                        <i class="fas fa-broom" style="margin-right: 8px;"></i>Clear
                    </button>
                </div>
            </form>

            
        </div>

    `;

    // Initialize the form
    initializeForm();
};

// --- Below: core behaviour functions (parsing, calendar, duty dropdowns, chip UI hooks, save/load) ---

let pnbCurrentDate = new Date();

window.setPNBEntryDate = function (dateString) {
    const dateParts = dateString.split('-');
    pnbCurrentDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    if (document.getElementById('pnbDate')) {
        updateDateDisplay(pnbCurrentDate);
        loadExistingDataForDate(pnbCurrentDate);
        checkDayTypeAndUpdateTable();
    }
};

// Utility helper functions (formatting)
function formatDisplayDateWithDay(dateString) {
    try {
        const d = new Date(dateString);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()} (${dayNames[d.getDay()]})`;
    } catch (e) {
        return dateString;
    }
}

// (Re-using original helper createQuickTimeButtons if present; otherwise provide fallback)
function createQuickTimeButtons(field, arr) {
    if (!Array.isArray(arr)) return '';
    return arr.map(t => `<button type="button" class="quick-time-btn" data-field="${field}" data-time="${t}">${t}</button>`).join('');
}

// Initialize form with all event listeners
function initializeForm() {
    const prevDateBtn = document.getElementById('prevDate');
    const nextDateBtn = document.getElementById('nextDate');
    const currentDateDisplay = document.getElementById('currentDateDisplay');
    const dayTypeSelect = document.getElementById('dayType');
    const holidayWorkCheckbox = document.getElementById('holidayWorkCheckbox');
    const workOnHolidayCheckbox = document.getElementById('workOnHoliday');
    const mainTable = document.getElementById('mainTable');
    const calendarToggleBtn = document.getElementById('calendarToggleBtn');

    // Initial setup
    updateDateDisplay(pnbCurrentDate);
    checkDayTypeAndUpdateTable();
    loadLastEntryTimes();

    // Date navigation handlers
    prevDateBtn.addEventListener('click', () => {
        pnbCurrentDate.setDate(pnbCurrentDate.getDate() - 1);
        updateDateDisplay(pnbCurrentDate);
        checkDayTypeAndUpdateTable();
    });

    nextDateBtn.addEventListener('click', () => {
        pnbCurrentDate.setDate(pnbCurrentDate.getDate() + 1);
        updateDateDisplay(pnbCurrentDate);
        checkDayTypeAndUpdateTable();
    });

    // Calendar toggle handler
    calendarToggleBtn.addEventListener('click', function () {
        const calendarContainer = document.getElementById('miniCalendarContainer');
        if (calendarContainer.style.display === 'none') {
            calendarContainer.style.display = 'block';
            // Update calendar when showing
            document.getElementById('miniCalendar').innerHTML = renderMiniCalendar(pnbCurrentDate);
        } else {
            calendarContainer.style.display = 'none';
        }
    });

    // Day type change handler
    dayTypeSelect.addEventListener('change', function () {
        checkDayTypeAndUpdateTable();
    });

    // Holiday work checkbox handler
    workOnHolidayCheckbox.addEventListener('change', function () {
        checkDayTypeAndUpdateTable();
    });

    // Add event listeners for quick time buttons
    initializeQuickTimeButtons();

    // Add input event listeners to sync quick buttons with manual time input
    initializeTimeInputSync();

    // Form submission handler
    document.getElementById('pocketNoteForm').addEventListener('submit', function (e) {
        e.preventDefault();
        savePocketNoteEntry();
    });

    // Load existing data for current date if available
    loadExistingDataForDate(pnbCurrentDate);

    // NEW: Initialize duty dropdowns
    initializeDutyDropdowns();

    // NEW: Initialize duty chips UI (renders chips and hooks add/remove)
    initializeDutyChipsUI();
}

// NEW: Simple Duty Dropdown System
function initializeDutyDropdowns() {
    const duties = getDutiesDataSafe();

    // Initialize morning dropdowns
    const morningMainSelect = document.getElementById('morningMainDuty');
    const morningSubSelect = document.getElementById('morningSubDuty');
    const addMorningBtn = document.getElementById('addMorningDuty');

    // Initialize afternoon dropdowns
    const afternoonMainSelect = document.getElementById('afternoonMainDuty');
    const afternoonSubSelect = document.getElementById('afternoonSubDuty');
    const addAfternoonBtn = document.getElementById('addAfternoonDuty');

    // Populate main duty dropdowns
    duties.forEach(duty => {
        const option1 = document.createElement('option');
        option1.value = duty.mainDuty;
        option1.textContent = duty.mainDuty;
        morningMainSelect.appendChild(option1.cloneNode(true));

        const option2 = option1.cloneNode(true);
        afternoonMainSelect.appendChild(option2);
    });

    // Morning main duty change handler (updated to enable quantity)
    morningMainSelect.addEventListener('change', function () {
        const selectedMainDuty = this.value;
        morningSubSelect.innerHTML = '<option value="">උප රාජකාරිය තෝරන්න</option>';
        morningSubSelect.disabled = true;
        document.getElementById('morningDutyCount').disabled = true;
        addMorningBtn.disabled = true;

        if (selectedMainDuty) {
            const duty = duties.find(d => d.mainDuty === selectedMainDuty);
            if (duty && duty.subDuties && duty.subDuties.length > 0) {
                morningSubSelect.disabled = false;
                duty.subDuties.forEach(subDuty => {
                    const option = document.createElement('option');
                    option.value = subDuty;
                    option.textContent = subDuty;
                    morningSubSelect.appendChild(option);
                });
            } else {
                // No sub duties, enable count & add button directly
                document.getElementById('morningDutyCount').disabled = false;
                addMorningBtn.disabled = false;
            }
        }
    });

    // Morning sub duty change handler
    morningSubSelect.addEventListener('change', function () {
        const has = this.value !== '';
        document.getElementById('morningDutyCount').disabled = !has;
        addMorningBtn.disabled = !has;
    });

    // Add morning duty handler (updated to include quantity)
    // Note: actual add handler is augmented by chips integration later.

    // Afternoon main duty change handler (updated to enable quantity)
    afternoonMainSelect.addEventListener('change', function () {
        const selectedMainDuty = this.value;
        afternoonSubSelect.innerHTML = '<option value="">උප රාජකාරිය තෝරන්න</option>';
        afternoonSubSelect.disabled = true;
        document.getElementById('afternoonDutyCount').disabled = true;
        addAfternoonBtn.disabled = true;

        if (selectedMainDuty) {
            const duty = duties.find(d => d.mainDuty === selectedMainDuty);
            if (duty && duty.subDuties && duty.subDuties.length > 0) {
                afternoonSubSelect.disabled = false;
                duty.subDuties.forEach(subDuty => {
                    const option = document.createElement('option');
                    option.value = subDuty;
                    option.textContent = subDuty;
                    afternoonSubSelect.appendChild(option);
                });
            } else {
                // No sub duties, enable count & add button directly
                document.getElementById('afternoonDutyCount').disabled = false;
                addAfternoonBtn.disabled = false;
            }
        }
    });

    // Afternoon sub duty change handler
    afternoonSubSelect.addEventListener('change', function () {
        const has = this.value !== '';
        document.getElementById('afternoonDutyCount').disabled = !has;
        addAfternoonBtn.disabled = !has;
    });

    // Add afternoon duty handler (updated to include quantity)
    // Note: actual add handler is augmented by chips integration later.
}

// NEW: Safe getter for duties data
function getDutiesDataSafe() {
    try {
        if (window.getDutiesData && typeof window.getDutiesData === 'function') {
            return window.getDutiesData();
        }
        return JSON.parse(localStorage.getItem('phi_duties_data') || '[]');
    } catch (e) {
        console.error('Error reading duties data:', e);
        return [];
    }
}

// Rest of the existing functions remain the same...
// Update date display and hidden input
function updateDateDisplay(date) {
    // Get local date string instead of UTC
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateString = `${yyyy}-${mm}-${dd}`;

    document.getElementById('currentDateDisplay').innerHTML = formatDisplayDateWithDay(dateString);
    document.getElementById('pnbDate').value = dateString;

    // Update mini calendar if it's visible
    const calendarContainer = document.getElementById('miniCalendarContainer');
    if (calendarContainer && calendarContainer.style.display === 'block') {
        document.getElementById('miniCalendar').innerHTML = renderMiniCalendar(date);
    }

    // Initial Sunday/Weekday visibility will be handled by checkDayTypeAndUpdateTable
    // called within loadExistingDataForDate

    // Load existing data for the new date
    loadExistingDataForDate(date);
}

// Render mini calendar
function renderMiniCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const dayNames = ['ඉ', 'ස', 'අ', 'බ', 'බ්‍ර', 'සි', 'සෙ'];
    let calendarHTML = '';

    // Day headers
    dayNames.forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });

    // Empty cells for days before the first day of month
    for (let i = 0; i < startingDay; i++) {
        calendarHTML += `<div class="calendar-day"></div>`;
    }

    // Days of the month
    const notes = window.getPocketNotes();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const dayDate = new Date(year, month, day);
        const isToday = dayDate.toDateString() === today.toDateString();
        const isCurrent = dayDate.toDateString() === date.toString();
        const hasData = notes.some(note => note.date === dateString);

        const dayColor = getDayColorForCalendar(dateString, notes.find(n => n.date === dateString));
        const isFutureDate = dayDate > today;

        calendarHTML += `
            <div class="calendar-day ${hasData ? 'day-has-data' : ''} ${isCurrent ? 'current-day' : ''}"
                 style="background: ${dayColor.background}; color: ${dayColor.color}; border: 1px solid ${dayColor.border};
                        ${isToday ? 'font-weight: bold;' : ''}"
                 onclick="selectCalendarDate('${dateString}')"
                 title="${getDayTooltip(dateString, notes.find(n => n.date === dateString))}">
                ${day}
            </div>
        `;
    }

    return calendarHTML;
}

// Get day color for calendar
function getDayColorForCalendar(dateString, note) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Future dates - white
    if (date > today) {
        return {
            background: '#ffffff',
            color: '#6c757d',
            border: '#dee2e6'
        };
    }

    const isSunday = date.getDay() === 0;

    // Sundays are always red (even without data), unless worked
    if (isSunday) {
        if (note && note.dayType === 'sunday_holiday' && note.workOnHoliday) {
            return {
                background: '#1565c0',
                color: 'white',
                border: '#0d47a1'
            };
        }
        return {
            background: '#c62828',
            color: 'white',
            border: '#b71c1c'
        };
    }

    if (!note) {
        return {
            background: '#6c757d',
            color: 'white',
            border: '#5a6268'
        };
    }

    const displayType = getDisplayDayType(note);

    switch (displayType) {
        case 'working':
            return {
                background: '#1b5e20',
                color: 'white',
                border: '#155724'
            };
        case 'duty-holiday':
            return {
                background: '#1565c0',
                color: 'white',
                border: '#0d47a1'
            };
        case 'leave':
            return {
                background: '#c62828',
                color: 'white',
                border: '#b71c1c'
            };
        case 'government-holiday':
            return {
                background: '#ff6f00',
                color: 'white',
                border: '#e65100'
            };
        default:
            return {
                background: '#6c757d',
                color: 'white',
                border: '#5a6268'
            };
    }
}

// Select date from calendar
window.selectCalendarDate = function (dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Don't allow selection of future dates
    if (date > today) return;

    updateDateDisplay(date);

    // Hide calendar after selection
    document.getElementById('miniCalendarContainer').style.display = 'none';
};

// Load existing data for date
function loadExistingDataForDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateString = `${yyyy}-${mm}-${dd}`;

    const notes = window.getPocketNotes();
    const existingNote = notes.find(note => note.date === dateString);
    const indicator = document.getElementById('dataStatusIndicator');

    if (existingNote) {
        if (indicator) {
            indicator.textContent = 'දත්ත ඇතුලත් කර ඇත';
            indicator.style.color = '#1b5e20';
            indicator.style.display = 'block';
        }
        // Set day type
        document.getElementById('dayType').value = existingNote.dayType || 'working';

        // Set holiday work checkbox
        if (existingNote.workOnHoliday) {
            document.getElementById('workOnHoliday').checked = true;
        }

        // Service Location
        document.querySelector('.service-location-morning').value = existingNote.serviceLocation?.morning || '';
        document.querySelector('.service-location-afternoon').value = existingNote.serviceLocation?.afternoon || '';

        // Office Departure
        setTimeField('officeDepartureMorning', existingNote.officeDeparture?.morning, true);
        setTimeField('officeDepartureAfternoon', existingNote.officeDeparture?.afternoon, true);

        // Field Arrival
        setTimeField('fieldArrivalMorning', existingNote.fieldArrival?.morning, true);
        setTimeField('fieldArrivalAfternoon', existingNote.fieldArrival?.afternoon, true);

        // Field Departure
        setTimeField('fieldDepartureMorning', existingNote.fieldDeparture?.morning, true);
        setTimeField('fieldDepartureAfternoon', existingNote.fieldDeparture?.afternoon, true);

        // Office Arrival
        setTimeField('officeArrivalMorning', existingNote.officeArrival?.morning, true);
        setTimeField('officeArrivalAfternoon', existingNote.officeArrival?.afternoon, true);

        // Distances
        setValueField('.distance-morning', existingNote.vehicleDistance?.morning, true);
        setValueField('.distance-afternoon', existingNote.vehicleDistance?.afternoon, true);
        setValueField('.public-transport-morning', existingNote.publicTransportDistance?.morning, true);
        setValueField('.public-transport-afternoon', existingNote.publicTransportDistance?.afternoon, true);

        // Tasks
        document.getElementById('morningTasks').value = existingNote.morningTasks || '';
        document.getElementById('afternoonTasks').value = existingNote.afternoonTasks || '';

        // render chips from tasks text
        renderChipsFromTextarea('morning');
        renderChipsFromTextarea('afternoon');

        // Update last entry times
        updateLastEntryTimes(existingNote);

        // Update submit button text
        const submitBtn = document.getElementById('pnbSubmitBtn');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-sync-alt" style="margin-right: 8px;"></i>Update Note';
        }
    } else {
        if (indicator) {
            indicator.textContent = 'දත්ත ඇතුලත් කර නොමැත';
            indicator.style.color = '#c62828';
            indicator.style.display = 'block';
        }

        // DEFAULT DEFAULTing for NEW entry
        const dayTypeSelect = document.getElementById('dayType');
        const workOnHolidayCheckbox = document.getElementById('workOnHoliday');

        if (date.getDay() === 0) { // Sunday
            dayTypeSelect.value = 'sunday_holiday';
        } else {
            // Default to working for any other day (Mon-Sat)
            dayTypeSelect.value = 'working';
        }

        if (workOnHolidayCheckbox) workOnHolidayCheckbox.checked = false;

        // Update submit button text
        const submitBtn = document.getElementById('pnbSubmitBtn');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save" style="margin-right: 8px;"></i>Save Note';
        }

        // Clear all form data (Inputs, Chips, Textarea)
        clearTimeFields();
        const mTasks = document.getElementById('morningTasks');
        const aTasks = document.getElementById('afternoonTasks');
        if (mTasks) mTasks.value = '';
        if (aTasks) aTasks.value = '';
        if (document.getElementById('morningChips')) document.getElementById('morningChips').innerHTML = '';
        if (document.getElementById('afternoonChips')) document.getElementById('afternoonChips').innerHTML = '';

        // No existing data - load last entry times as defaults only if table is enabled
        const dayType = document.getElementById('dayType').value;
        const workOnHoliday = document.getElementById('workOnHoliday').checked;
        const isNonWorkingDay = dayType !== 'working';
        const shouldEnableTable = !isNonWorkingDay || (isNonWorkingDay && workOnHoliday);

        if (shouldEnableTable) {
            loadLastEntryTimes();
        } else {
            clearTimeFields();
        }
    }

    // Update table state based on loaded data
    checkDayTypeAndUpdateTable();
}

// Load last entry times as defaults
function loadLastEntryTimes() {
    const lastTimes = JSON.parse(localStorage.getItem('pocketNoteLastTimes') || '{}');

    if (Object.keys(lastTimes).length > 0) {
        // Set time fields with default styling
        Object.keys(lastTimes).forEach(field => {
            const input = document.querySelector(`[data-field="${field}"]`);
            if (input && !input.value) {
                input.value = lastTimes[field];
                input.classList.add('default-time');
            }
        });

        // Set distance fields
        if (lastTimes.distanceMorning) {
            setValueField('.distance-morning', lastTimes.distanceMorning, false);
        }
        if (lastTimes.distanceAfternoon) {
            setValueField('.distance-afternoon', lastTimes.distanceAfternoon, false);
        }
        if (lastTimes.publicTransportMorning) {
            setValueField('.public-transport-morning', lastTimes.publicTransportMorning, false);
        }
        if (lastTimes.publicTransportAfternoon) {
            setValueField('.public-transport-afternoon', lastTimes.publicTransportAfternoon, false);
        }
    }
}

// Update last entry times from current note
function updateLastEntryTimes(note) {
    const lastTimes = {
        officeDepartureMorning: note.officeDeparture?.morning,
        officeDepartureAfternoon: note.officeDeparture?.afternoon,
        fieldArrivalMorning: note.fieldArrival?.morning,
        fieldArrivalAfternoon: note.fieldArrival?.afternoon,
        fieldDepartureMorning: note.fieldDeparture?.morning,
        fieldDepartureAfternoon: note.fieldDeparture?.afternoon,
        officeArrivalMorning: note.officeArrival?.morning,
        officeArrivalAfternoon: note.officeArrival?.afternoon,
        distanceMorning: note.vehicleDistance?.morning,
        distanceAfternoon: note.vehicleDistance?.afternoon,
        publicTransportMorning: note.publicTransportDistance?.morning,
        publicTransportAfternoon: note.publicTransportDistance?.afternoon
    };

    localStorage.setItem('pocketNoteLastTimes', JSON.stringify(lastTimes));
}

// Check day type and update table state
function checkDayTypeAndUpdateTable() {
    const dateString = document.getElementById('pnbDate').value; // yyyy-mm-dd local
    const dayTypeSelect = document.getElementById('dayType');
    const holidayWorkCheckbox = document.getElementById('holidayWorkCheckbox');
    const workOnHolidayCheckbox = document.getElementById('workOnHoliday');
    const mainTable = document.getElementById('mainTable');
    const sundayOption = document.getElementById('sundayOption');

    // Use a more robust local date parsing
    const dateParts = dateString.split('-');
    const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dayOfWeek = date.getDay();

    // ENFORCE: Sunday visibility and values based on weekday
    const allOptions = dayTypeSelect.querySelectorAll('option');
    if (dayOfWeek === 0) {
        // Sunday: Only show Sunday Holiday, hide all others
        allOptions.forEach(opt => {
            if (opt.value === 'sunday_holiday') {
                opt.hidden = false;
                opt.style.display = 'block';
            } else {
                opt.hidden = true;
                opt.style.display = 'none';
            }
        });
        dayTypeSelect.value = 'sunday_holiday';
    } else {
        // Non-Sunday: Hide Sunday Holiday, show all others
        allOptions.forEach(opt => {
            if (opt.value === 'sunday_holiday') {
                opt.hidden = true;
                opt.style.display = 'none';
            } else {
                opt.hidden = false;
                opt.style.display = 'block';
            }
        });
        // Force reset if non-sunday
        if (dayTypeSelect.value === 'sunday_holiday') {
            dayTypeSelect.value = 'working';
        }
    }

    const dayType = dayTypeSelect.value;
    const isWorkingOnHoliday = workOnHolidayCheckbox.checked;

    // Check if this is a saved Sunday without work
    const notes = window.getPocketNotes();
    const existingNote = notes.find(note => note.date === dateString);

    // Show/hide holiday work checkbox for government holidays and Sundays
    if (dayType === 'government_holiday' || dayType === 'sunday_holiday') {
        holidayWorkCheckbox.style.display = 'flex';
    } else {
        holidayWorkCheckbox.style.display = 'none';
        if (!existingNote) {
            workOnHolidayCheckbox.checked = false;
        }
    }

    // Determine if table should be enabled
    const isNonWorkingDay = dayType !== 'working';
    const shouldEnableTable = !isNonWorkingDay || (isNonWorkingDay && isWorkingOnHoliday);

    // Special case: saved Sundays without work should never be editable
    const isSavedSundayWithoutWork = existingNote && dayOfWeek === 0 && existingNote.dayType === 'sunday_holiday' && !existingNote.workOnHoliday;

    if (isSavedSundayWithoutWork) {
        mainTable.classList.remove('table-enabled');
        mainTable.classList.add('table-disabled');
        holidayWorkCheckbox.style.display = 'none';
        workOnHolidayCheckbox.checked = false;
        dayTypeSelect.disabled = false; // Allow changing day type
    } else if (shouldEnableTable) {
        // Enable table
        mainTable.classList.remove('table-disabled');
        mainTable.classList.add('table-enabled');
        dayTypeSelect.disabled = false;

        // Load default times only for enabled working days without existing data
        if (!existingNote && (dayType === 'working' || (isNonWorkingDay && isWorkingOnHoliday))) {
            loadLastEntryTimes();
        }
    } else {
        // Disable table for non-working days without work
        mainTable.classList.remove('table-enabled');
        mainTable.classList.add('table-disabled');
        dayTypeSelect.disabled = false;

        // Clear time fields for disabled non-working days without existing data
        if (!existingNote) {
            clearTimeFields();
        }
    }
}

// Function to clear time fields
function clearTimeFields() {
    // Clear all time inputs
    document.querySelectorAll('.time-input').forEach(input => {
        input.value = '';
        input.classList.remove('default-time', 'saved-time');
    });

    // Clear all quick buttons
    document.querySelectorAll('.quick-time-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Clear distance fields
    document.querySelectorAll('.distance-morning, .distance-afternoon, .public-transport-morning, .public-transport-afternoon').forEach(input => {
        input.value = '';
        input.classList.remove('default-time', 'saved-time');
    });

    // Clear service locations
    document.querySelectorAll('.service-select').forEach(s => s.value = '');
}

// Quick time button initializers
function initializeQuickTimeButtons() {
    document.querySelectorAll('.quick-time-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const field = this.getAttribute('data-field');
            const time = this.getAttribute('data-time');
            const input = document.querySelector(`[data-field="${field}"]`);
            if (input) {
                input.value = time;
                input.classList.remove('default-time');
                input.classList.add('saved-time');

                // Update quick buttons active state
                document.querySelectorAll(`.quick-time-btn[data-field="${field}"]`).forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

// Sync manual input <-> quick buttons
function initializeTimeInputSync() {
    document.querySelectorAll('.time-input').forEach(input => {
        input.addEventListener('input', function () {
            const field = this.getAttribute('data-field');
            // clear quick button active states for this field
            document.querySelectorAll(`.quick-time-btn[data-field="${field}"]`).forEach(b => b.classList.remove('active'));
            if (this.value) {
                this.classList.remove('default-time');
                this.classList.add('saved-time');
            } else {
                this.classList.remove('saved-time');
            }
        });
    });
}

// set time field helper
function setTimeField(fieldName, value, markSaved) {
    const input = document.querySelector(`[data-field="${fieldName}"]`);
    if (input) {
        input.value = value || '';
        if (markSaved && value) {
            input.classList.remove('default-time');
            input.classList.add('saved-time');
        }
    }
}

// set value field helper (distance etc.)
function setValueField(selector, value, markSaved) {
    const input = document.querySelector(selector);
    if (input) {
        input.value = value || '';
        if (markSaved && value) {
            input.classList.add('saved-time');
        }
    }
}

// Save pocket note entry (reads form, saves to localStorage)
function savePocketNoteEntry() {
    const date = document.getElementById('pnbDate').value;

    // Helper to combine Chips + Textarea
    const getCombinedTasks = (period) => {
        const chipsContainerId = period === 'morning' ? 'morningChips' : 'afternoonChips';
        const textareaId = period === 'morning' ? 'morningTasks' : 'afternoonTasks';

        const chips = [];
        document.querySelectorAll(`#${chipsContainerId} .duty-chip`).forEach(chip => {
            chips.push(chip.getAttribute('data-text'));
        });

        const text = document.getElementById(textareaId).value.trim();
        if (text) chips.push(text);

        return chips.join('\n');
    };

    const note = {
        date,
        dayType: document.getElementById('dayType').value,
        workOnHoliday: document.getElementById('workOnHoliday').checked,
        serviceLocation: {
            morning: document.querySelector('.service-location-morning').value,
            afternoon: document.querySelector('.service-location-afternoon').value
        },
        officeDeparture: {
            morning: document.querySelector('[data-field="officeDepartureMorning"]').value,
            afternoon: document.querySelector('[data-field="officeDepartureAfternoon"]').value
        },
        fieldArrival: {
            morning: document.querySelector('[data-field="fieldArrivalMorning"]').value,
            afternoon: document.querySelector('[data-field="fieldArrivalAfternoon"]').value
        },
        fieldDeparture: {
            morning: document.querySelector('[data-field="fieldDepartureMorning"]').value,
            afternoon: document.querySelector('[data-field="fieldDepartureAfternoon"]').value
        },
        officeArrival: {
            morning: document.querySelector('[data-field="officeArrivalMorning"]').value,
            afternoon: document.querySelector('[data-field="officeArrivalAfternoon"]').value
        },
        vehicleDistance: {
            morning: document.querySelector('.distance-morning').value,
            afternoon: document.querySelector('.distance-afternoon').value
        },
        publicTransportDistance: {
            morning: document.querySelector('.public-transport-morning').value,
            afternoon: document.querySelector('.public-transport-afternoon').value
        },
        morningTasks: getCombinedTasks('morning'),
        afternoonTasks: getCombinedTasks('afternoon')
    };

    // save
    updateLastEntryTimes(note);
    window.savePocketNote(note);
    showSuccess('Pocket note saved.');
}

// Helper to compute display day type used in calendar color logic
function getDisplayDayType(note) {
    if (!note) return 'none';
    if (note.dayType === 'sunday_holiday' && note.workOnHoliday) return 'duty-holiday';
    if (note.dayType === 'sunday_holiday') return 'sunday';
    if (note.dayType === 'government_holiday') return 'government-holiday';
    if (note.dayType === 'casual_leave' || note.dayType === 'sick_leave') return 'leave';
    return 'working';
}

// Tooltip content for calendar days
function getDayTooltip(dateString, note) {
    if (!note) return 'No data';
    const parts = [];
    parts.push(`Type: ${note.dayType || 'working'}`);
    if (note.morningTasks) parts.push(`Morning: ${note.morningTasks.split('\n').slice(0, 2).join('; ')}`);
    if (note.afternoonTasks) parts.push(`Afternoon: ${note.afternoonTasks.split('\n').slice(0, 2).join('; ')}`);
    return parts.join('\n');
}

// -------------------- CHIPS UI (UPDATED) --------------------

// Helper to create a chip element
function createDutyChip(text, forPeriod) {
    const chip = document.createElement('div');
    chip.className = 'duty-chip';
    chip.setAttribute('data-text', text);
    chip.style.display = 'inline-flex';
    chip.style.alignItems = 'center';
    chip.style.gap = '8px';
    chip.style.margin = '4px';
    chip.style.padding = '6px 8px';
    chip.style.borderRadius = '16px';
    chip.style.background = forPeriod === 'morning' ? '#ffe9b3' : '#cfe8ff';
    chip.style.border = '1px solid rgba(0,0,0,0.08)';
    chip.style.fontSize = '13px';
    chip.style.color = '#212121';
    chip.style.cursor = 'default';

    const span = document.createElement('span');
    span.textContent = text;
    chip.appendChild(span);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'remove-chip-btn';
    btn.textContent = '✕';
    btn.title = 'Remove';
    btn.style.background = 'transparent';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.padding = '0 6px';
    btn.style.fontSize = '12px';
    btn.style.lineHeight = '1';
    btn.style.color = '#6c6c6c';

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        removeDutyChip(text, forPeriod);
    });

    chip.appendChild(btn);
    return chip;
}

// Render chips for morning or afternoon from the textarea content, THEN CLEAR TEXTAREA of chips
function renderChipsFromTextarea(period) {
    const textareaId = period === 'morning' ? 'morningTasks' : 'afternoonTasks';
    const chipsContainerId = period === 'morning' ? 'morningChips' : 'afternoonChips';
    const textarea = document.getElementById(textareaId);
    const container = document.getElementById(chipsContainerId);
    if (!textarea || !container) return;

    // Clear existing chips
    container.innerHTML = '';

    const lines = (textarea.value || '').split('\n').map(l => l.trim()).filter(Boolean);
    const textLines = [];

    lines.forEach(line => {
        // Simple heuristic: If it ends with " - Number", it's a duty chip.
        // User inputs ensure this format.
        if (line.match(/ - \d+$/)) {
            const chip = createDutyChip(line, period);
            container.appendChild(chip);
        } else {
            textLines.push(line);
        }
    });

    // Valid text content stays in textarea
    textarea.value = textLines.join('\n');
}

// Remove chip: just remove the element
function removeDutyChip(text, period) {
    // We need to find the specific chip element. 
    // Since we don't pass the element, we search by data-text.
    const chipsContainerId = period === 'morning' ? 'morningChips' : 'afternoonChips';
    const container = document.getElementById(chipsContainerId);
    if (!container) return;

    const chipToRemove = Array.from(container.children).find(child => child.getAttribute('data-text') === text);
    if (chipToRemove) {
        container.removeChild(chipToRemove);
    }
}

// Hook into addMorningDuty and addAfternoonDuty handlers
function augmentDutyAdders() {
    const addMorningBtn = document.getElementById('addMorningDuty');
    const addAfternoonBtn = document.getElementById('addAfternoonDuty');

    if (addMorningBtn) {
        try { addMorningBtn.removeEventListener('click', window._pnbAddMorningHandler); } catch (e) { }

        addMorningBtn.addEventListener('click', function () {
            const morningMainSelect = document.getElementById('morningMainDuty');
            const morningSubSelect = document.getElementById('morningSubDuty');
            const qtyInput = document.getElementById('morningDutyCount');
            const chipContainer = document.getElementById('morningChips');

            const mainDuty = morningMainSelect ? morningMainSelect.value : '';
            const subDuty = morningSubSelect ? morningSubSelect.value : '';
            const qty = qtyInput && qtyInput.value ? Number(qtyInput.value) : null;

            if (!qty || qty < 1) {
                if (!subDuty && !mainDuty) return showError('කරුණාකර රාජකාරිය තෝරන්න.');
                if (!qty) return showError('ප්‍රමාණය ඇතුලත් කරන්න (1-99).');
            }

            const dutyText = `${subDuty || mainDuty} - ${qty}`;

            // Add Chip directly
            if (dutyText && chipContainer) {
                const chip = createDutyChip(dutyText, 'morning');
                chipContainer.appendChild(chip);
            }

            // Reset dropdowns + count
            if (morningMainSelect) morningMainSelect.value = '';
            if (morningSubSelect) {
                morningSubSelect.innerHTML = '<option value="">උප රාජකාරිය තෝරන්න</option>';
                morningSubSelect.disabled = true;
            }
            if (qtyInput) {
                qtyInput.value = '';
                qtyInput.disabled = true;
            }
            if (addMorningBtn) addMorningBtn.disabled = true;
        });
    }

    if (addAfternoonBtn) {
        try { addAfternoonBtn.removeEventListener('click', window._pnbAddAfternoonHandler); } catch (e) { }

        addAfternoonBtn.addEventListener('click', function () {
            const afternoonMainSelect = document.getElementById('afternoonMainDuty');
            const afternoonSubSelect = document.getElementById('afternoonSubDuty');
            const qtyInput = document.getElementById('afternoonDutyCount');
            const chipContainer = document.getElementById('afternoonChips');

            const mainDuty = afternoonMainSelect ? afternoonMainSelect.value : '';
            const subDuty = afternoonSubSelect ? afternoonSubSelect.value : '';
            const qty = qtyInput && qtyInput.value ? Number(qtyInput.value) : null;

            if (!qty || qty < 1) {
                if (!subDuty && !mainDuty) return showError('කරුණාකර රාජකාරිය තෝරන්න.');
                if (!qty) return showError('ප්‍රමාණය ඇතුලත් කරන්න (1-99).');
            }

            const dutyText = `${subDuty || mainDuty} - ${qty}`;

            // Add Chip directly
            if (dutyText && chipContainer) {
                const chip = createDutyChip(dutyText, 'afternoon');
                chipContainer.appendChild(chip);
            }

            // Reset dropdowns + count
            if (afternoonMainSelect) afternoonMainSelect.value = '';
            if (afternoonSubSelect) {
                afternoonSubSelect.innerHTML = '<option value="">උප රාජකාරිය තෝරන්න</option>';
                afternoonSubSelect.disabled = true;
            }
            if (qtyInput) {
                qtyInput.value = '';
                qtyInput.disabled = true;
            }
            if (addAfternoonBtn) addAfternoonBtn.disabled = true;
        });
    }
}

// DEPRECATED: Ensure chips are re-rendered when user manually edits textarea
// We NO LONGER sync textarea -> chips while typing, because textarea is for 'extra' notes.
function attachTextareaSync() {
    // Empty function to override previous behavior if any
}

// Initialize chips + augment handlers after the main form is created.
window.initializeDutyChipsUI = function () {
    // create chips containers if not present (defensive)
    const morningArea = document.querySelector('#morningTasks')?.parentElement;
    if (morningArea && !document.getElementById('morningChips')) {
        const cont = document.createElement('div');
        cont.id = 'morningChips';
        cont.className = 'chips-container';
        cont.style.margin = '8px 0 10px 0';
        morningArea.parentElement.insertBefore(cont, morningArea);
    }
    const afternoonArea = document.querySelector('#afternoonTasks')?.parentElement;
    if (afternoonArea && !document.getElementById('afternoonChips')) {
        const cont2 = document.createElement('div');
        cont2.id = 'afternoonChips';
        cont2.className = 'chips-container';
        cont2.style.margin = '8px 0 10px 0';
        afternoonArea.parentElement.insertBefore(cont2, afternoonArea);
    }

    // render chips from existing textarea content (LOAD only)
    renderChipsFromTextarea('morning');
    renderChipsFromTextarea('afternoon');

    // augment add buttons
    augmentDutyAdders();
    // attachTextareaSync(); // Disabled
};

// If initializeForm exists, call initializeDutyChipsUI at the end of it. Many original flows call initializeDutyDropdowns().
// We'll try to hook into that if present.
(function tryAutoInit() {
    // Small delay to allow original initializeForm to create elements
    setTimeout(() => {
        try {
            window.initializeDutyChipsUI();
        } catch (e) {
            console.warn('initializeDutyChipsUI hook failed:', e);
        }
    }, 200);
})();

// End of pocketNoteEntry_updated.js
