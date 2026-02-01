
import { getAllData } from './services/dataService.js';

// Dashboard Module
(function () {
    "use strict";

    // Store chart instances to destroy/update them
    const charts = {};

    // Attach to window for global access
    window.renderDashboard = async function (containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const currentSystemYear = new Date().getFullYear(); // e.g. 2026
        const defaultYear = currentSystemYear;

        // Render basic structure with Year Selector
        container.innerHTML = `
            <style>
                .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
                .dash-filter-box { display:flex; align-items:center; gap:10px; background:#fff; padding:10px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1); }
                .dash-main-card { border: 2px solid #ddd; border-radius: 15px; padding: 20px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .chart-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 15px; }
                
                canvas { max-width: 100% !important; }
                
                @media (max-width: 600px) {
                    .dash-header { flex-direction: column; text-align: center; }
                    .dash-filter-box { width: 100%; justify-content: center; box-sizing: border-box; }
                    .dash-main-card { padding: 10px; border-width: 1px; }
                    .chart-grid { grid-template-columns: 1fr; }
                    .chart-card { margin-bottom: 10px; }
                    h2 { font-size: 1.2rem; }
                    h3 { font-size: 1rem; }
                }

                @media (max-width: 350px) {
                    .dash-main-card { padding: 5px; }
                    .chart-card { padding: 5px; }
                    h4 { font-size: 12px; }
                }
            </style>
            <div class="dash-header">
                <div>
                    <h2>Immunization Dashboard</h2>
                    <p style="color: #666;">Overview of immunization progress (school register).</p>
                </div>
                <div class="dash-filter-box">
                    <label style="font-weight:bold; color:#333;">Filter Year:</label>
                    <select id="dash_year_select" style="padding:5px 10px; border-radius:4px; border:1px solid #ccc; font-size:16px; min-width:100px;">
                        <!-- Options populated below -->
                    </select>
                </div>
            </div>

            <div id="dashboard-loading" style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <p>Loading data...</p>
            </div>

            <div id="dashboard-content" style="display: none;">
                <div class="dash-main-card">
                    <h2 style="text-align: center; margin-bottom: 30px; font-weight: bold; color: #333; text-transform: uppercase; border-bottom: 2px solid #eee; padding-bottom: 10px;">Immunization Data</h2>

                    <!-- aTd Section -->
                    <div class="chart-section" style="margin-bottom: 30px;">
                        <h3 style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; color:#555;">aTd</h3>
                        <div class="cards chart-grid">
                            <div class="card chart-card" style="background: linear-gradient(145deg, #1a1a1a, #222); padding: 10px;">
                                <h4 id="lbl_atd_prev" style="margin: 0 0 5px 0; color: #fff; font-size: 14px;">Prev Year</h4>
                                <div style="height: 180px; position: relative;">
                                    <canvas id="chart_atd_prev"></canvas>
                                </div>
                            </div>
                            <div class="card chart-card" style="background: linear-gradient(145deg, #1a1a1a, #222); padding: 10px;">
                                <h4 id="lbl_atd_curr" style="margin: 0 0 5px 0; color: #fff; font-size: 14px;">Curr Year</h4>
                                <div style="height: 180px; position: relative;">
                                    <canvas id="chart_atd_curr"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- HPV 1 Section -->
                    <div class="chart-section" style="margin-bottom: 30px;">
                        <h3 style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; color:#555;">HPV 1</h3>
                        <div class="cards chart-grid">
                            <div class="card chart-card" style="background: linear-gradient(145deg, #1a1a1a, #222); padding: 10px;">
                                <h4 id="lbl_hpv1_prev" style="margin: 0 0 5px 0; color: #fff; font-size: 14px;">Prev Year</h4>
                                <div style="height: 180px; position: relative;">
                                    <canvas id="chart_hpv1_prev"></canvas>
                                </div>
                            </div>
                            <div class="card chart-card" style="background: linear-gradient(145deg, #1a1a1a, #222); padding: 10px;">
                                <h4 id="lbl_hpv1_curr" style="margin: 0 0 5px 0; color: #fff; font-size: 14px;">Curr Year</h4>
                                <div style="height: 180px; position: relative;">
                                    <canvas id="chart_hpv1_curr"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- HPV 2 Section -->
                    <div class="chart-section" style="margin-bottom: 10px;">
                        <h3 style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; color:#555;">HPV 2</h3>
                        <div class="cards chart-grid">
                            <div class="card chart-card" style="background: linear-gradient(145deg, #1a1a1a, #222); padding: 10px;">
                                <h4 id="lbl_hpv2_prev" style="margin: 0 0 5px 0; color: #fff; font-size: 14px;">Prev Year</h4>
                                <div style="height: 180px; position: relative;">
                                    <canvas id="chart_hpv2_prev"></canvas>
                                </div>
                            </div>
                            <div class="card chart-card" style="background: linear-gradient(145deg, #1a1a1a, #222); padding: 10px;">
                                <h4 id="lbl_hpv2_curr" style="margin: 0 0 5px 0; color: #fff; font-size: 14px;">Curr Year</h4>
                                <div style="height: 180px; position: relative;">
                                    <canvas id="chart_hpv2_curr"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Populate Year Select
        const yearSelect = document.getElementById('dash_year_select');
        for (let y = currentSystemYear - 4; y <= currentSystemYear + 1; y++) {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            if (y === defaultYear) opt.selected = true;
            yearSelect.appendChild(opt);
        }

        try {
            // Fetch data once
            const studentData = await getAllData('schoolImmunizationStudents');

            const loadingEl = document.getElementById('dashboard-loading');
            const contentEl = document.getElementById('dashboard-content');

            // If user navigated away, these might be missing
            if (!loadingEl || !contentEl) return;

            // Remove loading
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';

            // Check if Chart.js is loaded
            if (typeof Chart === 'undefined') {
                container.innerHTML += '<p style="color:red; text-align:center;">Chart.js library is missing.</p>';
                return;
            }

            // Function to update view
            const updateView = (selectedYear) => {
                const prevYear = selectedYear - 1;
                const currYear = selectedYear;

                // Update Labels
                ['atd', 'hpv1', 'hpv2'].forEach(t => {
                    document.getElementById(`lbl_${t}_prev`).textContent = prevYear;
                    document.getElementById(`lbl_${t}_curr`).textContent = currYear;
                });

                // Process Data
                const datasets = {
                    atd: processData(studentData, 'atd', prevYear, currYear, false, 7), // aTd: Grade 7, All
                    hpv1: processData(studentData, 'hpv1', prevYear, currYear, true, 6), // HPV1: Grade 6, Female
                    hpv2: processData(studentData, 'hpv2', prevYear, currYear, true, 6)  // HPV2: Grade 6, Female
                };

                // Render Charts
                renderChart('chart_atd_prev', datasets.atd.prev, 'aTd');
                renderChart('chart_atd_curr', datasets.atd.curr, 'aTd');

                renderChart('chart_hpv1_prev', datasets.hpv1.prev, 'HPV 1');
                renderChart('chart_hpv1_curr', datasets.hpv1.curr, 'HPV 1');

                renderChart('chart_hpv2_prev', datasets.hpv2.prev, 'HPV 2');
                renderChart('chart_hpv2_curr', datasets.hpv2.curr, 'HPV 2');
            };

            // Bind Event
            yearSelect.addEventListener('change', () => {
                updateView(parseInt(yearSelect.value));
            });

            // Initial Render
            updateView(defaultYear);

        } catch (err) {
            console.error(err);
            document.getElementById('dashboard-loading').innerHTML = `<p style="color:red">Failed to load data: ${err.message}</p>`;
        }
    };

    /**
     * Process data for a vaccine type
     * @param {Array} data - Raw student data
     * @param {string} type - 'atd', 'hpv1', 'hpv2'
     * @param {number} pYear - Previous Year (Simple Summary)
     * @param {number} cYear - Current Year (Quarterly)
     * @param {boolean} femaleOnly - Filter for females
     * @param {number} targetGrade - The grade to consider for the Target (e.g. 7 for aTd, 6 for HPV)
     */
    function processData(data, type, pYear, cYear, femaleOnly, targetGrade) {

        // Helper: Calculate Target Count for a specific year
        const getTargetCount = (year) => {
            return data.filter(s => {
                if (femaleOnly && s.sex !== 'Female') return false;

                // Calculate projected grade
                const projGrade = s.gradeNo + (year - s.year);

                // Standard Target Check (Grade) & Catchup (HPV Gr 7)
                if (projGrade !== targetGrade && !(type.startsWith('hpv') && projGrade === 7)) return false;

                // Determine 'Done Here' vs 'Done Elsewhere'
                const val = s[type];
                const isDoneHere = val && val !== 'Completed';
                const isImported = val === 'Completed';

                // Status Handling
                if (s.status === 'Active') {
                    // Include if NOT Imported (Done elsewhere).
                    // If Imported, they are not our target for THIS vaccine (already done).
                    if (isImported) return false;
                    return true;
                }
                else if (s.status === 'Left') {
                    // Check if they left THIS year or later (were present during year)
                    const leftYear = s.leftYear || 9999;
                    if (leftYear < year) return false; // Left in previous years -> Not relevant

                    // ONLY Include if they were vaccinated HERE before leaving.
                    // If they left without vaccine, they are effectively removed from our target.
                    if (isDoneHere) return true;
                    return false;
                }

                return false;
            }).length;
        };

        const targetCountPrev = getTargetCount(pYear);
        const targetCountCurr = getTargetCount(cYear);

        // Calculate Immunized Counts for each year (simple date logic)
        let prevImmunized = 0;
        let q1 = 0, q2 = 0, q3 = 0, q4 = 0;

        data.forEach(s => {
            if (femaleOnly && s.sex !== 'Female') return; // Basic gender filter

            const dateStr = s[type];
            if (dateStr) {
                const d = new Date(dateStr);
                const y = d.getFullYear();

                if (y === pYear) {
                    prevImmunized++;
                } else if (y === cYear) {
                    const m = d.getMonth(); // 0-11
                    if (m < 3) q1++;
                    else if (m < 6) q2++;
                    else if (m < 9) q3++;
                    else q4++;
                }
            }
        });

        return {
            prev: {
                labels: ['Target', 'No. Immunized'],
                data: [targetCountPrev, prevImmunized],
                colors: ['#cc0000', '#000000']
            },
            curr: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Target'],
                data: [q1, q2, q3, q4, targetCountCurr],
                colors: ['#000000', '#000000', '#000000', '#000000', '#cc0000']
            }
        };
    }

    function renderChart(canvasId, dataset, label) {
        const ctx = document.getElementById(canvasId).getContext('2d');

        // Destroy existing if any
        if (charts[canvasId]) {
            charts[canvasId].destroy();
        }

        // Custom plugin to draw values on top of bars
        const valuePlugin = {
            id: 'valuePlugin',
            afterDatasetsDraw: (chart) => {
                const { ctx } = chart;
                chart.data.datasets.forEach((dataset, i) => {
                    const meta = chart.getDatasetMeta(i);
                    meta.data.forEach((bar, index) => {
                        const value = dataset.data[index];
                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 11px Poppins';
                        ctx.textAlign = 'center';
                        ctx.fillText(value, bar.x, bar.y - 10);
                    });
                });
            }
        };

        charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dataset.labels,
                datasets: [{
                    label: label,
                    data: dataset.data,
                    backgroundColor: dataset.colors,
                    borderColor: 'transparent',
                    borderWidth: 0,
                    barPercentage: 0.6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 500
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff',
                            font: { size: 10 }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#fff',
                            font: { size: 10 }
                        }
                    }
                },
                layout: {
                    padding: {
                        top: 20
                    }
                }
            },
            plugins: [valuePlugin]
        });
    }

})();
