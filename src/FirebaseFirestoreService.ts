import firebase from "./FirebaseConfig";
import {
  addDoc,
  doc,
  getDoc,
  collection as firestoreCollection,
  query,
  where,
  orderBy,
  limit,
  startAfter as startAfterDoc,
  endBefore as endBeforeDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  FieldPath,
  WhereFilterOp,
  OrderByDirection,
  limitToLast,
} from "firebase/firestore";

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
export type recipeWithIdType = { id: string } & recipeType;
export type queryType = {
  field: string | FieldPath;
  condition: WhereFilterOp;
  value: any;
};

const firestore = firebase.firestore;

const createDocument = (collection: string, document: recipeType) => {
  return addDoc(firestoreCollection(firestore, collection), document);
};

const readDocument = (collection: string, id: string) => {
  // return firestore.collection(collection).doc(id).get();
  return getDoc(doc(firestoreCollection(firestore, collection), id));
};

const readDocuments = async (
  collection: string,
  queries: queryType[],
  orderByField: string | FieldPath,
  perPage: number,
  orderByDirection?: OrderByDirection | undefined,
  startAfter?: string,
  endBefore?: string
) => {
  // let collectionRef: firebase.firestore.Query<firebase.firestore.DocumentData> =
  //   firestore.collection(collection);
  const collectionRef = firestoreCollection(firestore, collection);
  const queryConstraints = [];

  if (queries && queries.length > 0) {
    for (const query of queries) {
      queryConstraints.push(where(query.field, query.condition, query.value));
    }
  }
  if (orderByField && orderByDirection) {
    queryConstraints.push(orderBy(orderByField, orderByDirection));
  }

  if (!startAfter && !endBefore) {
    queryConstraints.push(limit(perPage));
  }
  if (startAfter) {
    const document = await readDocument(collection, startAfter);
    queryConstraints.push(startAfterDoc(document));
    queryConstraints.push(limit(perPage));
  }
  if (endBefore) {
    const document = await readDocument(collection, endBefore);
    queryConstraints.push(endBeforeDoc(document));
    queryConstraints.push(limitToLast(perPage));
  }
  

  const firestoreQuery = query(collectionRef, ...queryConstraints)

  return getDocs(firestoreQuery);
};

const updateDocument = (
  collection: string,
  id: string,
  document: recipeType
) => {
  return updateDoc(doc(firestoreCollection(firestore, collection), id), document)
};

const deleteDocument = (collection: string, id: string) => {
  return deleteDoc(doc(firestoreCollection(firestore, collection), id))
};

const FirebaseFirestoreService = {
  createDocument,
  readDocuments,
  updateDocument,
  deleteDocument,
};

export default FirebaseFirestoreService;
