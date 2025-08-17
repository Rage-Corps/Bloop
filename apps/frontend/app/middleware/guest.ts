/* eslint-disable @typescript-eslint/no-unused-vars */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { session } = useAuth();

  // Wait for session to load on client side
  if (import.meta.client) {
    await nextTick();
    
    // Wait for session to properly hydrate with a timeout
    let attempts = 0;
    const maxAttempts = 20; // 2 seconds max
    
    while (session.value?.isPending && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
  }

  // Only redirect authenticated users from login/register pages
  if (session.value?.data?.user) {
    const guestOnlyRoutes = ['/', '/register'];
    if (guestOnlyRoutes.includes(to.path)) {
      return navigateTo('/dashboard');
    }
  }
});
