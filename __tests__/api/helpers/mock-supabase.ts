import { vi } from 'vitest'

type MockResult = { data: unknown; error: unknown }

/**
 * Chainable Supabase mock that tracks `from(table).operation()` calls
 * and returns queued results per `table:operation` key.
 */
export function createMockSupabaseClient() {
  const queue = new Map<string, MockResult[]>()
  let currentTable = ''

  function enqueue(key: string, result: MockResult) {
    if (!queue.has(key)) queue.set(key, [])
    queue.get(key)!.push(result)
  }

  function dequeue(key: string): MockResult {
    const items = queue.get(key)
    if (items && items.length > 0) return items.shift()!
    return { data: null, error: null }
  }

  // Build a chainable object that resolves on terminal methods
  function makeChain(table: string, op: string): Record<string, unknown> {
    const key = `${table}:${op}`
    const chain: Record<string, unknown> = {}
    const terminals = ['single', 'maybeSingle']
    const chainMethods = [
      'select', 'insert', 'update', 'delete', 'upsert',
      'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike',
      'is', 'in', 'contains', 'containedBy', 'order', 'limit',
      'range', 'match', 'not', 'or', 'filter', 'textSearch',
    ]

    for (const method of chainMethods) {
      chain[method] = vi.fn().mockReturnValue(chain)
    }

    for (const method of terminals) {
      chain[method] = vi.fn().mockImplementation(() => {
        return Promise.resolve(dequeue(key))
      })
    }

    // Make the chain itself thenable (for calls without .single())
    chain.then = (resolve: (v: MockResult) => void, reject?: (e: unknown) => void) => {
      return Promise.resolve(dequeue(key)).then(resolve, reject)
    }

    return chain
  }

  const client = {
    from: vi.fn().mockImplementation((table: string) => {
      currentTable = table
      return {
        select: vi.fn().mockImplementation(() => makeChain(table, 'select')),
        insert: vi.fn().mockImplementation(() => makeChain(table, 'insert')),
        update: vi.fn().mockImplementation(() => makeChain(table, 'update')),
        delete: vi.fn().mockImplementation(() => makeChain(table, 'delete')),
        upsert: vi.fn().mockImplementation(() => makeChain(table, 'upsert')),
      }
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    _enqueue: enqueue,
    _currentTable: () => currentTable,
  }

  return client
}

/**
 * Helper to set up query results for mock Supabase calls.
 * Usage:
 *   mockQuery(client, 'customers', 'select', { data: {...}, error: null })
 */
export function mockQuery(
  client: ReturnType<typeof createMockSupabaseClient>,
  table: string,
  op: string,
  result: { data: unknown; error?: unknown }
) {
  client._enqueue(`${table}:${op}`, { data: result.data, error: result.error ?? null })
}

/**
 * Set the auth user on a mock SSR client.
 */
export function mockAuthUser(
  client: ReturnType<typeof createMockSupabaseClient>,
  user: { id: string; email: string; user_metadata?: Record<string, unknown> } | null
) {
  if (user) {
    client.auth.getUser.mockResolvedValue({ data: { user }, error: null })
  } else {
    client.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Not authenticated' } })
  }
}
