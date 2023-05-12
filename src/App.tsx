import {
  useCallback,
  useEffect,
  useState,
  // useTransition,
  startTransition,
} from "react";
import firebase from "firebase/compat";
import "./App.css";
import FirebaseAuthService from "./FirebaseAuthService";
import FirebaseFirestoreService, {
  queryType,
  recipeType,
  recipeWithIdType,
} from "./FirebaseFirestoreService";
import LoginForm from "./components/LoginForm";
import AddEditRecipeForm from "./components/AddEditRecipeForm";

function App() {
  //this hook for some reason doesn't work
  // const [isPending, startTransition] = useTransition();

  const [user, setUser] = useState<firebase.User | null>(null);
  const [recipes, setRecipes] = useState<recipeWithIdType[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<recipeWithIdType | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [orderBy, setOrderBy] = useState("publishDateDesc");
  const [recipesPerPage, setRecipesPerPage] = useState(3);

  const handleRecipesPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRecipes([]);
    setRecipesPerPage(Number(event.target.value));
  };

  //"LOAD MORE" button pagination https://www.youtube.com/watch?v=qorrvkqkq0c
  //Infinite scroll pagination https://www.youtube.com/watch?v=huJhkqED0ig

  const handleLoadPrevPage = () => {
    const firstRecipe = recipes[0];
    const endBefore = firstRecipe.id;
    fetchRecipes("", endBefore);
  };
  const handleLoadNextPage = () => {
    const lastRecipe = recipes[recipes.length - 1];
    const startAfter = lastRecipe.id;
    fetchRecipes(startAfter, "");
  };

  const fetchRecipes = useCallback(
    async (startAfter = "", endBefore = "") => {
      //queries, filters
      const queries: queryType[] = [];
      if (!user) {
        queries.push({
          field: "isPublished",
          condition: "==",
          value: true,
        });
      }
      if (categoryFilter) {
        queries.push({
          field: "category",
          condition: "==",
          value: categoryFilter,
        });
      }
      //order by
      const orderByField = "publishDate";
      let orderByDirection: firebase.firestore.OrderByDirection | undefined;
      switch (orderBy) {
        case "publishDateAsc":
          orderByDirection = "asc";
          break;
        case "publishDateDesc":
          orderByDirection = "desc";
          break;
        default:
          break;
      }

      try {
        const response = await FirebaseFirestoreService.readDocuments(
          "recipes",
          queries,
          orderByField,
          recipesPerPage,
          orderByDirection,
          startAfter,
          endBefore
        );
        const newRecipes = response.docs.map((recipeDoc) => {
          const id = recipeDoc.id;
          const data = recipeDoc.data() as recipeType;
          return { ...data, id };
        });
        setRecipes(newRecipes);
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
          console.log(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [categoryFilter, orderBy, recipesPerPage, user]
  );

  useEffect(() => {
    setIsLoading(true);
    fetchRecipes();
  }, [fetchRecipes]);

  FirebaseAuthService.subcribeToAuthCahnges(setUser);

  const handleAddRecipe = async (newRecipe: recipeType) => {
    try {
      const response = await FirebaseFirestoreService.createDocument(
        "recipes",
        newRecipe
      );
      fetchRecipes();
      alert(`New recipe created with ID: ${response.id}`);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleUpdateRecipe = async (
    updatedRecipe: recipeType,
    recipeId: string
  ) => {
    try {
      await FirebaseFirestoreService.updateDocument(
        "recipes",
        recipeId,
        updatedRecipe
      );
      fetchRecipes();
      alert(`Recipe with ID: ${recipeId} was successfully updated.`);
      setCurrentRecipe(null);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleEditRecipeClick = (recipeId: string) => {
    startTransition(() => {
      const selectedRecipe = recipes.find((recipe) => recipeId === recipe.id);
      if (selectedRecipe) {
        setCurrentRecipe(selectedRecipe);
      }
    });
    window.scrollTo(0, document.body.scrollHeight);
  };

  const handleEditRecipeCancel = () => {
    startTransition(() => {
      setCurrentRecipe(null);
    });
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    const deleteConfirmation = window.confirm("Delete? Are you sure?");
    if (deleteConfirmation) {
      try {
        await FirebaseFirestoreService.deleteDocument("recipes", recipeId);
        fetchRecipes();
        // startTransition(() => {
        setCurrentRecipe(null);
        // });
        window.scrollTo(0, 0);
        alert("Recipe deleted");
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        }
      }
    }
  };

  //can be more detailed here about types and constatnts, but this is simple
  //more info in button types in crwn-clothing project
  const CATEGORIES = {
    breadsSandwichesAndPizza: "Breads, Sandwiches and Pizza",
    eggsAndBreakfast: "Eggs & Breakfast",
    dessertsAndBakedGoods: "Desserts & Baked Goods",
    fishAndSeafood: "Fish & Seafood",
    vegetables: "Vegetables",
  };
  const lookupCategoryLabel = (categoryKey: string) =>
    CATEGORIES[categoryKey as keyof typeof CATEGORIES];

  //formating the date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const day = date.getUTCDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    return `${day} of ${month}, ${year}`;
  };

  return (
    <div className="App">
      <div className="title-row">
        <h1 className="title">Firebase Recipes</h1>
        <LoginForm existingUser={user} />
      </div>
      <div className="main">
        <div className="row filters">
          <label className="input-label recipe-label">
            Filter by Category:
            <select
              className="select"
              required
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value=""> All Categories </option>
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
          <label className="input-label">
            <select
              className="select"
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
            >
              <option value="publishDateDesc">
                Publish Date - newest first
              </option>
              <option value="publishDateAsc">
                Publish Date - oldest first
              </option>
            </select>
          </label>
        </div>
        <div className="center">
          <div className="recipe-list-box">
            {isLoading && (
              <div className="fire">
                <div className="flames">
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                  <div className="flame"></div>
                </div>
                <div className="logs"></div>
              </div>
            )}
            {!isLoading && recipes && recipes.length === 0 && (
              <h5 className="no-recipes">No Recipes Found</h5>
            )}
            {!isLoading && recipes && recipes.length > 0 && (
              <div className="recipe-list">
                {recipes.map((recipe) => (
                  <div className="recipe-card" key={recipe.id}>
                    {!recipe.isPublished && (
                      <div className="unpublished">UNPUBLISHED</div>
                    )}
                    <div className="recipe-name">{recipe.name}</div>
                    <div className="recipe-image-box">
                      {recipe.imageUrl && (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.name}
                          className="recipe-image"
                        />
                      )}
                    </div>
                    <div className="recipe-field">
                      Category: {lookupCategoryLabel(recipe.category)}
                    </div>
                    <div className="recipe-field">
                      Published: {formatDate(recipe.publishDate)}
                    </div>
                    {user && (
                      <button
                        type="button"
                        className="primary-button edit-button"
                        onClick={() => handleEditRecipeClick(recipe.id)}
                      >
                        EDIT
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* {isPending && <p>Loading...</p>} */}
        {(isLoading || (recipes && recipes.length > 0)) && (
          <>
            <label className="input-label">
              Recipes Per Page:
              <select
                className="select"
                value={recipesPerPage}
                onChange={handleRecipesPerPageChange}
              >
                <option value="3">3</option>
                <option value="6">6</option>
                <option value="9">9</option>
              </select>
            </label>
            <div className="pagination">
              <button
                type="button"
                className="primary-button"
                onClick={handleLoadPrevPage}
              >
                Prev Page
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleLoadNextPage}
              >
                Next Page
              </button>
            </div>
          </>
        )}
        {user && (
          <AddEditRecipeForm
            existingRecipe={currentRecipe}
            onAddRecipe={handleAddRecipe}
            onUpdateRecipe={handleUpdateRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            onCancel={handleEditRecipeCancel}
          />
        )}
      </div>
    </div>
  );
}

export default App;
