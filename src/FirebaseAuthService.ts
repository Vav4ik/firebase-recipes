import firebase from "./FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";

const auth = firebase.auth;

const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

const loginUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

const logoutUser = () => {
  return auth.signOut();
};

const subcribeToAuthCahnges = (
  handleAuthChange: (user: User | null) => void
) => {
  onAuthStateChanged(auth, (user) => {
    handleAuthChange(user);
  });
};

const FirebaseAuthService = {
  registerUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  sendPasswordResetEmail: (email: string) => {
    sendPasswordResetEmail(auth, email);
  },
  subcribeToAuthCahnges,
};

export default FirebaseAuthService;
