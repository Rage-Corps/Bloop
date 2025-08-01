<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <UCard class="max-w-md w-full">
      <template #header>
        <div class="text-center">
          <h1 class="text-4xl font-bold text-primary mb-2">🫧 Bloop</h1>
          <p class="text-lg text-gray-600">
            Time to dive into your digital treasure trove!
          </p>
        </div>
      </template>

      <UForm :state="form" class="space-y-4" @submit="handleLogin">
        <UInput
          v-model="form.email"
          type="email"
          placeholder="your.email@example.com"
          icon="i-heroicons-envelope"
          size="lg"
        />

        <UInput
          v-model="form.password"
          type="password"
          placeholder="Your super secret password"
          icon="i-heroicons-lock-closed"
          size="lg"
        />

        <div class="flex items-center justify-between">
          <UCheckbox
            v-model="form.rememberMe"
            label="Keep me logged in (I'm not sharing this computer)"
          />
        </div>

        <UButton
          type="submit"
          :loading="loading"
          :disabled="loading"
          size="lg"
          block
          class="mt-6"
        >
          {{ loading ? 'Blooping you in...' : 'Let me in!' }}
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-2">New to the Bloop universe?</p>
          <UButton to="/register" variant="ghost" size="sm">
            Join the Bloop adventure →
          </UButton>
        </div>
      </template>

      <UAlert
        v-if="error"
        color="primary"
        variant="soft"
        :title="error"
        class="mt-4"
      />
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'guest',
});

const { login } = useAuth();

const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
});

const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    await login(form.email, form.password, form.rememberMe);
    await navigateTo('/dashboard');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    error.value =
      err.message || 'Oops! The Bloop gods are not pleased. Try again!';
  } finally {
    loading.value = false;
  }
};
</script>
