import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function useLoginForm() {
  const auth = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  const form = reactive({ email: '', password: '' })
  const touched = ref(false)

  function emailValid() {
    return /^\S+@\S+\.\S+$/.test(form.email)
  }

  function passwordValid() {
    return form.password.length >= 6
  }

  async function submit() {
    touched.value = true
    if (!emailValid() || !passwordValid()) return

    try {
      await auth.login({ email: form.email, password: form.password })
      const redirect =
        typeof route.query.redirect === 'string' ? route.query.redirect : '/app/dashboard'
      await router.push(redirect)
    } catch {
      // The auth store exposes login errors for the view to display.
    }
  }

  return { auth, form, touched, emailValid, passwordValid, submit }
}
