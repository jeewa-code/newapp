/**
 * Government Holidays Data
 * Format: YYYY: { "MM-DD": { si: "Sinhala Name", en: "English Name" }, ... }
 * 
 * To add holidays for a new year:
 * 1. Add a new year key (e.g., "2027")
 * 2. Add holidays in MM-DD format with both Sinhala and English names
 * 
 * Example:
 * "2027": {
 *   "01-01": { si: "නව වසර දිනය", en: "New Year's Day" }
 * }
 */

const GOVERNMENT_HOLIDAYS = {
  "2026": {
    "01-03": { si: "දුරුතු පුර පසළොස්වක පෝය දිනය", en: "Duruthu Full Moon Poya Day" },
    "01-15": { si: "දෙමළ තෛපොංගල් දිනය", en: "Tamil Thai Pongal Day" },
    "02-01": { si: "නවම් පුර පසළොස්වක පෝය දිනය", en: "Navam Full Moon Poya Day" },
    "02-04": { si: "නිදහස් සමරු දිනය", en: "National Day (Independence Day)" },
    "02-15": { si: "මහ සිවරාත්‍රි දිනය", en: "Mahasivarathri Day" },
    "03-02": { si: "මැදින් පුර පසළොස්වක පෝය දිනය", en: "Medin Full Moon Poya Day" },
    "03-21": { si: "ඊදුල් ෆීතර් (රාමසාන් දිනය)", en: "Eid Al-Fitr (Ramazan Festival Day)" },
    "04-01": { si: "බක් පුර පසළොස්වක පොහොය දිනය", en: "Bak Full Moon Poya Day" },
    "04-03": { si: "මහ සිකුරාදා දිනය", en: "Good Friday" },
    "04-13": { si: "සිංහල හා දෙමළ අලුත් අවුරුදු දිනට පෙර දිනය", en: "Day prior to Sinhala & Tamil New Year Day" },
    "04-14": { si: "සිංහල හා දෙමළ අලුත් අවුරුදු දිනය", en: "Sinhala & Tamil New Year Day" },
    "05-01": { si: "වෙසක් පුර පසළොස්වක පෝය දිනය / ලෝක කම්කරු දිනය", en: "Vesak Full Moon Poya Day / May Day" },
    "05-02": { si: "වෙසක් පුර පසළොස්වක පෝය දිනට පසු දිනය", en: "Day following Vesak Full Moon Poya Day" },
    "05-28": { si: "ඊදුල් අල්හා (හජ්ජි උත්සව දිනය)", en: "Eid Al-Adha (Hadji Festival Day)" },
    "05-30": { si: "අධි පොසොන් පුර පසළොස්වක පෝය දිනය", en: "Adhi Poson Full Moon Poya Day" },
    "06-29": { si: "පොසොන් පුර පසළොස්වක පෝය දිනය", en: "Poson Full Moon Poya Day" },
    "07-29": { si: "ඇසළ පුර පසළොස්වක පෝය දිනය", en: "Esala Full Moon Poya Day" },
    "08-26": { si: "(මිලා-දුන්-නබි) නබි නායකතුමාගේ උපන් දිනය", en: "Milad-Un-Nabi (Holy Prophet's Birthday)" },
    "08-27": { si: "නිකිණි පුර පසළොස්වක පෝය දිනය", en: "Nikini Full Moon Poya Day" },
    "09-26": { si: "බිනර පුර පසළොස්වක පෝය දිනය", en: "Binara Full Moon Poya Day" },
    "10-25": { si: "වප් පුර පසළොස්වක පෝය දිනය", en: "Vap Full Moon Poya Day" },
    "11-08": { si: "දීපවාලි උත්සව දිනය", en: "Deepawali Festival Day" },
    "11-24": { si: "ඉල් පුර පසළොස්වක පෝය දිනය", en: "Ill Full Moon Poya Day" },
    "12-23": { si: "උඳුවප් පුර පසළොස්වක පෝය දිනය", en: "Unduwap Full Moon Poya Day" },
    "12-25": { si: "නත්තල් උත්සව දිනය", en: "Christmas Day" }
  },
  "2027": {
    // Add 2027 holidays here
    // Example:
    // "01-01": { si: "නව වසර දිනය", en: "New Year's Day" }
  }
};

/**
 * Get government holidays for a specific month
 * @param {string} monthValue - Month in YYYY-MM format (e.g., "2026-01")
 * @param {string} language - Language code ("si" or "en"), defaults to "si"
 * @returns {Object} Object with day numbers as keys and holiday names as values
 */
function getGovernmentHolidaysForMonth(monthValue, language = "si") {
  if (!monthValue) return {};
  
  const [year, month] = monthValue.split("-");
  const yearHolidays = GOVERNMENT_HOLIDAYS[year];
  
  if (!yearHolidays) return {};
  
  const monthHolidays = {};
  
  Object.keys(yearHolidays).forEach(dateKey => {
    const [holidayMonth, holidayDay] = dateKey.split("-");
    if (holidayMonth === month) {
      const dayNum = parseInt(holidayDay, 10);
      const holidayData = yearHolidays[dateKey];
      // Support both old format (string) and new format (object with si/en)
      if (typeof holidayData === 'string') {
        monthHolidays[dayNum] = holidayData;
      } else if (holidayData && typeof holidayData === 'object') {
        monthHolidays[dayNum] = holidayData[language] || holidayData.si || "";
      }
    }
  });
  
  return monthHolidays;
}

/**
 * Check if a specific date is a government holiday
 * @param {number|string} year - Year (e.g., 2026 or "2026")
 * @param {number|string} month - Month (e.g., 1 or "01")
 * @param {number} day - Day number (e.g., 3)
 * @param {string} language - Language code ("si" or "en"), defaults to "si"
 * @returns {string|null} Holiday name if it's a holiday, null otherwise
 */
function isGovernmentHoliday(year, month, day, language = "si") {
  const yearHolidays = GOVERNMENT_HOLIDAYS[year];
  if (!yearHolidays) return null;
  
  // Convert month and day to strings and pad them
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const dateKey = `${monthStr}-${dayStr}`;
  const holidayData = yearHolidays[dateKey];
  
  if (!holidayData) return null;
  
  // Support both old format (string) and new format (object with si/en)
  if (typeof holidayData === 'string') {
    return holidayData;
  } else if (holidayData && typeof holidayData === 'object') {
    return holidayData[language] || holidayData.si || null;
  }
  
  return null;
}
