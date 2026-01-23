// migrationHelper.js - Automatically migrate localStorage data to Firestore
import { migrateLocalStorageToFirestore } from './services/dataService.js';

/**
 * Mapping of localStorage keys to Firestore collection names
 */
const MIGRATION_MAP = {
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
    'pocketNoteBook_v1': 'pocketNoteBook',
    'dailySummary_v1': 'dailySummary',
    'keyRegister_v1': 'keyRegister',
    'monthlySchedule_v1': 'monthlySchedule',
    'phi_schools_v1': 'phiSchools',
    'phi_gns_v1': 'phiGNs',
    'phi_phm_v1': 'phiPHM',
    'phi_info_v1': 'phiInfo',
    'phi_info_area': 'phiProfile',
    'phi_info_office': 'phiProfile',
    'phi_info_province': 'phiProfile',
    'phi_info_keymap': 'phiKeyMap',
    'phi_keymap_meta_v1': 'phiKeyMapMeta'
};

/**
 * Check if migration has been completed for this user
 */
function hasMigrationCompleted() {
    const completed = localStorage.getItem('firestore_migration_completed');
    return completed === 'true';
}

/**
 * Mark migration as completed
 */
function markMigrationCompleted() {
    localStorage.setItem('firestore_migration_completed', 'true');
    localStorage.setItem('firestore_migration_date', new Date().toISOString());
}

/**
 * Perform full migration from localStorage to Firestore
 */
export async function performMigration(showProgress = true) {
    if (hasMigrationCompleted()) {
        console.log('Migration already completed for this user');
        return { success: true, alreadyCompleted: true };
    }

    const results = {
        success: true,
        total: 0,
        migrated: 0,
        failed: [],
        errors: []
    };

    if (showProgress) {
        Swal.fire({
            title: 'Migrating Data / දත්ත සංක්‍රමණය',
            text: 'Please wait while we migrate your data to the cloud...',
            icon: 'info',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });
    }

    for (const [storageKey, collectionName] of Object.entries(MIGRATION_MAP)) {
        try {
            const localData = localStorage.getItem(storageKey);
            if (!localData) {
                continue; // Skip if no data
            }

            // Special handling for PHI profile data
            if (storageKey.startsWith('phi_info_') && collectionName === 'phiProfile') {
                // These are simple string values, not arrays
                const value = localData;
                const fieldName = storageKey.replace('phi_info_', '');

                // Instead of migrating as separate items, we'll handle this separately
                // For now, skip these
                continue;
            }

            const result = await migrateLocalStorageToFirestore(storageKey, collectionName);
            results.total++;
            results.migrated += result.migrated || 0;

            console.log(`✓ Migrated ${result.migrated} items from ${storageKey}`);
        } catch (error) {
            console.error(`✗ Failed to migrate ${storageKey}:`, error);
            results.failed.push(storageKey);
            results.errors.push({ key: storageKey, error: error.message });
        }
    }

    markMigrationCompleted();

    if (showProgress) {
        Swal.close();

        if (results.failed.length === 0) {
            await Swal.fire({
                title: 'Migration Successful! / සංක්‍රමණය සාර්ථකයි!',
                html: `Successfully migrated ${results.migrated} records to the cloud.<br>ලියාපදිංචි ${results.migrated}ක් cloud එකට සාර්ථකව සංක්‍රමණය විය.`,
                icon: 'success',
                confirmButtonText: 'හරි / OK',
                confirmButtonColor: '#0b5ea8'
            });
        } else {
            await Swal.fire({
                title: 'Migration Partially Complete / අර්ධ සංක්‍රමණය',
                html: `Migrated ${results.migrated} records.<br>Failed: ${results.failed.length} collections.`,
                icon: 'warning',
                confirmButtonText: 'හරි / OK',
                confirmButtonColor: '#f39c12'
            });
        }
    }

    return results;
}

/**
 * Reset migration flag (for testing or re-migration)
 */
export function resetMigration() {
    localStorage.removeItem('firestore_migration_completed');
    localStorage.removeItem('firestore_migration_date');
    console.log('Migration flag reset');
}

export default {
    performMigration,
    resetMigration,
    hasMigrationCompleted
};
