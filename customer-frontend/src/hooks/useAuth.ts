import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  UserCredential,
} from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const {
    mutate: login,
    isPending: signInLoading,
    data: userCredentials,
  } = useMutation<UserCredential>({
    mutationFn: async () => signInWithPopup(auth, googleProvider),
  });
  const logout = useCallback(() => signOut(auth), []);
  const [user, loading, error] = useAuthState(auth);
  const isLoading = useMemo(
    () => signInLoading || loading,
    [signInLoading, loading]
  );
  const isLoggedIn = useMemo(() => !!user, [user]);

  const {
    mutate: fetchToken,
    data: token,
    isPending: tokenLoading,
  } = useMutation<string | undefined>({
    mutationFn: async () => user?.getIdToken(),
  });

  useEffect(() => {
    if (user) {
      fetchToken();
    }
  }, [user, fetchToken]);

  
  return { isLoading, login, logout, error, isLoggedIn, user, token };
}
