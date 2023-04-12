import firebase from "./FirebaseConfig";

const auth = firebase.auth();

const registerUser = (email: string, password: string) => {
  return auth.createUserWithEmailAndPassword(email, password);
};

const loginUser = (email: string, password: string) => {
  return auth.signInWithEmailAndPassword(email, password);
};

const loginWithGoogle = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider);
};

const logoutUser = () => {
  return auth.signOut();
};

const sendPasswordResetEmail = (email: string) => {
  return auth.sendPasswordResetEmail(email);
};

const subcribeToAuthCahnges = (
  handleAuthChange: (user: firebase.User | null) => void
) => {
  auth.onAuthStateChanged((user) => {
    handleAuthChange(user);
  });
};

const FirebaseAuthService = {
  registerUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  sendPasswordResetEmail,
  subcribeToAuthCahnges,
};

export default FirebaseAuthService;
