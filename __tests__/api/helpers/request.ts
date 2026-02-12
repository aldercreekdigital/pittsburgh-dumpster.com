import { NextRequest } from 'next/server'

/**
 * Create a POST NextRequest with a JSON body.
 */
export function createPostRequest(
  body: unknown,
  url = 'http://localhost:3000/api/test'
): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

/**
 * Create a POST NextRequest with a raw text body (for webhooks).
 */
export function createRawPostRequest(
  body: string,
  headers: Record<string, string> = {},
  url = 'http://localhost:3000/api/test'
): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  })
}

/**
 * Create a GET NextRequest.
 */
export function createGetRequest(
  url = 'http://localhost:3000/api/test'
): NextRequest {
  return new NextRequest(url, { method: 'GET' })
}

/**
 * Parse a NextResponse into { status, body }.
 */
export async function parseResponse(response: Response) {
  const status = response.status
  const body = await response.json()
  return { status, body }
}

/**
 * Create route params object matching Next.js App Router pattern.
 * Route params are wrapped in a Promise in Next.js 15+.
 */
export function createRouteParams<T extends Record<string, string>>(
  params: T
): { params: Promise<T> } {
  return { params: Promise.resolve(params) }
}
