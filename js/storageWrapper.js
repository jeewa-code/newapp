// storageWrapper.js - Wrapper to sync localStorage with Firestore
import { saveData, deleteData, getAllData } from './services/dataService.js';
import { auth } from './firebase-config.js';

/**
 * Enhanced localStorage wrapper that syncs with Firestore
 * This allows existing code to continue using localStorage API
 * while automatically syncing to Firestore in the background
 */

// Store references to original localStorage methods
const originalSetItem = localStorage.setItem.bind(localStorage);
const originalGetItem = localStorage.getItem.bind(localStorage);
const originalRemoveItem = localStorage.removeItem.bind(localStorage);

// Mapping of localStorage keys to Firestore collections
const COLLECTION_MAP = {
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
    'tradeIndustries_v1': 'tradeIndustries',
    'meatInspection_v1': 'meatInspection',
    'disasterPreparedness_v1': 'disasterPreparedness',
    'pocketNoteBook_v1': 'pocketNoteBook',
    'dailySummary_v1': 'dailySummary',
    'keyRegister_v1': 'keyRegister',
    'monthlySchedule_v1': 'monthlySchedule'
};

// Check if key should be synced to Firestore
function shouldSync(key) {
    return COLLECTION_MAP.hasOwnProperty(key);
}

// Async sync to Firestore (non-blocking)
async function syncToFirestore(key, value) {
    if (!auth.currentUser) {
        // User not logged in, skip sync
        return;
    }

    const collectionName = COLLECTION_MAP[key];
    if (!collectionName) {
        return;
    }

    try {
        // Parse the data (should be JSON array)
        const data = JSON.parse(value);

        if (Array.isArray(data)) {
            // Sync each item
            const syncPromises = data.map(item => {
                const id = item.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
                return saveData(collectionName, id, item).catch(err => {
                    console.error(`Failed to sync item ${id} to ${collectionName}:`, err);
                });
            });

            await Promise.all(syncPromises);
            console.log(`✓ Synced ${data.length} items to ${collectionName}`);
        } else {
            // Single object, save with key as ID
            await saveData(collectionName, 'data', data);
        }
    } catch (error) {
        console.error(`Sync error for ${key}:`, error);
        // Don't throw - we don't want to break the app if sync fails
    }
}

// Load from Firestore on first access
async function loadFromFirestore(key) {
    if (!auth.currentUser) {
        return null;
    }

    const collectionName = COLLECTION_MAP[key];
    if (!collectionName) {
        return null;
    }

    try {
        const data = await getAllData(collectionName);
        if (data && data.length > 0) {
            const jsonString = JSON.stringify(data);
            originalSetItem(key, jsonString);
            return jsonString;
        }
    } catch (error) {
        console.error(`Load from Firestore error for ${key}:`, error);
    }

    return null;
}

/**
 * Initialize storage wrapper
 * Overrides localStorage methods to add Firestore sync
 */
export function initializeStorageWrapper() {
    // Override setItem to sync to Firestore
    Storage.prototype.setItem = function (key, value) {
        // Call original setItem
        originalSetItem(key, value);

        // Sync to Firestore in background (non-blocking)
        if (shouldSync(key)) {
            syncToFirestore(key, value).catch(err => {
                console.error('Background sync error:', err);
            });
        }
    };

    // Override getItem to load from Firestore if not in localStorage
    const originalGetItemFunc = originalGetItem;
    Storage.prototype.getItem = function (key) {
        const localValue = originalGetItemFunc(key);

        // If we have a local value, return it
        if (localValue !== null) {
            return localValue;
        }

        // If this is a syncable key and we don't have local data,
        // try loading from Firestore (but return null immediately for compatibility)
        if (shouldSync(key)) {
            loadFromFirestore(key).then(value => {
                if (value) {
                    console.log(`Loaded ${key} from Firestore`);
                }
            }).catch(err => {
                console.error(`Async load error for ${key}:`, err);
            });
        }

        return null;
    };

    console.log('✓ Storage wrapper initialized - localStorage now syncs with Firestore');
}

/**
 * Force sync all localStorage data to Firestore
 */
export async function forceSyncAll() {
    const promises = [];

    for (const key of Object.keys(COLLECTION_MAP)) {
        const value = originalGetItem(key);
        if (value) {
            promises.push(syncToFirestore(key, value));
        }
    }

    await Promise.all(promises);
    console.log('✓ Force sync completed');
}

/**
 * Load all data from Firestore to localStorage
 */
export async function loadAllFromFirestore() {
    const promises = [];

    for (const key of Object.keys(COLLECTION_MAP)) {
        promises.push(loadFromFirestore(key));
    }

    await Promise.all(promises);
    console.log('✓ Load all from Firestore completed');
}

export default {
    initializeStorageWrapper,
    forceSyncAll,
    loadAllFromFirestore
};
