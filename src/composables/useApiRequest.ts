import { ref } from 'vue'
import { errorMessage } from '@/api/http'

export function useApiRequest() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  let pendingRequests = 0
  const msg = ref<string | null>(null)

  async function execute<T>(
    request: () => Promise<T>,
    fallbackMessage = 'Something went wrong',
    successMessage?: string,
  ): Promise<T> {
    pendingRequests += 1
    loading.value = true
    error.value = null
    if (successMessage) msg.value = null

    try {
      const result = await request()
      if (successMessage) msg.value = successMessage
      return result
    } catch (cause) {
      error.value = errorMessage(cause, fallbackMessage)
      msg.value = null
      throw cause
    } finally {
      pendingRequests -= 1
      loading.value = pendingRequests > 0
    }
  }

  function clearError() {
    error.value = null
  }

  return { loading, error, execute, clearError, msg }
}
