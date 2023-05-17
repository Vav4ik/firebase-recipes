import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const FIREBASE_STORAGE_BUCKET = "fir-knit-recipes.appspot.com";

const apiFirebaseOptions = {
  ...functions.config().firebase,
  credential: admin.credential.applicationDefault(),
};

admin.initializeApp(apiFirebaseOptions);

const firestore = admin.firestore();
const settings = { timestampsInSnapshots: true };

firestore.settings(settings);

const storageBucket = admin.storage().bucket(FIREBASE_STORAGE_BUCKET);
const auth = admin.auth();

const FirebaseConfig = { functions, auth, firestore, storageBucket, admin }

export default FirebaseConfig ;
