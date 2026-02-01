// dataService.js - Firebase Firestore Data Service
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth, db } from "../firebase-config.js";

/**
 * Get current user's ID
 */
const getCurrentUserId = () => {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("No user logged in");
    }
    return user.uid;
};

/**
 * Save data to a specific collection for the current user
 * @param {string} collectionName - Name of the collection (e.g., 'inwardRegister', 'healthEducation')
 * @param {string} docId - Document ID
 * @param {object} data - Data to save
 */
export const saveData = async (collectionName, docId, data) => {
    try {
        const userId = getCurrentUserId();
        const userCollectionRef = collection(db, `users/${userId}/${collectionName}`);

        // Convert docId to string to ensure compatibility with Firestore
        const docIdString = String(docId);
        const docRef = doc(userCollectionRef, docIdString);

        await setDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString(),
            createdAt: data.createdAt || new Date().toISOString()
        }, { merge: true });

        return { success: true, id: docIdString };
    } catch (error) {
        console.error("Error saving data:", error);
        throw error;
    }
};

/**
 * Get a single document from a collection
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 */
export const getData = async (collectionName, docId) => {
    try {
        const userId = getCurrentUserId();
        const docIdString = String(docId);
        const docRef = doc(db, `users/${userId}/${collectionName}`, docIdString);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { ...docSnap.data(), id: docSnap.id };
        }
        return null;
    } catch (error) {
        console.error("Error getting data:", error);
        throw error;
    }
};

/**
 * Get all documents from a collection for the current user
 * @param {string} collectionName - Name of the collection
 */
export const getAllData = async (collectionName) => {
    try {
        let user = auth.currentUser;
        if (!user) {
            // Wait for auth to initialize
            user = await new Promise((resolve) => {
                const unsubscribe = auth.onAuthStateChanged((u) => {
                    unsubscribe();
                    resolve(u);
                });
            });
        }

        if (!user) {
            throw new Error("No user logged in");
        }

        const userId = user.uid; // Use resolved user
        const collectionRef = collection(db, `users/${userId}/${collectionName}`);
        const querySnapshot = await getDocs(collectionRef);

        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ ...doc.data(), id: doc.id });
        });

        return data;
    } catch (error) {
        console.error("Error getting all data:", error);
        throw error;
    }
};

/**
 * Update a document
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @param {object} data - Data to update
 */
export const updateData = async (collectionName, docId, data) => {
    try {
        const userId = getCurrentUserId();
        const docIdString = String(docId);
        const docRef = doc(db, `users/${userId}/${collectionName}`, docIdString);

        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });

        return { success: true, id: docIdString };
    } catch (error) {
        console.error("Error updating data:", error);
        throw error;
    }
};

/**
 * Delete a document
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 */
export const deleteData = async (collectionName, docId) => {
    try {
        const userId = getCurrentUserId();
        const docIdString = String(docId);
        const docRef = doc(db, `users/${userId}/${collectionName}`, docIdString);

        await deleteDoc(docRef);

        return { success: true, id: docIdString };
    } catch (error) {
        console.error("Error deleting data:", error);
        throw error;
    }
};

/**
 * Migrate data from localStorage to Firestore
 * @param {string} storageKey - localStorage key
 * @param {string} collectionName - Firestore collection name
 */
export const migrateLocalStorageToFirestore = async (storageKey, collectionName) => {
    try {
        const localData = localStorage.getItem(storageKey);
        if (!localData) {
            console.log(`No data found in localStorage for key: ${storageKey}`);
            return { success: true, migrated: 0 };
        }

        const data = JSON.parse(localData);
        if (!Array.isArray(data) || data.length === 0) {
            console.log(`No valid data to migrate for key: ${storageKey}`);
            return { success: true, migrated: 0 };
        }

        let migratedCount = 0;
        for (const item of data) {
            try {
                const id = item.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
                await saveData(collectionName, id, item);
                migratedCount++;
            } catch (error) {
                console.error(`Error migrating item:`, item, error);
            }
        }

        console.log(`Successfully migrated ${migratedCount} items from ${storageKey} to ${collectionName}`);
        return { success: true, migrated: migratedCount };
    } catch (error) {
        console.error("Error migrating data:", error);
        throw error;
    }
};

/**
 * Sync Firestore data to localStorage as backup
 * @param {string} collectionName - Firestore collection name
 * @param {string} storageKey - localStorage key
 */
export const syncFirestoreToLocalStorage = async (collectionName, storageKey) => {
    try {
        const data = await getAllData(collectionName);
        localStorage.setItem(storageKey, JSON.stringify(data));
        return { success: true, synced: data.length };
    } catch (error) {
        console.error("Error syncing to localStorage:", error);
        throw error;
    }
};

/**
 * Check if user is online
 */
export const isOnline = () => {
    return navigator.onLine;
};

/**
 * Save to localStorage with Firestore sync
 * @param {string} collectionName - Firestore collection name
 * @param {string} storageKey - localStorage key
 * @param {string} docId - Document ID
 * @param {object} data - Data to save
 */
export const saveWithSync = async (collectionName, storageKey, docId, data) => {
    try {
        // Save to Firestore first
        if (isOnline()) {
            await saveData(collectionName, docId, data);
        }

        // Update localStorage
        const localData = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const index = localData.findIndex(item => item.id === docId);

        if (index >= 0) {
            localData[index] = { ...data, id: docId };
        } else {
            localData.unshift({ ...data, id: docId });
        }

        localStorage.setItem(storageKey, JSON.stringify(localData));

        return { success: true, id: docId };
    } catch (error) {
        console.error("Error in saveWithSync:", error);

        // If Firestore fails, still save to localStorage
        const localData = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const index = localData.findIndex(item => item.id === docId);

        if (index >= 0) {
            localData[index] = { ...data, id: docId };
        } else {
            localData.unshift({ ...data, id: docId });
        }

        localStorage.setItem(storageKey, JSON.stringify(localData));

        return { success: true, id: docId, offline: true };
    }
};

/**
 * Delete with sync
 */
export const deleteWithSync = async (collectionName, storageKey, docId) => {
    try {
        // Delete from Firestore
        if (isOnline()) {
            await deleteData(collectionName, docId);
        }

        // Delete from localStorage
        const localData = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const filtered = localData.filter(item => item.id !== docId);
        localStorage.setItem(storageKey, JSON.stringify(filtered));

        return { success: true, id: docId };
    } catch (error) {
        console.error("Error in deleteWithSync:", error);
        throw error;
    }
};

/**
 * Load all data with sync
 */
export const loadWithSync = async (collectionName, storageKey) => {
    try {
        if (isOnline()) {
            // Load from Firestore
            const firestoreData = await getAllData(collectionName);

            // Update localStorage
            localStorage.setItem(storageKey, JSON.stringify(firestoreData));

            return firestoreData;
        } else {
            // Load from localStorage if offline
            return JSON.parse(localStorage.getItem(storageKey) || "[]");
        }
    } catch (error) {
        console.error("Error in loadWithSync:", error);
        // Fallback to localStorage
        return JSON.parse(localStorage.getItem(storageKey) || "[]");
    }
};

export default {
    saveData,
    getData,
    getAllData,
    updateData,
    deleteData,
    migrateLocalStorageToFirestore,
    syncFirestoreToLocalStorage,
    saveWithSync,
    deleteWithSync,
    loadWithSync,
    isOnline
};
