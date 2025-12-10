import admin from "firebase-admin";

let app;

if (!admin.apps.length) {
  let serviceAccount = JSON.parse(
    Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      "base64"
    ).toString("utf8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("🔥 Firebase Admin initialized (one-time).");
}

export const firestore = admin.firestore();
