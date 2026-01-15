// pocketNoteCarousel.js - UPDATED with black text for labels and Sunday handling
window.renderPNBCarousel = function (containerId, initialDate = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const notes = getPocketNotes();

    // If no notes AND no initial date, show empty state
    if (notes.length === 0 && !initialDate) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; background: white; border-radius: 10px;">
                <div style="margin-bottom: 20px;">
                     <button id="calendarIconEmpty" style="background: #1b5e20; color: white; border: none; padding: 12px 24px; 
                            border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-weight: bold;">
                        <i class="fas fa-calendar-alt"></i>
                        දින දර්ශනයෙන් දිනයක් තෝරන්න
                    </button>
                </div>
                <i class="fas fa-book-open" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                <h3 style="color: #666;">සටහන් නැත</h3>
                <p>මෙතෙක් සුරක්ෂිත කරන ලද සටහන් නොමැත. ඉහත බොත්තම මගින් දින දර්ශනය විවෘත කර දිනයක් තෝරන්න.</p>
            </div>
        `;

        document.getElementById('calendarIconEmpty').addEventListener('click', () => {
            // Create a dummy modal for empty state since regular one isn't rendered yet
            container.innerHTML += `
                <div id="calendarModal" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
                    <div style="background: white; padding: 20px; border-radius: 10px; max-width: 90%; max-height: 90%; overflow: auto; position: relative;">
                        <button id="closeCalendar" style="position: absolute; top: 10px; right: 10px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">×</button>
                        <div id="calendarContent"></div>
                    </div>
                </div>
            `;
            const year = new Date().getFullYear();
            const month = new Date().getMonth() + 1;
            document.getElementById('calendarContent').innerHTML = renderCalendarView(year, month, []);
            document.getElementById('closeCalendar').addEventListener('click', () => {
                renderPNBCarousel(containerId);
            });
        });
        return;
    }

    // Sort notes by date
    notes.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Generate complete timeline with missing dates
    const timeline = generateTimelineWithMissingDates(notes, initialDate);

    // Get unique years and months for filters
    const dateFilters = getDateFilters(notes);

    // Find current date index - START WITH TARGET DATE
    const targetDateStr = initialDate || new Date().toISOString().split('T')[0];
    let currentIndex = timeline.findIndex(item => item.date === targetDateStr);

    if (currentIndex === -1) {
        // If target date not found, find the closest date
        const targetDateObj = new Date(targetDateStr);
        for (let i = timeline.length - 1; i >= 0; i--) {
            const itemDate = new Date(timeline[i].date);
            if (itemDate <= targetDateObj) {
                currentIndex = i;
                break;
            }
        }
        // If still not found, start from beginning
        if (currentIndex === -1) currentIndex = 0;
    }

    container.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #1b5e20; margin-bottom: 20px; text-align: center;">Saved Pocket Notes</h3>
            
            <!-- Summary Section -->
            <div id="summarySection" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                ${renderSummarySection(dateFilters)}
            </div>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px;">
                <button id="prevNote" style="background: #1b5e20; color: white; border: none; padding: 10px 15px; 
                        border-radius: 50%; cursor: pointer; font-size: 16px;">
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                <div id="currentDateDisplay" style="font-weight: bold; font-size: 18px; color: #1b5e20;">
                    ${formatDisplayDateWithDay(timeline[currentIndex].date)}
                    ${getDayTypeBadge(timeline[currentIndex])}
                </div>
                
                <button id="nextNote" style="background: #1b5e20; color: white; border: none; padding: 10px 15px; 
                        border-radius: 50%; cursor: pointer; font-size: 16px;">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            
            <div style="text-align: center; margin-bottom: 10px; font-size: 14px; color: #666;">
                පිටු ${timeline.length} න් ${currentIndex + 1}
            </div>
            
            <div id="noteCarousel" style="min-height: 500px; position: relative;">
                ${renderCarouselItem(timeline[currentIndex])}
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <button id="deleteNote" style="background: #dc3545; color: white; border: none; padding: 8px 16px; 
                        border-radius: 5px; cursor: pointer; margin-right: 10px;"
                        ${timeline[currentIndex].isMissing ? 'disabled' : ''}>
                    <i class="fas fa-trash" style="margin-right: 5px;"></i>Delete
                </button>
                <button id="printNote" style="background: #1b5e20; color: white; border: none; padding: 8px 16px; 
                        border-radius: 5px; cursor: pointer;"
                        ${timeline[currentIndex].isMissing ? 'disabled' : ''}>
                    <i class="fas fa-print" style="margin-right: 5px;"></i>Print
                </button>
                <button id="addOrUpdateNote" style="background: #28a745; color: white; border: none; padding: 8px 16px; 
                        border-radius: 5px; cursor: pointer; margin-left: 10px;">
                    <i class="${timeline[currentIndex].isMissing ? 'fas fa-plus' : 'fas fa-edit'}" style="margin-right: 5px;"></i>
                    ${timeline[currentIndex].isMissing ? 'Add Entry' : 'Update'}
                </button>
            </div>
        </div>

        <!-- Calendar Modal -->
        <div id="calendarModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
            <div style="background: white; padding: 20px; border-radius: 10px; max-width: 90%; max-height: 90%; overflow: auto; position: relative;">
                <button id="closeCalendar" style="position: absolute; top: 10px; right: 10px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">×</button>
                <div id="calendarContent"></div>
            </div>
        </div>
    `;

    const totalItems = timeline.length;

    // Navigation handlers
    document.getElementById('prevNote').addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    document.getElementById('nextNote').addEventListener('click', () => {
        if (currentIndex < totalItems - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    // Delete handler
    document.getElementById('deleteNote').addEventListener('click', async () => {
        if (await showConfirm('මෙම සටහන මකා දැමීමට අවශ්‍යද?')) {
            deleteNote(currentIndex, timeline);
        }
    });

    // Print handler
    document.getElementById('printNote').addEventListener('click', () => {
        printNote(timeline[currentIndex]);
    });

    // Add or Update entry handler 
    document.getElementById('addOrUpdateNote').addEventListener('click', () => {
        addOrUpdateEntry(timeline[currentIndex].date);
    });

    // Calendar handlers
    document.getElementById('calendarIcon').addEventListener('click', () => {
        openCalendarModal();
    });

    document.getElementById('closeCalendar').addEventListener('click', () => {
        closeCalendarModal();
    });

    // Filter handlers
    document.getElementById('yearFilter').addEventListener('change', updateSummary);
    document.getElementById('monthFilter').addEventListener('change', updateSummary);

    function updateCarousel() {
        const currentItem = timeline[currentIndex];
        document.getElementById('currentDateDisplay').innerHTML =
            `${formatDisplayDateWithDay(currentItem.date)}${getDayTypeBadge(currentItem)}`;

        // Update page counter
        document.querySelector('div[style*="text-align: center; margin-bottom: 10px;"]').innerHTML =
            `පිටු ${totalItems} න් ${currentIndex + 1}`;

        // Update button states
        document.getElementById('deleteNote').disabled = currentItem.isMissing;
        document.getElementById('printNote').disabled = currentItem.isMissing;

        const addOrUpdateBtn = document.getElementById('addOrUpdateNote');
        if (addOrUpdateBtn) {
            addOrUpdateBtn.innerHTML = `
                <i class="${currentItem.isMissing ? 'fas fa-plus' : 'fas fa-edit'}" style="margin-right: 5px;"></i>
                ${currentItem.isMissing ? 'Add Entry' : 'Update'}
            `;
        }

        // Add flip animation
        const carousel = document.getElementById('noteCarousel');
        carousel.style.opacity = '0';

        setTimeout(() => {
            carousel.innerHTML = renderCarouselItem(currentItem);
            carousel.style.opacity = '1';
        }, 300);
    }

    function deleteNote(index, timeline) {
        const dateToDelete = timeline[index].date;
        const updatedNotes = notes.filter(note => note.date !== dateToDelete);
        localStorage.setItem('pocketNotes', JSON.stringify(updatedNotes));

        // Refresh the carousel
        renderPNBCarousel(containerId);
    }

    function addOrUpdateEntry(date) {
        // Switch to entry form and set the date
        const formTab = document.getElementById('pnbFormTab');
        if (formTab) {
            formTab.click();
        } else {
            // Fallback if tabs not available or direct navigation needed
            if (typeof window.openPocketNoteEntry === 'function') {
                window.openPocketNoteEntry(true);
            }
        }

        // Set the date in the form after a short delay to ensure form is loaded
        setTimeout(() => {
            if (typeof window.setPNBEntryDate === 'function') {
                window.setPNBEntryDate(date);

                const dateInput = document.getElementById('pnbDate');
                if (dateInput) {
                    dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                // Fallback if global function not found
                const dateInput = document.getElementById('pnbDate');
                if (dateInput) {
                    dateInput.value = date;
                    dateInput.dispatchEvent(new Event('change'));
                    dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 150); // Increased delay slightly for safety
    }

    function updateSummary() {
        const yearFilter = document.getElementById('yearFilter').value;
        const monthFilter = document.getElementById('monthFilter').value;

        const filteredNotes = notes.filter(note => {
            const noteDate = new Date(note.date);
            const noteYear = noteDate.getFullYear().toString();
            const noteMonth = (noteDate.getMonth() + 1).toString();

            return (!yearFilter || noteYear === yearFilter) &&
                (!monthFilter || noteMonth === monthFilter);
        });

        const summary = calculateSummary(filteredNotes, yearFilter, monthFilter);
        document.getElementById('summaryStats').innerHTML = renderSummaryStats(summary);
    }

    function openCalendarModal() {
        const yearFilter = document.getElementById('yearFilter').value;
        const monthFilter = document.getElementById('monthFilter').value;

        const selectedYear = yearFilter || new Date().getFullYear();
        const selectedMonth = monthFilter || new Date().getMonth() + 1;

        document.getElementById('calendarContent').innerHTML = renderCalendarView(selectedYear, selectedMonth, notes);
        document.getElementById('calendarModal').style.display = 'flex';
    }

    function closeCalendarModal() {
        document.getElementById('calendarModal').style.display = 'none';
    }
};

// Calendar view rendering function - UPDATED with black text for labels
function renderCalendarView(year, month, notes) {
    const monthNames = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි',
        'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];

    const dayNames = ['ඉ', 'ස', 'අ', 'බ', 'බ්‍ර', 'සි', 'සෙ'];

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const today = new Date();
    const currentDate = new Date(year, month - 1, 1);

    // Navigation buttons for previous and next months
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = year - 1;
    }

    let nextMonth = month + 1;
    let nextYear = year;
    if (nextMonth === 13) {
        nextMonth = 1;
        nextYear = year + 1;
    }

    let calendarHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <button onclick="changeCalendarMonth(${prevYear}, ${prevMonth})" 
                    style="background: #1b5e20; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">
                <i class="fas fa-chevron-left"></i> පසු මාසය
            </button>
            
            <h3 style="text-align: center; color: #1b5e20; margin: 0;">
                ${monthNames[month - 1]} ${year}
            </h3>
            
            <button onclick="changeCalendarMonth(${nextYear}, ${nextMonth})" 
                    style="background: #1b5e20; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">
                ඊළඟ මාසය <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 20px;">
    `;

    // Day headers
    dayNames.forEach(day => {
        calendarHTML += `
            <div style="text-align: center; font-weight: bold; padding: 8px; background: #e8f5e8; border-radius: 4px; color: #000000;">
                ${day}
            </div>
        `;
    });

    // Empty cells for days before the first day of month
    for (let i = 0; i < startingDay; i++) {
        calendarHTML += `<div style="padding: 8px;"></div>`;
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const note = notes.find(n => n.date === dateString);
        const dayColor = getDayColor(dateString, note);
        const isFutureDate = new Date(dateString) > new Date();

        calendarHTML += `
            <div style="text-align: center; padding: 8px; border-radius: 4px; 
                        ${isFutureDate ? 'cursor: default;' : 'cursor: pointer;'}
                        background: ${dayColor.background}; color: ${dayColor.color}; border: 1px solid ${dayColor.border};
                        font-weight: ${dayColor.bold ? 'bold' : 'normal'};"
                 ${!isFutureDate ? `onclick="navigateToDate('${dateString}')"` : ''}
                 title="${getDayTooltip(dateString, note)}">
                ${day}
            </div>
        `;
    }

    calendarHTML += `</div>`;

    // Legend - UPDATED with black text
    calendarHTML += `
        <div style="border-top: 2px solid #eee; padding-top: 15px;">
            <h4 style="color: #1b5e20; margin-bottom: 10px; color: #000000;">පැහැදිලි කිරීම්:</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 20px; height: 20px; background: #c62828; border-radius: 3px;"></div>
                    <span style="color: #000000;">ඉරිදා/නිවාඩු දින</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 20px; height: 20px; background: #ff6f00; border-radius: 3px;"></div>
                    <span style="color: #000000;">රජයේ නිවාඩු</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 20px; height: 20px; background: #1b5e20; border-radius: 3px;"></div>
                    <span style="color: #000000;">රාජකාරි කල දින</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 20px; height: 20px; background: #1565c0; border-radius: 3px;"></div>
                    <span style="color: #000000;">නිවාඩු දින රාජකාරි</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 20px; height: 20px; background: #6c757d; border-radius: 3px;"></div>
                    <span style="color: #000000;">දත්ත ඇතුලත් නොකළ</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 20px; height: 20px; background: #ffffff; border: 1px solid #ccc; border-radius: 3px;"></div>
                    <span style="color: #000000;">අනාගත දින</span>
                </div>
            </div>
        </div>
    `;

    return calendarHTML;
}

// Get color for a specific day - UPDATED for Sunday handling
function getDayColor(dateString, note) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Future dates - white with black text
    if (date > today) {
        return {
            background: '#ffffff',
            color: '#000000', // Changed from #6c757d to black
            border: '#dee2e6',
            bold: false
        };
    }

    const isSunday = date.getDay() === 0;

    // Sundays are always red (even without data), unless worked
    if (isSunday) {
        // If it's Sunday and no data exists, treat it as Sunday holiday
        if (!note) {
            return {
                background: '#c62828',
                color: 'white',
                border: '#b71c1c',
                bold: true
            };
        }

        if (note && note.dayType === 'sunday_holiday' && note.workOnHoliday) {
            return {
                background: '#1565c0',
                color: 'white',
                border: '#0d47a1',
                bold: true
            };
        }
        return {
            background: '#c62828',
            color: 'white',
            border: '#b71c1c',
            bold: true
        };
    }

    if (!note) {
        return {
            background: '#6c757d',
            color: 'white',
            border: '#5a6268',
            bold: false
        };
    }

    const displayType = getDisplayDayType(note);

    switch (displayType) {
        case 'working':
            return {
                background: '#1b5e20',
                color: 'white',
                border: '#155724',
                bold: true
            };
        case 'duty-holiday':
            return {
                background: '#1565c0',
                color: 'white',
                border: '#0d47a1',
                bold: true
            };
        case 'leave':
            return {
                background: '#c62828',
                color: 'white',
                border: '#b71c1c',
                bold: true
            };
        case 'government-holiday':
            return {
                background: '#ff6f00',
                color: 'white',
                border: '#e65100',
                bold: true
            };
        default:
            return {
                background: '#6c757d',
                color: 'white',
                border: '#5a6268',
                bold: false
            };
    }
}

// Get tooltip for a day - UPDATED for Sunday handling
function getDayTooltip(dateString, note) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date > today) {
        return `${dateString} - අනාගත දිනය`;
    }

    const dayNames = ['ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා', 'සෙනසුරාදා'];
    const dayName = dayNames[date.getDay()];

    if (!note) {
        if (date.getDay() === 0) {
            return `${dateString} - ${dayName} - ඉරිදා විවේක දිනයකි`; // Changed to show as Sunday
        }
        return `${dateString} - ${dayName} - දත්ත ඇතුලත් නොකළ`;
    }

    return `${dateString} - ${dayName} - ${getDayTypeDescription(note)}`;
}

// Navigate to specific date in carousel
window.navigateToDate = function (dateString) {
    const timeline = generateTimelineWithMissingDates(getPocketNotes(), dateString);
    const index = timeline.findIndex(item => item.date === dateString);

    if (index !== -1) {
        // Close calendar modal
        document.getElementById('calendarModal').style.display = 'none';

        // Update carousel to show the selected date
        const container = document.querySelector('[id*="pnbTabContainer"], #contentArea').id;
        renderPNBCarousel(container, dateString);

        // Find the new current index and update
        let currentIndex = timeline.findIndex(item => item.date === dateString);
        if (currentIndex !== -1) {
            // We need to trigger the carousel update
            setTimeout(() => {
                const event = new CustomEvent('dateNavigated', { detail: { index: currentIndex } });
                document.dispatchEvent(event);
            }, 100);
        }
    }
};

function getDayTypeBadge(item) {
    if (item.isMissing) {
        // Check if it's Sunday
        const date = new Date(item.date);
        if (date.getDay() === 0) {
            return ' <span style="color: #c62828;">(ඉරිදා විවේක දිනයකි)</span>';
        }
        return ' <span style="color: #dc3545;">(දත්ත නැත)</span>';
    }

    const displayType = getDisplayDayType(item);

    switch (displayType) {
        case 'leave':
            return ' <span style="color: #c62828;">(නිවාඩු දින)</span>';
        case 'sunday':
            return ' <span style="color: #ff8f00;">(ඉරිදා විවේක දිනයකි)</span>';
        case 'government-holiday':
            return ' <span style="color: #ff6f00;">(සාමාන්‍ය නිවාඩු)</span>';
        case 'duty-holiday':
            return ' <span style="color: #1565c0;">(නිවාඩු දින රාජකාරි)</span>';
        default:
            return ' <span style="color: #1b5e20;">(රාජකාරි දින)</span>';
    }
}

function getDisplayDayType(note) {
    // Map form day types to display day types with new logic
    if (note.dayType === 'working') {
        return 'working';
    } else if (note.dayType === 'sunday_holiday') {
        // Sunday with work ticked = duty holiday, otherwise regular sunday
        return note.workOnHoliday ? 'duty-holiday' : 'sunday';
    } else if (note.dayType === 'government_holiday') {
        // Government holiday with work ticked = duty holiday, otherwise government holiday
        return note.workOnHoliday ? 'duty-holiday' : 'government-holiday';
    } else if (note.dayType === 'casual_leave' || note.dayType === 'sick_leave') {
        return 'leave';
    }
    return 'working';
}

function getDateFilters(notes) {
    const years = new Set();
    const months = new Set();

    notes.forEach(note => {
        const date = new Date(note.date);
        years.add(date.getFullYear());
        months.add(date.getMonth() + 1);
    });

    return {
        years: Array.from(years).sort((a, b) => b - a),
        months: Array.from(months).sort((a, b) => a - b)
    };
}

function renderSummarySection(dateFilters) {
    const summary = calculateSummary(getPocketNotes());

    return `
        <div style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="color: #1b5e20; margin: 0; color: #000000;">දින සාරාංශය</h4>
                <button id="calendarIcon" style="background: #1b5e20; color: white; border: none; padding: 8px 12px; 
                        border-radius: 5px; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    <i class="fas fa-calendar-alt"></i>
                    දින දර්ශනය
                </button>
            </div>
            <div style="display: flex; gap: 15px; margin-bottom: 15px; flex-wrap: wrap;">
                <div>
                    <label for="yearFilter" style="font-weight: bold; margin-right: 5px; color: #000000;">වර්ෂය:</label>
                    <select id="yearFilter" style="padding: 5px; border-radius: 4px; border: 1px solid #ddd;">
                        <option value="">සියලුම</option>
                        ${dateFilters.years.map(year => `<option value="${year}">${year}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="monthFilter" style="font-weight: bold; margin-right: 5px; color: #000000;">මාසය:</label>
                    <select id="monthFilter" style="padding: 5px; border-radius: 4px; border: 1px solid #ddd;">
                        <option value="">සියලුම</option>
                        ${dateFilters.months.map(month => `
                            <option value="${month}">${getMonthName(month)}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
            <div id="summaryStats">
                ${renderSummaryStats(summary)}
            </div>
        </div>
    `;
}

function calculateSummary(notes, yearFilter = null, monthFilter = null) {
    let workingDays = 0;
    let dutyHolidays = 0;
    let casualLeaveDays = 0;
    let sickLeaveDays = 0;
    let governmentHolidays = 0;
    let sundays = 0;
    let nonWorkedSundays = 0;
    let workedSundays = 0;

    // Calculate total workable days and missing data days
    let totalWorkableDays = 0;
    let daysWithoutData = 0;
    let workedDays = 0;

    // Get filtered dates for calculation
    const filteredDates = [];
    if (yearFilter && monthFilter) {
        const startDate = new Date(parseInt(yearFilter), parseInt(monthFilter) - 1, 1);
        const endDate = new Date(parseInt(yearFilter), parseInt(monthFilter), 0);

        let currentDate = new Date(startDate);
        const today = new Date();

        while (currentDate <= endDate) {
            // Only count dates up to today for current month
            if (currentDate <= today) {
                filteredDates.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Calculate total Sundays in the period (including those without data)
        sundays = filteredDates.filter(date => date.getDay() === 0).length;

        // Calculate worked and non-worked Sundays
        const sundayDates = filteredDates.filter(date => date.getDay() === 0);
        const sundayDateStrings = sundayDates.map(date => date.toISOString().split('T')[0]);

        workedSundays = sundayDateStrings.filter(dateStr => {
            const note = notes.find(n => n.date === dateStr);
            return note && note.dayType === 'sunday_holiday' && note.workOnHoliday;
        }).length;

        // Non-worked Sundays include both Sundays with no data and Sundays marked as holiday without work
        nonWorkedSundays = sundays - workedSundays;

        // Calculate total workable days (excluding Sundays and government holidays)
        totalWorkableDays = filteredDates.filter(date => {
            const dateStr = date.toISOString().split('T')[0];
            const note = notes.find(n => n.date === dateStr);

            // Exclude Sundays
            if (date.getDay() === 0) return false;

            // Exclude government holidays that are not worked
            if (note && note.dayType === 'government_holiday' && !note.workOnHoliday) {
                return false;
            }

            return true;
        }).length;

        // Calculate days without data (excluding Sundays)
        daysWithoutData = filteredDates.filter(date => {
            const dateStr = date.toISOString().split('T')[0];
            const note = notes.find(n => n.date === dateStr);

            // Exclude Sundays (they are automatically holidays)
            if (date.getDay() === 0) return false;

            // Exclude government holidays not worked
            if (note && note.dayType === 'government_holiday' && !note.workOnHoliday) return false;

            return !note; // No data for this workable day
        }).length;
    }

    // Count day types from notes
    notes.forEach(note => {
        const displayType = getDisplayDayType(note);

        switch (displayType) {
            case 'working':
                workingDays++;
                break;
            case 'duty-holiday':
                dutyHolidays++;
                break;
            case 'leave':
                if (note.dayType === 'casual_leave') {
                    casualLeaveDays++;
                } else if (note.dayType === 'sick_leave') {
                    sickLeaveDays++;
                }
                break;
            case 'government-holiday':
                governmentHolidays++;
                break;
            case 'sunday':
                // Already counted in nonWorkedSundays
                break;
        }
    });

    // Calculate total worked days
    workedDays = workingDays + dutyHolidays;

    const totalDays = notes.length;

    return {
        totalDays,
        workingDays,
        dutyHolidays,
        casualLeaveDays,
        sickLeaveDays,
        governmentHolidays,
        sundays,
        nonWorkedSundays,
        workedSundays,
        totalWorkableDays,
        workedDays,
        daysWithoutData
    };
}

// Summary stats rendering - UPDATED with black text for labels
function renderSummaryStats(summary) {
    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <!-- සාමාන්‍ය රාජකාරි දින - Dark Green -->
            <div style="background: #e8f5e8; padding: 10px; border-radius: 5px; border-left: 4px solid #1b5e20;">
                <div style="font-weight: bold; color: #000000;">සාමාන්‍ය රාජකාරි දින</div>
                <div style="font-size: 24px; font-weight: bold; color: #000000;">${summary.workingDays}</div>
                <div style="font-size: 12px; color: #000000;">දිනයේ තත්වය: රාජකාරි දිනයකි</div>
            </div>
            
            <!-- නිවාඩු දින රාජකාරි - Dark Blue -->
            <div style="background: #e3f2fd; padding: 10px; border-radius: 5px; border-left: 4px solid #1565c0;">
                <div style="font-weight: bold; color: #000000;">නිවාඩු දින රාජකාරි</div>
                <div style="font-size: 24px; font-weight: bold; color: #000000;">${summary.dutyHolidays}</div>
                <div style="font-size: 12px; color: #000000;">නිවාඩු දින රාජකාරි සිදු කල දින</div>
            </div>
            
            <!-- අනියම් නිවාඩු - Light Red -->
            <div style="background: #ffebee; padding: 10px; border-radius: 5px; border-left: 4px solid #c62828;">
                <div style="font-weight: bold; color: #000000;">අනියම් නිවාඩු</div>
                <div style="font-size: 24px; font-weight: bold; color: #000000;">${summary.casualLeaveDays}</div>
                <div style="font-size: 12px; color: #000000;">අනියම් නිවාඩු දින</div>
            </div>
            
            <!-- අසනීප නිවාඩු - Dark Red -->
            <div style="background: #fce4ec; padding: 10px; border-radius: 5px; border-left: 4px solid #ad1457;">
                <div style="font-weight: bold; color: #000000;">අසනීප නිවාඩු</div>
                <div style="font-size: 24px; font-weight: bold; color: #000000;">${summary.sickLeaveDays}</div>
                <div style="font-size: 12px; color: #000000;">අසනීප නිවාඩු දින</div>
            </div>
            
            <!-- සාමාන්‍ය නිවාඩු - Light Red/Orange -->
            <div style="background: #fff3e0; padding: 10px; border-radius: 5px; border-left: 4px solid #ff6f00;">
                <div style="font-weight: bold; color: #000000;">සාමාන්‍ය නිවාඩු</div>
                <div style="font-size: 24px; font-weight: bold; color: #000000;">${summary.governmentHolidays}</div>
                <div style="font-size: 12px; color: #000000;">රජයේ නිවාඩු දින</div>
            </div>
            
            <!-- ඉරිදා දින - Dark Yellow (only show when month filter is applied) -->
            ${summary.sundays > 0 ? `
            <div style="background: #fffde7; padding: 10px; border-radius: 5px; border-left: 4px solid #ff8f00;">
                <div style="font-weight: bold; color: #000000;">ඉරිදා දින</div>
                <div style="font-size: 24px; font-weight: bold; color: #000000;">${summary.sundays}</div>
                <div style="font-size: 12px; color: #000000;">
                    රාජකාරි නොකළ: ${summary.nonWorkedSundays}<br>
                    රාජකාරි කළ: ${summary.workedSundays}
                </div>
            </div>
            ` : ''}
            
            <!-- මුළු දින - Workable days -->
            <div style="background: #e8f5e9; padding: 10px; border-radius: 5px; border-left: 4px solid #2e7d32;">
                <div style="font-weight: bold; color: #000000;">මුළු දින</div>
                <div style="font-size: 24px; font-weight: bold; color: #000000;">${summary.totalWorkableDays}</div>
                <div style="font-size: 12px; color: #000000;">
                    රාජකාරි කල දින: ${summary.workedDays}<br>
                    දත්ත ඇතුලත් නොකර ඇති දින: ${summary.daysWithoutData}
                </div>
            </div>
            
            <!-- සුරක්ෂිත කරන ලද දින -->
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; border-left: 4px solid #6c757d;">
                <div style="font-weight: bold; color: #000000;">සුරක්ෂිත කරන ලද දින</div>
                <div style="font-size: 24px; font-weight: bold; color: #000000;">${summary.totalDays}</div>
                <div style="font-size: 12px; color: #000000;">සුරක්ෂිත කරන ලද දින ගණන</div>
            </div>
        </div>
    `;
}

function getMonthName(monthNumber) {
    const months = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි',
        'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];
    return months[monthNumber - 1];
}

function generateTimelineWithMissingDates(notes, targetDateStr = null) {
    if (notes.length === 0 && !targetDateStr) return [];

    // Sort notes by date
    const sortedNotes = [...notes].sort((a, b) => new Date(a.date) - new Date(b.date));

    const timeline = [];

    // Determine bounds
    let startDate, endDate;

    if (sortedNotes.length > 0) {
        startDate = new Date(sortedNotes[0].date);
        endDate = new Date(sortedNotes[sortedNotes.length - 1].date);

        if (targetDateStr) {
            const targetDate = new Date(targetDateStr);
            if (targetDate < startDate) startDate = targetDate;
            if (targetDate > endDate) endDate = targetDate;
        }
    } else if (targetDateStr) {
        startDate = new Date(targetDateStr);
        endDate = new Date(targetDateStr);
    }

    // Create a map for quick lookup
    const notesMap = new Map();
    sortedNotes.forEach(note => notesMap.set(note.date, note));

    // Generate all dates in range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0];
        const existingNote = notesMap.get(dateString);

        if (existingNote) {
            timeline.push({
                ...existingNote,
                isMissing: false,
                dayOfWeek: getDayOfWeekInSinhala(currentDate)
            });
        } else {
            timeline.push({
                date: dateString,
                dayOfWeek: getDayOfWeekInSinhala(currentDate),
                isMissing: true
            });
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return timeline;
}

function getDayOfWeekInSinhala(date) {
    const days = ['ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා', 'සෙනසුරාදා'];
    return days[date.getDay()];
}

function renderCarouselItem(item) {
    // Check if it's Sunday without data
    const date = new Date(item.date);
    const isSunday = date.getDay() === 0;

    if (item.isMissing && isSunday) {
        return renderSundayWithoutDataPage(item);
    } else if (item.isMissing) {
        return renderMissingDatePage(item);
    } else {
        return renderNotePage(item);
    }
}

// New function to render Sunday without data page
function renderSundayWithoutDataPage(item) {
    return `
        <div style="background: linear-gradient(135deg, #fffde7 0%, #fff9c4 100%); 
                    border: 3px solid #ff8f00; border-radius: 15px; padding: 30px; 
                    text-align: center; min-height: 500px; display: flex; 
                    flex-direction: column; justify-content: center; align-items: center;
                    box-shadow: 0 8px 25px rgba(255, 143, 0, 0.2);">
            
            <!-- Sunday stamp effect -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
                       opacity: 0.1; font-size: 120px; color: #ff8f00; font-weight: bold; z-index: 1;
                       user-select: none;">
                ඉරිදා
            </div>
            
            <div style="position: relative; z-index: 2;">
                <i class="fas fa-sun" 
                   style="font-size: 80px; color: #ff8f00; margin-bottom: 20px;"></i>
                
                <h3 style="color: #ff8f00; margin-bottom: 15px; font-size: 28px;">
                    ඉරිදා විවේක දිනය
                </h3>
                
                <div style="background: white; padding: 20px; border-radius: 10px; 
                            border: 2px solid #ff8f00; margin: 20px 0; max-width: 400px;">
                    <div style="font-size: 20px; font-weight: bold; color: #333; margin-bottom: 10px;">
                        ${formatDisplayDateWithDay(item.date)}
                    </div>
                    <div style="font-size: 16px; color: #666;">
                        මෙම දිනය සාමාන්‍ය ඉරිදා විවේක දිනයක් වේ
                    </div>
                </div>
                
                <p style="color: #856404; font-size: 16px; max-width: 500px; line-height: 1.5;">
                    මෙම දිනය සාමාන්‍ය ඉරිදා විවේක දිනයක් ලෙස සලකනු ලැබේ.<br>
                    ඔබට අවශ්‍ය නම් පහත "Add Entry" බොත්තම ක්ලික් කර මෙම දිනය සඳහා විශේෂ රාජකාරි ඇතුලත් කරන්න.
                </p>
                
                <div style="margin-top: 25px; padding: 15px; background: rgba(255, 143, 0, 0.1); 
                            border-radius: 8px; border-left: 4px solid #ff8f00;">
                    <small style="color: #856404;">
                        <i class="fas fa-info-circle" style="margin-right: 5px;"></i>
                        ඉරිදා දින සාමාන්‍යයෙන් විවේක දින ලෙස සලකනු ලැබේ. නිවාඩු දින රාජකාරි සිදු කිරීමට අවශ්‍ය නම් දත්ත ඇතුලත් කරන්න.
                    </small>
                </div>
            </div>
        </div>
    `;
}

function renderMissingDatePage(item) {
    return `
        <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); 
                    border: 3px dashed #dc3545; border-radius: 15px; padding: 30px; 
                    text-align: center; min-height: 500px; display: flex; 
                    flex-direction: column; justify-content: center; align-items: center;
                    box-shadow: 0 8px 25px rgba(220, 53, 69, 0.2);">
            
            <!-- Red stamp effect -->
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
                       opacity: 0.1; font-size: 120px; color: #dc3545; font-weight: bold; z-index: 1;
                       user-select: none;">
                දත්ත නැත
            </div>
            
            <div style="position: relative; z-index: 2;">
                <i class="fas fa-times-circle" 
                   style="font-size: 80px; color: #dc3545; margin-bottom: 20px;"></i>
                
                <h3 style="color: #dc3545; margin-bottom: 15px; font-size: 28px;">
                    දත්ත ඇතුලත් කර නොමැත
                </h3>
                
                <div style="background: white; padding: 20px; border-radius: 10px; 
                            border: 2px solid #dc3545; margin: 20px 0; max-width: 400px;">
                    <div style="font-size: 20px; font-weight: bold; color: #333; margin-bottom: 10px;">
                        ${formatDisplayDateWithDay(item.date)}
                    </div>
                </div>
                
                <p style="color: #721c24; font-size: 16px; max-width: 500px; line-height: 1.5;">
                    මෙම දිනය සඳහා Pocket Note Book හි දත්ත ඇතුලත් කර නොමැත.<br>
                    පහත "Add Entry" බොත්තම ක්ලික් කර මෙම දිනය සඳහා දත්ත ඇතුලත් කරන්න.
                </p>
                
                <div style="margin-top: 25px; padding: 15px; background: rgba(220, 53, 69, 0.1); 
                            border-radius: 8px; border-left: 4px solid #dc3545;">
                    <small style="color: #856404;">
                        <i class="fas fa-info-circle" style="margin-right: 5px;"></i>
                        මෙම පිටුව ස්වයංක්‍රීයව ජනනය කරන ලද්දක් වන අතර දින කාලානුක්‍රමය පවත්වා ගැනීම සඳහා ඇත.
                    </small>
                </div>
            </div>
        </div>
    `;
}

function renderNotePage(note) {
    // Determine colors based on day type with new color scheme
    const displayType = getDisplayDayType(note);

    let borderColor, headerBg, headerTextColor;

    switch (displayType) {
        case 'working':
            borderColor = '#1b5e20'; // Dark Green
            headerBg = '#e8f5e8';
            headerTextColor = '#1b5e20';
            break;
        case 'duty-holiday':
            borderColor = '#1565c0'; // Dark Blue
            headerBg = '#e3f2fd';
            headerTextColor = '#1565c0';
            break;
        case 'leave':
            borderColor = '#c62828'; // Dark Red
            headerBg = '#ffebee';
            headerTextColor = '#c62828';
            break;
        case 'sunday':
            borderColor = '#ff8f00'; // Dark Yellow
            headerBg = '#fffde7';
            headerTextColor = '#ff8f00';
            break;
        case 'government-holiday':
            borderColor = '#ff6f00'; // Light Red/Orange
            headerBg = '#fff3e0';
            headerTextColor = '#ff6f00';
            break;
        default:
            borderColor = '#1b5e20';
            headerBg = '#e8f5e8';
            headerTextColor = '#1b5e20';
    }

    return `
        <div style="background: #f9f9f9; border: 2px solid ${borderColor}; border-radius: 10px; padding: 20px;">
            <div style="text-align: center; margin-bottom: 20px; padding: 15px; 
                        background: ${headerBg}; border-radius: 8px; border-bottom: 2px solid ${borderColor};">
                <h4 style="color: ${headerTextColor}; margin: 0 0 5px 0;">Pocket Note Book (H-253)</h4>
                <div style="font-weight: bold; font-size: 16px; color: ${headerTextColor};">
                    ${formatDisplayDateWithDay(note.date)}
                </div>
                <div style="font-size: 14px; color: ${headerTextColor}; margin-top: 5px;">
                    ${getDayTypeDescription(note)}
                </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background: ${headerBg};">
                    <th style="padding: 8px; border: 1px solid #ddd; width: 30%; color: #000000;">#</th>
                    <th style="padding: 8px; border: 1px solid #ddd; width: 35%; color: #000000;">පෙරවරු</th>
                    <th style="padding: 8px; border: 1px solid #ddd; width: 35%; color: #000000;">පස්වරු</th>
                </tr>
                
                ${renderTableRow('සේවා ස්ථානය', note.serviceLocation?.morning, note.serviceLocation?.afternoon)}
                ${renderTableRow('කාර්යාලයෙන් පිටත්වීම', note.officeDeparture?.morning, note.officeDeparture?.afternoon)}
                ${renderTableRow('ක්ෂේත්‍රයට ලගා වීම', note.fieldArrival?.morning, note.fieldArrival?.afternoon)}
                ${renderTableRow('ක්ෂේත්‍රයෙන් පිටත්වීම', note.fieldDeparture?.morning, note.fieldDeparture?.afternoon)}
                ${renderTableRow('කාර්යාලයට ලගා වීම', note.officeArrival?.morning, note.officeArrival?.afternoon)}
                ${renderTableRow('යතුරුපැදියෙන් ගමන් කල දුර (km)', note.vehicleDistance?.morning, note.vehicleDistance?.afternoon)}
                ${renderTableRow('පොදු ප්‍රවාහනයෙන් ගමන් කල දුර (km)', note.publicTransportDistance?.morning, note.publicTransportDistance?.afternoon)}
            </table>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: ${headerTextColor};">පෙරවරුවේ කල රාජකාරි:</strong>
                <div style="background: white; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-top: 5px; min-height: 60px; color: #000000;">
                    ${renderTasksSummary(note.morningTasks, 'morning')}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <strong style="color: ${headerTextColor};">පස්වරුවේ කල රාජකාරි:</strong>
                <div style="background: white; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin-top: 5px; min-height: 60px; color: #000000;">
                     ${renderTasksSummary(note.afternoonTasks, 'afternoon')}
                </div>
            </div>
        </div>
    `;
}

// Function to render tasks summary with chips
function renderTasksSummary(taskString, period) {
    if (!taskString) return '-';

    const lines = taskString.split('\n').filter(l => l.trim());
    let chipsHtml = '';
    let textHtml = '';

    const chipBg = period === 'morning' ? '#ffe9b3' : '#cfe8ff';

    lines.forEach(line => {
        // Match " - Number" pattern to identify calculated duties
        if (line.match(/ - \d+$/)) {
            chipsHtml += `
                <div style="display: inline-flex; align-items: center; gap: 8px; margin: 4px; padding: 6px 12px; 
                            border-radius: 16px; background: ${chipBg}; border: 1px solid rgba(0,0,0,0.08); 
                            font-size: 13px; color: #212121; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    ${line}
                </div>
            `;
        } else {
            textHtml += `<div style="margin-bottom: 4px;">${line}</div>`;
        }
    });

    return `
        <div style="display: flex; flex-wrap: wrap; margin-bottom: ${chipsHtml ? '8px' : '0'};">
            ${chipsHtml}
        </div>
        <div>
            ${textHtml}
        </div>
    `;
}

function renderTableRow(label, morningValue, afternoonValue) {
    return `
        <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #000000;">${label}</td>
            <td style="padding: 8px; border: 1px solid #ddd; color: #000000;">${morningValue || '-'}</td>
            <td style="padding: 8px; border: 1px solid #ddd; color: #000000;">${afternoonValue || '-'}</td>
        </tr>
    `;
}

function getDayTypeDescription(note) {
    const dayTypeMap = {
        'working': 'රාජකාරි දිනයකි',
        'government_holiday': 'රජයේ නිවාඩු දිනයකි',
        'sunday_holiday': 'ඉරිදා විවේක දිනයකි',
        'casual_leave': 'අනියම් නිවාඩු ලබා ගන්න ලදී',
        'sick_leave': 'අසනීප නිවාඩු ලබා ගන්න ලදී'
    };

    let description = dayTypeMap[note.dayType] || 'රාජකාරි දිනයකි';

    if (note.workOnHoliday && (note.dayType === 'government_holiday' || note.dayType === 'sunday_holiday')) {
        description += ' (නිවාඩු දින රාජකාරි)';
    }

    return description;
}

function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    const months = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි',
        'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];

    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDisplayDateWithDay(dateString) {
    const date = new Date(dateString);
    const days = ['ඉරිදා', 'සඳුදා', 'අඟහරුවාදා', 'බදාදා', 'බ්‍රහස්පතින්දා', 'සිකුරාදා', 'සෙනසුරාදා'];
    const months = ['ජනවාරි', 'පෙබරවාරි', 'මාර්තු', 'අප්‍රේල්', 'මැයි', 'ජූනි',
        'ජූලි', 'අගෝස්තු', 'සැප්තැම්බර්', 'ඔක්තෝබර්', 'නොවැම්බර්', 'දෙසැම්බර්'];

    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function printNote(note) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Pocket Note - ${note.date}</title>
                <style>
                    body { font-family: 'Poppins', sans-serif; margin: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background: #f0f0f0; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .section { margin-bottom: 15px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>Pocket Note Book (H-253)</h2>
                    <h3>${formatDisplayDateWithDay(note.date)}</h3>
                    <p>${getDayTypeDescription(note)}</p>
                </div>
                ${renderNotePage(note)}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}


// Make getPocketNotes available globally for other modules
window.getPocketNotes = getPocketNotes;

// Global function for calendar navigation
window.changeCalendarMonth = function (year, month) {
    const notes = window.getPocketNotes();
    const calendarContent = document.getElementById('calendarContent');
    if (calendarContent) {
        calendarContent.innerHTML = renderCalendarView(year, month, notes);
    }
};