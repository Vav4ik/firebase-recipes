import { FC, FormEvent, useState } from "react";
import firebase from "firebase/compat";
import FirebaseAuthService from "../FirebaseAuthService";

type LoginFormProps = {
  existingUser: firebase.User | null;
};

const LoginForm: FC<LoginFormProps> = ({ existingUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const formSubmitHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await FirebaseAuthService.loginUser(email, password);
      setEmail("");
      setPassword("");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const logOutHandler = () => {
    FirebaseAuthService.logoutUser();
  };

  const handlePasswordReset = async () => {
    if (!email) {
      alert("Missing Email");
      return;
    }
    try {
      await FirebaseAuthService.sendPasswordResetEmail(email);
      alert("Sent the passwrord reset email");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      await FirebaseAuthService.loginWithGoogle();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  return (
    <div className="login-form-container">
      {existingUser ? (
        <div className="row">
          <h3>Welcome, {existingUser.email}</h3>
          <button
            type="button"
            className="primary-button"
            onClick={logOutHandler}
          >
            Logout
          </button>
        </div>
      ) : (
        <form className="login-form" onSubmit={formSubmitHandler}>
          <label className="input-label login-label">
            Username (email):
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-text"
            />
          </label>
          <label className="input-label login-label">
            Password:
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-text"
            />
          </label>
          <div className="button-box">
            <button className="primary-button">Login</button>
            <button
              type="button"
              className="primary-button"
              onClick={handlePasswordReset}
            >
              Reset Password
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleLoginWithGoogle}
            >
              Login with Google
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default LoginForm;
