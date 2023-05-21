import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";

import FirebaseConfig from "./FirebaseConfig";
import Utilities from "./utilities";

const auth = FirebaseConfig.auth;
const firestore = FirebaseConfig.firestore;

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());

// ~~RESTFUL CRUD API ENDPOINTS~~
app.get("/", (req, res) => {
  res.send("Hello from Firebase EXpress API!!!");
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
