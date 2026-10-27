import { describe, expect, it } from 'vitest'
import { useApiRequest } from '@/composables/useApiRequest'

describe('useApiRequest', () => {
  it('returns the result, toggles loading and sets the success message', async () => {
    const { execute, loading, error, msg } = useApiRequest()
    const promise = execute(async () => 42, 'fail', 'Saved')
    expect(loading.value).toBe(true)
    await expect(promise).resolves.toBe(42)
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(msg.value).toBe('Saved')
  })

  it('stores the fallback message, clears msg and rethrows on failure', async () => {
    const { execute, loading, error, msg } = useApiRequest()
    await execute(async () => 1, 'fail', 'Saved')
    await expect(execute(async () => { throw new Error('boom') }, 'Could not save', 'Saved')).rejects.toThrow('boom')
    expect(error.value).toBe('Could not save')
    expect(msg.value).toBeNull()
    expect(loading.value).toBe(false)
  })

  it('keeps loading true until all concurrent requests finish', async () => {
    const { execute, loading } = useApiRequest()
    let release!: () => void
    const slow = execute(() => new Promise<void>((r) => { release = r }))
    await execute(async () => 1)
    expect(loading.value).toBe(true)
    release()
    await slow
    expect(loading.value).toBe(false)
  })
})
