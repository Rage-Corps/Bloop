import { createAuthClient } from "better-auth/vue";

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: "http://localhost:3001", // Your backend URL
  // We'll support extended sessions for "keep me logged in"
  // This will be configurable in the sign-in form
});