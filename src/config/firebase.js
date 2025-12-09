import admin from "firebase-admin";

const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

// Validasi ENV
const requiredEnv = [
    "FIREBASE_PRIVATE_KEY",
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_CLIENT_ID"
];

requiredEnv.forEach((key) => {
    if (!process.env[key]) {
        console.warn(`[FIREBASE WARNING] Missing ENV: ${key}`);
    }
});

if (!privateKey) {
    console.error("[FIREBASE ERROR] Private key is missing or invalid!");
}

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            type: process.env.FIREBASE_TYPE,
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key: privateKey,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
        }),
    });

    console.log("🔥 Firebase Admin initialized successfully.");

} catch (err) {
    console.error("❌ Firebase Admin initialization FAILED:", err.message);
}

export const firestore = admin.firestore();

(async () => {
    try {
        await firestore.listCollections();
        console.log("✅ Firestore connection OK.");
    } catch (err) {
        console.error("❌ Firestore connection FAILED:", err.message);
    }
})();
