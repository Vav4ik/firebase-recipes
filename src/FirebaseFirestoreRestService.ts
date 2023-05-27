import { OrderByDirection } from "firebase/firestore";
import firebase from "./FirebaseConfig";
import { queryType, recipeType } from "./FirebaseFirestoreService";

const auth = firebase.auth;
const BASE_URL = process.env.REACT_APP_CLOUD_FIRESTORE_FUNCTION_API_URL;

const createDocument = async (collection: string, document: recipeType) => {
  let token: string | undefined;
  try {
    token = await auth.currentUser?.getIdToken();
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    }
    throw error;
  }

  try {
    const response = await fetch(`${BASE_URL}/${collection}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(document),
    });
    if (response.status !== 201) {
      const errorMessage = await response.text();
      const error = { message: errorMessage };
      throw error;
    }
    const result = await response.json();

    return result;
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    }
    throw error;
  }
};

const readDocuments = async (
  collection: string,
  queries: queryType[],
  orderByField: string,
  orderByDirection?: OrderByDirection | undefined,
  perPage?: number,
  pageNumber?: number
) => {
  try {
    const url = new URL(`${BASE_URL}/${collection}`);
    for (const query of queries) {
      url.searchParams.append(query.field as string, query.value);
    }
    if (orderByField) {
      url.searchParams.append("orderByField", orderByField);
    }
    if (orderByDirection) {
      url.searchParams.append("orderByDirection", orderByDirection);
    }
    if (perPage) {
      url.searchParams.append("perPage", String(perPage));
    }
    if (pageNumber) {
      url.searchParams.append("pageNumber", String(pageNumber));
    }

    let token: string | undefined;
    try {
      token = await auth.currentUser?.getIdToken();
    } catch (error) {
      //continue
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200) {
      const errorMessage = response.text();
      const error = { message: errorMessage };
      throw error;
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    }
    throw error;
  }
};

const updateDocument = async (
  collection: string,
  id: string,
  document: recipeType
) => {
  let token: string | undefined;
  try {
    token = await auth.currentUser?.getIdToken();
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    }
    throw error;
  }

  try {
    const response = await fetch(`${BASE_URL}/${collection}/${id}`, {
      method: "PUT",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(document),
    });
    if (response.status !== 200) {
      const errorMessage = await response.text();
      const error = { message: errorMessage };
      throw error;
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    }
    throw error;
  }
};

const deleteDocument = async (collection: string, id: string) => {
  let token: string | undefined;
  try {
    token = await auth.currentUser?.getIdToken();
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    }
    throw error;
  }

  try {
    const response = await fetch(`${BASE_URL}/${collection}/${id}`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (response.status !== 200) {
      const errorMessage = await response.text();
      const error = { message: errorMessage };
      throw error;
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    }
    throw error;
  }
};

const FirebaseFirestoreRestService = {
  createDocument,
  readDocuments,
  updateDocument,
  deleteDocument,
};

export default FirebaseFirestoreRestService;
