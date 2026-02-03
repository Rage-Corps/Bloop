import type { CastMember, CastListResponse, FetchCastMembersOptions } from '@bloop/shared-types';

export const useCastMembers = () => {
  const config = useRuntimeConfig();
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchCastMembers = async (query?: FetchCastMembersOptions): Promise<CastListResponse> => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<CastListResponse>(
        `${config.public.backendUrl}/api/cast`,
        {
          params: {
            name: query?.name,
            limit: query?.limit,
            offset: query?.offset,
            orderBy: query?.orderBy,
            hasImage: query?.hasImage,
            gender: query?.gender,
          },
        }
      );
      return response;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch cast members';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const discoverImages = async () => {
    try {
      await $fetch(`${config.public.backendUrl}/api/cast/discover-images`, {
        method: 'POST',
      });
    } catch (err: any) {
      error.value = err.message || 'Failed to trigger image discovery';
      throw err;
    }
  };

  const fetchGenders = async (): Promise<string[]> => {
    try {
      return await $fetch<string[]>(`${config.public.backendUrl}/api/cast/genders`);
    } catch (err: any) {
      console.error('Failed to fetch genders:', err);
      return [];
    }
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    fetchCastMembers,
    discoverImages,
    fetchGenders,
  };
};
