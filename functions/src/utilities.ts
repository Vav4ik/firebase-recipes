import { Auth } from "firebase-admin/auth";

//types
export type recipeType = {
  name: string;
  category: string;
  directions: string;
  publishDate: number;
  isPublished: boolean;
  ingredients: string[];
  imageUrl: string;
};

const authorizeUser = async (
  authorizationHeader: string | undefined,
  firebaseAuth: Auth
) => {
  if (!authorizationHeader || authorizationHeader === "") {
    throw new Error("No authorization provided!");
  }
  const token = authorizationHeader.split(" ")[1];

  try {
    const decodedToken = await firebaseAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw error;
  }
};

const validateRecipePost = (newRecipe: recipeType) => {
  let missingFields = "";

  if (!newRecipe) {
    missingFields = "recipe";
    return missingFields;
  }
  if (!newRecipe.name) {
    missingFields += "name,";
  }
  if (!newRecipe.category) {
    missingFields += "category,";
  }
  if (!newRecipe.directions) {
    missingFields += "directions,";
  }
  if (!newRecipe.publishDate || newRecipe.publishDate === 0) {
    missingFields += "publishDate,";
  }
  if (!newRecipe.imageUrl) {
    missingFields += "imageUrl,";
  }
  if (!newRecipe.isPublished !== true && newRecipe.isPublished !== false) {
    missingFields += "isPublished,";
  }
  if (!newRecipe.ingredients || newRecipe.ingredients.length === 0) {
    missingFields += "ingredients,";
  }
  return missingFields;
};

const sanitizeRecipePost = (newRecipe: recipeType) => {
  const recipe: recipeType = {
    name: "",
    category: "",
    directions: "",
    publishDate: 0,
    isPublished: false,
    imageUrl: "",
    ingredients: [],
  };

  recipe.name = newRecipe.name;
  recipe.category = newRecipe.category;
  recipe.directions = newRecipe.directions;
  recipe.publishDate = newRecipe.publishDate;
  recipe.isPublished = newRecipe.isPublished;
  recipe.imageUrl = newRecipe.imageUrl;
  recipe.ingredients = newRecipe.ingredients;

  return recipe;
};

const Utilities = {
  authorizeUser,
  validateRecipePost,
  sanitizeRecipePost,
};

export default Utilities;
