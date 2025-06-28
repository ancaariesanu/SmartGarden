const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
sgMail.setApiKey("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"); // 🔁 înlocuiește cu cheia ta reală

exports.sendSoilMoistureAlert = functions.database
  .ref("/realtime_data/{userId}/plant1/sensors/soilMoisture")
  .onWrite(async (change, context) => {
    const newValue = change.after.val();
    const userId = context.params.userId;

    // trimite alertă doar dacă e sub 30%
    if (newValue >= 30) return null;

    // obține emailul utilizatorului din Firestore
    const userDoc = await admin.firestore().doc(`users/${userId}`).get();
    const userData = userDoc.data();
    const email = userData?.email;

    if (!email) return null;

    const msg = {
      to: email,
      from: "alerts@smartgarden.com",
      subject: "🌱 Alertă: Umiditate scăzută la plantă!",
      text: `Planta ta are umiditate foarte scăzută în sol (${newValue}%). Ar trebui să o uzi cât mai curând.`,
    };

    await sgMail.send(msg);
    console.log("Email trimis către:", email);
    return null;
  });
