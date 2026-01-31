
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
            <div class="dashboard-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                <div>
                    <h2>Immunization Dashboard</h2>
                    <p style="color: #666;">Overview of immunization progress (school register).</p>
                </div>
                <div style="display:flex; align-items:center; gap:10px; background:#fff; padding:10px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
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
                <div style="border: 2px solid #ddd; border-radius: 15px; padding: 20px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <h2 style="text-align: center; margin-bottom: 30px; font-weight: bold; color: #333; text-transform: uppercase; border-bottom: 2px solid #eee; padding-bottom: 10px;">Immunization Data</h2>

                    <!-- aTd Section -->
                    <div class="chart-section" style="margin-bottom: 30px;">
                        <h3 style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; color:#555;">aTd</h3>
                        <div class="cards" style="grid-template-columns: 1fr 2fr; gap: 15px;">
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
                        <div class="cards" style="grid-template-columns: 1fr 2fr; gap: 15px;">
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
                        <div class="cards" style="grid-template-columns: 1fr 2fr; gap: 15px;">
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

            // Remove loading
            document.getElementById('dashboard-loading').style.display = 'none';
            document.getElementById('dashboard-content').style.display = 'block';

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

                // Standard Target Check (Grade)
                // Note: For catch-up (Grade 7 HPV), we handle separately below?
                // The prompt specifically asks about the standard flow first.
                // Let's stick to standard grade check first.
                if (projGrade !== targetGrade && !(type.startsWith('hpv') && projGrade === 7)) return false;

                // Status Handling
                if (s.status === 'Active') {
                    // Scenario: Transferred In.
                    // Request: If arrived with vaccine (Completed), do NOT add to Target.

                    if (type === 'hpv1' && s.hpv1 === 'Completed') return false;
                    if (type === 'hpv2' && s.hpv2 === 'Completed') return false;

                    // Otherwise -> Include
                    // But for HPV Catchup (Gr 7)?
                    if (type.startsWith('hpv') && projGrade === 7) {
                        // Catchup logic: If they need it.
                        // If they have it 'Completed' (Transfer), they don't need it -> Exclude
                        const val = s[type];
                        if (val === 'Completed') return false; // Don't target if already done historically
                        if (!val) return true; // Missing -> Target
                        // If date exists?
                        const dYear = new Date(val).getFullYear();
                        if (dYear === year) return true; // Done this year -> Target
                        return false;
                    }

                    return true;
                }

                if (s.status === 'Left') {
                    // Scenario: Transferred Out
                    // Request: "HPV-1 on roll (target) unchange, remove from HPV-2 only"

                    // Check if they left THIS year or later (were present during year)
                    const leftYear = s.leftYear || 9999;
                    if (leftYear < year) return false; // Left long ago

                    if (type === 'hpv1') {
                        // Keep in HPV1 Target
                        return true;
                    }
                    if (type === 'hpv2') {
                        // Remove from HPV2 Target
                        return false;
                    }
                    if (type === 'atd') {
                        // Request: "aTd target වලින් අදාළ වර්ෂයට target එකෙන් ඉවත් කල යුතුයි"
                        // Remove from aTd Target
                        return false;
                    }
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
