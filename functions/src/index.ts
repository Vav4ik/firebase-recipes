import FirebaseConfig from "./FirebaseConfig";
import recipesApi from "./recipesApi";

const functions = FirebaseConfig.functions;
const firestore = FirebaseConfig.firestore;
const storageBucket = FirebaseConfig.storageBucket;
const admin = FirebaseConfig.admin;

//Functions that are triggered based on Firestore changes
export const onCreateRecipe = functions.firestore
  .document("recipes/{recipeId}")
  .onCreate(async (snapshot) => {
    const countDocRef = firestore.collection("recipeCounts").doc("all");
    const countDoc = await countDocRef.get();

    if (countDoc.exists) {
      countDocRef.update({ count: admin.firestore.FieldValue.increment(1) });
    } else {
      countDocRef.set({ count: 1 });
    }

    const recipe = snapshot.data();

    if (recipe.isPublished) {
      const countPublishedDocRef = firestore
        .collection("recipeCounts")
        .doc("published");
      const countPublishedDoc = await countPublishedDocRef.get();

      if (countPublishedDoc.exists) {
        countPublishedDocRef.update({
          count: admin.firestore.FieldValue.increment(1),
        });
      } else {
        countPublishedDocRef.set({ count: 1 });
      }
    }
  });

export const onDeleteRecipe = functions.firestore
  .document("recipes/{recipeId}")
  .onDelete(async (snapshot) => {
    const recipe = snapshot.data();
    const imageUrl = recipe.imageUrl;

    if (imageUrl) {
      const decodedUrl = decodeURIComponent(imageUrl);
      const startIndex = decodedUrl.indexOf("/o/") + 3;
      const endIndex = decodedUrl.indexOf("?");
      const fullFilePath = decodedUrl.substring(startIndex, endIndex);
      const file = storageBucket.file(fullFilePath);

      console.log(`Attemting to delete: ${fullFilePath}`);

      try {
        await file.delete();
        console.log("Successfully deleted image");
      } catch (error) {
        console.log(`Failed to delete an image: ${error}`);
      }
    }

    const countDocRef = firestore.collection("recipeCounts").doc("all");
    const countDoc = await countDocRef.get();

    if (countDoc.exists) {
      countDocRef.update({ count: admin.firestore.FieldValue.increment(-1) });
    } else {
      countDocRef.set({ count: 0 });
    }

    if (recipe.isPublished) {
      const countPublishedDocRef = firestore
        .collection("recipeCounts")
        .doc("published");
      const countPublishedDoc = await countPublishedDocRef.get();

      if (countPublishedDoc.exists) {
        countPublishedDocRef.update({
          count: admin.firestore.FieldValue.increment(-1),
        });
      } else {
        countPublishedDocRef.set({ count: 0 });
      }
    }
  });

export const onUpdateRecipe = functions.firestore
  .document("recipes/{recipeId}")
  .onUpdate(async (changes) => {
    const oldRecipe = changes.before.data();
    const newRecipe = changes.after.data();

    let publishCount = 0;

    if (!oldRecipe.isPublished && newRecipe.isPublished) {
      publishCount += 1;
    } else if (oldRecipe.isPublished && !newRecipe.isPublished) {
      publishCount -= 1;
    }

    if (publishCount !== 0) {
      const countPublishedDocRef = firestore
        .collection("recipeCounts")
        .doc("published");
      const countPublishedDoc = await countPublishedDocRef.get();

      if (countPublishedDoc.exists) {
        countPublishedDocRef.update({
          count: admin.firestore.FieldValue.increment(publishCount),
        });
      } else {
        if (publishCount > 0) {
          countPublishedDocRef.set({ count: publishCount });
        } else {
          countPublishedDocRef.set({ count: 0 });
        }
      }
    }
  });

//Scheduled cronjob functions
// https://crontab.guru/
const runtimeOptions = {
  timeoutSeconds: 300,
  memory: "256MB" as const,
};

export const dailyCheckRecipePublishDate = functions
  .runWith(runtimeOptions)
  .pubsub.schedule("0 0 * * *")
  .onRun(async () => {
    console.log("dailyCheckRecipePublishDate() called - time to check");

    const snapshot = await firestore
      .collection("recipes")
      .where("isPublished", "==", false)
      .get();

    snapshot.forEach(async (doc) => {
      const data = doc.data();
      const now = Date.now();
      const isPublished = data.publishDate <= now ? true : false;

      if (isPublished) {
        console.log(`Recipe ${data.name} with ID:${doc.id} is now published!`);

        await firestore
          .collection("recipes")
          .doc(doc.id)
          .set({ isPublished }, { merge: true });
      }
    });
  });

export const api = functions.https.onRequest(recipesApi);

console.log("SERVER STARTED");

/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript

// export const helloworld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
