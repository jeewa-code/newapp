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
            
            /* Table base styles */
            .pnb-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                max-width: 100%;
                table-layout: fixed;
            }
            
            .pnb-table th,
            .pnb-table td {
                padding: 10px;
                border: 1px solid #ddd;
            }
            
            .pnb-table thead tr {
                background: #e8f5e8;
            }
            
            .pnb-table th {
                padding: 10px;
                border: 1px solid #ddd;
            }
            
            /* Input wrapper in table */
            .pnb-input-wrapper {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
            }
            
            .pnb-input-wrapper input,
            .pnb-input-wrapper select {
                width: 100%;
                max-width: 100%;
                box-sizing: border-box;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 4px;
            }
            
            @media (max-width: 768px) {
                .pnb-table {
                    margin-bottom: 15px;
                }
            }
            
            @media (max-width: 380px) {
                .pnb-table {
                    margin-bottom: 12px;
                }
                
                .pnb-input-wrapper input,
                .pnb-input-wrapper select {
                    padding: 6px;
                    font-size: 13px;
                }
            }
            
            /* Main wrapper responsive */
            .pnb-main-wrapper {
                background: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 100%;
                box-sizing: border-box;
                overflow-x: hidden;
            }
            
            @media (max-width: 768px) {
                .pnb-main-wrapper {
                    padding: 12px;
                    border-radius: 8px;
                }
            }
            
            @media (max-width: 380px) {
                .pnb-main-wrapper {
                    padding: 8px;
                    border-radius: 6px;
                    margin: 0;
                }
            }
            
            /* Date picker section styling */
            .pnb-date-section {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                border: 1px solid #dee2e6;
                max-width: 100%;
                box-sizing: border-box;
            }
            
            @media (max-width: 768px) {
                .pnb-date-section {
                    padding: 12px;
                    margin-bottom: 15px;
                }
            }
            
            @media (max-width: 380px) {
                .pnb-date-section {
                    padding: 10px;
                    margin-bottom: 12px;
                }
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
            
            /* Mobile responsive table - Optimized for 320px and up */
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
                    margin-bottom: 12px;
                    border: 2px solid #1b5e20;
                    border-radius: 6px;
                    background: white;
                    overflow: visible;
                }
                .pnb-responsive-table td {
                    display: block;
                    width: 100% !important;
                    border: none !important;
                    padding: 8px !important;
                    text-align: left;
                    position: relative;
                    box-sizing: border-box;
                }
                .pnb-label-cell {
                    background: #e8f5e8;
                    font-weight: bold;
                    font-size: 13px;
                    color: #1b5e20;
                    border-bottom: 2px solid #1b5e20 !important;
                    padding: 10px !important;
                }
                .pnb-data-cell::before {
                    content: attr(data-label);
                    font-weight: bold;
                    color: #fff;
                    background: #1b5e20;
                    display: block;
                    margin-bottom: 6px;
                    font-size: 10px;
                    padding: 4px 6px;
                    border-radius: 3px;
                    text-align: center;
                }
                .pnb-data-cell {
                    background: #f8f9fa;
                    min-height: 45px;
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
                    font-size: 14px;
                }
                
                /* Quick time buttons responsive */
                .quick-buttons-row {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: thin;
                }
                .quick-buttons-row::-webkit-scrollbar {
                    height: 4px;
                }
                .quick-buttons-row::-webkit-scrollbar-thumb {
                    background: #1b5e20;
                    border-radius: 2px;
                }
            }
            
            /* Extra optimizations for very small screens (320px) */
            @media (max-width: 380px) {
                .pnb-responsive-table tr {
                    margin-bottom: 10px;
                    border-radius: 4px;
                }
                .pnb-responsive-table td {
                    padding: 6px !important;
                }
                .pnb-label-cell {
                    font-size: 12px;
                    padding: 8px !important;
                }
                .pnb-data-cell::before {
                    font-size: 9px;
                    padding: 3px 5px;
                    margin-bottom: 5px;
                }
                .pnb-data-cell {
                    min-height: 40px;
                }
                .pnb-data-cell input,
                .pnb-data-cell select,
                .pnb-data-cell textarea {
                    font-size: 13px;
                    padding: 6px !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                }
                .quick-time-btn {
                    font-size: 9px;
                    padding: 3px 2px;
                    min-width: 35px;
                }
                .time-input {
                    padding: 6px 28px 6px 6px;
                    font-size: 13px;
                }
                .time-input-wrapper::after {
                    font-size: 12px;
                    right: 8px;
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
            
            /* Extra small screens (320px) - Date picker optimizations */
            @media (max-width: 380px) {
                .date-picker-full-row {
                    gap: 6px;
                }
                
                .date-picker-label {
                    font-size: 12px;
                }
                
                .calendar-toggle-btn {
                    padding: 6px 10px;
                    font-size: 12px;
                    height: 28px;
                }
                
                .date-navigation {
                    gap: 6px;
                }
                
                .date-nav-btn {
                    width: 32px;
                    height: 32px;
                    min-width: 32px;
                    min-height: 32px;
                    max-width: 32px;
                    max-height: 32px;
                    font-size: 12px;
                }
                
                .current-date-display {
                    font-size: 11px;
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
            
            /* Mobile optimizations for mini calendar */
            @media (max-width: 768px) {
                .mini-calendar {
                    padding: 8px;
                    gap: 1px;
                }
                .calendar-day,
                .calendar-day-header {
                    padding: 4px;
                    font-size: 11px;
                }
            }
            
            @media (max-width: 380px) {
                .mini-calendar {
                    padding: 6px;
                    gap: 1px;
                }
                .calendar-day,
                .calendar-day-header {
                    padding: 3px;
                    font-size: 10px;
                }
                .calendar-day:hover {
                    transform: scale(1.05);
                }
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
            
            /* Task section styling */
            .pnb-task-section {
                margin-bottom: 20px;
                max-width: 100%;
                box-sizing: border-box;
            }
            
            .pnb-task-label {
                display: block;
                font-weight: bold;
                margin-bottom: 8px;
                color: #1b5e20;
            }
            
            @media (max-width: 768px) {
                .pnb-task-section {
                    margin-bottom: 15px;
                }
            }
            
            @media (max-width: 380px) {
                .pnb-task-section {
                    margin-bottom: 12px;
                }
                .pnb-task-label {
                    font-size: 12px !important;
                    margin-bottom: 6px;
                }
            }
            
            /* Layout Toggle Switch - Mobile Only */
            .layout-toggle-container {
                display: none; /* Hidden on desktop */
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin-bottom: 15px;
                padding: 12px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 2px solid #1b5e20;
            }
            
            @media (max-width: 768px) {
                .layout-toggle-container {
                    display: flex; /* Show on mobile */
                    flex-direction: row;
                    gap: 10px;
                    padding: 10px;
                }
            }
            
            .layout-toggle-label {
                font-weight: bold;
                color: #1b5e20;
                font-size: 13px;
            }
            
            /* Toggle Switch Button */
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 60px;
                height: 30px;
            }
            
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #ccc;
                transition: 0.4s;
                border-radius: 30px;
            }
            
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 22px;
                width: 22px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: 0.4s;
                border-radius: 50%;
            }
            
            input:checked + .toggle-slider {
                background-color: #1b5e20;
            }
            
            input:checked + .toggle-slider:before {
                transform: translateX(30px);
            }
            
            .toggle-layout-text {
                font-size: 13px;
                color: #333;
                font-weight: 500;
            }
            
            @media (max-width: 380px) {
                .layout-toggle-container {
                    padding: 8px;
                }
                
                .layout-toggle-label {
                    font-size: 12px;
                }
                
                .toggle-switch {
                    width: 50px;
                    height: 26px;
                }
                
                .toggle-slider:before {
                    height: 18px;
                    width: 18px;
                }
                
                input:checked + .toggle-slider:before {
                    transform: translateX(24px);
                }
                
                .toggle-layout-text {
                    font-size: 11px;
                }
            }
            
            /* Desktop: Always show table layout */
            @media (min-width: 769px) {
                .pnb-layout-vertical {
                    display: none !important;
                }
                
                .pnb-table {
                    display: table !important;
                }
            }
            
            /* Layout 2 - Vertical Stack */
            .pnb-layout-vertical {
                display: none;
            }
            
            .pnb-layout-vertical.active {
                display: block;
            }
            
            .pnb-period-section {
                background: white;
                border: 2px solid #1b5e20;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
            }
            
            .pnb-period-title {
                background: #1b5e20;
                color: white;
                padding: 10px 15px;
                margin: -15px -15px 15px -15px;
                border-radius: 6px 6px 0 0;
                font-weight: bold;
                font-size: 16px;
                text-align: center;
            }
            
            .pnb-field-row {
                margin-bottom: 15px;
            }
            
            .pnb-field-label {
                display: block;
                font-weight: bold;
                color: #1b5e20;
                margin-bottom: 8px;
                font-size: 14px;
            }
            
            @media (max-width: 768px) {
                .pnb-period-section {
                    padding: 12px;
                    margin-bottom: 15px;
                }
                
                .pnb-period-title {
                    font-size: 15px;
                    padding: 8px 12px;
                    margin: -12px -12px 12px -12px;
                }
                
                .pnb-field-row {
                    margin-bottom: 12px;
                }
            }
            
            @media (max-width: 380px) {
                .pnb-period-section {
                    padding: 10px;
                }
                
                .pnb-period-title {
                    font-size: 14px;
                    padding: 6px 10px;
                    margin: -10px -10px 10px -10px;
                }
                
                .pnb-field-label {
                    font-size: 12px;
                    margin-bottom: 6px;
                }
                
                .pnb-field-row {
                    margin-bottom: 10px;
                }
            }
            
            /* Hide/Show layouts */
            .pnb-table.hidden {
                display: none !important;
            }
            
            /* Textarea styling */
            .pnb-textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
                resize: vertical;
                box-sizing: border-box;
                max-width: 100%;
                font-family: inherit;
            }
            
            @media (max-width: 768px) {
                .pnb-textarea {
                    padding: 9px;
                    font-size: 13px;
                }
            }
            
            @media (max-width: 380px) {
                .pnb-textarea {
                    padding: 8px;
                    font-size: 12px;
                }
            }
            
            /* Button container */
            .pnb-button-container {
                text-align: center;
                max-width: 100%;
            }
            
            @media (max-width: 768px) {
                .pnb-button-container {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
            }
            
            /* Primary save button */
            .pnb-save-btn {
                background: #1b5e20;
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            
            .pnb-save-btn:hover {
                background: #155724;
            }
            
            /* Clear button */
            .pnb-clear-btn {
                background: #6c757d;
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            
            .pnb-clear-btn:hover {
                background: #5a6268;
            }
            
            /* Duty count input */
            .duty-count-input {
                width: 70px;
                padding: 8px;
                border: 1px solid #ccc;
                border-radius: 6px;
                box-sizing: border-box;
            }
            
            @media (max-width: 768px) {
                .duty-count-input {
                    width: 100%;
                }
            }
            
            @media (max-width: 380px) {
                .duty-count-input {
                    padding: 7px;
                    font-size: 12px;
                }
            }
            
            /* Mobile responsive - prevent horizontal overflow */
            @media (max-width: 768px) {
                * {
                    box-sizing: border-box !important;
                }
                
                body, html {
                    overflow-x: hidden;
                    max-width: 100vw;
                }
                
                /* Main container */
                #contentArea,
                #pnbTabContainer {
                    padding: 10px !important;
                    margin: 0 !important;
                    width: 100% !important;
                    max-width: 100vw !important;
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
                
                /* Duty dropdown wrapper */
                .duty-select-wrapper {
                    flex-direction: column;
                    gap: 8px;
                }
                
                .duty-main-select,
                .duty-sub-select {
                    width: 100%;
                    font-size: 13px;
                }
                
                #morningDutyCount,
                #afternoonDutyCount {
                    width: 100% !important;
                }
                
                .add-duty-btn {
                    width: 100%;
                    padding: 10px;
                    font-size: 13px;
                }
                
                /* Chips */
                .duty-chip {
                    font-size: 12px;
                    padding: 5px 8px;
                }
                
                /* Buttons */
                .compact-btn {
                    width: 100%;
                    margin: 5px 0 !important;
                    padding: 10px !important;
                    font-size: 13px !important;
                }
                
                /* All inputs, selects, textareas must fit */
                input, select, textarea {
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                }
            }
            
            /* Extra optimizations for very small screens (320px) */
            @media (max-width: 380px) {
                * {
                    box-sizing: border-box !important;
                }
                
                html, body {
                    overflow-x: hidden !important;
                    max-width: 100vw !important;
                }
                
                #contentArea,
                #pnbTabContainer {
                    padding: 8px !important;
                    width: 100% !important;
                    max-width: 100vw !important;
                }
                
                .pnb-main-wrapper {
                    width: 100% !important;
                    max-width: 100% !important;
                }
                
                .day-type-selector {
                    padding: 10px;
                }
                
                .duty-select-wrapper {
                    gap: 6px;
                }
                
                .duty-main-select,
                .duty-sub-select,
                #morningDutyCount,
                #afternoonDutyCount {
                    font-size: 12px;
                    padding: 7px;
                }
                
                .add-duty-btn {
                    padding: 8px;
                    font-size: 12px;
                }
                
                .duty-chip {
                    font-size: 11px;
                    padding: 4px 6px;
                }
                
                .compact-btn {
                    padding: 8px !important;
                    font-size: 12px !important;
                }
                
                textarea {
                    font-size: 12px !important;
                    padding: 8px !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                }
                
                input, select {
                    font-size: 12px !important;
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                }
                
                label {
                    font-size: 12px !important;
                }
                
                /* Ensure all form divs don't overflow */
                #pocketNoteForm > div,
                .pnb-task-section,
                .pnb-date-section,
                .day-type-selector {
                    max-width: 100% !important;
                    overflow-x: hidden !important;
                    width: 100% !important;
                }
                
                /* Table specific */
                .pnb-table {
                    width: 100% !important;
                    max-width: 100% !important;
                }
                
                .pnb-input-wrapper {
                    width: 100% !important;
                    max-width: 100% !important;
                }
                
                .pnb-input-wrapper input,
                .pnb-input-wrapper select {
                    width: 100% !important;
                    max-width: 100% !important;
                }
            }

        </style>

         <div class="pnb-main-wrapper">
            
            <!-- Date Picker Section -->
            <div class="pnb-date-section">
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
            
            <!-- Layout Toggle Switch - Mobile Only -->
            <div class="layout-toggle-container">
                <span class="layout-toggle-label">Layout:</span>
                <span class="toggle-layout-text"></span>
                <label class="toggle-switch">
                    <input type="checkbox" id="layoutToggle">
                    <span class="toggle-slider"></span>
                </label>
                <span class="toggle-layout-text"></span>
            </div>
            
            <form id="pocketNoteForm">
                <table id="mainTable" class="table-enabled pnb-responsive-table pnb-table">
                    <thead>
                        <tr>
                            <th style="width: 30%;">#</th>
                            <th style="width: 35%;">පෙරවරු</th>
                            <th style="width: 35%;">පස්වරු</th>
                        </tr>
                    </thead>
                    
                    <tbody>
                    <tr>
                        <td class="pnb-label-cell">සේවා ස්ථානය</td>
                        <td class="pnb-data-cell" data-label="පෙරවරු">
                            <div class="pnb-input-wrapper">
                                <div id="service-location-morning-container"></div>
                            </div>
                        </td>
                        <td class="pnb-data-cell" data-label="පස්වරු">
                            <div class="pnb-input-wrapper">
                                <div id="service-location-afternoon-container"></div>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Office Departure -->
                    <tr>
                        <td class="pnb-label-cell">කාර්යාලයෙන් පිටත්වීම</td>
                        <td class="pnb-data-cell" data-label="පෙරවරු">
                            <div>
                                <div class="time-input-wrapper">
                                    <input type="time" class="time-input default-time" data-field="officeDepartureMorning">
                                </div>
                                <div class="quick-buttons-row">
                                    ${createQuickTimeButtons('officeDepartureMorning', ['05:30', '06:00', '06:30', '07:00', '07:30', '08:00'])}
                                </div>
                            </div>
                        </td>
                        <td class="pnb-data-cell" data-label="පස්වරු">
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
                        <td class="pnb-label-cell">ක්ෂේත්‍රයට ලගා වීම</td>
                        <td class="pnb-data-cell" data-label="පෙරවරු">
                            <div>
                                <div class="time-input-wrapper">
                                    <input type="time" class="time-input default-time" data-field="fieldArrivalMorning">
                                </div>
                                <div class="quick-buttons-row">
                                    ${createQuickTimeButtons('fieldArrivalMorning', ['06:30', '07:00', '07:30', '08:00', '08:30', '09:00'])}
                                </div>
                            </div>
                        </td>
                        <td class="pnb-data-cell" data-label="පස්වරු">
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
                        <td class="pnb-label-cell">ක්ෂේත්‍රයෙන් පිටත්වීම</td>
                        <td class="pnb-data-cell" data-label="පෙරවරු">
                            <div>
                                <div class="time-input-wrapper">
                                    <input type="time" class="time-input default-time" data-field="fieldDepartureMorning">
                                </div>
                                <div class="quick-buttons-row">
                                    ${createQuickTimeButtons('fieldDepartureMorning', ['11:30', '12:00', '12:30', '13:00', '13:30', '14:00'])}
                                </div>
                            </div>
                        </td>
                        <td class="pnb-data-cell" data-label="පස්වරු">
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
                        <td class="pnb-label-cell">කාර්යාලයට ලගා වීම</td>
                        <td class="pnb-data-cell" data-label="පෙරවරු">
                            <div>
                                <div class="time-input-wrapper">
                                    <input type="time" class="time-input default-time" data-field="officeArrivalMorning">
                                </div>
                                <div class="quick-buttons-row">
                                    ${createQuickTimeButtons('officeArrivalMorning', ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'])}
                                </div>
                            </div>
                        </td>
                        <td class="pnb-data-cell" data-label="පස්වරු">
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
                        <td class="pnb-label-cell">යතුරුපැදියෙන් ගමන් කල දුර (km)</td>
                        <td class="pnb-data-cell" data-label="පෙරවරු">
                            <div class="pnb-input-wrapper">
                            <input type="number" step="0.1" min="0" class="distance-morning default-time">
                            </div>
                        </td>
                        <td class="pnb-data-cell" data-label="පස්වරු">
                            <div class="pnb-input-wrapper">
                            <input type="number" step="0.1" min="0" class="distance-afternoon default-time">
                            </div>
                        </td>
                    </tr>
                    
                    <tr>
                        <td class="pnb-label-cell">පොදු ප්‍රවාහනයෙන් ගමන් කල දුර (km)</td>
                        <td class="pnb-data-cell" data-label="පෙරවරු">
                            <div class="pnb-input-wrapper">
                            <input type="number" step="0.1" min="0" class="public-transport-morning default-time">
                            </div>
                        </td>
                        <td class="pnb-data-cell" data-label="පස්වරු">
                            <div class="pnb-input-wrapper">
                            <input type="number" step="0.1" min="0" class="public-transport-afternoon default-time">
                            </div>
                        </td>
                    </tr>
                        </td>
                    </tr>
                    </tbody>
                </table>
                
                <!-- Layout 2: Vertical Stack -->
                <div class="pnb-layout-vertical" id="verticalLayout">
                    <!-- Morning Section -->
                    <div class="pnb-period-section">
                        <div class="pnb-period-title">පෙරවරුවේ දත්ත</div>
                        
                        <div class="pnb-field-row">
                            <label class="pnb-field-label">සේවා ස්ථානය</label>
                            <div class="pnb-input-wrapper">
                                <div id="service-location-morning-v-container"></div>
                            </div>
                        </div>
                        
                        <div class="pnb-field-row">
                            <label class="pnb-field-label">කාර්යාලයෙන් පිටත්වීම</label>
                            <div class="time-input-wrapper">
                                <input type="time" class="time-input default-time" data-field="officeDepartureMorning-v">
                            </div>
                            <div class="quick-buttons-row">
                                ${createQuickTimeButtons('officeDepartureMorning-v', ['05:30', '06:00', '06:30', '07:00', '07:30', '08:00'])}
                            </div>
                        </div>
                        
                        <div class="pnb-field-row">
                            <label class="pnb-field-label">ක්ෂේත්‍රයට ලගා වීම</label>
                            <div class="time-input-wrapper">
                                <input type="time" class="time-input default-time" data-field="fieldArrivalMorning-v">
                            </div>
                            <div class="quick-buttons-row">
                                ${createQuickTimeButtons('fieldArrivalMorning-v', ['06:30', '07:00', '07:30', '08:00', '08:30', '09:00'])}
                            </div>
                        </div>
                        
                        <div class="pnb-field-row">
                            <label class="pnb-field-label">ක්ෂේත්‍රයෙන් පිටත්වීම</label>
                            <div class="time-input-wrapper">
                                <input type="time" class="time-input default-time" data-field="fieldDepartureMorning-v">
                            </div>
                            <div class="quick-buttons-row">
                                ${createQuickTimeButtons('fieldDepartureMorning-v', ['11:30', '12:00', '12:30', '13:00', '13:30', '14:00'])}
                            </div>
                        </div>
                        
                        <div class="pnb-field-row">
                            <label class="pnb-field-label">කාර්යාලයට ලගා වීම</label>
                            <div class="time-input-wrapper">
                                <input type="time" class="time-input default-time" data-field="officeArrivalMorning-v">
                            </div>
                            <div class="quick-buttons-row">
                                ${createQuickTimeButtons('officeArrivalMorning-v', ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'])}
                            </div>
                        </div>
                        
                        <div class="pnb-field-row">
                            <label class="pnb-field-label">යතුරුපැදියෙන් ගමන් කල දුර (km)</label>
                            <div class="pnb-input-wrapper">
                                <input type="number" step="0.1" min="0" class="distance-morning-v default-time">
                            </div>
                        </div>
                        
                        <div class="pnb-field-row">
                            <label class="pnb-field-label">පොදු ප්‍රවාහනයෙන් ගමන් කල දුර (km)</label>
                            <div class="pnb-input-wrapper">
                                <input type="number" step="0.1" min="0" class="public-transport-morning-v default-time">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Afternoon Section -->
                    <div class="pnb-period-section">
                        <div class="pnb-period-title">පස්වරුවේ දත්ත</div>
                        
                        <div class="pnb-field-row">
                            <label class="pnb-field-label">සේවා ස්ථානය</label>
                            <div class="pnb-input-wrapper">
                                <div id="service-location-afternoon-v-container"></div>
                            </div>
                        </div>
                        
                        <div class="pnb-field-row">
                            <label class="pnb-field-label">කාර්යාලයෙන් පිටත්වීම</label>
                            <div class="time-input-wrapper">
                                <input type="time" class="time-input default-time" data-field="officeDepartureAfternoon-v">
                            </div>
                            <div class="quick-buttons-row">
                                ${createQuickTimeButtons('officeDepartureAfternoon-v', ['12:30', '13:00', '13:30', '14:00', '14:30', '15:00'])}
                            </div>
                        </div>
                        
                        <div class="pnb-field-row">
                            <label class="pnb-field-label">ක්ෂේත්‍රයට ලගා වීම</label>
                            <div class="time-input-wrapper">
                                <input type="time" class="time-input default-time" data-field="fieldArrivalAfternoon-v">
                            </div>
                            <div class="quick-buttons-row">
                                ${createQuickTimeButtons('fieldArrivalAfternoon-v', ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30'])}
                            </div>
                        </div>
                        
                        <div class="pnb-field-row">
                            <label class="pnb-field-label">ක්ෂේත්‍රයෙන් පිටත්වීම</label>
                            <div class="time-input-wrapper">
                                <input type="time" class="time-input default-time" data-field="fieldDepartureAfternoon-v">
                            </div>
                            <div class="quick-buttons-row">
                                ${createQuickTimeButtons('fieldDepartureAfternoon-v', ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30'])}
                            </div>
                        </div>
                        
                        <div class="pnb-field-row">
                            <label class="pnb-field-label">කාර්යාලයට ලගා වීම</label>
                            <div class="time-input-wrapper">
                                <input type="time" class="time-input default-time" data-field="officeArrivalAfternoon-v">
                            </div>
                            <div class="quick-buttons-row">
                                ${createQuickTimeButtons('officeArrivalAfternoon-v', ['16:30', '17:00', '17:30', '18:00', '18:30', '19:00'])}
                            </div>
                        </div>
                        
                        <div class="pnb-field-row">
                            <label class="pnb-field-label">යතුරුපැදියෙන් ගමන් කල දුර (km)</label>
                            <div class="pnb-input-wrapper">
                                <input type="number" step="0.1" min="0" class="distance-afternoon-v default-time">
                            </div>
                        </div>
                        
                        <div class="pnb-field-row">
                            <label class="pnb-field-label">පොදු ප්‍රවාහනයෙන් ගමන් කල දුර (km)</label>
                            <div class="pnb-input-wrapper">
                                <input type="number" step="0.1" min="0" class="public-transport-afternoon-v default-time">
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Morning Tasks with NEW Simple Duty Dropdown -->
                <div class="pnb-task-section">
                    <label class="pnb-task-label">
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
                                   class="duty-count-input"
                                   disabled>

                            <button type="button" id="addMorningDuty" class="add-duty-btn" disabled>
                                එකතු කරන්න
                            </button>
                        </div>
                    </div>

                    <div id="morningChips" class="chips-container" style="margin-bottom:8px;"></div>
                    
                    <textarea id="morningTasks" rows="4" class="pnb-textarea"></textarea>
                </div>
                
                <!-- Afternoon Tasks with NEW Simple Duty Dropdown -->
                <div class="pnb-task-section">
                    <label class="pnb-task-label">
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
                                   class="duty-count-input"
                                   disabled>

                            <button type="button" id="addAfternoonDuty" class="add-duty-btn" disabled>
                                එකතු කරන්න
                            </button>
                        </div>
                    </div>

                    <div id="afternoonChips" class="chips-container" style="margin-bottom:8px;"></div>
                    
                    <textarea id="afternoonTasks" rows="4" class="pnb-textarea"></textarea>
                </div>
                
                <div class="pnb-button-container">
                    <button type="submit" id="pnbSubmitBtn" class="compact-btn pnb-save-btn">
                        <i class="fas fa-save" style="margin-right: 8px;"></i>Save Note
                    </button>
                    <button type="button" onclick="clearForm()" class="compact-btn pnb-clear-btn">
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

// Clear form function
window.clearForm = function() {
    // Clear table layout dropdown buttons
    document.querySelectorAll('.service-location-morning, .service-location-afternoon').forEach(btn => {
        if (btn.dataset) {
            btn.dataset.value = '';
            const textSpan = btn.querySelector('span:first-child');
            if (textSpan) textSpan.textContent = 'තෝරන්න';
            btn.style.backgroundColor = 'white';
            btn.style.borderColor = '#ccc';
        }
    });
    
    // Clear vertical layout dropdown buttons
    document.querySelectorAll('.service-location-morning-v, .service-location-afternoon-v').forEach(btn => {
        if (btn.dataset) {
            btn.dataset.value = '';
            const textSpan = btn.querySelector('span:first-child');
            if (textSpan) textSpan.textContent = 'තෝරන්න';
            btn.style.backgroundColor = 'white';
            btn.style.borderColor = '#ccc';
        }
    });
    
    // Clear time inputs
    document.querySelectorAll('.time-input').forEach(input => {
        input.value = '';
        input.classList.remove('saved-time');
        input.classList.add('default-time');
    });
    
    // Clear distance inputs
    document.querySelectorAll('.distance-morning, .distance-afternoon, .public-transport-morning, .public-transport-afternoon').forEach(input => {
        input.value = '';
        input.classList.remove('saved-time');
        input.classList.add('default-time');
    });
    
    // Clear vertical layout distance inputs
    document.querySelectorAll('.distance-morning-v, .distance-afternoon-v, .public-transport-morning-v, .public-transport-afternoon-v').forEach(input => {
        input.value = '';
        input.classList.remove('saved-time');
        input.classList.add('default-time');
    });
    
    // Clear textareas
    document.getElementById('morningTasks').value = '';
    document.getElementById('afternoonTasks').value = '';
    
    // Clear chips
    document.getElementById('morningChips').innerHTML = '';
    document.getElementById('afternoonChips').innerHTML = '';
    
    // Clear quick button active states
    document.querySelectorAll('.quick-time-btn').forEach(btn => btn.classList.remove('active'));
    
    // Reset submit button
    const submitBtn = document.getElementById('pnbSubmitBtn');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save" style="margin-right: 8px;"></i>Save Note';
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

    // NEW: Initialize service location dropdowns
    initializeServiceLocationDropdowns();

    // NEW: Initialize duty chips UI (renders chips and hooks add/remove)
    initializeDutyChipsUI();
    
    // NEW: Initialize layout toggle
    initializeLayoutToggle();
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

// Layout Toggle System
function initializeLayoutToggle() {
    const toggleCheckbox = document.getElementById('layoutToggle');
    const mainTable = document.getElementById('mainTable');
    const verticalLayout = document.getElementById('verticalLayout');
    
    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Mobile: Start with table layout (unchecked)
        mainTable.classList.remove('hidden');
        verticalLayout.classList.remove('active');
        toggleCheckbox.checked = false;
    } else {
        // Desktop: Always show table layout
        mainTable.classList.remove('hidden');
        verticalLayout.classList.remove('active');
    }
    
    // Toggle layout on checkbox change (mobile only)
    toggleCheckbox.addEventListener('change', function() {
        if (this.checked) {
            // Show vertical layout
            mainTable.classList.add('hidden');
            verticalLayout.classList.add('active');
            syncDataFromTableToVertical();
        } else {
            // Show table layout
            mainTable.classList.remove('hidden');
            verticalLayout.classList.remove('active');
            syncDataFromVerticalToTable();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const nowMobile = window.innerWidth <= 768;
        if (!nowMobile) {
            // Switch to desktop mode - always table
            mainTable.classList.remove('hidden');
            verticalLayout.classList.remove('active');
        }
    });
}

// Sync data from table layout to vertical layout
function syncDataFromTableToVertical() {
    // Morning data
    syncDropdownValue('.service-location-morning', '.service-location-morning-v');
    syncFieldValue('[data-field="officeDepartureMorning"]', '[data-field="officeDepartureMorning-v"]');
    syncFieldValue('[data-field="fieldArrivalMorning"]', '[data-field="fieldArrivalMorning-v"]');
    syncFieldValue('[data-field="fieldDepartureMorning"]', '[data-field="fieldDepartureMorning-v"]');
    syncFieldValue('[data-field="officeArrivalMorning"]', '[data-field="officeArrivalMorning-v"]');
    syncFieldValue('.distance-morning', '.distance-morning-v');
    syncFieldValue('.public-transport-morning', '.public-transport-morning-v');
    
    // Afternoon data
    syncDropdownValue('.service-location-afternoon', '.service-location-afternoon-v');
    syncFieldValue('[data-field="officeDepartureAfternoon"]', '[data-field="officeDepartureAfternoon-v"]');
    syncFieldValue('[data-field="fieldArrivalAfternoon"]', '[data-field="fieldArrivalAfternoon-v"]');
    syncFieldValue('[data-field="fieldDepartureAfternoon"]', '[data-field="fieldDepartureAfternoon-v"]');
    syncFieldValue('[data-field="officeArrivalAfternoon"]', '[data-field="officeArrivalAfternoon-v"]');
    syncFieldValue('.distance-afternoon', '.distance-afternoon-v');
    syncFieldValue('.public-transport-afternoon', '.public-transport-afternoon-v');
}

// Sync data from vertical layout to table layout
function syncDataFromVerticalToTable() {
    // Morning data
    syncDropdownValue('.service-location-morning-v', '.service-location-morning');
    syncFieldValue('[data-field="officeDepartureMorning-v"]', '[data-field="officeDepartureMorning"]');
    syncFieldValue('[data-field="fieldArrivalMorning-v"]', '[data-field="fieldArrivalMorning"]');
    syncFieldValue('[data-field="fieldDepartureMorning-v"]', '[data-field="fieldDepartureMorning"]');
    syncFieldValue('[data-field="officeArrivalMorning-v"]', '[data-field="officeArrivalMorning"]');
    syncFieldValue('.distance-morning-v', '.distance-morning');
    syncFieldValue('.public-transport-morning-v', '.public-transport-morning');
    
    // Afternoon data
    syncDropdownValue('.service-location-afternoon-v', '.service-location-afternoon');
    syncFieldValue('[data-field="officeDepartureAfternoon-v"]', '[data-field="officeDepartureAfternoon"]');
    syncFieldValue('[data-field="fieldArrivalAfternoon-v"]', '[data-field="fieldArrivalAfternoon"]');
    syncFieldValue('[data-field="fieldDepartureAfternoon-v"]', '[data-field="fieldDepartureAfternoon"]');
    syncFieldValue('[data-field="officeArrivalAfternoon-v"]', '[data-field="officeArrivalAfternoon"]');
    syncFieldValue('.distance-afternoon-v', '.distance-afternoon');
    syncFieldValue('.public-transport-afternoon-v', '.public-transport-afternoon');
}

// Helper function to sync custom dropdown values (using dataset.value)
function syncDropdownValue(fromSelector, toSelector) {
    const fromBtn = document.querySelector(fromSelector);
    const toBtn = document.querySelector(toSelector);
    
    if (fromBtn && toBtn && fromBtn.dataset && toBtn.dataset) {
        const value = fromBtn.dataset.value || '';
        toBtn.dataset.value = value;
        
        // Update display text
        const fromText = fromBtn.querySelector('span:first-child');
        const toText = toBtn.querySelector('span:first-child');
        
        if (fromText && toText) {
            toText.textContent = fromText.textContent;
        }
        
        // Copy styling
        if (value) {
            toBtn.style.backgroundColor = 'rgb(104, 216, 216)';
            toBtn.style.borderColor = '#000000ff';
        } else {
            toBtn.style.backgroundColor = 'white';
            toBtn.style.borderColor = '#ccc';
        }
    }
}

// Helper function to sync field values
function syncFieldValue(fromSelector, toSelector) {
    const fromField = document.querySelector(fromSelector);
    const toField = document.querySelector(toSelector);
    
    if (fromField && toField) {
        toField.value = fromField.value;
        // Copy classes for styling (e.g., default-time, saved-time)
        if (fromField.classList.contains('saved-time')) {
            toField.classList.remove('default-time');
            toField.classList.add('saved-time');
        } else if (fromField.classList.contains('default-time')) {
            toField.classList.remove('saved-time');
            toField.classList.add('default-time');
        }
    }
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

        // Service Location - Update dropdown buttons
        const morningBtn = document.querySelector('.service-location-morning');
        const afternoonBtn = document.querySelector('.service-location-afternoon');
        
        if (morningBtn && existingNote.serviceLocation?.morning) {
            morningBtn.dataset.value = existingNote.serviceLocation.morning;
            const textSpan = morningBtn.querySelector('span:first-child');
            if (textSpan) textSpan.textContent = getPlaceNameById(existingNote.serviceLocation.morning);
            morningBtn.style.backgroundColor = 'rgb(104, 216, 216)';
            morningBtn.style.borderColor = '#000000ff';
        }
        
        if (afternoonBtn && existingNote.serviceLocation?.afternoon) {
            afternoonBtn.dataset.value = existingNote.serviceLocation.afternoon;
            const textSpan = afternoonBtn.querySelector('span:first-child');
            if (textSpan) textSpan.textContent = getPlaceNameById(existingNote.serviceLocation.afternoon);
            afternoonBtn.style.backgroundColor = 'rgb(104, 216, 216)';
            afternoonBtn.style.borderColor = '#000000ff';
        }

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
        
        // Sync to vertical layout if it's active
        const verticalLayout = document.getElementById('verticalLayout');
        if (verticalLayout && verticalLayout.classList.contains('active')) {
            syncDataFromTableToVertical();
        }

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

// PHI Key Map Helper Functions
const PLACES_KEY = "phi_places_tree_final";

function loadKeyPlaces() {
    try {
        const data = localStorage.getItem(PLACES_KEY);
        if (!data) return [];
        return JSON.parse(data);
    } catch (err) {
        console.error("Error loading places:", err);
        return [];
    }
}

function getPlaceNameById(id) {
    const places = loadKeyPlaces();
    if (!id) return '';
    
    // Handle sub-item format "mainId:subName"
    if (id.includes(':')) {
        const [mainId, subName] = id.split(':');
        return subName;
    }
    
    // Find main item
    const place = places.find(p => p.id === id);
    return place ? place.main : '';
}

// Custom Dropdown Builder for PHI Places
function buildPlaceDropdown(className, preservedValue = '') {
    const places = loadKeyPlaces();
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;width:100%;';
    
    // Create button
    const btnId = `btn-${className}-${Date.now()}`;
    const menuId = `menu-${className}-${Date.now()}`;
    
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = btnId;
    btn.className = `ms-dropdown-trigger ${className}`;
    btn.dataset.value = preservedValue || '';
    btn.style.cssText = `width:100%;padding:4px;border:1px solid #ccc;border-radius:4px;
        background:white;cursor:pointer;min-height:24px;font-size:11px;text-align:left;
        user-select:none;display:flex;align-items:center;justify-content:space-between;
        font-family: 'Noto Sans Sinhala', 'Noto Sans', Arial, sans-serif;`;
    
    if (preservedValue) {
        btn.style.backgroundColor = 'rgb(104, 216, 216)';
        btn.style.borderColor = '#000000ff';
    }
    
    const textSpan = document.createElement('span');
    textSpan.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    textSpan.textContent = preservedValue ? getPlaceNameById(preservedValue) : 'තෝරන්න';
    
    const arrow = document.createElement('span');
    arrow.style.cssText = 'margin-left:4px;color:#666;font-size:10px;transition:transform 0.2s;';
    arrow.textContent = '▼';
    
    btn.appendChild(textSpan);
    btn.appendChild(arrow);
    
    // Create dropdown menu
    const menu = document.createElement('div');
    menu.id = menuId;
    menu.className = 'ms-dropdown-menu';
    menu.dataset.triggerId = btnId;
    menu.style.cssText = `position:absolute;bottom:100%;left:0;width:100%;background:#eef6fc;
        border:1px solid #d0d6db;border-radius:4px;box-shadow:0 4px 8px rgba(0,0,0,0.15);
        max-height:300px;overflow-y:auto;z-index:9999;display:none;margin-bottom:2px;
        font-family: 'Noto Sans Sinhala', 'Noto Sans', Arial, sans-serif;font-size:12px;`;
    
    // Populate dropdown items
    places.forEach(item => {
        const mainText = item.main || item.id;
        const hasSub = item.sub && Array.isArray(item.sub) && item.sub.length > 0;
        
        const mainDiv = document.createElement('div');
        mainDiv.className = 'dropdown-main-item';
        mainDiv.style.cssText = `padding:10px 12px;cursor:pointer;border-bottom:1px solid #e0e0e0;
            font-weight:600;color:#004085;display:flex;justify-content:space-between;align-items:center;
            transition:all 0.2s;background:#ffffff;`;
        
        const mainTextSpan = document.createElement('span');
        mainTextSpan.textContent = mainText;
        mainDiv.appendChild(mainTextSpan);
        
        if (hasSub) {
            const expandIcon = document.createElement('span');
            expandIcon.className = 'expand-icon';
            expandIcon.style.cssText = 'color:#353635;font-size:10px;transition:transform 0.2s;';
            expandIcon.textContent = '▶';
            mainDiv.appendChild(expandIcon);
            
            // Create sub-items container
            const subContainer = document.createElement('div');
            subContainer.className = 'sub-items-container';
            subContainer.style.cssText = 'display:none;background:#353635;border-left:4px solid #004085;';
            
            item.sub.forEach(subItem => {
                const subName = typeof subItem === 'object' ? subItem.name : subItem;
                const subCode = typeof subItem === 'object' ? subItem.code : '';
                const subText = subCode ? `${subName} (${subCode})` : subName;
                const subValue = `${item.id}:${subName}`;
                
                const subDiv = document.createElement('div');
                subDiv.className = 'dropdown-sub-item';
                subDiv.style.cssText = `padding:8px 10px 8px 25px;cursor:pointer;border-bottom:1px solid #a9c5d8;
                    transition:background 0.2s;color:#ffffff;font-weight:normal;`;
                subDiv.textContent = subText;
                
                subDiv.addEventListener('mouseenter', () => subDiv.style.background = '#2d3ed6');
                subDiv.addEventListener('mouseleave', () => subDiv.style.background = 'transparent');
                subDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    btn.dataset.value = subValue;
                    textSpan.textContent = subName;
                    menu.style.display = 'none';
                    arrow.style.transform = 'rotate(0deg)';
                    
                    btn.style.backgroundColor = 'rgb(104, 216, 216)';
                    btn.style.borderColor = '#000000ff';
                    
                    if (menu.parentElement === document.body) {
                        wrapper.appendChild(menu);
                    }
                    
                    const event = new Event('change', { bubbles: true });
                    btn.dispatchEvent(event);
                });
                
                subContainer.appendChild(subDiv);
            });
            
            // Main item click handler (toggle sub-items)
            mainDiv.addEventListener('mouseenter', () => mainDiv.style.background = '#cce5ff');
            mainDiv.addEventListener('mouseleave', () => mainDiv.style.background = '#ffffff');
            mainDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                const isExpanded = subContainer.style.display === 'block';
                
                // Collapse all other sub-containers
                menu.querySelectorAll('.sub-items-container').forEach(container => {
                    container.style.display = 'none';
                    const prev = container.previousElementSibling;
                    if (prev) {
                        const icon = prev.querySelector('.expand-icon');
                        if (icon) icon.style.transform = 'rotate(0deg)';
                    }
                });
                
                if (!isExpanded) {
                    subContainer.style.display = 'block';
                    expandIcon.style.transform = 'rotate(90deg)';
                    mainDiv.style.background = '#00c3ff';
                } else {
                    subContainer.style.display = 'none';
                    expandIcon.style.transform = 'rotate(0deg)';
                    mainDiv.style.background = '#00c3ff';
                }
            });
            
            menu.appendChild(mainDiv);
            menu.appendChild(subContainer);
        } else {
            // No sub items
            mainDiv.addEventListener('mouseenter', () => mainDiv.style.background = '#cce5ff');
            mainDiv.addEventListener('mouseleave', () => mainDiv.style.background = '#ffffff');
            mainDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                btn.dataset.value = item.id;
                textSpan.textContent = mainText;
                menu.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
                
                btn.style.backgroundColor = 'rgb(104, 216, 216)';
                btn.style.borderColor = '#000000ff';
                
                if (menu.parentElement === document.body) {
                    wrapper.appendChild(menu);
                }
                
                const event = new Event('change', { bubbles: true });
                btn.dispatchEvent(event);
            });
            menu.appendChild(mainDiv);
        }
    });
    
    // Position menu function
    const positionMenu = () => {
        if (menu.style.display !== 'block') return;
        
        const rect = btn.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Mobile layout - centered modal
        const isMobile = viewportWidth <= 768;
        
        if (isMobile) {
            menu.style.position = 'fixed';
            menu.style.width = '90%';
            menu.style.left = '50%';
            menu.style.top = '50%';
            menu.style.transform = 'translate(-50%, -50%)';
            menu.style.maxHeight = '60vh';
            menu.style.overflowY = 'auto';
            menu.style.zIndex = '10000';
            menu.style.margin = '0';
            menu.style.bottom = 'auto';
            menu.style.boxShadow = '0 0 0 1000px rgba(0,0,0,0.5)';
            return;
        }
        
        // Desktop positioning
        menu.style.transform = 'none';
        menu.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
        
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const minSpaceNeeded = 250;
        const maxMenuHeight = 300;
        
        menu.style.position = 'fixed';
        menu.style.width = Math.max(rect.width, 220) + 'px';
        menu.style.maxHeight = maxMenuHeight + 'px';
        menu.style.overflowY = 'auto';
        menu.style.left = rect.left + 'px';
        menu.style.zIndex = '10000';
        menu.style.margin = '0';
        
        const openUpward = spaceAbove > spaceBelow || spaceBelow < minSpaceNeeded;
        
        if (openUpward) {
            menu.style.bottom = (viewportHeight - rect.top + 2) + 'px';
            menu.style.top = 'auto';
            menu.style.maxHeight = Math.min(maxMenuHeight, spaceAbove) + 'px';
        } else {
            menu.style.top = (rect.bottom + 2) + 'px';
            menu.style.bottom = 'auto';
            menu.style.maxHeight = Math.min(maxMenuHeight, spaceBelow) + 'px';
        }
        
        // Adjust if goes offscreen horizontally
        setTimeout(() => {
            const menuRect = menu.getBoundingClientRect();
            if (menuRect.right > viewportWidth) {
                menu.style.left = Math.max(5, viewportWidth - menuRect.width - 5) + 'px';
            }
            if (menuRect.left < 0) {
                menu.style.left = '5px';
                menu.style.width = (viewportWidth - 10) + 'px';
            }
        }, 0);
    };
    
    // Scroll handler to reposition
    const scrollHandler = () => {
        if (menu.style.display === 'block') {
            positionMenu();
        }
    };
    
    // Button click handler
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.style.display === 'block';
        
        // Close all other dropdowns
        document.querySelectorAll('.ms-dropdown-menu').forEach(m => {
            if (m !== menu) {
                m.style.display = 'none';
                const triggerId = m.dataset.triggerId;
                if (triggerId) {
                    const trigger = document.getElementById(triggerId);
                    if (trigger) {
                        const arr = trigger.querySelector('span:last-child');
                        if (arr) arr.style.transform = 'rotate(0deg)';
                    }
                }
                // Return menu to wrapper
                const menuWrapper = m.parentElement;
                if (menuWrapper && m.parentElement === document.body) {
                    const triggerId = m.dataset.triggerId;
                    if (triggerId) {
                        const trigger = document.getElementById(triggerId);
                        if (trigger && trigger.parentElement) {
                            trigger.parentElement.appendChild(m);
                        }
                    }
                }
            }
        });
        
        if (!isOpen) {
            // Move to body to avoid overflow clipping
            document.body.appendChild(menu);
            menu.style.display = 'block';
            arrow.style.transform = 'rotate(180deg)';
            
            // Green background when open
            btn.style.backgroundColor = '#90ee90';
            btn.style.borderColor = '#006400';
            
            // Force reflow
            menu.offsetHeight;
            
            positionMenu();
            
            // Add scroll/resize listeners
            window.addEventListener('scroll', scrollHandler, true);
            window.addEventListener('resize', scrollHandler);
        } else {
            menu.style.display = 'none';
            arrow.style.transform = 'rotate(0deg)';
            
            // Restore button color
            if (btn.dataset.value) {
                btn.style.backgroundColor = 'rgb(104, 216, 216)';
                btn.style.borderColor = '#000000ff';
            } else {
                btn.style.backgroundColor = 'white';
                btn.style.borderColor = '#ccc';
            }
            
            // Return to wrapper
            if (menu.parentElement === document.body) {
                wrapper.appendChild(menu);
            }
            
            // Remove listeners
            window.removeEventListener('scroll', scrollHandler, true);
            window.removeEventListener('resize', scrollHandler);
        }
    });
    
    // Close on outside click
    const outsideClickHandler = (e) => {
        if (!wrapper.contains(e.target) && !menu.contains(e.target) && menu.parentElement === document.body) {
            menu.style.display = 'none';
            arrow.style.transform = 'rotate(0deg)';
            
            // Restore button color
            if (btn.dataset.value) {
                btn.style.backgroundColor = 'rgb(104, 216, 216)';
                btn.style.borderColor = '#000000ff';
            } else {
                btn.style.backgroundColor = 'white';
                btn.style.borderColor = '#ccc';
            }
            
            if (menu.parentElement === document.body) {
                wrapper.appendChild(menu);
            }
            
            window.removeEventListener('scroll', scrollHandler, true);
            window.removeEventListener('resize', scrollHandler);
        }
    };
    
    document.addEventListener('click', outsideClickHandler);
    
    wrapper.appendChild(btn);
    wrapper.appendChild(menu);
    
    return wrapper;
}

// Initialize service location dropdowns
function initializeServiceLocationDropdowns() {
    // Create and insert dropdowns for table layout
    const morningContainer = document.getElementById('service-location-morning-container');
    const afternoonContainer = document.getElementById('service-location-afternoon-container');
    
    if (morningContainer) {
        const morningDropdown = buildPlaceDropdown('service-location-morning');
        morningContainer.appendChild(morningDropdown);
    }
    
    if (afternoonContainer) {
        const afternoonDropdown = buildPlaceDropdown('service-location-afternoon');
        afternoonContainer.appendChild(afternoonDropdown);
    }
    
    // Create and insert dropdowns for vertical layout
    const morningVContainer = document.getElementById('service-location-morning-v-container');
    const afternoonVContainer = document.getElementById('service-location-afternoon-v-container');
    
    if (morningVContainer) {
        const morningVDropdown = buildPlaceDropdown('service-location-morning-v');
        morningVContainer.appendChild(morningVDropdown);
    }
    
    if (afternoonVContainer) {
        const afternoonVDropdown = buildPlaceDropdown('service-location-afternoon-v');
        afternoonVContainer.appendChild(afternoonVDropdown);
    }
}

// Save pocket note entry (reads form, saves to localStorage)
function savePocketNoteEntry() {
    const date = document.getElementById('pnbDate').value;
    
    // Check which layout is active and sync before saving
    const verticalLayout = document.getElementById('verticalLayout');
    if (verticalLayout.classList.contains('active')) {
        syncDataFromVerticalToTable();
    }

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
            morning: document.querySelector('.service-location-morning')?.dataset?.value || '',
            afternoon: document.querySelector('.service-location-afternoon')?.dataset?.value || ''
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
