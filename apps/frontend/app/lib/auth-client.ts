import { createAuthClient } from 'better-auth/vue';

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: process.env.NUXT_PUBLIC_BACKEND_URL,
});
