
import {
  createContext,
  useState,
} from "react";

import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (authService.isAuthenticated()) {
      return authService.getCurrentUser();
    }

    return null;
  });

  // Connexion
  const login = async (credentials) => {
    const response = await authService.login(credentials);

    const currentUser =
      response.user || authService.getCurrentUser();

    setUser(currentUser);

    return response;
  };

  // Déconnexion
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Mise à jour des informations utilisateur
  const updateUser = (updatedData) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return null;
      }

      const updatedUser = {
        ...currentUser,
        ...updatedData,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
