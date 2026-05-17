import { useCallback, useRef } from 'react'

export function useSSE() {
  const abortRef = useRef(null)

  const startResearch = useCallback(async (question, depth, callbacks) => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, depth }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        // SSE events are separated by double newline
        const parts = buffer.split('\n\n')
        buffer = parts.pop() // keep any incomplete trailing part

        for (const part of parts) {
          for (const line of part.split('\n')) {
            if (line.startsWith('data: ')) {
              try {
                const event = JSON.parse(line.slice(6))
                callbacks[event.type]?.(event)
              } catch {
                // ignore malformed events
              }
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        callbacks.error?.({ message: err.message })
      }
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { startResearch, cancel }
}
