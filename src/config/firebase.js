import admin from "firebase-admin";

let serviceAccount = null;

// 1. Decode base64
try {
  const decoded = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
    "base64"
  ).toString("utf8");

  serviceAccount = JSON.parse(decoded);
  console.log("🔥 Firebase service account decoded successfully.");
} catch (err) {
  console.error("❌ Failed to decode service account:", err.message);
}

// 2. Init Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("🔥 Firebase Admin initialized.");
} catch (err) {
  console.error("❌ Firebase Admin init FAILED:", err.message);
}

export const firestore = admin.firestore();

// 3. Test connection
(async () => {
  try {
    await firestore.listCollections();
    console.log("✅ Firestore connection OK.");
  } catch (err) {
    console.error("❌ Firestore connection FAILED:", err.message);
  }
})();
