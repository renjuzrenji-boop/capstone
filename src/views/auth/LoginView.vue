<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
// import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const touched = ref(false)

const emailValid = () => /^\S+@\S+\.\S+$/.test(form.email)
const passwordValid = () => form.password.length >= 6

async function onSubmit() {
  touched.value = true
  if (!emailValid() || !passwordValid()) return
  try {
    await auth.login({ email: form.email, password: form.password })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/app/dashboard'
    await router.push(redirect)
  } catch {
    // error message is already in auth.error
  }
}
</script>

<template>
  <div class="login w-full min-h-screen">
    <form class="login__card m-0 p-20" novalidate @submit.prevent="onSubmit">
      <h1>Sign in</h1>

      <label>
        Email
        <input v-model.trim="form.email" type="email" autocomplete="username" />
        <small v-if="touched && !emailValid()" class="error">Enter a valid email</small>
      </label>

      <label>
        Password
        <input v-model="form.password" type="password" autocomplete="current-password" />
        <small v-if="touched && !passwordValid()" class="error">At least 6 characters</small>
      </label>

      <p v-if="auth.error" class="error" role="alert">{{ auth.error }}</p>

      <button type="submit" :disabled="auth.loading">
        {{ auth.loading ? 'Signing in…' : 'Sign in' }}
      </button>

      <details class="login__hint">
        <summary>Demo accounts</summary>
        <ul>
          <li>admin@example.com / Admin@123</li>
          <li>manager@example.com / Manager@123</li>
          <li>user@example.com / User@123</li>
        </ul>
      </details>
    </form>
  </div>
</template>

<style scoped>
@layer components {
  .login { min-height: 100vh; display: grid; place-items: center; padding: var(--space-lg); }
  .login__card { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: var(--space-md); padding: var(--space-lg); border: 1px solid var(--color-border); border-radius: 10px; }
  label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.9rem; }
  input { padding: var(--space-sm); border: 1px solid var(--color-border); border-radius: 6px; font: inherit; background: transparent; color: inherit; }
  .error { color: #d93025; }
  .login__hint { font-size: 0.8rem; opacity: 0.8; }
}
</style>