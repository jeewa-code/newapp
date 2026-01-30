// keysTab.js - UPDATED for Firebase Real-time Sync & Admin Permissions
(function () {
    "use strict";

    // In-memory data
    let dutiesData = [];
    let unsubscribe = null;

    // Default data structure (fallback)
    const DEFAULT_DUTIES = [
        {
            id: 1,
            mainDuty: "Housing and sanitation",
            subDuties: [
                "No. of Houses Newly registered",
                "Home visits (other than Dengue control activities)",
                "No. of houses with sanitary latrine",
                "No. of houses with unsanitary latrine",
                "No. of houses without latrines",
                "No. of newly constructed latrine - Water seal",
                "No. of newly constructed latrine - Other",
                "No. of inspection for building application - New",
                "No. of inspection for building application - Other"
            ]
        },
        {
            id: 2,
            mainDuty: "Water sanitation",
            subDuties: [
                "No. of water samples taken - Private Bacteriological",
                "No. of water samples taken - Private Chemical",
                "No. of water samples taken - Common Bacteriological",
                "No. of water samples taken - Common Chemical",
                "No. of common water supplies inspected",
                "No. of private water supplies/wells inspected",
                "No. of wells chlorinated",
                "No. of water samples tested for residual chlorine"
            ]
        },
        {
            id: 3,
            mainDuty: "Food health",
            subDuties: [
                "Frequency of inspection of food handling establishments",
                "Food factories inspections",
                "Bakeries inspections",
                "Hotels/Restaurants inspections",
                "Tea/Coffee & Snack bars inspections",
                "Super markets inspections",
                "Groceries inspections",
                "Other food establishments inspections",
                "School Midday meal in school",
                "School Midday meal in Supplier",
                "No. of prosecuted under the food hygiene regulation",
                "No. of Convicted",
                "Institutions inspected for annual trade licenses",
                "Institutions inspected for business registration"
            ]
        },
        {
            id: 4,
            mainDuty: "Food samples",
            subDuties: [
                "No. of food samples taken - Formal Bacteriological",
                "No. of food samples taken - Formal Chemical",
                "No. of food samples taken - Informal Bacteriological",
                "No. of food samples taken - Informal Chemical",
                "No. of analyst reports received",
                "No. of unsatisfactory reports",
                "No. of prosecuted",
                "No. of convicted",
                "No. of reports pending"
            ]
        },
        {
            id: 5,
            mainDuty: "Food raids",
            subDuties: [
                "No. of food raids conducted",
                "No. of establishments inspected during the raid",
                "No. of seized items",
                "No. of destroyed items",
                "No. of prosecuted",
                "No. of convicted",
                "Cases to be heard in the future",
                "Total fines collected under the food act"
            ]
        },
        {
            id: 6,
            mainDuty: "Slaughterhouse",
            subDuties: [
                "No. of animals passed for slaughter",
                "No. of meat stalls inspected"
            ]
        },
        {
            id: 7,
            mainDuty: "Occupational Health",
            subDuties: [
                "Factories/Trade institutions - No. of inspections",
                "Factories/Trade institutions - No. of Awareness Programs",
                "Factories/Trade institutions - No. of Service Programs",
                "Estate sanitation - No. of inspections",
                "Estate sanitation - No. of Awareness Programs",
                "Estate sanitation - No. of Service Programs",
                "No. of visits to public institutions"
            ]
        },
        {
            id: 8,
            mainDuty: "School Health",
            subDuties: [
                "No. of total visits to school",
                "No. of school sanitary surveys done",
                "No. of school arranged for SMI",
                "No. of School medical inspections done",
                "No. of children vaccinated - aTd",
                "No. of children vaccinated - HPV 1",
                "No. of children vaccinated - HPV 2",
                "No. of children vaccinated - Other",
                "No. of follow up visits - to school",
                "No. of follow up visits - to home"
            ]
        },
        {
            id: 9,
            mainDuty: "Control of communicable diseases",
            subDuties: [
                "No. of ID notifications received",
                "No. of causes detected PHI/other sources",
                "No. of causes investigated",
                "No. of causes conformed",
                "No. of persons vaccinated (Non students)"
            ]
        },
        {
            id: 10,
            mainDuty: "Mosquito control activities",
            subDuties: [
                "No. of places inspected by PHI",
                "No. of places inspected by others",
                "No. of places possible mosquito breeding",
                "No. of identified mosquito breeding places",
                "No. of corrected breeding places",
                "No. of spot fines",
                "No. of prosecuted",
                "No. of convicted",
                "Total fines collected under the mosquito control activities"
            ]
        },
        {
            id: 11,
            mainDuty: "Rabies control activities",
            subDuties: [
                "No. of dogs vaccinated",
                "No. of dogs sterilized"
            ]
        },
        {
            id: 12,
            mainDuty: "Control of NCD",
            subDuties: [
                "No. of programs conducted NCD",
                "No. of NCD causes identified"
            ]
        },
        {
            id: 13,
            mainDuty: "Control of environmental pollution",
            subDuties: [
                "No. of public complaints received",
                "No. of investigated cases",
                "No. of problem situations settled",
                "No. of problem corrected",
                "No. of referrals to other institutions",
                "No. of notices given",
                "No. of prosecuted",
                "No. of convicted",
                "Fines collected (Rs.)",
                "No. of factories inspected for EPL"
            ]
        },
        {
            id: 14,
            mainDuty: "Health Education & Health promotion activities",
            subDuties: [
                "School - No. of programs",
                "School - No. of participants",
                "Food handlers - No. of programs",
                "Food handlers - No. of participants",
                "Volunteers - No. of programs",
                "Volunteers - No. of participants",
                "Institutions - No. of programs",
                "Institutions - No. of participants",
                "Other - No. of programs",
                "Other - No. of participants"
            ]
        },
        {
            id: 15,
            mainDuty: "Visits to other institutions",
            subDuties: [
                "Medical institutions visits",
                "Welfare centers visits",
                "Other institutions visits"
            ]
        },
        {
            id: 16,
            mainDuty: "Legal proceedings",
            subDuties: [
                "Total no. of visits to courts for legal proceedings",
                "Total no. of fines collected"
            ]
        }
    ];

    // Initialize with local data (fallback until sync)
    // We initially check localStorage just in case we need to migrate it.
    const local = localStorage.getItem('phi_duties_data');
    if (local) {
        try {
            dutiesData = JSON.parse(local);
        } catch (e) {
            dutiesData = DEFAULT_DUTIES;
        }
    } else {
        dutiesData = DEFAULT_DUTIES;
    }


    // INIT: Subscribe to Firebase if service is available
    function initFirebaseSync() {
        if (window.DirectFirebaseService) {
            console.log('[keysTab] Initializing Firebase Subscription...');

            unsubscribe = window.DirectFirebaseService.subscribe('phi_duties', (data) => {
                if (data && Array.isArray(data) && data.length > 0) {
                    console.log('[keysTab] Received update from Firebase', data.length);
                    dutiesData = data;
                } else {
                    // Firebase is empty. Check if we have local data to MIGRATE.
                    console.log('[keysTab] No data in Firebase.');
                    const localM = localStorage.getItem('phi_duties_data');
                    if (localM) {
                        try {
                            const parsed = JSON.parse(localM);
                            if (parsed.length > 0) {
                                console.log('[keysTab] Migrating local data to Firebase...');
                                saveData(parsed); // Save local data to cloud
                                dutiesData = parsed; // Use it now
                            } else {
                                // Local is empty too, use default?
                                // Only save defaults if explicitly requested or if we want to bootstrap
                                // Let's not overwrite cloud with defaults automatically unless it's null
                                console.log('[keysTab] Using defaults locally.');
                                dutiesData = DEFAULT_DUTIES;
                            }
                        } catch (e) {
                            dutiesData = DEFAULT_DUTIES;
                        }
                    } else {
                        // No local data, no cloud data. Use Defaults.
                        // Optionally save defaults to cloud?
                        dutiesData = DEFAULT_DUTIES;
                    }
                }

                // Refresh UI if visible
                const container = document.getElementById('dutiesTableContainer');
                if (container) {
                    container.innerHTML = renderDutiesTable();
                }
            });
        }
    }

    // Try to init (might need delay if DirectFirebaseService loads async)
    if (window.DirectFirebaseService) {
        initFirebaseSync();
    } else {
        setTimeout(initFirebaseSync, 1000);
    }

    async function saveData(dataToSave) {
        const data = dataToSave || dutiesData;
        if (window.DirectFirebaseService) {
            try {
                await window.DirectFirebaseService.save('phi_duties', data);
                console.log('[keysTab] Saved to Firebase');
                // We don't remove localStorage yet, as backup? 
                // Or maybe update it too for offline?
                // pocketNoteEntry keeps local cache in window, let's just stick to memory + sync
            } catch (err) {
                console.error('[keysTab] Save error:', err);
                showError('Error saving to cloud');
            }
        } else {
            console.warn('[keysTab] Offline save (localStorage)');
            localStorage.setItem('phi_duties_data', JSON.stringify(data));
        }
    }

    window.renderKeysTab = function (container) {
        // SECURITY CHECK: Only show if Admin
        if (window.currentUserRole !== 'admin') {
            container.innerHTML = `
                <div class="glass" style="padding: 20px; text-align: center; color: #dc3545;">
                    <h3><i class="fas fa-lock"></i> Access Denied</h3>
                    <p>Only Administrators can manage Activity Keys.</p>
                </div>
            `;
            return;
        }

        console.log('Rendering Keys Tab with data:', dutiesData.length);

        container.innerHTML = `
            <div class="glass" style="padding: 20px;">
                <h3 style="color: var(--primary); margin-bottom: 20px;">Keys Management - Main & Sub Duties</h3>
                
                <!-- Debug info -->
                <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; font-size: 12px; border-left: 4px solid var(--primary);">
                    <strong>Cloud Sync:</strong> ${window.DirectFirebaseService ? '<span style="color:green">Active</span>' : '<span style="color:red">Inactive</span>'} | 
                    <strong>Items:</strong> ${dutiesData.length}
                    <div style="float:right">
                         <button onclick="saveKeysManually()" style="padding: 4px 8px; background: #0b5ea8; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">Force Save</button>
                         <button onclick="resetToDefault()" style="margin-left: 5px; padding: 4px 8px; background: #ffc107; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">Reset Defaults</button>
                    </div>
                </div>
                
                <!-- Add Main Duty Form -->
                <div style="margin-bottom: 30px; padding: 15px; background: rgba(255,255,255,0.5); border-radius: 8px;">
                    <h4 style="margin-bottom: 15px;">Add Main Duty</h4>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="mainDutyInput" placeholder="Enter main duty" 
                               style="flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;">
                        <button onclick="addMainDuty()" 
                                style="background: var(--primary); color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
                            Add Main Duty
                        </button>
                    </div>
                </div>

                <!-- Duties Table -->
                <div id="dutiesTableContainer">
                    ${renderDutiesTable()}
                </div>
            </div>
        `;
    };

    function renderDutiesTable() {
        if (!dutiesData || dutiesData.length === 0) {
            return `<div style="text-align: center; color: #666; padding: 40px; background: white; border-radius: 8px;">
                        <h4>No duties found</h4>
                        <p>Click "Reset Defaults" to load standard list.</p>
                    </div>`;
        }

        let tableHTML = `
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 12px; text-align: left; width: 10%;">No</th>
                        <th style="padding: 12px; text-align: left; width: 30%;">Main Duty</th>
                        <th style="padding: 12px; text-align: left; width: 60%;">Sub Duties</th>
                    </tr>
                </thead>
                <tbody>
        `;

        dutiesData.forEach((duty, index) => {
            tableHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px; font-weight: bold; vertical-align: top;">${(index + 1).toString().padStart(2, '0')}</td>
                    <td style="padding: 12px; vertical-align: top;">
                        <div style="display: flex; align-items: flex-start; gap: 8px;">
                            <span style="flex: 1; cursor: pointer; padding: 8px; border-radius: 4px; border: 1px solid transparent;" 
                                  onmouseover="this.style.backgroundColor='#f8f9fa'" 
                                  onmouseout="this.style.backgroundColor='transparent'"
                                  onclick="startEditMainDuty(${duty.id}, this)">${escapeHtml(duty.mainDuty)}</span>
                            <button onclick="deleteMainDuty(${duty.id})" 
                                    style="background: var(--danger); color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 4px;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                    <td style="padding: 12px; vertical-align: top;">
                        ${renderSubDuties(duty)}
                    </td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        return tableHTML;
    }

    function renderSubDuties(duty) {
        let subDutiesHTML = duty.subDuties.map((subDuty, subIndex) => `
            <div style="display: flex; align-items: left; gap: 8px; margin-bottom: 5px; padding: 5px; background: #f8f9fa; border-radius: 4px;">
                <span style="color: #333; flex: 1; cursor: pointer; padding: 4px 8px; border-radius: 3px; text-align: left;" 
                      onclick="startEditSubDuty(${duty.id}, ${subIndex}, this)">${escapeHtml(subDuty)}</span>
                <button onclick="deleteSubDuty(${duty.id}, ${subIndex})" 
                        style="background: #dc3545; color: white; border: none; border-radius: 3px; padding: 4px 8px; cursor: pointer; font-size: 10px; display: flex; align-items: center; gap: 2px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        return `
            <div>
                ${subDutiesHTML}
                <div style="display: flex; gap: 8px; margin-top: 10px;">
                    <input type="text" id="subDutyInput_${duty.id}" 
                           placeholder="Add sub duty" 
                           style="flex: 1; padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                    <button onclick="addSubDuty(${duty.id})" 
                            style="background: #28a745; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 4px;">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            </div>
        `;
    }

    // Global functions
    window.addMainDuty = function () {
        const input = document.getElementById('mainDutyInput');
        const mainDuty = input.value.trim();

        if (!mainDuty) {
            showError('Please enter a main duty');
            return;
        }

        const newDuty = {
            id: Date.now(),
            mainDuty: mainDuty,
            subDuties: []
        };

        dutiesData.push(newDuty);
        saveData();
        input.value = '';

        // Refresh table
        document.getElementById('dutiesTableContainer').innerHTML = renderDutiesTable();
    };

    window.startEditMainDuty = function (dutyId, element) {
        const duty = dutiesData.find(d => d.id === dutyId);
        if (!duty) return;

        const currentText = duty.mainDuty;
        element.outerHTML = `
            <div style="flex: 1; display: flex; gap: 8px;">
                <input type="text" id="editMainDuty_${dutyId}" 
                       value="${escapeHtml(currentText)}"
                       style="flex: 1; padding: 6px 10px; border: 1px solid var(--primary); border-radius: 4px; font-size: 14px;">
                <button onclick="saveMainDuty(${dutyId})" 
                        style="background: #28a745; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-size: 12px;">
                    Save
                </button>
                <button onclick="cancelEditMainDuty(${dutyId}, '${escapeHtml(currentText)}')" 
                        style="background: #6c757d; color: white; border: none; border-radius: 4px; padding: 6px 12px; cursor: pointer; font-size: 12px;">
                    Cancel
                </button>
            </div>
        `;

        // Focus on the input field
        const input = document.getElementById(`editMainDuty_${dutyId}`);
        if (input) {
            input.focus();
            input.select();
        }
    };

    window.saveMainDuty = function (dutyId) {
        const input = document.getElementById(`editMainDuty_${dutyId}`);
        const newMainDuty = input.value.trim();

        if (!newMainDuty) {
            showError('Main duty cannot be empty');
            return;
        }

        const duty = dutiesData.find(d => d.id === dutyId);
        if (duty) {
            duty.mainDuty = newMainDuty;
            saveData();
            document.getElementById('dutiesTableContainer').innerHTML = renderDutiesTable();
        }
    };

    window.cancelEditMainDuty = function (dutyId, originalText) {
        document.getElementById('dutiesTableContainer').innerHTML = renderDutiesTable();
    };

    window.deleteMainDuty = async function (dutyId) {
        if (await showConfirm('Are you sure you want to delete this main duty and all its sub duties?')) {
            dutiesData = dutiesData.filter(d => d.id !== dutyId);
            saveData();
            document.getElementById('dutiesTableContainer').innerHTML = renderDutiesTable();
        }
    };

    window.addSubDuty = function (dutyId) {
        const input = document.getElementById(`subDutyInput_${dutyId}`);
        const subDuty = input.value.trim();

        if (!subDuty) {
            showError('Please enter a sub duty');
            return;
        }

        const duty = dutiesData.find(d => d.id === dutyId);
        if (duty) {
            duty.subDuties.push(subDuty);
            saveData();
            input.value = '';
            document.getElementById('dutiesTableContainer').innerHTML = renderDutiesTable();
        }
    };

    window.startEditSubDuty = function (dutyId, subIndex, element) {
        const duty = dutiesData.find(d => d.id === dutyId);
        if (!duty || !duty.subDuties[subIndex]) return;

        const currentText = duty.subDuties[subIndex];
        element.outerHTML = `
            <div style="flex: 1; display: flex; gap: 8px;">
                <input type="text" id="editSubDuty_${dutyId}_${subIndex}" 
                       value="${escapeHtml(currentText)}"
                       style="flex: 1; padding: 4px 8px; border: 1px solid var(--primary); border-radius: 3px; font-size: 12px;">
                <button onclick="saveSubDuty(${dutyId}, ${subIndex})" 
                        style="background: #28a745; color: white; border: none; border-radius: 3px; padding: 4px 8px; cursor: pointer; font-size: 10px;">
                    Save
                </button>
                <button onclick="cancelEditSubDuty(${dutyId}, ${subIndex}, '${escapeHtml(currentText)}')" 
                        style="background: #6c757d; color: white; border: none; border-radius: 3px; padding: 4px 8px; cursor: pointer; font-size: 10px;">
                    Cancel
                </button>
            </div>
        `;

        const input = document.getElementById(`editSubDuty_${dutyId}_${subIndex}`);
        if (input) {
            input.focus();
            input.select();
        }
    };

    window.saveSubDuty = function (dutyId, subIndex) {
        const input = document.getElementById(`editSubDuty_${dutyId}_${subIndex}`);
        const newSubDuty = input.value.trim();

        if (!newSubDuty) {
            showError('Sub duty cannot be empty');
            return;
        }

        const duty = dutiesData.find(d => d.id === dutyId);
        if (duty && duty.subDuties[subIndex]) {
            duty.subDuties[subIndex] = newSubDuty;
            saveData();
            document.getElementById('dutiesTableContainer').innerHTML = renderDutiesTable();
        }
    };

    window.cancelEditSubDuty = function (dutyId, subIndex, originalText) {
        document.getElementById('dutiesTableContainer').innerHTML = renderDutiesTable();
    };

    window.deleteSubDuty = async function (dutyId, subIndex) {
        const duty = dutiesData.find(d => d.id === dutyId);
        if (duty && duty.subDuties[subIndex]) {
            if (await showConfirm('Are you sure you want to delete this sub duty?')) {
                duty.subDuties.splice(subIndex, 1);
                saveData();
                document.getElementById('dutiesTableContainer').innerHTML = renderDutiesTable();
            }
        }
    };

    window.resetToDefault = async function () {
        if (await showConfirm('Are you sure you want to reset to default duties? This will replace all current data locally and in cloud.')) {
            dutiesData = DEFAULT_DUTIES;
            saveData();
            document.getElementById('dutiesTableContainer').innerHTML = renderDutiesTable();
        }
    };

    window.saveKeysManually = function () {
        saveData();
        showSuccess('Keys saved to Cloud');
    };

    window.clearAllData = async function () {
        if (await showConfirm('Are you sure you want to clear all data?')) {
            dutiesData = [];
            saveData();
            document.getElementById('dutiesTableContainer').innerHTML = renderDutiesTable();
        }
    };

    // Public getter
    window.getDutiesData = function () {
        return dutiesData;
    };

    function escapeHtml(text) {
        if (text == null) return "";
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

})();