import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// The useAuthStatus component is used to check for the user authentication.
// If this returns true then the user is authenticated if nt then the user will not be loggedin
export function useAuthStatus() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Tries to listen to user logins and authenticates the user
  useEffect(() => {
    const auth = getAuth();
    console.log(auth);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedIn(true);
      }
      setCheckingStatus(false);
    });
  }, []);
  return { loggedIn, checkingStatus };
}
