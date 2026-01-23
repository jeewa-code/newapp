// localStorageSyncService.js - Automatically sync all localStorage changes to Firebase
import { saveWithSync, deleteWithSync, loadWithSync } from './dataService.js';
import { auth } from '../firebase-config.js';

/**
 * Mapping of localStorage keys to Firestore collection names
 */
const KEY_TO_COLLECTION_MAP = {
    'inwardRegisterEntries_v1': 'inwardRegister',
    'healthEducationEntries_v1': 'healthEducation',
    'sanitationInspections_v1': 'sanitation',
    'latrineConstructionRecords_v1': 'latrineConstruction',
    'infectiousPatients_v2': 'infectiousPatients',
    'infectiousDiseases_v1': 'infectiousDiseases',
    'nonCommunicableRecords_v1': 'nonCommunicable',
    'noticeIssuedRecords_v1': 'notices',
    'foodAnalysisRecords_v1': 'foodAnalysis',
    'environmentalPollution_v1': 'environmentalPollution',
    'commonDrinkingWater_v1': 'commonDrinkingWater',
    'buildingConstruction_v1': 'buildingConstruction',
    'occupationalSafety_v1': 'occupationalSafety',
    'schoolImmunization1_v1': 'schoolImmunization1',
    'schoolImmunization2_v1': 'schoolImmunization2',
    'trade_industries_v1': 'tradeIndustries',
    'trade_food_types_v1': 'tradeFoodTypes',
    'trade_other_types_v1': 'tradeOtherTypes',
    'meatInspection_v1': 'meatInspection',
    'disasterPreparedness_v1': 'disasterPreparedness',
    'pocketNotes': 'pocketNoteBook',
    'dailySummary_v1': 'dailySummary',
    'keyRegister_v1': 'keyRegister',
    'monthlySchedule_v1': 'monthlySchedule',
    'phi_schools_v1': 'phiSchools',
    'phi_gns_v1': 'phiGNs',
    'phi_phm_v1': 'phiPHM',
    'phi_info_v1': 'phiInfo'
};

/**
 * Check if a key should be synced to Firebase
 */
function shouldSync(key) {
    return KEY_TO_COLLECTION_MAP.hasOwnProperty(key);
}

/**
 * Get collection name for a localStorage key
 */
function getCollectionName(key) {
    return KEY_TO_COLLECTION_MAP[key] || null;
}

/**
 * Sync a localStorage key to Firebase (async, non-blocking)
 */
async function syncToFirebase(key, value) {
    const collectionName = getCollectionName(key);
    if (!collectionName) return;

    // Check if user is logged in
    if (!auth.currentUser) {
        console.log(`Skipping Firebase sync for ${key} - no user logged in`);
        return;
    }

    try {
        const data = JSON.parse(value);
        await saveWithSync(collectionName, key, key, { data, updatedAt: new Date().toISOString() });
        console.log(`✓ Synced ${key} to Firebase`);
    } catch (error) {
        console.error(`Failed to sync ${key} to Firebase:`, error);
    }
}

/**
 * Initialize auto-sync by intercepting localStorage.setItem
 */
export function initializeAutoSync() {
    // Store the original setItem method
    const originalSetItem = localStorage.setItem.bind(localStorage);

    // Override setItem to automatically sync
    localStorage.setItem = function (key, value) {
        // Call original setItem first
        originalSetItem(key, value);

        // Sync to Firebase if this key should be synced (non-blocking)
        if (shouldSync(key)) {
            syncToFirebase(key, value).catch(err => {
                console.error(`Error in auto-sync for ${key}:`, err);
            });
        }
    };

    console.log('✓ localStorage auto-sync initialized');
}

/**
 * Load data from Firebase and update localStorage on app start
 */
export async function loadAllFromFirebase() {
    if (!auth.currentUser) {
        console.log('No user logged in - skipping Firebase load');
        return;
    }

    console.log('Loading data from Firebase...');

    for (const [key, collectionName] of Object.entries(KEY_TO_COLLECTION_MAP)) {
        try {
            const data = await loadWithSync(collectionName, key);
            if (data && data.length > 0) {
                // Update localStorage with Firebase data
                localStorage.setItem(key, JSON.stringify(data));
                console.log(`✓ Loaded ${key} from Firebase (${data.length} items)`);
            }
        } catch (error) {
            console.error(`Failed to load ${key} from Firebase:`, error);
        }
    }

    console.log('✓ Firebase data load complete');
}

export default {
    initializeAutoSync,
    loadAllFromFirebase,
    shouldSync,
    getCollectionName
};
