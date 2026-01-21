/**
 * BMI App Module
 * Calculates Body Mass Index and Growth Status (Height/BMI) for Sri Lankan School Children (WHO 2007 Standards)
 * Includes Chart.js visualization with comprehensive Z-score lines (-3SD to +3SD).
 */

(function () {
    "use strict";

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

            // Injected Styles for Mobile Responsiveness
            const styles = `
              <style>
                .bmi-container {
                   max-width: 900px;
                   margin: 30px auto;
                   padding: 30px;
                   border-radius: 16px;
                }
                .bmi-grid-container {
                  display: grid;
                  grid-template-columns: 1fr;
                  gap: 15px;
                  margin-bottom: 20px;
                }
                .bmi-charts-container {
                   display: grid;
                   grid-template-columns: 1fr 1fr; 
                   gap: 20px;
                }
                .bmi-gender-group {
                    display: flex;
                    gap: 20px;
                }
                .bmi-chart-card {
                   background: white; 
                   padding: 15px; 
                   border-radius: 10px; 
                   box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }
                .bmi-chart-wrapper {
                   position: relative;
                   height: 600px;
                   width: 100%;
                }
                @media (max-width: 768px) {
                  .bmi-grid-container, .bmi-charts-container {
                    grid-template-columns: 1fr !important;
                  }
                  .bmi-container { 
                    margin: 15px 10px; 
                    padding: 15px; 
                  }
                  #bmiGrade, #bmiDOB, #bmiHeight, #bmiWeight, #bmiExamDate {
                      font-size: 14px !important; /* Smaller font for mobile */
                      padding: 10px !important;
                  }
                  .bmi-header {
                      font-size: 18px !important;
                      margin-bottom: 15px !important;
                  }
                  .bmi-grid-container {
                      gap: 10px !important; /* Reduced row gap */
                      margin-bottom: 15px !important;
                  }
                  label {
                      font-size: 13px !important;
                      margin-bottom: 5px !important;
                  }
                  /* Mobile chart height adjustments */
                  .bmi-chart-wrapper {
                      height: 400px !important; 
                  }
                }
                @media (max-width: 480px) {
                    /* Specific styles for small screens */
                    .bmi-container {
                        margin: 5px 2px !important; /* Minimal margin */
                        padding: 10px !important;
                    }
                    .bmi-chart-card {
                        padding: 5px !important; /* Reduce card padding */
                    }
                    .bmi-gender-group {
                        flex-direction: row !important; /* Keep gender on one row */
                        gap: 10px;
                    }
                    .bmi-gender-group label {
                        flex: 1;
                        justify-content: center;
                        padding: 8px !important;
                        font-size: 12px !important;
                    }
                     /* Smaller chart height for 320px screens */
                    .bmi-chart-wrapper {
                        height: 300px !important; 
                    }
                }
              </style>
            `;

            container.innerHTML = `
        ${styles}
        <div class="glass bmi-container">
          <h2 class="bmi-header" style="color: #ffffff; text-align: center; margin-bottom: 25px; font-size: 24px; font-weight: 600;">
            <i class="fa-solid fa-child-reaching" style="margin-right:10px;"></i>පාසල් සෞඛ්‍ය සඳහා BMI calculator
          </h2>
          
          <div class="bmi-grid-container">
             <!-- Exam Date -->
             <div>
               <label style="display: block; color: #ffffff; margin-bottom: 10px; font-weight: 500;">මූලික පරීක්ෂාව කල දිනය </label>
               <input type="date" id="bmiExamDate" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.9); font-size: 15px;">
             </div>

             <!-- Gender -->
             <div>
                <label style="display: block; color: #ffffff; margin-bottom: 10px; font-weight: 500;">ස්ත්‍රී / පුරුෂ භාවය </label>
                <div class="bmi-gender-group">
                    <label style="cursor: pointer; display: flex; align-items: center; color: white; background: rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3);">
                        <input type="radio" name="bmiGender" value="male" checked style="margin-right: 8px; transform: scale(1.2);"> පිරිමි 
                    </label>
                    <label style="cursor: pointer; display: flex; align-items: center; color: white; background: rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3);">
                        <input type="radio" name="bmiGender" value="female" style="margin-right: 8px; transform: scale(1.2);"> ගැහැණු 
                    </label>
                </div>
             </div>

             <!-- Grade -->
             <div>
               <label style="display: block; color: #ffffff; margin-bottom: 8px; font-weight: 500;">ශ්‍රේණිය </label>
               <select id="bmiGrade" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.9); font-size: 15px;">
                   ${gradeOptions}
               </select>
             </div>

             <!-- DOB -->
             <div>
               <label style="display: block; color: #ffffff; margin-bottom: 8px; font-weight: 500;">උපන් දිනය </label>
               <input type="date" id="bmiDOB" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.9); font-size: 15px;">
               <div id="liveAgeDisplay" style="margin-top: 5px; font-size: 13px; color: #d0d0d0; font-style: italic; min-height: 20px;"></div>
             </div>
             
             <!-- Height -->
             <div>
               <label style="display: block; color: #ffffff; margin-bottom: 8px; font-weight: 500;">උස (cm)</label>
               <input type="number" id="bmiHeight" placeholder="Ex: 135" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.9); font-size: 15px;">
             </div>
             
             <!-- Weight -->
             <div>
               <label style="display: block; color: #ffffff; margin-bottom: 8px; font-weight: 500;">බර (kg) </label>
               <input type="number" id="bmiWeight" placeholder="Ex: 28" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.9); font-size: 15px;">
             </div>
          </div>
          
          <button id="btnCalculateBMI" style="width: 100%; padding: 14px; background: #1b5e20; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
            <i class="fa-solid fa-calculator" style="margin-right:8px;"></i> BMI ගණනය කරන්න
          </button>

          <!-- Result Area -->
          <div id="bmiResult" style="display: none; margin-top: 25px; padding: 20px; border-radius: 12px; background: rgba(255,255,255,0.95); box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
             
             <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px;">
                 <div>
                    <span style="font-size: 14px; color: #777;">වයස </span>
                    <strong id="displayAge" style="font-size: 16px; color: #333;">-</strong>
                 </div>
                 <div>
                    <span style="font-size: 14px; color: #777;">BMI අගය:</span>
                    <strong id="bmiValueDisplay" style="font-size: 24px; color: #1b5e20;">0.0</strong>
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

            const updateAgeDisplay = () => {
                const dobVal = document.getElementById("bmiDOB").value;
                const examDateVal = document.getElementById("bmiExamDate").value;
                const displayEl = document.getElementById("liveAgeDisplay");

                if (!dobVal) {
                    displayEl.textContent = "";
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

                // If compareDate is earlier than DOB (invalid state usually), handle or ignore.
                if (ageYears < 0) {
                    displayEl.textContent = "Invalid Dates";
                    return;
                }

                displayEl.textContent = `වයස: අවුරුදු ${ageYears} මාස ${ageMonths}`;
            };

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

            // Set Exam Date to today by default
            const todayStr = new Date().toISOString().split('T')[0];
            document.getElementById("bmiExamDate").value = todayStr;
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
            const gender = document.querySelector('input[name="bmiGender"]:checked').value;
            const dobVal = document.getElementById("bmiDOB").value;
            const examDateVal = document.getElementById("bmiExamDate").value;
            const heightInput = document.getElementById("bmiHeight");
            const weightInput = document.getElementById("bmiWeight");

            const heightCm = parseFloat(heightInput.value);
            const weightKg = parseFloat(weightInput.value);

            if (!dobVal || !heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
                if (typeof window.showWarning === 'function') {
                    window.showWarning("කරුණාකර සියලු විස්තර නිවැරදිව ඇතුලත් කරන්න.");
                } else {
                    alert("Please fill all fields correctly.");
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
            const minNormalWeight = (limitThin * heightM * heightM).toFixed(1);
            const maxNormalWeight = (limitNormalHigh * heightM * heightM).toFixed(1);

            if (bmi < limitThin) {
                bmiStatus = "අඩු බර (Underweight)";
                bmiColor = "#d35400"; bmiBg = "#fadbd8";
                const diff = (minNormalWeight - weightKg).toFixed(1);
                weightRecommendation = `<p style="margin:5px 0 0 0; font-size:13px; color:#c0392b;">නිරෝගී බරක් වීමට <strong>${diff} kg</strong> ක් වත් වැඩි කර ගත යුතුය.<br>(ඉලක්කය: ${minNormalWeight} kg - ${maxNormalWeight} kg)</p>`;
            } else if (bmi > limitObese) {
                bmiStatus = "ස්ථුලතාවය (Obesity)";
                bmiColor = "#c0392b"; bmiBg = "#f2d7d5";
                const diff = (weightKg - maxNormalWeight).toFixed(1);
                weightRecommendation = `<p style="margin:5px 0 0 0; font-size:13px; color:#c0392b;">නිරෝගී බරක් වීමට <strong>${diff} kg</strong> ක් වත් අඩු කර ගත යුතුය.<br>(ඉලක්කය: ${minNormalWeight} kg - ${maxNormalWeight} kg)</p>`;
            } else if (bmi > limitNormalHigh) {
                bmiStatus = "අධි බර (Overweight)";
                bmiColor = "#f39c12"; bmiBg = "#fce8d6";
                const diff = (weightKg - maxNormalWeight).toFixed(1);
                weightRecommendation = `<p style="margin:5px 0 0 0; font-size:13px; color:#d35400;">නිරෝගී බරක් වීමට <strong>${diff} kg</strong> ක් වත් අඩු කර ගත යුතුය.<br>(ඉලක්කය: ${minNormalWeight} kg - ${maxNormalWeight} kg)</p>`;
            } else {
                bmiStatus = "නිරෝගී (Normal)";
                bmiColor = "#27ae60"; bmiBg = "#d5f5e3";
                weightRecommendation = `<p style="margin:5px 0 0 0; font-size:13px; color:#27ae60;">ඔබගේ බර <strong>නිවැරදි මට්ටමේ (Normal)</strong> පවතී.<br>(පරාසය: ${minNormalWeight} kg - ${maxNormalWeight} kg)</p>`;
            }

            // Height Logic
            const limitStunting = refHeight[1]; // -2SD
            let heightStatus = "", heightColor = "", heightBg = "", heightRecommendation = "";

            if (heightCm < limitStunting) {
                heightStatus = "මිටි (Stunting)";
                heightColor = "#c0392b"; heightBg = "#f2d7d5";
                const diff = (limitStunting - heightCm).toFixed(1);
                heightRecommendation = `<p style="margin:5px 0 0 0; font-size:13px; color:#c0392b;">සාමාන්‍ය උස මට්ටමට ළඟා වීමට තව <strong>${diff} cm</strong> ක් අවශ්‍ය වේ.<br>(අවම සාමාන්‍ය උස: ${limitStunting} cm)</p>`;
            } else {
                heightStatus = "සාමාන්‍ය උස (Normal)";
                heightColor = "#27ae60"; heightBg = "#d5f5e3";
                heightRecommendation = `<p style="margin:5px 0 0 0; font-size:13px; color:#27ae60;">උස සාමාන්‍ය මට්ටමේ පවතී.</p>`;
            }

            // Render Results
            document.getElementById("bmiResult").style.display = "block";
            document.getElementById("displayAge").textContent = displayAgeStr;
            document.getElementById("bmiValueDisplay").textContent = bmiFixed;

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

            // Common config
            const commonConfig = { pointRadius: 0, borderWidth: 1.5, tension: 0.4 };

            bmiChartInstance = new Chart(ctxBMI, {
                type: 'line',
                data: {
                    labels: ages,
                    datasets: [
                        { label: 'You', data: [{ x: currentAge, y: currentBMI }], type: 'scatter', backgroundColor: '#0000FF', borderColor: '#fff', borderWidth: 2, pointRadius: 8, order: 0 },
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
                        x: { type: 'linear', min: 5, max: 19, title: { display: true, text: 'Age (Years)' } },
                        // Y-axis fixed to NOT start at zero, giving expanded view
                        y: {
                            title: { display: true, text: 'BMI' },
                            beginAtZero: false,
                            grace: '10%'
                        }
                    },
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
                }
            });

            heightChartInstance = new Chart(ctxHeight, {
                type: 'line',
                data: {
                    labels: ages,
                    datasets: [
                        { label: 'You', data: [{ x: currentAge, y: currentHeight }], type: 'scatter', backgroundColor: '#0000FF', borderColor: '#fff', borderWidth: 2, pointRadius: 8, order: 0 },
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
                        x: { type: 'linear', min: 5, max: 19, title: { display: true, text: 'Age (Years)' } },
                        // Y-axis fixed to NOT start at zero
                        y: {
                            title: { display: true, text: 'Height (cm)' },
                            beginAtZero: false,
                            grace: '10%'
                        }
                    },
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
                }
            });
        }
    };
})();
