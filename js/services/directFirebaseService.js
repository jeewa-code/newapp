import { db, auth } from '../firebase-config.js';
import { doc, setDoc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Service for direct Firebase interaction for specific critical data
 * ensuring real-time sync and bypassing localStorage for these items.
 */
export const DirectFirebaseService = {

    /**
     * Get the current user ID
     */
    getUserId: () => {
        return auth.currentUser ? auth.currentUser.uid : null;
    },

    /**
     * Save data to a specific path under the user's document
     * @param {string} path - Sub-path under users/{userId}/
     * @param {any} data - Data to save
     */
    save: async (path, data) => {
        const userId = DirectFirebaseService.getUserId();
        if (!userId) {
            console.warn("DirectFirebaseService: No user logged in.");
            return;
        }

        try {
            // We use setDoc with merge: true to allow partial updates if needed,
            // but for these lists/objects, we might often want to replace the content
            // or we might need to structure it differently.
            // For simple lists like keymaps, saving the whole array in a doc is fine
            // provided it's under the 1MB limit.

            // Construct the document reference
            // Mapping: users/{userId}/{path} - where path might be 'phi_info' or 'keymap/roles'

            // Let's standardize the path. 
            // If path is "phi_info", we save to users/{userId}/phi_data/info
            // If path is "roles", we save to users/{userId}/phi_data/roles

            const docRef = doc(db, `users/${userId}/phi_data/${path}`);

            // Wrap data in an object if it's an array, because Firestore docs must be objects
            const payload = Array.isArray(data) ? { data: data } : data;

            await setDoc(docRef, payload);
            console.log(`DirectFirebaseService: Saved to ${path}`);
        } catch (error) {
            console.error(`DirectFirebaseService: Error saving to ${path}`, error);
            throw error;
        }
    },

    /**
     * Subscribe to real-time updates for a specific data path
     * @param {string} path - Sub-path under users/{userId}/phi_data/
     * @param {function} callback - Function to call with new data
     * @returns {function} - Unsubscribe function
     */
    subscribe: (path, callback) => {
        const userId = DirectFirebaseService.getUserId();
        if (!userId) {
            console.warn("DirectFirebaseService: No user logged in for subscription.");
            return () => { };
        }

        const docRef = doc(db, `users/${userId}/phi_data/${path}`);

        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // If we wrapped an array in 'data' field, unwrap it
                if (data && data.data && Array.isArray(data.data)) {
                    callback(data.data);
                } else {
                    callback(data);
                }
            } else {
                callback(null); // Document doesn't exist yet
            }
        }, (error) => {
            console.error(`DirectFirebaseService: Error subscribing to ${path}`, error);
        });
    },

    /**
     * Load data once
     */
    load: async (path) => {
        const userId = DirectFirebaseService.getUserId();
        if (!userId) return null;

        try {
            const docRef = doc(db, `users/${userId}/phi_data/${path}`);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return (data && data.data && Array.isArray(data.data)) ? data.data : data;
            }
            return null;
        } catch (error) {
            console.error(`DirectFirebaseService: Error loading ${path}`, error);
            return null;
        }
    }
};
