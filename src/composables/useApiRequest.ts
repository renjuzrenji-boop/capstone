import { ref } from 'vue'
import { errorMessage } from '@/api/http'

export function useApiRequest() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  let pendingRequests = 0

  async function execute<T>(
    request: () => Promise<T>,
    fallbackMessage = 'Something went wrong',
  ): Promise<T> {
    pendingRequests += 1
    loading.value = true
    error.value = null

    try {
      return await request()
    } catch (cause) {
      error.value = errorMessage(cause, fallbackMessage)
      throw cause
    } finally {
      pendingRequests -= 1
      loading.value = pendingRequests > 0
    }
  }

  function clearError() {
    error.value = null
  }

  return { loading, error, execute, clearError }
}
