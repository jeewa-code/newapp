/**
 * BMI App Module - Dual Layout Version
 * Calculates Body Mass Index and Growth Status (Height/BMI) for Sri Lankan School Children (WHO 2007 Standards)
 * Includes Chart.js visualization with comprehensive Z-score lines (-3SD to +3SD).
 * Features: Layout switcher, mobile-optimized UI with sliders and pickers
 */

(function () {
    "use strict";

    // Current layout state (1 = classic, 2 = mobile-optimized)
    let currentLayout = 2; // Default to Mobile Layout

    // WHO 2007 Growth Reference Data (5-19 Years) - Expanded Z-scores
    // Format: Age: [SD-3, SD-2, SD-1, SD0(Median), SD+1, SD+2, SD+3]
    const growthDataBMI = {
        boys: {
            5: [12.1, 13.0, 14.1, 15.3, 16.6, 18.3, 20.2],
            6: [12.1, 13.0, 14.1, 15.4, 16.8, 18.8, 20.9],
            7: [12.2, 13.1, 14.3, 15.6, 17.0, 19.2, 21.6],
            8: [12.3, 13.3, 14.5, 15.9, 17.4, 20.0, 22.6],
            9: [12.4, 13.5, 14.8, 16.2, 17.9, 21.0, 23.9],
            10: [12.6, 13.7, 15.1, 16.6, 18.5, 22.2, 25.4],
            11: [12.9, 14.1, 15.5, 17.2, 19.2, 23.2, 26.9],
            12: [13.2, 14.5, 16.0, 17.8, 19.9, 24.2, 28.5],
            13: [13.6, 14.9, 16.5, 18.5, 20.8, 25.2, 29.9],
            14: [14.0, 15.4, 17.2, 19.2, 21.8, 26.5, 31.4],
            15: [14.5, 15.9, 17.8, 19.9, 22.7, 27.7, 32.8],
            16: [14.9, 16.5, 18.4, 20.7, 23.5, 28.5, 33.9],
            17: [15.3, 16.9, 18.9, 21.3, 24.3, 29.3, 34.8],
            18: [15.6, 17.3, 19.4, 21.9, 24.9, 30.0, 35.6],
            19: [15.8, 17.6, 19.8, 22.4, 25.4, 30.7, 36.3]
        },
        girls: {
            5: [11.8, 12.7, 13.8, 15.2, 16.8, 18.9, 21.3],
            6: [11.9, 12.7, 13.9, 15.3, 17.0, 19.2, 21.8],
            7: [11.9, 12.7, 14.0, 15.5, 17.3, 19.8, 22.5],
            8: [12.0, 12.9, 14.2, 15.8, 17.7, 20.6, 23.6],
            9: [12.2, 13.1, 14.5, 16.3, 18.3, 21.5, 24.9],
            10: [12.4, 13.5, 14.9, 16.8, 19.0, 22.6, 26.4],
            11: [12.8, 13.9, 15.5, 17.5, 19.9, 23.7, 27.9],
            12: [13.2, 14.4, 16.1, 18.2, 20.8, 25.0, 29.6],
            13: [13.7, 14.9, 16.7, 19.0, 21.8, 26.2, 31.0],
            14: [14.1, 15.4, 17.4, 19.8, 22.7, 27.3, 32.2],
            15: [14.5, 15.9, 18.0, 20.5, 23.5, 28.2, 33.1],
            16: [14.8, 16.2, 18.4, 21.0, 24.1, 28.9, 33.8],
            17: [14.9, 16.4, 18.6, 21.3, 24.5, 29.3, 34.3],
            18: [15.0, 16.4, 18.8, 21.6, 24.8, 29.6, 34.7],
            19: [15.0, 16.5, 18.9, 21.7, 25.0, 29.7, 34.8]
        }
    };

    // Height Data Format: Age: [SD-3, SD-2, SD-1, SD0, SD+1, SD+2, SD+3]
    const growthDataHeight = {
        boys: {
            5: [96.3, 101.2, 105.8, 110.3, 114.9, 119.5, 124.2],
            6: [100.9, 106.1, 111.0, 116.0, 120.9, 125.7, 130.6],
            7: [105.7, 111.2, 116.5, 121.7, 127.0, 132.3, 137.6],
            8: [110.1, 116.0, 121.7, 127.3, 133.0, 138.8, 144.6],
            9: [114.3, 120.5, 126.5, 132.6, 138.8, 145.1, 151.4],
            10: [118.0, 124.6, 131.2, 137.8, 144.6, 151.3, 158.1],
            11: [122.1, 129.1, 136.1, 143.1, 150.2, 157.4, 164.6],
            12: [127.0, 134.1, 141.6, 149.1, 156.4, 164.4, 172.0],
            13: [133.2, 140.7, 148.4, 156.0, 163.6, 171.3, 179.0],
            14: [141.5, 149.7, 157.1, 163.8, 170.8, 177.9, 185.0],
            15: [147.8, 156.5, 164.1, 170.1, 176.4, 182.9, 189.5],
            16: [151.9, 160.9, 168.1, 173.4, 179.0, 184.9, 191.0],
            17: [154.5, 163.6, 170.4, 175.2, 180.3, 185.8, 191.6],
            18: [155.9, 165.2, 171.4, 175.9, 180.8, 186.2, 191.9],
            19: [156.9, 166.2, 172.1, 176.3, 181.0, 186.3, 192.0]
        },
        girls: {
            5: [96.1, 100.7, 105.0, 109.4, 113.8, 118.2, 122.5],
            6: [100.6, 105.5, 110.3, 115.1, 119.9, 124.7, 129.4],
            7: [105.6, 110.9, 115.8, 120.8, 125.8, 130.8, 135.8],
            8: [110.8, 116.5, 121.6, 126.6, 131.7, 136.9, 142.2],
            9: [116.1, 122.0, 127.2, 132.5, 137.9, 143.4, 149.0],
            10: [121.7, 127.9, 133.3, 138.6, 144.1, 149.8, 155.6],
            11: [127.9, 134.5, 139.7, 145.0, 150.3, 155.9, 161.7],
            12: [134.0, 141.0, 146.1, 151.2, 156.3, 161.7, 167.3],
            13: [138.9, 146.0, 151.2, 156.4, 161.4, 166.7, 172.3],
            14: [142.2, 149.3, 154.5, 159.8, 164.8, 170.1, 175.6],
            15: [144.1, 151.2, 156.4, 161.7, 166.8, 172.1, 177.7],
            16: [145.1, 152.2, 157.4, 162.5, 167.5, 172.8, 178.4],
            17: [145.4, 152.7, 158.0, 162.9, 167.9, 173.2, 178.9],
            18: [145.8, 153.1, 158.4, 163.1, 168.1, 173.4, 179.3], // Interpolated
            19: [145.9, 153.2, 158.5, 163.2, 168.2, 173.5, 179.5]
        }
    };

    let bmiChartInstance = null;
    let heightChartInstance = null;

    window.bmiApp = {
        render: function (containerId) {
            const container = document.getElementById(containerId);
            if (!container) return;

            // Generate options
            let gradeOptions = '<option value="" disabled selected>තෝරන්න </option>';
            for (let i = 1; i <= 13; i++) {
                gradeOptions += `<option value="${i}">Grade ${i}</option>`;
            }

            // Injected Styles for Dual Layout Support
            const styles = `
              <style>
                .bmi-container {
                   max-width: 900px;
                   margin: 20px auto;
                   padding: 25px;
                   border-radius: 12px;
                }
                
                /* Header Row */
                .header-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    padding-right: 10px; /* Space for button */
                }
                
                /* Layout Switcher */
                .layout-switcher {
                    background: #e91e63; /* Red color */
                    border: none;
                    border-radius: 20px;
                    padding: 6px 12px;
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(233, 30, 99, 0.4);
                    display: none; /* Mobile only */
                    white-space: nowrap;
                    transition: all 0.3s;
                }
                .layout-switcher:hover {
                    background: #d81b60;
                    transform: translateY(-1px);
                }
                
                /* Hide layout 2 by default */
                .layout-2 {
                    display: none;
                }
                
                /* Top row with gender and grade */
                .top-controls-row {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 8px;
                    margin-bottom: 20px;
                    align-items: center;
                }
                
                /* Compact gender buttons (Maximum small) */
                .gender-button-group {
                    display: flex;
                    gap: 6px;
                }
                .gender-btn {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.3);
                    border-radius: 8px;
                    padding: 4px 8px; /* Reduced padding */
                    cursor: pointer;
                    transition: all 0.3s;
                    text-align: center;
                    color: rgba(255,255,255,0.6);
                    min-width: 45px; /* Reduced width */
                    height: 40px; /* Fixed small height */
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .gender-btn.active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-color: #667eea;
                    color: white;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
                }
                .gender-btn .icon {
                    font-size: 14px; /* Reduced icon */
                    line-height: 1;
                    margin-bottom: 2px;
                }
                .gender-btn .label {
                    font-size: 8px; /* Reduced text */
                    font-weight: 600;
                    text-transform: uppercase;
                }
                
                /* Grade Selector Button */
                .grade-selector-btn {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.3);
                    border-radius: 8px;
                    padding: 0 12px; /* Zero vertical padding, use flex align */
                    cursor: pointer;
                    transition: all 0.3s;
                    color: rgba(255,255,255,0.8);
                    font-size: 14px; /* Readable text */
                    text-align: left;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    height: 40px; /* Match gender btn height */
                    box-sizing: border-box;
                }
                .grade-selector-btn:hover {
                    background: rgba(255,255,255,0.15);
                }
                .grade-selector-btn.selected {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-color: #667eea;
                    color: white;
                }
                
                /* Grade Popup (Popover) */
                .grade-popup {
                    position: absolute;
                    /* Top/Left calculated via JS */
                    z-index: 9999;
                    display: none;
                    width: 300px; /* Fixed width */
                    max-width: 95vw;
                }
                .grade-popup.active {
                    display: block;
                    animation: fadeIn 0.2s ease-out;
                }
                .grade-popup-content {
                    background: #1e2124; /* Dark bg like date picker */
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px;
                    padding: 15px;
                    width: 100%;
                    box-shadow: 0 15px 50px rgba(0,0,0,0.9);
                    box-sizing: border-box;
                }
                .grade-popup-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .grade-popup-title {
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                }
                .grade-popup-close {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .grade-popup-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }
                .grade-popup-item {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 8px;
                    padding: 12px 8px;
                    text-align: center;
                    color: rgba(255,255,255,0.7);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 14px;
                    font-weight: 600;
                }
                .grade-popup-item:hover {
                    background: rgba(255,255,255,0.2);
                }
                .grade-popup-item.active {
                    background: #e91e63;
                    border-color: #e91e63;
                    color: white;
                    box-shadow: 0 2px 8px rgba(233, 30, 99, 0.4);
                }
                
                /* Ruler Picker Styles */
                .ruler-picker-box {
                    background: #1e2124; /* Dark card background */
                    border-radius: 20px;
                    padding: 15px;
                    margin-bottom: 20px;
                    color: white;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    position: relative;
                    overflow: hidden;
                }
                
                .ruler-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                }
                
                .ruler-icon-box {
                    width: 40px;
                    height: 40px;
                    background: #2c2f33;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 12px;
                    font-size: 20px;
                    color: #99aab5;
                }
                
                .ruler-title {
                    font-size: 14px;
                    color: #99aab5;
                    font-weight: 500;
                }
                .ruler-title span {
                    font-size: 12px;
                    opacity: 0.7;
                }
                
                .ruler-value-display {
                    position: absolute;
                    top: 15px;
                    right: 20px;
                    font-size: 18px;
                    font-weight: bold;
                    color: #7289da;
                }

                /* Ruler Scroll Container */
                .ruler-scroll-container {
                    width: 100%;
                    overflow-x: auto;
                    overflow-y: hidden;
                    white-space: nowrap;
                    -webkit-overflow-scrolling: touch;
                    position: relative;
                    height: 80px;
                    display: flex; /* Flex layout for spacers */
                    align-items: flex-end; /* Align bottom */
                    /* Hide scrollbar */
                    scrollbar-width: none; 
                    -ms-overflow-style: none;
                    cursor: grab;
                }
                .ruler-scroll-container::-webkit-scrollbar { 
                    display: none; 
                }
                .ruler-scroll-container:active {
                    cursor: grabbing;
                }

                /* Spacers to center the content */
                .ruler-spacer {
                    flex: 0 0 50%; /* Take up 50% of container width each */
                    width: 50%;
                    pointer-events: none;
                }

                /* The track that holds the ticks */
                .ruler-track {
                    position: relative;
                    height: 100%;
                    flex-shrink: 0; /* Do not shrink */
                    pointer-events: none;
                    /* No padding/margin on track itself, purely sizing */
                }

                /* Ticks */
                .ruler-tick {
                    position: absolute;
                    bottom: 30px;
                    width: 2px;
                    background: #565a5f;
                    /* transform: translateX(-50%); Removed to precise alignment */
                }
                .ruler-tick.major {
                    height: 25px;
                    background: #99aab5;
                    width: 2px;
                }
                .ruler-tick.minor {
                    height: 12px;
                    width: 1px;
                }
                
                /* Numbers */
                .ruler-number {
                    position: absolute;
                    bottom: 5px;
                    transform: translateX(-50%);
                    font-size: 12px;
                    color: #99aab5;
                    font-weight: 500;
                    width: 40px; /* Width for centering text */
                    text-align: center;
                }
                .ruler-number.highlight {
                    color: #7289da;
                    font-weight: bold;
                    font-size: 14px;
                }

                /* Center Pointer */
                .ruler-pointer {
                    position: absolute;
                    left: 50%;
                    bottom: 55px;
                    transform: translateX(-50%);
                    width: 0; 
                    height: 0; 
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-top: 10px solid #58d3f7;
                    z-index: 10;
                    pointer-events: none;
                }
                
                /* Fade overlay for edges */
                .ruler-fade-left, .ruler-fade-right {
                    position: absolute;
                    top: 55px; /* Match scroll container top */
                    bottom: 15px;
                    width: 40px;
                    pointer-events: none;
                    z-index: 5;
                }
                .ruler-fade-left {
                    left: 0;
                    background: linear-gradient(to right, #1e2124, transparent);
                }
                .ruler-fade-right {
                    right: 0;
                    background: linear-gradient(to left, #1e2124, transparent);
                }
                
                /* Picker Styles - Now only for Age */
                .picker-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-bottom: 15px;
                }
                .picker-box {
                    background: rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 15px;
                    text-align: center;
                }
                .picker-label {
                    color: rgba(255,255,255,0.7);
                    font-size: 11px;
                    text-transform: uppercase;
                    margin-bottom: 10px;
                }
                .picker-value {
                    font-size: 36px;
                    font-weight: 700;
                    color: white;
                    margin: 10px 0;
                }
                .picker-controls {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    margin-top: 10px;
                }
                .picker-btn {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.15);
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .picker-btn:active {
                    background: rgba(255,255,255,0.3);
                    transform: scale(0.95);
                }
                
                /* Date Picker Custom Style */
                .date-picker-box {
                    background: rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 15px;
                }
                .date-picker-label {
                    color: rgba(255,255,255,0.7);
                    font-size: 11px;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }
                .date-display {
                    font-size: 20px;
                    font-weight: 600;
                    color: white;
                    text-align: center;
                    padding: 12px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 8px;
                    cursor: pointer;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                
                /* Grade Picker */
                .grade-picker {
                    background: rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 15px;
                    margin-bottom: 15px;
                }
                .grade-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    margin-top: 10px;
                }
                .grade-item {
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 8px;
                    padding: 12px 8px;
                    text-align: center;
                    color: rgba(255,255,255,0.7);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 14px;
                    font-weight: 600;
                }
                .grade-item.active {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-color: #667eea;
                    color: white;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
                }
                
                .bmi-grid-container {
                  display: grid;
                  grid-template-columns: 1fr;
                  gap: 10px;
                  margin-bottom: 20px;
                }
                .bmi-charts-container {
                   display: grid;
                   grid-template-columns: 1fr; 
                   gap: 15px;
                }
                .bmi-gender-group {
                    display: flex;
                    gap: 15px;
                }
                .bmi-chart-card {
                   background: white; 
                   padding: 10px; 
                   border-radius: 8px; 
                   box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .bmi-chart-wrapper {
                   position: relative;
                   height: 500px;
                   width: 100%;
                }
                
                /* Date Picker Button Card */
                .date-btn-card {
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 12px;
                    padding: 12px 16px;
                    margin-bottom: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    height: 48px; /* Fixed height for consistency */
                    box-sizing: border-box;
                }
                .date-btn-card:active {
                    transform: scale(0.98);
                    background: rgba(255,255,255,0.12);
                }
                .date-btn-left {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .date-btn-label {
                    color: rgba(255,255,255,0.6);
                    font-size: 9px;
                    text-transform: uppercase;
                    font-weight: 600;
                    margin-bottom: 2px;
                }
                .date-btn-value {
                    color: #fff;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                .date-btn-icon {
                    color: rgba(255,255,255,0.4);
                    font-size: 14px;
                }

                /* Date Picker Modal (iOS Style) */
                /* Ensure container is relative for absolute positioning */
                .bmi-container {
                    position: relative !important;
                }

                /* Date Picker Popover (Relative to Button with Collision Logic) */
                .date-picker-modal {
                    position: absolute;
                    left: 0;
                    width: 96%; /* slightly less than full width of container */
                    max-width: 360px;
                    background: #1e2124;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px;
                    padding: 20px;
                    box-shadow: 0 15px 50px rgba(0,0,0,0.9);
                    z-index: 9999;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s, transform 0.2s;
                    display: flex;
                    flex-direction: column;
                    /* Default transform origin logic handled via JS or generic */
                    transform-origin: top center;
                    transform: scale(0.95);
                }
                .date-picker-modal.active {
                    opacity: 1;
                    pointer-events: auto;
                    transform: scale(1);
                }

                .date-picker-header {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding-bottom: 10px;
                }
                .date-picker-title {
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                    flex: 1; /* Take up remaining space */
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin: 0 10px;
                }
                .date-picker-close {
                    background: none;
                    border: none;
                    color: #99aab5;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 5px 10px;
                    min-width: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                }
                .date-picker-done {
                    color: #58d3f7;
                    font-size: 15px;
                    font-weight: 600;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 5px 10px;
                    min-width: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                }
                
                /* Wheel Container */
                .date-wheels-container {
                    display: flex;
                    justify-content: center;
                    width: 100%;
                    height: 180px;
                    position: relative;
                    overflow: hidden;
                    background: #17191c;
                    border-radius: 12px;
                }
                
                /* Selection Highlight Overlay */
                .date-wheel-highlight {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 40px;
                    margin-top: -20px;
                    border-top: 1px solid #58d3f7;
                    border-bottom: 1px solid #58d3f7;
                    pointer-events: none;
                    background: rgba(88, 211, 247, 0.05);
                    z-index: 10;
                }
                
                .date-wheel {
                    flex: 1;
                    height: 100%;
                    overflow-y: auto;
                    scroll-snap-type: y mandatory;
                    text-align: center;
                    scrollbar-width: none; /* Hide scrollbar */
                    padding: 0;
                    position: relative;
                    z-index: 5;
                }
                .date-wheel::-webkit-scrollbar {
                    display: none;
                }
                
                .date-wheel-spacer {
                    height: 70px; /* (180 - 40) / 2 = 70 */
                }
                
                .date-wheel-item {
                    height: 40px;
                    line-height: 40px;
                    color: #72767d;
                    font-size: 16px;
                    scroll-snap-align: center;
                    transition: all 0.2s;
                    cursor: pointer;
                    font-weight: 500;
                }
                .date-wheel-item.active {
                    color: #fff;
                    font-size: 18px;
                    font-weight: bold;
                }

                /* --- Layout 2 Compact Styles --- */
                
                /* Date Buttons in one row */
                .date-buttons-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .date-buttons-row .date-btn-card {
                    margin-bottom: 0;
                    height: 50px; /* Standardize height */
                    padding: 8px 10px;
                }
                .date-buttons-row .date-btn-label {
                    font-size: 9px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                }
                .date-buttons-row .date-btn-value {
                    font-size: 13px;
                }

                /* Compact Ruler Overrides (~40% reduction) */
                .ruler-picker-box {
                    padding: 8px 12px !important;
                    margin-bottom: 10px !important;
                }
                .ruler-value-display {
                    font-size: 24px !important;
                    margin: 0 0 5px 0 !important;
                    font-weight: 700 !important;
                }
                .ruler-title {
                    font-size: 12px !important;
                }
                
                .ruler-scroll-container {
                    height: 50px !important; /* Reduced from 80px */
                }
                .ruler-track {
                     height: 100%;
                }
                
                .ruler-tick {
                    bottom: 18px !important;
                }
                .ruler-tick.major {
                    height: 18px !important;
                }
                .ruler-tick.minor {
                    height: 10px !important;
                    bottom: 18px !important; /* Align bottom */
                }
                
                .ruler-number {
                    font-size: 9px !important;
                    bottom: 4px !important;
                }
                
                .ruler-pointer {
                    bottom: 40px !important; /* Just above ticks */
                    border-top-width: 7px !important;
                    border-left-width: 6px !important;
                    border-right-width: 6px !important;
                }
                
                .ruler-fade-left, .ruler-fade-right {
                    top: 25px !important;
                    bottom: 5px !important;
                }
                
                .ruler-status-label {
                    display: block; /* Force new line */
                    width: fit-content;
                    font-size: 10px;
                    font-weight: 700;
                    margin-top: 4px; /* Space from title */
                    margin-left: 0;
                    text-transform: uppercase;
                    background: rgba(0,0,0,0.2);
                    padding: 2px 8px;
                    border-radius: 4px;
                    opacity: 0; /* Hidden initially, JS toggles style.display/opacity */
                }

                /* Show layout switcher on tablet and mobile */
                @media (max-width: 1024px) {
                    .layout-switcher {
                        display: block;
                    }
                }
                
                /* Tablet & Mobile */
                @media (max-width: 768px) {
                  .bmi-charts-container {
                    grid-template-columns: 1fr !important;
                  }
                  .bmi-container { 
                    margin: 10px; 
                    padding: 12px; 
                    position: relative;
                  }
                  .bmi-header {
                      font-size: 18px !important;
                      margin-bottom: 12px !important;
                  }
                  /* Try to keep 2 cols for some inputs on tablet/large mobile to save vertical space */
                  .bmi-input-row-mobile {
                      display: grid;
                      grid-template-columns: 1fr 1fr;
                      gap: 8px;
                  }
                  .bmi-chart-wrapper {
                      height: 350px !important; 
                  }
                }

                /* Small Mobile (Mobile First strict) */
                @media (max-width: 480px) {
                    .bmi-container {
                        margin: 4px !important; 
                        padding: 8px !important;
                    }
                    /* Compact inputs */
                    label {
                        font-size: 11px !important;
                        margin-bottom: 2px !important;
                    }
                    input, select {
                        padding: 6px !important;
                        font-size: 12px !important;
                        height: 32px; /* Force compact height */
                    }
                    .bmi-header {
                        font-size: 16px !important;
                        margin-bottom: 8px !important;
                        padding-bottom: 4px;
                        border-bottom: 1px solid rgba(255,255,255,0.1);
                    }
                    .bmi-gender-group {
                        gap: 5px;
                    }
                    .bmi-gender-group label {
                        padding: 0 8px !important;
                        font-size: 11px !important;
                        height: 32px;
                    }
                    /* Force 2 columns even on small screens for these inputs to save vertical scroll */
                    .bmi-compact-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 6px;
                    }
                    .bmi-grid-container {
                        gap: 6px !important;
                        margin-bottom: 10px !important;
                    }
                    
                    /* Result area compact */
                    #bmiResult {
                        margin-top: 15px !important; 
                        padding: 10px !important;
                    }
                    #bmiPreviewLink {
                        margin-bottom: 8px !important;
                    }
                    #bmiPreviewVal {
                        font-size: 28px !important;
                    }
                    
                    /* Layout 2 adjustments */
                    .gender-btn .icon {
                        font-size: 36px;
                    }
                    .slider-value {
                        font-size: 36px;
                    }
                    .picker-value {
                        font-size: 28px;
                    }
                }
                /* 320px Handling */
                /* 320px & 375px Handling */
                @media (max-width: 380px) {
                    input, select {
                        padding: 6px !important;
                        font-size: 13px !important;
                    }
                    .bmi-header {
                        font-size: 16px !important;
                    }
                    /* Ensure chart fits within container */
                    .bmi-chart-wrapper {
                        height: 250px !important;
                        width: 100% !important;
                        overflow: hidden;
                    }
                    .bmi-chart-card {
                        padding: 5px !important;
                        overflow: hidden;
                    }
                    .bmi-container {
                        padding: 5px !important;
                        margin: 2px !important;
                    }
                    .layout-switcher {
                        font-size: 10px;
                        padding: 4px 10px;
                    }
                }
              </style>
            `;

            container.innerHTML = `
        ${styles}
        <div class="glass bmi-container">
          <div class="header-row">
              <h2 class="bmi-header" style="color: #ffffff; text-align: center; margin: 0; font-size: 20px; font-weight: 600; flex-grow: 1;">
                <i class="fa-solid fa-child-reaching" style="margin-right:8px;"></i>පාසල් සෞඛ්‍ය BMI
              </h2>
              <button class="layout-switcher" id="layoutSwitcher">
                <i class="fa-solid fa-repeat"></i>
              </button>
          </div>
          
          <!-- LAYOUT 1: Classic Form -->
          <!-- LAYOUT 1: Classic Form -->
          <div class="layout-1" id="layout1" style="display: none;">
          <div class="bmi-grid-container">
             <!-- Row 1: Date & Gender -->
             <div class="bmi-compact-grid">
                 <div>
                   <label style="display: block; color: #ffffff; margin-bottom: 4px; font-weight: 500;">පෙර පරීක්ෂාව කල දිනය</label>
                   <input type="date" id="bmiExamDate" style="width: 100%; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.9);">
                 </div>
                 <div>
                    <label style="display: block; color: #ffffff; margin-bottom: 4px; font-weight: 500;">ස්ත්‍රී/පුරුෂ</label>
                    <div class="bmi-gender-group">
                        <label style="cursor: pointer; display: flex; align-items: center; justify-content:center; color: white; background: rgba(255,255,255,0.1); border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); width:100%;">
                            <input type="radio" name="bmiGender" value="male" checked style="margin-right: 4px;"> M
                        </label>
                        <label style="cursor: pointer; display: flex; align-items: center; justify-content:center; color: white; background: rgba(255,255,255,0.1); border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); width:100%;">
                            <input type="radio" name="bmiGender" value="female" style="margin-right: 4px;"> F
                        </label>
                    </div>
                 </div>
             </div>

             <!-- Row 2: Grade & DOB -->
             <div class="bmi-compact-grid">
                 <div>
                   <label style="display: block; color: #ffffff; margin-bottom: 4px; font-weight: 500;">ශ්‍රේණිය</label>
                   <select id="bmiGrade" style="width: 100%; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.9);">
                       ${gradeOptions}
                   </select>
                 </div>
                 <div>
                   <label style="display: block; color: #ffffff; margin-bottom: 4px; font-weight: 500;">උපන් දිනය</label>
                   <input type="date" id="bmiDOB" style="width: 100%; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.9);">
                 </div>
             </div>
             <div id="liveAgeDisplay" style="text-align:right; font-size: 11px; color: #eee; margin-top:-5px; font-style: italic; min-height: 15px;"></div>
             
             <!-- Row 3: Height & Weight -->
             <div class="bmi-compact-grid">
                 <div>
                   <label style="display: block; color: #ffffff; margin-bottom: 4px; font-weight: 500;">උස (cm) <span id="heightStatusSimple" style="display:block; font-weight:700; color:#ffeb3b; font-size:11px; text-transform: uppercase;"></span></label>
                   <input type="number" id="bmiHeight" placeholder="cm" style="width: 100%; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.9);">
                 </div>
                 <div>
                   <label style="display: block; color: #ffffff; margin-bottom: 4px; font-weight: 500;">බර (kg) <span id="weightStatusSimple" style="display:block; font-weight:700; color:#ffeb3b; font-size:11px; text-transform: uppercase;"></span></label>
                   <input type="number" id="bmiWeight" placeholder="kg" style="width: 100%; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.9);">
                 </div>
             </div>
          </div>
          </div>
          
          <!-- LAYOUT 2: Mobile-Optimized -->
          <div class="layout-2" id="layout2" style="display: block;">
              
              <!-- Date Buttons Row -->
              <div class="date-buttons-row">
                  <!-- Exam Date Picker Button -->
                  <div class="date-btn-card" id="examDateBtn">
                      <div class="date-btn-left">
                          <div class="date-btn-label">පෙරපරික්ෂාව කල දිනය</div>
                          <div class="date-btn-value" id="examDateDisplay">2023-10-27</div>
                      </div>
                      <div class="date-btn-icon"><i class="fa-regular fa-calendar-days"></i></div>
                  </div>

                  <!-- DOB Picker Button -->
                   <div class="date-btn-card" id="dobDateBtn">
                      <div class="date-btn-left">
                          <div class="date-btn-label">උපන් දිනය</div>
                          <div class="date-btn-value" id="dobDateDisplay">select</div>
                      </div>
                      <div class="date-btn-icon"><i class="fa-solid fa-cake-candles"></i></div>
                  </div>
              </div>

              <!-- Top Row: Gender + Grade Selector -->
              <div class="top-controls-row">
                  <div class="gender-button-group">
                      <div class="gender-btn active" id="genderMale" data-gender="male">
                          <div class="icon">♂</div>
                          <div class="label">Male</div>
                      </div>
                      <div class="gender-btn" id="genderFemale" data-gender="female">
                          <div class="icon">♀</div>
                          <div class="label">Female</div>
                      </div>
                  </div>
                  
                  <div class="grade-selector-btn" id="gradeSelectorBtn">
                      <span id="gradeSelectedText">ශ්‍රේණිය/Grade</span>
                      <i class="fa-solid fa-chevron-down"></i>
                  </div>
              </div>

              <!-- Live Age Display (Layout 2) -->
              <div id="liveAgeDisplay2" style="text-align:center; font-size: 13px; color: #eee; margin-bottom: 15px; font-weight: 500; min-height: 20px;"></div>
              
              
              <!-- Height Ruler Picker -->
              <div class="ruler-picker-box">
                  <div class="ruler-header">
                      <div class="ruler-icon-box"><i class="fa-solid fa-ruler-vertical"></i></div>
                      <div class="ruler-title">Height <span>cm</span> <span id="heightStatusLabel2" class="ruler-status-label"></span></div>
                  </div>
                  <div class="ruler-value-display" id="heightValue2">110</div>
                  
                  <div class="ruler-pointer"></div>
                  <div class="ruler-fade-left"></div>
                  <div class="ruler-fade-right"></div>
                  
                  <div class="ruler-scroll-container" id="heightRuler">
                      <div class="ruler-spacer"></div>
                      <div class="ruler-track" id="heightRulerTrack"></div>
                      <div class="ruler-spacer"></div>
                  </div>
              </div>
              
              <!-- Weight Ruler Picker -->
              <div class="ruler-picker-box">
                  <div class="ruler-header">
                      <div class="ruler-icon-box"><i class="fa-solid fa-weight-scale"></i></div>
                      <div class="ruler-title">Weight <span>kg</span> <span id="weightStatusLabel2" class="ruler-status-label"></span></div>
                  </div>
                  <div class="ruler-value-display" id="weightValue2">15</div>
                  
                  <div class="ruler-pointer"></div>
                  <div class="ruler-fade-left"></div>
                  <div class="ruler-fade-right"></div>
                  
                  <div class="ruler-scroll-container" id="weightRuler">
                      <div class="ruler-spacer"></div>
                      <div class="ruler-track" id="weightRulerTrack"></div>
                      <div class="ruler-spacer"></div>
                  </div>
              </div>

              <!-- Inputs hidden, used for logic -->
              <input type="hidden" id="heightSlider" value="110">
              <input type="hidden" id="weightSlider" value="15">

              
              <!-- Hidden inputs for compatibility -->
              <input type="hidden" id="bmiDOB2">
              <input type="hidden" id="bmiExamDate2">
              <input type="hidden" id="bmiHeight2">
              <input type="hidden" id="bmiWeight2">
              <input type="hidden" id="bmiGrade2">
          </div>
          
          <!-- Date Picker Modal and Backdrop -->
            <div class="date-picker-backdrop" id="datePickerBackdrop"></div>
            <div class="date-picker-modal" id="datePickerModal">
                <div class="date-picker-header">
                    <button class="date-picker-close" id="datePickerClose"><i class="fa-solid fa-xmark"></i></button>
                    <div class="date-picker-title" id="datePickerTitle">Select Date</div>
                    <button class="date-picker-done" id="datePickerDone">Done</button>
                </div>
                
                <div class="date-wheels-container">
                    <div class="date-wheel-highlight"></div>
                    <!-- Day Wheel -->
                    <div class="date-wheel" id="dayWheel">
                        <div class="date-wheel-spacer"></div>
                        <!-- Items injected via JS -->
                        <div class="date-wheel-spacer"></div>
                    </div>
                    <!-- Month Wheel -->
                    <div class="date-wheel" id="monthWheel">
                        <div class="date-wheel-spacer"></div>
                        <!-- Items injected via JS -->
                        <div class="date-wheel-spacer"></div>
                    </div>
                    <!-- Year Wheel -->
                    <div class="date-wheel" id="yearWheel">
                        <div class="date-wheel-spacer"></div>
                        <!-- Items injected via JS -->
                        <div class="date-wheel-spacer"></div>
                    </div>
                </div>
            </div>

          <!-- Grade Popup -->
          <div class="grade-popup" id="gradePopup">
              <div class="grade-popup-content">
                  <div class="grade-popup-header">
                      <div class="grade-popup-title">ශ්‍රේණිය තෝරන්න (Select Grade)</div>
                      <button class="grade-popup-close" id="gradePopupClose">×</button>
                  </div>
                  <div class="grade-popup-grid" id="gradePopupGrid">
                      ${Array.from({ length: 13 }, (_, i) => `<div class="grade-popup-item" data-grade="${i + 1}">${i + 1}</div>`).join('')}
                  </div>
              </div>
          </div>
          
          <div id="bmiPreviewLink" style="text-align:center; margin-bottom:15px; display:none; animation: fadeIn 0.5s;">
             <div style="font-size:14px; color:white; opacity:0.9;">BMI Value</div>
             <div id="bmiPreviewVal" style="font-size:36px; font-weight:800; color:#fff; text-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>
          </div>

          <button id="btnCalculateBMI" style="width: 100%; padding: 12px; background: #e91e63; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 12px rgba(233, 30, 99, 0.4);">
            <i class="fa-solid fa-calculator" style="margin-right:8px;"></i> CALCULATE
          </button>

          <!-- Result Area -->
          <div id="bmiResult" style="display: none; margin-top: 25px; padding: 20px; border-radius: 12px; background: rgba(255,255,255,0.95); box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
             
             <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px;">
                 <div>
                    <span style="font-size: 14px; color: #777;">වයස </span>
                    <strong id="displayAge" style="font-size: 16px; color: #333;">-</strong>
                 </div>
                 <div>
                    <span style="font-size: 14px; color: #777;">BMI:</span>
                    <strong id="bmiValueDisplay" style="font-size: 20px; color: #1b5e20;">0.0</strong>
                 </div>
             </div>

             <!-- Status Cards -->
             <div class="bmi-grid-container" style="margin-bottom: 30px;">
                <!-- BMI Status -->
                <div style="background: #fdfdfd; padding: 15px; border-radius: 10px; border: 1px solid #eee; text-align: center;">
                    <div style="font-size: 13px; color: #555; margin-bottom: 5px;">BMI තත්වය <br>(BMI Status)</div>
                    <div id="bmiStatusText" style="font-size: 16px; font-weight: 700; padding: 6px 12px; border-radius: 20px; display: inline-block;">-</div>
                </div>

                <!-- Height Status -->
                <div style="background: #fdfdfd; padding: 15px; border-radius: 10px; border: 1px solid #eee; text-align: center;">
                    <div style="font-size: 13px; color: #555; margin-bottom: 5px;">උස පිළිබඳ තත්වය <br>(Height Status)</div>
                    <div id="heightStatusText" style="font-size: 16px; font-weight: 700; padding: 6px 12px; border-radius: 20px; display: inline-block;">-</div>
                </div>
             </div>

             <!-- Charts -->
             <div class="bmi-charts-container">
               <div class="bmi-chart-card">
                 <h4 style="text-align:center; font-size:14px; margin-bottom:10px; color:#333;">BMI for Age (5-19 Years, WHO)</h4>
                 <div class="bmi-chart-wrapper">
                    <canvas id="chartBMI"></canvas>
                 </div>
               </div>
               <div class="bmi-chart-card">
                 <h4 style="text-align:center; font-size:14px; margin-bottom:10px; color:#333;">Height for Age (5-19 Years, WHO)</h4>
                 <div class="bmi-chart-wrapper">
                    <canvas id="chartHeight"></canvas>
                 </div>
               </div>
             </div>

          </div>
        </div>
      `;

            // Removed local variable shadowing
            const updateAgeDisplay = () => {
                const dobVal = document.getElementById("bmiDOB").value;
                const examDateVal = document.getElementById("bmiExamDate").value;
                const displayEl = document.getElementById("liveAgeDisplay");
                const displayEl2 = document.getElementById("liveAgeDisplay2"); // Target Layout 2 display

                // Helper to clear both
                const clearDisplays = (text = "") => {
                    if (displayEl) displayEl.textContent = text;
                    if (displayEl2) displayEl2.textContent = text;
                };

                if (!dobVal) {
                    clearDisplays("");
                    return;
                }

                const dob = new Date(dobVal);
                const compareDate = examDateVal ? new Date(examDateVal) : new Date();

                let ageYears = compareDate.getFullYear() - dob.getFullYear();
                let ageMonths = compareDate.getMonth() - dob.getMonth();
                const dayDiff = compareDate.getDate() - dob.getDate();

                if (dayDiff < 0) {
                    ageMonths--;
                }

                if (ageMonths < 0) {
                    ageYears--;
                    ageMonths += 12;
                }

                if (ageYears < 0) {
                    clearDisplays("Invalid Dates");
                    return;
                }

                const ageText = `වයස: අවුරුදු ${ageYears} මාස ${ageMonths}`;
                clearDisplays(ageText);
            };

            // Layout Switcher
            const layoutSwitcher = document.getElementById("layoutSwitcher");
            const layout1 = document.getElementById("layout1");
            const layout2 = document.getElementById("layout2");

            layoutSwitcher.addEventListener("click", () => {
                currentLayout = currentLayout === 1 ? 2 : 1;

                if (currentLayout === 2) {
                    layout1.style.display = "none";
                    layout2.style.display = "block";
                    // Sync data from layout 1 to layout 2
                    this.syncLayout1To2();
                    updateAgeDisplay(); // Ensure age is updated on switch
                } else {
                    layout1.style.display = "block";
                    layout2.style.display = "none";
                    // Sync data from layout 2 to layout 1
                    this.syncLayout2To1();
                }
            });

            // Live Age Update Listeners
            const dobInput = document.getElementById("bmiDOB");
            const examInput = document.getElementById("bmiExamDate");

            if (dobInput) dobInput.addEventListener("change", updateAgeDisplay);
            if (examInput) examInput.addEventListener("change", updateAgeDisplay);

            // Layout 2: Gender Selection
            const genderMale = document.getElementById("genderMale");
            const genderFemale = document.getElementById("genderFemale");

            genderMale.addEventListener("click", () => {
                genderMale.classList.add("active");
                genderFemale.classList.remove("active");
            });

            genderFemale.addEventListener("click", () => {
                genderFemale.classList.add("active");
                genderMale.classList.remove("active");
            });



            // Layout 2: Date Picker Logic (Custom Wheels)
            const setupDatePickerWithWheels = () => {
                const modal = document.getElementById("datePickerModal");
                const backdrop = document.getElementById("datePickerBackdrop");
                if (!modal) return;

                const dayWheel = document.getElementById("dayWheel");
                const monthWheel = document.getElementById("monthWheel");
                const yearWheel = document.getElementById("yearWheel");
                const closeBtn = document.getElementById("datePickerClose");
                const doneBtn = document.getElementById("datePickerDone");
                const titleEl = document.getElementById("datePickerTitle");

                let currentTarget = null; // 'exam' or 'dob'
                const days = Array.from({ length: 31 }, (_, i) => i + 1);
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                // Start from 2000 to current year + 2
                const currentYear = new Date().getFullYear();
                const years = [];
                for (let y = 2005; y <= currentYear + 2; y++) years.push(y);
                // Need wider range for DOB? 2005 is 19 years ago. 2000 is safer.
                // Children 5-19 years. 2024 - 19 = 2005. 
                // So 2005 is the minimum year for 19 year old.
                // Let's go 2000 just in case.
                if (years[0] > 2000) {
                    for (let y = 2004; y >= 2000; y--) years.unshift(y);
                }

                // Render Function
                const renderWheel = (wheel, items) => {
                    let html = '<div class="date-wheel-spacer"></div>';
                    items.forEach((item, i) => {
                        html += `<div class="date-wheel-item" data-idx="${i}">${item}</div>`;
                    });
                    html += '<div class="date-wheel-spacer"></div>';
                    wheel.innerHTML = html;
                };

                renderWheel(dayWheel, days);
                renderWheel(monthWheel, months);
                renderWheel(yearWheel, years);

                const itemHeight = 40;

                // Scroll Logic
                const scrollToValue = (wheel, index) => {
                    wheel.scrollTop = index * itemHeight;
                };

                const getSelectedIndex = (wheel) => {
                    return Math.round(wheel.scrollTop / itemHeight);
                };

                // Active Item Highlighter logic (optional, just visual)
                const updateActiveItem = (wheel) => {
                    const idx = getSelectedIndex(wheel);
                    const items = wheel.querySelectorAll('.date-wheel-item');
                    items.forEach(item => item.classList.remove('active'));
                    if (items[idx]) items[idx].classList.add('active');
                };

                [dayWheel, monthWheel, yearWheel].forEach(wheel => {
                    wheel.addEventListener('scroll', () => { // Debounce could be good
                        // updateActiveItem(wheel); // Live update of active class
                        clearTimeout(wheel.scrollTimeout);
                        wheel.scrollTimeout = setTimeout(() => updateActiveItem(wheel), 50);
                    });
                });


                const openPicker = (target) => {
                    currentTarget = target;

                    // Button logic
                    const btnId = target === 'exam' ? 'examDateBtn' : 'dobDateBtn';
                    const btnEl = document.getElementById(btnId);

                    // Reset styling
                    modal.style.top = '';
                    modal.style.bottom = '';
                    modal.style.left = '2%'; // Small margin
                    modal.style.transformOrigin = 'top center';

                    if (btnEl) {
                        const container = document.querySelector('.bmi-container');
                        const btnRect = btnEl.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();

                        // Calculate positions relative to container
                        const btnTopRel = btnRect.bottom - containerRect.top;

                        // Check space below
                        const spaceBelow = containerRect.height - btnTopRel;
                        const modalHeight = 300; // Approx height

                        if (spaceBelow < modalHeight) {
                            // Position ABOVE
                            const btnTopAbs = btnRect.top - containerRect.top;
                            modal.style.bottom = `${containerRect.height - btnTopAbs + 10}px`;
                            modal.style.top = 'auto';
                            modal.style.transformOrigin = 'bottom center';
                        } else {
                            // Position BELOW (Default)
                            modal.style.top = `${btnTopRel + 10}px`;
                        }
                    }

                    modal.classList.add("active");
                    // No backdrop/scroll lock requested for this mode


                    // --- RE-ADDED DATE LOGIC START ---
                    let dateStr;
                    if (target === 'exam') {
                        titleEl.textContent = "Select Exam Date";
                        dateStr = document.getElementById("bmiExamDate2").value || new Date().toISOString().split('T')[0];
                    } else {
                        titleEl.textContent = "Select Date of Birth";
                        dateStr = document.getElementById("bmiDOB2").value || "2015-01-01";
                    }

                    // Parse
                    const date = new Date(dateStr);
                    const d = date.getDate();
                    const m = date.getMonth();
                    let y = date.getFullYear();

                    // Find Indexes
                    let dIdx = d - 1;
                    let mIdx = m;
                    let yIdx = years.indexOf(y);
                    if (yIdx === -1) { yIdx = years.length - 1; } // Default to last if out of range
                    // --- RE-ADDED DATE LOGIC END ---

                    // Scroll
                    setTimeout(() => {
                        scrollToValue(dayWheel, dIdx);
                        scrollToValue(monthWheel, mIdx);
                        scrollToValue(yearWheel, yIdx);
                        updateActiveItem(dayWheel);
                        updateActiveItem(monthWheel);
                        updateActiveItem(yearWheel);
                    }, 50);
                };

                const closeDatePopup = () => {
                    modal.classList.remove("active");
                };

                const examBtn = document.getElementById("examDateBtn");
                if (examBtn) examBtn.addEventListener("click", () => openPicker('exam'));

                const dobBtn = document.getElementById("dobDateBtn");
                if (dobBtn) dobBtn.addEventListener("click", () => openPicker('dob'));

                closeBtn.addEventListener("click", closeDatePopup);
                // Backdrop listener removed as per request for 'popup from button' feel, 
                // but if we kept the element in HTML, ensure simple close logic if clicked.
                if (backdrop) backdrop.addEventListener("click", closeDatePopup);

                // Close when clicking outside logic
                document.addEventListener('click', (e) => {
                    if (modal.classList.contains('active')) {
                        const isClickInside = modal.contains(e.target);
                        const isClickOnBtn = (examBtn && examBtn.contains(e.target)) || (dobBtn && dobBtn.contains(e.target));

                        if (!isClickInside && !isClickOnBtn) {
                            closeDatePopup();
                        }
                    }
                });

                doneBtn.addEventListener("click", () => {
                    const dIdx = Math.min(days.length - 1, Math.max(0, getSelectedIndex(dayWheel)));
                    const mIdx = Math.min(months.length - 1, Math.max(0, getSelectedIndex(monthWheel)));
                    const yIdx = Math.min(years.length - 1, Math.max(0, getSelectedIndex(yearWheel)));

                    const d = days[dIdx];
                    const m = mIdx + 1;
                    const y = years[yIdx];

                    // Handle days in month (e.g. Feb 31)
                    // Simple check: create date object and see if it shifted
                    const dateObj = new Date(y, m - 1, d);
                    // If month changed, it means day was overflow (e.g. Feb 30 -> Mar 2)
                    // usually we prefer clamping.
                    // But JS Date() autocorrects. We'll capture the corrected one.
                    const isoDate = dateObj.toISOString().split('T')[0];

                    if (currentTarget === 'exam') {
                        const el = document.getElementById("bmiExamDate2");
                        if (el) el.value = isoDate;
                        const disp = document.getElementById("examDateDisplay");
                        if (disp) disp.textContent = isoDate;

                        // Sync to L1
                        const el1 = document.getElementById("bmiExamDate");
                        if (el1) { el1.value = isoDate; el1.dispatchEvent(new Event('change')); }
                    } else {
                        const el = document.getElementById("bmiDOB2");
                        if (el) el.value = isoDate;
                        const disp = document.getElementById("dobDateDisplay");
                        if (disp) disp.textContent = isoDate;

                        // Sync to L1
                        const el1 = document.getElementById("bmiDOB");
                        if (el1) { el1.value = isoDate; el1.dispatchEvent(new Event('change')); }
                    }

                    closeDatePopup();
                });
            };

            setupDatePickerWithWheels();

            // Layout 2: Grade Popup
            const gradeSelectorBtn = document.getElementById("gradeSelectorBtn");
            const gradePopup = document.getElementById("gradePopup");
            const gradePopupClose = document.getElementById("gradePopupClose");
            const gradePopupGrid = document.getElementById("gradePopupGrid");
            const gradeSelectedText = document.getElementById("gradeSelectedText");

            // Open popup with positioning logic
            const openGradePopup = () => {
                // Reset styling
                gradePopup.style.top = '';
                gradePopup.style.bottom = '';
                gradePopup.style.left = '50%';
                gradePopup.style.transform = 'translateX(-50%)';

                const container = document.querySelector('.bmi-container');
                if (gradeSelectorBtn && container) {
                    const btnRect = gradeSelectorBtn.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();

                    // Calculate positions relative to container
                    const btnBottomRel = btnRect.bottom - containerRect.top;
                    const btnTopRel = btnRect.top - containerRect.top;

                    // Check space below
                    const spaceBelow = containerRect.height - btnBottomRel;
                    const modalHeight = 300; // Approx height with padding

                    if (spaceBelow < modalHeight) {
                        // Position ABOVE
                        gradePopup.style.bottom = `${containerRect.height - btnTopRel + 10}px`;
                        gradePopup.style.top = 'auto';
                        gradePopup.style.transformOrigin = 'bottom center';
                    } else {
                        // Position BELOW (Default)
                        gradePopup.style.top = `${btnBottomRel + 10}px`;
                        gradePopup.style.bottom = 'auto';
                        gradePopup.style.transformOrigin = 'top center';
                    }
                }

                gradePopup.classList.add("active");
            };

            gradeSelectorBtn.addEventListener("click", openGradePopup);

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (gradePopup.classList.contains('active')) {
                    if (!gradePopup.contains(e.target) && !gradeSelectorBtn.contains(e.target)) {
                        gradePopup.classList.remove("active");
                    }
                }
            });

            // Close popup
            gradePopupClose.addEventListener("click", () => {
                gradePopup.classList.remove("active");
            });

            // Close on background click (handled by doc listener now, but keep explicit close button)
            /*
            gradePopup.addEventListener("click", (e) => {
                if (e.target === gradePopup) {
                    gradePopup.classList.remove("active");
                }
            });
            */

            // Grade selection
            gradePopupGrid.addEventListener("click", (e) => {
                if (e.target.classList.contains("grade-popup-item")) {
                    // Remove active from all
                    document.querySelectorAll(".grade-popup-item").forEach(item => {
                        item.classList.remove("active");
                    });
                    // Add active to clicked
                    e.target.classList.add("active");
                    const grade = e.target.dataset.grade;
                    document.getElementById("bmiGrade2").value = grade;

                    // Update selector button text
                    gradeSelectedText.textContent = `Grade ${grade}`;
                    gradeSelectorBtn.classList.add("selected");

                    // Auto-calculate DOB based on grade
                    const currentYear = new Date().getFullYear();
                    const estimatedBirthYear = currentYear - (parseInt(grade) + 5);
                    const isoDate = `${estimatedBirthYear}-01-01`;

                    document.getElementById("bmiDOB2").value = isoDate;

                    // Update DOB Button Display
                    const dobDisp = document.getElementById("dobDateDisplay");
                    if (dobDisp) dobDisp.textContent = isoDate;

                    // Sync to Layout 1 to trigger updates
                    const l1DOB = document.getElementById("bmiDOB");
                    if (l1DOB) { l1DOB.value = isoDate; l1DOB.dispatchEvent(new Event('change')); }

                    // Close popup
                    gradePopup.classList.remove("active");
                }
            });

            // ---------------------------------------------------------
            // RULER PICKER LOGIC
            // ---------------------------------------------------------

            // Configuration for rulers
            const pixelsPerUnit = 10; // 1cm or 1kg = 10px spacing

            const initRuler = (type, min, max, initialVal, step, pixelsPerStep) => {
                const container = document.getElementById(`${type}Ruler`);
                const track = document.getElementById(`${type}RulerTrack`);

                if (!container || !track) return;

                // Calculate total width
                // Calculate total steps
                const totalSteps = (max - min) / step;
                const trackWidth = totalSteps * pixelsPerStep;
                track.style.width = `${trackWidth}px`;

                // Generate Ticks
                let ticksHTML = '';
                // Add a small buffer to loop to handle floating point errors
                for (let val = min; val <= max + (step / 10); val += step) {
                    // Ensure val is precise to avoid 60.000000001
                    const currentVal = Math.round(val * 10) / 10;

                    // Position
                    const stepsFromMin = (currentVal - min) / step;
                    const leftPos = stepsFromMin * pixelsPerStep;

                    // Tick Type Logic
                    const isInteger = currentVal % 1 === 0;

                    if (isInteger) {
                        // Major tick on integers
                        ticksHTML += `<div class="ruler-tick major" style="left: ${leftPos}px;"></div>`;
                        // Only label integers
                        ticksHTML += `<div class="ruler-number ${initialVal == currentVal ? 'highlight' : ''}" style="left: ${leftPos}px;" data-val="${currentVal}">${currentVal}</div>`;
                    } else if (type === 'weight' && currentVal % 0.5 === 0) {
                        // Medium tick for X.5 kg
                        ticksHTML += `<div class="ruler-tick minor" style="left: ${leftPos}px; height: 18px; top:auto; bottom:30px;"></div>`;
                    } else if (type === 'height' && currentVal % 1 === 0.5) {
                        // Half-cm tick for height
                        ticksHTML += `<div class="ruler-tick minor" style="left: ${leftPos}px;"></div>`;
                    } else {
                        // Minor tick
                        ticksHTML += `<div class="ruler-tick minor" style="left: ${leftPos}px;"></div>`;
                    }
                }
                track.innerHTML = ticksHTML;

                // Center initially
                // Wrapper has 50% padding, so scrollLeft = 0 aligns 'min' to center.
                // Center initially
                setTimeout(() => {
                    const steps = (initialVal - min) / step;
                    container.scrollLeft = steps * pixelsPerStep;
                }, 100);
            };

            const setupRulerEvents = (type, min, max, step, pixelsPerStep) => {
                const container = document.getElementById(`${type}Ruler`);
                const display = document.getElementById(`${type}Value2`);
                const hiddenInput = document.getElementById(`${type}Slider`);
                const mainInput = document.getElementById(type === 'height' ? 'bmiHeight2' : 'bmiWeight2');

                if (!container) return;

                let isScrolling;

                container.addEventListener('scroll', () => {
                    const currentScroll = container.scrollLeft;
                    // val = min + (scroll / pxPerStep * step)
                    const stepsScrolled = currentScroll / pixelsPerStep;
                    let val = min + (stepsScrolled * step);

                    // Clamp
                    if (val < min) val = min;
                    if (val > max) val = max;

                    // Round to step
                    const inverseStep = 1 / step;
                    const roundedVal = Math.round(val * inverseStep) / inverseStep;

                    // Update display
                    let displayTxt;
                    if (type === 'weight') {
                        displayTxt = roundedVal.toFixed(1);
                    } else {
                        displayTxt = roundedVal.toString();
                    }

                    if (display) display.textContent = displayTxt;
                    if (hiddenInput) hiddenInput.value = roundedVal;
                    if (mainInput) mainInput.value = roundedVal;

                    // Clear timeout
                    window.clearTimeout(isScrolling);

                    // Snap to nearest step
                    isScrolling = setTimeout(() => {
                        const snapSteps = (roundedVal - min) / step;
                        const snapScroll = snapSteps * pixelsPerStep;
                        // Only scroll if difference is significant to avoid jitter loops
                        if (Math.abs(container.scrollLeft - snapScroll) > 1) {
                            container.scrollTo({
                                left: snapScroll,
                                behavior: 'smooth'
                            });
                        }
                    }, 150);
                });
            };

            // Initialize Height Ruler (0.5cm steps, 20px per step)
            // Range: 80 - 200 cm, Default: 110 cm
            initRuler('height', 80, 200, 110, 0.5, 20);
            setupRulerEvents('height', 80, 200, 0.5, 20);
            document.getElementById("bmiHeight2").value = 110; // Explicit set

            // Initialize Weight Ruler (0.1kg steps, 8px per step)
            // Range: 10 - 120 kg, Default: 15 kg
            initRuler('weight', 10, 120, 15, 0.1, 8);
            setupRulerEvents('weight', 10, 120, 0.1, 8);
            document.getElementById("bmiWeight2").value = 15; // Explicit set

            // Set Exam Date to today by default for both layouts
            const todayStr = new Date().toISOString().split('T')[0];
            document.getElementById("bmiExamDate").value = todayStr;
            document.getElementById("bmiExamDate2").value = todayStr;

            document.getElementById("btnCalculateBMI").addEventListener("click", this.calculateBMI);
            document.getElementById("bmiGrade").addEventListener("change", () => {
                this.handleGradeChange();
                updateAgeDisplay();
            });
            document.getElementById("bmiDOB").addEventListener("change", updateAgeDisplay);
            document.getElementById("bmiExamDate").addEventListener("change", updateAgeDisplay);

            container.addEventListener("keypress", (e) => {
                if (e.key === "Enter") this.calculateBMI();
            });
        },

        // Sync data from Layout 1 to Layout 2
        syncLayout1To2: function () {
            // Gender
            const gender = document.querySelector('input[name="bmiGender"]:checked').value;
            if (gender === "male") {
                document.getElementById("genderMale").classList.add("active");
                document.getElementById("genderFemale").classList.remove("active");
            } else {
                document.getElementById("genderFemale").classList.add("active");
                document.getElementById("genderMale").classList.remove("active");
            }

            // Height
            const height = document.getElementById("bmiHeight").value || 180;
            document.getElementById("heightSlider").value = height;
            document.getElementById("heightValue2").textContent = height;
            document.getElementById("bmiHeight2").value = height;

            // Weight (now using slider)
            const weight = document.getElementById("bmiWeight").value || 60;
            document.getElementById("weightSlider").value = weight;
            document.getElementById("weightValue2").textContent = weight;
            document.getElementById("bmiWeight2").value = weight;

            // Grade
            const grade = document.getElementById("bmiGrade").value;
            if (grade) {
                document.querySelectorAll(".grade-popup-item").forEach(item => {
                    item.classList.remove("active");
                    if (item.dataset.grade === grade) {
                        item.classList.add("active");
                    }
                });
                document.getElementById("bmiGrade2").value = grade;
                document.getElementById("gradeSelectedText").textContent = `Grade ${grade}`;
                document.getElementById("gradeSelectorBtn").classList.add("selected");
            }

            // DOB and Age
            // DOB and Age
            const dob = document.getElementById("bmiDOB").value;
            if (dob) {
                document.getElementById("bmiDOB2").value = dob;
                const dobDisp = document.getElementById("dobDateDisplay");
                if (dobDisp) dobDisp.textContent = dob;
            }

            // Exam Date
            const examDate = document.getElementById("bmiExamDate").value;
            document.getElementById("bmiExamDate2").value = examDate;
        },

        // Sync data from Layout 2 to Layout 1
        syncLayout2To1: function () {
            // Gender
            const isMale = document.getElementById("genderMale").classList.contains("active");
            if (isMale) {
                document.querySelector('input[name="bmiGender"][value="male"]').checked = true;
            } else {
                document.querySelector('input[name="bmiGender"][value="female"]').checked = true;
            }

            // Height
            const height = document.getElementById("bmiHeight2").value || document.getElementById("heightSlider").value;
            document.getElementById("bmiHeight").value = height;

            // Weight
            const weight = document.getElementById("bmiWeight2").value || document.getElementById("weightSlider").value;
            document.getElementById("bmiWeight").value = weight;

            // Grade
            const grade = document.getElementById("bmiGrade2").value;
            if (grade) {
                document.getElementById("bmiGrade").value = grade;
            }

            // DOB
            const dob = document.getElementById("bmiDOB2").value;
            if (dob) {
                document.getElementById("bmiDOB").value = dob;
            }

            // Exam Date
            const examDate = document.getElementById("bmiExamDate2").value;
            document.getElementById("bmiExamDate").value = examDate;
        },

        handleGradeChange: function () {
            const gradeSelect = document.getElementById("bmiGrade");
            const dobInput = document.getElementById("bmiDOB");
            if (!gradeSelect.value) return;
            const grade = parseInt(gradeSelect.value);
            const currentYear = new Date().getFullYear();
            const estimatedBirthYear = currentYear - (grade + 5);
            if (estimatedBirthYear > 1900 && estimatedBirthYear < currentYear) {
                dobInput.value = `${estimatedBirthYear}-01-01`;
            }
        },

        calculateBMI: function () {
            // Determine which layout is active
            const isLayout2Active = currentLayout === 2;

            // Get gender
            let gender;
            if (isLayout2Active) {
                gender = document.getElementById("genderMale").classList.contains("active") ? "male" : "female";
            } else {
                gender = document.querySelector('input[name="bmiGender"]:checked').value;
            }

            // Get DOB and Exam Date
            const dobVal = isLayout2Active ?
                document.getElementById("bmiDOB2").value :
                document.getElementById("bmiDOB").value;
            const examDateVal = isLayout2Active ?
                document.getElementById("bmiExamDate2").value :
                document.getElementById("bmiExamDate").value;

            // Get Height and Weight
            let heightCm, weightKg;
            if (isLayout2Active) {
                heightCm = parseFloat(document.getElementById("bmiHeight2").value || document.getElementById("heightSlider").value);
                weightKg = parseFloat(document.getElementById("bmiWeight2").value || document.getElementById("weightValue2").textContent);
            } else {
                heightCm = parseFloat(document.getElementById("bmiHeight").value);
                weightKg = parseFloat(document.getElementById("bmiWeight").value);
            }

            // Validation: Ensure strictly that DOB, Height, and Weight are present.
            // Exam Date is optional (logic uses today if missing, though typically set).
            // Gender has a default so is always present.
            if (!dobVal) {
                if (typeof window.showWarning === 'function') {
                    window.showWarning("කරුණාකර උපන්දිනය ඇතුලත් කරන්න. (Date of Birth required)");
                } else {
                    alert("Please enter Date of Birth.");
                }
                return;
            }
            if (!heightCm || heightCm <= 0) {
                if (typeof window.showWarning === 'function') {
                    window.showWarning("කරුණාකර උස (Height) ඇතුලත් කරන්න.");
                } else {
                    alert("Please enter valid Height.");
                }
                return;
            }
            if (!weightKg || weightKg <= 0) {
                if (typeof window.showWarning === 'function') {
                    window.showWarning("කරුණාකර බර (Weight) ඇතුලත් කරන්න.");
                } else {
                    alert("Please enter valid Weight.");
                }
                return;
            }

            const dob = new Date(dobVal);
            const compareDate = examDateVal ? new Date(examDateVal) : new Date();

            let ageYears = compareDate.getFullYear() - dob.getFullYear();
            let ageMonths = compareDate.getMonth() - dob.getMonth();
            const dayDiff = compareDate.getDate() - dob.getDate();

            if (dayDiff < 0) {
                ageMonths--;
            }
            if (ageMonths < 0) {
                ageYears--;
                ageMonths += 12;
            }

            const ageDecimal = ageYears + (ageMonths + (dayDiff < 0 ? 30 + dayDiff : dayDiff) / 30) / 12;
            const displayAgeStr = `${ageYears} Y, ${ageMonths} M`;

            let lookupAge = ageYears;
            if (lookupAge < 5) lookupAge = 5;
            if (lookupAge > 19) lookupAge = 19;

            const dsBMI = (gender === 'male') ? growthDataBMI.boys : growthDataBMI.girls;
            const refBMI = dsBMI[lookupAge];

            const dsHeight = (gender === 'male') ? growthDataHeight.boys : growthDataHeight.girls;
            const refHeight = dsHeight[lookupAge];

            if (!refBMI || !refHeight) {
                window.showError("වයස පරාසය සහාය නොදක්වයි.");
                return;
            }

            const heightM = heightCm / 100;
            const bmi = weightKg / (heightM * heightM);
            const bmiFixed = bmi.toFixed(1);

            // BMI Logic
            const limitThin = refBMI[1]; // -2SD
            const limitNormalHigh = refBMI[4]; // +1SD
            const limitObese = refBMI[5]; // +2SD

            let bmiStatus = "", bmiColor = "", bmiBg = "", weightRecommendation = "";
            let simpleWeightStatus = ""; // English only

            const minNormalWeight = (limitThin * heightM * heightM).toFixed(1);
            const maxNormalWeight = (limitNormalHigh * heightM * heightM).toFixed(1);

            if (bmi < limitThin) {
                bmiStatus = "Underweight";
                simpleWeightStatus = "Underweight";
                bmiColor = "#d35400"; bmiBg = "#fadbd8";
                const diff = (minNormalWeight - weightKg).toFixed(1);
                weightRecommendation = `<p style="margin:5px 0 0 0; font-size:13px; color:#c0392b;">නිරෝගී බරක් වීමට <strong>${diff} kg</strong> ක් වත් වැඩි කර ගත යුතුය.<br>(ඉලක්කය: ${minNormalWeight} kg - ${maxNormalWeight} kg)</p>`;
            } else if (bmi > limitObese) {
                bmiStatus = "Obesity";
                simpleWeightStatus = "Obesity";
                bmiColor = "#c0392b"; bmiBg = "#f2d7d5";
                const diff = (weightKg - maxNormalWeight).toFixed(1);
                weightRecommendation = `<p style="margin:5px 0 0 0; font-size:13px; color:#c0392b;">නිරෝගී බරක් වීමට <strong>${diff} kg</strong> ක් වත් අඩු කර ගත යුතුය.<br>(ඉලක්කය: ${minNormalWeight} kg - ${maxNormalWeight} kg)</p>`;
            } else if (bmi > limitNormalHigh) {
                bmiStatus = "Overweight";
                simpleWeightStatus = "Overweight";
                bmiColor = "#f39c12"; bmiBg = "#fce8d6";
                const diff = (weightKg - maxNormalWeight).toFixed(1);
                weightRecommendation = `<p style="margin:5px 0 0 0; font-size:13px; color:#d35400;">නිරෝගී බරක් වීමට <strong>${diff} kg</strong> ක් වත් අඩු කර ගත යුතුය.<br>(ඉලක්කය: ${minNormalWeight} kg - ${maxNormalWeight} kg)</p>`;
            } else {
                bmiStatus = "Normal Weight";
                simpleWeightStatus = "Normal Weight";
                bmiColor = "#27ae60"; bmiBg = "#d5f5e3";
                weightRecommendation = `<p style="margin:5px 0 0 0; font-size:13px; color:#27ae60;">ඔබගේ බර <strong>නිවැරදි මට්ටමේ (Normal)</strong> පවතී.<br>(පරාසය: ${minNormalWeight} kg - ${maxNormalWeight} kg)</p>`;
            }

            // Height Logic
            const limitStunting = refHeight[1]; // -2SD
            let heightStatus = "", heightColor = "", heightBg = "", heightRecommendation = "";
            let simpleHeightStatus = ""; // English only

            if (heightCm < limitStunting) {
                heightStatus = "Stunting";
                simpleHeightStatus = "Stunting";
                heightColor = "#c0392b"; heightBg = "#f2d7d5";
                const diff = (limitStunting - heightCm).toFixed(1);
                heightRecommendation = `<p style="margin:5px 0 0 0; font-size:13px; color:#c0392b;">සාමාන්‍ය උස මට්ටමට ළඟා වීමට තව <strong>${diff} cm</strong> ක් අවශ්‍ය වේ.<br>(අවම සාමාන්‍ය උස: ${limitStunting} cm)</p>`;
            } else {
                heightStatus = "Normal Height";
                simpleHeightStatus = "Normal Height";
                heightColor = "#27ae60"; heightBg = "#d5f5e3";
                heightRecommendation = `<p style="margin:5px 0 0 0; font-size:13px; color:#27ae60;">උස සාමාන්‍ය මට්ටමේ පවතී.</p>`;
            }

            // Render Results
            document.getElementById("bmiResult").style.display = "block";
            document.getElementById("displayAge").textContent = displayAgeStr;
            document.getElementById("bmiValueDisplay").textContent = bmiFixed;

            // Updated Simple Status Tags
            const hTag = document.getElementById("heightStatusSimple");
            if (hTag) {
                hTag.textContent = simpleHeightStatus;
                hTag.style.color = (simpleHeightStatus === 'Normal Height') ? '#4caf50' : '#ff5252';
            }
            // Update Layout 2 Header Label
            const hTag2 = document.getElementById("heightStatusLabel2");
            if (hTag2) {
                hTag2.textContent = simpleHeightStatus;
                hTag2.style.opacity = "1"; // Reveal
                hTag2.style.backgroundColor = (simpleHeightStatus === 'Normal Height') ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 82, 82, 0.2)';
                hTag2.style.color = (simpleHeightStatus === 'Normal Height') ? '#4caf50' : '#ff5252';
            }

            const wTag = document.getElementById("weightStatusSimple");
            if (wTag) {
                wTag.textContent = simpleWeightStatus;
                wTag.style.color = (simpleWeightStatus === 'Normal Weight') ? '#4caf50' : (simpleWeightStatus === 'Overweight' ? '#ff9800' : '#ff5252');
            }
            // Update Layout 2 Header Label
            const wTag2 = document.getElementById("weightStatusLabel2");
            if (wTag2) {
                wTag2.textContent = simpleWeightStatus;
                wTag2.style.opacity = "1"; // Reveal
                wTag2.style.backgroundColor = (simpleWeightStatus === 'Normal Weight') ? 'rgba(76, 175, 80, 0.2)' : (simpleWeightStatus === 'Overweight' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 82, 82, 0.2)');
                wTag2.style.color = (simpleWeightStatus === 'Normal Weight') ? '#4caf50' : (simpleWeightStatus === 'Overweight' ? '#ff9800' : '#ff5252');
            }

            // Update BMI Preview Above Button
            const bmiPreview = document.getElementById("bmiPreviewLink");
            const bmiPreviewVal = document.getElementById("bmiPreviewVal");
            if (bmiPreview && bmiPreviewVal) {
                bmiPreview.style.display = 'block';
                bmiPreviewVal.textContent = bmiFixed;
                // dynamic color for preview
                bmiPreviewVal.style.color = (bmiColor === '#27ae60') ? '#66bb6a' : (bmiColor === '#f39c12' ? '#ffcc80' : '#ef9a9a');
            }

            const bmiEl = document.getElementById("bmiStatusText");
            bmiEl.innerHTML = `<span>${bmiStatus}</span><div style="margin-top:8px; border-top:1px solid rgba(0,0,0,0.05); padding-top:5px;">${weightRecommendation}</div>`;
            bmiEl.parentElement.style.backgroundColor = bmiBg;
            bmiEl.parentElement.style.border = `1px solid ${bmiColor}`;
            bmiEl.style.color = bmiColor;
            bmiEl.style.backgroundColor = "transparent";
            bmiEl.style.padding = "0";

            const heightEl = document.getElementById("heightStatusText");
            heightEl.innerHTML = `<span>${heightStatus}</span><div style="margin-top:8px; border-top:1px solid rgba(0,0,0,0.05); padding-top:5px;">${heightRecommendation}</div>`;
            heightEl.parentElement.style.backgroundColor = heightBg;
            heightEl.parentElement.style.border = `1px solid ${heightColor}`;
            heightEl.style.color = heightColor;
            heightEl.style.backgroundColor = "transparent";
            heightEl.style.padding = "0";

            window.bmiApp.drawCharts(gender, ageDecimal, bmi, heightCm, growthDataBMI, growthDataHeight);
        },

        drawCharts: function (gender, currentAge, currentBMI, currentHeight, dataBMI, dataHeight) {
            const ctxBMI = document.getElementById('chartBMI').getContext('2d');
            const ctxHeight = document.getElementById('chartHeight').getContext('2d');

            if (bmiChartInstance) bmiChartInstance.destroy();
            if (heightChartInstance) heightChartInstance.destroy();

            const dsBMI = (gender === 'male') ? dataBMI.boys : dataBMI.girls;
            const dsHeight = (gender === 'male') ? dataHeight.boys : dataHeight.girls;
            const ages = Object.keys(dsBMI).map(k => parseInt(k));
            const getLines = (dataset) => [0, 1, 2, 3, 4, 5, 6].map(i => ages.map(a => dataset[a][i]));

            const bmiLines = getLines(dsBMI);
            const heightLines = getLines(dsHeight);

            // Responsive Config
            const isSmallMobile = window.innerWidth <= 380;
            const isMobile = window.innerWidth <= 480;

            const fontSizeLegend = isSmallMobile ? 9 : (isMobile ? 10 : 10);
            const fontSizeAxis = isSmallMobile ? 9 : (isMobile ? 10 : 11);
            const fontSizeTitle = isSmallMobile ? 10 : (isMobile ? 11 : 12);
            const pointRadiusUser = isSmallMobile ? 5 : 8;

            // Common config
            const commonConfig = { pointRadius: 0, borderWidth: 1.5, tension: 0.4 };

            bmiChartInstance = new Chart(ctxBMI, {
                type: 'line',
                data: {
                    labels: ages,
                    datasets: [
                        { label: 'You', data: [{ x: currentAge, y: currentBMI }], type: 'scatter', backgroundColor: '#0000FF', borderColor: '#fff', borderWidth: 2, pointRadius: pointRadiusUser, order: 0 },
                        { label: '+3 SD', data: bmiLines[6], borderColor: '#c0392b', ...commonConfig, borderDash: [2, 2] },
                        { label: '+2 SD (Obesity)', data: bmiLines[5], borderColor: '#c0392b', ...commonConfig, fill: { target: '+1', above: 'rgba(192, 57, 43, 0.15)' } },
                        { label: '+1 SD (Overweight)', data: bmiLines[4], borderColor: '#f39c12', ...commonConfig, fill: { target: '+1', above: 'rgba(243, 156, 18, 0.2)' } },
                        { label: 'Median', data: bmiLines[3], borderColor: '#27ae60', borderWidth: 2, ...commonConfig },
                        { label: '-1 SD', data: bmiLines[2], borderColor: '#27ae60', ...commonConfig, borderDash: [4, 4] },
                        { label: '-2 SD (Thinness)', data: bmiLines[1], borderColor: '#f39c12', ...commonConfig, fill: { target: '4', below: 'rgba(39, 174, 96, 0.1)' } },
                        { label: '-3 SD (Severe)', data: bmiLines[0], borderColor: '#c0392b', ...commonConfig, fill: { target: '-1', above: 'rgba(243, 156, 18, 0.2)' } }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'linear', min: 5, max: 19,
                            title: { display: !isSmallMobile, text: 'Age (Years)', font: { size: fontSizeTitle } },
                            ticks: { font: { size: fontSizeAxis } }
                        },
                        y: {
                            title: { display: !isSmallMobile, text: 'BMI', font: { size: fontSizeTitle } },
                            beginAtZero: false,
                            grace: '5%',
                            ticks: { font: { size: fontSizeAxis } }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { boxWidth: isSmallMobile ? 8 : 10, font: { size: fontSizeLegend }, padding: isSmallMobile ? 4 : 10 }
                        },
                        tooltip: {
                            bodyFont: { size: fontSizeAxis },
                            titleFont: { size: fontSizeTitle }
                        }
                    }
                }
            });

            heightChartInstance = new Chart(ctxHeight, {
                type: 'line',
                data: {
                    labels: ages,
                    datasets: [
                        { label: 'You', data: [{ x: currentAge, y: currentHeight }], type: 'scatter', backgroundColor: '#0000FF', borderColor: '#fff', borderWidth: 2, pointRadius: pointRadiusUser, order: 0 },
                        { label: '+3 SD', data: heightLines[6], borderColor: '#27ae60', ...commonConfig, borderDash: [2, 2] },
                        { label: '+2 SD', data: heightLines[5], borderColor: '#27ae60', ...commonConfig },
                        { label: '+1 SD', data: heightLines[4], borderColor: '#27ae60', ...commonConfig },
                        { label: 'Median', data: heightLines[3], borderColor: '#27ae60', borderWidth: 2, ...commonConfig },
                        { label: '-1 SD', data: heightLines[2], borderColor: '#27ae60', ...commonConfig },
                        { label: '-2 SD (Stunting)', data: heightLines[1], borderColor: '#c0392b', ...commonConfig, fill: { target: '+4', above: 'rgba(39, 174, 96, 0.1)' } },
                        { label: '-3 SD', data: heightLines[0], borderColor: '#c0392b', ...commonConfig, fill: { target: '-1', above: 'rgba(192, 57, 43, 0.1)' } }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'linear', min: 5, max: 19,
                            title: { display: !isSmallMobile, text: 'Age (Years)', font: { size: fontSizeTitle } },
                            ticks: { font: { size: fontSizeAxis } }
                        },
                        y: {
                            title: { display: !isSmallMobile, text: 'Height (cm)', font: { size: fontSizeTitle } },
                            beginAtZero: false,
                            grace: '5%',
                            ticks: { font: { size: fontSizeAxis } }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { boxWidth: isSmallMobile ? 8 : 10, font: { size: fontSizeLegend }, padding: isSmallMobile ? 4 : 10 }
                        },
                        tooltip: {
                            bodyFont: { size: fontSizeAxis },
                            titleFont: { size: fontSizeTitle }
                        }
                    }
                }
            });
        }
    };
})();
