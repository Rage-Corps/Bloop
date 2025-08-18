import type { UserConfig, UserPreferences } from '@bloop/shared-types';

export const useUserConfig = () => {
  const config = useRuntimeConfig();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const getUserConfig = async (): Promise<UserConfig | null> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<UserConfig>(
        `${config.public.backendUrl}/api/user-config`,
        {
          credentials: 'include', // Include cookies for auth
        }
      );
      return response;
    } catch (err: any) {
      console.warn('Failed to fetch user config:', err);
      // Return null instead of throwing to handle gracefully
      if (err.status === 401) {
        error.value = 'Authentication required';
      } else {
        error.value = err.message || 'Failed to fetch user config';
      }
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateUserConfig = async (preferences: UserPreferences): Promise<UserConfig | null> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<UserConfig>(
        `${config.public.backendUrl}/api/user-config`,
        {
          method: 'PUT',
          body: { preferences },
          credentials: 'include',
        }
      );
      return response;
    } catch (err: any) {
      console.error('Failed to update user config:', err);
      error.value = err.message || 'Failed to update user config';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const patchUserConfig = async (partialPreferences: Partial<UserPreferences>): Promise<UserConfig | null> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<UserConfig>(
        `${config.public.backendUrl}/api/user-config`,
        {
          method: 'PATCH',
          body: partialPreferences,
          credentials: 'include',
        }
      );
      return response;
    } catch (err: any) {
      console.error('Failed to patch user config:', err);
      error.value = err.message || 'Failed to update user config';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    getUserConfig,
    updateUserConfig,
    patchUserConfig,
  };
};