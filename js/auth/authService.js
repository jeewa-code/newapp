import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    doc,
    setDoc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth, db, googleProvider, facebookProvider } from "../firebase-config.js";

const SUPER_ADMINS = ['jeewanthaalwis5@gmail.com', 'jeewanthaalwis@gmail.com'];

const checkAndEnforceSuperAdmin = async (user, currentRole) => {
    if (SUPER_ADMINS.includes(user.email) && currentRole !== 'admin') {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { role: 'admin' });
        return 'admin';
    }
    return currentRole;
};

export const registerUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store basic user details in Firestore
        // Profile will be completed later
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            role: 'user', // Default role until updated
            profileCompleted: false,
            createdAt: new Date().toISOString()
        });

        return { user, role: 'user' };
    } catch (error) {
        throw error;
    }
};

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user role
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.isBlocked) {
                await signOut(auth);
                throw new Error("Account is blocked. Please contact administrator.");
            }

            let role = userData.role;
            // Check for Super Admin privilege enforcement
            role = await checkAndEnforceSuperAdmin(user, role);

            return { user, role, name: userData.name };
        } else {
            // Check if this new/unknown user should be a super admin
            let role = 'user';
            if (SUPER_ADMINS.includes(user.email)) {
                role = 'admin';
                // We should probably create the doc if it doesn't exist, but the caller expects us to just return.
                // Ideally, login shouldn't be handling doc creation if register does, but for safety:
                // Let's just return the role. The checkAndEnforceSuperAdmin needs a doc to update though.
            }
            return { user, role };
        }
    } catch (error) {
        throw error;
    }
};

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user exists in Firestore, if not create as 'user'
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().isBlocked) {
            await signOut(auth);
            throw new Error("Account is blocked. Please contact administrator.");
        }

        let role = 'user';

        // Check if user should be super admin
        if (SUPER_ADMINS.includes(user.email)) {
            role = 'admin';
        }

        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                email: user.email,
                role: role,
                name: user.displayName,
                createdAt: new Date().toISOString()
            });
        } else {
            role = userDoc.data().role;
            // Enforce super admin if existing user
            role = await checkAndEnforceSuperAdmin(user, role);
        }

        return { user, role };
    } catch (error) {
        throw error;
    }
};

export const loginWithFacebook = async () => {
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        const user = result.user;

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().isBlocked) {
            await signOut(auth);
            throw new Error("Account is blocked. Please contact administrator.");
        }

        let role = 'user';

        // Check if user should be super admin
        if (SUPER_ADMINS.includes(user.email)) {
            role = 'admin';
        }

        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                email: user.email,
                role: role,
                name: user.displayName,
                createdAt: new Date().toISOString()
            });
        } else {
            role = userDoc.data().role;
            // Enforce super admin if existing user
            role = await checkAndEnforceSuperAdmin(user, role);
        }

        return { user, role };
    } catch (error) {
        throw error;
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
};

export const updateUserRole = async (userId, newRole) => {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            role: newRole
        });
        return true;
    } catch (error) {
        throw error;
    }
};

export const checkAuthStatus = (callback) => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const role = data.role;
                callback(user, role, data.profileCompleted);

                // Update lastActive timestamp
                updateDoc(doc(db, "users", user.uid), {
                    lastActive: new Date().toISOString()
                }).catch(e => console.error("Error updating presence", e));
            } else {
                callback(user, 'user', false);
            }
        } else {
            callback(null, null);
        }
    });
};
