import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import {
  DocumentData,
  DocumentReference,
  OrderByDirection,
  Query,
} from "firebase-admin/firestore";

import FirebaseConfig from "./FirebaseConfig";
import Utilities from "./utilities";

const auth = FirebaseConfig.auth;
const firestore = FirebaseConfig.firestore;

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());

// ~~RESTFUL CRUD API ENDPOINTS~~
app.get("/recipes", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];

  const queryObject = req.query;
  const category = queryObject["category"] ? queryObject["category"] : "";
  const orderByField = queryObject["orderByField"]
    ? (queryObject["orderByField"] as string)
    : "";
  const orderByDirection = queryObject["orderByDirection"]
    ? (queryObject["orderByDirection"] as OrderByDirection)
    : "asc";
  const perPage = queryObject["perPage"] ? queryObject["perPage"] : "";
  const pageNumber = queryObject["pageNumber"]
    ? Number(queryObject["pageNumber"])
    : 0;

  let isAuth = false;
  let collectionRef: Query<DocumentData> = firestore.collection("recipes");

  try {
    await Utilities.authorizeUser(authorizationHeader, auth);
    isAuth = true;
  } catch (error) {
    collectionRef = collectionRef.where("isPublished", "==", true);
  }

  if (category) {
    collectionRef = collectionRef.where("category", "==", category);
  }
  if (orderByField) {
    collectionRef = collectionRef.orderBy(orderByField, orderByDirection);
  }
  if (perPage) {
    collectionRef = collectionRef.limit(Number(perPage));
  }
  if (pageNumber > 0 && perPage) {
    const pageNumberMultiplier = pageNumber - 1;
    const offset = pageNumberMultiplier * Number(perPage);
    //DO NOT USE offset in your projects
    // https://firebeast.dev/tips/do-not-use-offset
    collectionRef = collectionRef.offset(offset);
  }

  let recipeCount = 0;
  let countDocRef: DocumentReference<DocumentData>;

  if (isAuth) {
    countDocRef = firestore.collection("recipeCounts").doc("all");
  } else {
    countDocRef = firestore.collection("recipeCounts").doc("published");
  }

  const countDoc = await countDocRef.get();
  if (countDoc.exists) {
    const countDocData = countDoc.data();
    if (countDocData) {
      recipeCount = countDocData.count;
    }
  }

  try {
    const firestoreResponse = await collectionRef.get();
    const fetchedRecipes = firestoreResponse.docs.map((recipe) => {
      const id = recipe.id;
      const data = recipe.data();
      return { ...data, id };
    });
    const payload = {
      recipeCount,
      recipes: fetchedRecipes,
    };
    res.status(200).json(payload);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
      return;
    }
    res.status(400).send("Error fetching recipes.");
    return;
  }
});

// just another one :)
app.get("/batman", (req, res) => {
  res.json({
    id: "lkisejfoi",
    name: "Batman",
    cars: ["Lambo", "Skoda", "Ford"],
    awesome: true,
  });
});

app.post("/recipes", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];

  if (!authorizationHeader) {
    res.status(401).send("Missing Authorization Header");
    return;
  }

  try {
    await Utilities.authorizeUser(authorizationHeader, auth);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).send(error.message);
      return;
    }
    res.status(401).send("Not Authorized");
    return;
  }

  const newRecipe = req.body;

  const missingFields = Utilities.validateRecipePost(newRecipe);
  if (missingFields) {
    res
      .status(400)
      .send(`Recipe is not valid. Missing/invalid fields: ${missingFields}`);
    return;
  }

  const recipe = Utilities.sanitizeRecipePost(newRecipe);

  try {
    const firestoreResponse = await firestore.collection("recipes").add(recipe);
    const recipeId = firestoreResponse.id;
    res.status(201).json({ id: recipeId });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
      return;
    }
    res.status(400).send("Error creating new recipe.");
    return;
  }
});

app.put("/recipes/:id", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];

  if (!authorizationHeader) {
    res.status(401).send("Missing Authorization Header");
    return;
  }

  try {
    await Utilities.authorizeUser(authorizationHeader, auth);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).send(error.message);
      return;
    }
    res.status(401).send("Not Authorized");
    return;
  }

  const id = req.params.id;
  const newRecipe = req.body;

  const missingFields = Utilities.validateRecipePost(newRecipe);
  if (missingFields) {
    res
      .status(400)
      .send(`Recipe is not valid. Missing/invalid fields: ${missingFields}`);
    return;
  }

  const recipe = Utilities.sanitizeRecipePost(newRecipe);

  try {
    // can use app.patch bla-bla-bla.doc(id).set(recipe, { merge: true })
    await firestore.collection("recipes").doc(id).set(recipe);
    res.status(200).json({ id });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
      return;
    }
    res.status(400).send("Error updating a recipe.");
    return;
  }
});

app.delete("/recipes/:id", async (req, res) => {
  const authorizationHeader = req.headers["authorization"];

  if (!authorizationHeader) {
    res.status(401).send("Missing Authorization Header");
    return;
  }

  try {
    await Utilities.authorizeUser(authorizationHeader, auth);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).send(error.message);
      return;
    }
    res.status(401).send("Not Authorized");
    return;
  }

  const id = req.params.id;
  
  try {
    await firestore.collection("recipes").doc(id).delete();
    res.status(200).json({ id });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).send(error.message);
      return;
    }
    res.status(400).send("Error updating a recipe.");
    return;
  }
});

//Run in local enviroment
// npx tsc --outDir ./lib/
// node lib/recipesApi.js
if (process.env.NODE_ENV !== "production") {
  const port = 3005;
  app.listen(port, () => {
    console.log(`API started at port ${port}`);
  });
}

export default app;
