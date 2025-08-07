import { createAuthClient } from 'better-auth/vue';

const config = useRuntimeConfig();

export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: config.public.backendUrl as string,
});
