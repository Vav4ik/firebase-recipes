import {
  FC,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useState,
} from "react";
import { recipeType, recipeWithIdType } from "../FirebaseFirestoreService";

type AddEditRecipeFormProps = {
  existingRecipe: recipeWithIdType | null;
  onAddRecipe: (newRecipe: recipeType) => void;
  onUpdateRecipe: (updatedRecipe: recipeType, recipeId: string) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onCancel: () => void;
};

const AddEditRecipeForm: FC<AddEditRecipeFormProps> = ({
  existingRecipe,
  onAddRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [directions, setDirections] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientName, setIngredientName] = useState("");

  const resetForm = () => {
    setName("");
    setCategory("");
    setPublishDate("");
    setDirections("");
    setIngredients([]);
  };

  useEffect(() => {
    if (existingRecipe) {
      setName(existingRecipe.name);
      setCategory(existingRecipe.category);
      setPublishDate(
        new Date(existingRecipe.publishDate).toISOString().split("T")[0]
      );
      setDirections(existingRecipe.directions);
      setIngredients(existingRecipe.ingredients);
    } else {
      resetForm();
    }
  }, [existingRecipe]);

  const addIngredient = () => {
    if (!ingredientName) {
      alert("Can't Add Empty Ingredient Field!");
      return;
    }
    setIngredients([...ingredients, ingredientName]);
    setIngredientName("");
  };

  const handleEnterIngredient = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key && e.key !== "Enter") {
      return;
    }
    e.preventDefault();
    addIngredient();
  };

  const handleAddIngredient = (e: MouseEvent<HTMLButtonElement>) => {
    addIngredient();
  };

  const handleRecipeFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (ingredients.length === 0) {
      alert("No ingredients added!");
      return;
    }

    const isPublished =
      new Date(publishDate).getTime() <= new Date().getTime() ? true : false;

    const newRecipe = {
      name,
      category,
      directions,
      publishDate: new Date(publishDate).getTime(),
      isPublished,
      ingredients,
    };
    if (existingRecipe) {
      onUpdateRecipe(newRecipe, existingRecipe.id);
    } else {
      onAddRecipe(newRecipe);
    }
    resetForm();
  };

  return (
    <div>
      {existingRecipe ? <h2>Update the Recipe</h2> : <h2>Add a New Recipe</h2>}
      <form
        className="add-edit-recipe-form-container"
        onSubmit={handleRecipeFormSubmit}
      >
        <div className="top-form-section">
          <div className="fields">
            <label className="input-label recipe-label">
              Recipe Name:
              <input
                type="text"
                className="input-text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="input-label recipe-label">
              Category:
              <select
                className="select"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value=""> - Select Category - </option>
                <option value="breadsSandwichesAndPizza">
                  Breads, Sandwiches and Pizza
                </option>
                <option value="eggsAndBreakfast">Eggs & Breakfast</option>
                <option value="dessertsAndBakedGoods">
                  Desserts & Baked Goods
                </option>
                <option value="fishAndSeafood">Fish & Seafood</option>
                <option value="vegetables">Vegetables</option>
              </select>
            </label>
            <label className="input-label recipe-label">
              Directions:
              <textarea
                className="input-text directions"
                required
                value={directions}
                onChange={(e) => setDirections(e.target.value)}
              />
            </label>
            <label className="input-label recipe-label">
              Publish Date:
              <input
                type="date"
                className="input-text"
                required
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
              />
            </label>
          </div>
        </div>
        <div className="ingredients-list">
          <h3 className="text-center">Ingredients</h3>
          <table className="ingredients-table">
            <thead>
              <tr>
                <th className="table-header">Ingredient</th>
                <th className="table-header">Delete</th>
              </tr>
            </thead>
            <tbody>
              {ingredients && ingredients.length > 0
                ? ingredients.map((ingredient, index) => {
                    return (
                      <tr key={index}>
                        <td className="table-data text-center">{ingredient}</td>
                        <td className="ingredient-delete-box">
                          <button
                            type="button"
                            className="secondary-button ingredient-delete-button"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                : null}
            </tbody>
          </table>
          {ingredients && ingredients.length === 0 && (
            <h3 className="text-center no-ingredients">
              No Ingredients Added Yet
            </h3>
          )}
          <div className="ingredient-form">
            <label className="ingredient-label">
              Ingredient:
              <input
                type="text"
                className="input-text"
                value={ingredientName}
                onChange={(e) => setIngredientName(e.target.value)}
                onKeyDown={handleEnterIngredient}
                placeholder="ex. 1 cup of sugar"
              />
            </label>
            <button
              type="button"
              className="primary-button add-ingredient-button"
              onClick={handleAddIngredient}
            >
              Add Ingredient
            </button>
          </div>
        </div>
        <div className="action-buttons">
          <button type="submit" className="primary-button action-button">
            {existingRecipe ? "Update Recipe" : "Create Recipe"}
          </button>
          {existingRecipe && (
            <>
              <button
                type="button"
                className="primary-button action-button"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button action-button"
                onClick={() => onDeleteRecipe(existingRecipe.id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddEditRecipeForm;
