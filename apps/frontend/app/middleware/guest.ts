/* eslint-disable @typescript-eslint/no-unused-vars */
export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn.value) {
    return navigateTo('/dashboard');
  }
});
