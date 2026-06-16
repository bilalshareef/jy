import { useState, useCallback, useRef } from 'react'

export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      if (!navigator.clipboard) {
        return false
      }
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          setCopied(false)
          timeoutRef.current = null
        }, timeout)
        return true
      } catch {
        return false
      }
    },
    [timeout],
  )

  return { copied, copyToClipboard }
}
