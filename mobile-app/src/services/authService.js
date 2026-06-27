import { auth, signInWithEmailAndPassword, signOut } from '../firebase/config';
import { authAPI } from './apiService';

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const response = await authAPI.login(email, password);

    if (response.success) {
      localStorage.setItem('user', JSON.stringify({
        email: email,
        token: response.data.token,
        ...response.data.user
      }));

      return {
        success: true,
        user: {
          ...response.data.user,
          email: email
        }
      };
    }
    return { success: false, message: response.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('user');
};