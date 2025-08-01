/* eslint-disable @typescript-eslint/no-unused-vars */
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { session } = useAuth();

  // Wait for session to load on client side
  if (import.meta.client) {
    await nextTick();
    // Give session a moment to hydrate
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Only redirect authenticated users from login/register pages
  if (session.value?.data?.user) {
    const guestOnlyRoutes = ['/', '/register'];
    if (guestOnlyRoutes.includes(to.path)) {
      return navigateTo('/dashboard');
    }
  }
});
