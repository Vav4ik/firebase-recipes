import { useState } from "react";
import firebase from "firebase/compat";
import "./App.css";
import FirebaseAuthService from "./FirebaseAuthService";
import LoginForm from "./components/LoginForm";

function App() {
  const [user, setUser] = useState<firebase.User | null>(null);

  FirebaseAuthService.subcribeToAuthCahnges(setUser);

  return (
    <div className="App">
      <div className="title-row">
        <h1 className="title">Firebase Recipes</h1>
        <LoginForm existingUser={user} />
      </div>
    </div>
  );
}

export default App;
