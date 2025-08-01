import { signIn, signUp, signOut, useSession } from '~/lib/auth-client';

export const useAuth = () => {
  const session = useSession();

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ) => {
    try {
      const result = await signIn.email({
        email,
        password,
        // We can extend session duration for "keep me logged in"
        // better-auth will handle this through session configuration
        callbackURL: '/dashboard', // Where to redirect after login
      });

      if (rememberMe) {
        // For "keep me logged in", we can set longer-lived sessions
        // This can be handled by updating the session configuration
        // or by using localStorage to persist user preferences
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const result = await signUp.email({
        email,
        password,
        name,
        callbackURL: '/dashboard',
      });
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('rememberMe');
      await signOut({
        callbackURL: '/login',
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const isRememberMeEnabled = () => {
    return localStorage.getItem('rememberMe') === 'true';
  };

  return {
    session,
    login,
    register,
    logout,
    isRememberMeEnabled,
    isLoggedIn: computed(() => !!session.data?.user),
    user: computed(() => session.data?.user),
  };
};
