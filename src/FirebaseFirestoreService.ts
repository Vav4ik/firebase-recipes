import firebase from "./FirebaseConfig";

//types
export type recipeType = {
  name: string;
  category: string;
  directions: string;
  publishDate: number;
  isPublished: boolean;
  ingredients: string[];
};
export type recipeWithIdType = { id: string } & recipeType;
export type queryType = {
  field: string | firebase.firestore.FieldPath;
  condition: firebase.firestore.WhereFilterOp;
  value: any;
};

const firestore = firebase.firestore();

const createDocument = (collection: string, document: recipeType) => {
  return firestore.collection(collection).add(document);
};

const readDocument = (collection: string, id: string) => {
  return firestore.collection(collection).doc(id).get();
};

const readDocuments = async (
  collection: string,
  queries: queryType[],
  orderByField: string | firebase.firestore.FieldPath,
  perPage: number,
  orderByDirection?: firebase.firestore.OrderByDirection | undefined,
  startAfter?: string,
  endBefore?: string
) => {
  let collectionRef: firebase.firestore.Query<firebase.firestore.DocumentData> =
    firestore.collection(collection);

  if (queries && queries.length > 0) {
    for (const query of queries) {
      collectionRef = collectionRef.where(
        query.field,
        query.condition,
        query.value
      );
    }
  }
  if (orderByField && orderByDirection) {
    collectionRef = collectionRef.orderBy(orderByField, orderByDirection);
  }

  if (!startAfter && !endBefore) {
    collectionRef = collectionRef.limit(perPage);
  }
  if (startAfter) {
    const document = await readDocument(collection, startAfter); 
    collectionRef = collectionRef.startAfter(document).limit(perPage);
  }
  if (endBefore) {
    const document = await readDocument(collection, endBefore);
    collectionRef = collectionRef.endBefore(document).limitToLast(perPage);
  }

  return collectionRef.get();
};

const updateDocument = (
  collection: string,
  id: string,
  document: recipeType
) => {
  return firestore.collection(collection).doc(id).update(document);
};

const deleteDocument = (collection: string, id: string) => {
  return firestore.collection(collection).doc(id).delete();
};

const FirebaseFirestoreService = {
  createDocument,
  readDocuments,
  updateDocument,
  deleteDocument,
};

export default FirebaseFirestoreService;
