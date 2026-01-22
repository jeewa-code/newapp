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

export const registerUser = async (email, password, role, name) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user details and role in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            role: role,
            name: name,
            createdAt: new Date().toISOString()
        });

        return { user, role };
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
            const role = userDoc.exists() ? userDoc.data().role : 'user';
            callback(user, role);
        } else {
            callback(null, null);
        }
    });
};
