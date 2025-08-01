<template>
  <div
    class="min-h-screen flex items-center justify-center bg-base-300 py-12 px-4 sm:px-6 lg:px-8"
  >
    <UCard class="max-w-md w-full">
      <template #header>
        <div class="text-center">
          <h1 class="text-4xl font-bold text-primary mb-2">🫧 Bloop</h1>
          <p class="text-lg text-gray-600">
            Ready to join the Bloop universe?
          </p>
        </div>
      </template>

      <UForm :state="form" class="space-y-4" @submit="handleRegister">
        <UInput
          v-model="form.name"
          type="text"
          placeholder="Your awesome name"
          icon="i-heroicons-user"
          size="lg"
          class="w-full"
        />

        <UInput
          v-model="form.email"
          type="email"
          placeholder="your.email@example.com"
          icon="i-heroicons-envelope"
          size="lg"
          class="w-full"
        />

        <UInput
          v-model="form.password"
          type="password"
          placeholder="Your super secret password"
          icon="i-heroicons-lock-closed"
          size="lg"
          class="w-full"
        />

        <UInput
          v-model="form.confirmPassword"
          type="password"
          placeholder="Confirm your super secret password"
          icon="i-heroicons-lock-closed"
          size="lg"
          class="w-full"
        />

        <UButton
          type="submit"
          :loading="loading"
          :disabled="loading"
          size="lg"
          block
          class="mt-6"
        >
          {{ loading ? 'Creating your Bloop account...' : 'Join the adventure!' }}
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-2">Already part of the Bloop crew?</p>
          <UButton to="/" variant="ghost" size="sm">
            ← Back to sign in
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

const { register } = useAuth();

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match - double check those secrets!';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await register(form.email, form.password, form.name);
    await navigateTo('/dashboard');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    error.value =
      err.message || 'Oops! The Bloop registration failed. Try again!';
  } finally {
    loading.value = false;
  }
};
</script>