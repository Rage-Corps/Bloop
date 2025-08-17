/* eslint-disable @typescript-eslint/no-unused-vars */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip auth check on server-side to prevent flash
  if (import.meta.server) {
    return;
  }

  const { session } = useAuth();

  // Wait for session to load on client side
  await nextTick();
  
  // Wait for session to properly load - check if it's not undefined
  let attempts = 0;
  const maxAttempts = 30; // 3 seconds max
  
  while (session.value === undefined && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    attempts++;
  }

  // If still no session data after timeout, redirect
  if (!session.value?.data?.user) {
    return navigateTo('/');
  }
});
