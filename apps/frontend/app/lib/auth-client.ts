import { createAuthClient } from 'better-auth/vue';

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: process.env.NUXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
  // We'll support extended sessions for "keep me logged in"
  // This will be configurable in the sign-in form
});
