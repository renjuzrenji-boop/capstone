<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <main class="dashboard">
    <p class="dashboard__eyebrow">Capstone</p>
    <h1>Dashboard</h1>
    <p v-if="auth.user">Welcome, {{ auth.user.name }}.</p>
    <p v-if="auth.role" class="dashboard__role">Signed in as {{ auth.role }}.</p>
  </main>
</template>

<style scoped>
@layer components {
  .dashboard {
    min-height: 100vh;
    padding: clamp(2rem, 8vw, 6rem);
    color: var(--color-text, #202a2e);
  }

  .dashboard__eyebrow {
    margin: 0 0 0.75rem;
    color: #28786f;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 5vw, 3.5rem);
  }

  .dashboard__role {
    color: #526168;
  }
}
</style>